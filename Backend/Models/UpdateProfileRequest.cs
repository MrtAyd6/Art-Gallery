namespace Backend.Models
{
    public class UpdateProfileRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}