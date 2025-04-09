using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class Room
{
    public int RoomId { get; set; }

    public string? RoomNumber { get; set; }

    public int? RoomTypeId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? Status { get; set; }

    public string? Descriptions { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<RoomMedium> RoomMedia { get; set; } = new List<RoomMedium>();

    public virtual RoomType? RoomType { get; set; }
}
