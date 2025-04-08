using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Services
{
    public class RoomMediaService : IRoomMediaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoomMediaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<RoomMediaDTO>> GetMediaByRoomIdAsync(int roomId)
        {
            var media = await _unitOfWork.RoomMedia.GetMediaByRoomIdAsync(roomId);
            return media.Select(m => new RoomMediaDTO
            {
                MediaID = m.MediaId,
                RoomID = m.RoomId.GetValueOrDefault(),
                Media_Link = m.MediaLink,
                Description = m.Description,
                MediaType = m.MediaType
            }).ToList();
        }
        public async Task DeleteMediaByRoomIdAsync(int roomId)
        {
            var mediaList = await _unitOfWork.RoomMedia.GetMediaByRoomIdAsync(roomId);
            foreach (var media in mediaList)
            {
                await _unitOfWork.RoomMedia.DeleteMediaAsync(media.MediaId);
            }
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<RoomMediaDTO> AddMediaAsync(RoomMediaDTO mediaDTO)
        {
            var room = await _unitOfWork.Rooms.GetRoomByIdAsync(mediaDTO.RoomID);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {mediaDTO.RoomID} not found.");
            }

            var media = new RoomMedium
            {
                RoomId = mediaDTO.RoomID,
                MediaLink = mediaDTO.Media_Link,
                Description = mediaDTO.Description,
                MediaType = mediaDTO.MediaType
            };

            await _unitOfWork.RoomMedia.AddMediaAsync(media);
            mediaDTO.MediaID = media.MediaId;
            return mediaDTO;
        }

        public async Task DeleteMediaAsync(int mediaId)
        {
            var media = await _unitOfWork.RoomMedia.GetMediaByIdAsync(mediaId);
            if (media == null)
            {
                throw new KeyNotFoundException($"Media with ID {mediaId} not found.");
            }

            await _unitOfWork.RoomMedia.DeleteMediaAsync(mediaId);
        }
    }
}