param(
    [string]$HostName = "localhost",
    [int]$ManagementPort = 15672,
    [string]$UserName = "guest",
    [string]$Password = "guest"
)

$plainCredentials = "${UserName}:${Password}"
$encodedCredentials = [Convert]::ToBase64String(
    [Text.Encoding]::ASCII.GetBytes($plainCredentials))
$headers = @{ Authorization = "Basic $encodedCredentials" }

$policy = @{
    pattern = '^payment\.requested$'
    'apply-to' = 'queues'
    definition = @{
        'dead-letter-exchange' = 'eventpass.dlx'
        'dead-letter-routing-key' = 'payment.requested.dead'
    }
    priority = 0
} | ConvertTo-Json -Depth 3

$uri = "http://${HostName}:${ManagementPort}/api/policies/%2F/eventpass-payment-requested-dlx"

Invoke-RestMethod `
    -Method Put `
    -Uri $uri `
    -Headers $headers `
    -ContentType 'application/json' `
    -Body $policy

Write-Host "Policy de dead letter configurada para payment.requested."
