using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<string?> LoginAsync(LoginDTO loginDTO)
        {
            var user = await _unitOfWork.Users.GetByEmailOrUsernameAsync(loginDTO.login);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.password, user.PasswordHash))
            {
                return null;
            }

            return GenerateJwtToken(user);
        }

        public async Task<string> RegisterAsync(RegisterDTO registerDTO)
        {
            var existingUser = await _unitOfWork.Users.GetByEmailOrUsernameAsync(registerDTO.username);
            if (existingUser != null)
            {
                throw new Exception("Username already exists");
            }

            existingUser = await _unitOfWork.Users.GetByEmailOrUsernameAsync(registerDTO.email);
            if (existingUser != null)
            {
                throw new Exception("Email already exists");
            }

            var user = new User
            {
                Username = registerDTO.username,
                Email = registerDTO.email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDTO.password),
                FullName = registerDTO.fullName,
                PhoneNumber = registerDTO.phoneNumber,
                Role = registerDTO.role ?? "Customer",
                Points = 0
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}