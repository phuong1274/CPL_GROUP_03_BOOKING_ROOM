namespace BookingRoom.Server.DTOs
{
    public class RevenueReportDTO
    {
        public string Period { get; set; } 
        public decimal TotalRevenue { get; set; }
        public int BookingCount { get; set; }
    }
}