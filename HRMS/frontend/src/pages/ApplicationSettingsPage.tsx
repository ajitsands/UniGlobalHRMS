import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppDateFormat,
  AppTimeFormat,
  Badge,
  Button,
  Card,
  CurrencyAmount,
  DATE_FORMAT_OPTIONS,
  DataColumn,
  DataTable,
  DateCalendar,
  GULF_COUNTRY_PRESETS,
  GULF_CURRENCIES,
  GULF_TIMEZONES,
  GulfCurrencyCode,
  GulfTimeZoneId,
  NumberInput,
  RadioGroup,
  RangeSlider,
  SelectControl,
  SwitchToggle,
  Tabs,
  useTheme,
  useToast,
} from '@controls';
import {
  Calendar,
  Clock,
  Coins,
  Globe2,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SamplePayrollPreviewRow {
  id: number;
  component: string;
  effectiveDate: string;
  baseBhd: number;
}

const SAMPLE_PAYROLL_ROWS: SamplePayrollPreviewRow[] = [
  { id: 1, component: 'Basic Monthly Salary', effectiveDate: '2026-11-01', baseBhd: 1250.5 },
  { id: 2, component: 'Housing & Transport Allowance', effectiveDate: '2026-11-01', baseBhd: 325.0 },
  { id: 3, component: 'Overtime Settlement (14h)', effectiveDate: '2026-11-25', baseBhd: 94.75 },
  { id: 4, component: 'Monthly EOSB Indemnity Provision', effectiveDate: '2026-11-28', baseBhd: 104.208 },
];

export const ApplicationSettingsPage: React.FC = () => {
  const {
    language,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    currencyCode,
    setCurrencyCode,
    showCurrencyCode,
    setShowCurrencyCode,
    showCurrencyOnTotals,
    setShowCurrencyOnTotals,
    currencyMeta,
    timeZone,
    setTimeZone,
    applyGulfCountryPreset,
    formatDate,
    formatTime,
    formatDateTime,
    todayIso,
    recentMenusLimit,
    setRecentMenusLimit,
    lockCorporateTheme,
    setLockCorporateTheme,
    userRole,
    isSavingToDb,
    dbConnected,
    lastSavedBy,
    lastSavedAtUtc,
    saveGlobalSettingsToDb,
  } = useTheme();
  const toast = useToast();
  const isAr = language === 'ar';

  const [now, setNow] = useState<Date>(() => new Date());
  const [sandboxDate, setSandboxDate] = useState<string>(() => todayIso());
  const [sandboxAmount, setSandboxAmount] = useState<string>('1250.500');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeTzMeta =
    GULF_TIMEZONES.find((t) => t.id === timeZone) ?? GULF_TIMEZONES[0];

  const handleSaveGlobalToDb = async () => {
    const ok = await saveGlobalSettingsToDb();
    if (ok) {
      toast.success(
        isAr ? 'تم حفظ إعدادات النظام بنجاح' : 'Global Application Settings Saved',
        `${dateFormat} • ${timeFormat} • ${currencyCode} (${currencyMeta.decimals} dec) • ${timeZone}`
      );
    } else {
      toast.warning(
        isAr ? 'تم التطبيق محلياً' : 'Applied Locally',
        'Saved in browser storage. Start .NET 8 API (:5050) or sign in as SuperAdmin to persist to SQL Server.'
      );
    }
  };

  const handleResetBahrainDefaults = () => {
    applyGulfCountryPreset('bahrain');
    toast.info(
      isAr ? 'تمت استعادة إعدادات مملكة البحرين الافتراضية' : 'Restored Kingdom of Bahrain Defaults',
      'DD-MM-YYYY • 12-Hour (AM/PM) • BHD (3 decimals) • Asia/Bahrain (UTC+03:00)'
    );
  };

  const previewColumns: DataColumn<SamplePayrollPreviewRow>[] = [
    { key: 'component', header: isAr ? 'البند' : 'Pay Component', sortable: true },
    {
      key: 'effectiveDate',
      header: isAr ? `تاريخ السريان (${dateFormat})` : `Effective Date (${dateFormat})`,
      sortable: true,
      render: (r) => <span>{formatDate(r.effectiveDate)}</span>,
    },
    {
      key: 'baseBhd',
      header: showCurrencyCode
        ? isAr
          ? `القيمة (${currencyCode})`
          : `Converted Amount (${currencyCode})`
        : isAr
        ? 'القيمة'
        : 'Converted Amount',
      sortable: true,
      render: (r) => <CurrencyAmount amount={r.baseBhd} convertFromBhd bold />,
    },
  ];

  const earningsSubtotalBhd = SAMPLE_PAYROLL_ROWS.slice(0, 3).reduce((s, r) => s + r.baseBhd, 0);
  const grandTotalBhd = SAMPLE_PAYROLL_ROWS.reduce((s, r) => s + r.baseBhd, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ====================================================================
          TOP EXECUTIVE STATUS & LIVE REGIONAL CLOCK BANNER
          ==================================================================== */}
      <Card
        title={isAr ? 'إعدادات النظام العامة (Application Settings)' : 'Global Application Settings'}
        subtitle={
          isAr
            ? 'مركز التحكم الموحد لتنسيقات التاريخ والوقت والعملة والمنطقة الزمنية لدول الخليج (الافتراضي: مملكة البحرين)'
            : 'Centralized Gulf regional formatting, currency precision, time zone & governance hub — Default: Kingdom of Bahrain'
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={handleResetBahrainDefaults}
            >
              {isAr ? 'استعادة افتراضي البحرين' : 'Reset Bahrain Default'}
            </Button>

            {userRole === 'SuperAdmin' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSavingToDb}
                icon={<Save size={14} />}
                onClick={handleSaveGlobalToDb}
              >
                {isSavingToDb
                  ? isAr
                    ? 'جاري الحفظ...'
                    : 'Saving to SQL Server...'
                  : isAr
                  ? 'حفظ الإعدادات لجميع المستخدمين'
                  : 'Save Global Settings to DB'}
              </Button>
            )}
          </div>
        }
      >
        {/* Live Active Settings Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--ug-surface-alt)',
              border: '1px solid var(--ug-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--ug-primary-soft)',
                color: 'var(--ug-primary)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-muted)', fontWeight: 700 }}>
                {isAr ? 'تنسيق التاريخ النشط' : 'ACTIVE DATE FORMAT'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {formatDate(now)}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-primary)', fontWeight: 600 }}>
                {dateFormat}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--ug-surface-alt)',
              border: '1px solid var(--ug-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--ug-primary-soft)',
                color: 'var(--ug-primary)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-muted)', fontWeight: 700 }}>
                {isAr ? 'الوقت المباشر والمنطقة الزمنية' : 'LIVE CLOCK & TIME ZONE'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(now, true)}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-primary)', fontWeight: 600 }}>
                {timeZone} ({activeTzMeta.utcOffset} • {timeFormat})
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--ug-surface-alt)',
              border: '1px solid var(--ug-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--ug-primary-soft)',
                color: 'var(--ug-primary)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Coins size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-muted)', fontWeight: 700 }}>
                {isAr ? 'العملة المعتمدة والدقة العشرية' : 'ACTIVE GULF CURRENCY'}
              </div>
              <div style={{ fontSize: '1.08rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                <CurrencyAmount amount={1250.5} bold />
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-primary)', fontWeight: 600 }}>
                {currencyMeta.code} • {currencyMeta.decimals} Decimals ({showCurrencyCode ? 'Code Shown' : showCurrencyOnTotals ? 'Totals Only' : 'Code Hidden'})
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ====================================================================
          1-CLICK GULF (GCC) COUNTRY JURISDICTION PRESETS (DEFAULT: BAHRAIN)
          ==================================================================== */}
      <Card
        title={isAr ? 'الإعدادات السريعة لدول مجلس التعاون الخليجي' : '1-Click Gulf (GCC) Country Presets'}
        subtitle={
          isAr
            ? 'اختر الدولة لتطبيق المنطقة الزمنية والعملة وتنسيق التاريخ والوقت تلقائياً (مملكة البحرين هي الافتراضي)'
            : 'Click any GCC country to apply its standard Currency, Decimal Precision, Time Zone, Date & Time format instantly'
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))',
            gap: 10,
          }}
        >
          {GULF_COUNTRY_PRESETS.map((preset) => {
            const isActive =
              currencyCode === preset.currency && timeZone === preset.timeZone;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  applyGulfCountryPreset(preset.id);
                  toast.success(
                    isAr ? `تم تطبيق إعدادات ${preset.countryAr}` : `Applied ${preset.country}`,
                    `${preset.currency} • ${preset.timeZone} • ${preset.dateFormat} • ${preset.timeFormat}`
                  );
                }}
                style={{
                  textAlign: 'start',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: isActive
                    ? '2px solid var(--ug-primary)'
                    : '1px solid var(--ug-border-strong)',
                  background: isActive ? 'var(--ug-primary-soft)' : 'var(--ug-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'all 0.16s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: '0.93rem', color: 'var(--ug-text)' }}>
                    {isAr ? preset.countryAr : preset.country}
                  </strong>
                  <Badge variant={isActive ? 'primary' : 'info'}>{preset.badge}</Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ug-text-secondary)' }}>
                  <strong>{preset.currency}</strong> • {preset.dateFormat} • {preset.timeFormat}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ug-muted)' }}>
                  Statutory: {preset.statutoryBody}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ====================================================================
          EXTENSIBLE MODULAR GLOBAL SETTINGS TABS
          ==================================================================== */}
      <Card
        title={isAr ? 'تكوين إعدادات النظام التفصيلية' : 'Detailed Global Configuration Modules'}
        subtitle={
          isAr
            ? 'جميع الشاشات والتقويمات والجداول وحقول الرواتب في النظام تعمل تلقائياً وفق هذه الإعدادات'
            : 'Every Calendar, Schedule, Table, Timestamp, and Currency Input across PROMPT HRMS reacts live to these settings'
        }
      >
        <Tabs
          items={[
            {
              id: 'date-time-tz',
              label: isAr ? '1. التاريخ والوقت والمنطقة الزمنية' : '1. Date, Time & Time Zone',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="ug-grid-2">
                    <SelectControl
                      label={isAr ? 'تنسيق التاريخ في النظام' : 'Global Date Format'}
                      required
                      helpText="Controls DateCalendar, ScheduleCalendar, Release Timeline, Audit Logs, and all tables/forms."
                      options={DATE_FORMAT_OPTIONS.map((o) => ({
                        value: o.value,
                        label: `${o.label}`,
                        group: `e.g. ${formatDate(now)}`,
                      }))}
                      value={dateFormat}
                      onChange={(val) => setDateFormat(val as AppDateFormat)}
                      clearable={false}
                    />

                    <SelectControl
                      label={isAr ? 'المنطقة الزمنية (Time Zone)' : 'Application Time Zone'}
                      required
                      helpText="Default: Asia/Bahrain (UTC+03:00). Governs live clocks, Today calculations, and UTC audit timestamp display."
                      options={GULF_TIMEZONES.map((tz) => ({
                        value: tz.id,
                        label: isAr ? tz.labelAr : tz.label,
                        group: tz.utcOffset,
                      }))}
                      value={timeZone}
                      onChange={(val) => setTimeZone(val as GulfTimeZoneId)}
                      clearable={false}
                    />
                  </div>

                  <RadioGroup
                    label={isAr ? 'نظام عرض الوقت (12 ساعة / 24 ساعة)' : 'Global Time Display Format'}
                    name="global-time-format"
                    value={timeFormat}
                    onChange={(val) => setTimeFormat(val as AppTimeFormat)}
                    options={[
                      {
                        value: '12h',
                        label: isAr ? 'نظام 12 ساعة (صباحاً / مساءً — الافتراضي)' : '12-Hour Clock (AM / PM — Default)',
                        description: `Live sample: ${
                          timeFormat === '12h' ? formatTime(now, true) : '02:30:00 PM'
                        }`,
                      },
                      {
                        value: '24h',
                        label: isAr ? 'نظام 24 ساعة (Enterprise / Biometric)' : '24-Hour Clock (00:00 – 23:59)',
                        description: `Live sample: ${
                          timeFormat === '24h' ? formatTime(now, true) : '14:30:00'
                        }`,
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              id: 'currency-precision',
              label: isAr ? '2. العملات الخليجية ودقة الرواتب' : '2. Gulf Currency & Precision',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <SelectControl
                    label={isAr ? 'العملة الأساسية للنظام' : 'Primary Application Currency'}
                    required
                    helpText="BHD, KWD, and OMR automatically enforce 3 decimal places (0.001); SAR, AED, QAR, and USD enforce 2 decimal places (0.01)."
                    options={GULF_CURRENCIES.map((c) => ({
                      value: c.code,
                      label: `${c.code} — ${isAr ? c.nameAr : c.name}`,
                      group: `${c.decimals} Decimals (${c.subUnit})`,
                    }))}
                    value={currencyCode}
                    onChange={(val) => setCurrencyCode(val as GulfCurrencyCode)}
                    clearable={false}
                  />

                  {/* Currency Code Display Policy (Line Items vs Report Totals / Subtotals) */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: 'var(--ug-surface-alt)',
                      border: '1px solid var(--ug-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--ug-text)' }}>
                      {isAr ? 'خيارات إظهار رمز العملة في النظام والتقارير' : 'Currency Code Display Options (Application & Reports)'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <SwitchToggle
                        checked={showCurrencyCode}
                        onChange={setShowCurrencyCode}
                        label={
                          isAr
                            ? `إظهار رمز العملة (${currencyCode}) في جميع شاشات وحقول النظام`
                            : `Display Currency Code (${currencyCode}) Across Application (Line Items, Inputs & Cards)`
                        }
                        helpText="When ON, displays a refined smaller currency code beside every amount and inside currency inputs. When OFF, hides the currency code across regular rows and inputs."
                      />

                      <SwitchToggle
                        checked={showCurrencyOnTotals}
                        onChange={setShowCurrencyOnTotals}
                        label={
                          isAr
                            ? `إظهار رمز العملة (${currencyCode}) في المجاميع الفرعية والإجماليات داخل التقارير والجداول`
                            : `Display Currency Code (${currencyCode}) on Totals & Subtotals in Reports / Tables`
                        }
                        helpText="Recommended ON: Keeps the currency code visible on Subtotal and Grand Total summary rows in reports even when hidden on individual line items."
                      />
                    </div>

                    {/* Instant Visual Comparison Strip */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 10,
                        paddingTop: 8,
                        borderTop: '1px dashed var(--ug-border-strong)',
                      }}
                    >
                      <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--ug-surface)', border: '1px solid var(--ug-border)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--ug-muted)', fontWeight: 600 }}>
                          {isAr ? 'معاينة بند عادي (Line Item)' : 'Regular Line Item Preview'}
                        </div>
                        <div style={{ fontSize: '1.08rem', marginTop: 2 }}>
                          <CurrencyAmount amount={1250.5} convertFromBhd bold />
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--ug-primary-soft)', border: '1px solid var(--ug-primary)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--ug-primary)', fontWeight: 700 }}>
                          {isAr ? 'معاينة المجموع الفرعي / الإجمالي (Subtotal / Total)' : 'Report Subtotal / Grand Total Preview'}
                        </div>
                        <div style={{ fontSize: '1.08rem', marginTop: 2, color: 'var(--ug-primary)' }}>
                          <CurrencyAmount amount={6916.5} convertFromBhd isTotal bold />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {GULF_CURRENCIES.map((cur) => {
                      const sel = cur.code === currencyCode;
                      return (
                        <button
                          key={cur.code}
                          type="button"
                          onClick={() => setCurrencyCode(cur.code)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: sel ? '2px solid var(--ug-primary)' : '1px solid var(--ug-border)',
                            background: sel ? 'var(--ug-primary-soft)' : 'var(--ug-surface)',
                            textAlign: 'start',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--ug-text)' }}>{cur.code}</strong>
                            <Badge variant={cur.decimals === 3 ? 'primary' : 'info'}>
                              {cur.decimals} Decimals
                            </Badge>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--ug-text-secondary)' }}>
                            {isAr ? cur.nameAr : cur.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ug-muted)' }}>
                            Step: <code>{cur.step}</code> • {cur.subUnit}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            },
            {
              id: 'cache-governance',
              label: isAr ? '3. الذاكرة المؤقتة والحوكمة (SuperAdmin)' : '3. System Cache & Governance',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {userRole === 'SuperAdmin' ? (
                    <>
                      <RangeSlider
                        label={isAr ? 'الحد الأقصى للقوائم الأخيرة لكل مستخدم' : 'Recent Menus Cache Limit (Per User, System-Wide)'}
                        helpText="Fixed by SuperAdmin in dbo.AppUiSettings. Governs how many recent menus are cached in Local Storage and SQL Server for all users."
                        min={1}
                        max={30}
                        step={1}
                        unit=" menus"
                        value={Math.min(30, recentMenusLimit)}
                        onChange={setRecentMenusLimit}
                      />

                      <SwitchToggle
                        label={isAr ? 'تثبيت الهوية المؤسسية لجميع المستخدمين' : 'Lock Corporate Identity & Theme for Standard Users'}
                        helpText="When enabled, standard users inherit Corporate Theme & Layout settings fixed by SuperAdmin."
                        checked={lockCorporateTheme}
                        onChange={setLockCorporateTheme}
                      />
                    </>
                  ) : (
                    <Alert variant="warning" title="SuperAdmin Protected Governance">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lock size={15} />
                        <span>
                          Recent Menu Cache Limit is fixed at <strong>{recentMenusLimit} menus</strong> per user by{' '}
                          <strong>SuperAdmin</strong>. Switch to SuperAdmin role to modify system-wide governance settings.
                        </span>
                      </div>
                    </Alert>
                  )}

                  <Alert variant="info" title={isAr ? 'بنية قابلة للتوسع للإعدادات القادمة' : 'Extensible Global Settings Registry'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Sparkles size={15} />
                      <span>
                        Ready for upcoming Phase 1–3 global parameters: <strong>GCC Working Week (Sun–Thu / Mon–Fri)</strong>,{' '}
                        <strong>CPR / Passport Expiry Alert Lead Days (90/60/30d)</strong>,{' '}
                        <strong>Monthly Payroll Cut-Off Day</strong>, and <strong>PROMPT ERP General Ledger Posting Rules</strong>.
                      </span>
                    </div>
                  </Alert>
                </div>
              ),
            },
            {
              id: 'live-verification',
              label: isAr ? '4. معاينة حية لتأثير الإعدادات' : '4. Live Application Behavior Sandbox',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="ug-grid-2">
                    <DateCalendar
                      label={`Live DateCalendar (${dateFormat})`}
                      helpText="Pick any date or click Today — displays immediately in your active Date Format & Time Zone."
                      value={sandboxDate}
                      onChange={setSandboxDate}
                    />
                    <NumberInput
                      label={
                        showCurrencyCode
                          ? `Live Salary Input (${currencyCode} • ${currencyMeta.decimals} Decimals)`
                          : `Live Salary Input (${currencyMeta.decimals} Decimals • Code Hidden)`
                      }
                      useGlobalCurrency
                      helpText={`Step automatically adapts to ${currencyMeta.step} (${currencyMeta.subUnit}).`}
                      value={sandboxAmount}
                      onChange={(e) => setSandboxAmount(e.target.value)}
                    />
                  </div>

                  <DataTable
                    title={isAr ? 'معاينة جدول الرواتب والمجاميع الفرعية والإجمالية' : 'Live Payroll Report Preview (Line Items + Subtotal & Grand Total)'}
                    columns={previewColumns}
                    data={SAMPLE_PAYROLL_ROWS}
                    pageSize={5}
                    summaryRows={[
                      {
                        id: 'sub-earnings',
                        cells: {
                          component: isAr ? 'المجموع الفرعي (الاستحقاقات المباشرة)' : 'Subtotal — Direct Earnings',
                          effectiveDate: formatDate('2026-11-28'),
                          baseBhd: <CurrencyAmount amount={earningsSubtotalBhd} convertFromBhd isTotal bold />,
                        },
                      },
                      {
                        id: 'grand-total',
                        highlight: true,
                        cells: {
                          component: isAr ? 'الإجمالي الكلي (شامل مخصص نهاية الخدمة)' : 'Grand Total — Monthly Payroll & EOSB Cost',
                          effectiveDate: formatDate('2026-11-28'),
                          baseBhd: <CurrencyAmount amount={grandTotalBhd} convertFromBhd isTotal bold />,
                        },
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />

        {/* Persistence Footer Status */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid var(--ug-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: 'var(--ug-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} style={{ color: 'var(--ug-success)' }} />
            {dbConnected ? 'SQL Server 2022 Connected' : 'Local Storage Active'}
            {lastSavedAtUtc && (
              <>
                {' '}
                • Last Saved by <strong>{lastSavedBy || 'SuperAdmin'}</strong> on{' '}
                <strong>{formatDateTime(lastSavedAtUtc)}</strong>
              </>
            )}
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Globe2 size={14} />
            Default Jurisdiction: <strong>Kingdom of Bahrain (BHD • Asia/Bahrain • DD-MM-YYYY)</strong>
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationSettingsPage;
