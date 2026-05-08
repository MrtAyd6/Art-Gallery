namespace Backend.Models
{
    public class UpdateReservationRequest
    {
        public int SessionId { get; set; }
        public int TicketCount { get; set; }
        public decimal TotalPrice { get; set; }
    }
}