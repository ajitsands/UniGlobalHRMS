import React, { useRef, useState } from 'react';
import { HelpCircle, Info, CheckCircle2, AlertTriangle, XCircle, X, BookOpen } from 'lucide-react';

/* ---------------- Button ---------------- */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-ghost' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) => {
  const sizeClass = size === 'sm' ? 'ug-btn-sm' : size === 'lg' ? 'ug-btn-lg' : '';
  return (
    <button className={`ug-btn ug-btn-${variant} ${sizeClass} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
};

/* ---------------- Badge ---------------- */
export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children }) => (
  <span className={`ug-badge ug-badge-${variant}`}>{children}</span>
);

/* ---------------- Alert ---------------- */
export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
}) => {
  const palette = {
    info: { bg: 'var(--ug-info-bg)', color: 'var(--ug-info)', icon: <Info size={16} /> },
    success: { bg: 'var(--ug-success-bg)', color: 'var(--ug-success)', icon: <CheckCircle2 size={16} /> },
    warning: { bg: 'var(--ug-warning-bg)', color: 'var(--ug-warning)', icon: <AlertTriangle size={16} /> },
    danger: { bg: 'var(--ug-danger-bg)', color: 'var(--ug-danger)', icon: <XCircle size={16} /> },
  }[variant];

  return (
    <div
      style={{
        background: palette.bg,
        borderInlineStart: `4px solid ${palette.color}`,
        borderRadius: 'var(--ug-radius-sm)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <span style={{ color: palette.color, marginTop: 2 }}>{palette.icon}</span>
        <div>
          {title && <div style={{ fontWeight: 700, fontSize: '0.963rem', marginBottom: 2 }}>{title}</div>}
          <div style={{ fontSize: '0.926rem', color: 'var(--ug-text-secondary)' }}>{children}</div>
        </div>
      </div>
      {onClose && (
        <button className="ug-icon-btn" onClick={onClose} aria-label="Close alert" style={{ width: 24, height: 24 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};

/* ---------------- Tooltip ---------------- */
export type TooltipTheme = 'dark' | 'gray' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  theme?: TooltipTheme;
  placement?: TooltipPlacement;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  theme = 'dark',
  placement = 'top',
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [edgeAlign, setEdgeAlign] = useState<'center' | 'left' | 'right'>('center');
  const wrapRef = useRef<HTMLSpanElement>(null);

  const showWithEdgeCheck = () => {
    if (wrapRef.current && (placement === 'top' || placement === 'bottom')) {
      const rect = wrapRef.current.getBoundingClientRect();
      if (window.innerWidth - rect.right < 140) {
        setEdgeAlign('right');
      } else if (rect.left < 140) {
        setEdgeAlign('left');
      } else {
        setEdgeAlign('center');
      }
    } else {
      setEdgeAlign('center');
    }
    setVisible(true);
  };

  const edgeStyle: React.CSSProperties | undefined =
    edgeAlign === 'right'
      ? { left: 'auto', right: 0, transform: 'none' }
      : edgeAlign === 'left'
      ? { left: 0, right: 'auto', transform: 'none' }
      : undefined;

  return (
    <span
      ref={wrapRef}
      className="ug-tooltip-wrap"
      onMouseEnter={showWithEdgeCheck}
      onMouseLeave={() => setVisible(false)}
      onFocus={showWithEdgeCheck}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`ug-tooltip-box ug-tooltip-${theme} pos-${placement}`} style={edgeStyle}>
          {content}
        </span>
      )}
    </span>
  );
};

/* ---------------- HelpTag (Inline "?" Badge) ---------------- */
export interface HelpTagProps {
  text: string;
  title?: string;
  theme?: TooltipTheme;
}

export const HelpTag: React.FC<HelpTagProps> = ({ text, title, theme = 'primary' }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="ug-tooltip-wrap">
      <button
        type="button"
        className="ug-help-btn"
        aria-label={title ?? 'Help'}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        ?
      </button>
      {open && (
        <span className={`ug-tooltip-box ug-tooltip-${theme}`} style={{ textAlign: 'start' }}>
          {title && <strong style={{ display: 'block', marginBottom: 2 }}>{title}</strong>}
          {text}
        </span>
      )}
    </span>
  );
};

/* ---------------- HelpPopup (Rich Contextual Step-by-Step Guide) ---------------- */
export interface HelpPopupProps {
  title: string;
  summary: string;
  steps: string[];
  manualSection?: string;
  onOpenManual?: () => void;
}

export const HelpPopup: React.FC<HelpPopupProps> = ({
  title,
  summary,
  steps,
  manualSection,
  onOpenManual,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<HelpCircle size={15} />}
        onClick={() => setOpen(true)}
      >
        <span className="ug-hide-mobile">Help</span>
      </Button>

      {open && (
        <div className="ug-backdrop" onClick={() => setOpen(false)}>
          <div className="ug-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="ug-card-header">
              <div className="ug-card-title">
                <HelpCircle size={18} style={{ color: 'var(--ug-primary)' }} />
                {title}
              </div>
              <button className="ug-icon-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="ug-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, color: 'var(--ug-text-secondary)' }}>{summary}</p>
              <div style={{ background: 'var(--ug-surface-alt)', padding: 12, borderRadius: 8, border: '1px solid var(--ug-border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.926rem', marginBottom: 6 }}>Quick Steps:</div>
                <ol style={{ margin: 0, paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {steps.map((s, idx) => (
                    <li key={idx} style={{ fontSize: '0.926rem', color: 'var(--ug-text-secondary)' }}>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {manualSection && (
                <div style={{ fontSize: '0.889rem', color: 'var(--ug-muted)' }}>
                  User Manual Reference: <strong>{manualSection}</strong>
                </div>
              )}
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--ug-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              {onOpenManual && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BookOpen size={14} />}
                  onClick={() => {
                    setOpen(false);
                    onOpenManual();
                  }}
                >
                  Open User Manual
                </Button>
              )}
              <Button size="sm" onClick={() => setOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
