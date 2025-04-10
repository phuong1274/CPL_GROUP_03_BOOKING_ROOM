using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingRoom.Server.Services.Interfaces;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace BookingRoom.Server.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// Processes a payment for a booking.
        /// </summary>
        /// <param name="bookingId">The ID of the booking.</param>
        /// <param name="request">The payment amount.</param>
        /// <returns>Success message if payment is processed.</returns>
        [HttpPost("process/{bookingId}")]
        public async Task<IActionResult> ProcessPayment(int bookingId, [FromBody] PaymentRequest request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    _logger.LogWarning("Invalid payment amount {Amount} for booking {BookingId}", request.Amount, bookingId);
                    return BadRequest(new { Error = "Payment amount must be greater than zero." });
                }

                _logger.LogInformation("Processing payment for booking {BookingId}, amount: {Amount}", bookingId, request.Amount);
                var result = await _paymentService.ProcessPaymentAsync(bookingId, request.Amount);
                if (!result)
                {
                    _logger.LogWarning("Payment processing failed for booking {BookingId}", bookingId);
                    return BadRequest(new { Error = "Payment processing failed. Please check the booking status or amount." });
                }

                return Ok(new { Message = "Payment processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for booking {BookingId}", bookingId);
                return StatusCode(500, new { Error = "An error occurred while processing the payment." });
            }
        }

        /// <summary>
        /// Processes a refund for a booking.
        /// </summary>
        /// <param name="bookingId">The ID of the booking.</param>
        /// <param name="request">The refund amount.</param>
        /// <returns>Success message if refund is processed.</returns>
        [HttpPost("refund/{bookingId}")]
        public async Task<IActionResult> RefundPayment(int bookingId, [FromBody] PaymentRequest request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    _logger.LogWarning("Invalid refund amount {Amount} for booking {BookingId}", request.Amount, bookingId);
                    return BadRequest(new { Error = "Refund amount must be greater than zero." });
                }

                _logger.LogInformation("Processing refund for booking {BookingId}, amount: {Amount}", bookingId, request.Amount);
                var result = await _paymentService.RefundPaymentAsync(bookingId, request.Amount);
                if (!result)
                {
                    _logger.LogWarning("Refund processing failed for booking {BookingId}", bookingId);
                    return BadRequest(new { Error = "Refund processing failed. Please check the booking status or amount." });
                }

                return Ok(new { Message = "Refund processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for booking {BookingId}", bookingId);
                return StatusCode(500, new { Error = "An error occurred while processing the refund." });
            }
        }

        /// <summary>
        /// Adds a payment record for a booking.
        /// </summary>
        /// <param name="bookingId">The ID of the booking.</param>
        /// <param name="request">The payment amount.</param>
        /// <returns>Success message if payment record is added.</returns>
        [HttpPost("{bookingId}")]
        public async Task<IActionResult> AddPaymentRecord(int bookingId, [FromBody] PaymentRequest request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    _logger.LogWarning("Invalid payment amount {Amount} for booking {BookingId}", request.Amount, bookingId);
                    return BadRequest(new { Error = "Payment amount must be greater than zero." });
                }

                int userId = GetUserIdFromToken();
                _logger.LogInformation("Adding payment record for booking {BookingId}, amount: {Amount}, by user {UserId}", bookingId, request.Amount, userId);
                await _paymentService.AddPaymentRecordAsync(bookingId, request.Amount);
                return Ok(new { Message = "Payment record added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding payment record for booking {BookingId}", bookingId);
                return StatusCode(500, new { Error = "An error occurred while adding the payment record." });
            }
        }

        private int GetUserIdFromToken()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (claim == null || string.IsNullOrEmpty(claim.Value))
            {
                _logger.LogWarning("User ID claim not found in token");
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            if (!int.TryParse(claim.Value, out int userId))
            {
                _logger.LogWarning("Invalid user ID format in token: {ClaimValue}", claim.Value);
                throw new UnauthorizedAccessException("Invalid user ID format in token");
            }

            return userId;
        }
    }

    public class PaymentRequest
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
        public decimal Amount { get; set; }
    }
}