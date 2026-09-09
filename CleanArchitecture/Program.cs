using CleanArchitecture.Data;
using Microsoft.EntityFrameworkCore;
using CleanArchitecture.Services;
using StackExchange.Redis;
using CleanArchitecture.Hubs;


var builder = WebApplication.CreateBuilder(args);

string connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "A connection string 'DefaultConnection' não foi encontrada.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString));

builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ISeatReservationCache, RedisSeatReservationCache>();
builder.Services.AddScoped<ISeatNotifier, SeatNotifier>();
builder.Services.AddHostedService<ReservationExpirationService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSignalR();
// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var connectionString =
        builder.Configuration["Redis:ConnectionString"];

    return ConnectionMultiplexer.Connect(connectionString!);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();
app.MapHub<SeatHub>("/hubs/seats");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
