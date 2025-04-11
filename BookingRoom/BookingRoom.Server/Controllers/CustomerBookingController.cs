using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;

namespace BookingRoom.Server.Controllers
{
    [Authorize(Roles = "Customer")]
    [ApiController]
    [Route("api/customer/booking")]
    

    public class CustomerBookingController : ControllerBase
    {
        private readonly IBookingService _service;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerBookingController> _logger;

        public CustomerBookingController(
            IBookingService service,
            IUnitOfWork unitOfWork,
            ILogger<CustomerBookingController> logger)
        {
            _service = service;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="checkInDate"></param>
        /// <param name="checkOutDate"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetMyBookings(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] DateTime? checkInDate = null,
            [FromQuery] DateTime? checkOutDate = null,
            [FromQuery] string? status = null)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Failed to retrieve user ID from claims.");
                    return Unauthorized(new { Error = "Unable to identify user." });
                }

                var bookingsQuery = _unitOfWork.Bookings.GetQuery();
                var roomQuery = _unitOfWork.Rooms.GetQuery();

                // Filter by the authenticated user's ID
                bookingsQuery = bookingsQuery.Where(b => b.UserId == userId);

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
                        CreatedAt = b.CreatedAt ?? DateTime.MinValue,
                        CheckInDate = b.CheckInDate ?? DateTime.MinValue,
                        CheckOutDate = b.CheckOutDate ?? DateTime.MinValue,
                        BookingStatus = b.BookingStatus,
                        TotalAmount = b.TotalAmount ?? 0,
                        UpdatedAt = b.UpdatedAt,
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
                _logger.LogError(ex, "Error while fetching customer's bookings.");
                return StatusCode(500, new { Error = "An error occurred while fetching your bookings.", Details = ex.Message });
            }
        }


        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            try
            {
                var result = await _service.CancelBookingAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Failed to cancel booking {BookingId}: Invalid status", id);
                    return BadRequest(new { Error = "Invalid status for cancellation" });
                }
                return Ok(new { Message = "Booking cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking {BookingId}. Details: {Message}", id, ex.Message);
                return StatusCode(500, new { Error = "Failed to cancel booking", Details = ex.Message });
            }
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoom(int id)
        {
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            var media = await _unitOfWork.RoomMedia.GetMediaByRoomIdAsync(id);
            var mediaDTOs = media.Select(m => new RoomMediaDTO
            {
                MediaID = m.MediaId,
                RoomID = m.RoomId.GetValueOrDefault(),
                Media_Link = m.MediaLink,
                Description = m.Description,
                MediaType = m.MediaType
            }).ToList();

            var roomDTO = new RoomDTO
            {
                RoomID = room.RoomId,
                RoomNumber = room.RoomNumber,
                RoomTypeID = room.RoomTypeId.GetValueOrDefault(),
                RoomTypeName = room.RoomType?.RoomTypeName,
                StartDate = room.StartDate.Value.ToDateTime(TimeOnly.MinValue),
                EndDate = room.EndDate.Value.ToDateTime(TimeOnly.MaxValue),
                Status = room.Status,
                Media = mediaDTOs
            };
            return Ok(roomDTO);
        }


    }
}