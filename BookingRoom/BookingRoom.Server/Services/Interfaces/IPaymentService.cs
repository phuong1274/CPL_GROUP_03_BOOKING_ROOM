namespace BookingRoom.Server.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<bool> ProcessPaymentAsync(int bookingId, decimal amount);
        Task<bool> RefundPaymentAsync(int bookingId, decimal amount);
        Task AddPaymentRecordAsync(int bookingId, decimal amount);
    }
}
