namespace HRMS.Domain.Entities;

/// <summary>
/// Global Corporate Identity & UI Settings configured by SuperAdmin.
/// Every user who logs in inherits these settings from SQL Server until SuperAdmin changes them.
/// </summary>
public class AppUiSettings
{
    public int Id { get; set; }
    public string ScopeKey { get; set; } = "GLOBAL_CORPORATE";

    // Main Control Theme
    public string ThemeMode { get; set; } = "uniglobal-light"; // uniglobal-light | single | gradient
    public string PrimaryColor { get; set; } = "#1B365D";
    public string GradientId { get; set; } = "uniglobal-brand";

    // Menu Layout & Behavior
    public string MenuLayout { get; set; } = "vertical"; // vertical | horizontal | docking | minimal
    public bool MenuSticky { get; set; } = true;
    public bool IsMenuLocked { get; set; } = false;
    public string MenuOrderJson { get; set; } = "[\"ui-kit\",\"dashboard\",\"employees\",\"attendance\",\"payroll\",\"audit\",\"manual\"]";
    public string QuickAccessJson { get; set; } = "[\"dashboard\",\"ui-kit\",\"emp-directory\",\"pay-run\"]";

    // Header & Footer Corporate Styling
    public string HeaderFooterStyle { get; set; } = "light"; // light | single | gradient
    public string HeaderFooterColor { get; set; } = "#1B365D";
    public string HfTextColor { get; set; } = "#1B365D";
    public string HfGradStart { get; set; } = "#1B365D";
    public string HfGradEnd { get; set; } = "#B31B34";
    public int HfGradAngle { get; set; } = 135;

    // Menu Background & Font Styling
    public string MenuBgStyle { get; set; } = "light"; // light | single | gradient
    public string MenuBgColor { get; set; } = "#1B365D";
    public string MenuTextColor { get; set; } = "#334155";
    public string MenuGradStart { get; set; } = "#1B365D";
    public string MenuGradEnd { get; set; } = "#0f172a";
    public int MenuGradAngle { get; set; } = 180;

    // Typography, Elevation & Scrollbar
    public string Language { get; set; } = "en";
    public decimal FontSizePx { get; set; } = 13.5m;
    public string FontFamilyId { get; set; } = "inter";
    public int CardShadowLevel { get; set; } = 1;
    public string ScrollbarColor { get; set; } = "#1B365D";

    // Governance: Lock Corporate Identity for standard users
    public bool LockCorporateTheme { get; set; } = true;

    public string UpdatedBy { get; set; } = "SuperAdmin";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
