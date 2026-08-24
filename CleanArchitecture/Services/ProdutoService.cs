using CleanArchitecture.Data;
using CleanArchitecture.Models;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Services
{
    public class ProdutoService : IProdutoService
    {
        private readonly AppDbContext _context;

        public ProdutoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Produto>> ListarAsync()
        {
            return await _context.Produtos
                .AsNoTracking()
                .ToListAsync();
        }
    }
}