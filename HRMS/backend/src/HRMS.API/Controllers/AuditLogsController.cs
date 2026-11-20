using HRMS.Application.DTOs;
using HRMS.Application.Interfaces;
using HRMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS.API.Controllers;

[ApiController]
[Route("api/v1/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditReportService _auditService;

    public AuditLogsController(IAuditReportService auditService) => _auditService = auditService;

    [HttpGet("data")]
    public async Task<IActionResult> GetDataAudits([FromQuery] int top = 50, CancellationToken ct = default)
        => Ok(await _auditService.GetRecentDataAuditsAsync(top, ct));

    [HttpGet("interactions")]
    public async Task<IActionResult> GetInteractions([FromQuery] int top = 50, CancellationToken ct = default)
        => Ok(await _auditService.GetRecentInteractionsAsync(top, ct));

    [HttpPost("interactions")]
    public async Task<IActionResult> RecordInteraction([FromBody] CreateUserInteractionDto dto, CancellationToken ct = default)
    {
        await _auditService.LogInteractionAsync(dto, HttpContext.Connection.RemoteIpAddress?.ToString(), ct);
        return Accepted();
    }
}

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    private readonly HrmsDbContext _db;

    public HealthController(HrmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var canConnect = await _db.Database.CanConnectAsync(ct);
        return Ok(new
        {
            status = canConnect ? "Healthy" : "Degraded",
            database = canConnect ? "SQL Server Connected" : "Unreachable",
            utcTime = DateTime.UtcNow
        });
    }
}
