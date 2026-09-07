namespace CleanArchitecture.Models
{
    public class Seat
    {
        public int SeatId { get; set; }

        public int SectorId { get; set; }

        public string Row { get; set; } = string.Empty;

        public int Number { get; set; }

        public string Status { get; set; } = string.Empty;

        public Sector Sector { get; set; } = null!;

        public List<Reservation> Reservations { get; set; } = new();
    }
}