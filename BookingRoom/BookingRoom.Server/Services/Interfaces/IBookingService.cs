using BookingRoom.Server.DTOs;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IBookingService
    {
        Task<List<BookingDTO>> GetBookingsAsync();
        Task<bool> CheckInAsync(int bookingId);
        Task<bool> CheckOutAsync(int bookingId);
        Task<bool> CancelBookingAsync(int bookingId);
    }
}
