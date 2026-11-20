# UniGlobal HRMS — Development Planning Note

**Client:** UniGlobal Consultancy Services W.L.L. (for Prompt ERP Solutions)  
**Developer:** SaNDS Lab Middle East W.L.L.  
**Target Kickoff:** In 8 Hours  
**Repository:** `https://github.com/ajitsands/UniGlobalHRMS.git`

---

## 1. Reference Documents
All proposal, SLA, and client requirement documents have been organized under `Reference Document/`:
- `Reference Document/Client Requirements/HRMS_Requirements_SaNDS_Lab_V_Final.pdf` (91 Core Functional Requirements)
- `Reference Document/HRMS_Proposal_SaNDS_Lab_Middle_East.html` / `.pdf`
- `Reference Document/HRMS_Module_Service_Level_Agreement_SaNDS_Lab_UniGlobal.html` / `.pdf` (92 Total Requirements incl. Bahrain SIO & Kuwait PIFSS, Bilingual EN/AR, Mobile App)
- `Reference Document/HRMS_SLA_Annexure_1_Payment_and_Timeline_Clarification.html` / `.pdf`

---

## 2. Verified Machine & Environment Configuration
| Component | Status | Verified Details |
| :--- | :--- | :--- |
| **.NET SDK** | Ready | `.NET 8.0.428` (LTS - Recommended) & `.NET 10.0.404` at `C:\Program Files\dotnet\dotnet.exe` |
| **SQL Server 2022** | Ready | `Microsoft SQL Server 2022 Express (16.0.1000.6)` on `.\SQLEXPRESS` (`UniGlobalHRUser`) |
| **Node.js / npm** | Ready | Node `v26.13.0`, npm `11.20.0` |
| **Git** | Ready | `git version 2.53.0.windows.2` |

---

## 3. Solution Architecture (`HRMS/` Folder)
Instead of server-rendered ASP.NET MVC (Razor), the application uses **ASP.NET Core 8 Web API (Clean Modular Architecture)** paired with a **ReactJS + TypeScript (Vite)** SPA:

```text
HRMS/
├── backend/
│   ├── HRMS.sln
│   └── src/
│       ├── HRMS.Domain/          # Entities, Enums, Core Business Rules (EOSB, SIO/PIFSS, Audit)
│       ├── HRMS.Application/     # Services/CQRS, DTOs, Validators, Interfaces
│       ├── HRMS.Infrastructure/  # EF Core (CRUD, Transactions, Audit) + Dapper (Reports & SQL Queries)
│       └── HRMS.API/             # REST Controllers, Swagger/OpenAPI, JWT + Field-Level RBAC, Logging
├── frontend/                     # ReactJS + TypeScript + Vite (Lightweight & Responsive)
│   └── src/
│       ├── layouts/              # Vertical, Horizontal & Docking Menu Modes + UniGlobal Light Header/Footer
│       ├── theme/                # Default UniGlobal Light + Single & Gradient Color Theme Engine
│       ├── components/           # Help Tags, Quick Access Panel, Admin Drag-and-Drop Menu, Dynamic Charts
│       ├── modules/              # Employee, Attendance, Leave, Payroll, Assets, Cost Allocation, Audit, Manual
│       └── i18n/                 # English (LTR) & Arabic (RTL)
└── docs/                         # Phase-by-phase API Docs (OpenAPI/Markdown), DB Scripts, User Manual
```

### Data Access & Queuing Strategy
- **EF Core (`AppDbContext`):** All CRUD operations, multi-table transactions, schema migrations, and automatic `ChangeTracker` **Data Audit Logs** (old/new values, user, timestamp).
- **Dapper (`IDbConnection`):** High-performance **Reports**, **Dashboard aggregations**, **Payroll/GL reconciliation**, and complex SQL queries (meeting the 3–5s peak response SLA).
- **Background Queuing & Scheduling (Hangfire + SQL Server Transactional Outbox — No RabbitMQ Required):**
  - Uses **Hangfire (SQL Server 2022 storage)** + **`IntegrationOutboxMessages` table** directly inside `HRMS.API` + `UniGlobalHRMS` (zero extra broker/daemon to install on `earth`).
  - Handles **PROMPT ERP GL & CRM Sync** (automatic exponential retry + Admin Error Queue with 1-click Re-Send per Req 3.7.12), **Password-Protected Payslip Email Batches**, **Biometric Attendance Sync**, **Daily CPR/Visa/Passport/Probation Expiry Alerts & Escalations**, and **Scheduled Report Delivery**.
  - Abstracted behind `IJobQueueService` in `HRMS.Application` for clean future extensibility.

