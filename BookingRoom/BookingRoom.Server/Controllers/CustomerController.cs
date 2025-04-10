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
    [Route("api/customer/users")]
    [Authorize(Roles = "Customer")]
    public class CustomerController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CustomerController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

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
    }

}