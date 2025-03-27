namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRoomRepository Rooms { get; }
        IBookingRepository Bookings { get; }
        IUserRepository Users { get; }
        Task<int> SaveChangesAsync();
    }
}