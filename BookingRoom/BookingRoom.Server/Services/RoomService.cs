using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BookingRoom.Server.Services
{
    public class RoomService : IRoomService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoomService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<RoomDTO>> GetAllRoomsAsync()
        {
            var rooms = await _unitOfWork.Rooms.GetAllRoomsAsync();
            return rooms.Select(r => new RoomDTO
            {
                RoomID = r.RoomId,
                RoomNumber = r.RoomNumber,
                RoomTypeID = r.RoomTypeId.GetValueOrDefault(),
                RoomTypeName = r.RoomType?.RoomTypeName,
                StartDate = r.StartDate.Value.ToDateTime(TimeOnly.MinValue),
                EndDate = r.EndDate.Value.ToDateTime(TimeOnly.MaxValue),
                Status = r.Status,
                Description = r.Descriptions,
            }).ToList();
        }

        public async Task<RoomDTO> GetRoomByIdAsync(int roomId)
        {
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(roomId);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {roomId} not found.");
            }

            var media = await _unitOfWork.RoomMedia.GetMediaByRoomIdAsync(roomId);
            var mediaDTOs = media.Select(m => new RoomMediaDTO
            {
                MediaID = m.MediaId,
                RoomID = m.RoomId.GetValueOrDefault(),
                Media_Link = m.MediaLink,
                Description = m.Description,
                MediaType = m.MediaType
            }).ToList();

            return new RoomDTO
            {
                RoomID = room.RoomId,
                RoomNumber = room.RoomNumber,
                RoomTypeID = room.RoomTypeId.GetValueOrDefault(),
                RoomTypeName = room.RoomType?.RoomTypeName,
                StartDate = room.StartDate.Value.ToDateTime(TimeOnly.MinValue),
                EndDate = room.EndDate.Value.ToDateTime(TimeOnly.MaxValue),
                Status = room.Status,
                Media = mediaDTOs,
                Description = room.Descriptions,
            };
        }

        public async Task<RoomDTO> AddRoomAsync(RoomDTO roomDTO)
        {
            var room = new Room
            {
                RoomNumber = roomDTO.RoomNumber,
                RoomTypeId = roomDTO.RoomTypeID,
                StartDate = DateOnly.FromDateTime(roomDTO.StartDate),
                EndDate = DateOnly.FromDateTime(roomDTO.EndDate),
                Status = roomDTO.Status,
                Descriptions = roomDTO.Description,
            };

            await _unitOfWork.RoomRepository.AddRoomAsync(room);
            
            await _unitOfWork.SaveChangesAsync();

            return new RoomDTO
            {
                RoomID = room.RoomId,
                RoomNumber = room.RoomNumber,
                RoomTypeID = room.RoomTypeId.GetValueOrDefault(),
                StartDate = DateOnly.FromDateTime(roomDTO.StartDate).ToDateTime(TimeOnly.MinValue),
                EndDate = DateOnly.FromDateTime(roomDTO.EndDate).ToDateTime(TimeOnly.MinValue),
                Status = room.Status,
                Description = room.Descriptions
            };
        }

        public async Task UpdateRoomAsync(int roomId, RoomDTO roomDTO)
        {
            if (roomId != roomDTO.RoomID)
            {
                throw new ArgumentException("Room ID mismatch.");
            }

            if (roomDTO.StartDate >= roomDTO.EndDate)
            {
                throw new ArgumentException("Start date must be earlier than end date.");
            }

            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(roomId);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {roomId} not found.");
            }

            room.RoomNumber = roomDTO.RoomNumber;
            room.RoomTypeId = roomDTO.RoomTypeID;
            room.StartDate = DateOnly.FromDateTime(roomDTO.StartDate);
            room.EndDate = DateOnly.FromDateTime(roomDTO.EndDate);
            room.Status = roomDTO.Status;
            room.Descriptions = roomDTO.Description;

            await _unitOfWork.Rooms.UpdateRoomAsync(room);
        }

        public async Task DeleteRoomAsync(int roomId)
        {
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(roomId);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {roomId} not found.");
            }

            try
            {
                await _unitOfWork.Rooms.DeleteRoomAsync(roomId);
            }
            catch (DbUpdateException ex)
            {
                throw new InvalidOperationException("Cannot delete this room because it is referenced by other data (e.g. bookings).");
            }
        }



        public async Task UpdateRoomStatusAsync(int roomId, string newStatus)
    {
        try
        {
           
            if (string.IsNullOrEmpty(newStatus) || !new[] { "Available", "Booked", "Maintenance" }.Contains(newStatus))
            {
                throw new ArgumentException($"Invalid room status: {newStatus}. Must be one of: Available, Booked, UnderMaintenance.");
            }

            // Fetch the room
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(roomId);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {roomId} not found.");
            }

            // Update the status
            room.Status = newStatus;
            await _unitOfWork.Rooms.UpdateRoomAsync(room);
            await _unitOfWork.SaveChangesAsync();
           
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Failed to update status for room with ID {roomId}.", ex);
        }
    
}
    }




}