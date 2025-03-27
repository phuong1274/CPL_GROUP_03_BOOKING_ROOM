using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using BookingRoom.Server.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

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

        public async Task<string> LoginAsync(LoginDTO loginDTO)
        {
            Console.WriteLine($"Backend - Received login data: Login={loginDTO.Login}, Password={loginDTO.Password}");
            var user = await _unitOfWork.Users.GetByEmailOrUsernameAsync(loginDTO.Login);
            if (user == null || user.PasswordHash == null || !VerifyPassword(loginDTO.Password, user.PasswordHash))
            {
                Console.WriteLine($"Backend - User lookup result: Username={(user != null ? user.Username : "null")}, Email={(user != null ? user.Email : "null")}, PasswordHash={(user != null ? user.PasswordHash : "null")}");
                throw new Exception("Invalid login credentials");
            }
            Console.WriteLine($"Backend - Login successful for user: {user.Username}");
            return GenerateJwtToken(user);
        }

        public async Task RegisterAsync(RegisterDTO registerDTO)
        {
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(registerDTO.Email);
            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            var user = new User
            {
                Username = registerDTO.Username,
                Email = registerDTO.Email,
                PasswordHash = HashPassword(registerDTO.Password),
                FullName = registerDTO.FullName,
                PhoneNumber = registerDTO.PhoneNumber,
                Role = "Customer"
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            bool result = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            Console.WriteLine($"Backend - VerifyPassword result: Password={password}, HashedPassword={hashedPassword}, Match={result}");
            return result;
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
            };

            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                throw new InvalidOperationException("JWT configuration is missing or invalid. Please check Jwt:Key, Jwt:Issuer, and Jwt:Audience in appsettings.json.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}