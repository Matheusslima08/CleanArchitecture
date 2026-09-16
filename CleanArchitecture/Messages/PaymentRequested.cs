namespace CleanArchitecture.Messages
{
    public class PaymentRequested
    {
        public int OrderId { get; set; }

        public decimal Amount { get; set; }

    }
}
