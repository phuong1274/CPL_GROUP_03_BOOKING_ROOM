using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using BookingRoom.Server.Repositories.Interfaces;

namespace BookingRoom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(IAuthService authService, IUnitOfWork unitOfWork)
        {
            _authService = authService;
            _unitOfWork = unitOfWork;
        }

        //====================================================================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                return BadRequest(errors);
            }

            try
            {
                var user = await _unitOfWork.Users.GetByEmailOrUsernameAsync(loginDTO.login);
                if (user == null)
                {
                    return BadRequest(new { login = "Invalid username or email" });
                }

                var token = await _authService.LoginAsync(loginDTO);
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { password = "Incorrect password" });
                }

                return Ok(new
                {
                    token,
                    user = new
                    {
                        user.Username,
                        user.Email,
                        user.FullName,
                        user.Role,
                        user.PhoneNumber,
                        user.Points
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
        }

        //====================================================================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                return BadRequest(errors);
            }

            try
            {
                var existingUser = await _unitOfWork.Users.GetByEmailOrUsernameAsync(registerDTO.username);
                if (existingUser != null)
                {
                    return BadRequest(new { username = "Username is already taken" });
                }

                var existingEmail = await _unitOfWork.Users.GetByEmailOrUsernameAsync(registerDTO.email);
                if (existingEmail != null)
                {
                    return BadRequest(new { email = "Email is already registered" });
                }

                var token = await _authService.RegisterAsync(registerDTO);
                var user = await _unitOfWork.Users.GetByEmailOrUsernameAsync(registerDTO.username);

                if (user == null)
                {
                    return StatusCode(500, new { Error = "User registration failed" });
                }

                return Ok(new
                {
                    token,
                    user = new
                    {
                        user.Username,
                        user.Email,
                        user.FullName,
                        user.Role,
                        user.PhoneNumber,
                        user.Points
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
        }
    }
}