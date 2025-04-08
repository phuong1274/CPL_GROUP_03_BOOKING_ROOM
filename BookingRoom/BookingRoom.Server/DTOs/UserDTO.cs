namespace BookingRoom.Server.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public int? Points { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateAt { get; set; }
    }
}