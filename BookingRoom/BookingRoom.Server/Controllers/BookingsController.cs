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



        [HttpPut("{id}/checkin")]
        public async Task<IActionResult> CheckIn(int id)
        {
            try
            {
                
                var result = await _service.CheckInAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Failed to check in booking {BookingId}: Invalid status", id);
                    return BadRequest(new { Error = "Invalid status for check-in" });
                }
                return Ok(new { Message = "Checked in successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking in booking {BookingId}", id);
                return StatusCode(500, new { Error = "Failed to check in booking" });
            }
        }

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
                return StatusCode(500, new { Error = "Failed to check out booking" });
            }
        }

       
    }
}