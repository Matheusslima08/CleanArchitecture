using CleanArchitecture.Data;
using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Services
{
    public class ReservationService : IReservationService
    {
        private readonly AppDbContext _context;
        private readonly ISeatReservationCache _seatReservationCache;
        private readonly ISeatNotifier _seatNotifier;

        public ReservationService(
            AppDbContext context,
            ISeatReservationCache seatReservationCache,
            ISeatNotifier seatNotifier)
        {
            _context = context;
            _seatReservationCache = seatReservationCache;
            _seatNotifier = seatNotifier;
        }

        public async Task<(bool Success, string Message)> ReserveSeatAsync(int seatId)
        {
            // Ambos os fluxos bloqueiam a mesma cadeira antes de alterar Redis e SQL.
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var seats = await _context.Seats
                .FromSqlInterpolated($"SELECT * FROM Seats WHERE SeatId = {seatId} FOR UPDATE")
                .ToListAsync();
            var seat = seats.SingleOrDefault();
            if (seat == null) return (false, "Cadeira não encontrada.");

            var reservedInRedis = await _seatReservationCache.TryReserveAsync(
                seatId,
                TimeSpan.FromMinutes(10));

            if (!reservedInRedis)
            {
                return (false, "Essa cadeira acabou de ser reservada.");
            }

            try
            {
                if (seat.Status == "Sold")
                {
                    await _seatReservationCache.ReleaseAsync(seatId);
                    return (false, "Essa cadeira não está disponível.");
                }

                var now = DateTime.UtcNow;

                var hasActiveReservation = await _context.Reservations
                    .AnyAsync(reservation =>
                        reservation.SeatId == seatId &&
                        reservation.Status == "Pending" &&
                        reservation.ExpiresAt > now);

                if (hasActiveReservation)
                {
                    await _seatReservationCache.ReleaseAsync(seatId);
                    return (false, "Essa cadeira acabou de ser reservada.");
                }

                _context.Reservations.Add(new Reservation
                {
                    SeatId = seatId,
                    CreatedAt = now,
                    ExpiresAt = now.AddMinutes(10),
                    Status = "Pending"
                });

                seat.Status = "Reserved";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await _seatReservationCache.ReleaseAsync(seatId);
                throw;
            }

            await _seatNotifier.NotifyAsync(seatId, "Reserved");
            return (true, "Cadeira reservada por 10 minutos.");
        }
    }
}
