using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces; // Thêm dòng này
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoomTypeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<RoomTypeDTO>> GetAllRoomTypesAsync()
        {
            var roomTypes = await _unitOfWork.RoomTypes.GetAllRoomTypesAsync();
            return roomTypes.Select(rt => new RoomTypeDTO
            {
                RoomTypeID = rt.RoomTypeId,
                RoomTypeName = rt.RoomTypeName,
                Description = rt.Description,
                Price = rt.Price.GetValueOrDefault(),
                ValidDate = rt.ValidDate ?? DateTime.MinValue
            }).ToList();
        }

        public async Task<RoomTypeDTO> GetRoomTypeByIdAsync(int roomTypeId)
        {
            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(roomTypeId);
            if (roomType == null)
            {
                throw new KeyNotFoundException($"Room type with ID {roomTypeId} not found.");
            }

            return new RoomTypeDTO
            {
                RoomTypeID = roomType.RoomTypeId,
                RoomTypeName = roomType.RoomTypeName,
                Description = roomType.Description,
                Price = roomType.Price.GetValueOrDefault(),
                ValidDate = roomType.ValidDate ?? DateTime.MinValue
            };
        }

        public async Task<RoomTypeDTO> AddRoomTypeAsync(RoomTypeDTO roomTypeDTO)
        {
            if (roomTypeDTO.Price < 0)
            {
                throw new ArgumentException("Price cannot be negative.");
            }

            var roomType = new RoomType
            {
                RoomTypeName = roomTypeDTO.RoomTypeName,
                Description = roomTypeDTO.Description,
                Price = roomTypeDTO.Price,
                ValidDate = roomTypeDTO.ValidDate
            };

            await _unitOfWork.RoomTypes.AddRoomTypeAsync(roomType);
            roomTypeDTO.RoomTypeID = roomType.RoomTypeId;
            return roomTypeDTO;
        }

        public async Task UpdateRoomTypeAsync(int roomTypeId, RoomTypeDTO roomTypeDTO)
        {
            if (roomTypeId != roomTypeDTO.RoomTypeID)
            {
                throw new ArgumentException("Room type ID mismatch.");
            }

            if (roomTypeDTO.Price < 0)
            {
                throw new ArgumentException("Price cannot be negative.");
            }

            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(roomTypeId);
            if (roomType == null)
            {
                throw new KeyNotFoundException($"Room type with ID {roomTypeId} not found.");
            }

            roomType.RoomTypeName = roomTypeDTO.RoomTypeName;
            roomType.Description = roomTypeDTO.Description;
            roomType.Price = roomTypeDTO.Price;
            roomType.ValidDate = roomTypeDTO.ValidDate;

            await _unitOfWork.RoomTypes.UpdateRoomTypeAsync(roomType);
        }

        public async Task DeleteRoomTypeAsync(int roomTypeId)
        {
            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(roomTypeId);
            if (roomType == null)
            {
                throw new KeyNotFoundException($"Room type with ID {roomTypeId} not found.");
            }

            await _unitOfWork.RoomTypes.DeleteRoomTypeAsync(roomTypeId);
        }
    }
}