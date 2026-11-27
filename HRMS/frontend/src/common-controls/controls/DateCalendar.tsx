import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../tokens/ThemeContext';
import { HelpTag } from './HelpAndFeedback';

export interface DateCalendarProps {
  label?: string;
  helpText?: string;
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
  endDate?: string; // optional for range mode
  onEndDateChange?: (isoDate: string) => void;
  rangeMode?: boolean;
  highlightedDates?: Record<string, string>; // e.g. { '2026-11-18': 'Holiday' }
  required?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DateCalendar: React.FC<DateCalendarProps> = ({
  label,
  helpText,
  value,
  onChange,
  endDate = '',
  onEndDateChange,
  rangeMode = false,
  highlightedDates = {},
  required,
}) => {
  const { formatDate, todayIso } = useTheme();
  const [open, setOpen] = useState(false);
  const baseDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDayClick = (iso: string) => {
    if (!rangeMode || !onEndDateChange) {
      onChange(iso);
      setOpen(false);
      return;
    }
    if (!value || (value && endDate)) {
      onChange(iso);
      onEndDateChange('');
    } else if (iso < value) {
      onEndDateChange(value);
      onChange(iso);
    } else {
      onEndDateChange(iso);
      setOpen(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const displayValue = rangeMode
    ? value && endDate
      ? `${formatDate(value)} → ${formatDate(endDate)}`
      : value
      ? formatDate(value)
      : 'Select date range...'
    : value
    ? formatDate(value)
    : 'Select date...';

  return (
    <div className="ug-field" ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className="ug-label">
          {label}
          {required && <span className="ug-required">*</span>}
          {helpText && <HelpTag text={helpText} />}
        </label>
      )}

      <div
        className={`ug-select-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={15} style={{ color: 'var(--ug-primary)' }} />
          <span style={{ color: value ? 'var(--ug-text)' : 'var(--ug-muted)', fontSize: '0.963rem' }}>
            {displayValue}
          </span>
        </div>
        {value && (
          <X
            size={14}
            style={{ color: 'var(--ug-muted)', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              onEndDateChange?.('');
            }}
          />
        )}
      </div>

      {open && (
        <div
          className="ug-dropdown-panel"
          style={{ width: 296, padding: 12, insetInlineEnd: 'auto' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" className="ug-icon-btn" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <strong style={{ fontSize: '1.0rem' }}>
              {MONTHS[viewMonth]} {viewYear}
            </strong>
            <button type="button" className="ug-icon-btn" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ fontSize: '0.815rem', fontWeight: 700, color: 'var(--ug-muted)', padding: '4px 0' }}>
                {d}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = iso === value || iso === endDate;
              const inRange = rangeMode && value && endDate && iso > value && iso < endDate;
              const special = highlightedDates[iso];

              return (
                <button
                  key={iso}
                  type="button"
                  title={special}
                  onClick={() => handleDayClick(iso)}
                  style={{
                    height: 32,
                    borderRadius: 6,
                    border: special ? '1px dashed var(--ug-amber)' : '1px solid transparent',
                    background: isSelected
                      ? 'var(--ug-active-bg)'
                      : inRange
                      ? 'var(--ug-primary-soft)'
                      : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--ug-text)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.926rem',
                    cursor: 'pointer',
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--ug-border)' }}>
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              onClick={() => {
                const today = todayIso();
                onChange(today);
                if (!rangeMode) setOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
