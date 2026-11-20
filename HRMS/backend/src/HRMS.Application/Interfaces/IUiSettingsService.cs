using HRMS.Application.DTOs;
using HRMS.Domain.Entities;

namespace HRMS.Application.Interfaces;

public interface IUiSettingsService
{
    Task<AppUiSettingsDto> GetGlobalSettingsAsync(CancellationToken ct = default);
    Task<AppUiSettingsDto> SaveGlobalSettingsAsync(AppUiSettingsDto dto, string updatedBy, CancellationToken ct = default);
}

public interface IAuditReportService
{
    Task LogInteractionAsync(CreateUserInteractionDto dto, string? ipAddress, CancellationToken ct = default);
    Task<IEnumerable<DataAuditLog>> GetRecentDataAuditsAsync(int top = 50, CancellationToken ct = default);
    Task<IEnumerable<UserInteractionLog>> GetRecentInteractionsAsync(int top = 50, CancellationToken ct = default);
}
