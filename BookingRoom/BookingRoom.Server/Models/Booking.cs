using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int? UserId { get; set; }

    public int? RoomId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? CheckInDate { get; set; }

    public DateTime? CheckOutDate { get; set; }

    public string? BookingStatus { get; set; }

    public decimal? TotalAmount { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? StaffId { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Room? Room { get; set; }

    public virtual User? Staff { get; set; }

    public virtual User? User { get; set; }
}
