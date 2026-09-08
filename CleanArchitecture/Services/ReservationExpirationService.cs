using CleanArchitecture.Data;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Services;

public class ReservationExpirationService(
    IServiceScopeFactory scopeFactory,
    ILogger<ReservationExpirationService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));
        try
        {
            do
            {
                try
                {
                    await ExpireReservationsAsync(stoppingToken);
                }
                catch (Exception exception) when (!stoppingToken.IsCancellationRequested)
                {
                    logger.LogError(exception, "Falha ao expirar reservas. Nova tentativa em 10 segundos.");
                }
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }

    private async Task ExpireReservationsAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var cache = scope.ServiceProvider.GetRequiredService<ISeatReservationCache>();
        var notifier = scope.ServiceProvider.GetRequiredService<ISeatNotifier>();
        var now = DateTime.UtcNow;
        var seatIds = await context.Reservations
            .Where(r => r.Status == "Pending" && r.ExpiresAt <= now)
            .Select(r => r.SeatId).Distinct().ToListAsync(cancellationToken);

        foreach (var seatId in seatIds)
        {
            context.ChangeTracker.Clear();
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            var seats = await context.Seats
                .FromSqlInterpolated($"SELECT * FROM Seats WHERE SeatId = {seatId} FOR UPDATE")
                .ToListAsync(cancellationToken);
            var seat = seats.SingleOrDefault();
            if (seat == null) continue;

            now = DateTime.UtcNow;
            var pending = await context.Reservations
                .Where(r => r.SeatId == seatId && r.Status == "Pending")
                .ToListAsync(cancellationToken);
            var expired = pending.Where(r => r.ExpiresAt <= now).ToList();
            if (expired.Count == 0) continue;

            foreach (var reservation in expired) reservation.Status = "Expired";

            // Uma reserva antiga nunca libera uma nova reserva ou uma cadeira vendida.
            var release = !pending.Any(r => r.ExpiresAt > now);
            if (release)
            {
                await cache.ReleaseAsync(seatId);
                if (seat.Status == "Reserved") seat.Status = "Available";
            }

            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            if (release && seat.Status == "Available")
                await notifier.NotifyAsync(seatId, "Available");
        }
    }
}
