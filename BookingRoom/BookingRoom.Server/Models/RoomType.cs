using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class RoomType
{
    public int RoomTypeId { get; set; }

    public string? RoomTypeName { get; set; }

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public DateTime? ValidDate { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
