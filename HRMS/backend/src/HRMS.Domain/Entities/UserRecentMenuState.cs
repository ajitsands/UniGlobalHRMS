namespace HRMS.Domain.Entities;

/// <summary>
/// Stores each user's latest 10 accessed menus as a compact 1-row-per-user snapshot in SQL Server.
/// Read once on Login via Dapper; updated in batch on Idle / Sign-Out / Window Close.
/// </summary>
public class UserRecentMenuState
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public string RecentMenusJson { get; set; } = "[]";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
