using BookingRoom.Server.DTOs;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookingRoom.Server.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueReportController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RevenueReportController> _logger;

        public RevenueReportController(IUnitOfWork unitOfWork, ILogger<RevenueReportController> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        //==============================================================================================================

        /// <summary>
        /// Generates a revenue report based on the specified report type, status, and room.
        /// </summary>
        /// <param name="reportType">Type of report: Daily, Weekly, Monthly, or Yearly.</param>
        /// <param name="status">Optional booking status to filter by.</param>
        /// <param name="roomId">Optional room ID to filter by.</param>
        /// <returns>A list of revenue data points.</returns>
        [HttpGet]
        public async Task<IActionResult> GetRevenueReport(
            [FromQuery] string reportType,
            [FromQuery] string? status = null,
            [FromQuery] int? roomId = null)
        {
            try
            {
                _logger.LogInformation("Generating revenue report - ReportType: {ReportType}, Status: {Status}, RoomId: {RoomId}", reportType, status, roomId);

                // Validate reportType
                if (string.IsNullOrEmpty(reportType) || !new[] { "Daily", "Weekly", "Monthly", "Yearly" }.Contains(reportType))
                {
                    _logger.LogWarning("Invalid report type: {ReportType}", reportType);
                    return BadRequest(new { error = "Report type must be one of: Daily, Weekly, Monthly, Yearly." });
                }

                // Fetch bookings
                var query = _unitOfWork.Bookings.GetQuery();

                // Apply status filter if provided
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(b => b.BookingStatus == status);
                }

                // Apply roomId filter if provided
                if (roomId.HasValue)
                {
                    query = query.Where(b => b.RoomId == roomId.Value);
                }

                var bookings = await _unitOfWork.Bookings.GetAllAsync(query);

                if (!bookings.Any())
                {
                    _logger.LogInformation("No bookings found for the given filters.");
                    return NotFound(new { error = "No bookings found for the selected criteria." });
                }

                // Filter out "Cancel" bookings for revenue calculations in specified dimensions
                var bookingsForRevenue = bookings.Where(b => b.BookingStatus != "Cancel" && b.CheckInDate.HasValue).ToList();

                // Group bookings based on reportType
                IEnumerable<RevenueReportDTO> reportData = reportType switch
                {
                    "Daily" => bookingsForRevenue
                        .GroupBy(b => b.CheckInDate!.Value.Date)
                        .Select(g => new RevenueReportDTO
                        {
                            Period = g.Key.ToString("yyyy-MM-dd"),
                            TotalRevenue = g.Sum(b => b.TotalAmount ?? 0),
                            BookingCount = g.Count()
                        })
                        .OrderBy(r => r.Period),

                    "Weekly" => bookingsForRevenue
                        .Where(b => b.CheckInDate!.Value.Date >= DateTime.UtcNow.Date.AddDays(-7))
                        .GroupBy(b => b.CheckInDate!.Value.Date)
                        .Select(g => new RevenueReportDTO
                        {
                            Period = g.Key.ToString("yyyy-MM-dd"),
                            TotalRevenue = g.Sum(b => b.TotalAmount ?? 0),
                            BookingCount = g.Count()
                        })
                        .OrderBy(r => r.Period),

                    "Monthly" => bookingsForRevenue
                        .GroupBy(b => new { b.CheckInDate!.Value.Year, b.CheckInDate!.Value.Month })
                        .Select(g => new RevenueReportDTO
                        {
                            Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                            TotalRevenue = g.Sum(b => b.TotalAmount ?? 0),
                            BookingCount = g.Count()
                        })
                        .OrderBy(r => r.Period),

                    "Yearly" => bookingsForRevenue
                        .GroupBy(b => b.CheckInDate!.Value.Year)
                        .Select(g => new RevenueReportDTO
                        {
                            Period = g.Key.ToString(),
                            TotalRevenue = g.Sum(b => b.TotalAmount ?? 0),
                            BookingCount = g.Count()
                        })
                        .OrderBy(r => r.Period),

                    _ => throw new ArgumentException("Invalid report type.")
                };

                var result = reportData.ToList();

                if (!result.Any())
                {
                    _logger.LogInformation("No revenue data found after filtering for the given report type.");
                    return NotFound(new { error = "No revenue data found for the selected criteria." });
                }

                _logger.LogInformation("Successfully generated revenue report with {Count} data points.", result.Count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating revenue report.");
                return StatusCode(500, new { error = "Failed to generate revenue report. Please try again later." });
            }
        }
    }
}