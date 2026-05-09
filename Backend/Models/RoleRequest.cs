namespace Backend.Models
{
    public class RoleRequest
    {
        public int UserId { get; set; }
        public string RequestedRole { get; set; }
        public string Message { get; set; }
    }

    public class ProcessRoleRequestDto
    {
        public int RequestId { get; set; }
        public string Decision { get; set; }
    }
}