import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataColumn,
  DataTable,
  Modal,
  SelectControl,
  TextArea,
  TextInput,
  Timeline,
  TimelineEvent,
  useToast,
} from '@controls';
import {
  GitBranch,
  GitCommitHorizontal,
  History,
  Layers,
  Plus,
  Rocket,
  Wrench,
} from 'lucide-react';

export type ReleaseType = 'Major' | 'Minor' | 'Patch' | 'Other';

export interface RevisionEntry {
  revNumber: number;
  date: string;
  note: string;
  author: string;
}

export interface ReleaseRecord {
  id: string;
  version: string; // e.g., 1.0.0
  type: ReleaseType;
  revision: number; // starts at 1, increments on revisions
  title: string;
  completionDate: string; // YYYY-MM-DD
  branch: string;
  author: string;
  description: string;
  tags: string[];
  revisions: RevisionEntry[];
}

const STORAGE_KEY = 'uniglobal_hrms_release_timeline_v1';

const INITIAL_RELEASES: ReleaseRecord[] = [
  {
    id: 'rel-160',
    version: '1.6.0',
    type: 'Minor',
    revision: 2,
    title: 'Per-User Recent Menus Header Canvas, SuperAdmin Cache Limit & Hybrid DB Sync',
    completionDate: '2026-11-28',
    branch: 'main',
    author: 'Ajit',
    description:
      'Added Header "Recent" trigger & sliding Right-Side Canvas tracking each user\'s recently accessed menus with exact Date & Time stamps, governed by a SuperAdmin-only RecentMenusLimit setting in dbo.AppUiSettings (default 10, configurable 1–50 for all users). Powered by a 3-stage Hybrid Write-Behind architecture: (1) Login Hydration via Dapper into Local Storage; (2) 0ms Local Storage tracking on menu click; (3) Batch DB Flush on 20s Page Idle, Tab Hide, Window Close (keepalive), or Sign-Out.',
    tags: ['Recent Menus Canvas', 'SuperAdmin Cache Limit', 'Hybrid Write-Behind Sync', 'Dapper + EF Core'],
    revisions: [
      {
        revNumber: 1,
        date: '2026-11-28',
        note: 'Implemented dbo.UserRecentMenuStates API, Local Storage write-behind cache, Header trigger & Right-Side Drawer canvas',
        author: 'Ajit',
      },
      {
        revNumber: 2,
        date: '2026-11-28',
        note: 'Added SuperAdmin-only RecentMenusLimit in Application Settings (dbo.AppUiSettings) enforced across all users in both Local Storage and SQL Server',
        author: 'Ajit',
      },
    ],
  },
  {
    id: 'rel-150',
    version: '1.5.0',
    type: 'Minor',
    revision: 2,
    title: 'Client-Approved @controls & 3 Interactive PROMPT Login Screens',
    completionDate: '2026-11-28',
    branch: 'main',
    author: 'Ajit',
    description:
      'Delivered 3 interactive client-branded Login Screen concepts (Studio Split, Horizon Portal, Nocturne & Pulse) using approved @controls, official Prompt Solutions logos, #A1077E Maroon + 16 PROMPT brand swatches, 6-digit OTP verification, Multi-CR branch selector, PROMPT ERP SSO, and Engineered by SaNDS Lab Middle East W.L.L. attribution.',
    tags: ['3 Login Screens', 'Prompt Branding #A1077E', 'OTP & ERP SSO', 'SaNDS Lab Credit'],
    revisions: [
      {
        revNumber: 1,
        date: '2026-11-27',
        note: 'Initial release of Studio Split, Horizon Portal & Nocturne Pulse login screens',
        author: 'Ajit',
      },
      {
        revNumber: 2,
        date: '2026-11-28',
        note: 'Set Nocturne & Pulse default to White/Light, added Start_Local_5173.bat, and added Engineered by SaNDS Lab Middle East W.L.L. credit across all 3 login screens',
        author: 'Ajit',
      },
    ],
  },
  {
    id: 'rel-141',
    version: '1.4.1',
    type: 'Patch',
    revision: 1,
    title: 'Navigation Hover Dropdown Menu Stability Fix',
    completionDate: '2026-11-24',
    branch: 'main',
    author: 'Ajit',
    description:
      'Fixed hover dropdown menus closing when moving the cursor downward by adding an invisible CSS hover bridge (::before) and a 180ms grace timer across Horizontal, Docking, and Minimal Icon Rail layouts.',
    tags: ['Hover Menu Fix', 'AppShell', 'UX Polish'],
    revisions: [{ revNumber: 1, date: '2026-11-24', note: 'Verified smooth slow-cursor menu entry', author: 'Ajit' }],
  },
  {
    id: 'rel-140',
    version: '1.4.0',
    type: 'Minor',
    revision: 1,
    title: 'Dark/Light & 6 Elegant Themes, Timeline Control & Compliance Report',
    completionDate: '2026-11-24',
    branch: 'main',
    author: 'Ajit',
    description:
      'Added quick Sun/Moon Light-Dark toggle, 6 Executive Theme Presets (UniGlobal Light, Midnight Dark, Obsidian Gold, Royal Ivory, Emerald Executive, Nordic Slate), Vertical/Horizontal Timeline control (Req 3.1.11), and DOC-COMP-004 Compliance Report.',
    tags: ['Dark/Light Themes', 'Timeline Control', 'DOC-COMP-004'],
    revisions: [{ revNumber: 1, date: '2026-11-24', note: 'Initial minor release', author: 'Ajit' }],
  },
  {
    id: 'rel-131',
    version: '1.3.1',
    type: 'Patch',
    revision: 2,
    title: 'Header Reading-Comfort Font Controls (A-/A/A+) & Multi-Stakeholder Booking',
    completionDate: '2026-11-23',
    branch: 'main',
    author: 'Ajit',
    description:
      'Enabled multi-stakeholder selection when booking/editing appointments in ScheduleCalendar, added A-/A/A+ font size comfort controls in Header, and added Nginx X-Accel-Expires: 0 no-cache middleware.',
    tags: ['Multi-Stakeholder', 'A-/A/A+', 'Nginx No-Cache'],
    revisions: [
      { revNumber: 1, date: '2026-11-23', note: 'Added X-Accel-Expires: 0 no-cache fix & UG Suite header', author: 'Ajit' },
      { revNumber: 2, date: '2026-11-23', note: 'Added Multi-Stakeholder booking & Header A-/A/A+ controls', author: 'Ajit' },
    ],
  },
  {
    id: 'rel-121',
    version: '1.2.1',
    type: 'Patch',
    revision: 1,
    title: 'Sticky Menu CSS Fix (overflow-x: clip)',
    completionDate: '2026-11-22',
    branch: 'main',
    author: 'Ajit',
    description:
      'Fixed CSS sticky positioning for Vertical Sidebar and Horizontal Menu by changing html/body overflow-x from hidden to clip.',
    tags: ['Sticky Menu Fix', 'CSS'],
    revisions: [{ revNumber: 1, date: '2026-11-22', note: 'Verified sticky behavior on desktop & mobile', author: 'Ajit' }],
  },
  {
    id: 'rel-120',
    version: '1.2.0',
    type: 'Minor',
    revision: 2,
    title: '.NET 8 Clean Modular API, SQL Server 2022 & SuperAdmin DB Settings Live',
    completionDate: '2026-11-20',
    branch: 'main',
    author: 'Ajit',
    description:
      'Deployed ASP.NET Core 8.0 Web API (EF Core + Dapper + Swagger + DataAuditLogs + UserInteractionLogs) on AlmaLinux 8.10 (Kestrel + Apache/Nginx) at prompthrms.sandslab.com with SuperAdmin Corporate Identity DB save.',
    tags: ['.NET 8 API', 'SQL Server 2022', 'Swagger', 'Hangfire Plan'],
    revisions: [
      { revNumber: 1, date: '2026-11-20', note: 'Initial live server deployment on earth (prompthrms.sandslab.com)', author: 'Ajit' },
      { revNumber: 2, date: '2026-11-20', note: 'Enlarged UniGlobal header logo (44x44) & published DOC-ARCH-003', author: 'Ajit' },
    ],
  },
  {
    id: 'rel-110',
    version: '1.1.0',
    type: 'Minor',
    revision: 1,
    title: 'Appointments & Multi-Stakeholder Schedule Calendar + Mobile Responsiveness',
    completionDate: '2026-11-19',
    branch: 'main',
    author: 'Ajit',
    description:
      'Built 5-view ScheduleCalendar (Multi-Stakeholder, Day/Hour, Week, Month, Agenda) with drag-and-drop rescheduling, Mobile Slide-Out Navigation Drawer, Accordion Customizer, and Toast/Tooltip themes.',
    tags: ['ScheduleCalendar', 'Mobile Ready', 'Toasts & Tooltips'],
    revisions: [{ revNumber: 1, date: '2026-11-19', note: 'Completed responsive mobile audit & calendar cards', author: 'Ajit' }],
  },
  {
    id: 'rel-100',
    version: '1.0.0',
    type: 'Major',
    revision: 1,
    title: 'Phase 0 Foundation — Locked @controls UI Kit, Branding & Git Branches',
    completionDate: '2026-11-19',
    branch: 'main',
    author: 'Ajit',
    description:
      'Established centralized @controls repository (DataTable, Select2, DateCalendar, FormFields, MediaUpload, Modals, DashboardWidget), 4 Menu Modes (Vertical, Horizontal, Draggable Floating Dock, Minimal), UniGlobal official LogoIcon + Animated Loader, and Git branches (main, develop, Ajit, Ancy).',
    tags: ['Major Baseline', '@controls UI Kit', 'Git Setup'],
    revisions: [{ revNumber: 1, date: '2026-11-19', note: 'Baseline locked for Ajit & Ancy branches', author: 'Ajit' }],
  },
];

