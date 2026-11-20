using System.Text.Json;
using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Persistence;

public class HrmsDbContext : DbContext
{
    public HrmsDbContext(DbContextOptions<HrmsDbContext> options) : base(options) { }

    public DbSet<AppUiSettings> AppUiSettings => Set<AppUiSettings>();
    public DbSet<DataAuditLog> DataAuditLogs => Set<DataAuditLog>();
    public DbSet<UserInteractionLog> UserInteractionLogs => Set<UserInteractionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUiSettings>(e =>
        {
            e.ToTable("AppUiSettings");
            e.HasKey(x => x.Id);
            e.Property(x => x.ScopeKey).HasMaxLength(64).IsRequired();
            e.HasIndex(x => x.ScopeKey).IsUnique();
            e.Property(x => x.FontSizePx).HasPrecision(5, 2);
            e.Property(x => x.UpdatedBy).HasMaxLength(100);
        });

        modelBuilder.Entity<DataAuditLog>(e =>
        {
            e.ToTable("DataAuditLogs");
            e.HasKey(x => x.Id);
            e.Property(x => x.EntityName).HasMaxLength(120);
            e.Property(x => x.EntityId).HasMaxLength(64);
            e.Property(x => x.Action).HasMaxLength(20);
            e.Property(x => x.ChangedBy).HasMaxLength(100);
            e.HasIndex(x => x.ChangedAtUtc);
        });

        modelBuilder.Entity<UserInteractionLog>(e =>
        {
            e.ToTable("UserInteractionLogs");
            e.HasKey(x => x.Id);
            e.Property(x => x.UserName).HasMaxLength(100);
            e.Property(x => x.Role).HasMaxLength(50);
            e.Property(x => x.Module).HasMaxLength(100);
            e.Property(x => x.Action).HasMaxLength(120);
            e.Property(x => x.IpAddress).HasMaxLength(64);
            e.HasIndex(x => x.CreatedAtUtc);
        });
    }

    /// <summary>
    /// Automatically captures Old &amp; New values for every INSERT/UPDATE/DELETE into DataAuditLogs (Req 3.8.02).
    /// </summary>
    public async Task<int> SaveChangesWithAuditAsync(string changedBy, CancellationToken ct = default)
    {
        var pendingAudits = new List<DataAuditLog>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is DataAuditLog || entry.Entity is UserInteractionLog) continue;
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted)) continue;

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var prop in entry.Properties)
            {
                if (entry.State == EntityState.Added)
                {
                    newValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    oldValues[prop.Metadata.Name] = prop.OriginalValue;
                }
                else if (prop.IsModified && !Equals(prop.OriginalValue, prop.CurrentValue))
                {
                    oldValues[prop.Metadata.Name] = prop.OriginalValue;
                    newValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }

            if (entry.State == EntityState.Modified && newValues.Count == 0) continue;

            var keyProp = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
            pendingAudits.Add(new DataAuditLog
            {
                EntityName = entry.Metadata.ClrType.Name,
                EntityId = keyProp?.CurrentValue?.ToString() ?? "0",
                Action = entry.State switch
                {
                    EntityState.Added => "INSERT",
                    EntityState.Modified => "UPDATE",
                    _ => "DELETE"
                },
                OldValuesJson = oldValues.Count > 0 ? JsonSerializer.Serialize(oldValues) : null,
                NewValuesJson = newValues.Count > 0 ? JsonSerializer.Serialize(newValues) : null,
                ChangedBy = changedBy,
                ChangedAtUtc = DateTime.UtcNow
            });
        }

        if (pendingAudits.Count > 0)
        {
            DataAuditLogs.AddRange(pendingAudits);
        }

        return await base.SaveChangesAsync(ct);
    }
}
