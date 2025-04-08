using BookingRoom.Server.Models;

namespace BookingRoom.Server.Repositories
{
    public interface IRoomTypeRepository
    {
        Task<List<RoomType>> GetAllRoomTypesAsync();
        Task<RoomType> GetRoomTypeByIdAsync(int roomTypeId);
        Task AddRoomTypeAsync(RoomType roomType);
        Task UpdateRoomTypeAsync(RoomType roomType);
        Task DeleteRoomTypeAsync(int roomTypeId);
    }
}