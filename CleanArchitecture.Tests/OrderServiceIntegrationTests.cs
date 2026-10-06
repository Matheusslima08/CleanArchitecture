using CleanArchitecture.Data;
using CleanArchitecture.Models;
using CleanArchitecture.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CleanArchitecture.Tests;

public class OrderServiceIntegrationTests
{
    [Fact]
    [Trait("Category", "IntegrationLocal")]
    public async Task ActiveReservation_CreatesOrderAndPublishesPaymentRequest()
    {
        await using var database = await TestDatabase.CreateAsync();
        var publisher = new RecordingPublisher();
        var service = new OrderService(database.Context, publisher);

        var result = await service.CreateOrderAsync(database.SeatId);

        Assert.True(result.Success);
        Assert.NotNull(result.Order);
        Assert.Equal(75.50m, result.Order.TotalAmount);
        Assert.Equal("AwaitingPayment", result.Order.Status);
        Assert.Single(await database.Context.OrderItems.ToListAsync());
        Assert.Equal("payment.requested", publisher.RoutingKey);
        var message = JsonSerializer.Deserialize<CleanArchitecture.Messages.PaymentRequested>(publisher.Message!);
        Assert.Equal(result.Order.OrderId, message!.OrderId);
        Assert.Equal(75.50m, message.Amount);
    }

    [Fact]
    [Trait("Category", "IntegrationLocal")]
    public async Task ExpiredReservation_DoesNotCreateOrPublish()
    {
        await using var database = await TestDatabase.CreateAsync(expired: true);
        var publisher = new RecordingPublisher();

        var result = await new OrderService(database.Context, publisher).CreateOrderAsync(database.SeatId);

        Assert.False(result.Success);
        Assert.Empty(await database.Context.Orders.ToListAsync());
        Assert.Null(publisher.Message);
    }

    [Fact]
    [Trait("Category", "IntegrationLocal")]
    public async Task ExistingOpenOrder_DoesNotCreateSecondOrder()
    {
        await using var database = await TestDatabase.CreateAsync();
        var publisher = new RecordingPublisher();
        var service = new OrderService(database.Context, publisher);

        Assert.True((await service.CreateOrderAsync(database.SeatId)).Success);
        var second = await service.CreateOrderAsync(database.SeatId);

        Assert.False(second.Success);
        Assert.Single(await database.Context.Orders.ToListAsync());
        Assert.Equal(1, publisher.PublishCount);
    }

    [Fact]
    [Trait("Category", "IntegrationLocal")]
    public async Task PublisherFailure_LeavesSavedOrderAwaitingPayment()
    {
        await using var database = await TestDatabase.CreateAsync();
        var service = new OrderService(database.Context, new FailingPublisher());

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateOrderAsync(database.SeatId));

        var order = Assert.Single(await database.Context.Orders.ToListAsync());
        Assert.Equal("AwaitingPayment", order.Status);
    }

    private sealed class RecordingPublisher : IMessagePublisher
    {
        public string? RoutingKey { get; private set; }
        public string? Message { get; private set; }
        public int PublishCount { get; private set; }
        public Task PublishAsync(string routingKey, string message)
        {
            RoutingKey = routingKey;
            Message = message;
            PublishCount++;
            return Task.CompletedTask;
        }
    }

    private sealed class FailingPublisher : IMessagePublisher
    {
        public Task PublishAsync(string routingKey, string message) =>
            Task.FromException(new InvalidOperationException("Broker indisponível"));
    }

    private sealed class TestDatabase : IAsyncDisposable
    {
        private readonly SqliteConnection _connection;
        public AppDbContext Context { get; }
        public int SeatId { get; private set; }

        private TestDatabase(SqliteConnection connection, AppDbContext context)
        {
            _connection = connection;
            Context = context;
        }

        public static async Task<TestDatabase> CreateAsync(bool expired = false)
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
            var context = new AppDbContext(options);
            await context.Database.EnsureCreatedAsync();

            var seat = new Seat
            {
                Row = "A", Number = 1, Status = "Reserved",
                Sector = new Sector
                {
                    Name = "Pista", Price = 75.50m,
                    Event = new Event { Name = "Teste", Venue = "Local", StartsAt = DateTime.UtcNow.AddDays(1), IsActive = true }
                }
            };
            context.Seats.Add(seat);
            await context.SaveChangesAsync();
            context.Reservations.Add(new Reservation
            {
                SeatId = seat.SeatId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddMinutes(-2),
                ExpiresAt = expired ? DateTime.UtcNow.AddMinutes(-1) : DateTime.UtcNow.AddMinutes(8)
            });
            await context.SaveChangesAsync();
            return new TestDatabase(connection, context) { SeatId = seat.SeatId };
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }
}
