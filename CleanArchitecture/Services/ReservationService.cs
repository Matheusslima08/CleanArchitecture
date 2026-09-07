using CleanArchitecture.Data;
using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Services
{
    public class ReservationService : IReservationService
    {
        private readonly AppDbContext _context;

        public ReservationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message)> ReserveSeatAsync(int seatId)
        {
            var seat = await _context.Seats.FindAsync(seatId);

            if (seat == null)
            {
                return (false, "Seat not found.");
            }

            if (seat.Status == "Sold")
            {
                return (false, "Seat is no longer available.");
            }

            var now = DateTime.UtcNow;
            var hasActiveReservation = await _context.Reservations.AnyAsync(reservation =>
                reservation.SeatId == seatId &&
                reservation.Status == "Pending" &&
                reservation.ExpiresAt > now);

            if (hasActiveReservation)
            {
                return (false, "Seat is no longer available.");
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

            return (true, "Seat reserved successfully.");
        }
    }
}
