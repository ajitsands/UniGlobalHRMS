import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchGlobalUiSettings,
  GlobalUiSettingsPayload,
  saveGlobalUiSettings,
} from '../../services/uiSettingsApi';
import {
  AppDateFormat,
  AppTimeFormat,
  CurrencyMetadata,
  formatAppCurrencyValue,
  formatAppDateTimeValue,
  formatAppDateValue,
  formatAppHourSlot,
  formatAppTimeValue,
  getCurrencyMeta,
  getTodayIsoInTimeZone,
  GULF_COUNTRY_PRESETS,
  GulfCurrencyCode,
  GulfTimeZoneId,
} from './regionalSettings';

export type ThemeMode = 'uniglobal-light' | 'single' | 'gradient';
export type SurfaceThemeId =
  | 'prompt-maroon'
  | 'prompt-dark'
  | 'uniglobal-light'
  | 'midnight-dark'
  | 'obsidian-gold'
  | 'royal-ivory'
  | 'emerald-glass'
  | 'nordic-slate';
export type HeaderFooterStyle = 'light' | 'single' | 'gradient';

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [161, 7, 126];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function hexLuminance(hex: string): number {
  const [r, g, b] = parseHexRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function lightenHexColor(hex: string, factor = 0.22): string {
  const [r, g, b] = parseHexRgb(hex);
  const mix = (v: number) => Math.min(255, Math.round(v + (255 - v) * factor));
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgbaString(hex: string, alpha: number): string {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface SurfaceThemePreset {
  id: SurfaceThemeId;
  name: string;
  mode: 'light' | 'dark';
  primary: string;
  bgPreview: string;
  cardPreview: string;
  hfText: string;
  menuText: string;
}

export const SURFACE_THEME_PRESETS: SurfaceThemePreset[] = [
  {
    id: 'uniglobal-light',
    name: 'UniGlobal Light',
    mode: 'light',
    primary: '#1B365D',
    bgPreview: '#f5f7fa',
    cardPreview: '#ffffff',
    hfText: '#1B365D',
    menuText: '#334155',
  },
  {
    id: 'prompt-maroon',
    name: 'Prompt Light',
    mode: 'light',
    primary: '#A1077E',
    bgPreview: '#f6f7f9',
    cardPreview: '#ffffff',
    hfText: '#1C252E',
    menuText: '#1C252E',
  },
  {
    id: 'prompt-dark',
    name: 'Prompt Dark',
    mode: 'dark',
    primary: '#A1077E',
    bgPreview: '#0b0f14',
    cardPreview: '#121820',
    hfText: '#f5f7fa',
    menuText: '#e5e9f0',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    mode: 'dark',
    primary: '#3b82f6',
    bgPreview: '#0b1120',
    cardPreview: '#111827',
    hfText: '#f8fafc',
    menuText: '#e2e8f0',
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    mode: 'dark',
    primary: '#d4af37',
    bgPreview: '#0c0c0f',
    cardPreview: '#16161b',
    hfText: '#f8fafc',
    menuText: '#e4e4e7',
  },
  {
    id: 'royal-ivory',
    name: 'Royal Ivory',
    mode: 'light',
    primary: '#7f1d1d',
    bgPreview: '#f8f5f0',
    cardPreview: '#fffdf9',
    hfText: '#7f1d1d',
    menuText: '#3f3f46',
  },
  {
    id: 'emerald-glass',
    name: 'Emerald Executive',
    mode: 'light',
    primary: '#065f46',
    bgPreview: '#eff7f4',
    cardPreview: '#ffffff',
    hfText: '#065f46',
    menuText: '#1e3a34',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    mode: 'light',
    primary: '#334155',
    bgPreview: '#edf1f7',
    cardPreview: '#f8fafd',
    hfText: '#1e293b',
    menuText: '#334155',
  },
];
export type MenuLayout = 'vertical' | 'horizontal' | 'docking' | 'minimal';
export type AppLanguage = 'en' | 'ar';
export type FontSizeScale = 'sm' | 'md' | 'lg' | 'xl';
export type UserRole = 'SuperAdmin' | 'User';

export const FONT_SIZE_PRESETS: { id: FontSizeScale; label: string; px: number }[] = [
  { id: 'sm', label: 'S', px: 11.5 },
  { id: 'md', label: 'M', px: 13.5 },
  { id: 'lg', label: 'L', px: 15.5 },
  { id: 'xl', label: 'XL', px: 18 },
];

export const FONT_FAMILY_OPTIONS = [
  { id: 'inter', label: 'Inter (Default)', css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: 'poppins', label: 'Poppins (Modern)', css: "'Poppins', 'Inter', sans-serif" },
  { id: 'jakarta', label: 'Plus Jakarta Sans', css: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { id: 'roboto', label: 'Roboto (Enterprise)', css: "'Roboto', 'Inter', sans-serif" },
  { id: 'cairo', label: 'Cairo (EN + Arabic)', css: "'Cairo', 'Inter', sans-serif" },
  { id: 'system', label: 'System UI (Native)', css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
];

export const CARD_SHADOW_LEVELS = [
  { level: 0, label: 'Flat', css: 'none' },
  { level: 1, label: 'Subtle', css: '0 1px 3px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.04)' },
  { level: 2, label: 'Medium', css: '0 4px 12px rgba(15, 23, 42, 0.09), 0 2px 4px rgba(15, 23, 42, 0.05)' },
  { level: 3, label: 'Deep', css: '0 10px 26px rgba(15, 23, 42, 0.13), 0 4px 8px rgba(15, 23, 42, 0.06)' },
  { level: 4, label: 'Elevated XL', css: '0 18px 42px rgba(15, 23, 42, 0.18), 0 8px 16px rgba(15, 23, 42, 0.08)' },
];

export const TEXT_COLOR_PRESETS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'UniGlobal Navy', hex: '#1B365D' },
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Slate', hex: '#334155' },
  { name: 'Gold', hex: '#fde68a' },
  { name: 'UniGlobal Crimson', hex: '#B31B34' },
];

export interface GradientPreset {
  id: string;
  name: string;
  css: string;
  primary: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'uniglobal-brand',
    name: 'UniGlobal Brand (Navy + Crimson)',
    css: 'linear-gradient(135deg, #1B365D 0%, #B31B34 100%)',
    primary: '#1B365D',
  },
  {
    id: 'prompt-maroon-glow',
    name: 'Prompt Maroon Glow',
    css: 'linear-gradient(135deg, #A1077E 0%, #5B0547 100%)',
    primary: '#A1077E',
  },
  {
    id: 'uniglobal-navy',
    name: 'UniGlobal Navy Ocean',
    css: 'linear-gradient(135deg, #1B365D 0%, #1d4ed8 100%)',
    primary: '#1B365D',
  },
  {
    id: 'emerald-teal',
    name: 'Emerald Teal',
    css: 'linear-gradient(135deg, #065f46 0%, #0d9488 100%)',
    primary: '#059669',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    css: 'linear-gradient(135deg, #312e81 0%, #6366f1 100%)',
    primary: '#4f46e5',
  },
];

export const SINGLE_COLOR_PRESETS = [
  { name: 'Prompt Maroon', hex: '#A1077E' },
  { name: 'UniGlobal Navy', hex: '#1B365D' },
  { name: 'UniGlobal Crimson', hex: '#B31B34' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Slate Indigo', hex: '#334155' },
];

interface ThemeContextValue {
  surfaceTheme: SurfaceThemeId;
  applySurfaceTheme: (id: SurfaceThemeId) => void;
  isDarkTheme: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
  gradientId: string;
  setGradientId: (id: string) => void;
  menuLayout: MenuLayout;
  setMenuLayout: (layout: MenuLayout) => void;
  menuSticky: boolean;
  setMenuSticky: (sticky: boolean) => void;
  headerFooterStyle: HeaderFooterStyle;
  setHeaderFooterStyle: (style: HeaderFooterStyle) => void;
  headerFooterColor: string;
  setHeaderFooterColor: (hex: string) => void;
  hfTextColor: string;
  setHfTextColor: (hex: string) => void;
  hfGradStart: string;
  setHfGradStart: (hex: string) => void;
  hfGradEnd: string;
  setHfGradEnd: (hex: string) => void;
  hfGradAngle: number;
  setHfGradAngle: (deg: number) => void;
  menuBgStyle: HeaderFooterStyle;
  setMenuBgStyle: (style: HeaderFooterStyle) => void;
  menuBgColor: string;
  setMenuBgColor: (hex: string) => void;
  menuTextColor: string;
  setMenuTextColor: (hex: string) => void;
  menuGradStart: string;
  setMenuGradStart: (hex: string) => void;
  menuGradEnd: string;
  setMenuGradEnd: (hex: string) => void;
  menuGradAngle: number;
  setMenuGradAngle: (deg: number) => void;
  resetAppearance: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  fontSizePx: number;
  setFontSizePx: (px: number) => void;
  fontFamilyId: string;
  setFontFamilyId: (id: string) => void;
  cardShadowLevel: number;
  setCardShadowLevel: (level: number) => void;
  scrollbarColor: string;
  setScrollbarColor: (hex: string) => void;
  quickAccessIds: string[];
  toggleQuickAccess: (menuId: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  isMenuLocked: boolean;
  setIsMenuLocked: (v: boolean) => void;
  lockCorporateTheme: boolean;
  setLockCorporateTheme: (v: boolean) => void;
  recentMenusLimit: number;
  setRecentMenusLimit: (n: number) => void;
  dateFormat: AppDateFormat;
  setDateFormat: (fmt: AppDateFormat) => void;
  timeFormat: AppTimeFormat;
  setTimeFormat: (fmt: AppTimeFormat) => void;
  currencyCode: GulfCurrencyCode;
  setCurrencyCode: (code: GulfCurrencyCode) => void;
  showCurrencyCode: boolean;
  setShowCurrencyCode: (show: boolean) => void;
  showCurrencyOnTotals: boolean;
  setShowCurrencyOnTotals: (show: boolean) => void;
  currencyMeta: CurrencyMetadata;
  timeZone: GulfTimeZoneId;
  setTimeZone: (tz: GulfTimeZoneId) => void;
  applyGulfCountryPreset: (presetId: string) => void;
  formatDate: (input: string | Date | undefined | null) => string;
  formatTime: (input: Date | string, includeSeconds?: boolean) => string;
  formatHour: (hour24: number) => string;
  formatDateTime: (input: Date | string, includeSeconds?: boolean) => string;
  formatCurrency: (amount: number, convertFromBhd?: boolean, isTotal?: boolean) => string;
  todayIso: () => string;
  dbMenuOrder: string[];
  isSavingToDb: boolean;
  dbConnected: boolean;
  lastSavedBy: string;
  lastSavedAtUtc: string;
  saveGlobalSettingsToDb: (menuOrder?: string[]) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'uniglobal_hrms_ui_settings_v1';

interface PersistedSettings {
  surfaceTheme: SurfaceThemeId;
  themeMode: ThemeMode;
  primaryColor: string;
  gradientId: string;
  menuLayout: MenuLayout;
  menuSticky: boolean;
  headerFooterStyle: HeaderFooterStyle;
  headerFooterColor: string;
  hfTextColor: string;
  hfGradStart: string;
  hfGradEnd: string;
  hfGradAngle: number;
  menuBgStyle: HeaderFooterStyle;
  menuBgColor: string;
  menuTextColor: string;
  menuGradStart: string;
  menuGradEnd: string;
  menuGradAngle: number;
  language: AppLanguage;
  fontSizePx: number;
  fontFamilyId: string;
  cardShadowLevel: number;
  scrollbarColor: string;
  quickAccessIds: string[];
  isMenuLocked: boolean;
  recentMenusLimit: number;
  dateFormat: AppDateFormat;
  timeFormat: AppTimeFormat;
  currencyCode: GulfCurrencyCode;
  showCurrencyCode: boolean;
  showCurrencyOnTotals: boolean;
  timeZone: GulfTimeZoneId;
}

const DEFAULT_SETTINGS: PersistedSettings = {
  surfaceTheme: 'prompt-maroon',
  themeMode: 'single',
  primaryColor: '#A1077E',
  gradientId: 'prompt-maroon-glow',
  menuLayout: 'vertical',
  menuSticky: true,
  headerFooterStyle: 'light',
  headerFooterColor: '#A1077E',
  hfTextColor: '#1C252E',
  hfGradStart: '#A1077E',
  hfGradEnd: '#5B0447',
  hfGradAngle: 135,
  menuBgStyle: 'light',
  menuBgColor: '#A1077E',
  menuTextColor: '#1C252E',
  menuGradStart: '#A1077E',
  menuGradEnd: '#121820',
  menuGradAngle: 180,
  language: 'en',
  fontSizePx: 13.5,
  fontFamilyId: 'inter',
  cardShadowLevel: 1,
  scrollbarColor: '#A1077E',
  quickAccessIds: ['dashboard', 'ui-kit', 'emp-directory', 'pay-run'],
  isMenuLocked: false,
  recentMenusLimit: 10,
  dateFormat: 'DD-MM-YYYY',
  timeFormat: '12h',
  currencyCode: 'BHD',
  showCurrencyCode: true,
  showCurrencyOnTotals: true,
  timeZone: 'Asia/Bahrain',
};

function getLoginAccentSwatch(): string {
  try {
    const rawSession = sessionStorage.getItem('prompt_hrms_auth_session_v1');
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession) as { accentHex?: string };
      if (parsedSession?.accentHex) return parsedSession.accentHex;
    }
    const savedSwatch = localStorage.getItem('prompt_hrms_login_swatch');
    if (savedSwatch) return savedSwatch;
  } catch {
    // ignore storage errors
  }
  return '#A1077E';
}

function loadInitialSettings(): PersistedSettings {
  try {
    const loginSwatch = getLoginAccentSwatch();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        primaryColor: loginSwatch,
        scrollbarColor: loginSwatch,
      };
    }
    const merged: PersistedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    // Heal previous Dark Mode toggle that forced Midnight Dark (#3b82f6 Blue) instead of Login Screen color
    if (merged.surfaceTheme === 'midnight-dark' && merged.primaryColor.toLowerCase() === '#3b82f6') {
      merged.surfaceTheme = 'prompt-dark';
      merged.themeMode = 'single';
      merged.primaryColor = loginSwatch;
      merged.scrollbarColor = loginSwatch;
      if (merged.headerFooterStyle === 'light') merged.hfTextColor = '#f5f7fa';
      if (merged.menuBgStyle === 'light') merged.menuTextColor = '#e5e9f0';
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialSettings();
  const [surfaceTheme, setSurfaceTheme] = useState<SurfaceThemeId>(initial.surfaceTheme);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initial.themeMode);
  const [primaryColor, setPrimaryColor] = useState<string>(initial.primaryColor);
  const [gradientId, setGradientId] = useState<string>(initial.gradientId);
  const [menuLayout, setMenuLayout] = useState<MenuLayout>(initial.menuLayout);
  const [menuSticky, setMenuSticky] = useState<boolean>(initial.menuSticky);
  const [headerFooterStyle, setHeaderFooterStyleState] = useState<HeaderFooterStyle>(initial.headerFooterStyle);
  const [headerFooterColor, setHeaderFooterColor] = useState<string>(initial.headerFooterColor);
  const [hfTextColor, setHfTextColor] = useState<string>(initial.hfTextColor);
  const [hfGradStart, setHfGradStart] = useState<string>(initial.hfGradStart);
  const [hfGradEnd, setHfGradEnd] = useState<string>(initial.hfGradEnd);
  const [hfGradAngle, setHfGradAngle] = useState<number>(initial.hfGradAngle);
  const [menuBgStyle, setMenuBgStyleState] = useState<HeaderFooterStyle>(initial.menuBgStyle);
  const [menuBgColor, setMenuBgColor] = useState<string>(initial.menuBgColor);
  const [menuTextColor, setMenuTextColor] = useState<string>(initial.menuTextColor);
  const [menuGradStart, setMenuGradStart] = useState<string>(initial.menuGradStart);
  const [menuGradEnd, setMenuGradEnd] = useState<string>(initial.menuGradEnd);
  const [menuGradAngle, setMenuGradAngle] = useState<number>(initial.menuGradAngle);
  const [language, setLanguage] = useState<AppLanguage>(initial.language);
  const [fontSizePx, setFontSizePx] = useState<number>(initial.fontSizePx);
  const [fontFamilyId, setFontFamilyId] = useState<string>(initial.fontFamilyId);
  const [cardShadowLevel, setCardShadowLevel] = useState<number>(initial.cardShadowLevel);
  const [scrollbarColor, setScrollbarColor] = useState<string>(initial.scrollbarColor);
  const [quickAccessIds, setQuickAccessIds] = useState<string[]>(initial.quickAccessIds);
  const [userRole, setUserRoleState] = useState<UserRole>('SuperAdmin');
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isMenuLocked, setIsMenuLocked] = useState<boolean>(initial.isMenuLocked);
  const [lockCorporateTheme, setLockCorporateTheme] = useState<boolean>(true);
  const [recentMenusLimit, setRecentMenusLimitState] = useState<number>(
    Math.min(50, Math.max(1, Number(initial.recentMenusLimit) || 10))
  );
  const [dateFormat, setDateFormat] = useState<AppDateFormat>(initial.dateFormat || 'DD-MM-YYYY');
  const [timeFormat, setTimeFormat] = useState<AppTimeFormat>(initial.timeFormat || '12h');
  const [currencyCode, setCurrencyCode] = useState<GulfCurrencyCode>(initial.currencyCode || 'BHD');
  const [showCurrencyCode, setShowCurrencyCode] = useState<boolean>(
    initial.showCurrencyCode !== undefined ? Boolean(initial.showCurrencyCode) : true
  );
  const [showCurrencyOnTotals, setShowCurrencyOnTotals] = useState<boolean>(
    initial.showCurrencyOnTotals !== undefined ? Boolean(initial.showCurrencyOnTotals) : true
  );
  const [timeZone, setTimeZone] = useState<GulfTimeZoneId>(initial.timeZone || 'Asia/Bahrain');
  const [dbMenuOrder, setDbMenuOrder] = useState<string[]>([]);

  const applyGulfCountryPreset = (presetId: string) => {
    const preset = GULF_COUNTRY_PRESETS.find((p) => p.id === presetId) ?? GULF_COUNTRY_PRESETS[0];
    setCurrencyCode(preset.currency);
    setTimeZone(preset.timeZone);
    setDateFormat(preset.dateFormat);
    setTimeFormat(preset.timeFormat);
  };

  const setRecentMenusLimit = (n: number) => {
    setRecentMenusLimitState(Math.min(50, Math.max(1, Math.round(Number(n) || 10))));
  };
  const [isSavingToDb, setIsSavingToDb] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [lastSavedBy, setLastSavedBy] = useState<string>('');
  const [lastSavedAtUtc, setLastSavedAtUtc] = useState<string>('');

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    setIsAdmin(role === 'SuperAdmin');
  };

  // Load Global Corporate Identity Settings from SQL Server 2022 on startup
  useEffect(() => {
    let active = true;
    fetchGlobalUiSettings().then((remote) => {
      if (!active || !remote) return;
      setDbConnected(true);
      const loginSwatch = getLoginAccentSwatch();
      const hasSessionAccent = Boolean(sessionStorage.getItem('prompt_hrms_auth_session_v1'));
      const isDefaultUnmodifiedSeed =
        remote.themeMode === 'uniglobal-light' ||
        (remote.primaryColor && remote.primaryColor.toUpperCase() === '#1B365D');

      if (hasSessionAccent || isDefaultUnmodifiedSeed) {
        setThemeMode('single');
        setPrimaryColor(loginSwatch);
        setScrollbarColor(loginSwatch);
      } else {
        setThemeMode(remote.themeMode);
        setPrimaryColor(remote.primaryColor);
        setScrollbarColor(remote.scrollbarColor);
      }
      setGradientId(remote.gradientId);
      setMenuLayout(remote.menuLayout);
      setMenuSticky(remote.menuSticky);
      setIsMenuLocked(remote.isMenuLocked);
      if (remote.menuOrder && remote.menuOrder.length > 0) setDbMenuOrder(remote.menuOrder);
      if (remote.quickAccessIds && remote.quickAccessIds.length > 0) setQuickAccessIds(remote.quickAccessIds);
      setHeaderFooterStyleState(remote.headerFooterStyle);
      setHeaderFooterColor(remote.headerFooterColor);
      setHfGradStart(remote.hfGradStart);
      setHfGradEnd(remote.hfGradEnd);
      setHfGradAngle(remote.hfGradAngle);
      setMenuBgStyleState(remote.menuBgStyle);
      setMenuBgColor(remote.menuBgColor);
      setMenuGradStart(remote.menuGradStart);
      setMenuGradEnd(remote.menuGradEnd);
      setMenuGradAngle(remote.menuGradAngle);
      // Keep header/sidebar text legible if user is currently in Dark Mode with light-mode DB defaults
      setSurfaceTheme((currentSurface) => {
        const currentlyDark =
          currentSurface === 'prompt-dark' ||
          currentSurface === 'midnight-dark' ||
          currentSurface === 'obsidian-gold';
        if (currentlyDark && remote.headerFooterStyle === 'light') {
          setHfTextColor('#f5f7fa');
        } else {
          setHfTextColor(remote.hfTextColor);
        }
        if (currentlyDark && remote.menuBgStyle === 'light') {
          setMenuTextColor('#e5e9f0');
        } else {
          setMenuTextColor(remote.menuTextColor);
        }
        return currentSurface;
      });
      setLanguage(remote.language);
      setFontSizePx(Number(remote.fontSizePx) || 13.5);
      setFontFamilyId(remote.fontFamilyId);
      setCardShadowLevel(remote.cardShadowLevel);
      setLockCorporateTheme(remote.lockCorporateTheme);
      if (remote.recentMenusLimit && remote.recentMenusLimit > 0) {
        setRecentMenusLimitState(Math.min(50, Math.max(1, Number(remote.recentMenusLimit))));
      }
      if (remote.dateFormat) setDateFormat(remote.dateFormat as AppDateFormat);
      if (remote.timeFormat) setTimeFormat(remote.timeFormat as AppTimeFormat);
      if (remote.currencyCode) setCurrencyCode(remote.currencyCode as GulfCurrencyCode);
      if (typeof remote.showCurrencyCode === 'boolean') setShowCurrencyCode(remote.showCurrencyCode);
      if (typeof remote.showCurrencyOnTotals === 'boolean') setShowCurrencyOnTotals(remote.showCurrencyOnTotals);
      if (remote.timeZoneId) setTimeZone(remote.timeZoneId as GulfTimeZoneId);
      setLastSavedBy(remote.updatedBy ?? 'SuperAdmin');
      setLastSavedAtUtc(remote.updatedAtUtc ?? '');
    });
    return () => {
      active = false;
    };
  }, []);

  const saveGlobalSettingsToDb = async (menuOrder?: string[]): Promise<boolean> => {
    setIsSavingToDb(true);
    try {
      const payload: GlobalUiSettingsPayload = {
        themeMode,
        primaryColor,
        gradientId,
        menuLayout,
        menuSticky,
        isMenuLocked,
        menuOrder: menuOrder ?? dbMenuOrder,
        quickAccessIds,
        headerFooterStyle,
        headerFooterColor,
        hfTextColor,
        hfGradStart,
        hfGradEnd,
        hfGradAngle,
        menuBgStyle,
        menuBgColor,
        menuTextColor,
        menuGradStart,
        menuGradEnd,
        menuGradAngle,
        language,
        fontSizePx,
        fontFamilyId,
        cardShadowLevel,
        scrollbarColor,
        lockCorporateTheme,
        recentMenusLimit,
        dateFormat,
        timeFormat,
        currencyCode,
        showCurrencyCode,
        showCurrencyOnTotals,
        timeZoneId: timeZone,
      };
      const saved = await saveGlobalUiSettings(payload, 'SuperAdmin', userRole);
      setDbConnected(true);
      setLastSavedBy(saved.updatedBy ?? 'SuperAdmin');
      setLastSavedAtUtc(saved.updatedAtUtc ?? new Date().toISOString());
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingToDb(false);
    }
  };

  const isDarkTheme =
    surfaceTheme === 'prompt-dark' ||
    surfaceTheme === 'midnight-dark' ||
    surfaceTheme === 'obsidian-gold';

  const applySurfaceTheme = (id: SurfaceThemeId) => {
    const preset = SURFACE_THEME_PRESETS.find((p) => p.id === id) ?? SURFACE_THEME_PRESETS[0];
    setSurfaceTheme(preset.id);
    setHeaderFooterStyleState('light');
    setMenuBgStyleState('light');
    setHfTextColor(preset.hfText);
    setMenuTextColor(preset.menuText);

    // Keep Login Screen / active brand color when switching between Prompt Light and Prompt Dark
    if (preset.id === 'prompt-dark' || preset.id === 'prompt-maroon') {
      const keptColor =
        themeMode === 'single' && primaryColor.toLowerCase() !== '#3b82f6'
          ? primaryColor
          : getLoginAccentSwatch();
      setThemeMode('single');
      setPrimaryColor(keptColor);
      setScrollbarColor(keptColor);
    } else {
      setThemeMode(preset.id === 'uniglobal-light' ? 'uniglobal-light' : 'single');
      setPrimaryColor(preset.primary);
      setScrollbarColor(preset.primary);
    }
  };

  const setDarkMode = (nextDark: boolean) => {
    const keptColor =
      themeMode === 'single' && primaryColor.toLowerCase() !== '#3b82f6'
        ? primaryColor
        : getLoginAccentSwatch();

    if (themeMode === 'uniglobal-light' || (surfaceTheme === 'midnight-dark' && primaryColor.toLowerCase() === '#3b82f6')) {
      setThemeMode('single');
      setPrimaryColor(keptColor);
      setScrollbarColor(keptColor);
    }

    if (nextDark) {
      setSurfaceTheme('prompt-dark');
      if (headerFooterStyle === 'light') setHfTextColor('#f5f7fa');
      if (menuBgStyle === 'light') setMenuTextColor('#e5e9f0');
    } else {
      setSurfaceTheme('prompt-maroon');
      if (headerFooterStyle === 'light') setHfTextColor('#1C252E');
      if (menuBgStyle === 'light') setMenuTextColor('#1C252E');
    }

    try {
      localStorage.setItem('prompt_hrms_login_dark', nextDark ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-surface-theme', surfaceTheme);
  }, [surfaceTheme]);

  const setHeaderFooterStyle = (style: HeaderFooterStyle) => {
    setHeaderFooterStyleState(style);
    setHfTextColor(style === 'light' ? (isDarkTheme ? '#f5f7fa' : '#1C252E') : '#ffffff');
  };

  const setMenuBgStyle = (style: HeaderFooterStyle) => {
    setMenuBgStyleState(style);
    setMenuTextColor(style === 'light' ? (isDarkTheme ? '#e5e9f0' : '#1C252E') : '#ffffff');
  };

  useEffect(() => {
    try {
      const payload: PersistedSettings = {
        surfaceTheme,
        themeMode,
        primaryColor,
        gradientId,
        menuLayout,
        menuSticky,
        headerFooterStyle,
        headerFooterColor,
        hfTextColor,
        hfGradStart,
        hfGradEnd,
        hfGradAngle,
        menuBgStyle,
        menuBgColor,
        menuTextColor,
        menuGradStart,
        menuGradEnd,
        menuGradAngle,
        language,
        fontSizePx,
        fontFamilyId,
        cardShadowLevel,
        scrollbarColor,
        quickAccessIds,
        isMenuLocked,
        recentMenusLimit,
        dateFormat,
        timeFormat,
        currencyCode,
        showCurrencyCode,
        showCurrencyOnTotals,
        timeZone,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [
    surfaceTheme,
    themeMode,
    primaryColor,
    gradientId,
    menuLayout,
    menuSticky,
    headerFooterStyle,
    headerFooterColor,
    hfTextColor,
    hfGradStart,
    hfGradEnd,
    hfGradAngle,
    menuBgStyle,
    menuBgColor,
    menuTextColor,
    menuGradStart,
    menuGradEnd,
    menuGradAngle,
    language,
    fontSizePx,
    fontFamilyId,
    cardShadowLevel,
    scrollbarColor,
    quickAccessIds,
    isMenuLocked,
    recentMenusLimit,
    dateFormat,
    timeFormat,
    currencyCode,
    showCurrencyCode,
    showCurrencyOnTotals,
    timeZone,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ug-font-size', `${fontSizePx}px`);
    root.style.fontSize = `${fontSizePx}px`;
  }, [fontSizePx]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ug-hf-text', hfTextColor);
    root.style.setProperty('--ug-menu-text', menuTextColor);
  }, [hfTextColor, menuTextColor]);

  useEffect(() => {
    const root = document.documentElement;
    const fontOpt = FONT_FAMILY_OPTIONS.find((f) => f.id === fontFamilyId) ?? FONT_FAMILY_OPTIONS[0];
    root.style.setProperty('--ug-font', fontOpt.css);
    root.style.setProperty('--ug-font-display', fontOpt.css);
  }, [fontFamilyId]);

  useEffect(() => {
    const shadowOpt = CARD_SHADOW_LEVELS.find((s) => s.level === cardShadowLevel) ?? CARD_SHADOW_LEVELS[1];
    document.documentElement.style.setProperty('--ug-card-shadow', shadowOpt.css);
  }, [cardShadowLevel]);

  useEffect(() => {
    document.documentElement.style.setProperty('--ug-scrollbar-thumb', scrollbarColor);
  }, [scrollbarColor]);

  useEffect(() => {
    const root = document.documentElement;
    const preset = GRADIENT_PRESETS.find((g) => g.id === gradientId) ?? GRADIENT_PRESETS[0];

    if (themeMode === 'uniglobal-light') {
      const baseHex = '#1B365D';
      const effectiveHex = isDarkTheme ? lightenHexColor(baseHex, 0.3) : baseHex;
      root.style.setProperty('--ug-primary', effectiveHex);
      root.style.setProperty('--ug-primary-soft', hexToRgbaString(effectiveHex, isDarkTheme ? 0.22 : 0.09));
      root.style.setProperty('--ug-accent', '#B31B34');
      root.style.setProperty('--ug-active-bg', baseHex);
    } else if (themeMode === 'single') {
      const effectiveHex =
        isDarkTheme && hexLuminance(primaryColor) < 110
          ? lightenHexColor(primaryColor, 0.22)
          : primaryColor;
      root.style.setProperty('--ug-primary', effectiveHex);
      root.style.setProperty('--ug-primary-soft', hexToRgbaString(effectiveHex, isDarkTheme ? 0.22 : 0.11));
      root.style.setProperty('--ug-active-bg', primaryColor);
    } else {
      const effectiveHex =
        isDarkTheme && hexLuminance(preset.primary) < 110
          ? lightenHexColor(preset.primary, 0.22)
          : preset.primary;
      root.style.setProperty('--ug-primary', effectiveHex);
      root.style.setProperty('--ug-primary-soft', hexToRgbaString(effectiveHex, isDarkTheme ? 0.22 : 0.11));
      root.style.setProperty('--ug-gradient', preset.css);
      root.style.setProperty('--ug-active-bg', preset.css);
    }
  }, [themeMode, primaryColor, gradientId, isDarkTheme]);

  const toggleQuickAccess = (menuId: string) => {
    setQuickAccessIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const resetAppearance = () => {
    const loginSwatch = getLoginAccentSwatch();
    setSurfaceTheme('prompt-maroon');
    setThemeMode('single');
    setPrimaryColor(loginSwatch);
    setGradientId('prompt-maroon-glow');
    setHeaderFooterStyleState('light');
    setHeaderFooterColor(loginSwatch);
    setHfTextColor('#1C252E');
    setHfGradStart(loginSwatch);
    setHfGradEnd('#5B0447');
    setHfGradAngle(135);
    setMenuBgStyleState('light');
    setMenuBgColor(loginSwatch);
    setMenuTextColor('#1C252E');
    setMenuGradStart(loginSwatch);
    setMenuGradEnd('#121820');
    setMenuGradAngle(180);
    setMenuLayout('vertical');
    setMenuSticky(true);
    setFontSizePx(13.5);
    setFontFamilyId('inter');
    setCardShadowLevel(1);
    setScrollbarColor(loginSwatch);
  };

  return (
    <ThemeContext.Provider
      value={{
        surfaceTheme,
        applySurfaceTheme,
        isDarkTheme,
        setDarkMode,
        toggleDarkMode,
        themeMode,
        setThemeMode,
        primaryColor,
        setPrimaryColor,
        gradientId,
        setGradientId,
        menuLayout,
        setMenuLayout,
        menuSticky,
        setMenuSticky,
        headerFooterStyle,
        setHeaderFooterStyle,
        headerFooterColor,
        setHeaderFooterColor,
        hfTextColor,
        setHfTextColor,
        hfGradStart,
        setHfGradStart,
        hfGradEnd,
        setHfGradEnd,
        hfGradAngle,
        setHfGradAngle,
        menuBgStyle,
        setMenuBgStyle,
        menuBgColor,
        setMenuBgColor,
        menuTextColor,
        setMenuTextColor,
        menuGradStart,
        setMenuGradStart,
        menuGradEnd,
        setMenuGradEnd,
        menuGradAngle,
        setMenuGradAngle,
        resetAppearance,
        language,
        setLanguage,
        fontSizePx,
        setFontSizePx,
        fontFamilyId,
        setFontFamilyId,
        cardShadowLevel,
        setCardShadowLevel,
        scrollbarColor,
        setScrollbarColor,
        quickAccessIds,
        toggleQuickAccess,
        userRole,
        setUserRole,
        isAdmin,
        setIsAdmin,
        isMenuLocked,
        setIsMenuLocked,
        lockCorporateTheme,
        setLockCorporateTheme,
        recentMenusLimit,
        setRecentMenusLimit,
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
        currencyMeta: getCurrencyMeta(currencyCode),
        timeZone,
        setTimeZone,
        applyGulfCountryPreset,
        formatDate: (val) => formatAppDateValue(val, dateFormat, timeZone),
        formatTime: (val, sec = false) => formatAppTimeValue(val, timeFormat, timeZone, sec),
        formatHour: (h) => formatAppHourSlot(h, timeFormat),
        formatDateTime: (val, sec = true) => formatAppDateTimeValue(val, dateFormat, timeFormat, timeZone, sec),
        formatCurrency: (amt, conv = false, isTotal = false) =>
          formatAppCurrencyValue(
            amt,
            currencyCode,
            conv,
            isTotal ? showCurrencyOnTotals : showCurrencyCode
          ),
        todayIso: () => getTodayIsoInTimeZone(timeZone),
        dbMenuOrder,
        isSavingToDb,
        dbConnected,
        lastSavedBy,
        lastSavedAtUtc,
        saveGlobalSettingsToDb,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
