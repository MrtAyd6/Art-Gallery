namespace Backend.Models
{
    public class Comment
    {
        public int CommentId { get; set; }
        public int UserId { get; set; }
        public int? EventId { get; set; }
        public int ? ArtworkId { get; set; }
        public string CommentText { get; set; }
        public int Rating { get; set; }
        public int UsefulCount { get; set; }
        public string? AdminReply { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? UserName { get; set; }    //Yorumu yapanın adını göstermek için ekstra alan
    }
}