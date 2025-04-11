
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Server.Repositories
{
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        private readonly HotelBookingDbContext _context;

        public BookingRepository(HotelBookingDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings.ToListAsync();
        }
        public async Task<List<Booking>> GetAllAsync(IQueryable<Booking> query)
        {
            return await query.ToListAsync();
        }

        public IQueryable<Booking> GetQuery()
        {
            return _context.Bookings.AsQueryable();
        }
    }
}