function loadReleases(): ReleaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_RELEASES;
    const parsed = JSON.parse(raw) as ReleaseRecord[];
    if (parsed.length === 0) return INITIAL_RELEASES;
    const cachedById = new Map(parsed.map((r) => [r.id, r]));
    const codeIds = new Set(INITIAL_RELEASES.map((r) => r.id));
    // Always pick whichever has the higher revision between shipped code and cached localStorage
    const mergedFromCode = INITIAL_RELEASES.map((shipped) => {
      const cached = cachedById.get(shipped.id);
      if (!cached) return shipped;
      return shipped.revision >= cached.revision ? shipped : cached;
    });
    const customOnly = parsed.filter((r) => !codeIds.has(r.id));
    return [...customOnly, ...mergedFromCode];
  } catch {
    return INITIAL_RELEASES;
  }
}

function suggestNextVersion(latest: string, type: ReleaseType): string {
  const parts = latest.replace(/^v/i, '').split('.').map((n) => Number(n) || 0);
  const [maj = 1, min = 0, pat = 0] = parts;
  if (type === 'Major') return `${maj + 1}.0.0`;
  if (type === 'Minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

export const ReleaseTimelinePage: React.FC = () => {
  const toast = useToast();
  const [releases, setReleases] = useState<ReleaseRecord[]>(loadReleases);

  // Add New Version modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [formType, setFormType] = useState<ReleaseType>('Minor');
  const [formVersion, setFormVersion] = useState(() => suggestNextVersion(releases[0]?.version ?? '1.0.0', 'Minor'));
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formBranch, setFormBranch] = useState('Ajit');
  const [formAuthor, setFormAuthor] = useState('Ajit');
  const [formTags, setFormTags] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Add Revision modal
  const [revTarget, setRevTarget] = useState<ReleaseRecord | null>(null);
  const [revNote, setRevNote] = useState('');
  const [revDate, setRevDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revAuthor, setRevAuthor] = useState('Ajit');

  const persist = (next: ReleaseRecord[]) => {
    setReleases(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const openNewVersionModal = () => {
    const latestVer = releases[0]?.version ?? '1.0.0';
    setFormType('Minor');
    setFormVersion(suggestNextVersion(latestVer, 'Minor'));
    setFormTitle('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTags('');
    setFormDesc('');
    setNewModalOpen(true);
  };

  const handleTypeChange = (nextType: ReleaseType) => {
    setFormType(nextType);
    const latestVer = releases[0]?.version ?? '1.0.0';
    setFormVersion(suggestNextVersion(latestVer, nextType));
  };

  const handleCreateRelease = () => {
    if (!formVersion.trim() || !formTitle.trim()) return;
    const cleanVer = formVersion.trim().replace(/^v/i, '');
    const record: ReleaseRecord = {
      id: `rel-${Date.now()}`,
      version: cleanVer,
      type: formType,
      revision: 1,
      title: formTitle.trim(),
      completionDate: formDate,
      branch: formBranch,
      author: formAuthor.trim() || 'Ajit',
      description: formDesc.trim(),
      tags: formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      revisions: [
        {
          revNumber: 1,
          date: formDate,
          note: 'Initial version release',
          author: formAuthor.trim() || 'Ajit',
        },
      ],
    };
    persist([record, ...releases]);
    setNewModalOpen(false);
    toast.success(`Version v${cleanVer} Logged`, `${formType} release recorded on timeline.`);
  };

  const handleAddRevision = () => {
    if (!revTarget || !revNote.trim()) return;
    const nextRevNum = revTarget.revision + 1;
    const next = releases.map((r) =>
      r.id === revTarget.id
        ? {
            ...r,
            revision: nextRevNum,
            completionDate: revDate,
            revisions: [
              ...r.revisions,
              {
                revNumber: nextRevNum,
                date: revDate,
                note: revNote.trim(),
                author: revAuthor.trim() || 'Ajit',
              },
            ],
          }
        : r
    );
    persist(next);
    toast.info(`v${revTarget.version} Updated to Rev ${nextRevNum}`, revNote.trim());
    setRevTarget(null);
    setRevNote('');
  };

  const timelineEvents: TimelineEvent[] = useMemo(
    () =>
      releases.map((r) => ({
        id: r.id,
        date: `${r.completionDate} • Rev ${r.revision}`,
        title: `v${r.version} — ${r.title}`,
        category: r.type,
        actor: `${r.author} (branch: ${r.branch})`,
        description:
          r.description +
          (r.revisions.length > 1
            ? ` | Latest Revision (Rev ${r.revision}): ${r.revisions[r.revisions.length - 1].note}`
            : ''),
        tone:
          r.type === 'Major'
            ? 'danger'
            : r.type === 'Minor'
            ? 'primary'
            : r.type === 'Patch'
            ? 'success'
            : 'warning',
        icon:
          r.type === 'Major' ? (
            <Rocket size={12} />
          ) : r.type === 'Minor' ? (
            <Layers size={12} />
          ) : (
            <Wrench size={12} />
          ),
        tags: [`v${r.version}`, `Rev ${r.revision}`, ...r.tags],
      })),
    [releases]
  );

  const totalRevisions = releases.reduce((acc, r) => acc + r.revision, 0);
  const majorCount = releases.filter((r) => r.type === 'Major').length;
  const minorCount = releases.filter((r) => r.type === 'Minor').length;
  const patchCount = releases.filter((r) => r.type === 'Patch' || r.type === 'Other').length;

  const columns: DataColumn<ReleaseRecord>[] = [
    {
      key: 'version',
      header: 'Version',
      sortable: true,
      render: (r) => <strong>v{r.version}</strong>,
      exportValue: (r) => `v${r.version}`,
    },
    {
      key: 'type',
      header: 'Release Type',
      sortable: true,
      render: (r) => (
        <Badge
          variant={
            r.type === 'Major'
              ? 'danger'
              : r.type === 'Minor'
              ? 'primary'
              : r.type === 'Patch'
              ? 'success'
              : 'warning'
          }
        >
          {r.type}
        </Badge>
      ),
    },
    {
      key: 'revision',
      header: 'Revision',
      sortable: true,
      render: (r) => <Badge variant="info">Rev {r.revision}</Badge>,
      exportValue: (r) => `Rev ${r.revision}`,
    },
    { key: 'title', header: 'Milestone / Update Title', sortable: true },
    { key: 'completionDate', header: 'Date of Completion', sortable: true },
    {
      key: 'branch',
      header: 'Branch / By',
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.84rem' }}>
          <GitBranch size={13} /> {r.branch} ({r.author})
        </span>
      ),
      exportValue: (r) => `${r.branch} (${r.author})`,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPI Header Strip */}
      <Card
        title="Development Process & Version Release Timeline"
        subtitle="Semantic Versioning (Major.Minor.Patch) with Completion Dates & Revision History Tracking"
        extra={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNewVersionModal}>
            Log New Version
          </Button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
          <div className="ug-timeline-card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ug-muted)', textTransform: 'uppercase' }}>
              Current Version
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ug-primary)', marginTop: 2 }}>
              v{releases[0]?.version ?? '1.0.0'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)' }}>
              Rev {releases[0]?.revision ?? 1} • {releases[0]?.completionDate}
            </div>
          </div>

          <div className="ug-timeline-card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ug-muted)', textTransform: 'uppercase' }}>
              Major / Minor / Patch
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ug-text)', marginTop: 2 }}>
              {majorCount} / {minorCount} / {patchCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)' }}>
              {releases.length} Total Releases
            </div>
          </div>

          <div className="ug-timeline-card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ug-muted)', textTransform: 'uppercase' }}>
              Total Revisions
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ug-accent)', marginTop: 2 }}>
              {totalRevisions}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)' }}>
              Tracked across all versions
            </div>
          </div>

          <div className="ug-timeline-card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ug-muted)', textTransform: 'uppercase' }}>
              Git Branches
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ug-success)', marginTop: 6 }}>
              main • develop • Ajit • Ancy
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)' }}>
              Synced with GitHub
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Timeline View */}
      <Timeline
        title="Release & Development Process Timeline"
        helpText="Filter by Major, Minor, Patch, or Other releases and toggle between Vertical and Horizontal timeline layouts."
        events={timelineEvents}
        defaultOrientation="vertical"
      />

      {/* Structured Release & Revision Table */}
      <DataTable
        title="Version & Revision Register"
        data={releases}
        columns={columns}
        pageSize={8}
        exportFileName="prompt-hrms-release-history"
        actions={(row) => (
          <Button
            variant="secondary"
            size="sm"
            icon={<History size={13} />}
            onClick={() => {
              setRevTarget(row);
              setRevNote('');
              setRevDate(new Date().toISOString().slice(0, 10));
            }}
          >
            + Revision
          </Button>
        )}
      />

      {/* Log New Version Modal */}
      <Modal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Log New Development Version"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={<GitCommitHorizontal size={14} />} onClick={handleCreateRelease}>
              Save Version
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ug-grid-2">
            <SelectControl
              label="Release Type"
              required
              value={formType}
              onChange={(v) => handleTypeChange(String(v) as ReleaseType)}
              options={[
                { value: 'Major', label: 'Major (X.0.0 — Breaking / Milestone)' },
                { value: 'Minor', label: 'Minor (1.X.0 — New Features)' },
                { value: 'Patch', label: 'Patch (1.0.X — Bug Fix / Polish)' },
                { value: 'Other', label: 'Other (Hotfix / Docs / Infra)' },
              ]}
            />
            <TextInput
              label="Version Number"
              required
              placeholder="e.g., 1.5.0"
              value={formVersion}
              onChange={(e) => setFormVersion(e.target.value)}
            />
          </div>

          <TextInput
            label="Update / Milestone Title"
            required
            placeholder="e.g., Phase 1 — JWT Auth, Field-Level RBAC & Employee Master"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="ug-grid-3">
            <TextInput
              label="Date of Completion"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <SelectControl
              label="Git Branch"
              value={formBranch}
              onChange={(v) => setFormBranch(String(v))}
              options={[
                { value: 'main', label: 'main' },
                { value: 'develop', label: 'develop' },
                { value: 'Ajit', label: 'Ajit' },
                { value: 'Ancy', label: 'Ancy' },
              ]}
            />
            <TextInput
              label="Completed By"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
            />
          </div>

          <TextInput
            label="Tags (comma-separated)"
            placeholder="e.g., Auth, RBAC, Employee Master"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
          />

          <TextArea
            label="Change Summary"
            placeholder="Describe features, fixes, or SQL/API updates completed in this version..."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Revision Modal */}
      <Modal
        open={Boolean(revTarget)}
        onClose={() => setRevTarget(null)}
        title={revTarget ? `Add Revision to v${revTarget.version} (Current: Rev ${revTarget.revision})` : 'Add Revision'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRevTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddRevision}>
              Save Rev {(revTarget?.revision ?? 1) + 1}
            </Button>
          </>
        }
      >
        {revTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--ug-text-secondary)' }}>
              <strong>Previous Revisions:</strong>
              <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>
                {revTarget.revisions.map((rv) => (
                  <li key={rv.revNumber}>
                    <strong>Rev {rv.revNumber}</strong> ({rv.date} • {rv.author}): {rv.note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ug-grid-2">
              <TextInput
                label="Revision Date"
                type="date"
                value={revDate}
                onChange={(e) => setRevDate(e.target.value)}
              />
              <TextInput
                label="Revised By"
                value={revAuthor}
                onChange={(e) => setRevAuthor(e.target.value)}
              />
            </div>

            <TextArea
              label="Revision Notes"
              required
              placeholder="What was revised in this version?"
              value={revNote}
              onChange={(e) => setRevNote(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
