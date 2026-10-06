using RabbitMQ.Client;
using System.Text;

namespace CleanArchitecture.Services
{
    public class RabbitMqPublisher : IMessagePublisher
    {
        private readonly IConfiguration _configuration;

        public RabbitMqPublisher(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task PublishAsync(
            string routingKey,
            string message)
        {
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:Host"] ?? throw new InvalidOperationException("RabbitMQ:Host não configurado."),
                Port = int.Parse(_configuration["RabbitMQ:Port"]!),
                UserName = _configuration["RabbitMQ:User"] ?? throw new InvalidOperationException("RabbitMQ:User não configurado."),
                Password = _configuration["RabbitMQ:Password"] ?? throw new InvalidOperationException("RabbitMQ:Password não configurado.")
            };

            await using var connection =
                await factory.CreateConnectionAsync();

            await using var channel =
                await connection.CreateChannelAsync();

            var exchange =
                _configuration["RabbitMQ:Exchange"]!;

            var queue =
                _configuration["RabbitMQ:PaymentQueue"]!;

            await channel.ExchangeDeclareAsync(
                exchange: exchange,
                type: ExchangeType.Direct,
                durable: true,
                autoDelete: false);

            await channel.QueueDeclareAsync(
                queue: queue,
                durable: true,
                exclusive: false,
                autoDelete: false);

            await channel.QueueBindAsync(
                queue: queue,
                exchange: exchange,
                routingKey: routingKey);

            var body = Encoding.UTF8.GetBytes(message);

            await channel.BasicPublishAsync(
                exchange: exchange,
                routingKey: routingKey,
                body: body);
        }
    }
}
