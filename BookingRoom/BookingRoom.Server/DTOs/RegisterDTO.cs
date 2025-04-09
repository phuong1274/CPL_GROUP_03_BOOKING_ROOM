using System.ComponentModel.DataAnnotations;

namespace BookingRoom.Server.DTOs
{
    public class RegisterDTO
    {
        [Required]
        public string username { get; set; } = string.Empty; 

    [Required]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string password { get; set; } = string.Empty;

        [Required]
        public string fullName { get; set; } = string.Empty;

        [Required]
        public string phoneNumber { get; set; } = string.Empty;

        public string role { get; set; } = "Customer";
        public string status { get; set; } = "Active";
    }
}