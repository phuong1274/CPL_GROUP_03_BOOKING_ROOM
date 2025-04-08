using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using BookingRoom.Server.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using System.Net.Mail;

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