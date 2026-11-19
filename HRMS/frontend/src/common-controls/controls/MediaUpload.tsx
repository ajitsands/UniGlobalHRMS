import React, { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { HelpTag } from './HelpAndFeedback';

/* ---------------- ImageUpload (Employee Photo / ID Card / Receipt) ---------------- */
export interface ImageUploadProps {
  label?: string;
  helpText?: string;
  maxSizeMb?: number;
  value?: string | null; // Data URL or URL
  onChange: (dataUrl: string | null, file?: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Image',
  helpText,
  maxSizeMb = 5,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPG, WEBP) are allowed.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMb} MB.`);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result), file);
    reader.readAsDataURL(file);
  };

  return (
    <div className="ug-field">
      <label className="ug-label">
        {label}
        {helpText && <HelpTag text={helpText} />}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 10,
            border: '1px solid var(--ug-border)',
            borderRadius: 'var(--ug-radius-sm)',
            background: 'var(--ug-surface-alt)',
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--ug-border)' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.926rem', fontWeight: 600 }}>Image ready</div>
            <button
              type="button"
              className="ug-btn ug-btn-secondary ug-btn-sm"
              style={{ marginTop: 6 }}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
          </div>
          <button
            type="button"
            className="ug-icon-btn ug-icon-btn-danger"
            onClick={() => onChange(null)}
            title="Remove image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          style={{
            border: '1.5px dashed var(--ug-border-strong)',
            borderRadius: 'var(--ug-radius-sm)',
            padding: '18px 14px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--ug-surface-alt)',
          }}
        >
          <ImageIcon size={24} style={{ color: 'var(--ug-primary)', marginBottom: 6 }} />
          <div style={{ fontSize: '0.926rem', fontWeight: 600 }}>Click or drag & drop image</div>
          <div style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>PNG, JPG, WEBP up to {maxSizeMb} MB</div>
        </div>
      )}

      {error && <span className="ug-error-text">{error}</span>}
    </div>
  );
};

/* ---------------- FileUpload (Passports, Visas, Medical Certificates) ---------------- */
export interface FileUploadProps {
  label?: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Documents',
  helpText,
  accept = '.pdf,.doc,.docx,.xlsx,.png,.jpg',
  multiple = true,
  files,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    onChange(multiple ? [...files, ...arr] : arr.slice(0, 1));
  };

  return (
    <div className="ug-field">
      <label className="ug-label">
        {label}
        {helpText && <HelpTag text={helpText} />}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => addFiles(e.target.files)}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        style={{
          border: '1.5px dashed var(--ug-border-strong)',
          borderRadius: 'var(--ug-radius-sm)',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          background: 'var(--ug-surface-alt)',
        }}
      >
        <UploadCloud size={22} style={{ color: 'var(--ug-primary)' }} />
        <div>
          <div style={{ fontSize: '0.926rem', fontWeight: 600 }}>Attach files (drag & drop or browse)</div>
          <div style={{ fontSize: '0.815rem', color: 'var(--ug-muted)' }}>Accepted: {accept}</div>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {files.map((f, idx) => (
            <div
              key={`${f.name}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                border: '1px solid var(--ug-border)',
                borderRadius: 6,
                fontSize: '0.926rem',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <FileText size={14} style={{ color: 'var(--ug-primary)' }} />
                {f.name}
                <span style={{ color: 'var(--ug-muted)', fontSize: '0.815rem' }}>
                  ({(f.size / 1024).toFixed(1)} KB)
                </span>
              </span>
              <button
                type="button"
                className="ug-icon-btn ug-icon-btn-danger"
                style={{ width: 24, height: 24 }}
                onClick={() => onChange(files.filter((_, i) => i !== idx))}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
