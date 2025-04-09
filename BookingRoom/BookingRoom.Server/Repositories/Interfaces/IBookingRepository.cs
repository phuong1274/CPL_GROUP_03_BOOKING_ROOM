using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        new Task<List<Booking>> GetAllAsync();
        new Task<Booking> GetByIdAsync(int id);
        new Task UpdateAsync(Booking booking);
        IQueryable<Booking> GetQuery();

    }
}