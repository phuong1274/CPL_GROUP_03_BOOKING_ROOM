using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories
{
    public interface IRoomMediaRepository
    {
        Task<List<RoomMedium>> GetMediaByRoomIdAsync(int roomId);
        Task<RoomMedium> GetMediaByIdAsync(int mediaId);
        Task AddMediaAsync(RoomMedium media);
        Task DeleteMediaAsync(int mediaId);
    }
}