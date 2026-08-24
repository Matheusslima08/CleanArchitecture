using CleanArchitecture.Models;

namespace CleanArchitecture.Services
{
    public interface IProdutoService
    {
        Task<List<Produto>> ListarAsync();
    }
}