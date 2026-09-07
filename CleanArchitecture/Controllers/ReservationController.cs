using CleanArchitecture.Services;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitecture.Controllers
{
    [ApiController]
    [Route("api/reservations")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public async Task<IActionResult> Reserve([FromBody] int seatId)
        {
            var result = await _reservationService.ReserveSeatAsync(seatId);

            return Ok(new
            {
                success = result.Success,
                message = result.Message
            });
        }
    }
}
