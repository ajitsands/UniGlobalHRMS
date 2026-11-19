import React, { useState } from 'react';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Table as TableIcon } from 'lucide-react';
import { HelpTag } from './HelpAndFeedback';

export type ChartViewType = 'bar' | 'line' | 'pie' | 'table';

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardWidgetProps {
  title: string;
  helpText?: string;
  data: ChartDatum[];
  defaultView?: ChartViewType;
  unit?: string;
}

const PALETTE = ['#1B365D', '#B31B34', '#059669', '#d97706', '#1d4ed8', '#6366f1'];

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  helpText,
  data,
  defaultView = 'bar',
  unit = '',
}) => {
  const [view, setView] = useState<ChartViewType>(defaultView);
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const total = Math.max(1, data.reduce((sum, d) => sum + d.value, 0));

  return (
    <div className="ug-card">
      <div className="ug-card-header">
        <div className="ug-card-title">
          {title}
          {helpText && <HelpTag text={helpText} />}
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: 'var(--ug-surface-alt)', padding: 3, borderRadius: 8, border: '1px solid var(--ug-border)' }}>
          {(
            [
              { id: 'bar', icon: <BarChart3 size={14} />, label: 'Bar' },
              { id: 'line', icon: <LineIcon size={14} />, label: 'Line' },
              { id: 'pie', icon: <PieIcon size={14} />, label: 'Pie' },
              { id: 'table', icon: <TableIcon size={14} />, label: 'Table' },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              type="button"
              title={`Switch to ${btn.label} view`}
              onClick={() => setView(btn.id)}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.852rem',
                fontWeight: 600,
                background: view === btn.id ? 'var(--ug-active-bg)' : 'transparent',
                color: view === btn.id ? '#ffffff' : 'var(--ug-text-secondary)',
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ug-card-body">
        {view === 'bar' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, paddingTop: 18 }}>
            {data.map((d, idx) => {
              const pct = Math.round((d.value / maxVal) * 100);
              return (
                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.852rem', fontWeight: 700, color: 'var(--ug-text)' }}>
                    {d.value}{unit}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${Math.max(8, pct * 0.72)}%`,
                      borderRadius: '6px 6px 2px 2px',
                      background: d.color ?? PALETTE[idx % PALETTE.length],
                      transition: 'height 0.25s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.815rem', color: 'var(--ug-muted)', textAlign: 'center' }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {view === 'line' && (
          <svg viewBox="0 0 420 170" style={{ width: '100%', height: 180 }}>
            <polyline
              fill="none"
              stroke="var(--ug-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data
                .map((d, i) => {
                  const x = 35 + (i * 350) / Math.max(1, data.length - 1);
                  const y = 135 - (d.value / maxVal) * 105;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {data.map((d, i) => {
              const x = 35 + (i * 350) / Math.max(1, data.length - 1);
              const y = 135 - (d.value / maxVal) * 105;
              return (
                <g key={d.label}>
                  <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="var(--ug-primary)" strokeWidth="2.5" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--ug-text)">
                    {d.value}{unit}
                  </text>
                  <text x={x} y={158} textAnchor="middle" fontSize="10.5" fill="var(--ug-muted)">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {view === 'pie' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 132,
                height: 132,
                borderRadius: '50%',
                background: (() => {
                  let acc = 0;
                  const stops = data.map((d, idx) => {
                    const start = (acc / total) * 100;
                    acc += d.value;
                    const end = (acc / total) * 100;
                    return `${d.color ?? PALETTE[idx % PALETTE.length]} ${start}% ${end}%`;
                  });
                  return `conic-gradient(${stops.join(', ')})`;
                })(),
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 26,
                  borderRadius: '50%',
                  background: 'var(--ug-surface)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.889rem',
                  fontWeight: 700,
                }}
              >
                {total}{unit}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 190px', minWidth: 190 }}>
              {data.map((d, idx) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.926rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color ?? PALETTE[idx % PALETTE.length] }} />
                    {d.label}
                  </span>
                  <strong>
                    {d.value}{unit} ({Math.round((d.value / total) * 100)}%)
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'table' && (
          <div className="ug-table-wrap">
            <table className="ug-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.label}>
                    <td>{d.label}</td>
                    <td><strong>{d.value}{unit}</strong></td>
                    <td>{Math.round((d.value / total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
