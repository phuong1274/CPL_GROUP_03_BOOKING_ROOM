using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDTO>> GetAllUsersAsync();
        Task<UserDTO> GetUserByIdAsync(int id);
        Task AddUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int id);
        Task<User> GetByEmailOrUsernameAsync(string login);
        Task<User?> GetByEmailAsync(string email);
        Task<object> UpdateProfileAsync(int userId, UpdateProfileDTO profileDTO);

    }
}