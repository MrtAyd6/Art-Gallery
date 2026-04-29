namespace Backend.Models
{
    public class SupportTicket
    {
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public string? Status { get; set; } //Veritabanı varsayılan atayacak
        public string? AdminReply { get; set; } //Başlangıçta boş
        public DateTime CreatedAt { get; set; }
    }
}