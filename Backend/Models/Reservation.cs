namespace Backend.Models
{
    public class Reservation
    {
        public int ReservationId { get; set; }
        public int SessionId { get; set; }
        public int EventId { get; set; }
        public int TicketCount { get; set; }
        public string SessionInfo { get; set; }
        public string SessionDate { get; set; }
        public int TotalPrice { get; set; }
        public string EventTitle { get; set; }
    }
}