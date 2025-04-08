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

        // Xử lý thanh toán cho booking
        public async Task<bool> ProcessPaymentAsync(int bookingId, decimal amount)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Confirmed")
            {
                // Không thể thanh toán nếu không phải booking đã được xác nhận
                return false;
            }

            // Thêm bản ghi thanh toán
            await AddPaymentRecordAsync(bookingId, amount);

            // Cập nhật trạng thái booking
            booking.BookingStatus = "Completed";
            await _bookingRepository.UpdateAsync(booking);

            return true;
        }

        // Xử lý hoàn tiền (Refund)
        public async Task<bool> RefundPaymentAsync(int bookingId, decimal amount)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null || booking.BookingStatus != "Completed")
            {
                // Không thể hoàn tiền nếu booking chưa hoàn thành
                return false;
            }

            // Cập nhật trạng thái booking về "Cancelled"
            booking.BookingStatus = "Cancelled";
            await _bookingRepository.UpdateAsync(booking);

            // Thêm bản ghi hoàn tiền
            await AddPaymentRecordAsync(bookingId, -amount);

            return true;
        }

        // Thêm bản ghi thanh toán vào hệ thống
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
