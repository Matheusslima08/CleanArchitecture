namespace CleanArchitecture.Models
{
    public class OrderItem
    {
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }

        public int SeatId { get; set; }

        public decimal Price { get; set; }

        public Order Order { get; set; } = null!;

        public Seat Seat { get; set; } = null!;
    }
}