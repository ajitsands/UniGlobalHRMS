namespace HRMS.Application.DTOs;

public class AppUiSettingsDto
{
    public string ThemeMode { get; set; } = "uniglobal-light";
    public string PrimaryColor { get; set; } = "#1B365D";
    public string GradientId { get; set; } = "uniglobal-brand";
    public string MenuLayout { get; set; } = "vertical";
    public bool MenuSticky { get; set; } = true;
    public bool IsMenuLocked { get; set; } = false;
    public List<string> MenuOrder { get; set; } = new();
    public List<string> QuickAccessIds { get; set; } = new();

    public string HeaderFooterStyle { get; set; } = "light";
    public string HeaderFooterColor { get; set; } = "#1B365D";
    public string HfTextColor { get; set; } = "#1B365D";
    public string HfGradStart { get; set; } = "#1B365D";
    public string HfGradEnd { get; set; } = "#B31B34";
    public int HfGradAngle { get; set; } = 135;

    public string MenuBgStyle { get; set; } = "light";
    public string MenuBgColor { get; set; } = "#1B365D";
    public string MenuTextColor { get; set; } = "#334155";
    public string MenuGradStart { get; set; } = "#1B365D";
    public string MenuGradEnd { get; set; } = "#0f172a";
    public int MenuGradAngle { get; set; } = 180;

    public string Language { get; set; } = "en";
    public decimal FontSizePx { get; set; } = 13.5m;
    public string FontFamilyId { get; set; } = "inter";
    public int CardShadowLevel { get; set; } = 1;
    public string ScrollbarColor { get; set; } = "#1B365D";

    public bool LockCorporateTheme { get; set; } = true;
    public int RecentMenusLimit { get; set; } = 10;
    public bool EnableIdleTimeout { get; set; } = true;
    public int IdleTimeoutMinutes { get; set; } = 20;

    // Global Regional & Gulf Formatting Settings (Default: Kingdom of Bahrain)
    public string DateFormat { get; set; } = "DD-MM-YYYY";
    public string TimeFormat { get; set; } = "12h";
    public string CurrencyCode { get; set; } = "BHD";
    public bool ShowCurrencyCode { get; set; } = true;
    public bool ShowCurrencyOnTotals { get; set; } = true;
    public string TimeZoneId { get; set; } = "Asia/Bahrain";

    public string UpdatedBy { get; set; } = "SuperAdmin";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class CreateUserInteractionDto
{
    public string UserName { get; set; } = "SuperAdmin";
    public string Role { get; set; } = "SuperAdmin";
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
}
