namespace HRMS.Application.DTOs;

public class RecentMenuEntryDto
{
    public string MenuId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public string? ParentLabel { get; set; }
    public string AccessedAtUtc { get; set; } = string.Empty;
    public int VisitCount { get; set; } = 1;
}

public class UserRecentMenusPayloadDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public List<RecentMenuEntryDto> Items { get; set; } = new();
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
