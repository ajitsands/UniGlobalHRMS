using HRMS.Application.DTOs;
using HRMS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

[ApiController]
[Route("api/v1/ui-settings")]
public class UiSettingsController : ControllerBase
{
    private readonly IUiSettingsService _settingsService;
    private readonly IAuditReportService _auditService;

    public UiSettingsController(IUiSettingsService settingsService, IAuditReportService auditService)
    {
        _settingsService = settingsService;
        _auditService = auditService;
    }

    /// <summary>
    /// Returns the Global Corporate Identity &amp; UI Settings saved by SuperAdmin.
    /// Every logged-in user loads these settings automatically.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AppUiSettingsDto>> GetGlobal(CancellationToken ct)
    {
        var settings = await _settingsService.GetGlobalSettingsAsync(ct);
        return Ok(settings);
    }

    /// <summary>
    /// SuperAdmin-only endpoint to save Global Corporate Identity &amp; UI Settings into SQL Server.
    /// Persists across all users until SuperAdmin updates them again.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<AppUiSettingsDto>> SaveGlobal(
        [FromBody] AppUiSettingsDto dto,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";
        var userName = Request.Headers["X-User-Name"].FirstOrDefault() ?? "SuperAdmin";

        if (!string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Only SuperAdmin can save Global Corporate Identity & UI Settings."
            });
        }

        var saved = await _settingsService.SaveGlobalSettingsAsync(dto, userName, ct);

        await _auditService.LogInteractionAsync(new CreateUserInteractionDto
        {
            UserName = userName,
            Role = role,
            Module = "WorkspaceCustomizer",
            Action = "SaveGlobalCorporateSettings",
            Details = $"Theme={saved.ThemeMode}, MenuLayout={saved.MenuLayout}, Date={saved.DateFormat}, Time={saved.TimeFormat}, Currency={saved.CurrencyCode}, TZ={saved.TimeZoneId}, RecentMenusLimit={saved.RecentMenusLimit}"
        }, HttpContext.Connection.RemoteIpAddress?.ToString(), ct);

        return Ok(saved);
    }
}
