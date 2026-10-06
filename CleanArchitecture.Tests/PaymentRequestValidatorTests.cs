using EventPass.PaymentWorker;

namespace CleanArchitecture.Tests;

public class PaymentRequestValidatorTests
{
    [Theory]
    [InlineData("{\"OrderId\":1,\"Amount\":25.50}", true)]
    [InlineData("{\"OrderId\":0,\"Amount\":25.50}", false)]
    [InlineData("{\"OrderId\":1,\"Amount\":0}", false)]
    [InlineData("not-json", false)]
    [InlineData("null", false)]
    public void TryParse_ValidatesPaymentMessage(string json, bool expected)
    {
        var valid = PaymentRequestValidator.TryParse(json, out var payment);

        Assert.Equal(expected, valid);
        Assert.Equal(expected, payment is not null && payment.OrderId > 0 && payment.Amount > 0);
    }
}
