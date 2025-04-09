using BookingRoom.Server.DTOs;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IBookingService
    {
        Task<List<BookingDTO>> GetBookingsAsync();
        Task<(bool success, string message)> CheckInAsync(int bookingId);
        Task<bool> CheckOutAsync(int bookingId);
        Task<bool> CancelBookingAsync(int bookingId);
    }
}
