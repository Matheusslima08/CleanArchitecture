namespace CleanArchitecture.Services;

public interface ISeatNotifier
{
    Task NotifyAsync(int seatId, string status);
}
