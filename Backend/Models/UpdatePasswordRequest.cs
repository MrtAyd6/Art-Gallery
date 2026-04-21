using System.Security.Cryptography.X509Certificates;

namespace Backend.Models
{
    public class UpdatePasswordRequest
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}