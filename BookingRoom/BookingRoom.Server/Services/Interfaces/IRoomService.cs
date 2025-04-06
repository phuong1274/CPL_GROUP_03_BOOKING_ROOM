using BookingRoom.Server.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services.Interfaces
{
    public interface IRoomService
    {
        Task<List<RoomDTO>> GetAllRoomsAsync();
        Task<RoomDTO> GetRoomByIdAsync(int roomId);
        Task<RoomDTO> AddRoomAsync(RoomDTO roomDTO);
        Task UpdateRoomAsync(int roomId, RoomDTO roomDTO);
        Task DeleteRoomAsync(int roomId);
    }
}