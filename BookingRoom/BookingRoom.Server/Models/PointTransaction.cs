using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class PointTransaction
{
    public int TransactionId { get; set; }

    public int UserId { get; set; }

    public int? BookingId { get; set; }

    public int Points { get; set; }

    public string TransactionType { get; set; } = null!;

    public DateTime? TransactionDate { get; set; }

    public string? Description { get; set; }

    public virtual User User { get; set; } = null!;
}
