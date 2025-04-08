using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using System.Threading.Tasks;

namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRoomRepository Rooms { get; }
        IBookingRepository Bookings { get; }
        IUserRepository Users { get; }
        IRoomTypeRepository RoomTypes { get; }
        IRoomMediaRepository RoomMedia { get; }
        IRoomRepository RoomRepository { get; }
        IPaymentRepository Payments { get; }

        IRoomTypeRepository RoomTypeRepository { get; }
        Task<int> SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task CommitTransactionAsync(IDbContextTransaction transaction);
        Task RollbackTransactionAsync(IDbContextTransaction transaction);
    }
}