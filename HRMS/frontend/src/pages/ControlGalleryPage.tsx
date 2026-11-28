import React, { useState } from 'react';
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmPopup,
  CurrencyAmount,
  DashboardWidget,
  DataColumn,
  DataTable,
  DateCalendar,
  Drawer,
  DropdownMenu,
  DualRangeSlider,
  FileUpload,
  FontSizeControl,
  HelpPopup,
  HelpTag,
  ImageUpload,
  Modal,
  NumberInput,
  PromptLogo,
  PromptLogoIcon,
  RadioGroup,
  RangeSlider,
  ScheduleAppointment,
  ScheduleCalendar,
  SelectControl,
  Stakeholder,
  SwitchToggle,
  Tabs,
  TextArea,
  TextInput,
  Timeline,
  TimelineEvent,
  ToastPosition,
  Tooltip,
  UniGlobalLoader,
  useTheme,
  useToast,
} from '@controls';
import { Award, Briefcase, CheckCircle2, FileCheck2, Plane, Plus, Trash2, User } from 'lucide-react';

interface DemoEmployee {
  id: number;
  code: string;
  name: string;
  unit: string;
  country: string;
  salaryBhd: number;
  status: 'Active' | 'Probation';
}

const DEMO_EMPLOYEES: DemoEmployee[] = [
  { id: 1, code: 'UG-1001', name: 'Ahmed Al-Khalifa', unit: 'BU-1 Sales', country: 'Bahrain', salaryBhd: 1250.5, status: 'Active' },
  { id: 2, code: 'UG-1002', name: 'Sara Mansoor', unit: 'BU-2 Finance', country: 'Bahrain', salaryBhd: 980.0, status: 'Active' },
  { id: 3, code: 'UG-1003', name: 'Faisal Al-Sabah', unit: 'BU-3 Logistics', country: 'Kuwait', salaryBhd: 1420.75, status: 'Probation' },
  { id: 4, code: 'UG-1004', name: 'Noora Al-Doseri', unit: 'BU-4 Operations', country: 'Bahrain', salaryBhd: 875.25, status: 'Active' },
  { id: 5, code: 'UG-1005', name: 'Rami Haddad', unit: 'BU-5 IT', country: 'Kuwait', salaryBhd: 1600.0, status: 'Active' },
  { id: 6, code: 'UG-1006', name: 'Fatima Hassan', unit: 'BU-1 Sales', country: 'Bahrain', salaryBhd: 790.0, status: 'Probation' },
];

const DEMO_STAKEHOLDERS: Stakeholder[] = [
  { id: 'hr', name: 'Amina Al-Bahrani', role: 'HR Manager', color: '#1B365D' },
  { id: 'fin', name: 'Khalid Mansoor', role: 'Finance / Payroll', color: '#B31B34' },
  { id: 'bu1', name: 'Tariq Al-Sabah', role: 'BU-1 Director', color: '#059669' },
  { id: 'it', name: 'Rami Haddad', role: 'IT / Biometrics', color: '#d97706' },
];

const INITIAL_APPOINTMENTS: ScheduleAppointment[] = [
  { id: 'a1', title: 'Bahrain SIO Monthly Cut-off', stakeholderId: 'fin', date: '2026-11-19', startHour: 9, durationHours: 1, allDay: true, category: 'Payroll' },
  { id: 'a2', title: 'Senior Sales Candidate Interview', stakeholderId: 'hr', date: '2026-11-19', startHour: 9, durationHours: 1, category: 'Interview' },
  { id: 'a3', title: 'Payroll 4-Eyes Sign-off', stakeholderIds: ['hr', 'fin'], date: '2026-11-19', startHour: 11, durationHours: 1, category: 'Payroll' },
  { id: 'a4', title: 'BU-1 Probation Appraisal Review', stakeholderId: 'bu1', date: '2026-11-19', startHour: 10, durationHours: 1, category: 'Review' },
  { id: 'a5', title: 'Kuwait Biometric Clock Sync Test', stakeholderId: 'it', date: '2026-11-19', startHour: 14, durationHours: 2, category: 'Training' },
  { id: 'a6', title: 'Onboarding Induction Batch #4', stakeholderId: 'hr', date: '2026-11-20', startHour: 10, durationHours: 2, category: 'Training' },
];

