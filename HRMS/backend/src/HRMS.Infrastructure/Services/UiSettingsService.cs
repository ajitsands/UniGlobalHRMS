using System.Text.Json;
using Dapper;
using HRMS.Application.DTOs;
using HRMS.Application.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Services;

/// <summary>
/// Hybrid Data Access:
/// - Dapper for fast read-only queries (Global UI Settings read on every user login)
/// - EF Core for transactional CRUD + automatic DataAuditLog tracking
/// </summary>
public class UiSettingsService : IUiSettingsService
{
    private readonly HrmsDbContext _db;
    private readonly IDapperConnectionFactory _dapper;

    public UiSettingsService(HrmsDbContext db, IDapperConnectionFactory dapper)
    {
        _db = db;
        _dapper = dapper;
    }

    public async Task<AppUiSettingsDto> GetGlobalSettingsAsync(CancellationToken ct = default)
    {
        using var conn = _dapper.CreateConnection();
        var entity = await conn.QueryFirstOrDefaultAsync<AppUiSettings>(
            "SELECT TOP 1 * FROM AppUiSettings WHERE ScopeKey = @ScopeKey",
            new { ScopeKey = "GLOBAL_CORPORATE" }
        );

        if (entity is null)
        {
            entity = new AppUiSettings { ScopeKey = "GLOBAL_CORPORATE" };
            _db.AppUiSettings.Add(entity);
            await _db.SaveChangesWithAuditAsync("SystemSeed", ct);
        }

        return MapToDto(entity);
    }

    public async Task<AppUiSettingsDto> SaveGlobalSettingsAsync(
        AppUiSettingsDto dto,
        string updatedBy,
        CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var entity = await _db.AppUiSettings
            .FirstOrDefaultAsync(x => x.ScopeKey == "GLOBAL_CORPORATE", ct);

        if (entity is null)
        {
            entity = new AppUiSettings { ScopeKey = "GLOBAL_CORPORATE" };
            _db.AppUiSettings.Add(entity);
        }

        entity.ThemeMode = dto.ThemeMode;
        entity.PrimaryColor = dto.PrimaryColor;
        entity.GradientId = dto.GradientId;
        entity.MenuLayout = dto.MenuLayout;
        entity.MenuSticky = dto.MenuSticky;
        entity.IsMenuLocked = dto.IsMenuLocked;
        entity.MenuOrderJson = JsonSerializer.Serialize(dto.MenuOrder ?? new List<string>());
        entity.QuickAccessJson = JsonSerializer.Serialize(dto.QuickAccessIds ?? new List<string>());

        entity.HeaderFooterStyle = dto.HeaderFooterStyle;
        entity.HeaderFooterColor = dto.HeaderFooterColor;
        entity.HfTextColor = dto.HfTextColor;
        entity.HfGradStart = dto.HfGradStart;
        entity.HfGradEnd = dto.HfGradEnd;
        entity.HfGradAngle = dto.HfGradAngle;

        entity.MenuBgStyle = dto.MenuBgStyle;
        entity.MenuBgColor = dto.MenuBgColor;
        entity.MenuTextColor = dto.MenuTextColor;
        entity.MenuGradStart = dto.MenuGradStart;
        entity.MenuGradEnd = dto.MenuGradEnd;
        entity.MenuGradAngle = dto.MenuGradAngle;

        entity.Language = dto.Language;
        entity.FontSizePx = dto.FontSizePx;
        entity.FontFamilyId = dto.FontFamilyId;
        entity.CardShadowLevel = dto.CardShadowLevel;
        entity.ScrollbarColor = dto.ScrollbarColor;
        entity.LockCorporateTheme = dto.LockCorporateTheme;
        entity.RecentMenusLimit = Math.Clamp(dto.RecentMenusLimit <= 0 ? 10 : dto.RecentMenusLimit, 1, 50);
        entity.EnableIdleTimeout = dto.EnableIdleTimeout;
        entity.IdleTimeoutMinutes = Math.Clamp(dto.IdleTimeoutMinutes <= 0 ? 20 : dto.IdleTimeoutMinutes, 1, 240);
        entity.DateFormat = string.IsNullOrWhiteSpace(dto.DateFormat) ? "DD-MM-YYYY" : dto.DateFormat.Trim();
        entity.TimeFormat = string.IsNullOrWhiteSpace(dto.TimeFormat) ? "12h" : dto.TimeFormat.Trim();
        entity.CurrencyCode = string.IsNullOrWhiteSpace(dto.CurrencyCode) ? "BHD" : dto.CurrencyCode.Trim().ToUpperInvariant();
        entity.ShowCurrencyCode = dto.ShowCurrencyCode;
        entity.ShowCurrencyOnTotals = dto.ShowCurrencyOnTotals;
        entity.TimeZoneId = string.IsNullOrWhiteSpace(dto.TimeZoneId) ? "Asia/Bahrain" : dto.TimeZoneId.Trim();
        entity.UpdatedBy = updatedBy;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesWithAuditAsync(updatedBy, ct);
        await tx.CommitAsync(ct);

        return MapToDto(entity);
    }

