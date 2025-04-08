using BookingRoom.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace BookingRoom.Server.Repositories
{
    public class RoomTypeRepository : IRoomTypeRepository
    {
        private readonly HotelBookingDbContext _context;

        public RoomTypeRepository(HotelBookingDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoomType>> GetAllRoomTypesAsync()
        {
            return await _context.RoomTypes.ToListAsync();
        }

        public async Task<RoomType> GetRoomTypeByIdAsync(int roomTypeId)
        {
            return await _context.RoomTypes.FindAsync(roomTypeId);
        }

        public async Task AddRoomTypeAsync(RoomType roomType)
        {
            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRoomTypeAsync(RoomType roomType)
        {
            _context.RoomTypes.Update(roomType);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRoomTypeAsync(int roomTypeId)
        {
            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType != null)
            {
                _context.RoomTypes.Remove(roomType);
                await _context.SaveChangesAsync();
            }
        }
    }
}