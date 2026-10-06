using EventPass.PaymentWorker.Messages;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace EventPass.PaymentWorker;

public static class PaymentRequestValidator
{
    public static bool TryParse(string json, [NotNullWhen(true)] out PaymentRequested? payment)
    {
        try
        {
            payment = JsonSerializer.Deserialize<PaymentRequested>(json);
            return payment is { OrderId: > 0, Amount: > 0 };
        }
        catch (JsonException)
        {
            payment = null;
            return false;
        }
    }
}
