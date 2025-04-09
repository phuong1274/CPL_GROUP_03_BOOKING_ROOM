namespace BookingRoom.Server.DTOs
{
    public class BookingDTO
    {
        public int BookingID { get; set; }
        public int UserID { get; set; }
        public int RoomID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string? BookingStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
