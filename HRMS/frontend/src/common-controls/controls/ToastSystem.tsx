import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs: number;
}

interface ToastContextValue {
  show: (variant: ToastVariant, title: string, message?: string, durationMs?: number) => void;
  success: (title: string, message?: string, durationMs?: number) => void;
  danger: (title: string, message?: string, durationMs?: number) => void;
  warning: (title: string, message?: string, durationMs?: number) => void;
  info: (title: string, message?: string, durationMs?: number) => void;
  position: ToastPosition;
  setPosition: (pos: ToastPosition) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { accent: string; bg: string; icon: React.ReactNode }
> = {
  success: {
    accent: 'var(--ug-success)',
    bg: 'var(--ug-success-bg)',
    icon: <CheckCircle2 size={18} />,
  },
  danger: {
    accent: 'var(--ug-danger)',
    bg: 'var(--ug-danger-bg)',
    icon: <XCircle size={18} />,
  },
  warning: {
    accent: 'var(--ug-warning)',
    bg: 'var(--ug-warning-bg)',
    icon: <AlertTriangle size={18} />,
  },
  info: {
    accent: 'var(--ug-info)',
    bg: 'var(--ug-info-bg)',
    icon: <Info size={18} />,
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [position, setPosition] = useState<ToastPosition>('top-right');

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, title: string, message?: string, durationMs = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, variant, title, message, durationMs }]);
      if (durationMs > 0) {
        setTimeout(() => remove(id), durationMs);
      }
    },
    [remove]
  );

  const posStyle: React.CSSProperties = {
    'top-right': { top: 74, right: 20 },
    'top-left': { top: 74, left: 20 },
    'bottom-right': { bottom: 48, right: 20 },
    'bottom-left': { bottom: 48, left: 20 },
    'top-center': { top: 74, left: '50%', transform: 'translateX(-50%)' },
  }[position];

  return (
    <ToastContext.Provider
      value={{
        show,
        success: (t, m, d) => show('success', t, m, d),
        danger: (t, m, d) => show('danger', t, m, d),
        warning: (t, m, d) => show('warning', t, m, d),
        info: (t, m, d) => show('info', t, m, d),
        position,
        setPosition,
      }}
    >
      {children}

      <div className="ug-toast-stack" style={posStyle} aria-live="polite">
        {toasts.map((toast) => {
          const meta = VARIANT_META[toast.variant];
          return (
            <div
              key={toast.id}
              className="ug-toast"
              style={{ borderInlineStart: `4px solid ${meta.accent}` }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: meta.bg,
                  color: meta.accent,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {meta.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.963rem', color: 'var(--ug-text)' }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ fontSize: '0.889rem', color: 'var(--ug-text-secondary)', marginTop: 2 }}>
                    {toast.message}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="ug-icon-btn"
                style={{ width: 26, height: 26 }}
                onClick={() => remove(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>

              {toast.durationMs > 0 && (
                <div
                  className="ug-toast-progress"
                  style={{
                    background: meta.accent,
                    animationDuration: `${toast.durationMs}ms`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
