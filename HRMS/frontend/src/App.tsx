import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppShell,
  Card,
  NavMenuItem,
  RecentMenuRecord,
  SessionLockScreen,
  ThemeProvider,
  ToastProvider,
  useTheme,
  useToast,
} from '@controls';
import {
  BookOpen,
  Calculator,
  Clock,
  FileText,
  GitCommitHorizontal,
  KeyRound,
  LayoutDashboard,
  Layers,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { ApplicationSettingsPage } from './pages/ApplicationSettingsPage';
import { ControlGalleryPage } from './pages/ControlGalleryPage';
import { ReleaseTimelinePage } from './pages/ReleaseTimelinePage';
import { AuthenticatedSession, LoginScreensPage } from './pages/LoginScreensPage';
import {
  clearRecentMenusForUser,
  flushRecentMenusToDb,
  hydrateRecentMenusOnLogin,
  readLocalRecentCache,
  recordMenuAccessLocal,
} from './services/recentMenusApi';

const INITIAL_MENUS: NavMenuItem[] = [
  { id: 'login-showcase', label: 'Login Screens (3 Styles)', labelAr: 'شاشات الدخول (3 تصاميم)', icon: <KeyRound size={16} /> },
  { id: 'ui-kit', label: 'Common Controls', labelAr: 'مكتبة العناصر', icon: <Layers size={16} /> },
  { id: 'releases', label: 'Release Timeline', labelAr: 'سجل الإصدارات', icon: <GitCommitHorizontal size={16} /> },
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={16} /> },
  {
    id: 'employees',
    label: 'Employees',
    labelAr: 'الموظفون',
    icon: <Users size={16} />,
    children: [
      { id: 'emp-directory', label: 'Employee Directory', labelAr: 'دليل الموظفين', icon: <Users size={14} /> },
      { id: 'emp-onboarding', label: 'Onboarding & Docs', labelAr: 'التعيين والوثائق', icon: <UserPlus size={14} /> },
      { id: 'emp-letters', label: 'HR Letters & Assets', labelAr: 'الخطابات والعهد', icon: <FileText size={14} /> },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    labelAr: 'الحضور والإجازات',
    icon: <Clock size={16} />,
    children: [
      { id: 'att-biometric', label: 'Biometric Punches', labelAr: 'سجل البصمة', icon: <Clock size={14} /> },
      { id: 'att-leave', label: 'Leave Requests', labelAr: 'طلبات الإجازة', icon: <FileText size={14} /> },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll & EOSB',
    labelAr: 'الرواتب والمكافآت',
    icon: <Calculator size={16} />,
    children: [
      { id: 'pay-run', label: 'Monthly Payroll Run', labelAr: 'مسير الرواتب', icon: <Calculator size={14} /> },
      { id: 'pay-eosb', label: 'EOSB & Final Settlement', labelAr: 'نهاية الخدمة', icon: <FileText size={14} /> },
    ],
  },
  { id: 'audit', label: 'Audit & Logs', labelAr: 'سجلات التدقيق', icon: <ShieldCheck size={16} /> },
  { id: 'app-settings', label: 'Application Settings', labelAr: 'إعدادات النظام العامة', icon: <Settings size={16} /> },
  { id: 'manual', label: 'User Manual', labelAr: 'دليل المستخدم', icon: <BookOpen size={16} /> },
];

const MENU_ORDER_KEY = 'uniglobal_hrms_menu_order_v1';
const ACTIVE_MENU_KEY = 'uniglobal_hrms_active_menu_v1';
const AUTH_SESSION_KEY = 'prompt_hrms_auth_session_v1';
const LOCK_STATE_KEY = 'prompt_hrms_session_lock_v1';
const IDLE_DB_FLUSH_MS = 20000; // 20s idle write-behind flush to SQL Server

interface PersistedLockState {
  reason: 'manual' | 'idle';
  lockedAtIso: string;
}

function loadLockState(): PersistedLockState | null {
  try {
    const raw = sessionStorage.getItem(LOCK_STATE_KEY);
    return raw ? (JSON.parse(raw) as PersistedLockState) : null;
  } catch {
    return null;
  }
}

function loadOrderedMenus(): NavMenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_ORDER_KEY);
    if (!raw) return INITIAL_MENUS;
    const order: string[] = JSON.parse(raw);
    const map = new Map(INITIAL_MENUS.map((m) => [m.id, m]));
    const ordered = order.map((id) => map.get(id)).filter((m): m is NavMenuItem => Boolean(m));
    const missing = INITIAL_MENUS.filter((m) => !order.includes(m.id));
    return [...ordered, ...missing];
  } catch {
    return INITIAL_MENUS;
  }
}

