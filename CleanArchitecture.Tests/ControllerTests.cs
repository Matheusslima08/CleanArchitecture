using CleanArchitecture.Controllers;
using CleanArchitecture.Models;
using CleanArchitecture.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CleanArchitecture.Tests;

public class ControllerTests
{
    [Fact]
    public async Task ReservationFailure_CurrentlyReturnsHttp200()
    {
        var controller = new ReservationController(new ReservationStub((false, "Indisponível")));

        var response = await controller.Reserve(42);

        var ok = Assert.IsType<OkObjectResult>(response);
        Assert.False(JsonSerializer.SerializeToElement(ok.Value).GetProperty("success").GetBoolean());
    }

    [Fact]
    public async Task OrderFailure_ReturnsHttp400()
    {
        var controller = new OrderController(new OrderStub((false, "Reserva expirou", null)));

        var response = await controller.Create(42);

        var badRequest = Assert.IsType<BadRequestObjectResult>(response);
        Assert.Equal("Reserva expirou", JsonSerializer.SerializeToElement(badRequest.Value).GetProperty("message").GetString());
    }

    private sealed class ReservationStub((bool Success, string Message) result) : IReservationService
    {
        public Task<(bool Success, string Message)> ReserveSeatAsync(int seatId) => Task.FromResult(result);
    }

    private sealed class OrderStub((bool Success, string Message, Order? Order) result) : IOrderService
    {
        public Task<(bool Success, string Message, Order? Order)> CreateOrderAsync(int seatId) => Task.FromResult(result);
    }
}
