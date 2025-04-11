using System.Threading.Tasks;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Models;
using BookingRoom.Server.Services.Interfaces;

namespace BookingRoom.Server.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPaymentRepository _paymentRepository;

        public PaymentService(IBookingRepository bookingRepository, IPaymentRepository paymentRepository)
        {
            _bookingRepository = bookingRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<bool> ProcessPaymentAsync(int bookingId, decimal amount)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Confirmed")
            {
               
                return false;
            }

           
            await AddPaymentRecordAsync(bookingId, amount);

           
            booking.BookingStatus = "Completed";
            await _bookingRepository.UpdateAsync(booking);

            return true;
        }

      
        public async Task<bool> RefundPaymentAsync(int bookingId, decimal amount)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Completed")
            {
                
                return false;
            }

         
            booking.BookingStatus = "Cancelled";
            await _bookingRepository.UpdateAsync(booking);

           
            await AddPaymentRecordAsync(bookingId, -amount);

            return true;
        }

        
        public async Task AddPaymentRecordAsync(int bookingId, decimal amount)
        {
            var payment = new Payment
            {
                BookingId = bookingId,
                TotalPrice = amount,
                PaymentDate = DateOnly.FromDateTime(DateTime.Now),
                PaymentStatus = "Succeess",
                PaymentType = "Cash"
            };
            await _paymentRepository.AddAsync(payment);
        }
    }
}