const DEMO_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    date: '15 Nov 2026',
    title: 'Annual Leave Approved (12 Days)',
    category: 'Leave',
    actor: 'Tariq Al-Sabah (Line Manager)',
    description: 'Annual paid leave with air ticket entitlement approved and synced to payroll accruals.',
    tone: 'info',
    icon: <Plane size={12} />,
    tags: ['Annual Leave', 'Air Ticket Accrued'],
  },
  {
    id: 'tl-2',
    date: '02 Oct 2026',
    title: 'CPR & LMRA Work Permit Renewed',
    category: 'Documents',
    actor: 'Amina Al-Bahrani (HR Manager)',
    description: 'New expiry set to 02 Oct 2028. Previous document version archived automatically (Req 3.1.06).',
    tone: 'success',
    icon: <FileCheck2 size={12} />,
    tags: ['CPR', 'LMRA', 'v2 Archived'],
  },
  {
    id: 'tl-3',
    date: '01 Jul 2026',
    title: 'Promoted to Senior Sales Executive & Increment',
    category: 'Promotion',
    actor: 'HR & Finance Approval',
    description: 'Appraisal rating 4.8/5 triggered grade upgrade and basic salary revision.',
    tone: 'primary',
    icon: <Award size={12} />,
    tags: ['BHD 1,050 → BHD 1,250.500', 'Grade G5'],
  },
  {
    id: 'tl-4',
    date: '15 Apr 2026',
    title: 'Probation Completed & Confirmed',
    category: 'Career',
    actor: 'Amina Al-Bahrani (HR Manager)',
    description: '90-day probation review signed off; permanent employment status activated.',
    tone: 'success',
    icon: <CheckCircle2 size={12} />,
    tags: ['Permanent'],
  },
  {
    id: 'tl-5',
    date: '15 Jan 2026',
    title: 'Joined UniGlobal — BU-1 Sales (Bahrain CR)',
    category: 'Career',
    actor: 'HR Onboarding',
    description: 'Onboarding checklist 100% completed (Contract, Bank IBAN, Laptop Custody, SIO Registration).',
    tone: 'warning',
    icon: <Briefcase size={12} />,
    tags: ['BU-1 Sales', 'Bahrain SIO'],
  },
];