function loadSession(): AuthenticatedSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedSession) : null;
  } catch {
    return null;
  }
}

function findMenuMeta(
  items: NavMenuItem[],
  menuId: string
): { label: string; labelAr: string; parentLabel?: string } | null {
  for (const parent of items) {
    if (parent.id === menuId) {
      return { label: parent.label, labelAr: parent.labelAr };
    }
    if (parent.children) {
      const child = parent.children.find((c) => c.id === menuId);
      if (child) {
        return { label: child.label, labelAr: child.labelAr, parentLabel: parent.label };
      }
    }
  }
  return null;
}

const AppContent: React.FC = () => {
  const { dbMenuOrder, recentMenusLimit, enableIdleTimeout, idleTimeoutMinutes, language } = useTheme();
  const toast = useToast();
  const [authSession, setAuthSession] = useState<AuthenticatedSession | null>(loadSession);
  const [lockState, setLockState] = useState<PersistedLockState | null>(loadLockState);
  const lastActivityMsRef = useRef<number>(Date.now());
  const [menus, setMenus] = useState<NavMenuItem[]>(loadOrderedMenus);
  const [activeMenuId, setActiveMenuId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_MENU_KEY);
    return saved && saved !== 'login-showcase' ? saved : 'ui-kit';
  });
  const [previousMenuId, setPreviousMenuId] = useState<string>('ui-kit');

  // Per-User Top-10 Recent Menus State (Hydrated from DB on Login -> Updated Locally -> Flushed on Idle/Close)
  const [recentMenus, setRecentMenus] = useState<RecentMenuRecord[]>([]);
  const [recentDirty, setRecentDirty] = useState<boolean>(false);
  const [recentLastSyncedUtc, setRecentLastSyncedUtc] = useState<string | undefined>(undefined);
  const idleFlushTimerRef = useRef<number | null>(null);

  // Apply SuperAdmin's menu order from SQL Server when loaded
  useEffect(() => {
    if (!dbMenuOrder || dbMenuOrder.length === 0) return;
    const map = new Map(INITIAL_MENUS.map((m) => [m.id, m]));
    const ordered = dbMenuOrder.map((id) => map.get(id)).filter((m): m is NavMenuItem => Boolean(m));
    const missing = INITIAL_MENUS.filter((m) => !dbMenuOrder.includes(m.id));
    if (ordered.length > 0) setMenus([...ordered, ...missing]);
  }, [dbMenuOrder]);

  const scheduleIdleDbFlush = useCallback(
    (userId: string) => {
      if (idleFlushTimerRef.current !== null) {
        window.clearTimeout(idleFlushTimerRef.current);
      }
      idleFlushTimerRef.current = window.setTimeout(async () => {
        idleFlushTimerRef.current = null;
        const synced = await flushRecentMenusToDb(userId, false, recentMenusLimit);
        setRecentDirty(synced.dirty);
        setRecentLastSyncedUtc(synced.lastSyncedAtUtc);
      }, IDLE_DB_FLUSH_MS);
    },
    [recentMenusLimit]
  );

  const trackMenuLocally = useCallback(
    (user: { userId: string; displayName: string }, menuId: string) => {
      const meta = findMenuMeta(INITIAL_MENUS, menuId);
      if (!meta) return;
      const next = recordMenuAccessLocal(
        user.userId,
        user.displayName,
        {
          menuId,
          label: meta.label,
          labelAr: meta.labelAr,
          parentLabel: meta.parentLabel,
        },
        recentMenusLimit
      );
      setRecentMenus(next.items);
      setRecentDirty(next.dirty);
      setRecentLastSyncedUtc(next.lastSyncedAtUtc);
      scheduleIdleDbFlush(user.userId);
    },
    [recentMenusLimit, scheduleIdleDbFlush]
  );

  // Enforce SuperAdmin's recentMenusLimit dynamically whenever changed
  useEffect(() => {
    setRecentMenus((prev) => prev.slice(0, recentMenusLimit));
  }, [recentMenusLimit]);

  // STAGE 1: Hydrate user's recent menus from SQL Server once when logged in
  useEffect(() => {
    if (!authSession) return;
    let active = true;

    // Immediately show any cached local entries for 0ms responsiveness
    const cached = readLocalRecentCache(authSession.userId, authSession.displayName, recentMenusLimit);
    setRecentMenus(cached.items);
    setRecentDirty(cached.dirty);
    setRecentLastSyncedUtc(cached.lastSyncedAtUtc);

    hydrateRecentMenusOnLogin(authSession.userId, authSession.displayName, recentMenusLimit).then((hydrated) => {
      if (!active) return;
      if (hydrated.items.length === 0) {
        // Seed initial landing screen into local cache on very first login
        const initialId =
          authSession.targetMenuId && authSession.targetMenuId !== 'login-showcase'
            ? authSession.targetMenuId
            : activeMenuId;
        trackMenuLocally(authSession, initialId);
      } else {
        setRecentMenus(hydrated.items);
        setRecentDirty(hydrated.dirty);
        setRecentLastSyncedUtc(hydrated.lastSyncedAtUtc);
      }
    });

    return () => {
      active = false;
    };
  }, [authSession?.userId, recentMenusLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  // STAGE 3: Flush unsaved local Recent Menus to SQL Server on Tab Hide or Window Close (keepalive)
  useEffect(() => {
    if (!authSession) return;
    const currentUserId = authSession.userId;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushRecentMenusToDb(currentUserId, true, recentMenusLimit).then((synced) => {
          setRecentDirty(synced.dirty);
          setRecentLastSyncedUtc(synced.lastSyncedAtUtc);
        });
      }
    };

    const handlePageHide = () => {
      flushRecentMenusToDb(currentUserId, true, recentMenusLimit);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [authSession]);

  const handleReorderMenus = (next: NavMenuItem[]) => {
    setMenus(next);
    try {
      localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(next.map((m) => m.id)));
    } catch {
      // ignore
    }
  };

  const handleSelectMenu = (id: string) => {
    if (id === 'login-showcase' && activeMenuId !== 'login-showcase') {
      setPreviousMenuId(activeMenuId);
    }
    setActiveMenuId(id);
    if (id !== 'login-showcase') {
      try {
        localStorage.setItem(ACTIVE_MENU_KEY, id);
      } catch {
        // ignore
      }
    }
    if (authSession) {
      trackMenuLocally(authSession, id);
    }
  };

  const triggerLockSession = useCallback(
    (reason: 'manual' | 'idle') => {
      if (!authSession) return;
      const nextLock: PersistedLockState = {
        reason,
        lockedAtIso: new Date().toISOString(),
      };
      setLockState(nextLock);
      try {
        sessionStorage.setItem(LOCK_STATE_KEY, JSON.stringify(nextLock));
      } catch {
        // ignore
      }
      flushRecentMenusToDb(authSession.userId, true, recentMenusLimit);
    },
    [authSession, recentMenusLimit]
  );

  const handleUnlockSession = useCallback(() => {
    lastActivityMsRef.current = Date.now();
    setLockState(null);
    try {
      sessionStorage.removeItem(LOCK_STATE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Inactivity Monitor: Auto-lock session after SuperAdmin-configured idleTimeoutMinutes
  useEffect(() => {
    if (!authSession || lockState || !enableIdleTimeout || activeMenuId === 'login-showcase') {
      return;
    }

    lastActivityMsRef.current = Date.now();
    const bumpActivity = () => {
      lastActivityMsRef.current = Date.now();
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];
    activityEvents.forEach((ev) => window.addEventListener(ev, bumpActivity, { passive: true }));

    const timeoutMs = Math.max(1, idleTimeoutMinutes) * 60 * 1000;
    const checker = window.setInterval(() => {
      if (Date.now() - lastActivityMsRef.current >= timeoutMs) {
        triggerLockSession('idle');
      }
    }, 5000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, bumpActivity));
      window.clearInterval(checker);
    };
  }, [authSession, lockState, enableIdleTimeout, idleTimeoutMinutes, activeMenuId, triggerLockSession]);

  const handleAuthenticated = (session: AuthenticatedSession) => {
    setAuthSession(session);
    setLockState(null);
    lastActivityMsRef.current = Date.now();
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      sessionStorage.removeItem(LOCK_STATE_KEY);
    } catch {
      // ignore
    }
    const nextMenu =
      session.targetMenuId && session.targetMenuId !== 'login-showcase'
        ? session.targetMenuId
        : 'ui-kit';
    setActiveMenuId(nextMenu);
    try {
      localStorage.setItem(ACTIVE_MENU_KEY, nextMenu);
    } catch {
      // ignore
    }
    trackMenuLocally(session, nextMenu);
  };

  const handleSignOut = async () => {
    if (idleFlushTimerRef.current !== null) {
      window.clearTimeout(idleFlushTimerRef.current);
      idleFlushTimerRef.current = null;
    }
    if (authSession) {
      await flushRecentMenusToDb(authSession.userId, true, recentMenusLimit);
    }
    setLockState(null);
    setAuthSession(null);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(LOCK_STATE_KEY);
    } catch {
      // ignore
    }
    toast.info('Signed Out', 'Recent menu history synced to SQL Server.');
  };

  const handleForceSyncRecent = async () => {
    if (!authSession) return;
    const synced = await flushRecentMenusToDb(authSession.userId, false, recentMenusLimit);
    setRecentDirty(synced.dirty);
    setRecentLastSyncedUtc(synced.lastSyncedAtUtc || new Date().toISOString());
    toast.success('Synced to SQL Server', `Saved ${synced.items.length} recent menus for ${authSession.userId}.`);
  };

  const handleClearRecent = async () => {
    if (!authSession) return;
    const cleared = await clearRecentMenusForUser(authSession.userId, authSession.displayName);
    setRecentMenus(cleared.items);
    setRecentDirty(false);
    setRecentLastSyncedUtc(cleared.lastSyncedAtUtc);
    toast.info('Recent History Cleared', `Cleared recent menus for ${authSession.displayName}.`);
  };

  // Show full-screen Login Experience when signed out OR when previewing 'login-showcase'
  if (!authSession || activeMenuId === 'login-showcase') {
    return (
      <LoginScreensPage
        onAuthenticated={handleAuthenticated}
        isPreviewInsideApp={Boolean(authSession && activeMenuId === 'login-showcase')}
        onReturnToApp={() => setActiveMenuId(previousMenuId || 'ui-kit')}
      />
    );
  }

  const activeMenuMeta = findMenuMeta(menus, activeMenuId);
  const lastUsedPageTitle = activeMenuMeta
    ? language === 'ar'
      ? activeMenuMeta.labelAr
      : activeMenuMeta.label
    : activeMenuId;

  return (
    <>
      {lockState && (
        <SessionLockScreen
          user={{
            userId: authSession.userId,
            displayName: authSession.displayName,
            roleTitle: authSession.roleTitle,
            role: authSession.role,
            companyCr: authSession.companyCr,
            companyLabel: authSession.companyLabel,
          }}
          lockReason={lockState.reason}
          lockedAtIso={lockState.lockedAtIso}
          lastPageLabel={lastUsedPageTitle}
          idleMinutesConfigured={idleTimeoutMinutes}
          onUnlock={handleUnlockSession}
          onFullSignOut={handleSignOut}
        />
      )}

      <AppShell
        menuItems={menus}
        onReorderMenus={handleReorderMenus}
        activeMenuId={activeMenuId}
        onSelectMenu={handleSelectMenu}
        currentUser={{
          userId: authSession.userId,
          displayName: authSession.displayName,
          roleTitle: authSession.roleTitle,
          role: authSession.role,
          companyCr: authSession.companyCr,
          companyLabel: authSession.companyLabel,
        }}
        currentUserLabel={`${authSession.displayName} (${authSession.userId} • ${authSession.companyCr})`}
        onLockScreen={() => triggerLockSession('manual')}
        onSignOut={handleSignOut}
        recentMenus={recentMenus}
        recentSyncDirty={recentDirty}
        recentLastSyncedAtUtc={recentLastSyncedUtc}
        onClearRecentMenus={handleClearRecent}
        onForceSyncRecentMenus={handleForceSyncRecent}
      >
        {activeMenuId === 'ui-kit' ? (
          <ControlGalleryPage />
        ) : activeMenuId === 'app-settings' ? (
          <ApplicationSettingsPage onRequestLockScreen={() => triggerLockSession('manual')} />
        ) : activeMenuId === 'releases' ? (
          <ReleaseTimelinePage />
        ) : activeMenuId === 'manual' ? (
          <Card title="PROMPT HRMS — User Manual" subtitle="Step-by-step application guide">
            <ol style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><strong>User Profile, Photo, Password Reset (Email + OTP) &amp; Lock Screen:</strong> Click your <em>Profile Icon</em> in the top-right header to upload/change your Profile Image, Change Password, request a 3-step <em>Reset Password via Email &amp; 6-Digit OTP</em>, <em>Lock Screen / Logoff</em> (unlocks with password directly back to your exact last-used page), or <em>Sign Out</em>.</li>
              <li><strong>SuperAdmin Auto-Logoff / Idle Timeout:</strong> In <em>Application Settings → 3. Session Auto-Lock &amp; Governance</em>, SuperAdmin configures the inactivity minutes (default <code>20 minutes</code>) after which inactive sessions automatically lock and resume the last-used page on password entry.</li>
              <li><strong>Global Application Settings (Gulf / Bahrain Default):</strong> Click the <em>Settings</em> gear icon in the top header to configure Date Format (default <code>DD-MM-YYYY</code> or <code>DD-MMM-YYYY</code>), Time Format (<code>12h</code> / <code>24h</code>), Gulf Currency &amp; Decimal Precision (default <code>BHD</code> 3 decimals), and Time Zone (default <code>Asia/Bahrain</code>).</li>
              <li><strong>Interactive Login Screens:</strong> Click <em>Login Screens (3 Styles)</em> in the menu or <em>Sign Out</em> in your Profile dropdown to explore the Studio Split, Horizon Portal, and Nocturne &amp; Pulse login experiences with 16 PROMPT brand palettes, OTP, and ERP SSO.</li>
              <li><strong>Per-User Recent Menus &amp; Hybrid Sync:</strong> Click the <em>Recent</em> button in the top header to slide open the Right-Side Canvas showing your recent menus with exact Date &amp; Time stamps, synced seamlessly via Local Storage + SQL Server write-behind.</li>
              <li><strong>Corporate Identity &amp; Theme:</strong> SuperAdmin can customize colors, gradients, fonts, menu layouts, and card shadows, then click <em>Save Corporate Settings to DB (All Users)</em> so every logged-in user inherits the Corporate Identity.</li>
              <li><strong>Quick Access &amp; Admin Menu Flow:</strong> Pin sidebar items to the Quick Access bar, or drag-and-drop and lock menu order as SuperAdmin.</li>
            </ol>
          </Card>
        ) : (
          <Card
            title={`Module: ${menus.find((m) => m.id === activeMenuId)?.label ?? activeMenuId}`}
            subtitle={`Signed in as ${authSession.displayName} (${authSession.roleTitle}) • ${authSession.companyLabel}`}
          >
            <p style={{ margin: 0, color: 'var(--ug-text-secondary)' }}>
              This module placeholder will be built in the upcoming feature phase using the approved{' '}
              <code>@controls</code> library.
            </p>
          </Card>
        )}
      </AppShell>
    </>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ThemeProvider>
);

export default App;
