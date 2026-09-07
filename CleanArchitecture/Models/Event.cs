namespace CleanArchitecture.Models
{
    public class Event
    {
        public int EventId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Vanue { get; set; } = string.Empty;

        public DateTime StartAt { get; set; }

        public  string? ImageUrl { get; set; }

        public bool IsActive { get; set; }
    }
}
