using CleanArchitecture.Models;

namespace CleanArchitecture.Services
{
    public interface IEventService
    {
        Task<Event?> GetEventAsync(int eventId);
    }
}
