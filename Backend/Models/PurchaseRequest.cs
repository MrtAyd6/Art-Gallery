namespace Backend.Models
{
    public class PurchaseRequest
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public int SessionId { get; set; }
        public int TicketCount { get; set; }
        public decimal TotalPrice { get; set; }
    }
}