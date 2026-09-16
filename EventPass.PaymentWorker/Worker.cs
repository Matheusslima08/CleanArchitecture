using EventPass.PaymentWorker.Messages;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace EventPass.PaymentWorker
{
    public class Worker(
        ILogger<Worker> logger,
        IConfiguration configuration) : BackgroundService
    {
        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory
            {
                HostName = configuration["RabbitMQ:Host"],
                Port = int.Parse(configuration["RabbitMQ:Port"]!),
                UserName = configuration["RabbitMQ:User"],
                Password = configuration["RabbitMQ:Password"]
            };

            await using var connection =
                await factory.CreateConnectionAsync();

            await using var channel =
                await connection.CreateChannelAsync();

            var queue = configuration["RabbitMQ:PaymentQueue"]!;
            var deadLetterExchange =
                configuration["RabbitMQ:DeadLetterExchange"]!;
            var deadLetterQueue =
                configuration["RabbitMQ:DeadLetterQueue"]!;
            var deadLetterRoutingKey =
                configuration["RabbitMQ:DeadLetterRoutingKey"]!;

            await channel.ExchangeDeclareAsync(
                exchange: deadLetterExchange,
                type: ExchangeType.Direct,
                durable: true,
                autoDelete: false);

            await channel.QueueDeclareAsync(
                queue: deadLetterQueue,
                durable: true,
                exclusive: false,
                autoDelete: false);

            await channel.QueueBindAsync(
                queue: deadLetterQueue,
                exchange: deadLetterExchange,
                routingKey: deadLetterRoutingKey);

            await channel.QueueDeclareAsync(
                queue: queue,
                durable: true,
                exclusive: false,
                autoDelete: false);
            
            await channel.BasicQosAsync(
                prefetchSize: 0,
                prefetchCount: 1,
                global: false);

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (_, args) =>
            {
                var dispositionAttempted = false;

                try
                {
                    var json = Encoding.UTF8.GetString(
                        args.Body.ToArray());

                    PaymentRequested? payment;

                    try
                    {
                        payment = JsonSerializer.Deserialize<PaymentRequested>(json);
                    }
                    catch (JsonException ex)
                    {
                        logger.LogWarning(
                            ex,
                            "Mensagem rejeitada: JSON inválido.");

                        dispositionAttempted = true;
                        await channel.BasicNackAsync(
                            deliveryTag: args.DeliveryTag,
                            multiple: false,
                            requeue: false);

                        return;
                    }

                    if (payment == null ||
                        payment.OrderId <= 0 ||
                        payment.Amount <= 0)
                    {
                        logger.LogWarning(
                            "Mensagem rejeitada: OrderId e Amount devem ser maiores que zero.");

                        dispositionAttempted = true;
                        await channel.BasicNackAsync(
                            deliveryTag: args.DeliveryTag,
                            multiple: false,
                            requeue: false);

                        return;
                    }

                    logger.LogInformation(
                        "Pedido recebido: {OrderId} | Valor: {Amount}",
                        payment.OrderId,
                        payment.Amount);

                    dispositionAttempted = true;
                    await channel.BasicAckAsync(
                        deliveryTag: args.DeliveryTag,
                        multiple: false);
                }
                catch (Exception ex)
                {
                    if (dispositionAttempted)
                    {
                        logger.LogError(
                            ex,
                            "Falha ao enviar Ack ou Nack. Uma segunda confirmação não será tentada.");

                        return;
                    }

                    logger.LogError(
                        ex,
                        "Falha inesperada. A mensagem será rejeitada sem requeue.");

                    try
                    {
                        dispositionAttempted = true;
                        await channel.BasicNackAsync(
                            deliveryTag: args.DeliveryTag,
                            multiple: false,
                            requeue: false);
                    }
                    catch (Exception nackException)
                    {
                        logger.LogCritical(
                            nackException,
                            "Não foi possível rejeitar a mensagem após a falha inesperada.");
                    }
                }
            };

            await channel.BasicConsumeAsync(
                queue: queue,
                autoAck: false,
                consumer: consumer);

            logger.LogInformation(
                "Payment Worker aguardando mensagens na fila {Queue}",
                queue);

            try
            {
                await Task.Delay(
                    Timeout.Infinite,
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                logger.LogInformation("Payment Worker encerrado.");
            }
        }
    }
}