    private static AppUiSettingsDto MapToDto(AppUiSettings e) => new()
    {
        ThemeMode = e.ThemeMode,
        PrimaryColor = e.PrimaryColor,
        GradientId = e.GradientId,
        MenuLayout = e.MenuLayout,
        MenuSticky = e.MenuSticky,
        IsMenuLocked = e.IsMenuLocked,
        MenuOrder = SafeDeserializeList(e.MenuOrderJson),
        QuickAccessIds = SafeDeserializeList(e.QuickAccessJson),
        HeaderFooterStyle = e.HeaderFooterStyle,
        HeaderFooterColor = e.HeaderFooterColor,
        HfTextColor = e.HfTextColor,
        HfGradStart = e.HfGradStart,
        HfGradEnd = e.HfGradEnd,
        HfGradAngle = e.HfGradAngle,
        MenuBgStyle = e.MenuBgStyle,
        MenuBgColor = e.MenuBgColor,
        MenuTextColor = e.MenuTextColor,
        MenuGradStart = e.MenuGradStart,
        MenuGradEnd = e.MenuGradEnd,
        MenuGradAngle = e.MenuGradAngle,
        Language = e.Language,
        FontSizePx = e.FontSizePx,
        FontFamilyId = e.FontFamilyId,
        CardShadowLevel = e.CardShadowLevel,
        ScrollbarColor = e.ScrollbarColor,
        LockCorporateTheme = e.LockCorporateTheme,
        RecentMenusLimit = Math.Clamp(e.RecentMenusLimit <= 0 ? 10 : e.RecentMenusLimit, 1, 50),
        EnableIdleTimeout = e.EnableIdleTimeout,
        IdleTimeoutMinutes = Math.Clamp(e.IdleTimeoutMinutes <= 0 ? 20 : e.IdleTimeoutMinutes, 1, 240),
        DateFormat = string.IsNullOrWhiteSpace(e.DateFormat) ? "DD-MM-YYYY" : e.DateFormat,
        TimeFormat = string.IsNullOrWhiteSpace(e.TimeFormat) ? "12h" : e.TimeFormat,
        CurrencyCode = string.IsNullOrWhiteSpace(e.CurrencyCode) ? "BHD" : e.CurrencyCode,
        ShowCurrencyCode = e.ShowCurrencyCode,
        ShowCurrencyOnTotals = e.ShowCurrencyOnTotals,
        TimeZoneId = string.IsNullOrWhiteSpace(e.TimeZoneId) ? "Asia/Bahrain" : e.TimeZoneId,
        UpdatedBy = e.UpdatedBy,
        UpdatedAtUtc = e.UpdatedAtUtc
    };

    private static List<string> SafeDeserializeList(string json)
    {
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
        catch { return new List<string>(); }
    }
}

public class AuditReportService : IAuditReportService
{
    private readonly HrmsDbContext _db;
    private readonly IDapperConnectionFactory _dapper;

    public AuditReportService(HrmsDbContext db, IDapperConnectionFactory dapper)
    {
        _db = db;
        _dapper = dapper;
    }

    public async Task LogInteractionAsync(CreateUserInteractionDto dto, string? ipAddress, CancellationToken ct = default)
    {
        _db.UserInteractionLogs.Add(new UserInteractionLog
        {
            UserName = dto.UserName,
            Role = dto.Role,
            Module = dto.Module,
            Action = dto.Action,
            Details = dto.Details,
            IpAddress = ipAddress,
            CreatedAtUtc = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IEnumerable<DataAuditLog>> GetRecentDataAuditsAsync(int top = 50, CancellationToken ct = default)
    {
        using var conn = _dapper.CreateConnection();
        return await conn.QueryAsync<DataAuditLog>(
            "SELECT TOP (@Top) * FROM DataAuditLogs ORDER BY ChangedAtUtc DESC",
            new { Top = Math.Clamp(top, 1, 500) }
        );
    }

    public async Task<IEnumerable<UserInteractionLog>> GetRecentInteractionsAsync(int top = 50, CancellationToken ct = default)
    {
        using var conn = _dapper.CreateConnection();
        return await conn.QueryAsync<UserInteractionLog>(
            "SELECT TOP (@Top) * FROM UserInteractionLogs ORDER BY CreatedAtUtc DESC",
            new { Top = Math.Clamp(top, 1, 500) }
        );
    }
}