---

## 4. Core Platform & UX Specifications
- **Theme System:** Default **UniGlobal Light** theme (UniGlobal Navy `#1B365D` + Crimson `#B31B34` with light Header and Footer) with user-selectable **Single** and **Gradient** color customization for Controls, Header & Footer, and Menu Background.
- **Settings Persistence (Future Backend Note):**
  - Currently persisted locally in browser `localStorage` across page refreshes.
  - **Planned (Backend Phase):** Add a **Save Settings (Global / Per-User)** feature backed by SQL Server 2022 (`PUT /api/v1/settings/ui-preferences`) so Admin can save a unified application-wide style that automatically applies to all logged-in users (with optional per-user overrides).
- **Menu & Navigation:**
  - User-selectable menu layout: **Vertical**, **Horizontal**, or **Docking** style.
  - **Admin-Only Menu Customization:** Drag-and-drop menu reordering and flow locking.
  - **Easy / Quick Access Panel:** User-configurable pinned shortcuts for daily menus.
- **Interactive Customizable Dashboard:**
  - Per-user widget layout where each metric/dataset can be switched between **Line Chart**, **Bar Chart**, **Pie Chart**, or **Tabular** view.
- **Activity & Audit Logging:**
  - **User Interaction Logs:** Tracks navigation, clicks, filters, exports, and login/session events.
  - **Data Change Audit Logs:** Tracks every insert/update/delete with old/new values, user ID, and timestamp.
- **Help & Documentation:**
  - Contextual **Help Tags** across forms, fields, and actions.
  - Built-in **User Manual** module with step-by-step guides and screenshots.
  - **Phase-by-Phase API Documentation** (Swagger/OpenAPI + Markdown specs) for seamless integration/merging with PROMPT ERP, CRM, or external systems.
- **Localization:** Full **English (LTR)** and **Arabic (RTL)** support with per-user preferences.

---

## 5. Git Repository & Branching Plan
- **Remote:** `https://github.com/ajitsands/UniGlobalHRMS.git`
- **Branches:**
  - `main` — Protected production release branch (merge restricted to **Ajit**).
  - `develop` — Integration branch for tested features.
  - `Ajit` — Ajit's active development branch (full repo/merge access).
  - `Ancy` — Ancy's active development branch (pushes to `origin/Ancy` and opens PRs to `develop` for Ajit's review & merge).

---

## 6. Completed Pre-Kickoff Milestone: Centralized Common Controls Library (`@controls`)
Locked and build-verified (`tsc -b && vite build`) under `HRMS/frontend/src/common-controls/` so both branches (**Ajit** & **Ancy**) share 100% uniform UI controls:
- **Official UniGlobal Branding:** Default UniGlobal Light theme (Navy `#1B365D` + Crimson `#B31B34`), official `LogoIcon.png` / `LogoIcon.jpg` app icon, browser favicon, and animated `UniGlobalLoader` (inline & full-screen overlay).
- **4 Menu Layouts + Sub-Menus:**
  - **Vertical Sidebar** (expandable sub-menus, Admin drag-and-drop reordering & flow lock, Pin to Quick Access).
  - **Horizontal Topbar** (hover/click dropdown sub-menus).
  - **Floating / Docking Menu** (draggable anywhere on screen, position persisted, smart upward/downward sub-menus).
  - **Minimal Icon Rail** (flyout sub-menus beside the rail).
  - **Menu Scroll Behavior:** Toggleable **Sticky Menu** vs **Scroll with Page** + scroll-aware **Quick Access** dropdown next to **Help** in the sticky header.
