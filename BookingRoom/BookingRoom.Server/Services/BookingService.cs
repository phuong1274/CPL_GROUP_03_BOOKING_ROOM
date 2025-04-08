using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BookingRoom.Server.Services
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
      

        public BookingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

        public async Task<bool> CheckInAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Pending") return false;

            booking.BookingStatus = "Confirmed";
            booking.UpdatedAt = DateTime.Now;
          

            await _unitOfWork.Bookings.UpdateAsync(booking);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckOutAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Confirmed") return false;

            booking.BookingStatus = "Completed";
            booking.UpdatedAt = DateTime.Now;


            var payment = new Payment
            {
                BookingId = bookingId,
                TotalPrice = booking.TotalAmount
            };

            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.Bookings.UpdateAsync(booking);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }




        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Pending") return false;

            booking.BookingStatus = "Cancelled";
            booking.UpdatedAt = DateTime.Now;

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