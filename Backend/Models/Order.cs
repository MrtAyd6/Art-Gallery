namespace Backend.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public int ArtworkId { get; set; }
        public DateTime OrderDate { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
    }

    public class CreateOrderDto
    {
        public int UserId { get; set; }
        public int ArtworkId { get; set; }
        public string PaymentMethod { get; set; }
    }

    public class OrderRequest
    {
        public int UserId { get; set; }
        public int ArtworkId { get; set; }
        public string PaymentMethod { get; set; }
    }

    public class ProcessOrderDto
    {
        public string Decision { get; set; }
    }
}