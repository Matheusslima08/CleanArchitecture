using CleanArchitecture.Models;
using CleanArchitecture.Services;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace CleanArchitecture.Controllers
{
    public class HomeController : Controller
    {
        private readonly IEventService _eventService;

        public HomeController(IEventService eventService)
        {
            _eventService = eventService;
        }

        public async Task<IActionResult> Index()
        {
            var eventItem = await _eventService.GetEventAsync(1);

            if (eventItem == null)
            {
                return NotFound();
            }

            return View(eventItem);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }
    }
}