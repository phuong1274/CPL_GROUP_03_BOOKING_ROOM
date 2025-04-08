using System.ComponentModel.DataAnnotations;

namespace BookingRoom.Server.DTOs
{
    public class RoomMediaDTO
    {
        public int MediaID { get; set; }

        [Required(ErrorMessage = "Room ID is required")]
        public int RoomID { get; set; }

        [Required(ErrorMessage = "Media link is required")]
        public string Media_Link { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Media type is required")]
        public string MediaType { get; set; } = "Image";
    }
}