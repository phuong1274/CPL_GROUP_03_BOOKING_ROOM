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
using BCrypt.Net;
using System.Net.Mail;
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
                Status = registerDTO.status ?? " Active",
                Points = 0
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
            {
                throw new Exception("User with this email does not exist.");
            }

            var resetToken = Guid.NewGuid().ToString();
            user.Token = resetToken;
            user.TokenExpiry = DateTime.Now.AddHours(1);
            await _unitOfWork.SaveChangesAsync();

            // Cập nhật link để trỏ về /login với query parameter token
            var resetLink = $"https://localhost:5173/login?token={resetToken}";
            await SendResetEmail(email, resetLink);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _unitOfWork.Users.GetAllAsync();
            var matchingUser = user.FirstOrDefault(u => u.Token == token && u.TokenExpiry > DateTime.Now);
            if (matchingUser == null)
            {
                throw new Exception("Invalid or expired reset token.");
            }

            matchingUser.PasswordHash = HashPassword(newPassword);
            matchingUser.Token = null;
            matchingUser.TokenExpiry = null;
            await _unitOfWork.SaveChangesAsync();
        }
        private async Task SendResetEmail(string email, string resetLink)
        {
            // Lấy thông tin từ appsettings.json
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"]);
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderPassword = _configuration["EmailSettings:SenderPassword"];



            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = port,
                Credentials = new System.Net.NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, "Hotel Booking"),
                Subject = "Password Reset Request",
                Body = $"Click the link to reset your password: <a href='{resetLink}'>Reset Password</a>",
                IsBodyHtml = true,
            };
            mailMessage.To.Add(email);

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (SmtpException ex)
            {
                throw new Exception($"Failed to send email: {ex.Message}, StatusCode: {ex.StatusCode}");
            }
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
                 new Claim("id", user.UserId.ToString()),
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
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || !VerifyPassword(oldPassword, user.PasswordHash))
            {
                throw new Exception("Invalid old password.");
            }
            user.PasswordHash = HashPassword(newPassword);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<object> UpdateProfileAsync(int userId, UpdateProfileDTO profileDTO)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            user.FullName = profileDTO.FullName;
            user.PhoneNumber = profileDTO.PhoneNumber;
            user.Email = profileDTO.Email;
            await _unitOfWork.SaveChangesAsync();

            return new
            {
                username = user.Username,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                email = user.Email
            };
        }
    }
}