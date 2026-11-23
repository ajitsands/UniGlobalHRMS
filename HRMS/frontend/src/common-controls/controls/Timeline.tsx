import React, { useMemo, useState } from 'react';
import { Badge, Button, HelpTag } from './HelpAndFeedback';

export type TimelineTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: string;
  description?: string;
  actor?: string;
  tone?: TimelineTone;
  icon?: React.ReactNode;
  tags?: string[];
}

export interface TimelineProps {
  title?: string;
  helpText?: string;
  events: TimelineEvent[];
  defaultOrientation?: 'vertical' | 'horizontal';
  showFilter?: boolean;
  showOrientationToggle?: boolean;
}

const TONE_COLOR: Record<TimelineTone, string> = {
  primary: 'var(--ug-primary)',
  success: 'var(--ug-success)',
  warning: 'var(--ug-warning)',
  danger: 'var(--ug-danger)',
  info: 'var(--ug-info)',
};

export const Timeline: React.FC<TimelineProps> = ({
  title = 'Activity & History Timeline',
  helpText = 'Chronological record of milestones, approvals, and document events.',
  events,
  defaultOrientation = 'vertical',
  showFilter = true,
  showOrientationToggle = true,
}) => {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>(defaultOrientation);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(events.map((e) => e.category)))],
    [events]
  );

  const filtered = useMemo(
    () =>
      selectedCategory === 'All'
        ? events
        : events.filter((e) => e.category === selectedCategory),
    [events, selectedCategory]
  );

  return (
    <div className="ug-card">
      <div className="ug-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="ug-card-title">
          {title}
          {helpText && <HelpTag text={helpText} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {showFilter && categories.length > 2 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {showOrientationToggle && (
            <div
              style={{
                display: 'inline-flex',
                gap: 3,
                padding: 3,
                borderRadius: 8,
                background: 'var(--ug-surface-alt)',
                border: '1px solid var(--ug-border)',
              }}
            >
              <Button
                variant={orientation === 'vertical' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setOrientation('vertical')}
              >
                Vertical
              </Button>
              <Button
                variant={orientation === 'horizontal' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setOrientation('horizontal')}
              >
                Horizontal
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="ug-card-body">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--ug-muted)' }}>
            No timeline events found.
          </div>
        ) : orientation === 'vertical' ? (
          <div className="ug-timeline-vertical">
            {filtered.map((ev) => {
              const tone = ev.tone ?? 'primary';
              const color = TONE_COLOR[tone];
              return (
                <div key={ev.id} className="ug-timeline-item">
                  <div className="ug-timeline-node" style={{ background: color }}>
                    {ev.icon ?? <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div className="ug-timeline-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--ug-text)' }}>
                          {ev.title}
                        </div>
                        {ev.actor && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--ug-muted)', marginTop: 1 }}>
                            By {ev.actor}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Badge variant={tone}>{ev.category}</Badge>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ug-muted)' }}>
                          {ev.date}
                        </span>
                      </div>
                    </div>
                    {ev.description && (
                      <p style={{ margin: '7px 0 0', fontSize: '0.88rem', color: 'var(--ug-text-secondary)' }}>
                        {ev.description}
                      </p>
                    )}
                    {ev.tags && ev.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {ev.tags.map((t) => (
                          <span key={t} className="ug-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ug-timeline-horizontal">
            {filtered.map((ev) => {
              const tone = ev.tone ?? 'primary';
              const color = TONE_COLOR[tone];
              return (
                <div key={ev.id} className="ug-timeline-h-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div className="ug-timeline-node-inline" style={{ background: color }}>
                      {ev.icon ?? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div style={{ flex: 1, height: 2, background: 'var(--ug-border)' }} />
                  </div>
                  <div className="ug-timeline-card" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Badge variant={tone}>{ev.category}</Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ug-muted)' }}>
                        {ev.date}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ug-text)' }}>
                      {ev.title}
                    </div>
                    {ev.description && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: 'var(--ug-text-secondary)' }}>
                        {ev.description}
                      </p>
                    )}
                    {ev.tags && ev.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {ev.tags.map((t) => (
                          <span key={t} className="ug-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
