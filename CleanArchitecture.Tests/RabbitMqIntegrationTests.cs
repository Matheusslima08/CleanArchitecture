using CleanArchitecture.Services;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using System.Text;

namespace CleanArchitecture.Tests;

public class RabbitMqIntegrationTests
{
    [Fact]
    [Trait("Category", "ExternalInfrastructure")]
    public async Task Publisher_RoutesMessageToDurableQueue()
    {
        var suffix = Guid.NewGuid().ToString("N");
        var exchange = "eventpass.test." + suffix;
        var queue = "payment.test." + suffix;
        var routingKey = "payment.requested.test";
        var host = Environment.GetEnvironmentVariable("TEST_RABBITMQ_HOST") ?? "localhost";
        var port = int.Parse(Environment.GetEnvironmentVariable("TEST_RABBITMQ_PORT") ?? "5672");
        var user = Environment.GetEnvironmentVariable("TEST_RABBITMQ_USER") ?? "guest";
        var password = Environment.GetEnvironmentVariable("TEST_RABBITMQ_PASSWORD") ?? "guest";
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["RabbitMQ:Host"] = host,
            ["RabbitMQ:Port"] = port.ToString(),
            ["RabbitMQ:User"] = user,
            ["RabbitMQ:Password"] = password,
            ["RabbitMQ:Exchange"] = exchange,
            ["RabbitMQ:PaymentQueue"] = queue
        }).Build();

        await new RabbitMqPublisher(config).PublishAsync(routingKey, "integration-test");

        var factory = new ConnectionFactory { HostName = host, Port = port, UserName = user, Password = password };
        await using var connection = await factory.CreateConnectionAsync();
        await using var channel = await connection.CreateChannelAsync();
        try
        {
            var delivery = await channel.BasicGetAsync(queue, autoAck: true);
            Assert.NotNull(delivery);
            Assert.Equal("integration-test", Encoding.UTF8.GetString(delivery.Body.ToArray()));
        }
        finally
        {
            await channel.QueueDeleteAsync(queue);
            await channel.ExchangeDeleteAsync(exchange);
        }
    }
}
