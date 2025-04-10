using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        new Task<List<Booking>> GetAllAsync();
        Task<List<Booking>> GetAllAsync(IQueryable<Booking> query);
        new Task<Booking> GetByIdAsync(int id);
        new Task UpdateAsync(Booking booking);
        IQueryable<Booking> GetQuery();

    }
}