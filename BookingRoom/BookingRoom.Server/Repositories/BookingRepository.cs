using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookingRoom.Server.Repositories
{
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        public BookingRepository(HotelBookingDbContext context) : base(context)
        {
        }
    }
}