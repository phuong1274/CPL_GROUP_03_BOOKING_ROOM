using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.Extensions.Logging;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BookingRoom.Server.Services
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRoomService _roomService;
        private readonly ILogger<BookingService> _logger;



        public BookingService(IUnitOfWork unitOfWork, IRoomService roomService, ILogger<BookingService> logger)
        {
            _unitOfWork = unitOfWork;
            _roomService = roomService;
            _logger = logger;
        }

        public async Task<List<BookingDTO>> GetBookingsAsync()
        {
            var bookings = await _unitOfWork.Bookings.GetAllAsync();
            return bookings.Select(b => new BookingDTO
            {
                BookingID = b.BookingId,
                UserID = b.UserId.GetValueOrDefault(),
                RoomID = b.RoomId.GetValueOrDefault(),
                CheckInDate = b.CheckInDate ?? DateTime.Now,
                CheckOutDate = b.CheckOutDate ?? DateTime.Now,
                BookingStatus = b.BookingStatus,
                TotalAmount = b.TotalAmount.GetValueOrDefault(),
                UpdatedAt = b.UpdatedAt
            }).ToList();
        }

        public async Task<(bool success, string message)> CheckInAsync(int bookingId)
        {
            try
            {
                
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return (false, "Booking not found");
                }

                if (booking.BookingStatus != "Pending")
                {
                    return (false, $"Cannot check-in. Current status is '{booking.BookingStatus}'");
                }

               
                if (!booking.CheckInDate.HasValue)
                {
                    return (false, "Invalid booking - no check-in date specified");
                }

               
                var currentDate = DateTime.Today; 
                var checkInDate = booking.CheckInDate.Value.Date;

               
                _logger.LogInformation($"Check-in validation - Current: {currentDate:yyyy-MM-dd}, Booking: {checkInDate:yyyy-MM-dd}");

               
                if (currentDate < checkInDate)
                {
                    return (false, $"Check-in is only allowed on or after {checkInDate:yyyy-MM-dd}");
                }

                if (currentDate > checkInDate.AddDays(2))
                {
                    return (false, $"Check-in is only allowed within 2 days after {checkInDate:yyyy-MM-dd}");
                }

                
                booking.BookingStatus = "CheckedIn"; 
                booking.CheckInDate = DateTime.Now; 
                booking.UpdatedAt = DateTime.Now;

                await _unitOfWork.Bookings.UpdateAsync(booking);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Check-in successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during check-in for booking {bookingId}");
                return (false, "An error occurred during check-in");
            }
        }

        public async Task<bool> CheckOutAsync(int bookingId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    _logger.LogWarning("Booking with ID {BookingId} not found", bookingId);
                    return false;
                }

                if (booking.BookingStatus != "Confirmed" && booking.BookingStatus != "CheckedIn") 
                {
                    _logger.LogWarning("Booking {BookingId} cannot be checked out: Current status is {Status}", bookingId, booking.BookingStatus);
                    return false;
                }

                
                if (!booking.CheckInDate.HasValue || !booking.CheckOutDate.HasValue)
                {
                    _logger.LogWarning("Booking {BookingId} has invalid CheckInDate or CheckOutDate", bookingId);
                    return false;
                }

                
                var stayDuration = (booking.CheckOutDate.Value.Date - booking.CheckInDate.Value.Date).Days;
                if (stayDuration < 1)
                    stayDuration = 1;              
                var pricePerDay = booking.TotalAmount; 
                
                booking.TotalAmount = stayDuration * pricePerDay;

                
                booking.BookingStatus = "Completed";
                booking.CheckOutDate = DateTime.Now;
                booking.UpdatedAt = DateTime.Now;

                if (booking.RoomId.HasValue)
                {
                    await _roomService.UpdateRoomStatusAsync(booking.RoomId.Value, "Available");
                    
                }

                await _unitOfWork.Bookings.UpdateAsync(booking);
                var changesSaved = await _unitOfWork.SaveChangesAsync();

                if (changesSaved > 0)
                {
                    _logger.LogInformation("Booking {BookingId} checked out successfully. Total amount: {TotalAmount}",
                        bookingId, booking.TotalAmount);
                    return true;
                }
                else
                {
                    _logger.LogError("Failed to save changes for Booking {BookingId}", bookingId);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking out Booking {BookingId}", bookingId);
                throw new ApplicationException($"Check-out failed for booking {bookingId}.", ex);
            }
        }



        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Pending") return false;

            booking.BookingStatus = "Cancelled";
            booking.UpdatedAt = DateTime.Now;
         
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(booking.RoomId.GetValueOrDefault());
            if (room != null)
            {
                room.Status = "Available";
                await _unitOfWork.Rooms.UpdateRoomAsync(room);
            }

            await _unitOfWork.Bookings.UpdateAsync(booking);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            return await _unitOfWork.Bookings.GetByIdAsync(id);
        }

        public async Task AddBookingAsync(Booking booking)
        {
            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdateBookingAsync(Booking booking)
        {
            await _unitOfWork.Bookings.UpdateAsync(booking);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteBookingAsync(int id)
        {
            await _unitOfWork.Bookings.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}