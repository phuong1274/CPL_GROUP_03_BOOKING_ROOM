using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailOrUsernameAsync(string login);
        Task<User?> GetByEmailAsync(string email);
        IQueryable<User> GetAll();
    }
}