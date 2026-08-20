using System.ComponentModel.DataAnnotations;

namespace CleanArchitecture.Models
{
    public class Produto
    {
        public int ProdutoId { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome pode ter até 100 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        public decimal Preco { get; set; }

        public int QuantidadeEstoque { get; set; }

        [StringLength(500, ErrorMessage = "A descrição pode ter até 500 caracteres.")]
        public string? Descricao { get; set; }

        public bool Ativo { get; set; } = true;
    }
}