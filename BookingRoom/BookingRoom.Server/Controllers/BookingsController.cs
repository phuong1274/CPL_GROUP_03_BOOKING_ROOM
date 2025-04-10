using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BookingRoom.Server.Repositories.Interfaces;

namespace BookingRoom.Server.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _service;
        private readonly ILogger<BookingController> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public BookingController(IUnitOfWork unitOfWork, ILogger<BookingController> logger, IBookingService service)
        {
            _unitOfWork = unitOfWork;
            _service = service;
            _logger = logger;
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="roomNumber"></param>
        /// <param name="username"></param>
        /// <param name="checkInDate"></param>
        /// <param name="checkOutDate"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetBookings(
             [FromQuery] int page = 1,
             [FromQuery] int pageSize = 30,
             [FromQuery] string? roomNumber = null,
             [FromQuery] string? username = null,
             [FromQuery] DateTime? checkInDate = null,
             [FromQuery] DateTime? checkOutDate = null,
             [FromQuery] string? status = null)
        {
            try
            {
                var bookingsQuery = _unitOfWork.Bookings.GetQuery();
                var roomQuery = _unitOfWork.Rooms.GetQuery();
                var userQuery = _unitOfWork.Users.GetAll();

                // Filter by Room Number
                if (!string.IsNullOrWhiteSpace(roomNumber))
                {
                    bookingsQuery = from b in bookingsQuery
                                    join r in roomQuery on b.RoomId equals r.RoomId
                                    where r.RoomNumber.Contains(roomNumber)
                                    select b;
                }

                // Filter by Username
                if (!string.IsNullOrWhiteSpace(username))
                {
                    bookingsQuery = from b in bookingsQuery
                                    join u in userQuery on b.UserId equals u.UserId
                                    where u.Username.Contains(username)
                                    select b;
                }

                // Filter by Check-In Date
                if (checkInDate.HasValue)
                {
                    bookingsQuery = bookingsQuery.Where(b => b.CheckInDate.HasValue && b.CheckInDate.Value.Date == checkInDate.Value.Date);
                }

                // Filter by Check-Out Date
                if (checkOutDate.HasValue)
                {
                    bookingsQuery = bookingsQuery.Where(b => b.CheckOutDate.HasValue && b.CheckOutDate.Value.Date == checkOutDate.Value.Date);
                }

                // Filter by Booking Status
                if (!string.IsNullOrWhiteSpace(status))
                {
                    bookingsQuery = bookingsQuery.Where(b => b.BookingStatus == status);
                }

                // Count total records
                var totalRecords = bookingsQuery.Count();

                // Paging and Projection
                var bookings = bookingsQuery
                    .OrderByDescending(b => b.UpdatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(b => new BookingDTO
                    {
                        BookingID = b.BookingId,
                        UserID = b.UserId ?? 0,
                        RoomID = b.RoomId ?? 0,
                        CheckInDate = b.CheckInDate ?? DateTime.MinValue,
                        CheckOutDate = b.CheckOutDate ?? DateTime.MinValue,
                        BookingStatus = b.BookingStatus,
                        TotalAmount = b.TotalAmount ?? 0,
                        UpdatedAt = b.UpdatedAt
                       
                    })
                    .ToList();

                return Ok(new
                {
                    TotalRecords = totalRecords,
                    Page = page,
                    PageSize = pageSize,
                    Bookings = bookings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching bookings.");
                return StatusCode(500, new { Error = "An error occurred while fetching bookings.", Details = ex.Message });
            }
        }


        //==============================================================================================================
        /// <summary>
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/checkin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CheckIn(int id)
        {
            try
            {
                var (success, message) = await _service.CheckInAsync(id);

                if (!success)
                {
                    _logger.LogWarning("Check-in failed for booking {BookingId}: {Message}", id, message);

                    
                    var errorResponse = new
                    {
                        success = false,
                        message = message,
                        error = new
                        {
                            code = GetErrorCode(message),
                            details = message,
                          
                            metadata = GetErrorMetadata(message, id)
                        }
                    };

                    return BadRequest(errorResponse);
                }

               
                return Ok(new
                {
                    success = true,
                    message = message,
                    data = new
                    {
                        bookingId = id,
                        status = "Confirmed",
                        checkInDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "System error during check-in for booking {BookingId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "A system error occurred during check-in",
                    error = new
                    {
                        code = "SYSTEM_ERROR",
                        details = "Please try again later or contact support",
                        timestamp = DateTime.UtcNow.ToString("o")
                    }
                });
            }
        }

       
        private static string GetErrorCode(string message)
        {
            return message switch
            {
                string s when s.Contains("Booking not found") => "BOOKING_NOT_FOUND",
                string s when s.Contains("Cannot check-in") => "INVALID_STATUS",
                string s when s.Contains("no check-in date") => "MISSING_CHECKIN_DATE",
                string s when s.Contains("only allowed on or after") => "EARLY_CHECKIN",
                string s when s.Contains("only allowed within 2 days") => "LATE_CHECKIN",
                _ => "CHECKIN_FAILED"
            };
        }

       
        private static object GetErrorMetadata(string message, int bookingId)
        {
            if (message.Contains("only allowed on or after") || message.Contains("only allowed within 2 days"))
            {
                return new
                {
                    bookingId,
                    suggestedAction = "Please verify your check-in date",
                    supportContact = "support@hotel.com"
                };
            }

            return new
            {
                bookingId,
                timestamp = DateTime.UtcNow.ToString("o")
            };
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/checkout")]
        public async Task<IActionResult> CheckOut(int id)
        {
            try
            {
                var result = await _service.CheckOutAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Failed to check out booking {BookingId}: Invalid status", id);
                    return BadRequest(new { Error = "Invalid status for check-out" });
                }
                return Ok(new { Message = "Checked out and paid successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking out booking {BookingId}", id);
                return StatusCode(500, new { Error = "Failed to check out booking", Details = ex.Message });
            }
        }


    }
}