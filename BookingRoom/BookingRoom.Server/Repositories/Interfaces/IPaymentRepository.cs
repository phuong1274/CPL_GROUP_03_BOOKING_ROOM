using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task AddAsync(Payment payment);
        Task<Payment?> GetByIdAsync(int id);
    }
}
