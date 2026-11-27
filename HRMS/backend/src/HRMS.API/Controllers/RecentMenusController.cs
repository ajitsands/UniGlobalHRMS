using HRMS.Application.DTOs;
using HRMS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

[ApiController]
[Route("api/v1/recent-menus")]
public class RecentMenusController : ControllerBase
{
    private readonly IRecentMenusService _recentMenusService;

    public RecentMenusController(IRecentMenusService recentMenusService)
    {
        _recentMenusService = recentMenusService;
    }

    /// <summary>
    /// Called once when a user logs in to hydrate their personal Top-10 recently accessed menus into Local Storage.
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<UserRecentMenusPayloadDto>> GetForUser(string userId, CancellationToken ct)
    {
        var result = await _recentMenusService.GetUserRecentMenusAsync(userId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Batch-saves the user's Top-10 recent menus from Local Storage when the page becomes idle,
    /// signs out, hides tab, or closes window (supports both PUT and POST keepalive/sendBeacon).
    /// </summary>
    [HttpPut("{userId}")]
    [HttpPost("{userId}")]
    public async Task<ActionResult<UserRecentMenusPayloadDto>> SaveForUser(
        string userId,
        [FromBody] UserRecentMenusPayloadDto dto,
        CancellationToken ct)
    {
        var saved = await _recentMenusService.SaveUserRecentMenusAsync(userId, dto, ct);
        return Ok(saved);
    }

    /// <summary>
    /// Clears the user's Top-10 recent menu history in SQL Server.
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<IActionResult> ClearForUser(string userId, CancellationToken ct)
    {
        await _recentMenusService.ClearUserRecentMenusAsync(userId, ct);
        return NoContent();
    }
}
