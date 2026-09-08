namespace CleanArchitecture.Services
{
    public interface ISeatReservationCache
    {
        Task<bool> TryReserveAsync(
            int seatId,
            TimeSpan expiration);

        Task ReleaseAsync(int seatId);
    }
}