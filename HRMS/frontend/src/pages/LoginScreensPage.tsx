import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  HelpPopup,
  Modal,
  PromptLogo,
  RadioGroup,
  SelectControl,
  SwitchToggle,
  Tabs,
  TextInput,
  Tooltip,
  UniGlobalLoader,
  UserRole,
  useTheme,
  useToast,
} from '@controls';
import {
  ArrowRight,
  Award,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Fingerprint,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  Moon,
  Palette,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  User,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';

export type LoginConceptId = 'studio' | 'horizon' | 'nocturne';

export interface AuthenticatedSession {
  userId: string;
  displayName: string;
  roleTitle: string;
  role: UserRole;
  companyCr: string;
  companyLabel: string;
  targetMenuId?: string;
  loginConcept: LoginConceptId;
  accentHex: string;
}

export interface LoginScreensPageProps {
  onAuthenticated: (session: AuthenticatedSession) => void;
  isPreviewInsideApp?: boolean;
  onReturnToApp?: () => void;
  initialConcept?: LoginConceptId;
}

interface PromptSwatch {
  name: string;
  hex: string;
}

/**
 * Exact 16-Color Palette from Client's PROMPT Settings Concept Reference
 * Default: Maroon (#A1077E)
 */
const PROMPT_PALETTES: PromptSwatch[] = [
  { name: 'Maroon', hex: '#A1077E' },
  { name: 'Green', hex: '#00A76F' },
  { name: 'Olive', hex: '#6B8E23' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Cyan', hex: '#0891B2' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Maroon 2', hex: '#A01800' },
  { name: 'Magenta', hex: '#D912E6' },
  { name: 'Navy Blue', hex: '#13215C' },
  { name: 'Deep Blue', hex: '#243070' },
];

interface DemoPersona {
  id: string;
  label: string;
  labelAr: string;
  userId: string;
  displayName: string;
  roleTitle: string;
  role: UserRole;
  mobile: string;
  companyCr: string;
  defaultMenu: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'superadmin',
    label: 'SuperAdmin',
    labelAr: 'المدير العام',
    userId: 'ADMIN-01',
    displayName: 'Ajit Kumar',
    roleTitle: 'System SuperAdmin',
    role: 'SuperAdmin',
    mobile: '3944 0100',
    companyCr: 'CR-102401',
    defaultMenu: 'dashboard',
  },
  {
    id: 'hr-mgr',
    label: 'HR Manager',
    labelAr: 'مدير الموارد البشرية',
    userId: 'HR-MGR-02',
    displayName: 'Sara Al-Khalifa',
    roleTitle: 'Head of People & Culture',
    role: 'SuperAdmin',
    mobile: '3988 2210',
    companyCr: 'CR-102401',
    defaultMenu: 'emp-directory',
  },
  {
    id: 'payroll',
    label: 'Payroll Lead',
    labelAr: 'مسؤول الرواتب',
    userId: 'PAY-04',
    displayName: 'Khalid Mansoor',
    roleTitle: 'Finance & WPS Payroll Lead',
    role: 'User',
    mobile: '3612 8840',
    companyCr: 'CR-102402',
    defaultMenu: 'pay-run',
  },
  {
    id: 'ess',
    label: 'Employee ESS',
    labelAr: 'الخدمة الذاتية',
    userId: 'EMP-1012',
    displayName: 'Noora Al-Doseri',
    roleTitle: 'Senior Consultant (Self-Service)',
    role: 'User',
    mobile: '3320 1012',
    companyCr: 'CR-102403',
    defaultMenu: 'att-leave',
  },
];

const COMPANY_BRANCH_OPTIONS = [
  {
    value: 'CR-102401',
    label: 'UniGlobal Consultancy W.L.L. — HQ Manama',
    group: 'CR 102401-1',
  },
  {
    value: 'CR-102402',
    label: 'UniGlobal Outsourcing & Staffing — Seef Branch',
    group: 'CR 102402-1',
  },
  {
    value: 'CR-102403',
    label: 'UniGlobal Advisory & Training — Diplomatic Area',
    group: 'CR 102403-1',
  },
  {
    value: 'CR-102404',
    label: 'Prompt Solutions ERP Shared Services — Riffa',
    group: 'CR 102404-1',
  },
];

interface ModuleSpotlight {
  id: string;
  title: string;
  titleAr: string;
  metric: string;
  summary: string;
  summaryAr: string;
  menuId: string;
  icon: React.ReactNode;
}

const HR_MODULES: ModuleSpotlight[] = [
  {
    id: 'employees',
    title: 'Employees',
    titleAr: 'الموظفون',
    metric: '4 CRs • 5 Business Units',
    summary: 'Unified digital personnel files, CPR/Passport expiry alerts, and multi-CR transfers.',
    summaryAr: 'ملفات الموظفين الرقمية الموحدة وتنبيهات انتهاء الوثائق ونقل السجلات التجارية.',
    menuId: 'emp-directory',
    icon: <Users size={18} />,
  },
  {
    id: 'attendance',
    title: 'Attendance',
    titleAr: 'الحضور والانصراف',
    metric: '98.6% Real-Time Sync',
    summary: 'Biometric terminal punches, mobile geo-fenced check-in, and shift roster automation.',
    summaryAr: 'ربط أجهزة البصمة وتسجيل الحضور عبر الجوال وجدولة المناوبات.',
    menuId: 'att-biometric',
    icon: <Clock size={18} />,
  },
  {
    id: 'leave',
    title: 'Leave',
    titleAr: 'الإجازات',
    metric: 'Bahrain Labour Law Ready',
    summary: 'Automated annual, sick,hajj & maternity accruals with multi-level manager approvals.',
    summaryAr: 'احتساب تلقائي لرصيد الإجازات السنوية والمرضية مع سلسلة موافقات مرنة.',
    menuId: 'att-leave',
    icon: <CalendarCheck2 size={18} />,
  },
  {
    id: 'payroll',
    title: 'Payroll',
    titleAr: 'الرواتب ونهاية الخدمة',
    metric: 'WPS SIF + GOSI + EOSB',
    summary: 'One-click monthly payroll validation, indemnity accrual, and PROMPT ERP GL posting.',
    summaryAr: 'مسير رواتب معتمد مع نظام حماية الأجور والتأمينات ومكافأة نهاية الخدمة.',
    menuId: 'pay-run',
    icon: <Wallet size={18} />,
  },
  {
    id: 'selfservice',
    title: 'Self-Service',
    titleAr: 'الخدمة الذاتية',
    metric: 'EN / AR Web & Mobile',
    summary: 'Instant payslips, salary certificates, profile updates, and OTP passwordless access.',
    summaryAr: 'قسائم الرواتب وشهادات الراتب وتحديث البيانات برمز التحقق السريع.',
    menuId: 'emp-letters',
    icon: <Smartphone size={18} />,
  },
  {
    id: 'appraisals',
    title: 'Recruitment & KPI',
    titleAr: 'التوظيف وتقييم الأداء',
    metric: '360° Talent Lifecycle',
    summary: 'Multi-stakeholder interview scheduling, onboarding checklists, and KPI appraisals.',
    summaryAr: 'جدولة المقابلات ومهام التعيين وتقييم الأداء الدوري.',
    menuId: 'emp-onboarding',
    icon: <Award size={18} />,
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenHex(hex: string, factor = 0.2): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - factor)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - factor)));
  const b = Math.max(0, Math.round((num & 255) * (1 - factor)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function lightenHex(hex: string, factor = 0.38): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor));
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * factor));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const LoginScreensPage: React.FC<LoginScreensPageProps> = ({
  onAuthenticated,
  isPreviewInsideApp = false,
  onReturnToApp,
  initialConcept = 'studio',
}) => {
  const {
    language,
    setLanguage,
    fontSizePx,
    setFontSizePx,
    setUserRole,
    setThemeMode,
    setPrimaryColor,
  } = useTheme();
  const toast = useToast();
  const isAr = language === 'ar';

  // Active Login Concept & PROMPT Theme Swatch (Defaults to #A1077E Maroon per client sample)
  const [concept, setConcept] = useState<LoginConceptId>(() => {
    const saved = localStorage.getItem('prompt_hrms_login_concept') as LoginConceptId | null;
    return saved && ['studio', 'horizon', 'nocturne'].includes(saved) ? saved : initialConcept;
  });
  const [swatchHex, setSwatchHex] = useState<string>(
    () => localStorage.getItem('prompt_hrms_login_swatch') || '#A1077E'
  );
  const [loginDark, setLoginDark] = useState<boolean>(() => concept === 'nocturne');
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [syncThemeOnLogin, setSyncThemeOnLogin] = useState<boolean>(true);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Interactive Form State
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('superadmin');
  const [userId, setUserId] = useState<string>('ADMIN-01');
  const [password, setPassword] = useState<string>('Prompt@2026');
  const [mobileNo, setMobileNo] = useState<string>('3944 0100');
  const [companyCr, setCompanyCr] = useState<string>('CR-102401');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [erpMode, setErpMode] = useState<string>('connected');
  const [launchSelfServiceCheckIn, setLaunchSelfServiceCheckIn] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // OTP Interactive State
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const DEMO_OTP = '482910';

  // Concept-specific Interactive State
  const [activeSpotlightId, setActiveSpotlightId] = useState<string>('employees');
  const [horizonStep, setHorizonStep] = useState<1 | 2>(1);
  const [nocturneAuthTab, setNocturneAuthTab] = useState<'password' | 'otp'>('password');
  const [liveNow, setLiveNow] = useState<Date>(() => new Date());

  // Modals (Forgot Password & PROMPT ERP SSO Handshake)
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const [recoveryChannel, setRecoveryChannel] = useState<string>('email');
  const [recoveryIdentity, setRecoveryIdentity] = useState<string>('ajit@uniglobal.bh');
  const [recoverySent, setRecoverySent] = useState<boolean>(false);

  const [erpModalOpen, setErpModalOpen] = useState<boolean>(false);
  const [erpTenantCode, setErpTenantCode] = useState<string>('PROMPT-BH-PROD');

  // Switch concept -> default Nocturne to Dark and Studio/Horizon to Light for authentic preview
  const handleSelectConcept = (next: LoginConceptId) => {
    setConcept(next);
    setLoginDark(next === 'nocturne');
    setFormError('');
    try {
      localStorage.setItem('prompt_hrms_login_concept', next);
    } catch {
      // ignore
    }
  };

  const handleSelectSwatch = (hex: string) => {
    setSwatchHex(hex);
    try {
      localStorage.setItem('prompt_hrms_login_swatch', hex);
    } catch {
      // ignore
    }
  };

  // Close palette popover on outside click
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  // Live clock for Nocturne & Studio
  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = window.setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [otpCountdown]);

  const applyPersona = (p: DemoPersona) => {
    setSelectedPersonaId(p.id);
    setUserId(p.userId);
    setPassword('Prompt@2026');
    setMobileNo(p.mobile);
    setCompanyCr(p.companyCr);
    setFormError('');
    toast.info(
      isAr ? `تم اختيار حساب: ${p.labelAr}` : `Loaded ${p.label} Profile`,
      `${p.displayName} (${p.userId}) • ${p.roleTitle}`,
      2400
    );
  };

  const activeSpotlight = useMemo(
    () => HR_MODULES.find((m) => m.id === activeSpotlightId) ?? HR_MODULES[0],
    [activeSpotlightId]
  );

  const activeSwatchName = useMemo(
    () => PROMPT_PALETTES.find((s) => s.hex.toLowerCase() === swatchHex.toLowerCase())?.name ?? 'Custom',
    [swatchHex]
  );

  // Scoped CSS tokens so every @controls component inside Login adopts #A1077E (or chosen swatch) + Light/Dark
  const effectivePrimary = loginDark ? lightenHex(swatchHex, 0.22) : swatchHex;
  const heroBgGradient = `linear-gradient(145deg, ${swatchHex} 0%, ${darkenHex(swatchHex, 0.34)} 100%)`;

  const scopedThemeVars: React.CSSProperties = {
    ['--ug-primary' as string]: effectivePrimary,
    ['--ug-primary-hover' as string]: darkenHex(effectivePrimary, 0.14),
    ['--ug-primary-soft' as string]: hexToRgba(effectivePrimary, loginDark ? 0.22 : 0.11),
    ['--ug-active-bg' as string]: swatchHex,
    ['--ug-accent' as string]: '#F7A600',
    ...(loginDark
      ? {
          ['--ug-bg' as string]: '#0B0F14',
          ['--ug-surface' as string]: '#121820',
          ['--ug-surface-alt' as string]: '#1B232C',
          ['--ug-text' as string]: '#F5F7FA',
          ['--ug-text-secondary' as string]: '#C4CDD5',
          ['--ug-muted' as string]: '#9AA6B2',
          ['--ug-border' as string]: 'rgba(154, 166, 178, 0.16)',
          ['--ug-border-strong' as string]: 'rgba(154, 166, 178, 0.28)',
        }
      : {
          ['--ug-bg' as string]: '#F6F7F9',
          ['--ug-surface' as string]: '#FFFFFF',
          ['--ug-surface-alt' as string]: '#F0F3F7',
          ['--ug-text' as string]: '#1C252E',
          ['--ug-text-secondary' as string]: '#454F5B',
          ['--ug-muted' as string]: '#637381',
          ['--ug-border' as string]: 'rgba(145, 158, 171, 0.26)',
          ['--ug-border-strong' as string]: 'rgba(145, 158, 171, 0.42)',
        }),
  };

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSendOtp = () => {
    if (!userId.trim()) {
      setFormError(isAr ? 'يرجى إدخال الرقم الوظيفي أو البريد الإلكتروني.' : 'Please enter your Employee ID or email first.');
      return;
    }
    setFormError('');
    setOtpSent(true);
    setOtpCountdown(59);
    setOtpDigits(['', '', '', '', '', '']);
    toast.info(
      isAr ? 'تم إرسال رمز التحقق' : 'Verification Code Sent',
      isAr
        ? `تم إرسال الرمز إلى +973 ${mobileNo} (رمز التجربة: ${DEMO_OTP})`
        : `Sent to +973 ${mobileNo} — Demo OTP: ${DEMO_OTP}`
    );
    window.setTimeout(() => otpRefs.current[0]?.focus(), 80);
  };

  const handleOtpDigitChange = (idx: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 1) {
      // Handle full 6-digit paste
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, i) => {
        if (idx + i < 6) next[idx + i] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(5, idx + chars.length);
      otpRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[idx] = clean;
    setOtpDigits(next);
    if (clean && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const fillDemoOtp = () => {
    setOtpDigits(DEMO_OTP.split(''));
    setFormError('');
  };

  const completeSignIn = (overrideMenuId?: string, viaMethod = 'Password') => {
    const persona =
      DEMO_PERSONAS.find((p) => p.userId.toLowerCase() === userId.trim().toLowerCase()) ??
      DEMO_PERSONAS.find((p) => p.id === selectedPersonaId) ??
      DEMO_PERSONAS[0];
    const companyObj =
      COMPANY_BRANCH_OPTIONS.find((c) => c.value === companyCr) ?? COMPANY_BRANCH_OPTIONS[0];

    setIsAuthenticating(true);
    window.setTimeout(() => {
      setUserRole(persona.role);
      if (syncThemeOnLogin) {
        setThemeMode('single');
        setPrimaryColor(swatchHex);
      }
      setIsAuthenticating(false);
      const targetMenu =
        overrideMenuId ??
        (launchSelfServiceCheckIn ? 'att-biometric' : persona.defaultMenu);

      toast.success(
        isAr ? `مرحباً بعودتك، ${persona.displayName}` : `Welcome back, ${persona.displayName}!`,
        `${companyObj.label} • Signed in via ${viaMethod}`
      );

      onAuthenticated({
        userId: userId.trim() || persona.userId,
        displayName: persona.displayName,
        roleTitle: persona.roleTitle,
        role: persona.role,
        companyCr: companyObj.value,
        companyLabel: companyObj.label,
        targetMenuId: targetMenu,
        loginConcept: concept,
        accentHex: swatchHex,
      });
    }, 680);
  };

  const handlePasswordSubmit = (e?: React.FormEvent, targetMenuId?: string) => {
    e?.preventDefault();
    if (!userId.trim()) {
      setFormError(isAr ? 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.' : 'Please enter your User ID or corporate email.');
      return;
    }
    if (!password || password.length < 4) {
      setFormError(isAr ? 'يرجى إدخال كلمة المرور.' : 'Please enter a valid password.');
      return;
    }
    if (!companyCr) {
      setFormError(isAr ? 'يرجى اختيار الشركة والفرع.' : 'Please select a Company CR & Branch.');
      return;
    }
    setFormError('');
    completeSignIn(targetMenuId, 'Credentials');
  };

  const handleVerifyOtpSubmit = () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setFormError(isAr ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' : 'Please enter all 6 digits of the verification code.');
      return;
    }
    setFormError('');
    completeSignIn(undefined, 'One-Time Code (OTP)');
  };

  /* ---------------- Shared Sub-Renders ---------------- */
  const renderPersonaQuickBar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: '0.815rem', fontWeight: 700, color: 'var(--ug-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isAr ? 'تجربة سريعة للأدوار:' : 'Quick Interactive Persona Fill:'}
        </span>
        <Badge variant="primary">
          {DEMO_PERSONAS.find((p) => p.id === selectedPersonaId)?.role ?? 'SuperAdmin'}
        </Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {DEMO_PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ug-login-role-chip ${selectedPersonaId === p.id ? 'active' : ''}`}
            onClick={() => applyPersona(p)}
          >
            <UserCheck size={13} />
            {isAr ? p.labelAr : p.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderOtpInteractiveBlock = () => (
    <div className="ug-login-fade-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TextInput
        label={isAr ? 'الرقم الوظيفي أو البريد الإلكتروني' : 'Employee Number or Email'}
        required
        icon={<User size={16} />}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="e.g. EMP-1012"
        helpText="Your PROMPT HRMS Employee ID or registered corporate email."
      />

      <TextInput
        label={isAr ? 'رقم الجوال المسجل (+973)' : 'Registered Mobile (+973)'}
        icon={<Smartphone size={16} />}
        value={mobileNo}
        onChange={(e) => setMobileNo(e.target.value)}
        placeholder="3944 0100"
      />

      {!otpSent ? (
        <Button
          type="button"
          size="lg"
          icon={<Smartphone size={17} />}
          onClick={handleSendOtp}
          style={{ width: '100%' }}
        >
          {isAr ? 'إرسال رمز التحقق لمرة واحدة' : 'Send One-Time Verification Code'}
        </Button>
      ) : (
        <div
          className="ug-login-fade-panel"
          style={{
            padding: 14,
            borderRadius: 12,
            background: 'var(--ug-surface-alt)',
            border: '1px solid var(--ug-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: '0.889rem', fontWeight: 700 }}>
              {isAr ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter 6-Digit Verification Code'}
            </span>
            <button
              type="button"
              onClick={fillDemoOtp}
              style={{
                border: 'none',
                background: 'var(--ug-primary-soft)',
                color: 'var(--ug-primary)',
                padding: '3px 9px',
                borderRadius: 999,
                fontSize: '0.778rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isAr ? `تعبئة تلقائية (${DEMO_OTP})` : `Auto-Fill Demo (${DEMO_OTP})`}
            </button>
          </div>

          <div className="ug-login-otp-row">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                aria-label={`OTP digit ${idx + 1}`}
                className="ug-login-otp-input"
                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.815rem', color: 'var(--ug-muted)' }}>
            <span>
              {otpCountdown > 0
                ? isAr
                  ? `إعادة الإرسال خلال ${otpCountdown} ثانية`
                  : `Resend code in 00:${String(otpCountdown).padStart(2, '0')}`
                : isAr
                ? 'لم يصلك الرمز؟'
                : 'Did not receive the SMS?'}
            </span>
            <button
              type="button"
              disabled={otpCountdown > 0}
              onClick={handleSendOtp}
              style={{
                border: 'none',
                background: 'none',
                color: otpCountdown > 0 ? 'var(--ug-muted)' : 'var(--ug-primary)',
                fontWeight: 700,
                cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isAr ? 'إعادة إرسال الرمز' : 'Resend Code'}
            </button>
          </div>

          <Button
            type="button"
            size="lg"
            icon={<CheckCircle2 size={17} />}
            onClick={handleVerifyOtpSubmit}
            style={{ width: '100%' }}
          >
            {isAr ? 'تأكيد الرمز والدخول' : 'Verify & Sign In'}
          </Button>
        </div>
      )}
    </div>
  );

  const formattedClock = liveNow.toLocaleDateString(isAr ? 'ar-BH' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = liveNow.toLocaleTimeString(isAr ? 'ar-BH' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`ug-login-scope ${loginDark ? 'is-dark' : ''}`} style={scopedThemeVars}>
      {isAuthenticating && (
        <UniGlobalLoader
          overlay
          brand="prompt"
          size="lg"
          label={isAr ? 'جاري التحقق وتجهيز مساحة العمل...' : 'Authenticating & preparing your PROMPT HRMS workspace...'}
        />
      )}

      {/* ====================================================================
          TOP INTERACTIVE CONCEPT SWITCHER & PROMPT PALETTE BAR
          ==================================================================== */}
      <div className="ug-login-switcher-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Badge variant="primary">
            <Sparkles size={12} />
            {isAr ? 'شاشات الدخول التفاعلية' : 'PROMPT Login Showcase'}
          </Badge>

          <div className="ug-login-concept-pills" role="tablist" aria-label="Login screen design styles">
            <button
              type="button"
              role="tab"
              aria-selected={concept === 'studio'}
              className={`ug-login-concept-pill ${concept === 'studio' ? 'active' : ''}`}
              onClick={() => handleSelectConcept('studio')}
            >
              <Layers size={14} />
              {isAr ? '1. ستوديو (Studio Split)' : '1. Studio Split'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={concept === 'horizon'}
              className={`ug-login-concept-pill ${concept === 'horizon' ? 'active' : ''}`}
              onClick={() => handleSelectConcept('horizon')}
            >
              <Building2 size={14} />
              {isAr ? '2. هورايزن (Horizon Portal)' : '2. Horizon Portal'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={concept === 'nocturne'}
              className={`ug-login-concept-pill ${concept === 'nocturne' ? 'active' : ''}`}
              onClick={() => handleSelectConcept('nocturne')}
            >
              <Fingerprint size={14} />
              {isAr ? '3. نوكتورن بلس (Nocturne & Pulse)' : '3. Nocturne & Pulse'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* 16-Color PROMPT Theme Swatch Picker */}
          <div ref={paletteRef} style={{ position: 'relative' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: swatchHex,
                    display: 'inline-block',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
                  }}
                />
              }
              onClick={() => setPaletteOpen((o) => !o)}
            >
              <Palette size={14} />
              <span>{activeSwatchName}</span>
            </Button>

            {paletteOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  insetInlineEnd: 0,
                  width: 312,
                  background: 'var(--ug-surface)',
                  border: '1px solid var(--ug-border-strong)',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.26)',
                  zIndex: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.963rem' }}>
                    {isAr ? 'ألوان برومبت (16 لون)' : 'PROMPT 16 Brand Swatches'}
                  </strong>
                  <Badge variant="primary">{swatchHex}</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 7 }}>
                  {PROMPT_PALETTES.map((sw) => {
                    const selected = sw.hex.toLowerCase() === swatchHex.toLowerCase();
                    return (
                      <Tooltip key={sw.name} content={sw.name}>
                        <button
                          type="button"
                          aria-label={sw.name}
                          onClick={() => handleSelectSwatch(sw.hex)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: 'none',
                            background: sw.hex,
                            cursor: 'pointer',
                            boxShadow: selected
                              ? `0 0 0 2px var(--ug-surface), 0 0 0 4px ${sw.hex}`
                              : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                            transform: selected ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 0.15s ease',
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--ug-border)', paddingTop: 10 }}>
                  <SwitchToggle
                    checked={syncThemeOnLogin}
                    onChange={setSyncThemeOnLogin}
                    label={isAr ? 'تطبيق اللون على النظام بعد الدخول' : 'Carry color into HRMS on Sign-In'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Font Comfort A- / A / A+ */}
          <div
            className="ug-hide-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--ug-border-strong)',
              borderRadius: 8,
              background: 'var(--ug-surface)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              style={{ borderRadius: 0, padding: '4px 8px' }}
              onClick={() => setFontSizePx(Math.max(10, Number((fontSizePx - 1).toFixed(1))))}
            >
              A-
            </button>
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              style={{
                borderRadius: 0,
                padding: '4px 7px',
                borderInline: '1px solid var(--ug-border)',
                color: 'var(--ug-primary)',
                fontWeight: 700,
              }}
              onClick={() => setFontSizePx(13.5)}
            >
              A
            </button>
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              style={{ borderRadius: 0, padding: '4px 8px' }}
              onClick={() => setFontSizePx(Math.min(20, Number((fontSizePx + 1).toFixed(1))))}
            >
              A+
            </button>
          </div>

          {/* Light / Dark Mode */}
          <Tooltip content={loginDark ? 'Switch Login to Light Mode' : 'Switch Login to Dark Mode'} placement="bottom">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={loginDark ? <Sun size={14} style={{ color: '#F59E0B' }} /> : <Moon size={14} />}
              onClick={() => setLoginDark((d) => !d)}
              aria-label="Toggle Light or Dark mode"
            />
          </Tooltip>

          {/* Language EN / AR */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Globe size={14} />}
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          >
            {isAr ? 'English' : 'عربي'}
          </Button>

          <HelpPopup
            title="PROMPT HRMS — Sign-In & Security Guide"
            summary="Explore 3 interactive client-branded Login Screen concepts built exclusively with the approved @controls library and official Prompt Solutions branding."
            steps={[
              'Switch between 1. Studio Split, 2. Horizon Portal, and 3. Nocturne & Pulse at the top bar.',
              'Click any Quick Persona chip (SuperAdmin, HR Manager, Payroll Lead, Employee ESS) to auto-fill credentials.',
              'Try Password Sign-In, 6-Digit One-Time Code (OTP), or PROMPT ERP Single Sign-On.',
              'Click the Maroon palette button to test all 16 PROMPT Settings brand colors in Light or Dark mode.',
            ]}
            manualSection="Section 1.1 — Authentication, Multi-CR & ERP SSO"
          />

          {isPreviewInsideApp && onReturnToApp && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<LayoutDashboard size={14} />}
              onClick={onReturnToApp}
            >
              {isAr ? 'العودة للنظام' : 'Back to Workspace'}
            </Button>
          )}
        </div>
      </div>

      {/* ====================================================================
          SCREEN 1: STUDIO SPLIT (Inspired by Client A1_Studio_Login.html)
          Bold Maroon (#A1077E) Split Hero + Interactive Module Spotlight + @controls Tabs
          ==================================================================== */}
      {concept === 'studio' && (
        <div className="ug-login-studio-grid ug-login-fade-panel">
          {/* Left Maroon Brand Hero */}
          <section className="ug-login-studio-hero" style={{ background: heroBgGradient }}>
            {/* Decorative Concentric Orbital Circles from Client Reference */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 540,
                height: 540,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                insetInlineEnd: -170,
                top: -150,
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 360,
                height: 360,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                insetInlineEnd: -80,
                top: -60,
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 310,
                height: 310,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                insetInlineStart: -110,
                bottom: -110,
                pointerEvents: 'none',
              }}
            />

            {/* Official Prompt White Logo */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <PromptLogo variant="white" height={50} badgeText="HRMS" />
              <span
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  fontSize: '0.815rem',
                  fontWeight: 600,
                }}
              >
                UG Suite • v2.0
              </span>
            </div>

            {/* Hero Copy + Interactive Module Chips */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 580 }}>
              <span style={{ fontSize: '0.852rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.88 }}>
                {isAr ? 'برومبت لإدارة الموارد البشرية' : 'PROMPT HRMS • ENTERPRISE PEOPLE SUITE'}
              </span>
              <h1 style={{ margin: 0, fontSize: '2.85rem', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.8px' }}>
                {isAr
                  ? 'الموظفون والرواتب والحضور – في مكان واحد.'
                  : 'People, pay and attendance – in one place.'}
              </h1>
              <p style={{ margin: 0, fontSize: '1.08rem', lineHeight: 1.6, opacity: 0.92 }}>
                {isAr
                  ? 'سجلات الموظفين، الحضور، الإجازات، الرواتب والخدمة الذاتية باللغتين العربية والإنجليزية. يعمل بشكل مستقل أو متكامل مع نظام PROMPT ERP.'
                  : 'Employee records, attendance, leave, payroll and self-service, in English and Arabic. Runs standalone or seamlessly inside PROMPT ERP.'}
              </p>

              {/* Clickable Module Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HR_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    className={`ug-login-hero-chip ${activeSpotlightId === mod.id ? 'active' : ''}`}
                    onClick={() => setActiveSpotlightId(mod.id)}
                  >
                    {mod.icon}
                    {isAr ? mod.titleAr : mod.title}
                  </button>
                ))}
              </div>

              {/* Live Interactive Feature Spotlight Glass Card */}
              <div
                key={activeSpotlight.id}
                className="ug-login-fade-panel"
                style={{
                  marginTop: 4,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.13)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: '1 1 260px' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {activeSpotlight.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.037rem' }}>
                        {isAr ? activeSpotlight.titleAr : activeSpotlight.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'rgba(255, 255, 255, 0.22)',
                        }}
                      >
                        {activeSpotlight.metric}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.889rem', opacity: 0.92, lineHeight: 1.45 }}>
                      {isAr ? activeSpotlight.summaryAr : activeSpotlight.summary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePasswordSubmit(undefined, activeSpotlight.menuId)}
                  style={{
                    border: '1px solid rgba(255,255,255,0.55)',
                    background: 'rgba(255,255,255,0.16)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '0.852rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isAr ? 'دخول مباشر' : 'Open Module'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Hero Footer */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: '0.852rem', opacity: 0.86 }}>
              <span>© 2026 Prompt Solutions · UniGlobal Consultancy W.L.L.</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} />
                TLS 1.3 Encrypted · SQL Server 2022 Audit Ready
              </span>
            </div>
          </section>

          {/* Right Interactive Sign-In Studio */}
          <section className="ug-login-studio-form-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Badge variant="info">
                <Clock size={12} />
                {formattedTime}
              </Badge>
              <span style={{ fontSize: '0.852rem', color: 'var(--ug-muted)' }}>
                {isAr ? 'اختر طريقة تسجيل الدخول' : 'Standalone or Integrated ERP Sign-In'}
              </span>
            </div>

            <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.95rem', fontWeight: 800, color: 'var(--ug-text)' }}>
                  {isAr ? 'مرحباً بعودتك' : 'Welcome back'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.98rem', color: 'var(--ug-muted)' }}>
                  {isAr ? 'سجّل الدخول للمتابعة إلى نظام PROMPT HRMS.' : 'Sign in to continue to PROMPT HRMS.'}
                </p>
              </div>

              {renderPersonaQuickBar()}

              {formError && (
                <Alert variant="danger" title={isAr ? 'تنبيه الدخول' : 'Sign-In Validation'} onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              <Tabs
                items={[
                  {
                    id: 'pwd',
                    label: isAr ? 'كلمة المرور' : 'Password Sign-In',
                    content: (
                      <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <TextInput
                          label={isAr ? 'اسم المستخدم أو البريد الإلكتروني' : 'User ID or Email'}
                          required
                          icon={<User size={16} />}
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="e.g. ADMIN-01 or name@uniglobal.bh"
                          helpText="Enter your Employee Code, User ID, or corporate email address."
                        />

                        <div>
                          <TextInput
                            label={isAr ? 'كلمة المرور' : 'Password'}
                            type="password"
                            required
                            icon={<Lock size={16} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyUp={checkCapsLock}
                            placeholder="Enter your password"
                          />
                          {capsLockOn && (
                            <div style={{ marginTop: 4 }}>
                              <Badge variant="warning">Caps Lock is ON</Badge>
                            </div>
                          )}
                        </div>

                        <SelectControl
                          label={isAr ? 'الشركة والفرع (السجل التجاري)' : 'Company CR & Branch'}
                          required
                          options={COMPANY_BRANCH_OPTIONS}
                          value={companyCr}
                          onChange={(v) => setCompanyCr(v as string)}
                          clearable={false}
                          helpText="Choose the Commercial Registration (CR) & branch for this session."
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <Checkbox
                            label={isAr ? 'تذكرني على هذا الجهاز' : 'Remember me'}
                            checked={rememberMe}
                            onChange={setRememberMe}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setRecoverySent(false);
                              setForgotOpen(true);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--ug-primary)',
                              fontWeight: 700,
                              fontSize: '0.889rem',
                              cursor: 'pointer',
                            }}
                          >
                            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                          </button>
                        </div>

                        <Button type="submit" size="lg" icon={<ArrowRight size={17} />} style={{ width: '100%' }}>
                          {isAr ? 'تسجيل الدخول إلى النظام' : 'Sign in to PROMPT HRMS'}
                        </Button>
                      </form>
                    ),
                  },
                  {
                    id: 'otp',
                    label: isAr ? 'رمز التحقق (OTP)' : 'One-Time Code',
                    content: renderOtpInteractiveBlock(),
                  },
                ]}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ug-muted)', fontSize: '0.852rem' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--ug-border)' }} />
                {isAr ? 'أو عبر الربط الموحد' : 'or enterprise SSO'}
                <span style={{ flex: 1, height: 1, background: 'var(--ug-border)' }} />
              </div>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                icon={<KeyRound size={16} style={{ color: 'var(--ug-primary)' }} />}
                onClick={() => setErpModalOpen(true)}
                style={{ width: '100%' }}
              >
                {isAr ? 'المتابعة بحساب PROMPT ERP' : 'Sign in with your PROMPT ERP account'}
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.815rem', color: 'var(--ug-muted)' }}>
              <span>{isAr ? 'تحتاج مساعدة؟ تواصل مع قسم تقنية المعلومات.' : 'Need help? Contact HR System Administrator.'}</span>
              <span>Privacy · SLA Terms · Audit Policy</span>
            </div>
          </section>
        </div>
      )}

      {/* ====================================================================
          SCREEN 2: HORIZON PORTAL (Inspired by Client B1_Horizon_Login.html)
          Clean Dot-Grid + 2-Step Company/Workspace Wizard + Interactive Module Launcher
          ==================================================================== */}
      {concept === 'horizon' && (
        <div className="ug-login-horizon-dots ug-login-fade-panel">
          {/* Horizon Brand Header */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              padding: '16px 36px',
              background: 'var(--ug-surface)',
              borderBottom: '1px solid var(--ug-border)',
              flexWrap: 'wrap',
            }}
          >
            <PromptLogo variant={loginDark ? 'white' : 'color'} height={42} badgeText="HRMS" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Badge variant="success">
                <CheckCircle2 size={12} />
                {isAr ? 'متصل بقاعدة البيانات' : 'PROMPT Cloud & ERP Bridge Online'}
              </Badge>
              <span style={{ fontSize: '0.852rem', color: 'var(--ug-muted)' }}>{formattedClock}</span>
            </div>
          </header>

          {/* Centered Elevated Horizon Card + Module Launcher */}
          <main
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28,
              padding: '36px 20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 490,
                background: 'var(--ug-surface)',
                border: '1px solid var(--ug-border)',
                borderTop: `4px solid ${swatchHex}`,
                borderRadius: 18,
                padding: '30px 34px',
                boxShadow: '0 24px 48px -20px rgba(15, 23, 42, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {/* Card Emblem & Step Switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'var(--ug-primary-soft)',
                    color: 'var(--ug-primary)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Lock size={24} />
                </div>
                <h1 style={{ margin: '4px 0 0', fontSize: '1.7rem', fontWeight: 800 }}>
                  {isAr ? 'تسجيل الدخول إلى PROMPT HRMS' : 'Sign in to PROMPT HRMS'}
                </h1>
                <p style={{ margin: 0, fontSize: '0.926rem', color: 'var(--ug-muted)' }}>
                  {isAr
                    ? 'الخطوة 1: بيانات الحساب · الخطوة 2: اختيار الشركة ونمط التشغيل'
                    : 'Use your HRMS credentials and select your active Company CR.'}
                </p>

                {/* Interactive 2-Step Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    gap: 6,
                    padding: 4,
                    borderRadius: 999,
                    background: 'var(--ug-surface-alt)',
                    border: '1px solid var(--ug-border)',
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHorizonStep(1)}
                    className={`ug-login-concept-pill ${horizonStep === 1 ? 'active' : ''}`}
                    style={{ padding: '4px 12px', fontSize: '0.815rem' }}
                  >
                    {isAr ? '1. بيانات الدخول' : '1. Account Credentials'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHorizonStep(2)}
                    className={`ug-login-concept-pill ${horizonStep === 2 ? 'active' : ''}`}
                    style={{ padding: '4px 12px', fontSize: '0.815rem' }}
                  >
                    {isAr ? '2. الشركة والفرع' : '2. Company & ERP Mode'}
                  </button>
                </div>
              </div>

              {renderPersonaQuickBar()}

              {formError && (
                <Alert variant="danger" onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              {horizonStep === 1 ? (
                <div className="ug-login-fade-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <TextInput
                    label={isAr ? 'معرف المستخدم' : 'User ID'}
                    required
                    icon={<User size={16} />}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your HRMS User ID"
                  />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className="ug-label">
                        {isAr ? 'كلمة المرور' : 'Password'} <span className="ug-required">*</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverySent(false);
                          setForgotOpen(true);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--ug-primary)',
                          fontWeight: 700,
                          fontSize: '0.815rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                      </button>
                    </div>
                    <TextInput
                      type="password"
                      icon={<Lock size={16} />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={checkCapsLock}
                      placeholder="Enter your password"
                    />
                  </div>

                  <SwitchToggle
                    checked={rememberMe}
                    onChange={setRememberMe}
                    label={isAr ? 'إبقاء الجلسة نشطة على هذا الحاسوب' : 'Keep me signed in on this computer'}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setHorizonStep(2)}
                    >
                      {isAr ? 'اختيار الفرع ←' : 'Choose Branch →'}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      icon={<ArrowRight size={16} />}
                      onClick={() => handlePasswordSubmit()}
                    >
                      {isAr ? 'دخول سريع' : 'Quick Sign In'}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    icon={<KeyRound size={16} style={{ color: 'var(--ug-primary)' }} />}
                    onClick={() => setErpModalOpen(true)}
                    style={{ width: '100%' }}
                  >
                    {isAr ? 'المتابعة بحساب PROMPT ERP' : 'Continue with PROMPT ERP account'}
                  </Button>
                </div>
              ) : (
                <div className="ug-login-fade-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SelectControl
                    label={isAr ? 'السجل التجاري والفرع' : 'Active Commercial Registration (CR) & Branch'}
                    required
                    options={COMPANY_BRANCH_OPTIONS}
                    value={companyCr}
                    onChange={(v) => setCompanyCr(v as string)}
                    clearable={false}
                  />

                  <RadioGroup
                    label={isAr ? 'نمط التكامل المحاسبي' : 'Workspace Integration Mode'}
                    name="horizon-erp-mode"
                    direction="column"
                    value={erpMode}
                    onChange={setErpMode}
                    options={[
                      {
                        value: 'connected',
                        label: isAr ? 'متصل مع PROMPT ERP (ترحيل القيود ومراكز التكلفة)' : 'Connected to PROMPT ERP',
                        description: 'Auto-posts payroll runs, EOSB provisions & leave accruals to General Ledger.',
                      },
                      {
                        value: 'standalone',
                        label: isAr ? 'تشغيل مستقل (Standalone HRMS)' : 'Standalone HRMS Suite',
                        description: 'Run People, Attendance, Leave & WPS SIF exports independently.',
                      },
                    ]}
                  />

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button type="button" variant="secondary" size="lg" onClick={() => setHorizonStep(1)}>
                      {isAr ? 'رجوع' : '← Back'}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      icon={<CheckCircle2 size={17} />}
                      onClick={() => handlePasswordSubmit()}
                      style={{ flex: 1 }}
                    >
                      {isAr ? 'اعتماد والدخول للنظام' : 'Confirm & Enter Workspace'}
                    </Button>
                  </div>
                </div>
              )}

              <p style={{ margin: 0, fontSize: '0.815rem', color: 'var(--ug-muted)', textAlign: 'center' }}>
                {isAr
                  ? 'تنتهي الجلسة تلقائياً بعد فترة من عدم النشاط لحماية البيانات.'
                  : 'Your session automatically locks after inactivity for payroll confidentiality.'}
              </p>
            </div>

            {/* Interactive Module Launcher Dock from B1_Horizon_Login */}
            <section
              aria-label="Modules in PROMPT HRMS"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 820 }}
            >
              <span
                style={{
                  fontSize: '0.815rem',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: 'var(--ug-muted)',
                  textAlign: 'center',
                }}
              >
                {isAr
                  ? 'جميع وحدات الموارد البشرية · مستقل أو داخل PROMPT ERP'
                  : 'EVERYTHING HR · STANDALONE OR INSIDE PROMPT ERP (CLICK ANY MODULE TO PREVIEW)'}
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                {HR_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    className={`ug-login-module-tile ${activeSpotlightId === mod.id ? 'active' : ''}`}
                    onClick={() => setActiveSpotlightId(mod.id)}
                  >
                    <span className="ug-login-module-tile-icon">{mod.icon}</span>
                    <span>{isAr ? mod.titleAr : mod.title}</span>
                  </button>
                ))}
              </div>

              {/* Selected Module Preview Strip */}
              <div
                style={{
                  width: '100%',
                  background: 'var(--ug-surface)',
                  border: '1px solid var(--ug-border)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  boxShadow: 'var(--ug-shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge variant="primary">{activeSpotlight.metric}</Badge>
                  <span style={{ fontSize: '0.889rem', color: 'var(--ug-text-secondary)' }}>
                    {isAr ? activeSpotlight.summaryAr : activeSpotlight.summary}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  icon={<ArrowRight size={14} />}
                  onClick={() => handlePasswordSubmit(undefined, activeSpotlight.menuId)}
                >
                  {isAr ? `الدخول إلى ${activeSpotlight.titleAr}` : `Sign in to ${activeSpotlight.title}`}
                </Button>
              </div>
            </section>
          </main>

          <footer
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
              padding: '14px 20px',
              fontSize: '0.815rem',
              color: 'var(--ug-muted)',
              borderTop: '1px solid var(--ug-border)',
              background: 'var(--ug-surface)',
              flexWrap: 'wrap',
            }}
          >
            <span>© 2026 Prompt Solutions</span>
            <span>UniGlobal Consultancy • UG Suite v2.0</span>
            <span>Privacy &amp; Data Protection</span>
          </footer>
        </div>
      )}

      {/* ====================================================================
          SCREEN 3: NOCTURNE & PULSE COCKPIT (Fusion of C1_Nocturne + D1_Pulse)
          Executive Architectural Grid + Live Clock + Self-Service / OTP Floating Card
          ==================================================================== */}
      {concept === 'nocturne' && (
        <div className="ug-login-nocturne-wrap ug-login-fade-panel">
          {/* Ambient Brand Glow Orb */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 520,
              height: 520,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${hexToRgba(swatchHex, loginDark ? 0.28 : 0.14)} 0%, transparent 70%)`,
              top: -120,
              insetInlineStart: -80,
              pointerEvents: 'none',
            }}
          />

          {/* Left Executive Workforce Cockpit */}
          <section
            style={{
              position: 'relative',
              padding: '44px 54px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <PromptLogo variant={loginDark ? 'white' : 'color'} height={44} badgeText="HRMS" />
              <Badge variant="success">
                <Sparkles size={12} />
                {isAr ? 'بوابة القيادة والخدمة الذاتية' : 'Executive & ESS Cockpit'}
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 590 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.926rem',
                  color: 'var(--ug-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Clock size={16} style={{ color: 'var(--ug-primary)' }} />
                <span>
                  {formattedClock} · <strong style={{ color: 'var(--ug-text)' }}>{formattedTime}</strong>
                </span>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '3.2rem',
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: '-1.3px',
                }}
              >
                {isAr ? (
                  <>
                    قوتك العاملة،
                    <br />
                    <span style={{ color: 'var(--ug-primary)' }}>برؤية واضحة وفورية.</span>
                  </>
                ) : (
                  <>
                    Your workforce,
                    <br />
                    <span style={{ color: 'var(--ug-primary)' }}>clearly in view.</span>
                  </>
                )}
              </h1>

              {/* 3 Interactive Nocturne Capability Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    icon: <Clock size={18} />,
                    title: isAr ? 'الحضور والانصراف في الوقت الفعلي' : 'Attendance in real time',
                    desc: isAr
                      ? 'ربط أجهزة البصمة وتسجيل الحضور عبر الجوال في شاشة موحدة.'
                      : 'Biometric devices and mobile geo-check-in unified in one live cockpit.',
                    menu: 'att-biometric',
                  },
                  {
                    icon: <ShieldCheck size={18} />,
                    title: isAr ? 'مسير رواتب برقابة صارمة' : 'Payroll with multi-stage controls',
                    desc: isAr
                      ? 'فحص تلقائي للفروقات واعتماد متعدد المستويات قبل الصرف.'
                      : 'Automated variance checks, salary confidentiality & approval before every run.',
                    menu: 'pay-run',
                  },
                  {
                    icon: <RefreshCw size={18} />,
                    title: isAr ? 'مستقل أو متكامل مع PROMPT ERP' : 'Standalone or synced with PROMPT ERP',
                    desc: isAr
                      ? 'ترحيل آلي للرواتب والمخصصات إلى الأستاذ العام ومراكز التكلفة.'
                      : 'Posts payroll journals, EOSB & accruals directly to PROMPT General Ledger.',
                    menu: 'dashboard',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handlePasswordSubmit(undefined, item.menu)}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      padding: '12px 16px',
                      borderRadius: 14,
                      background: 'var(--ug-surface)',
                      border: '1px solid var(--ug-border)',
                      cursor: 'pointer',
                      transition: 'border-color 0.18s ease, transform 0.18s ease',
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
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.889rem', color: 'var(--ug-muted)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>
              © 2026 Prompt Solutions · PROMPT HRMS Executive &amp; Pulse Edition
            </div>
          </section>

          {/* Right Pulse Floating Rounded Card (Inspired by D1_Pulse_Login + C1_Nocturne) */}
          <section
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 28px',
              borderInlineStart: '1px solid var(--ug-border)',
              background: loginDark ? 'rgba(18, 24, 32, 0.72)' : 'rgba(255, 255, 255, 0.68)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 440,
                background: 'var(--ug-surface)',
                border: '1px solid var(--ug-border-strong)',
                borderRadius: 24,
                padding: '28px 30px',
                boxShadow: '0 28px 60px -20px rgba(0, 0, 0, 0.38)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Pulse Friendly Greeting Banner */}
              <div
                style={{
                  background: heroBgGradient,
                  color: '#ffffff',
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.2px', opacity: 0.88 }}>
                  {isAr ? 'نبض الموظف · الخدمة الذاتية' : 'HELLO! READY FOR TODAY?'}
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {isAr ? 'تسجيل الحضور، الإجازات والرواتب بثوانٍ' : 'Sign in to your HR Cockpit'}
                </div>
                <span style={{ fontSize: '0.852rem', opacity: 0.9 }}>
                  {isAr
                    ? 'استخدم كلمة المرور أو رمز التحقق السريع للجوال.'
                    : 'Check in, approve requests, view payslips & run payroll.'}
                </span>
              </div>

              {/* Pill Segmented Auth Mode (from D1_Pulse_Login) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: 'var(--ug-surface-alt)',
                  padding: 4,
                  borderRadius: 999,
                  border: '1px solid var(--ug-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setNocturneAuthTab('password');
                    setFormError('');
                  }}
                  style={{
                    minHeight: 38,
                    border: 'none',
                    borderRadius: 999,
                    background: nocturneAuthTab === 'password' ? 'var(--ug-primary)' : 'transparent',
                    color: nocturneAuthTab === 'password' ? '#ffffff' : 'var(--ug-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.889rem',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'كلمة المرور' : 'Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNocturneAuthTab('otp');
                    setFormError('');
                  }}
                  style={{
                    minHeight: 38,
                    border: 'none',
                    borderRadius: 999,
                    background: nocturneAuthTab === 'otp' ? 'var(--ug-primary)' : 'transparent',
                    color: nocturneAuthTab === 'otp' ? '#ffffff' : 'var(--ug-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.889rem',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'رمز لمرة واحدة (OTP)' : 'One-Time Code'}
                </button>
              </div>

              {renderPersonaQuickBar()}

              {formError && (
                <Alert variant="danger" onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              {nocturneAuthTab === 'password' ? (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  <TextInput
                    label={isAr ? 'اسم المستخدم أو البريد' : 'User ID or Email'}
                    required
                    icon={<Mail size={16} />}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="name@company.com"
                  />

                  <TextInput
                    label={isAr ? 'كلمة المرور' : 'Password'}
                    type="password"
                    required
                    icon={<Lock size={16} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={checkCapsLock}
                  />

                  <SelectControl
                    label={isAr ? 'الشركة والفرع' : 'Company & Branch'}
                    options={COMPANY_BRANCH_OPTIONS}
                    value={companyCr}
                    onChange={(v) => setCompanyCr(v as string)}
                    clearable={false}
                  />

                  <SwitchToggle
                    checked={launchSelfServiceCheckIn}
                    onChange={setLaunchSelfServiceCheckIn}
                    label={isAr ? 'فتح شاشة البصمة والحضور فور الدخول' : 'Open Attendance Check-In immediately'}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.852rem' }}>
                    <Checkbox
                      label={isAr ? 'تذكرني' : 'Remember me'}
                      checked={rememberMe}
                      onChange={setRememberMe}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverySent(false);
                        setForgotOpen(true);
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--ug-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  </div>

                  <Button type="submit" size="lg" icon={<ArrowRight size={17} />} style={{ width: '100%' }}>
                    {isAr ? 'تسجيل الدخول ←' : 'Sign in →'}
                  </Button>
                </form>
              ) : (
                renderOtpInteractiveBlock()
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Smartphone size={14} />}
                  onClick={() => {
                    setNocturneAuthTab('otp');
                    if (!otpSent) handleSendOtp();
                  }}
                >
                  {isAr ? 'رمز سريع' : 'SMS OTP'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<KeyRound size={14} />}
                  onClick={() => setErpModalOpen(true)}
                >
                  {isAr ? 'حساب ERP' : 'PROMPT ERP SSO'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ====================================================================
          INTERACTIVE MODAL 1: FORGOT PASSWORD RECOVERY (@controls Modal)
          ==================================================================== */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title={isAr ? 'استعادة كلمة المرور — PROMPT HRMS' : 'Account Password Recovery'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setForgotOpen(false)}>
              {isAr ? 'إغلاق' : 'Close'}
            </Button>
            {!recoverySent && (
              <Button
                size="sm"
                onClick={() => {
                  setRecoverySent(true);
                  toast.success(
                    isAr ? 'تم إرسال رابط الاستعادة' : 'Recovery Instructions Sent',
                    `Dispatched to ${recoveryIdentity}`
                  );
                }}
              >
                {isAr ? 'إرسال رمز الاستعادة' : 'Send Reset Link'}
              </Button>
            )}
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recoverySent ? (
            <Alert variant="success" title={isAr ? 'تم الإرسال بنجاح' : 'Reset Link Dispatched'}>
              {isAr
                ? `تم إرسال تعليمات إعادة تعيين كلمة المرور إلى ${recoveryIdentity}.`
                : `Password reset instructions and a 10-minute security token have been sent to ${recoveryIdentity}.`}
            </Alert>
          ) : (
            <>
              <RadioGroup
                label={isAr ? 'طريقة التحقق' : 'Verification Channel'}
                name="recovery-channel"
                direction="column"
                value={recoveryChannel}
                onChange={setRecoveryChannel}
                options={[
                  { value: 'email', label: isAr ? 'البريد المؤسسي' : 'Corporate Email Link' },
                  { value: 'sms', label: isAr ? 'رسالة نصية (+973)' : 'Registered Mobile SMS (+973)' },
                ]}
              />
              <TextInput
                label={recoveryChannel === 'email' ? 'Corporate Email' : 'Employee Mobile (+973)'}
                value={recoveryIdentity}
                onChange={(e) => setRecoveryIdentity(e.target.value)}
                required
              />
            </>
          )}
        </div>
      </Modal>

      {/* ====================================================================
          INTERACTIVE MODAL 2: PROMPT ERP SINGLE SIGN-ON HANDSHAKE (@controls Modal)
          ==================================================================== */}
      <Modal
        open={erpModalOpen}
        onClose={() => setErpModalOpen(false)}
        title={isAr ? 'الدخول الموحد عبر PROMPT ERP' : 'Sign in with PROMPT ERP Account'}
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setErpModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              icon={<CheckCircle2 size={15} />}
              onClick={() => {
                setErpModalOpen(false);
                completeSignIn('dashboard', `PROMPT ERP SSO (${erpTenantCode})`);
              }}
            >
              {isAr ? 'تفويض والدخول إلى HRMS' : 'Authorize & Launch HRMS'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'var(--ug-surface-alt)', border: '1px solid var(--ug-border)' }}>
            <PromptLogo variant={loginDark ? 'white' : 'color'} height={36} badgeText="ERP ↔ HRMS" />
            <Badge variant="success">OAuth 2.0 / OpenID Ready</Badge>
          </div>

          <Alert variant="info" title={isAr ? 'التكامل المباشر مع الأستاذ العام' : 'Unified PROMPT ERP Session'}>
            {isAr
              ? 'سيتم ربط جلستك تلقائياً مع دليل الحسابات ومراكز التكلفة والسجلات التجارية في PROMPT ERP.'
              : 'Your PROMPT ERP identity will authenticate into HRMS with synchronized Cost Centers, General Ledger mappings, and Commercial Registrations.'}
          </Alert>

          <SelectControl
            label={isAr ? 'بيئة PROMPT ERP' : 'PROMPT ERP Environment'}
            options={[
              { value: 'PROMPT-BH-PROD', label: 'PROMPT ERP Production — Bahrain Multi-CR', group: 'Live' },
              { value: 'PROMPT-GCC-UAT', label: 'PROMPT ERP Sandbox / UAT — GCC Consolidated', group: 'Test' },
            ]}
            value={erpTenantCode}
            onChange={(v) => setErpTenantCode(v as string)}
            clearable={false}
          />

          <SelectControl
            label={isAr ? 'الشركة الافتراضية' : 'Target Company CR'}
            options={COMPANY_BRANCH_OPTIONS}
            value={companyCr}
            onChange={(v) => setCompanyCr(v as string)}
            clearable={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default LoginScreensPage;
