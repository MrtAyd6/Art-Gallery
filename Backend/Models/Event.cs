using System.Security.Cryptography.X509Certificates;

namespace Backend.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public DateTime EventDate { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }

        public List<EventSession> Sessions { get; set; } = new List<EventSession>();
    }
}