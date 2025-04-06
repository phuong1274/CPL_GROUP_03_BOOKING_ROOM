using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingRoom.Server.DTOs
{
    public class RoomDTO
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoomID { get; set; }


        [Required(ErrorMessage = "Room number is required")]
        public string RoomNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Room type is required")]
        public int RoomTypeID { get; set; }

        public string? RoomTypeName { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; } = "Available";

        public List<RoomMediaDTO> Media { get; set; } = new List<RoomMediaDTO>();
    }
}