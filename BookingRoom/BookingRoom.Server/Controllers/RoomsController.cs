using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoomController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RoomController> _logger;

        public RoomController(ILogger<RoomController> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetRooms(
                [FromQuery] string? roomNumber = null,
                [FromQuery] string? status = null,
                [FromQuery] int? roomTypeId = null)
        {
            try
            {
                var rooms = await _unitOfWork.Rooms.GetAllRoomsAsync();

                if (!string.IsNullOrWhiteSpace(roomNumber))
                {
                    roomNumber = roomNumber.Trim().ToLower();
                    rooms = rooms.Where(r => r.RoomNumber != null && r.RoomNumber.ToLower().Contains(roomNumber)).ToList();
                }
                if (!string.IsNullOrWhiteSpace(status))
                {
                    status = status.Trim().ToLower();
                    rooms = rooms.Where(r => r.Status != null && r.Status.ToLower() == status).ToList();
                }

                if (roomTypeId.HasValue)
                {
                    rooms = rooms.Where(r => r.RoomTypeId == roomTypeId.Value).ToList();
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
                        StartDate = room.StartDate.Value.ToDateTime(TimeOnly.MinValue),
                        EndDate = room.EndDate.Value.ToDateTime(TimeOnly.MaxValue),
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
                Media = mediaDTOs,
                Description = room.Descriptions
            };
            return Ok(roomDTO);
        }

        [HttpPost]
        public async Task<IActionResult> AddRoom([FromBody] RoomDTO roomDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (roomDTO.EndDate < roomDTO.StartDate)
                {
                    return BadRequest(new { error = "End Date must be greater than or equal to Start Date." });
                }

                var existingRoom = await _unitOfWork.RoomRepository.GetRoomByNumberAsync(roomDTO.RoomNumber);
                _logger.LogInformation("Checking existing room with RoomNumber: {RoomNumber}, Found: {Found}", roomDTO.RoomNumber, existingRoom != null);
                if (existingRoom != null)
                {
                    return BadRequest(new { error = $"Room number '{roomDTO.RoomNumber}' already exists." });
                }

                var roomType = await _unitOfWork.RoomTypeRepository.GetRoomTypeByIdAsync(roomDTO.RoomTypeID);
                if (roomType == null)
                {
                    return BadRequest(new { error = $"Room Type ID '{roomDTO.RoomTypeID}' does not exist." });
                }

                var room = new Room
                {
                    RoomNumber = roomDTO.RoomNumber,
                    RoomTypeId = roomDTO.RoomTypeID,
                    StartDate = DateOnly.FromDateTime(roomDTO.StartDate),
                    EndDate = DateOnly.FromDateTime(roomDTO.EndDate),
                    Status = roomDTO.Status,
                    Descriptions = roomDTO.Description
                };

                await _unitOfWork.RoomRepository.AddRoomAsync(room);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("New room added with RoomID: {RoomID}", room.RoomId);

                var createdRoomDTO = new RoomDTO
                {
                    RoomID = room.RoomId,
                    RoomNumber = room.RoomNumber,
                    RoomTypeID = room.RoomTypeId.GetValueOrDefault(),
                    StartDate = room.StartDate.Value.ToDateTime(TimeOnly.MinValue),
                    EndDate = room.EndDate.Value.ToDateTime(TimeOnly.MinValue),
                    Status = room.Status,
                    Description = room.Descriptions
                };

                return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, createdRoomDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding room to the database.");
                return StatusCode(500, $"Error adding room: {ex.Message}");
            }
        }




        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] RoomDTO roomDTO)
        {
            try
            {
                if (id != roomDTO.RoomID)
                {
                    return BadRequest("Room ID mismatch");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var room = await _unitOfWork.Rooms.GetRoomByIdAsync(id);
                if (room == null)
                {
                    return NotFound();
                }

                // Update properties
                room.RoomNumber = roomDTO.RoomNumber;
                room.RoomTypeId = roomDTO.RoomTypeID;
                room.Status = roomDTO.Status;
                room.Descriptions = roomDTO.Description;

                // Handle date conversion carefully
                if (roomDTO.StartDate != default)
                {
                    room.StartDate = DateOnly.FromDateTime(roomDTO.StartDate);
                }

                if (roomDTO.EndDate != default)
                {
                    room.EndDate = DateOnly.FromDateTime(roomDTO.EndDate);
                }

                await _unitOfWork.Rooms.UpdateRoomAsync(room);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            await _unitOfWork.Rooms.DeleteRoomAsync(id);
            return NoContent();
        }
    }
}