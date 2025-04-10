using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Models;
namespace BookingRoom.Server.Controllers
{
    [Authorize(Roles = "Customer")]
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerRoomController : ControllerBase
    {
        private readonly IRoomService _service;
        private readonly ILogger<BookingController> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRoomMediaService _roomMediaService;

        public CustomerRoomController(IUnitOfWork unitOfWork, IRoomMediaService roomMediaService, ILogger<BookingController> logger, IRoomService service)
        {
            _unitOfWork = unitOfWork;
            _service = service;
            _logger = logger;
            _roomMediaService = roomMediaService;
        }


        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="status"></param>
        /// <param name="roomTypeId"></param>
        /// <param name="date"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetRooms(
        [FromQuery] string? status = null,
        [FromQuery] int? roomTypeId = null,
        [FromQuery] DateTime? date = null)
        {
            try
            {
                var rooms = await _unitOfWork.Rooms.GetAllRoomsAsync();

                string statusToFilter = string.IsNullOrEmpty(status) ? "Available" : status;
                rooms = rooms.Where(r => r.Status != null && r.Status.Equals(statusToFilter, StringComparison.OrdinalIgnoreCase)).ToList();

                if (roomTypeId.HasValue)
                {
                    rooms = rooms.Where(r => r.RoomTypeId == roomTypeId.Value).ToList();
                }

                if (date.HasValue)
                {
                    var targetDateOnly = DateOnly.FromDateTime(date.Value);

                    rooms = rooms.Where(r =>
                        (!r.StartDate.HasValue || r.StartDate.Value <= targetDateOnly) &&
                        (!r.EndDate.HasValue || r.EndDate.Value >= targetDateOnly)
                    ).ToList();
                }


                if (!rooms.Any())
                {
                    return NotFound(new { error = "No available rooms found for the selected date." });
                }

                var roomDTOs = new List<RoomDTO>();

                foreach (var room in rooms)
                {
                    var media = await _unitOfWork.RoomMedia.GetMediaByRoomIdAsync(room.RoomId);
                    var mediaDTOs = media.Select(m => new RoomMediaDTO
                    {
                        MediaID = m.MediaId,
                        RoomID = m.RoomId.GetValueOrDefault(),
                        Media_Link = m.MediaLink,
                        Description = m.Description,
                        MediaType = m.MediaType
                    }).ToList();

                    roomDTOs.Add(new RoomDTO
                    {
                        RoomID = room.RoomId,
                        RoomNumber = room.RoomNumber,
                        RoomTypeID = room.RoomTypeId.GetValueOrDefault(),
                        RoomTypeName = room.RoomType?.RoomTypeName,
                        StartDate = room.StartDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue,
                        EndDate = room.EndDate?.ToDateTime(TimeOnly.MaxValue) ?? DateTime.MaxValue,
                        Status = room.Status,
                        Media = mediaDTOs,
                        Description = room.Descriptions
                    });
                }

                return Ok(roomDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rooms.");
                return StatusCode(500, new { error = $"Error retrieving rooms: {ex.Message}" });
            }
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("roomtype/{id}")]
        public async Task<IActionResult> GetRoomType(int id)
        {
            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }
            var roomTypeDTO = new RoomTypeDTO
            {
                RoomTypeID = roomType.RoomTypeId,
                RoomTypeName = roomType.RoomTypeName,
                Description = roomType.Description,
                Price = roomType.Price.GetValueOrDefault(),
                ValidDate = roomType.ValidDate ?? DateTime.MinValue
            };
            return Ok(roomTypeDTO);
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet("roomtype")]
        public async Task<IActionResult> GetRoomTypes()
        {
            try
            {
                var roomTypes = await _unitOfWork.RoomTypes.GetAllRoomTypesAsync();

                if (roomTypes == null)
                {
                    return Ok(new List<RoomTypeDTO>());
                }

                var roomTypeDTOs = roomTypes.Select(rt => new RoomTypeDTO
                {
                    RoomTypeID = rt.RoomTypeId,
                    RoomTypeName = rt.RoomTypeName,
                    Description = rt.Description,
                    Price = rt.Price.GetValueOrDefault(),
                    ValidDate = rt.ValidDate ?? DateTime.MinValue
                }).ToList();

                return Ok(roomTypeDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error retrieving room types: {ex.Message}" });
            }
        }

        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetMediaByRoomId(int roomId)
        {
            var media = await _roomMediaService.GetMediaByRoomIdAsync(roomId);
            return Ok(media);
        }


        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost("book")]
        public async Task<IActionResult> BookRoom([FromBody] BookingDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { error = "User not authenticated." });
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest(new { error = "Invalid user ID format." });
                }


                // Get room
                var room = await _unitOfWork.Rooms.GetRoomByIdAsync(dto.RoomID);
                if (room == null)
                {
                    return NotFound(new { error = "Room not found." });
                }

                // Get RoomType price
                var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(room.RoomTypeId ?? 0);
                if (roomType == null)
                {
                    return NotFound(new { error = "Room type not found." });
                }

                // Create booking with default 1-night stay
                var checkInDate = dto.CheckInDate;
                var checkOutDate = checkInDate.AddDays(1); 
                decimal pricePerDay = roomType.Price ?? 0;
                decimal totalAmount = pricePerDay; // For 1 night

                var newBooking = new Booking
                {
                    UserId = userId,
                    RoomId = dto.RoomID,
                    CheckInDate = checkInDate,
                    CheckOutDate = checkOutDate,
                    BookingStatus = "Pending",
                    TotalAmount = totalAmount,
                    UpdatedAt = DateTime.Now
                };

                await _unitOfWork.Bookings.AddAsync(newBooking);
                await _service.UpdateRoomStatusAsync(dto.RoomID, "Booked");
                await _unitOfWork.SaveChangesAsync();

                return Ok(new
                {
                    message = "Room booked successfully.",
                    bookingId = newBooking.BookingId,
                    checkInDate = checkInDate.ToString("yyyy-MM-dd"),
                    checkOutDate = checkOutDate.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while booking room.");
                return StatusCode(500, new { error = "Internal server error while booking room." });
            }
        }

    }
}
