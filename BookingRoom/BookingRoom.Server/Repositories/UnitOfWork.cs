using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;

namespace BookingRoom.Server.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HotelBookingDbContext _context;
        private IRoomRepository? _roomRepository;
        private IBookingRepository? _bookingRepository;
        private IUserRepository? _userRepository;
        private bool _disposed = false;

        public UnitOfWork(HotelBookingDbContext context)
        {
            _context = context;
        }

        public IRoomRepository Rooms
        {
            get
            {
                return _roomRepository ??= new RoomRepository(_context);
            }
        }

        public IBookingRepository Bookings
        {
            get
            {
                return _bookingRepository ??= new BookingRepository(_context);
            }
        }

        public IUserRepository Users
        {
            get
            {
                return _userRepository ??= new UserRepository(_context);
            }
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        ~UnitOfWork()
        {
            Dispose(false);
        }
    }
}