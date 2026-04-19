namespace Backend.Models
{
    public class ReservationRequest
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public int ParticipantCount { get; set; }
    }
}