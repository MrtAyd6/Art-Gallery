namespace Backend.Models
{
    public class CreateOrderDto
    {
        public int UserId { get; set; }
        public int ArtworkId { get; set; }
        public string PaymentMethod { get; set; }
    }
}