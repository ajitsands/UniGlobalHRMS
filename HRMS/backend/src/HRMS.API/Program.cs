using HRMS.Application.Interfaces;
using HRMS.Infrastructure.Persistence;
using HRMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// EF Core (CRUD, Transactions, Automatic Data Audit)
builder.Services.AddDbContext<HrmsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dapper (High-Performance Reports & Fast SQL Queries)
builder.Services.AddSingleton<IDapperConnectionFactory, DapperConnectionFactory>();

// Application Services
builder.Services.AddScoped<IUiSettingsService, UiSettingsService>();
builder.Services.AddScoped<IAuditReportService, AuditReportService>();
builder.Services.AddScoped<IRecentMenusService, RecentMenusService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PROMPT HRMS — UNIGLOBAL Suite API",
        Version = "v1",
        Description = "Phase 0 Foundation API: Global Corporate UI Settings (SuperAdmin), Data Audit Logs, User Interaction Logs, and System Health."
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("HrmsCors", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Ensure SQL Server 2022 schema tables exist on startup (safe idempotent EnsureCreated)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HrmsDbContext>();
    try
    {
        await db.Database.EnsureCreatedAsync();
        await db.Database.ExecuteSqlRawAsync(@"
            IF OBJECT_ID(N'dbo.UserRecentMenuStates', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.UserRecentMenuStates (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    UserId NVARCHAR(100) NOT NULL,
                    UserDisplayName NVARCHAR(150) NOT NULL CONSTRAINT DF_UserRecentMenuStates_Display DEFAULT(N''),
                    RecentMenusJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_UserRecentMenuStates_Json DEFAULT(N'[]'),
                    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_UserRecentMenuStates_Updated DEFAULT(SYSUTCDATETIME())
                );
                CREATE UNIQUE INDEX IX_UserRecentMenuStates_UserId ON dbo.UserRecentMenuStates(UserId);
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'RecentMenusLimit') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD RecentMenusLimit INT NOT NULL CONSTRAINT DF_AppUiSettings_RecentMenusLimit DEFAULT(10);
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'DateFormat') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD DateFormat NVARCHAR(32) NOT NULL CONSTRAINT DF_AppUiSettings_DateFormat DEFAULT(N'DD-MM-YYYY');
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'TimeFormat') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD TimeFormat NVARCHAR(16) NOT NULL CONSTRAINT DF_AppUiSettings_TimeFormat DEFAULT(N'12h');
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'CurrencyCode') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD CurrencyCode NVARCHAR(16) NOT NULL CONSTRAINT DF_AppUiSettings_CurrencyCode DEFAULT(N'BHD');
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'ShowCurrencyCode') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD ShowCurrencyCode BIT NOT NULL CONSTRAINT DF_AppUiSettings_ShowCurrencyCode DEFAULT(1);
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'ShowCurrencyOnTotals') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD ShowCurrencyOnTotals BIT NOT NULL CONSTRAINT DF_AppUiSettings_ShowCurrencyOnTotals DEFAULT(1);
            END
            IF COL_LENGTH(N'dbo.AppUiSettings', N'TimeZoneId') IS NULL
            BEGIN
                ALTER TABLE dbo.AppUiSettings
                ADD TimeZoneId NVARCHAR(64) NOT NULL CONSTRAINT DF_AppUiSettings_TimeZoneId DEFAULT(N'Asia/Bahrain');
            END");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Database EnsureCreated skipped or failed on startup; check connection string.");
    }
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PROMPT HRMS API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("HrmsCors");

// Prevent Nginx (ea-nginx) & browser caching on dynamic /api/* and index.html
// so SuperAdmin DB changes and deployments take effect immediately for all users.
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;
    if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase) ||
        path.Equals("/", StringComparison.OrdinalIgnoreCase) ||
        path.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.OnStarting(() =>
        {
            context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
            context.Response.Headers["Pragma"] = "no-cache";
            context.Response.Headers["Expires"] = "0";
            context.Response.Headers["X-Accel-Expires"] = "0";
            return Task.CompletedTask;
        });
    }
    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
