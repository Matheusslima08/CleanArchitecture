# Testes

Execute os testes unitários e os testes de integração com SQLite isolado:

```powershell
dotnet test CleanArchitecture.slnx --filter 'Category!=ExternalInfrastructure'
```

Execute os testes com Redis e RabbitMQ reais quando os serviços estiverem disponíveis:

```powershell
dotnet test CleanArchitecture.slnx --filter 'Category=ExternalInfrastructure'
```

Os testes externos usam `localhost:6379` para Redis e `localhost:5672` com `guest/guest` para RabbitMQ por padrão. Configure `TEST_REDIS_CONNECTION`, `TEST_RABBITMQ_HOST`, `TEST_RABBITMQ_PORT`, `TEST_RABBITMQ_USER` e `TEST_RABBITMQ_PASSWORD` para outros ambientes. Use instâncias de teste: o teste Redis cria e remove uma chave `seat:<id>` temporária; o teste RabbitMQ cria e remove uma fila e uma exchange temporárias.

O teste SQLite cobre a persistência do pedido e a emissão do comando para o publicador, mas não substitui um teste do fluxo de reservas contra MySQL, pois esse fluxo usa `SELECT ... FOR UPDATE` específico de MySQL. O teste RabbitMQ verifica o roteamento do publicador; o worker ainda não processa pagamentos de fato.
