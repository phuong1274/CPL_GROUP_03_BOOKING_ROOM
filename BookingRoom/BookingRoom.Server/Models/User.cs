using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? Username { get; set; }

    public string? PasswordHash { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string? Token { get; set; }

    public DateTime? TokenExpiry { get; set; }

    public DateTime? CreateAt { get; set; }

    public string? FullName { get; set; }

    public int? Points { get; set; }

    public string? Role { get; set; }

    public virtual ICollection<Booking> BookingStaffs { get; set; } = new List<Booking>();

    public virtual ICollection<Booking> BookingUsers { get; set; } = new List<Booking>();

    public virtual ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
}
