using CleanArchitecture.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CleanArchitecture.Services;

public class SeatNotifier(IHubContext<SeatHub> hub, ILogger<SeatNotifier> logger) : ISeatNotifier
{
    public async Task NotifyAsync(int seatId, string status)
    {
        try
        {
            await hub.Clients.All.SendAsync("SeatUpdated", new { seatId, status });
        }
        catch (Exception exception)
        {
            // Uma falha na notificação não desfaz uma reserva já salva.
            logger.LogError(exception, "Falha ao notificar a cadeira {SeatId}: {Status}", seatId, status);
        }
    }
}
