# PROMPT HRMS — Phase 0 API Documentation

**Base URL:** `/api/v1`  
**Swagger / OpenAPI UI:** `/swagger`  
**Data Access:** EF Core 8 (CRUD, Transactions, ChangeTracker Data Audit) + Dapper (Fast Reads & Reports)

---

## 1. Global Corporate Identity & UI Settings (SuperAdmin)

### `GET /api/v1/ui-settings`
- **Access:** All authenticated/logged-in users
- **Engine:** Dapper (`SELECT TOP 1 * FROM AppUiSettings WHERE ScopeKey = 'GLOBAL_CORPORATE'`)
- **Description:** Returns the organization-wide Corporate Identity theme, colors, gradients, menu layout, sticky setting, menu order, quick access defaults, font size/family, card shadow depth, scrollbar color, and `lockCorporateTheme` flag saved by SuperAdmin.

### `PUT /api/v1/ui-settings`
- **Access:** **SuperAdmin Only** (`X-User-Role: SuperAdmin`)
- **Engine:** EF Core Transaction + Automatic `DataAuditLogs` (Old & New JSON values) + `UserInteractionLogs`
- **Description:** Persists SuperAdmin's Corporate Identity customization in SQL Server (`AppUiSettings`) so every user logging in from any device inherits the exact same Corporate Identity until SuperAdmin updates it.
- **Responses:**
  - `200 OK` — Updated `AppUiSettingsDto`
  - `403 Forbidden` — Caller is not `SuperAdmin`

---

## 2. Audit & User Interaction Logs

### `GET /api/v1/audit-logs/data?top=50`
- **Engine:** Dapper
- **Description:** Returns the latest Old/New value data changes tracked automatically by EF Core `SaveChangesWithAuditAsync`.

### `GET /api/v1/audit-logs/interactions?top=50`
- **Engine:** Dapper
- **Description:** Returns recent user interaction & activity logs.

### `POST /api/v1/audit-logs/interactions`
- **Engine:** EF Core
- **Description:** Records a frontend user activity event (`userName`, `role`, `module`, `action`, `details`).

---

## 3. System Health

### `GET /api/v1/health`
- **Description:** Verifies API responsiveness and live SQL Server 2022 (`UniGlobalHRMS`) connectivity.
