namespace CleanArchitecture.Services
{
    public interface IReservationService
    {
        Task<(bool Success, string Message)> ReserveSeatAsync(int seatId);
    }
}
