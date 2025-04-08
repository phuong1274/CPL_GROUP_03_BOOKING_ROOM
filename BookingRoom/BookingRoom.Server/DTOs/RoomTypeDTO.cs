using System.ComponentModel.DataAnnotations;

namespace BookingRoom.Server.DTOs
{
    public class RoomTypeDTO
    {
        public int RoomTypeID { get; set; }

        [Required(ErrorMessage = "Room type name is required")]
        public string RoomTypeName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be a positive number")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Valid date is required")]
        public DateTime ValidDate { get; set; }
    }
}