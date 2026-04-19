namespace Backend.Models
{
    public class OrderRequest
    {
        public int UserId { get; set; }
        public int ArtworkId { get; set; }
        public string PaymentMethod { get; set; }
    }
}