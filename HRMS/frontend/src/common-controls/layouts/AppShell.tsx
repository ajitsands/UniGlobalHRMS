import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  GripVertical,
  History,
  Lock,
  LogOut,
  Menu,
  Moon,
  Palette,
  Pin,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import {
  CARD_SHADOW_LEVELS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_PRESETS,
  GRADIENT_PRESETS,
  HeaderFooterStyle,
  MenuLayout,
  SINGLE_COLOR_PRESETS,
  SURFACE_THEME_PRESETS,
  TEXT_COLOR_PRESETS,
  ThemeMode,
  useTheme,
} from '../tokens/ThemeContext';
import { Accordion, Drawer } from '../controls/ContainersAndPopups';
import { Badge, Button, HelpPopup, Tooltip } from '../controls/HelpAndFeedback';
import { SwitchToggle } from '../controls/FormControls';
import { UniGlobalLogoIcon } from '../controls/BrandAndLoader';
import { useToast } from '../controls/ToastSystem';

export interface NavMenuItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  children?: NavMenuItem[];
}

export interface RecentMenuRecord {
  menuId: string;
  label: string;
  labelAr: string;
  parentLabel?: string;
  accessedAtUtc: string;
  visitCount: number;
}

interface AppShellProps {
  menuItems: NavMenuItem[];
  onReorderMenus: (items: NavMenuItem[]) => void;
  activeMenuId: string;
  onSelectMenu: (id: string) => void;
  currentUserLabel?: string;
  onSignOut?: () => void;
  recentMenus?: RecentMenuRecord[];
  recentSyncDirty?: boolean;
  recentLastSyncedAtUtc?: string;
  onClearRecentMenus?: () => void;
  onForceSyncRecentMenus?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  menuItems,
  onReorderMenus,
  activeMenuId,
  onSelectMenu,
  currentUserLabel,
  onSignOut,
  recentMenus = [],
  recentSyncDirty = false,
  recentLastSyncedAtUtc,
  onClearRecentMenus,
  onForceSyncRecentMenus,
  children,
}) => {
  const {
    surfaceTheme,
    applySurfaceTheme,
    isDarkTheme,
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
    isMenuLocked,
    setIsMenuLocked,
    lockCorporateTheme,
    setLockCorporateTheme,
    recentMenusLimit,
    setRecentMenusLimit,
    isSavingToDb,
    dbConnected,
    lastSavedBy,
    lastSavedAtUtc,
    saveGlobalSettingsToDb,
  } = useTheme();
  const toast = useToast();
  const isLockedForCurrentUser = userRole !== 'SuperAdmin' && lockCorporateTheme;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recentDrawerOpen, setRecentDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>(['employees']);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const closeDropdownTimerRef = useRef<number | null>(null);

  const openHoverDropdown = (id: string) => {
    if (closeDropdownTimerRef.current !== null) {
      window.clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
    setOpenDropdownId(id);
  };

  const scheduleCloseDropdown = () => {
    if (closeDropdownTimerRef.current !== null) {
      window.clearTimeout(closeDropdownTimerRef.current);
    }
    closeDropdownTimerRef.current = window.setTimeout(() => {
      setOpenDropdownId(null);
      closeDropdownTimerRef.current = null;
    }, 180);
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickDropdownOpen, setQuickDropdownOpen] = useState(false);
  const quickDropdownRef = useRef<HTMLDivElement>(null);

  // Draggable Floating Dock position (persisted in localStorage)
  const DOCK_POS_KEY = 'uniglobal_hrms_dock_pos_v1';
  const [dockPos, setDockPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = localStorage.getItem(DOCK_POS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const dockRef = useRef<HTMLElement>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  const startDockDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    dragOffsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };

    const onMove = (ev: MouseEvent) => {
      if (!dragOffsetRef.current || !dockRef.current) return;
      const w = dockRef.current.offsetWidth;
      const h = dockRef.current.offsetHeight;
      const nextX = Math.max(8, Math.min(window.innerWidth - w - 8, ev.clientX - dragOffsetRef.current.dx));
      const nextY = Math.max(8, Math.min(window.innerHeight - h - 8, ev.clientY - dragOffsetRef.current.dy));
      setDockPos({ x: nextX, y: nextY });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dockRef.current) {
        const r = dockRef.current.getBoundingClientRect();
        const finalPos = { x: Math.round(r.left), y: Math.round(r.top) };
        setDockPos(finalPos);
        try {
          localStorage.setItem(DOCK_POS_KEY, JSON.stringify(finalPos));
        } catch {
          // ignore
        }
      }
      dragOffsetRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const dockOpensUp = dockPos ? dockPos.y > window.innerHeight / 2 : true;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (quickDropdownRef.current && !quickDropdownRef.current.contains(e.target as Node)) {
        setQuickDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const isAr = language === 'ar';
  const getLabel = (item: NavMenuItem) => (isAr ? item.labelAr : item.label);

  const isHfDark = headerFooterStyle === 'single' || headerFooterStyle === 'gradient';
  const hfInlineStyle: React.CSSProperties = {
    ...(headerFooterStyle === 'single'
      ? { background: headerFooterColor }
      : headerFooterStyle === 'gradient'
      ? { background: `linear-gradient(${hfGradAngle}deg, ${hfGradStart} 0%, ${hfGradEnd} 100%)` }
      : {}),
    color: hfTextColor,
  };
  const hfClass =
    headerFooterStyle === 'single'
      ? 'is-single-colored'
      : headerFooterStyle === 'gradient'
      ? 'is-gradient'
      : '';

  const isMenuColored = menuBgStyle === 'single' || menuBgStyle === 'gradient';
  const menuInlineStyle: React.CSSProperties | undefined =
    menuBgStyle === 'single'
      ? { background: menuBgColor }
      : menuBgStyle === 'gradient'
      ? { background: `linear-gradient(${menuGradAngle}deg, ${menuGradStart} 0%, ${menuGradEnd} 100%)` }
      : undefined;
  const menuColorClass = isMenuColored ? 'ug-menu-colored' : '';

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx || !isAdmin || isMenuLocked) return;
    const copy = [...menuItems];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    onReorderMenus(copy);
    setDragIdx(null);
  };

  const allFlatItems = menuItems.flatMap((m) => (m.children ? [m, ...m.children] : [m]));
  const quickItems = allFlatItems.filter((m) => quickAccessIds.includes(m.id));

  const renderNavItem = (item: NavMenuItem, idx: number, showPin = true) => {
    const hasSub = Boolean(item.children && item.children.length > 0);
    const isExpanded = expandedIds.includes(item.id);
    const isAct =
      item.id === activeMenuId || Boolean(item.children?.some((c) => c.id === activeMenuId));
    const isPinned = quickAccessIds.includes(item.id);
    const canDrag = isAdmin && !isMenuLocked;

    // Minimal Icon Rail: hover/click flyout submenu beside the rail
    if (menuLayout === 'minimal' && hasSub) {
      const isFlyoutOpen = openDropdownId === item.id;
      return (
        <div
          key={item.id}
          className="ug-nav-dropdown-wrap"
          onMouseEnter={() => openHoverDropdown(item.id)}
          onMouseLeave={scheduleCloseDropdown}
        >
          <button
            type="button"
            className={`ug-nav-item ${isAct ? 'active' : ''}`}
            onClick={() => setOpenDropdownId(isFlyoutOpen ? null : item.id)}
            title={getLabel(item)}
            style={{ justifyContent: 'center' }}
          >
            {item.icon}
          </button>
          {isFlyoutOpen && (
            <div
              className="ug-nav-dropdown-panel"
              style={{ top: 0, insetInlineStart: 'calc(100% + 6px)' }}
            >
              <div
                style={{
                  padding: '5px 10px',
                  fontSize: '0.815rem',
                  fontWeight: 700,
                  color: 'var(--ug-muted)',
                  borderBottom: '1px solid var(--ug-border)',
                  marginBottom: 3,
                }}
              >
                {getLabel(item)}
              </div>
              {item.children!.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`ug-nav-item ${sub.id === activeMenuId ? 'active' : ''}`}
                  onClick={() => {
                    onSelectMenu(sub.id);
                    setOpenDropdownId(null);
                  }}
                >
                  {sub.icon}
                  <span>{getLabel(sub)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if ((menuLayout === 'horizontal' || menuLayout === 'docking') && hasSub) {
      const isDropOpen = openDropdownId === item.id;
      const shouldOpenUp = menuLayout === 'docking' && dockOpensUp;
      return (
        <div
          key={item.id}
          className="ug-nav-dropdown-wrap"
          onMouseEnter={() => openHoverDropdown(item.id)}
          onMouseLeave={scheduleCloseDropdown}
        >
          <button
            type="button"
            className={`ug-nav-item ${isAct ? 'active' : ''}`}
            onClick={() => setOpenDropdownId(isDropOpen ? null : item.id)}
          >
            {item.icon}
            <span className="ug-nav-label">{getLabel(item)}</span>
            <ChevronDown size={13} />
          </button>
          {isDropOpen && (
            <div className={`ug-nav-dropdown-panel ${shouldOpenUp ? 'opens-up' : ''}`}>
              {item.children!.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`ug-nav-item ${sub.id === activeMenuId ? 'active' : ''}`}
                  onClick={() => {
                    onSelectMenu(sub.id);
                    setOpenDropdownId(null);
                  }}
                >
                  {sub.icon}
                  <span>{getLabel(sub)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.id}
        draggable={canDrag}
        onDragStart={() => setDragIdx(idx)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(idx)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            type="button"
            className={`ug-nav-item ${isAct && !hasSub ? 'active' : ''}`}
            onClick={() => {
              if (hasSub && menuLayout === 'vertical') {
                toggleExpand(item.id);
              } else {
                onSelectMenu(hasSub && item.children ? item.children[0].id : item.id);
              }
            }}
            title={getLabel(item)}
          >
            {canDrag && menuLayout === 'vertical' && (
              <GripVertical size={13} style={{ opacity: 0.55, cursor: 'grab' }} />
            )}
            {item.icon}
            <span className="ug-nav-label" style={{ flex: 1 }}>
              {getLabel(item)}
            </span>
            {hasSub && menuLayout === 'vertical' && (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
          </button>

          {showPin && menuLayout === 'vertical' && !hasSub && (
            <Tooltip content={isPinned ? 'Remove from Quick Access' : 'Pin to Quick Access'}>
              <button
                type="button"
                className="ug-icon-btn"
                style={{
                  width: 26,
                  height: 26,
                  color: isPinned ? 'var(--ug-amber)' : 'var(--ug-muted)',
                }}
                onClick={() => toggleQuickAccess(item.id)}
              >
                <Pin size={12} />
              </button>
            </Tooltip>
          )}
        </div>

        {hasSub && menuLayout === 'vertical' && isExpanded && (
          <div className="ug-submenu-list">
            {item.children!.map((sub) => {
              const subPinned = quickAccessIds.includes(sub.id);
              return (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button
                    type="button"
                    className={`ug-nav-item ${sub.id === activeMenuId ? 'active' : ''}`}
                    style={{ padding: '7px 10px', fontSize: '0.926rem' }}
                    onClick={() => onSelectMenu(sub.id)}
                  >
                    {sub.icon}
                    <span className="ug-nav-label" style={{ flex: 1 }}>
                      {getLabel(sub)}
                    </span>
                  </button>
                  <Tooltip content={subPinned ? 'Remove from Quick Access' : 'Pin to Quick Access'}>
                    <button
                      type="button"
                      className="ug-icon-btn"
                      style={{
                        width: 24,
                        height: 24,
                        color: subPinned ? 'var(--ug-amber)' : 'var(--ug-muted)',
                      }}
                      onClick={() => toggleQuickAccess(sub.id)}
                    >
                      <Pin size={11} />
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ug-shell">
      {/* UniGlobal Header (Light Default / User Single Color / User Gradient) */}
      <header className={`ug-header ${hfClass}`} style={hfInlineStyle}>
        <div className="ug-brand">
          <button
            type="button"
            className="ug-icon-btn ug-mobile-menu-btn"
            style={{ color: hfTextColor }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={20} />
          </button>
          <div
            className="ug-brand-badge"
            style={{
              background: '#ffffff',
              border: '1px solid var(--ug-border)',
              padding: 3,
            }}
          >
            <UniGlobalLogoIcon size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ color: hfTextColor }}>
                {isAr ? 'برومبت' : 'PROMPT'}
              </span>
              <span style={{ fontSize: '0.815rem', fontWeight: 700, color: isHfDark ? '#fde68a' : 'var(--ug-accent)', letterSpacing: '0.8px' }}>
                {isAr ? 'الموارد البشرية' : 'HRMS'}
              </span>
            </div>
            <div
              className="ug-header-sub"
              style={{ fontSize: '0.778rem', fontWeight: 500, color: hfTextColor, opacity: 0.78 }}
            >
              {isAr ? 'بوابة إدارة الموارد البشرية والرواتب' : 'UniGlobal Consultancy • UG Suite'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Compact Quick Access Menu near Help when page is scrolled */}
          {isScrolled && (
            <div ref={quickDropdownRef} className="ug-nav-dropdown-wrap">
              <Button
                variant="secondary"
                size="sm"
                icon={<Pin size={13} style={{ color: 'var(--ug-amber)' }} />}
                onClick={() => setQuickDropdownOpen((o) => !o)}
              >
                {isAr ? 'الوصول السريع' : 'Quick Access'} ({quickItems.length})
                <ChevronDown size={13} />
              </Button>

              {quickDropdownOpen && (
                <div
                  className="ug-nav-dropdown-panel"
                  style={{ insetInlineStart: 'auto', insetInlineEnd: 0, minWidth: 220 }}
                >
                  <div
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.815rem',
                      fontWeight: 700,
                      color: 'var(--ug-muted)',
                      borderBottom: '1px solid var(--ug-border)',
                      marginBottom: 4,
                    }}
                  >
                    {isAr ? 'القوائم المثبتة' : 'PINNED QUICK MENUS'}
                  </div>
                  {quickItems.length === 0 ? (
                    <div style={{ padding: 10, fontSize: '0.889rem', color: 'var(--ug-muted)' }}>
                      No pinned menus yet
                    </div>
                  ) : (
                    quickItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`ug-nav-item ${activeMenuId === item.id ? 'active' : ''}`}
                        onClick={() => {
                          onSelectMenu(item.id);
                          setQuickDropdownOpen(false);
                        }}
                      >
                        {item.icon}
                        <span>{getLabel(item)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick User Comfort Font Size Controls (A- / A / A+) in Header */}
          <div
            className="ug-hide-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--ug-border-strong)',
              borderRadius: 'var(--ug-radius-sm)',
              background: 'var(--ug-surface)',
              overflow: 'hidden',
            }}
            aria-label="Adjust font size for reading comfort"
          >
            <Tooltip content="Decrease font size" placement="bottom">
              <button
                type="button"
                className="ug-btn ug-btn-ghost ug-btn-sm"
                style={{ borderRadius: 0, padding: '4px 8px', color: 'var(--ug-text)' }}
                disabled={fontSizePx <= 10}
                onClick={() => setFontSizePx(Math.max(10, Number((fontSizePx - 1).toFixed(1))))}
              >
                A-
              </button>
            </Tooltip>
            <Tooltip content={`Current: ${fontSizePx}px (click to reset)`} placement="bottom">
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
            </Tooltip>
            <Tooltip content="Increase font size" placement="bottom">
              <button
                type="button"
                className="ug-btn ug-btn-ghost ug-btn-sm"
                style={{ borderRadius: 0, padding: '4px 8px', color: 'var(--ug-text)' }}
                disabled={fontSizePx >= 20}
                onClick={() => setFontSizePx(Math.min(20, Number((fontSizePx + 1).toFixed(1))))}
              >
                A+
              </button>
            </Tooltip>
          </div>

          {/* Quick Light / Dark Mode Toggle */}
          <Tooltip content={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'} placement="bottom">
            <Button
              variant="secondary"
              size="sm"
              icon={isDarkTheme ? <Sun size={14} style={{ color: '#f59e0b' }} /> : <Moon size={14} />}
              onClick={toggleDarkMode}
              aria-label="Toggle Light or Dark Theme"
            />
          </Tooltip>

          <HelpPopup
            title="Navigation & Workspace Help"
            summary="Customize your workspace layout, theme colors, language (EN/AR), and Quick Access shortcuts."
            steps={[
              'Click the Pin icon next to any menu item to add it to your Easy Access bar.',
              'Open Appearance & Layout Studio to switch between Vertical, Horizontal, Docking, or Minimal menus.',
              'Admins can drag and drop menu items in Vertical mode and lock the menu flow.',
            ]}
            manualSection="Section 1.2 — Workspace & Menu Customization"
            onOpenManual={() => onSelectMenu('manual')}
          />

          <Button
            variant="secondary"
            size="sm"
            icon={<Globe size={14} />}
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          >
            <span className="ug-hide-mobile">{isAr ? 'English' : 'العربية'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<BookOpen size={14} />}
            onClick={() => onSelectMenu('manual')}
          >
            <span className="ug-hide-mobile">{isAr ? 'دليل المستخدم' : 'Manual'}</span>
          </Button>

          {/* Per-User Recently Accessed Menus -> Opens Right-Side Sliding Canvas */}
          <Tooltip
            content={
              isAr
                ? `آخر ${recentMenusLimit} قوائم تم فتحها مع التاريخ والوقت`
                : `Recently Accessed Menus (Last ${recentMenusLimit} with Date & Time Stamp)`
            }
            placement="bottom"
          >
            <Button
              variant="secondary"
              size="sm"
              icon={<History size={14} style={{ color: 'var(--ug-primary)' }} />}
              onClick={() => setRecentDrawerOpen(true)}
            >
              <span className="ug-hide-mobile">{isAr ? 'الأخيرة' : 'Recent'}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: 999,
                  background: 'var(--ug-primary-soft)',
                  color: 'var(--ug-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                }}
              >
                {Math.min(recentMenus.length, recentMenusLimit)}
              </span>
            </Button>
          </Tooltip>

          <Button
            variant="primary"
            size="sm"
            icon={<SlidersHorizontal size={14} />}
            onClick={() => setSettingsOpen(true)}
          >
            <span className="ug-hide-mobile">{isAr ? 'التخصيص' : 'Customize'}</span>
          </Button>

          {onSignOut && (
            <Tooltip
              content={
                currentUserLabel
                  ? `${currentUserLabel} — Click to Sign Out / Switch Login Screen`
                  : 'Sign Out to Login Screen'
              }
              placement="bottom"
            >
              <Button
                variant="secondary"
                size="sm"
                icon={<LogOut size={14} style={{ color: 'var(--ug-danger)' }} />}
                onClick={onSignOut}
              >
                <span className="ug-hide-mobile">{isAr ? 'خروج' : 'Sign Out'}</span>
              </Button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Easy / Quick Access Bar */}
      <div className="ug-quick-bar">
        <span style={{ fontSize: '0.852rem', fontWeight: 700, color: 'var(--ug-muted)', whiteSpace: 'nowrap' }}>
          {isAr ? 'الوصول السريع:' : 'Quick Access:'}
        </span>
        {quickItems.length === 0 && (
          <span style={{ fontSize: '0.852rem', color: 'var(--ug-muted)' }}>
            Pin any menu from the sidebar for 1-click access
          </span>
        )}
        {quickItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ug-quick-chip ${activeMenuId === item.id ? 'active' : ''}`}
            onClick={() => onSelectMenu(item.id)}
          >
            {item.icon}
            {getLabel(item)}
          </button>
        ))}
      </div>

      {/* Horizontal Menu Mode */}
      {menuLayout === 'horizontal' && (
        <nav
          className={`ug-horizontal-nav ${menuSticky ? 'is-sticky' : ''} ${menuColorClass}`}
          style={menuInlineStyle}
        >
          {menuItems.map((item, i) => renderNavItem(item, i, false))}
        </nav>
      )}

      {/* Main Content Area */}
      <div className="ug-body-wrap">
        {(menuLayout === 'vertical' || menuLayout === 'minimal') && (
          <aside
            className={`ug-sidebar ${menuLayout === 'minimal' ? 'is-minimal' : ''} ${menuSticky ? 'is-sticky' : ''} ${menuColorClass}`}
            style={menuInlineStyle}
          >
            {menuLayout === 'vertical' && isAdmin && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px 10px',
                  fontSize: '0.815rem',
                  color: 'var(--ug-muted)',
                }}
              >
                <span className="ug-nav-section-title" style={{ fontWeight: 700 }}>
                  {isMenuLocked ? 'MENU LOCKED' : 'DRAG TO REORDER'}
                </span>
                <button
                  type="button"
                  className="ug-icon-btn"
                  style={{ width: 24, height: 24 }}
                  onClick={() => setIsMenuLocked(!isMenuLocked)}
                  title={isMenuLocked ? 'Unlock Menu Order (Admin)' : 'Lock Menu Flow (Admin)'}
                >
                  {isMenuLocked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {menuItems.map((item, i) => renderNavItem(item, i, true))}
            </div>
          </aside>
        )}

        <main className="ug-main">{children}</main>
      </div>

      {/* Floating / Docking Menu Mode (Draggable Anywhere on Screen) */}
      {menuLayout === 'docking' && (
        <nav
          ref={dockRef}
          className={`ug-dock-nav ${menuColorClass}`}
          style={{
            ...menuInlineStyle,
            ...(dockPos
              ? { left: dockPos.x, top: dockPos.y, bottom: 'auto', transform: 'none' }
              : { bottom: 44, left: '50%', transform: 'translateX(-50%)' }),
          }}
          aria-label="Floating Dock Menu"
        >
          <span
            className="ug-dock-drag-handle"
            onMouseDown={startDockDrag}
            title="Drag to move floating menu anywhere on screen"
          >
            <GripVertical size={15} />
          </span>
          {menuItems.map((item, i) => renderNavItem(item, i, false))}
        </nav>
      )}

      {/* UniGlobal Footer (Light Default / User Single Color / User Gradient) */}
      <footer className={`ug-footer ${hfClass}`} style={hfInlineStyle}>
        <span>
          © {new Date().getFullYear()} <strong>UniGlobal Consultancy Services W.L.L.</strong> • Engineered by{' '}
          <strong>SaNDS Lab Middle East W.L.L.</strong>
        </span>
        <span>Common Controls v1.0 • Responsive &amp; Mobile Ready • EN / AR (RTL)</span>
      </footer>

      {/* Mobile Navigation Slide-Out Drawer (<= 768px) */}
      {mobileMenuOpen && (
        <div className="ug-mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div
            className={`ug-mobile-nav-drawer ${menuColorClass}`}
            style={menuInlineStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="ug-card-header"
              style={{ borderBottomColor: isMenuColored ? 'rgba(255,255,255,0.2)' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <UniGlobalLogoIcon size={22} />
                <span>{isAr ? 'القائمة الرئيسية' : 'PROMPT HRMS'}</span>
              </div>
              <button
                type="button"
                className="ug-icon-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {menuItems.map((item) => {
                const hasSub = Boolean(item.children && item.children.length > 0);
                const isExp = expandedIds.includes(item.id);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      className={`ug-nav-item ${activeMenuId === item.id ? 'active' : ''}`}
                      onClick={() => {
                        if (hasSub) {
                          toggleExpand(item.id);
                        } else {
                          onSelectMenu(item.id);
                          setMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.icon}
                      <span style={{ flex: 1 }}>{getLabel(item)}</span>
                      {hasSub && (isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </button>
                    {hasSub && isExp && (
                      <div className="ug-submenu-list">
                        {item.children!.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className={`ug-nav-item ${activeMenuId === sub.id ? 'active' : ''}`}
                            onClick={() => {
                              onSelectMenu(sub.id);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {sub.icon}
                            <span>{getLabel(sub)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Right-Side Sliding Canvas: Per-User Recently Accessed Menus (SuperAdmin-Configured Limit) */}
      <Drawer
        open={recentDrawerOpen}
        onClose={() => setRecentDrawerOpen(false)}
        title={
          isAr
            ? `آخر القوائم المفتوحة (حتى ${recentMenusLimit})`
            : `Recently Accessed Menus (Last ${recentMenusLimit})`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User Identity & Hybrid Sync Status Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'var(--ug-surface-alt)',
              border: '1px solid var(--ug-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.889rem', fontWeight: 700, color: 'var(--ug-text)' }}>
                {currentUserLabel || (isAr ? 'المستخدم الحالي' : 'Active User Session')}
              </div>
              <Badge variant="primary">
                {Math.min(recentMenus.length, recentMenusLimit)} / {recentMenusLimit} {isAr ? 'قوائم' : 'Menus'}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {recentSyncDirty ? (
                <Badge variant="warning">
                  <Clock size={11} />
                  {isAr ? 'محفوظ محلياً · بانتظار المزامنة التلقائية' : 'Cached Locally • Syncs on Idle / Close'}
                </Badge>
              ) : (
                <Badge variant="success">
                  <CheckCircle2 size={11} />
                  {isAr ? 'تمت المزامنة مع SQL Server' : 'Synced with SQL Server'}
                </Badge>
              )}

              {onForceSyncRecentMenus && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw size={12} />}
                  onClick={onForceSyncRecentMenus}
                >
                  {isAr ? 'مزامنة الآن' : 'Sync DB Now'}
                </Button>
              )}
            </div>

            {recentLastSyncedAtUtc && (
              <div style={{ fontSize: '0.778rem', color: 'var(--ug-muted)' }}>
                {isAr ? 'آخر مزامنة مع قاعدة البيانات: ' : 'Last DB Sync: '}
                {new Date(recentLastSyncedAtUtc).toLocaleString(isAr ? 'ar-BH' : 'en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            )}
          </div>

          {/* Collapsible Architecture Guide */}
          <Accordion
            items={[
              {
                id: 'how-hybrid-works',
                title: isAr ? 'كيف تعمل المزامنة الهجينة؟' : 'How Hybrid Sync Works (Local + DB)',
                content: (
                  <ol style={{ margin: 0, paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.852rem', color: 'var(--ug-text-secondary)' }}>
                    <li>
                      <strong>{isAr ? 'عند تسجيل الدخول:' : '1. On Login:'}</strong>{' '}
                      {isAr
                        ? 'يتم جلب آخر 10 قوائم خاصة بالمستخدم من SQL Server مرة واحدة وتخزينها محلياً.'
                        : 'Fetches your personal Top-10 history once from SQL Server into Local Storage.'}
                    </li>
                    <li>
                      <strong>{isAr ? 'أثناء التنقل (0ms):' : '2. On Menu Click (0ms):'}</strong>{' '}
                      {isAr
                        ? 'تحديث فوري في الذاكرة المحلية مع ختم التاريخ والوقت دون أي ضغط على الخادم.'
                        : 'Updates Local Storage immediately with exact Date & Time stamp — zero API hits per click.'}
                    </li>
                    <li>
                      <strong>{isAr ? 'الحفظ التلقائي:' : '3. Idle / Close Flush:'}</strong>{' '}
                      {isAr
                        ? 'يتم الحفظ تلقائياً في قاعدة البيانات عند خمول الصفحة (20 ثانية) أو إغلاق النافذة أو تسجيل الخروج.'
                        : 'Batch-saves to SQL Server on 20s Page Idle, Tab Minimize, Window Close (keepalive), or Sign Out.'}
                    </li>
                  </ol>
                ),
              },
            ]}
          />

          {/* Top-10 Accessed Menu Cards */}
          {recentMenus.length === 0 ? (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                borderRadius: 10,
                border: '1px dashed var(--ug-border-strong)',
                color: 'var(--ug-muted)',
                fontSize: '0.926rem',
              }}
            >
              {isAr
                ? 'لا توجد قوائم مسجلة بعد. افتح أي شاشة ليظهر سجلها هنا مع التاريخ والوقت.'
                : 'No recent menus recorded yet. Navigate to any screen to track its Date & Time stamp here.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentMenus.slice(0, recentMenusLimit).map((rec, index) => {
                const matchedMenu = allFlatItems.find((m) => m.id === rec.menuId);
                const dt = new Date(rec.accessedAtUtc);
                const formattedStamp = Number.isNaN(dt.getTime())
                  ? rec.accessedAtUtc
                  : dt.toLocaleString(isAr ? 'ar-BH' : 'en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    });
                const diffSec = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
                const relativeStr =
                  diffSec < 45
                    ? isAr
                      ? 'الآن'
                      : 'Just now'
                    : diffSec < 3600
                    ? `${Math.floor(diffSec / 60)}m ago`
                    : diffSec < 86400
                    ? `${Math.floor(diffSec / 3600)}h ago`
                    : `${Math.floor(diffSec / 86400)}d ago`;

                const isCurrent = rec.menuId === activeMenuId;

                return (
                  <button
                    key={rec.menuId}
                    type="button"
                    onClick={() => {
                      onSelectMenu(rec.menuId);
                      setRecentDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'start',
                      padding: '11px 13px',
                      borderRadius: 10,
                      border: `1px solid ${isCurrent ? 'var(--ug-primary)' : 'var(--ug-border)'}`,
                      background: isCurrent ? 'var(--ug-primary-soft)' : 'var(--ug-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 11,
                      transition: 'all 0.16s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isCurrent ? 'var(--ug-primary)' : 'var(--ug-surface-alt)',
                        color: isCurrent ? '#ffffff' : 'var(--ug-primary)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                      }}
                    >
                      {matchedMenu?.icon ?? `#${index + 1}`}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ug-text)' }}>
                          #{index + 1} · {isAr ? rec.labelAr || rec.label : rec.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: 'var(--ug-primary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {relativeStr}
                        </span>
                      </div>

                      {rec.parentLabel && (
                        <div style={{ fontSize: '0.778rem', color: 'var(--ug-muted)', marginTop: 1 }}>
                          {rec.parentLabel}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 5,
                          fontSize: '0.778rem',
                          color: 'var(--ug-text-secondary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} style={{ color: 'var(--ug-muted)' }} />
                          {formattedStamp}
                        </span>
                        <span style={{ color: 'var(--ug-muted)', fontWeight: 600 }}>
                          {isAr ? `الزيارات: ${rec.visitCount}` : `${rec.visitCount}x`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {recentMenus.length > 0 && onClearRecentMenus && (
            <div style={{ borderTop: '1px solid var(--ug-border)', paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="danger-ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={onClearRecentMenus}
              >
                {isAr ? 'مسح سجل القوائم الأخيرة' : 'Clear My Recent History'}
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      {/* Appearance & Layout Studio Drawer */}
      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Workspace & Theme Customizer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Role Switcher (Preview SuperAdmin vs Standard User) */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--ug-surface-alt)',
              border: '1px solid var(--ug-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Active Role:{' '}
              <span style={{ color: userRole === 'SuperAdmin' ? 'var(--ug-accent)' : 'var(--ug-primary)' }}>
                {userRole}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                variant={userRole === 'SuperAdmin' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setUserRole('SuperAdmin')}
              >
                SuperAdmin
              </Button>
              <Button
                variant={userRole === 'User' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setUserRole('User')}
              >
                Standard User
              </Button>
            </div>
          </div>

          {isLockedForCurrentUser && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--ug-warning-bg)',
                borderInlineStart: '4px solid var(--ug-warning)',
                fontSize: '0.85rem',
                color: 'var(--ug-text)',
              }}
            >
              <strong>Corporate Identity Locked:</strong> Your organization&apos;s theme &amp; layout are fixed by{' '}
              <strong>SuperAdmin</strong> in the database and apply automatically to all logged-in users.
            </div>
          )}

          <div style={isLockedForCurrentUser ? { opacity: 0.55, pointerEvents: 'none' } : undefined}>
          <Accordion
            defaultOpenIds={[]}
            items={[
              {
                id: 'elegant-themes',
                title: 'Light, Dark & Elegant Theme Presets',
                content: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {SURFACE_THEME_PRESETS.map((preset) => {
                      const active = surfaceTheme === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applySurfaceTheme(preset.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: active ? `2px solid ${preset.primary}` : '1px solid var(--ug-border-strong)',
                            background: preset.cardPreview,
                            color: preset.mode === 'dark' ? '#f8fafc' : '#0f172a',
                            cursor: 'pointer',
                            textAlign: 'start',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{preset.name}</span>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: preset.primary,
                                flexShrink: 0,
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ width: 18, height: 6, borderRadius: 3, background: preset.bgPreview, border: '1px solid rgba(128,128,128,0.25)' }} />
                            <span style={{ width: 18, height: 6, borderRadius: 3, background: preset.primary }} />
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>
                              {preset.mode}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ),
              },
              {
                id: 'menu-layout',
                title: 'Menu Layout & Scroll Behavior',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.889rem', marginBottom: 8 }}>Menu Layout Style</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {(
                          [
                            { id: 'vertical', label: 'Vertical Sidebar' },
                            { id: 'horizontal', label: 'Horizontal Topbar' },
                            { id: 'docking', label: 'Floating / Docking' },
                            { id: 'minimal', label: 'Minimal Icon Rail' },
                          ] as { id: MenuLayout; label: string }[]
                        ).map((m) => (
                          <Button
                            key={m.id}
                            variant={menuLayout === m.id ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setMenuLayout(m.id)}
                          >
                            {m.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.889rem', marginBottom: 8 }}>Menu Scroll Behavior</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <Button
                          variant={menuSticky ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setMenuSticky(true)}
                        >
                          Sticky Menu
                        </Button>
                        <Button
                          variant={!menuSticky ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setMenuSticky(false)}
                        >
                          Scroll with Page
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'header-footer',
                title: 'Header & Footer Color & Font',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(
                        [
                          { id: 'light', label: 'Light Default' },
                          { id: 'single', label: 'Single Color' },
                          { id: 'gradient', label: 'Gradient' },
                        ] as { id: HeaderFooterStyle; label: string }[]
                      ).map((opt) => (
                        <Button
                          key={opt.id}
                          variant={headerFooterStyle === opt.id ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setHeaderFooterStyle(opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>

                    {headerFooterStyle === 'single' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {SINGLE_COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => setHeaderFooterColor(c.hex)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: c.hex,
                              border: headerFooterColor === c.hex ? '3px solid #0f172a' : '2px solid #fff',
                              boxShadow: '0 0 0 1px var(--ug-border-strong)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={headerFooterColor}
                          onChange={(e) => setHeaderFooterColor(e.target.value)}
                          title="Custom Header & Footer Color"
                        />
                      </div>
                    )}

                    {headerFooterStyle === 'gradient' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <label style={{ fontSize: '0.852rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                            Start <input type="color" value={hfGradStart} onChange={(e) => setHfGradStart(e.target.value)} />
                          </label>
                          <label style={{ fontSize: '0.852rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                            End <input type="color" value={hfGradEnd} onChange={(e) => setHfGradEnd(e.target.value)} />
                          </label>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[90, 135, 180].map((deg) => (
                              <Button
                                key={deg}
                                variant={hfGradAngle === deg ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setHfGradAngle(deg)}
                              >
                                {deg}°
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            height: 24,
                            borderRadius: 6,
                            background: `linear-gradient(${hfGradAngle}deg, ${hfGradStart} 0%, ${hfGradEnd} 100%)`,
                            border: '1px solid var(--ug-border)',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '0.852rem', fontWeight: 600, marginBottom: 6 }}>Header & Footer Font Color</div>
                      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                        {TEXT_COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => setHfTextColor(c.hex)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: c.hex,
                              border: hfTextColor === c.hex ? '3px solid var(--ug-primary)' : '1px solid var(--ug-border-strong)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={hfTextColor}
                          onChange={(e) => setHfTextColor(e.target.value)}
                          title="Custom Header & Footer Font Color"
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'menu-bg',
                title: 'Menu Background & Font Color',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(
                        [
                          { id: 'light', label: 'Light Default' },
                          { id: 'single', label: 'Single Color' },
                          { id: 'gradient', label: 'Gradient' },
                        ] as { id: HeaderFooterStyle; label: string }[]
                      ).map((opt) => (
                        <Button
                          key={opt.id}
                          variant={menuBgStyle === opt.id ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setMenuBgStyle(opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>

                    {menuBgStyle === 'single' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {SINGLE_COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => setMenuBgColor(c.hex)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: c.hex,
                              border: menuBgColor === c.hex ? '3px solid #0f172a' : '2px solid #fff',
                              boxShadow: '0 0 0 1px var(--ug-border-strong)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={menuBgColor}
                          onChange={(e) => setMenuBgColor(e.target.value)}
                          title="Custom Menu Background Color"
                        />
                      </div>
                    )}

                    {menuBgStyle === 'gradient' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <label style={{ fontSize: '0.852rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                            Start <input type="color" value={menuGradStart} onChange={(e) => setMenuGradStart(e.target.value)} />
                          </label>
                          <label style={{ fontSize: '0.852rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                            End <input type="color" value={menuGradEnd} onChange={(e) => setMenuGradEnd(e.target.value)} />
                          </label>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[90, 135, 180].map((deg) => (
                              <Button
                                key={deg}
                                variant={menuGradAngle === deg ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setMenuGradAngle(deg)}
                              >
                                {deg}°
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            height: 24,
                            borderRadius: 6,
                            background: `linear-gradient(${menuGradAngle}deg, ${menuGradStart} 0%, ${menuGradEnd} 100%)`,
                            border: '1px solid var(--ug-border)',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '0.852rem', fontWeight: 600, marginBottom: 6 }}>Menu Font Color</div>
                      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                        {TEXT_COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => setMenuTextColor(c.hex)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: c.hex,
                              border: menuTextColor === c.hex ? '3px solid var(--ug-primary)' : '1px solid var(--ug-border-strong)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={menuTextColor}
                          onChange={(e) => setMenuTextColor(e.target.value)}
                          title="Custom Menu Font Color"
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'typography',
                title: 'Font Size & Font Style',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.889rem' }}>Page Font Size</span>
                        <span className="ug-badge ug-badge-primary">{fontSizePx}px</span>
                      </div>
                      <input
                        type="range"
                        className="ug-slider"
                        min={10}
                        max={20}
                        step={0.5}
                        value={fontSizePx}
                        onChange={(e) => setFontSizePx(Number(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>10px</span>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {FONT_SIZE_PRESETS.map((p) => (
                            <Button
                              key={p.id}
                              variant={Math.abs(fontSizePx - p.px) < 0.25 ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => setFontSizePx(p.px)}
                            >
                              {p.label}
                            </Button>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>20px</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.889rem', marginBottom: 8 }}>Font Style (Family)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {FONT_FAMILY_OPTIONS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFontFamilyId(f.id)}
                            className={`ug-btn ug-btn-sm ${fontFamilyId === f.id ? 'ug-btn-primary' : 'ug-btn-secondary'}`}
                            style={{ fontFamily: f.css, justifyContent: 'flex-start' }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'card-scrollbar',
                title: 'Card Shadow Depth & Scrollbar Color',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.889rem' }}>Card Shadow Size & Depth</span>
                        <span className="ug-badge ug-badge-primary">
                          {CARD_SHADOW_LEVELS.find((s) => s.level === cardShadowLevel)?.label ?? 'Subtle'}
                        </span>
                      </div>
                      <input
                        type="range"
                        className="ug-slider"
                        min={0}
                        max={4}
                        step={1}
                        value={cardShadowLevel}
                        onChange={(e) => setCardShadowLevel(Number(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.778rem', color: 'var(--ug-muted)', marginTop: 4 }}>
                        {CARD_SHADOW_LEVELS.map((s) => (
                          <span key={s.level}>{s.label}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.889rem', marginBottom: 8 }}>Browser Scrollbar Color</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {SINGLE_COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => setScrollbarColor(c.hex)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: c.hex,
                              border: scrollbarColor === c.hex ? '3px solid #0f172a' : '2px solid #fff',
                              boxShadow: '0 0 0 1px var(--ug-border-strong)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={scrollbarColor}
                          onChange={(e) => setScrollbarColor(e.target.value)}
                          title="Custom Scrollbar Color"
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: 'theme-mode',
                title: 'Controls Theme Color (Single / Gradient)',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(
                        [
                          { id: 'uniglobal-light', label: 'UniGlobal Light' },
                          { id: 'single', label: 'Single Color' },
                          { id: 'gradient', label: 'Gradient' },
                        ] as { id: ThemeMode; label: string }[]
                      ).map((t) => (
                        <Button
                          key={t.id}
                          variant={themeMode === t.id ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setThemeMode(t.id)}
                        >
                          {t.label}
                        </Button>
                      ))}
                    </div>

                    {themeMode === 'single' && (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.852rem', marginBottom: 8 }}>Pick Single Brand Color</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {SINGLE_COLOR_PRESETS.map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              title={c.name}
                              onClick={() => setPrimaryColor(c.hex)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: c.hex,
                                border: primaryColor === c.hex ? '3px solid #0f172a' : '2px solid #fff',
                                boxShadow: '0 0 0 1px var(--ug-border-strong)',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            title="Custom Hex Color"
                          />
                        </div>
                      </div>
                    )}

                    {themeMode === 'gradient' && (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.852rem', marginBottom: 8 }}>Pick Gradient Preset</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {GRADIENT_PRESETS.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setGradientId(g.id)}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 8,
                                background: g.css,
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.926rem',
                                border: gradientId === g.id ? '2px solid #0f172a' : 'none',
                                cursor: 'pointer',
                                textAlign: 'start',
                              }}
                            >
                              {g.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: 'recent-menus-cache',
                title: isAr
                  ? `عدد القوائم الأخيرة المحفوظة (${recentMenusLimit})`
                  : `Recent Menus Cache Count (${recentMenusLimit} Menus)`,
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <History size={14} style={{ color: 'var(--ug-primary)' }} />
                        {isAr ? 'الحد الأقصى للنظام لكل مستخدم' : 'System-Wide Per-User Limit'}
                      </span>
                      <Badge variant="primary">{recentMenusLimit} {isAr ? 'قوائم' : 'Menus'}</Badge>
                    </div>

                    {userRole === 'SuperAdmin' ? (
                      <>
                        <input
                          type="range"
                          className="ug-slider"
                          min={1}
                          max={30}
                          step={1}
                          value={Math.min(30, recentMenusLimit)}
                          onChange={(e) => setRecentMenusLimit(Number(e.target.value))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {[5, 10, 15, 20, 25].map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                size="sm"
                                variant={recentMenusLimit === preset ? 'primary' : 'secondary'}
                                onClick={() => setRecentMenusLimit(preset)}
                              >
                                {preset}
                              </Button>
                            ))}
                          </div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--ug-muted)' }}>
                            Exact:
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={recentMenusLimit}
                              onChange={(e) => setRecentMenusLimit(Number(e.target.value))}
                              className="ug-input"
                              style={{ width: 64, padding: '3px 8px', minHeight: 28 }}
                            />
                          </label>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--ug-muted)' }}>
                          Fixed by <strong>SuperAdmin</strong>. Click <em>Save Corporate Settings to DB</em> below to enforce {recentMenusLimit} cached menus for every user.
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--ug-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={13} style={{ color: 'var(--ug-warning)', flexShrink: 0 }} />
                        <span>
                          Fixed at <strong>{recentMenusLimit} menus</strong> per user by <strong>SuperAdmin</strong>. Standard users cannot modify this system cache limit.
                        </span>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
          </div>

          {/* SuperAdmin Global DB Save & Reset Outside All Accordions */}
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--ug-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {userRole === 'SuperAdmin' && (
              <>
                <SwitchToggle
                  label="Lock Corporate Theme for All Users"
                  helpText="When enabled, all logged-in users inherit these exact Corporate Identity colors & styles from SQL Server."
                  checked={lockCorporateTheme}
                  onChange={setLockCorporateTheme}
                />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSavingToDb}
                  onClick={async () => {
                    const ok = await saveGlobalSettingsToDb(menuItems.map((m) => m.id));
                    if (ok) {
                      toast.success(
                        'Corporate Settings Saved to DB',
                        'All logged-in users will now receive this Corporate Identity theme automatically.'
                      );
                    } else {
                      toast.danger(
                        'API Not Reachable',
                        'Ensure the .NET 8 HRMS.API backend is running on port 5050.'
                      );
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {isSavingToDb ? 'Saving to SQL Server...' : 'Save Corporate Settings to DB (All Users)'}
                </Button>
                {lastSavedAtUtc && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)', textAlign: 'center' }}>
                    {dbConnected ? 'Synced with SQL Server' : 'Local Cache'} • Saved by <strong>{lastSavedBy}</strong> ({new Date(lastSavedAtUtc).toLocaleString()})
                  </div>
                )}
              </>
            )}

            {!isLockedForCurrentUser && (
              <Button variant="secondary" size="sm" onClick={resetAppearance} style={{ width: '100%' }}>
                Reset to UniGlobal Light Default
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
