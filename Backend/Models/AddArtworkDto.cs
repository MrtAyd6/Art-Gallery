namespace Backend.Models
{
    public class AddArtworkDto
    {
        public string Title { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int ArtistId { get; set; }
        public string ArtistName { get; set; }
        public IFormFile ImageFile { get; set; }
    }
}