using CleanArchitecture.Data;
using CleanArchitecture.Messages;
using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CleanArchitecture.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IMessagePublisher _messagePublisher;

        public OrderService(
            AppDbContext context,
            IMessagePublisher messagePublisher)
        {
            _context = context;
            _messagePublisher = messagePublisher;
        }

        public async Task<(bool Success, string Message, Order? Order)> CreateOrderAsync(int seatId)
        {
            var seat = await _context.Seats
                .Include(s => s.Sector)
                .FirstOrDefaultAsync(s => s.SeatId == seatId);

            if (seat == null)
            {
                return (false, "Cadeira não encontrada.", null);
            }

            if (seat.Status != "Reserved")
            {
                return (false, "A cadeira não está reservada.", null);
            }

            var hasActiveReservation = await _context.Reservations
                .AnyAsync(r =>
                    r.SeatId == seatId &&
                    r.Status == "Pending" &&
                    r.ExpiresAt > DateTime.UtcNow);

            if (!hasActiveReservation)
            {
                return (false, "A reserva expirou.", null);
            }

            var hasOpenOrder = await _context.OrderItems
                .AnyAsync(item =>
                    item.SeatId == seatId &&
                    item.Order.Status == "AwaitingPayment");

            if (hasOpenOrder)
            {
                return (
                    false,
                    "Já existe um pedido aguardando pagamento para essa cadeira.",
                    null
                );
            }

            var order = new Order
            {
                CreatedAt = DateTime.UtcNow,
                TotalAmount = seat.Sector.Price,
                Status = "AwaitingPayment"
            };

            order.Items.Add(new OrderItem
            {
                SeatId = seat.SeatId,
                Price = seat.Sector.Price
            });

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            var paymentRequested = new PaymentRequested
            {
                OrderId = order.OrderId,
                Amount = order.TotalAmount
            };

            var message = JsonSerializer.Serialize(paymentRequested);

            await _messagePublisher.PublishAsync(
                "payment.requested",

                message);

            return (true, "Pedido criado com sucesso.", order);
        }
    }
}