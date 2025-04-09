using BookingRoom.Server.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IRoomTypeService
    {
        Task<List<RoomTypeDTO>> GetAllRoomTypesAsync();
        Task<RoomTypeDTO> GetRoomTypeByIdAsync(int roomTypeId);
        Task<RoomTypeDTO> AddRoomTypeAsync(RoomTypeDTO roomTypeDTO);
        Task UpdateRoomTypeAsync(int roomTypeId, RoomTypeDTO roomTypeDTO);
        Task DeleteRoomTypeAsync(int roomTypeId);
    }
}