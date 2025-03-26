using System;
using System.Collections.Generic;

namespace BookingRoom.Server.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int? BookingId { get; set; }

    public string? PaymentType { get; set; }

    public DateOnly? PaymentDate { get; set; }

    public decimal? TotalPrice { get; set; }

    public string? PaymentStatus { get; set; }

    public virtual Booking? Booking { get; set; }
}
