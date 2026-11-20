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
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
