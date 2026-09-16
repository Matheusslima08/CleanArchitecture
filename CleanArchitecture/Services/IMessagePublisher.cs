namespace CleanArchitecture.Services
{
    public interface IMessagePublisher
    {
        Task PublishAsync(
            string routingKey,
            string message);
    }
}