using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories
{
    public interface IRoomRepository
    {
        Task<List<Room>> GetAllRoomsAsync();
        Task<Room?> GetRoomByIdAsync(int roomId);
        Task<Room> AddRoomAsync(Room room);
        Task UpdateRoomAsync(Room room);
        Task DeleteRoomAsync(int roomId);
        Task<Room?> GetRoomByNumberAsync(string roomNumber);
        IQueryable<Room> GetQuery();
    }
}