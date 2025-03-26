using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class RoomMedium
{
    public int MediaId { get; set; }

    public int? RoomId { get; set; }

    public string? MediaLink { get; set; }

    public string? Description { get; set; }

    public string? MediaType { get; set; }

    public virtual Room? Room { get; set; }
}
