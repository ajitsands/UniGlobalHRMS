namespace HRMS.Domain.Entities;

public class DataAuditLog
{
    public long Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // INSERT | UPDATE | DELETE
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string ChangedBy { get; set; } = "System";
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}

public class UserInteractionLog
{
    public long Id { get; set; }
    public string UserName { get; set; } = "Anonymous";
    public string Role { get; set; } = "User";
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
