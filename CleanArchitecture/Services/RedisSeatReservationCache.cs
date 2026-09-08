using StackExchange.Redis;

namespace CleanArchitecture.Services
{
    public class RedisSeatReservationCache : ISeatReservationCache
    {
        private readonly IDatabase _database;

        public RedisSeatReservationCache(IConnectionMultiplexer redis)
        {
            _database = redis.GetDatabase();
        }

        public async Task<bool> TryReserveAsync(
            int seatId,
            TimeSpan expiration)
        {
            var key = $"seat:{seatId}";

            return await _database.StringSetAsync(
                key,
                "reserved",
                expiration,
                When.NotExists);
        }

        public async Task ReleaseAsync(int seatId)
        {
            var key = $"seat:{seatId}";

            await _database.KeyDeleteAsync(key);
        }
    }
}