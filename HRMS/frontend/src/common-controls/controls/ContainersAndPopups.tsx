import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button, HelpTag } from './HelpAndFeedback';

/* ---------------- Card ---------------- */
export interface CardProps {
  title?: string;
  subtitle?: string;
  helpText?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, helpText, extra, children }) => (
  <div className="ug-card">
    {(title || extra) && (
      <div className="ug-card-header">
        <div>
          <div className="ug-card-title">
            {title}
            {helpText && <HelpTag text={helpText} />}
          </div>
          {subtitle && <div style={{ fontSize: '0.889rem', color: 'var(--ug-muted)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {extra}
      </div>
    )}
    <div className="ug-card-body">{children}</div>
  </div>
);

/* ---------------- Accordion ---------------- */
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : allowMultiple
        ? [...prev, id]
        : [id]
    );
  };

  return (
    <div className="ug-accordion">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="ug-accordion-item">
            <button type="button" className="ug-accordion-trigger" onClick={() => toggle(item.id)}>
              <span>{item.title}</span>
              <ChevronDown
                size={16}
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.18s ease',
                }}
              />
            </button>
            {isOpen && <div className="ug-accordion-body">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- Tabs ---------------- */
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export const Tabs: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const current = items.find((t) => t.id === active) ?? items[0];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--ug-border)', marginBottom: 14, flexWrap: 'wrap' }}>
        {items.map((tab) => {
          const isAct = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              style={{
                padding: '8px 14px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isAct ? 'var(--ug-primary)' : 'transparent'}`,
                color: isAct ? 'var(--ug-primary)' : 'var(--ug-muted)',
                fontWeight: isAct ? 700 : 500,
                fontSize: '0.963rem',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>{current?.content}</div>
    </div>
  );
};

/* ---------------- Modal ---------------- */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  children,
}) => {
  if (!open) return null;
  const maxWidth = { sm: 400, md: 560, lg: 760, xl: 980 }[size];

  return (
    <div className="ug-backdrop" onClick={onClose}>
      <div className="ug-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="ug-card-header">
          <div className="ug-card-title">{title}</div>
          <button type="button" className="ug-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="ug-card-body" style={{ overflowY: 'auto' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--ug-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- Drawer ---------------- */
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="ug-drawer-backdrop" onClick={onClose}>
      <div className="ug-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ug-card-header">
          <div className="ug-card-title">{title}</div>
          <button type="button" className="ug-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="ug-card-body" style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ---------------- ConfirmPopup ---------------- */
export interface ConfirmPopupProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p style={{ margin: 0, color: 'var(--ug-text-secondary)' }}>{message}</p>
  </Modal>
);

/* ---------------- DropdownMenu (With Nested Sub-Menus) ---------------- */
export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  subItems?: DropdownMenuItem[];
}

export interface DropdownMenuProps {
  label: string;
  items: DropdownMenuItem[];
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  items,
  variant = 'secondary',
  size = 'sm',
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const [subOpensLeft, setSubOpensLeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredSub(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const panelWidth = 225;
      const spaceRightFromLeft = window.innerWidth - rect.left;
      const shouldAlignRight = spaceRightFromLeft < panelWidth + 16;
      setAlignRight(shouldAlignRight);

      // Calculate where the main panel's right edge will sit
      const panelRightEdge = shouldAlignRight ? rect.right : rect.left + panelWidth;
      const spaceForSubOnRight = window.innerWidth - panelRightEdge;
      setSubOpensLeft(spaceForSubOnRight < panelWidth + 16);
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="ug-nav-dropdown-wrap" style={{ display: 'inline-block' }}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleToggle}
      >
        {label}
        <ChevronDown size={14} />
      </Button>

      {open && (
        <div
          className="ug-nav-dropdown-panel"
          style={
            alignRight
              ? { insetInlineStart: 'auto', insetInlineEnd: 0, right: 0, left: 'auto' }
              : { insetInlineStart: 0, insetInlineEnd: 'auto', left: 0, right: 'auto' }
          }
        >
          {items.map((item) => {
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            return (
              <div
                key={item.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredSub(hasSub ? item.id : null)}
              >
                <button
                  type="button"
                  className="ug-nav-item"
                  style={{
                    color: item.danger ? 'var(--ug-danger)' : undefined,
                    justifyContent: 'space-between',
                  }}
                  onClick={() => {
                    if (!hasSub) {
                      item.onClick?.();
                      setOpen(false);
                    }
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {hasSub && subOpensLeft && <ChevronLeft size={14} />}
                    {item.icon}
                    {item.label}
                  </span>
                  {hasSub && !subOpensLeft && <ChevronRight size={14} />}
                </button>

                {hasSub && hoveredSub === item.id && (
                  <div
                    className="ug-nav-dropdown-panel"
                    style={
                      subOpensLeft
                        ? { top: 0, left: 'auto', right: 'calc(100% + 4px)', insetInlineStart: 'auto', insetInlineEnd: 'calc(100% + 4px)' }
                        : { top: 0, right: 'auto', left: 'calc(100% + 4px)', insetInlineEnd: 'auto', insetInlineStart: 'calc(100% + 4px)' }
                    }
                  >
                    {item.subItems!.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className="ug-nav-item"
                        onClick={() => {
                          sub.onClick?.();
                          setOpen(false);
                          setHoveredSub(null);
                        }}
                      >
                        {sub.icon}
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
