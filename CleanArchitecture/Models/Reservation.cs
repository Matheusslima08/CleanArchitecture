namespace CleanArchitecture.Models
{
    public class Reservation
    {
        public int ReservationId { get; set; }

        public int SeatId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public string Status { get; set; } = string.Empty;

        public Seat Seat { get; set; } = null!;
    }
}