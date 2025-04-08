using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        private readonly HotelBookingDbContext _context;

        public UserRepository(HotelBookingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailOrUsernameAsync(string login)
        {
            Console.WriteLine($"Searching for user with Email or Username: {login}");
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == login || u.Username == login);
            if (user == null)
            {
                Console.WriteLine($"No user found with Email or Username: {login}");
            }
            else
            {
                Console.WriteLine($"User found - Username: {user.Username}, Email: {user.Email}, Status: {user.Status}");
            }
            return user;
        }


        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public IQueryable<User> GetAll()
        {
            return _context.Users.AsQueryable();
        }
    }
}