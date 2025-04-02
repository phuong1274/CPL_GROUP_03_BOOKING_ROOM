using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string search = "",
            [FromQuery] string role = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var usersQuery = _unitOfWork.Users.GetAll();

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    usersQuery = usersQuery.Where(u =>
                        u.Username.ToLower().Contains(search) ||
                        u.PhoneNumber.ToLower().Contains(search) ||
                        u.Role.ToLower().Contains(search)||
                        u.Email.ToLower().Contains(search));
                }

                if (!string.IsNullOrEmpty(role))
                {
                    usersQuery = usersQuery.Where(u => u.Role.ToLower() == role.ToLower());
                }

                var totalRecords = usersQuery.Count();

                var users = usersQuery
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new UserDTO
                    {
                        Id = u.UserId,
                        Username = u.Username,
                        Email = u.Email,
                        FullName = u.FullName,
                        PhoneNumber = u.PhoneNumber,
                        Role = u.Role,
                        Points = u.Points,
                        Status = u.Status,
                        CreateAt = u.CreateAt
                    })
                    .ToList();

                return Ok(new
                {
                    TotalRecords = totalRecords,
                    Page = page,
                    PageSize = pageSize,
                    Users = users
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
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

        //==============================================================================================================

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] StatusDTO statusDTO)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { error = "User not found" });
                }

                user.Status = statusDTO.Status;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                return Ok(new
                {
                    message = "User status updated successfully",
                    username = user.Username,
                    status = user.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred", details = ex.Message });
            }
        }
    }

}