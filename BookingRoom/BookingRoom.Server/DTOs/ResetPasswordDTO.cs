﻿namespace BookingRoom.Server.DTOs
{
    public class ResetPasswordDTO
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
