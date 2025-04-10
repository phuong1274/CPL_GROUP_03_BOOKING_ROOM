using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Controllers
{
    [ApiController]
    [Route("api/customer/users")]
    [Authorize(Roles = "Customer")]
    public class CustomerController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserService _userService;

        public CustomerController(
            IUnitOfWork unitOfWork,
            IUserService userService)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { Error = "User not found" });
                }

                var userDTO = new UserDTO
                {
                    Id = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role,
                    Points = user.Points,
                    Status = user.Status,
                    CreateAt = user.CreateAt
                };

                return Ok(userDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO updateProfileDTO)
        {
            try
            {
                var idClaim = User.FindFirst("id")?.Value;
                if (!int.TryParse(idClaim, out var userId))
                {
                    return Unauthorized(new { Error = "Invalid user ID in token" });
                }

                var updatedUser = await _userService.UpdateProfileAsync(userId, updateProfileDTO);
                return Ok(updatedUser); // Trả về object từ UserService
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

}