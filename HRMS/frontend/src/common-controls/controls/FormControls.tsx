import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatAppCurrencyParts } from '../tokens/regionalSettings';
import { FONT_SIZE_PRESETS, useTheme } from '../tokens/ThemeContext';
import { HelpTag } from './HelpAndFeedback';

/* ---------------- TextInput ---------------- */
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helpText,
  error,
  hint,
  icon,
  required,
  type = 'text',
  className = '',
  ...rest
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPwd ? 'text' : 'password') : type;

  return (
    <div className="ug-field">
      {label && (
        <div className="ug-label-row">
          <label className="ug-label">
            {label}
            {required && <span className="ug-required">*</span>}
            {helpText && <HelpTag text={helpText} />}
          </label>
        </div>
      )}
      <div className="ug-input-wrap">
        {icon && <span className="ug-input-icon-start">{icon}</span>}
        <input
          type={effectiveType}
          className={`ug-input ${icon ? 'ug-input-prefix' : ''} ${error ? 'has-error' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="ug-input-icon-end"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowPwd((s) => !s)}
            aria-label="Toggle password visibility"
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span className="ug-error-text">{error}</span>}
      {!error && hint && <span className="ug-hint-text">{hint}</span>}
    </div>
  );
};

/* ---------------- NumberInput (Supports Gulf Currency & Automatic Precision) ---------------- */
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helpText?: string;
  error?: string;
  currency?: string; // Pass 'AUTO' to bind automatically to Application Settings currency
  useGlobalCurrency?: boolean;
  required?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  helpText,
  error,
  currency,
  useGlobalCurrency = false,
  required,
  step,
  ...rest
}) => {
  const { currencyMeta, showCurrencyCode } = useTheme();
  const rawCurrency = useGlobalCurrency || currency === 'AUTO' ? currencyMeta.code : currency;
  const activeCurrency = rawCurrency && showCurrencyCode ? rawCurrency : undefined;
  const effectiveStep =
    step ??
    (rawCurrency
      ? ['BHD', 'KWD', 'OMR'].includes(rawCurrency.toUpperCase())
        ? '0.001'
        : '0.01'
      : '0.001');

  return (
    <div className="ug-field">
      {label && (
        <label className="ug-label">
          {label}
          {required && <span className="ug-required">*</span>}
          {helpText && <HelpTag text={helpText} />}
        </label>
      )}
      <div className="ug-input-wrap">
        {activeCurrency && (
          <span
            className="ug-input-icon-start"
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.35px',
              color: 'var(--ug-primary)',
              opacity: 0.85,
            }}
          >
            {activeCurrency}
          </span>
        )}
        <input
          type="number"
          step={effectiveStep}
          className={`ug-input ${activeCurrency ? 'ug-input-prefix' : ''} ${error ? 'has-error' : ''}`}
          style={activeCurrency ? { paddingInlineStart: 44, fontVariantNumeric: 'tabular-nums' } : { fontVariantNumeric: 'tabular-nums' }}
          {...rest}
        />
      </div>
      {error && <span className="ug-error-text">{error}</span>}
    </div>
  );
};

/* ---------------- CurrencyAmount (Smaller Currency Code + Global/Totals Visibility) ---------------- */
export interface CurrencyAmountProps {
  amount: number;
  convertFromBhd?: boolean;
  isTotal?: boolean;
  bold?: boolean;
}

export const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  convertFromBhd = false,
  isTotal = false,
  bold = true,
}) => {
  const { currencyCode, showCurrencyCode, showCurrencyOnTotals } = useTheme();
  const { code, digits } = formatAppCurrencyParts(amount, currencyCode, convertFromBhd);
  const displayCode = isTotal ? showCurrencyOnTotals : showCurrencyCode;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: bold ? 700 : 500,
      }}
    >
      {displayCode && (
        <span
          style={{
            fontSize: '0.72em',
            fontWeight: 600,
            letterSpacing: '0.35px',
            color: 'var(--ug-text-secondary)',
            opacity: 0.88,
          }}
        >
          {code}
        </span>
      )}
      <span>{digits}</span>
    </span>
  );
};

/* ---------------- TextArea ---------------- */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  helpText,
  error,
  required,
  rows = 3,
  ...rest
}) => (
  <div className="ug-field">
    {label && (
      <label className="ug-label">
        {label}
        {required && <span className="ug-required">*</span>}
        {helpText && <HelpTag text={helpText} />}
      </label>
    )}
    <textarea rows={rows} className={`ug-textarea ${error ? 'has-error' : ''}`} {...rest} />
    {error && <span className="ug-error-text">{error}</span>}
  </div>
);

/* ---------------- RadioGroup ---------------- */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (val: string) => void;
  direction?: 'row' | 'column';
  helpText?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  direction = 'row',
  helpText,
}) => (
  <div className="ug-field">
    {label && (
      <label className="ug-label">
        {label}
        {helpText && <HelpTag text={helpText} />}
      </label>
    )}
    <div style={{ display: 'flex', flexDirection: direction, flexWrap: 'wrap', gap: 12 }}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 'var(--ug-radius-sm)',
              border: `1px solid ${checked ? 'var(--ug-primary)' : 'var(--ug-border-strong)'}`,
              background: checked ? 'var(--ug-primary-soft)' : 'var(--ug-surface)',
              cursor: 'pointer',
              fontSize: '0.963rem',
              fontWeight: checked ? 600 : 500,
            }}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: 'var(--ug-primary)' }}
            />
            <span>
              {opt.label}
              {opt.description && (
                <span style={{ display: 'block', fontSize: '0.815rem', color: 'var(--ug-muted)', fontWeight: 400 }}>
                  {opt.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

/* ---------------- Checkbox ---------------- */
export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.963rem',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      style={{ width: 16, height: 16, accentColor: 'var(--ug-primary)' }}
    />
    <span>{label}</span>
  </label>
);

/* ---------------- SwitchToggle ---------------- */
export interface SwitchToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

export const SwitchToggle: React.FC<SwitchToggleProps> = ({
  label,
  checked,
  onChange,
  helpText,
}) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`ug-switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="ug-switch-thumb" />
    </button>
    {label && (
      <span className="ug-label" style={{ fontWeight: 500 }}>
        {label}
        {helpText && <HelpTag text={helpText} />}
      </span>
    )}
  </div>
);

/* ---------------- RangeSlider (Single Value Slider) ---------------- */
export interface RangeSliderProps {
  label?: string;
  helpText?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  helpText,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
}) => (
  <div className="ug-field">
    {label && (
      <div className="ug-label-row">
        <label className="ug-label">
          {label}
          {helpText && <HelpTag text={helpText} />}
        </label>
        <span className="ug-badge ug-badge-primary">
          {value}
          {unit}
        </span>
      </div>
    )}
    <input
      type="range"
      className="ug-slider"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.815rem', color: 'var(--ug-muted)' }}>
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

/* ---------------- DualRangeSlider (Min - Max Range) ---------------- */
export interface DualRangeSliderProps {
  label?: string;
  helpText?: string;
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (minVal: number, maxVal: number) => void;
  unit?: string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  label,
  helpText,
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  unit = '',
}) => (
  <div className="ug-field">
    {label && (
      <div className="ug-label-row">
        <label className="ug-label">
          {label}
          {helpText && <HelpTag text={helpText} />}
        </label>
        <span className="ug-badge ug-badge-primary">
          {minValue}{unit} – {maxValue}{unit}
        </span>
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <div style={{ fontSize: '0.815rem', color: 'var(--ug-muted)', marginBottom: 3 }}>Min</div>
        <input
          type="range"
          className="ug-slider"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => onChange(Math.min(Number(e.target.value), maxValue), maxValue)}
        />
      </div>
      <div>
        <div style={{ fontSize: '0.815rem', color: 'var(--ug-muted)', marginBottom: 3 }}>Max</div>
        <input
          type="range"
          className="ug-slider"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => onChange(minValue, Math.max(Number(e.target.value), minValue))}
        />
      </div>
    </div>
  </div>
);

/* ---------------- FontSizeControl (Global Typography Slider + Presets) ---------------- */
export const FontSizeControl: React.FC<{ label?: string; helpText?: string }> = ({
  label = 'Application Font Size',
  helpText = 'Scales typography across the entire page. Use slider to increase or reduce smoothly.',
}) => {
  const { fontSizePx, setFontSizePx } = useTheme();

  return (
    <div className="ug-field">
      <div className="ug-label-row">
        <label className="ug-label">
          {label}
          {helpText && <HelpTag text={helpText} />}
        </label>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>10px</span>
        <div style={{ display: 'flex', gap: 5 }}>
          {FONT_SIZE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFontSizePx(p.px)}
              className={`ug-btn ug-btn-sm ${Math.abs(fontSizePx - p.px) < 0.25 ? 'ug-btn-primary' : 'ug-btn-secondary'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>20px</span>
      </div>
    </div>
  );
};
