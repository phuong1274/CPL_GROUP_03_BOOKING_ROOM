using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookingRoom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            try
            {
                var token = await _authService.LoginAsync(loginDTO);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            try
            {
                await _authService.RegisterAsync(registerDTO);
                return Ok(new { Message = "Registration successful" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}

    
