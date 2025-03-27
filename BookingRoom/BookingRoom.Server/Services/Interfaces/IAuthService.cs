using BookingRoom.Server.DTOs;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(LoginDTO loginDTO);
    }
}
