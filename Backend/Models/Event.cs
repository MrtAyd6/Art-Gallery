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
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public int DiscountRate { get; set; }

        public List<EventSession> Sessions { get; set; } = new List<EventSession>();
    }

    public class CreateEventFormDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int OrganizerId { get; set; }
        public IFormFile ImageFile { get; set; }
        public string SessionsJson { get; set; }
    }

    public class SessionHelperDto
    {
        public string SessionDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public int Capacity { get; set; }
    }
}