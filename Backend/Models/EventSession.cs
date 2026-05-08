namespace Backend.Models
{
    public class EventSession
    {
        public int SessionId { get; set; }
        public int EventId { get; set; }
        public string SessionDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public int CurrentCapacity { get; set; }
    }
}