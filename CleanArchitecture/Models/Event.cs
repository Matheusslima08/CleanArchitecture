namespace CleanArchitecture.Models
{
    public class Event
    {
        public int EventId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;

        public DateTime StartsAt { get; set; }

        public  string? ImageUrl { get; set; }

        public bool IsActive { get; set; }

        public List<Sector> Sectors { get; set; } = new();
    }
}
