namespace Backend.Models
{
    public class Artwork
    {
        public int ArtworkId { get; set; }
        public string Title { get; set; }
        public string ArtistName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public int ViewsCount { get; set; }
        public int DiscountRate { get; set; }
    }
}