export const ControlGalleryPage: React.FC = () => {
  const toast = useToast();
  const { isDarkTheme, currencyCode, currencyMeta, showCurrencyCode, formatCurrency, formatDate } = useTheme();
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>(INITIAL_APPOINTMENTS);
  const [empName, setEmpName] = useState('Ahmed Al-Khalifa');
  const [salary, setSalary] = useState('1250.500');
  const [notes, setNotes] = useState('');
  const [country, setCountry] = useState<string | string[]>('bh');
  const [skills, setSkills] = useState<string | string[]>(['payroll', 'sio']);
  const [joinDate, setJoinDate] = useState('2026-11-18');
  const [rangeStart, setRangeStart] = useState('2026-11-10');
  const [rangeEnd, setRangeEnd] = useState('2026-11-18');
  const [payMode, setPayMode] = useState('bank');
  const [isGosi, setIsGosi] = useState(true);
  const [ackPolicy, setAckPolicy] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [docs, setDocs] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(150);
  const [salaryMin, setSalaryMin] = useState(600);
  const [salaryMax, setSalaryMax] = useState(2500);
  const [showOverlayLoader, setShowOverlayLoader] = useState(false);

  const columns: DataColumn<DemoEmployee>[] = [
    { key: 'code', header: 'Emp Code', sortable: true },
    { key: 'name', header: 'Employee Name', sortable: true },
    { key: 'unit', header: 'Business Unit', sortable: true },
    { key: 'country', header: 'Jurisdiction', sortable: true },
    {
      key: 'salaryBhd',
      header: showCurrencyCode ? `Gross (${currencyCode})` : 'Gross Salary',
      sortable: true,
      align: 'end',
      render: (r) => <CurrencyAmount amount={r.salaryBhd} convertFromBhd bold />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Active' ? 'success' : 'warning'}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Alert
        variant="info"
        title="Common Controls Repository — Locked UI Kit"
      >
        All branches (<strong>Ajit</strong> & <strong>Ancy</strong>) import controls from{' '}
        <code>@controls</code>. Use the <strong>Customize</strong> button in the header to test
        Vertical, Horizontal, Docking, Minimal menus, Single/Gradient themes, and Arabic RTL.
      </Alert>

      {/* Interactive Dashboard Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))', gap: 16 }}>
        <DashboardWidget
          title="Headcount by Business Unit"
          helpText="Switch between Bar, Line, Pie, or Tabular view as per user preference."
          defaultView="bar"
          data={[
            { label: 'BU-1', value: 42 },
            { label: 'BU-2', value: 28 },
            { label: 'BU-3', value: 35 },
            { label: 'BU-4', value: 19 },
            { label: 'BU-5', value: 24 },
          ]}
        />
        <DashboardWidget
          title="Payroll Split (Bahrain vs Kuwait)"
          helpText="Customizable chart view for monthly payroll distribution."
          defaultView="pie"
          unit="k"
          data={[
            { label: 'Bahrain SIO', value: 68 },
            { label: 'Kuwait PIFSS', value: 32 },
            { label: 'Allowances', value: 24 },
          ]}
        />
      </div>

      {/* Appointments & Multi-Stakeholder Schedule Calendar */}
      <ScheduleCalendar
        title="Appointments & Multi-Stakeholder Schedule Calendar"
        stakeholders={DEMO_STAKEHOLDERS}
        appointments={appointments}
        onChange={setAppointments}
        onNotify={(msg) => toast.info('Schedule Updated', msg)}
        defaultView="stakeholders"
        initialDate="2026-11-19"
      />

      {/* Employee History Timeline Control (Req 3.1.11) */}
      <Timeline
        title="Employee History Timeline Control (Vertical / Horizontal)"
        helpText="Chronological employee lifecycle timeline combining joining, probation, promotions, documents, and leave (Req 3.1.11)."
        events={DEMO_TIMELINE_EVENTS.map((ev) => ({
          ...ev,
          date: formatDate(ev.date),
          tags:
            ev.id === 'tl-3'
              ? [`${formatCurrency(1050, true)} → ${formatCurrency(1250.5, true)}`, 'Grade G5']
              : ev.tags,
        }))}
        defaultOrientation="vertical"
      />

      {/* Form Controls, Combo (Select2), Calendars, Radio, Switches & Uploads */}
      <Card
        title="Form Controls, Select2 Combo, Calendars & Media Upload"
        helpText="Standardized form primitives with built-in validation, currency support, and Help Tags."
        extra={
          <HelpPopup
            title="Form Standards"
            summary="Every form field supports HelpTag tooltips, required markers, and RTL alignment."
            steps={[
              'Import fields from @controls instead of raw <input> tags.',
              'Attach helpText to provide inline ? guidance for end users.',
            ]}
          />
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
          <TextInput
            label="Employee Full Name"
            required
            icon={<User size={15} />}
            helpText="Enter legal name as per CPR or Passport."
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
          />

          <NumberInput
            label={showCurrencyCode ? `Basic Salary (${currencyCode})` : 'Basic Salary'}
            required
            useGlobalCurrency
            helpText={`${currencyMeta.decimals}-decimal precision (${currencyMeta.subUnit}) from Application Settings.`}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <SelectControl
            label="Jurisdiction (Select2 Single)"
            required
            helpText="Determines statutory SIO (Bahrain) or PIFSS (Kuwait) rules."
            value={country}
            onChange={setCountry}
            options={[
              { value: 'bh', label: 'Kingdom of Bahrain (SIO)', group: 'GCC' },
              { value: 'kw', label: 'State of Kuwait (PIFSS)', group: 'GCC' },
              { value: 'ae', label: 'United Arab Emirates', group: 'GCC' },
            ]}
          />

          <SelectControl
            label="Assigned Modules (Select2 Multi)"
            multiple
            helpText="Searchable multi-select combo with removable chips."
            value={skills}
            onChange={setSkills}
            options={[
              { value: 'payroll', label: 'Payroll Engine' },
              { value: 'sio', label: 'SIO / PIFSS Statutory' },
              { value: 'biometric', label: 'Biometric Sync' },
              { value: 'eosb', label: 'EOSB Indemnity' },
            ]}
          />

          <DateCalendar
            label="Joining Date (Calendar)"
            required
            helpText="Supports holiday & Ramadan date highlights."
            value={joinDate}
            onChange={setJoinDate}
            highlightedDates={{ '2026-11-18': 'National Day Prep' }}
          />

          <DateCalendar
            label="Leave Period (Date Range)"
            rangeMode
            value={rangeStart}
            onChange={setRangeStart}
            endDate={rangeEnd}
            onEndDateChange={setRangeEnd}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginTop: 16 }}>
          <RadioGroup
            label="Disbursement Mode"
            name="payMode"
            helpText="Select WPS bank transfer or cheque."
            value={payMode}
            onChange={setPayMode}
            options={[
              { value: 'bank', label: 'WPS Bank Transfer', description: 'Standard Bahrain/Kuwait WPS' },
              { value: 'cheque', label: 'Cheque / Cash', description: 'Final settlement exception' },
            ]}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            <SwitchToggle
              label="Enable Social Insurance (SIO / PIFSS)"
              helpText="Automatically calculates employee & employer shares."
              checked={isGosi}
              onChange={setIsGosi}
            />
            <Checkbox
              label="Employee acknowledged HR & Confidentiality Policy"
              checked={ackPolicy}
              onChange={setAckPolicy}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16, marginTop: 16 }}>
          <ImageUpload
            label="Employee Photo / CPR Scan (Image Upload)"
            helpText="Drag & drop PNG/JPG up to 5 MB with live preview."
            value={photo}
            onChange={(url) => setPhoto(url)}
          />
          <FileUpload
            label="Supporting Documents (Passport, Visa, Medical)"
            helpText="Multi-file uploader with file size & remove support."
            files={docs}
            onChange={setDocs}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <TextArea
            label="HR Remarks"
            placeholder="Optional audit remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Card>

      {/* Sliders, Font Sizing & Dropdown Menus with Sub-Menus */}
      <Card
        title="Sliders, Font Sizing & Dropdown Menus (with Sub-Menus)"
        helpText="Reusable slider filters, global font size controls, and nested action dropdowns."
        extra={
          <DropdownMenu
            label="Actions Menu"
            variant="primary"
            items={[
              { id: 'new', label: 'Add New Employee', icon: <Plus size={14} /> },
              {
                id: 'export',
                label: 'Export Reports',
                subItems: [
                  { id: 'exp-bahrain', label: 'Bahrain SIO File' },
                  { id: 'exp-kuwait', label: 'Kuwait PIFSS File' },
                  { id: 'exp-wps', label: 'WPS Bank Sheet' },
                ],
              },
              { id: 'del', label: 'Archive Selected', danger: true, icon: <Trash2 size={14} /> },
            ]}
          />
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 18 }}>
          <RangeSlider
            label="Mobile Check-In Geofence Radius"
            helpText="Allowed GPS distance from office for remote check-in."
            min={50}
            max={500}
            step={10}
            unit="m"
            value={geofenceRadius}
            onChange={setGeofenceRadius}
          />
          <DualRangeSlider
            label={showCurrencyCode ? `Salary Grade Filter (${currencyCode})` : 'Salary Grade Filter'}
            helpText="Filter reports or payroll runs by min-max salary range."
            min={300}
            max={5000}
            step={50}
            unit={showCurrencyCode ? ` ${currencyCode}` : ''}
            minValue={salaryMin}
            maxValue={salaryMax}
            onChange={(lo, hi) => {
              setSalaryMin(lo);
              setSalaryMax(hi);
            }}
          />
          <FontSizeControl />
        </div>
      </Card>

      {/* DataTable */}
      <DataTable
        title="Employee Directory (Standard DataTable)"
        data={DEMO_EMPLOYEES}
        columns={columns}
        pageSize={4}
        exportFileName="uniglobal-employees"
        summaryRows={[
          {
            id: 'sub-active',
            cells: {
              name: 'Subtotal — Active Confirmed Staff',
              salaryBhd: (
                <CurrencyAmount
                  amount={DEMO_EMPLOYEES.filter((e) => e.status === 'Active').reduce((s, e) => s + e.salaryBhd, 0)}
                  convertFromBhd
                  isTotal
                  bold
                />
              ),
            },
          },
          {
            id: 'grand-payroll',
            highlight: true,
            cells: {
              name: 'Grand Total — Monthly Gross Payroll',
              salaryBhd: (
                <CurrencyAmount
                  amount={DEMO_EMPLOYEES.reduce((s, e) => s + e.salaryBhd, 0)}
                  convertFromBhd
                  isTotal
                  bold
                />
              ),
            },
          },
        ]}
        actions={(_row) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip content="Quick View in Drawer">
              <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
                View
              </Button>
            </Tooltip>
            <Tooltip content="Delete Record" theme="danger">
              <Button
                variant="danger-ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setConfirmOpen(true)}
              />
            </Tooltip>
          </div>
        )}
      />

      {/* Accordion, Tabs, Modals & Popups */}
      <Card
        title="Accordion, Tabs, Modals, Drawers & Popups"
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Confirm Popup
            </Button>
          </div>
        }
      >
        <Tabs
          items={[
            {
              id: 'acc',
              label: 'Accordion Pattern',
              content: (
                <Accordion
                  defaultOpenIds={['a1']}
                  items={[
                    {
                      id: 'a1',
                      title: 'Bahrain Labour Law 2012 — EOSB Indemnity Formula',
                      content: '15 days per year for the first 3 years, 1 full month per year thereafter.',
                    },
                    {
                      id: 'a2',
                      title: 'Kuwait Labour Law No. 6 of 2010 — EOSB Indemnity Formula',
                      content: '15 days per year for the first 5 years, 1 full month per year thereafter.',
                    },
                  ]}
                />
              ),
            },
            {
              id: 'help',
              label: 'Tooltips & Help Tags',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Tooltip content="Gray neutral tooltip" theme="gray">
                      <Button variant="secondary" size="sm">Gray Tooltip</Button>
                    </Tooltip>
                    <Tooltip content="Brand Primary tooltip" theme="primary">
                      <Button variant="primary" size="sm">Primary Tooltip</Button>
                    </Tooltip>
                    <Tooltip content="Saved successfully!" theme="success">
                      <Button size="sm" style={{ background: 'var(--ug-success)', color: '#fff' }}>Success Tooltip</Button>
                    </Tooltip>
                    <Tooltip content="Action cannot be undone!" theme="danger">
                      <Button variant="danger" size="sm">Danger Tooltip</Button>
                    </Tooltip>
                    <Tooltip content="Expiring in 7 days!" theme="warning">
                      <Button size="sm" style={{ background: 'var(--ug-warning)', color: '#fff' }}>Warning Tooltip</Button>
                    </Tooltip>
                    <Tooltip content="Synced with PROMPT ERP" theme="info">
                      <Button size="sm" style={{ background: 'var(--ug-info)', color: '#fff' }}>Info Tooltip</Button>
                    </Tooltip>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span>
                      Help Tag (Primary): <HelpTag title="Salary Confidentiality" text="Restricted by field-level RBAC." theme="primary" />
                    </span>
                    <span>
                      Help Tag (Warning): <HelpTag title="Payroll Cut-off" text="Attendance locks automatically on the 25th." theme="warning" />
                    </span>
                    <span>
                      Help Tag (Info): <HelpTag title="SIO / PIFSS" text="Auto-calculated based on employee nationality." theme="info" />
                    </span>
                  </div>
                </div>
              ),
            },
            {
              id: 'toasts',
              label: 'Toast Notifications',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      style={{ background: 'var(--ug-success)', color: '#fff' }}
                      onClick={() =>
                        toast.success('Employee Saved', 'UG-1001 record was saved and logged in Audit Trail.')
                      }
                    >
                      Success Toast
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        toast.danger('Payroll Locked', 'Preparer cannot approve their own payroll run (4-eyes rule).')
                      }
                    >
                      Danger Toast
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: 'var(--ug-warning)', color: '#fff' }}
                      onClick={() =>
                        toast.warning('Document Expiring Soon', '3 employee CPR/Visas expire within 15 days.')
                      }
                    >
                      Warning Toast
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: 'var(--ug-info)', color: '#fff' }}
                      onClick={() =>
                        toast.info('Biometric Sync Complete', '142 attendance punches imported from Bahrain & Kuwait.')
                      }
                    >
                      Info Toast
                    </Button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.889rem', fontWeight: 600, color: 'var(--ug-muted)' }}>
                      Position:
                    </span>
                    {(['top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-left'] as ToastPosition[]).map(
                      (pos) => (
                        <Button
                          key={pos}
                          variant={toast.position === pos ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => toast.setPosition(pos)}
                        >
                          {pos}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ),
            },
            {
              id: 'loader',
              label: 'Prompt Brand Logo & Animated Loader',
              content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PromptLogo variant={isDarkTheme ? 'white' : 'color'} height={36} badgeText="HRMS" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PromptLogoIcon size={36} />
                    <span style={{ fontSize: '0.926rem', fontWeight: 600 }}>Favicon Emblem</span>
                  </div>
                  <UniGlobalLoader size="sm" label="Small Loader" />
                  <UniGlobalLoader size="md" label="Syncing Payroll..." />
                  <UniGlobalLoader size="lg" label="Generating WPS..." />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowOverlayLoader(true);
                      setTimeout(() => setShowOverlayLoader(false), 2000);
                    }}
                  >
                    Test 2s Overlay Loader
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {showOverlayLoader && <UniGlobalLoader size="lg" overlay label="Processing PROMPT HRMS..." />}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Standard Modal Dialog"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Close</Button>
            <Button size="sm" onClick={() => setModalOpen(false)}>Save Changes</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          This standardized Modal supports <code>sm</code>, <code>md</code>, <code>lg</code>, and <code>xl</code> sizes
          and inherits all theme colors automatically.
        </p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Employee Quick Details Drawer">
        <p style={{ color: 'var(--ug-text-secondary)' }}>
          Slide-over Drawer for viewing timelines, audit history, or approval details without leaving the grid.
        </p>
      </Drawer>

      <ConfirmPopup
        open={confirmOpen}
        title="Confirm Action"
        message="Are you sure you want to proceed? All actions are recorded in the User Interaction & Audit Log."
        danger
        confirmLabel="Yes, Proceed"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
