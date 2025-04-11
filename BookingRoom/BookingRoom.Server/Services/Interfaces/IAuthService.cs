using BookingRoom.Server.DTOs;

namespace BookingRoom.Server.Services.Interfaces
{
        public interface IAuthService
        {
                Task<string> LoginAsync(LoginDTO loginDTO);
 
                Task ForgotPasswordAsync(string email);
                Task ResetPasswordAsync(string token, string newPassword);
                Task ChangePasswordAsync(int userId, string oldPassword, string newPassword);
                
                Task<string> RegisterAsync(RegisterDTO registerDTO);
        }
}
