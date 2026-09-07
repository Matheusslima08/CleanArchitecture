using CleanArchitecture.Data;
using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Event?> GetEventAsync(int eventId)
        {
            return await _context.Events
                .AsNoTracking()
                .AsSplitQuery()
                .Include(e => e.Sectors)
                .ThenInclude(s => s.Seats)
                .FirstOrDefaultAsync(e => e.EventId == eventId);
        }
    }
}
