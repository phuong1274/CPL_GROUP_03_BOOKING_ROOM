using BookingRoom.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace BookingRoom.Server.Repositories
{
    public class RoomMediaRepository : IRoomMediaRepository
    {
        private readonly HotelBookingDbContext _context;

        public RoomMediaRepository(HotelBookingDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoomMedium>> GetMediaByRoomIdAsync(int roomId)
        {
            return await _context.RoomMedia
                .Where(m => m.RoomId == roomId)
                .ToListAsync();
        }
        public async Task DeleteMediaByRoomIdAsync(int roomId)
        {
            var mediaList = await _context.RoomMedia
                .Where(m => m.RoomId == roomId)
                .ToListAsync();

            _context.RoomMedia.RemoveRange(mediaList);
            // Note: SaveChangesAsync should be called by UnitOfWork, not here
        }
        public async Task<RoomMedium> GetMediaByIdAsync(int mediaId)
        {
            return await _context.RoomMedia.FindAsync(mediaId);
        }

        public async Task AddMediaAsync(RoomMedium media)
        {
            _context.RoomMedia.Add(media);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMediaAsync(int mediaId)
        {
            var media = await _context.RoomMedia.FindAsync(mediaId);
            if (media != null)
            {
                _context.RoomMedia.Remove(media);
                await _context.SaveChangesAsync();
            }
        }
    }
}