- **Full Workspace Customizer (Persisted in `localStorage`, future Global DB Save planned):**
  - Theme Mode (**UniGlobal Light**, **Single Color**, **Gradient**).
  - Independent **Header & Footer** and **Menu Background** Single/Gradient color builders (Start/End color + Angle) + custom **Font Colors**.
  - **Full-Page Font Size Slider (`10px–20px`)** + **6 Font Families** (`Inter`, `Poppins`, `Plus Jakarta Sans`, `Roboto`, `Cairo EN+AR`, `System UI`) + **Card Shadow Depth Slider (`Flat`–`Elevated XL`)** + **Browser Scrollbar Color**.
  - **Bilingual EN (LTR) / AR (RTL)** live switcher + 1-click **Reset to UniGlobal Light Default**.
- **Standardized Controls (`@controls`):** `DataTable` (search, sort, paginate, column toggle, CSV export), `SelectControl` (Select2 single/multi combo), `DateCalendar` (single & range with holiday highlights), `TextInput`, `NumberInput` (BHD/KWD), `TextArea`, `RadioGroup`, `Checkbox`, `SwitchToggle`, `RangeSlider`, `DualRangeSlider`, `FontSizeControl`, `ImageUpload`, `FileUpload`, `Card`, `Accordion`, `Tabs`, `Modal`, `Drawer`, `ConfirmPopup`, edge-aware `DropdownMenu` (auto left/right flip), `ToastProvider`/`useToast` (Success/Danger/Warning/Info + 5 positions), `Tooltip` & `HelpTag` (Gray/Primary/Success/Danger/Warning/Info themes), `HelpPopup`, `DashboardWidget` (Bar/Line/Pie/Table switcher), and standardized Danger-colored Delete actions (`danger-ghost`).

---

## 7. Phased Development Plan (Starting in 8 Hours)

### Phase 0: Backend & Git Kickoff (Next Session — In 8 Hours)
1. Initialize Git repository, configure `.gitignore`, connect `origin` (`https://github.com/ajitsands/UniGlobalHRMS.git`), and push `main`, `develop`, `Ajit`, and `Ancy` branches with the locked `@controls` library as the baseline.
2. Create `UniGlobalHRMS` database on `.\SQLEXPRESS` (`UniGlobalHRUser`).
3. Scaffold `HRMS/backend` (`.NET 8` Clean Architecture + EF Core for CRUD/Transactions/Data Audit + Dapper for Reports/SQL Queries + Swagger/OpenAPI + JWT/RBAC + User Interaction Logging + Global/Per-User UI Settings Save API).
4. Publish **Phase 0 API Documentation**.

### Phase 1: Core Architecture, Org Structure & Employee Master (Requirements 3.1, 3.6, 3.8)
- 5 Business Units, 4 Commercial Registrations (CRs), Departments, Function Classes.
- Employee Master, Self-Service profile change requests (with HR approval), Document Expiry alerts & versioning, Required-documents checklist, Spreadsheet bulk import with row-level error report, Employee timeline, Medical insurance, Directory & Policy acknowledgement.
- Publish **Phase 1 API Documentation** & Loaded Rate API.

### Phase 2: Letters, Assets, Shift Engine & Biometric Attendance (Requirements 3.2, 3.4)
- Bilingual Letter Generator (with CR-specific letterheads & sequential issue log) + Asset Custody & Exit Clearance.
- Shift patterns, Ramadan working hours, Biometric device TCP/IP push/pull middleware, Duplicate/missing punch handling, Missed punch approval, Leave rules/accruals/calendar clash alerts, Mobile GPS check-in.
- Publish **Phase 2 API Documentation**.

### Phase 3: Multi-Country Payroll (Bahrain SIO & Kuwait PIFSS), EOSB & Cost Allocation (Requirements 3.3, 3.6, 3.7)
- Bahrain & Kuwait Statutory Payroll, Overtime, EOSB Indemnity accruals & GL reversals, Leave salary & air ticket accruals, Loans/Advances/Expense claims (with VAT), 4-eyes payroll approval & locking, WPS files, 5-BU shared back-office cost allocation, PROMPT GL & CRM integration queues.
- Publish **Phase 3 API Documentation**.

### Phase 4: People Processes, Reporting & UAT (Requirements 3.5, 3.7)
- Onboarding/Offboarding checklists, Probation, Training & Annual Plan, Appraisals, Recruitment, Org Chart, Disciplinary/Grievance (restricted), Report Builder (Excel/PDF + scheduled delivery), UAT scripts mapped to all 92 acceptance criteria.
- Finalize **User Manual (with screenshots)** & **Complete API Integration Guide**.
