namespace CleanArchitecture.Models
{
    public class Order
    {
        public int OrderId { get; set; }

        public DateTime CreatedAt { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public List<OrderItem> Items { get; set; } = new();
    }
}