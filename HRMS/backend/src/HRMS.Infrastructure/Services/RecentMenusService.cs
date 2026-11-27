using System.Text.Json;
using Dapper;
using HRMS.Application.DTOs;
using HRMS.Application.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Services;

/// <summary>
/// Hybrid Write-Behind Recent Menu Service:
/// - Fast Dapper single-row read on user Login (capped at 10 items per user).
/// - Single-row EF Core upsert when the frontend flushes on Page Idle, Tab Hide, Window Close, or Sign-Out.
/// </summary>
public class RecentMenusService : IRecentMenusService
{
    private const int MaxRecentItems = 10;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    private readonly HrmsDbContext _db;
    private readonly IDapperConnectionFactory _dapper;

    public RecentMenusService(HrmsDbContext db, IDapperConnectionFactory dapper)
    {
        _db = db;
        _dapper = dapper;
    }

    public async Task<UserRecentMenusPayloadDto> GetUserRecentMenusAsync(string userId, CancellationToken ct = default)
    {
        var normalizedUser = NormalizeUserId(userId);
        using var conn = _dapper.CreateConnection();
        var row = await conn.QueryFirstOrDefaultAsync<UserRecentMenuState>(
            "SELECT TOP 1 * FROM dbo.UserRecentMenuStates WHERE UserId = @UserId",
            new { UserId = normalizedUser }
        );

        if (row is null)
        {
            return new UserRecentMenusPayloadDto
            {
                UserId = normalizedUser,
                UserDisplayName = normalizedUser,
                Items = new List<RecentMenuEntryDto>(),
                UpdatedAtUtc = DateTime.UtcNow
            };
        }

        return new UserRecentMenusPayloadDto
        {
            UserId = row.UserId,
            UserDisplayName = row.UserDisplayName,
            Items = SafeDeserializeItems(row.RecentMenusJson),
            UpdatedAtUtc = row.UpdatedAtUtc
        };
    }

    public async Task<UserRecentMenusPayloadDto> SaveUserRecentMenusAsync(
        string userId,
        UserRecentMenusPayloadDto dto,
        CancellationToken ct = default)
    {
        var normalizedUser = NormalizeUserId(string.IsNullOrWhiteSpace(userId) ? dto.UserId : userId);

        // Deduplicate by MenuId, sort newest first, and cap strictly to 10 items
        var trimmed = (dto.Items ?? new List<RecentMenuEntryDto>())
            .Where(x => !string.IsNullOrWhiteSpace(x.MenuId))
            .GroupBy(x => x.MenuId, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderByDescending(i => i.AccessedAtUtc).First())
            .OrderByDescending(i => i.AccessedAtUtc)
            .Take(MaxRecentItems)
            .ToList();

        var entity = await _db.UserRecentMenuStates
            .FirstOrDefaultAsync(x => x.UserId == normalizedUser, ct);

        if (entity is null)
        {
            entity = new UserRecentMenuState { UserId = normalizedUser };
            _db.UserRecentMenuStates.Add(entity);
        }

        entity.UserDisplayName = string.IsNullOrWhiteSpace(dto.UserDisplayName)
            ? normalizedUser
            : dto.UserDisplayName.Trim();
        entity.RecentMenusJson = JsonSerializer.Serialize(trimmed, JsonOpts);
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new UserRecentMenusPayloadDto
        {
            UserId = entity.UserId,
            UserDisplayName = entity.UserDisplayName,
            Items = trimmed,
            UpdatedAtUtc = entity.UpdatedAtUtc
        };
    }

    public async Task ClearUserRecentMenusAsync(string userId, CancellationToken ct = default)
    {
        var normalizedUser = NormalizeUserId(userId);
        var entity = await _db.UserRecentMenuStates
            .FirstOrDefaultAsync(x => x.UserId == normalizedUser, ct);

        if (entity is not null)
        {
            entity.RecentMenusJson = "[]";
            entity.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    private static string NormalizeUserId(string? raw)
        => string.IsNullOrWhiteSpace(raw) ? "ADMIN-01" : raw.Trim().ToUpperInvariant();

    private static List<RecentMenuEntryDto> SafeDeserializeItems(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<RecentMenuEntryDto>();
        try
        {
            return (JsonSerializer.Deserialize<List<RecentMenuEntryDto>>(json, JsonOpts) ?? new List<RecentMenuEntryDto>())
                .OrderByDescending(x => x.AccessedAtUtc)
                .Take(MaxRecentItems)
                .ToList();
        }
        catch
        {
            return new List<RecentMenuEntryDto>();
        }
    }
}
