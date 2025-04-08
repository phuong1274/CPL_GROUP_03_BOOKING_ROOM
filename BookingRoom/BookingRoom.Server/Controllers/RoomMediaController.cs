using BookingRoom.Server.DTOs;
using BookingRoom.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Collections.Generic;
using BookingRoom.Server.Services;

namespace BookingRoom.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomMediaController : ControllerBase
    {
        private readonly IRoomMediaService _roomMediaService;
        private readonly IWebHostEnvironment _environment;

        // Class to represent the media file response
        public class MediaFileResponse
        {
            public string Url { get; set; }
            public string Type { get; set; }
        }

        public RoomMediaController(IRoomMediaService roomMediaService, IWebHostEnvironment environment)
        {
            _roomMediaService = roomMediaService;
            _environment = environment;
        }

        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetMediaByRoomId(int roomId)
        {
            var media = await _roomMediaService.GetMediaByRoomIdAsync(roomId);
            return Ok(media);
        }

        [HttpPost]
        public async Task<IActionResult> AddMedia([FromBody] RoomMediaDTO roomMediaDTO)
        {
            var createdMedia = await _roomMediaService.AddMediaAsync(roomMediaDTO);
            return CreatedAtAction(nameof(GetMediaByRoomId), new { roomId = createdMedia.RoomID }, createdMedia);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadMedia(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("No files uploaded.");
            }

            try
            {
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileUrls = new List<MediaFileResponse>();
                foreach (var file in files)
                {
                    // Validate file type (image or video)
                    var fileExtension = Path.GetExtension(file.FileName).ToLower();
                    var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var allowedVideoExtensions = new[] { ".mp4", ".mov", ".avi", ".mkv" };
                    bool isImage = allowedImageExtensions.Contains(fileExtension);
                    bool isVideo = allowedVideoExtensions.Contains(fileExtension);

                    if (!isImage && !isVideo)
                    {
                        return BadRequest($"Unsupported file type: {fileExtension}. Only images (.jpg, .jpeg, .png, .gif) and videos (.mp4, .mov, .avi, .mkv) are allowed.");
                    }

                    // Create a unique file name
                    var fileName = Guid.NewGuid().ToString() + fileExtension;
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    // Save the file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Generate the URL to access the file
                    var fileUrl = $"/uploads/{fileName}";
                    fileUrls.Add(new MediaFileResponse
                    {
                        Url = fileUrl,
                        Type = isImage ? "Image" : "Video"
                    });
                }

                return Ok(fileUrls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading files: {ex.Message}");
            }
        }

        [HttpDelete("room/{roomId}")]
        public async Task<IActionResult> DeleteMediaByRoomId(int roomId)
        {
            await _roomMediaService.DeleteMediaByRoomIdAsync(roomId);
            return NoContent();
        }
    }
}