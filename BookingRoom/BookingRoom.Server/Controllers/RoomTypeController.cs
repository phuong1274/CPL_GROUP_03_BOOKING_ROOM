﻿using BookingRoom.Server.DTOs;
using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoomTypeController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRoomTypeService _roomTypeService;

        public RoomTypeController(IUnitOfWork unitOfWork, IRoomTypeService roomTypeService)
        {
            _unitOfWork = unitOfWork;
            _roomTypeService = roomTypeService;
        }


        //=================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetRoomTypes()
        {
            try
            {
                var roomTypes = await _unitOfWork.RoomTypes.GetAllRoomTypesAsync();

                if (roomTypes == null)
                {
                    return Ok(new List<RoomTypeDTO>()); 
                }

                var roomTypeDTOs = roomTypes.Select(rt => new RoomTypeDTO
                {
                    RoomTypeID = rt.RoomTypeId,
                    RoomTypeName = rt.RoomTypeName,
                    Description = rt.Description,
                    Price = rt.Price.GetValueOrDefault(),
                    ValidDate = rt.ValidDate ?? DateTime.MinValue
                }).ToList();

                return Ok(roomTypeDTOs);
            }
            catch (Exception ex)
            {
             
                return StatusCode(500, new { error = $"Error retrieving room types: {ex.Message}" });
            }
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomType(int id)
        {
            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }
            var roomTypeDTO = new RoomTypeDTO
            {
                RoomTypeID = roomType.RoomTypeId,
                RoomTypeName = roomType.RoomTypeName,
                Description = roomType.Description,
                Price = roomType.Price.GetValueOrDefault(),
                ValidDate = roomType.ValidDate ?? DateTime.MinValue
            };
            return Ok(roomTypeDTO);
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="roomTypeDTO"></param>
        /// <returns></returns>

        [HttpPost]
        public async Task<IActionResult> AddRoomType([FromBody] RoomTypeDTO roomTypeDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var roomType = new RoomType
            {
                RoomTypeName = roomTypeDTO.RoomTypeName,
                Description = roomTypeDTO.Description,
                Price = roomTypeDTO.Price,
                ValidDate = roomTypeDTO.ValidDate
            };

            await _unitOfWork.RoomTypes.AddRoomTypeAsync(roomType);
            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.RoomTypeId }, roomType);
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="roomTypeDTO"></param>
        /// <returns></returns>

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoomType(int id, [FromBody] RoomTypeDTO roomTypeDTO)
        {
            if (id != roomTypeDTO.RoomTypeID)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var roomType = await _unitOfWork.RoomTypes.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            roomType.RoomTypeName = roomTypeDTO.RoomTypeName;
            roomType.Description = roomTypeDTO.Description;
            roomType.Price = roomTypeDTO.Price;
            roomType.ValidDate = roomTypeDTO.ValidDate;

            await _unitOfWork.RoomTypes.UpdateRoomTypeAsync(roomType);
            return NoContent();
        }

        //==============================================================================================================
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            try
            {
                await _roomTypeService.DeleteRoomTypeAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred." });
            }
        }


    }
}