using System.Security.Cryptography.X509Certificates;

namespace Backend.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public DateTime EventDate { get; set; }
        public int TotalCapacity { get; set; }
        public int CurrentCapacity { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
    }
}