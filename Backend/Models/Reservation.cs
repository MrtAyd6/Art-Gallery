namespace Backend.Models
{
    public class Reservation
    {
        public int ReservationId { get; set; }
        public int EventId { get; set; }
        public int ParticipantCount { get; set; }
    }
}