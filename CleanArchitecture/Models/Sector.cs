namespace CleanArchitecture.Models
{
    public class Sector
    {

        public int  SectorId { get; set; }

        public int EventId { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public Event Event { get; set; } = null!;

        public List<Seat> Seats { get; set; } = new();
    }
}
