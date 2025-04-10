using System.ComponentModel.DataAnnotations;

namespace BookingRoom.Server.DTOs
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Email or Username is required")]
        public string login { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        public string password { get; set; } = string.Empty;
    }
}