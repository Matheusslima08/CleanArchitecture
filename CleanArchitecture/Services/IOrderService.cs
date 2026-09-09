using CleanArchitecture.Models;

namespace CleanArchitecture.Services
{
    public interface IOrderService
    {
        Task<(bool Success, string Message, Order? Order)> CreateOrderAsync(int seatId);
    }
}