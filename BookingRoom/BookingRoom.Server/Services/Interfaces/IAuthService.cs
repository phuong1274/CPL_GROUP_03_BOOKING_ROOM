using BookingRoom.Server.DTOs;

namespace BookingRoom.Server.Services.Interfaces
{
        public interface IAuthService
        {
                Task<string> LoginAsync(LoginDTO loginDTO);
                Task RegisterAsync(RegisterDTO registerDTO);

                Task ForgotPasswordAsync(string email);
                Task ResetPasswordAsync(string token, string newPassword);
                Task ChangePasswordAsync(int userId, string oldPassword, string newPassword);
                Task<object> UpdateProfileAsync(int userId, UpdateProfileDTO profileDTO);
                Task<string> RegisterAsync(RegisterDTO registerDTO);
        }
}
