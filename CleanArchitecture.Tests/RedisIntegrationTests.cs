using CleanArchitecture.Services;
using StackExchange.Redis;

namespace CleanArchitecture.Tests;

public class RedisIntegrationTests
{
    [Fact]
    [Trait("Category", "ExternalInfrastructure")]
    public async Task SeatLock_IsExclusiveAndCanBeReleased()
    {
        var options = ConfigurationOptions.Parse(
            Environment.GetEnvironmentVariable("TEST_REDIS_CONNECTION") ?? "localhost:6379");
        options.ConnectTimeout = 1500;
        options.AsyncTimeout = 1500;
        options.AbortOnConnectFail = true;
        await using var redis = await ConnectionMultiplexer.ConnectAsync(options);
        var cache = new RedisSeatReservationCache(redis);
        var seatId = Random.Shared.Next(1_000_000_000, int.MaxValue);

        try
        {
            Assert.True(await cache.TryReserveAsync(seatId, TimeSpan.FromSeconds(30)));
            var ttl = await redis.GetDatabase().KeyTimeToLiveAsync($"seat:{seatId}");
            Assert.True(ttl > TimeSpan.Zero && ttl <= TimeSpan.FromSeconds(30));
            Assert.False(await cache.TryReserveAsync(seatId, TimeSpan.FromSeconds(30)));
            await cache.ReleaseAsync(seatId);
            Assert.True(await cache.TryReserveAsync(seatId, TimeSpan.FromSeconds(30)));
        }
        finally
        {
            await cache.ReleaseAsync(seatId);
        }
    }
}
