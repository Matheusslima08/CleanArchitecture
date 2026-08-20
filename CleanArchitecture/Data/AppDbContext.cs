using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Produto> Produtos { get; set; }
    }
}