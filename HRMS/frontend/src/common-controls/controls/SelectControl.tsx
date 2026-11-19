import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { HelpTag } from './HelpAndFeedback';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectControlProps {
  label?: string;
  helpText?: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const SelectControl: React.FC<SelectControlProps> = ({
  label,
  helpText,
  options,
  value,
  onChange,
  multiple = false,
  searchable = true,
  clearable = true,
  placeholder = 'Select an option...',
  required,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.group && o.group.toLowerCase().includes(q))
    );
  }, [options, query]);

  const handleSelect = (optValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onChange(next);
    } else {
      onChange(optValue);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const selectedLabels = options.filter((o) => selectedValues.includes(o.value));

  return (
    <div className="ug-field" ref={containerRef}>
      {label && (
        <label className="ug-label">
          {label}
          {required && <span className="ug-required">*</span>}
          {helpText && <HelpTag text={helpText} />}
        </label>
      )}

      <div className="ug-select-box">
        <div
          className={`ug-select-trigger ${open ? 'is-open' : ''}`}
          style={error ? { borderColor: 'var(--ug-danger)' } : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <div className="ug-select-chips">
            {selectedLabels.length === 0 && (
              <span style={{ color: 'var(--ug-muted)', fontSize: '0.963rem' }}>{placeholder}</span>
            )}
            {multiple &&
              selectedLabels.map((item) => (
                <span key={item.value} className="ug-chip">
                  {item.label}
                  <X
                    size={12}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item.value);
                    }}
                  />
                </span>
              ))}
            {!multiple && selectedLabels[0] && (
              <span style={{ fontSize: '0.963rem', fontWeight: 500 }}>{selectedLabels[0].label}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ug-muted)' }}>
            {clearable && selectedValues.length > 0 && (
              <X size={14} onClick={handleClear} style={{ cursor: 'pointer' }} />
            )}
            <ChevronDown size={15} />
          </div>
        </div>

        {open && (
          <div className="ug-dropdown-panel">
            {searchable && (
              <div className="ug-dropdown-search">
                <div className="ug-input-wrap">
                  <span className="ug-input-icon-start">
                    <Search size={14} />
                  </span>
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="ug-input ug-input-prefix"
                    style={{ paddingTop: 6, paddingBottom: 6 }}
                  />
                </div>
              </div>
            )}

            <div className="ug-dropdown-list">
              {filtered.length === 0 ? (
                <div style={{ padding: 12, textAlign: 'center', color: 'var(--ug-muted)', fontSize: '0.926rem' }}>
                  No matching records
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSel = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      className={`ug-dropdown-item ${isSel ? 'is-selected' : ''}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <span>
                        {opt.label}
                        {opt.group && (
                          <span style={{ marginInlineStart: 6, fontSize: '0.815rem', color: 'var(--ug-muted)' }}>
                            ({opt.group})
                          </span>
                        )}
                      </span>
                      {isSel && <Check size={14} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="ug-error-text">{error}</span>}
    </div>
  );
};
