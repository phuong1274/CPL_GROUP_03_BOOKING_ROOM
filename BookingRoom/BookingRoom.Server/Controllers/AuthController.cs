using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

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
        /// <summary>
        /// 
        /// </summary>
        /// <param name="loginDTO"></param>
        /// <returns></returns>
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
                Console.WriteLine($"Login input: {loginDTO.login}");
                var user = await _unitOfWork.Users.GetByEmailOrUsernameAsync(loginDTO.login);
                Console.WriteLine($"User found: {user?.Username}, Status: {user?.Status}");

                if (user == null)
                {
                    Console.WriteLine("User not found in database.");
                    return BadRequest(new { login = "Invalid username or email" });
                }

                if (string.Equals(user.Status, "Deactive", StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("User is Deactive.");
                    return StatusCode(403, new { error = "Your account has been deactivated. Please contact support." });
                }

                var token = await _authService.LoginAsync(loginDTO);
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("Token is null or empty - incorrect password.");
                    return BadRequest(new { password = "Incorrect password" });
                }

                Console.WriteLine("Login successful.");
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
                        user.Points,
                        user.Status
                    }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"UnauthorizedAccessException: {ex.Message}");
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
        }



        //====================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="registerDTO"></param>
        /// <returns></returns>

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
                        user.Points,
                        user.Status
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An internal error occurred", Details = ex.Message });
            }
        }

        
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {
            try
            {
                await _authService.ForgotPasswordAsync(forgotPasswordDTO.Email);
                return Ok("Reset link has been sent to your email.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDTO)
        {
            try
            {
                await _authService.ResetPasswordAsync(resetPasswordDTO.Token, resetPasswordDTO.NewPassword);
                return Ok("Password reset successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value);
                await _authService.ChangePasswordAsync(userId, changePasswordDTO.OldPassword, changePasswordDTO.NewPassword);
                return Ok("Password changed successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

         
    }
}


