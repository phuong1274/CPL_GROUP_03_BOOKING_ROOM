using BookingRoom.Server.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services
{
    public interface IRoomMediaService
    {
        Task<List<RoomMediaDTO>> GetMediaByRoomIdAsync(int roomId);
        Task<RoomMediaDTO> AddMediaAsync(RoomMediaDTO mediaDTO);
        Task DeleteMediaAsync(int mediaId);
    }
}