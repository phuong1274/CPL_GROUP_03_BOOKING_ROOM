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
            return GenerateJwtToken(user);
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

            // Cập nhật link để trỏ về /reset-password với query parameter token
            var resetLink = $"https://localhost:5173/reset-password?token={resetToken}";
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
            // Hard-code các giá trị từ EmailSettings
            var smtpServer = "smtp.gmail.com";
            var port = 587;
            var senderEmail = "huynvhe182260@fpt.edu.vn";
            var senderPassword = "fera yskb wocr jpmm";

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = port,
                Credentials = new System.Net.NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, "Hotel Booking Team"),
                Subject = "Password Reset Request",
                Body = $@"
    <html>
        <body style='font-family: Arial, sans-serif; color: #333;'>
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password for Hotel Booking.</p>
            <p>Click the button below to reset your password:</p>
            <a href='{resetLink}' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>Hotel Booking Team</p>
        </body>
    </html>",
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

    }
}