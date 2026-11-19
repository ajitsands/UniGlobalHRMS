import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge, Button, HelpTag } from './HelpAndFeedback';
import { Modal } from './ContainersAndPopups';
import { SwitchToggle, TextArea, TextInput } from './FormControls';
import { SelectControl } from './SelectControl';

export type ScheduleViewMode = 'day' | 'week' | 'month' | 'stakeholders' | 'agenda';

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface ScheduleAppointment {
  id: string;
  title: string;
  stakeholderId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 8..18
  durationHours: number; // 1..4
  allDay?: boolean;
  category?: 'Interview' | 'Payroll' | 'Review' | 'Training' | 'Meeting';
  notes?: string;
}

export interface ScheduleCalendarProps {
  title?: string;
  stakeholders: Stakeholder[];
  appointments: ScheduleAppointment[];
  onChange: (next: ScheduleAppointment[]) => void;
  onNotify?: (msg: string) => void;
  defaultView?: ScheduleViewMode;
  initialDate?: string;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function addDays(iso: string, delta: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + delta);
  return formatIso(d);
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hr12).padStart(2, '0')}:00 ${suffix}`;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  title = 'Appointments & Multi-Stakeholder Scheduler',
  stakeholders,
  appointments,
  onChange,
  onNotify,
  defaultView = 'stakeholders',
  initialDate = '2026-11-19',
}) => {
  const [view, setView] = useState<ScheduleViewMode>(defaultView);
  const [anchorDate, setAnchorDate] = useState<string>(initialDate);
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth <= 640
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [visibleStakeholders, setVisibleStakeholders] = useState<string[]>(
    stakeholders.map((s) => s.id)
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formStakeholder, setFormStakeholder] = useState(stakeholders[0]?.id ?? '');
  const [formDate, setFormDate] = useState(anchorDate);
  const [formHour, setFormHour] = useState('9');
  const [formDuration, setFormDuration] = useState('1');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formCategory, setFormCategory] = useState<ScheduleAppointment['category']>('Meeting');
  const [formNotes, setFormNotes] = useState('');

  const stakeholderMap = useMemo(
    () => new Map(stakeholders.map((s) => [s.id, s])),
    [stakeholders]
  );

  const activeStakeholders = useMemo(
    () => stakeholders.filter((s) => visibleStakeholders.includes(s.id)),
    [stakeholders, visibleStakeholders]
  );

  const visibleAppointments = useMemo(
    () => appointments.filter((a) => visibleStakeholders.includes(a.stakeholderId)),
    [appointments, visibleStakeholders]
  );

  const weekDates = useMemo(() => {
    const d = parseIso(anchorDate);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      return formatIso(cur);
    });
  }, [anchorDate]);

  const monthCells = useMemo(() => {
    const d = parseIso(anchorDate);
    const y = d.getFullYear();
    const m = d.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    return cells;
  }, [anchorDate]);

  const navigate = (dir: -1 | 1) => {
    if (view === 'month') {
      const d = parseIso(anchorDate);
      d.setMonth(d.getMonth() + dir);
      setAnchorDate(formatIso(d));
    } else if (view === 'week') {
      setAnchorDate(addDays(anchorDate, dir * 7));
    } else {
      setAnchorDate(addDays(anchorDate, dir));
    }
  };

  const openCreateModal = (preset?: Partial<ScheduleAppointment>) => {
    setEditingId(null);
    setFormTitle(preset?.title ?? '');
    setFormStakeholder(preset?.stakeholderId ?? activeStakeholders[0]?.id ?? stakeholders[0]?.id ?? '');
    setFormDate(preset?.date ?? anchorDate);
    setFormHour(String(preset?.startHour ?? 9));
    setFormDuration(String(preset?.durationHours ?? 1));
    setFormAllDay(Boolean(preset?.allDay));
    setFormCategory(preset?.category ?? 'Meeting');
    setFormNotes(preset?.notes ?? '');
    setModalOpen(true);
  };

  const openEditModal = (appt: ScheduleAppointment) => {
    setEditingId(appt.id);
    setFormTitle(appt.title);
    setFormStakeholder(appt.stakeholderId);
    setFormDate(appt.date);
    setFormHour(String(appt.startHour));
    setFormDuration(String(appt.durationHours));
    setFormAllDay(Boolean(appt.allDay));
    setFormCategory(appt.category ?? 'Meeting');
    setFormNotes(appt.notes ?? '');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    if (editingId) {
      const next = appointments.map((a) =>
        a.id === editingId
          ? {
              ...a,
              title: formTitle.trim(),
              stakeholderId: formStakeholder,
              date: formDate,
              startHour: Number(formHour),
              durationHours: Number(formDuration),
              allDay: formAllDay,
              category: formCategory,
              notes: formNotes,
            }
          : a
      );
      onChange(next);
      onNotify?.(`Updated "${formTitle.trim()}"`);
    } else {
      const created: ScheduleAppointment = {
        id: `apt-${Date.now()}`,
        title: formTitle.trim(),
        stakeholderId: formStakeholder,
        date: formDate,
        startHour: Number(formHour),
        durationHours: Number(formDuration),
        allDay: formAllDay,
        category: formCategory,
        notes: formNotes,
      };
      onChange([...appointments, created]);
      onNotify?.(`Scheduled "${created.title}"`);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingId) return;
    const target = appointments.find((a) => a.id === editingId);
    onChange(appointments.filter((a) => a.id !== editingId));
    onNotify?.(`Removed "${target?.title ?? 'Appointment'}"`);
    setModalOpen(false);
  };

  const handleDropOnTarget = (target: { date?: string; hour?: number; allDay?: boolean; stakeholderId?: string }) => {
    setDragOverKey(null);
    if (!draggingId) return;
    const moving = appointments.find((a) => a.id === draggingId);
    if (!moving) return;

    const updated: ScheduleAppointment = {
      ...moving,
      date: target.date ?? moving.date,
      startHour: target.hour ?? moving.startHour,
      allDay: target.allDay !== undefined ? target.allDay : moving.allDay,
      stakeholderId: target.stakeholderId ?? moving.stakeholderId,
    };

    onChange(appointments.map((a) => (a.id === draggingId ? updated : a)));
    const stName = stakeholderMap.get(updated.stakeholderId)?.name ?? '';
    const timeLabel = updated.allDay ? 'All Day' : formatHour(updated.startHour);
    onNotify?.(`Moved "${updated.title}" → ${updated.date} (${timeLabel})${stName ? ` • ${stName}` : ''}`);
    setDraggingId(null);
  };

  const renderEventChip = (appt: ScheduleAppointment, compact = false) => {
    const st = stakeholderMap.get(appt.stakeholderId);
    const color = st?.color ?? 'var(--ug-primary)';
    return (
      <div
        key={appt.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          setDraggingId(appt.id);
          e.dataTransfer.setData('text/plain', appt.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDragOverKey(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openEditModal(appt);
        }}
        className="ug-cal-event"
        style={{
          borderInlineStart: `3.5px solid ${color}`,
          background: `${color}15`,
          opacity: draggingId === appt.id ? 0.5 : 1,
        }}
        title={`${appt.title} — ${st?.name ?? ''} (${appt.allDay ? 'All Day' : formatHour(appt.startHour)}) • Drag to reschedule`}
      >
        <div style={{ fontWeight: 700, fontSize: compact ? '0.78rem' : '0.83rem', color: 'var(--ug-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {appt.title}
        </div>
        {!compact && (
          <div style={{ fontSize: '0.75rem', color: 'var(--ug-muted)', display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            <span>{appt.allDay ? 'All Day' : `${formatHour(appt.startHour)} (${appt.durationHours}h)`}</span>
            <span style={{ color, fontWeight: 600 }}>{st?.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    );
  };

  const anchorObj = parseIso(anchorDate);
  const headerRangeLabel =
    view === 'month'
      ? `${MONTHS[anchorObj.getMonth()]} ${anchorObj.getFullYear()}`
      : view === 'week'
      ? `${weekDates[0]}  –  ${weekDates[6]}`
      : `${WEEKDAYS[anchorObj.getDay()]}, ${MONTHS[anchorObj.getMonth()]} ${anchorObj.getDate()}, ${anchorObj.getFullYear()}`;

  return (
    <div className="ug-card">
      {/* Toolbar */}
      <div className="ug-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="ug-card-title">
          <CalendarIcon size={17} style={{ color: 'var(--ug-primary)' }} />
          {title}
          <HelpTag text="Drag and drop any appointment across hours, days, or stakeholders. Click any empty slot to create a new appointment." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} icon={<ChevronLeft size={14} />} />
            <Button variant="secondary" size="sm" onClick={() => setAnchorDate(initialDate)}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(1)} icon={<ChevronRight size={14} />} />
          </div>

          <strong style={{ fontSize: '0.92rem', textAlign: 'center' }}>{headerRangeLabel}</strong>

          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', background: 'var(--ug-surface-alt)', padding: 3, borderRadius: 8, border: '1px solid var(--ug-border)', maxWidth: '100%' }}>
            {(
              [
                { id: 'stakeholders', label: 'Multi-Stakeholder' },
                { id: 'day', label: 'Day / Hour' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'agenda', label: 'Agenda' },
              ] as { id: ScheduleViewMode; label: string }[]
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                style={{
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 9px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: view === v.id ? 'var(--ug-active-bg)' : 'transparent',
                  color: view === v.id ? '#ffffff' : 'var(--ug-text-secondary)',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => openCreateModal()}>
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stakeholder Filter Bar */}
      <div
        style={{
          padding: '8px 18px',
          background: 'var(--ug-surface-alt)',
          borderBottom: '1px solid var(--ug-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.83rem', fontWeight: 700, color: 'var(--ug-muted)' }}>
          <Users size={14} /> Stakeholders:
        </span>
        {stakeholders.map((st) => {
          const active = visibleStakeholders.includes(st.id);
          return (
            <button
              key={st.id}
              type="button"
              onClick={() =>
                setVisibleStakeholders((prev) =>
                  prev.includes(st.id)
                    ? prev.length > 1
                      ? prev.filter((id) => id !== st.id)
                      : prev
                    : [...prev, st.id]
                )
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 999,
                border: `1px solid ${active ? st.color : 'var(--ug-border)'}`,
                background: active ? `${st.color}18` : 'var(--ug-surface)',
                color: active ? st.color : 'var(--ug-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />
              {st.name}
            </button>
          );
        })}
      </div>

      {/* View Body */}
      <div className="ug-card-body" style={{ padding: isMobile ? 10 : 14 }}>
        {/* 1. MULTI-STAKEHOLDER SINGLE VIEW */}
        {view === 'stakeholders' && isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeStakeholders.map((st) => {
              const stItems = visibleAppointments
                .filter((a) => a.date === anchorDate && a.stakeholderId === st.id)
                .sort((a, b) => (a.allDay ? -1 : b.allDay ? 1 : a.startHour - b.startHour));
              const key = `mob-st-${st.id}`;
              return (
                <div
                  key={st.id}
                  className={dragOverKey === key ? 'is-drag-over' : ''}
                  onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={() => handleDropOnTarget({ date: anchorDate, stakeholderId: st.id })}
                  style={{
                    border: '1px solid var(--ug-border)',
                    borderTop: `3px solid ${st.color}`,
                    borderRadius: 8,
                    background: 'var(--ug-surface)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'var(--ug-surface-alt)',
                      borderBottom: '1px solid var(--ug-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{st.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ug-muted)' }}>{st.role}</div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Plus size={13} />}
                      onClick={() => openCreateModal({ date: anchorDate, stakeholderId: st.id })}
                    >
                      Add
                    </Button>
                  </div>
                  <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stItems.length === 0 ? (
                      <div style={{ fontSize: '0.82rem', color: 'var(--ug-muted)', padding: '6px 2px' }}>
                        No appointments scheduled for {anchorDate}
                      </div>
                    ) : (
                      stItems.map((a) => renderEventChip(a))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'stakeholders' && !isMobile && (
          <div className="ug-cal-scroll-wrap">
            <div
              className="ug-cal-grid"
              style={{ gridTemplateColumns: `84px repeat(${activeStakeholders.length}, minmax(180px, 1fr))` }}
            >
              {/* Header Row */}
              <div className="ug-cal-head-cell" style={{ position: 'sticky', insetInlineStart: 0, zIndex: 3 }}>Time</div>
              {activeStakeholders.map((st) => (
                <div key={st.id} className="ug-cal-head-cell" style={{ borderTop: `3px solid ${st.color}` }}>
                  <div style={{ fontWeight: 700 }}>{st.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ug-muted)', fontWeight: 500 }}>{st.role}</div>
                </div>
              ))}

              {/* All-Day Row */}
              <div className="ug-cal-time-cell">All Day</div>
              {activeStakeholders.map((st) => {
                const key = `st-allday-${st.id}`;
                const items = visibleAppointments.filter(
                  (a) => a.date === anchorDate && a.stakeholderId === st.id && a.allDay
                );
                return (
                  <div
                    key={key}
                    className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={() => handleDropOnTarget({ date: anchorDate, allDay: true, stakeholderId: st.id })}
                    onClick={() => openCreateModal({ date: anchorDate, allDay: true, stakeholderId: st.id })}
                  >
                    {items.map((a) => renderEventChip(a))}
                  </div>
                );
              })}

              {/* Hourly Rows */}
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="ug-cal-time-cell">{formatHour(hour)}</div>
                  {activeStakeholders.map((st) => {
                    const key = `st-${st.id}-${hour}`;
                    const items = visibleAppointments.filter(
                      (a) => a.date === anchorDate && a.stakeholderId === st.id && !a.allDay && a.startHour === hour
                    );
                    return (
                      <div
                        key={key}
                        className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                        onDragLeave={() => setDragOverKey(null)}
                        onDrop={() => handleDropOnTarget({ date: anchorDate, hour, allDay: false, stakeholderId: st.id })}
                        onClick={() => openCreateModal({ date: anchorDate, startHour: hour, allDay: false, stakeholderId: st.id })}
                      >
                        {items.map((a) => renderEventChip(a))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 2. DAY / HOURLY VIEW */}
        {view === 'day' && (
          <div className="ug-cal-scroll-wrap">
            <div className="ug-cal-grid" style={{ gridTemplateColumns: isMobile ? '72px 1fr' : '96px 1fr' }}>
            <div className="ug-cal-head-cell">Hour</div>
            <div className="ug-cal-head-cell">{headerRangeLabel}</div>

            <div className="ug-cal-time-cell">All Day</div>
            <div
              className={`ug-cal-slot ${dragOverKey === 'day-allday' ? 'is-drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverKey('day-allday'); }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={() => handleDropOnTarget({ date: anchorDate, allDay: true })}
              onClick={() => openCreateModal({ date: anchorDate, allDay: true })}
            >
              {visibleAppointments
                .filter((a) => a.date === anchorDate && a.allDay)
                .map((a) => renderEventChip(a))}
            </div>

            {HOURS.map((hour) => {
              const key = `day-${hour}`;
              const items = visibleAppointments.filter(
                (a) => a.date === anchorDate && !a.allDay && a.startHour === hour
              );
              return (
                <React.Fragment key={hour}>
                  <div className="ug-cal-time-cell">{formatHour(hour)}</div>
                  <div
                    className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={() => handleDropOnTarget({ date: anchorDate, hour, allDay: false })}
                    onClick={() => openCreateModal({ date: anchorDate, startHour: hour, allDay: false })}
                  >
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {items.map((a) => renderEventChip(a))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            </div>
          </div>
        )}

        {/* 3. WEEK VIEW */}
        {view === 'week' && (
          <div className="ug-cal-scroll-wrap">
            <div className="ug-cal-grid" style={{ gridTemplateColumns: '74px repeat(7, minmax(120px, 1fr))' }}>
              <div className="ug-cal-head-cell" style={{ position: 'sticky', insetInlineStart: 0, zIndex: 3 }}>Hour</div>
            {weekDates.map((iso, i) => (
              <div
                key={iso}
                className="ug-cal-head-cell"
                style={iso === anchorDate ? { background: 'var(--ug-primary-soft)', color: 'var(--ug-primary)' } : undefined}
              >
                <div>{WEEKDAYS[i]}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{iso.slice(5)}</div>
              </div>
            ))}

            <div className="ug-cal-time-cell">All Day</div>
            {weekDates.map((iso) => {
              const key = `wk-allday-${iso}`;
              const items = visibleAppointments.filter((a) => a.date === iso && a.allDay);
              return (
                <div
                  key={key}
                  className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={() => handleDropOnTarget({ date: iso, allDay: true })}
                  onClick={() => openCreateModal({ date: iso, allDay: true })}
                >
                  {items.map((a) => renderEventChip(a, true))}
                </div>
              );
            })}

            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="ug-cal-time-cell">{formatHour(hour)}</div>
                {weekDates.map((iso) => {
                  const key = `wk-${iso}-${hour}`;
                  const items = visibleAppointments.filter(
                    (a) => a.date === iso && !a.allDay && a.startHour === hour
                  );
                  return (
                    <div
                      key={key}
                      className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={() => handleDropOnTarget({ date: iso, hour, allDay: false })}
                      onClick={() => openCreateModal({ date: iso, startHour: hour, allDay: false })}
                    >
                      {items.map((a) => renderEventChip(a, true))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            </div>
          </div>
        )}

        {/* 4. MONTH VIEW */}
        {view === 'month' && (
          <div className="ug-cal-scroll-wrap">
            <div className="ug-cal-grid" style={{ gridTemplateColumns: isMobile ? 'repeat(7, minmax(95px, 1fr))' : 'repeat(7, minmax(120px, 1fr))' }}>
            {WEEKDAYS.map((d) => (
              <div key={d} className="ug-cal-head-cell">{d}</div>
            ))}
            {monthCells.map((iso, idx) => {
              if (!iso) return <div key={`empty-${idx}`} className="ug-cal-slot" style={{ background: 'var(--ug-surface-alt)', minHeight: 92 }} />;
              const key = `mo-${iso}`;
              const items = visibleAppointments.filter((a) => a.date === iso);
              return (
                <div
                  key={iso}
                  className={`ug-cal-slot ${dragOverKey === key ? 'is-drag-over' : ''}`}
                  style={{ minHeight: 96 }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={() => handleDropOnTarget({ date: iso })}
                  onClick={() => openCreateModal({ date: iso })}
                >
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginBottom: 4,
                      color: iso === anchorDate ? 'var(--ug-accent)' : 'var(--ug-text-secondary)',
                    }}
                  >
                    {Number(iso.slice(8))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {items.map((a) => renderEventChip(a, true))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* 5. AGENDA VIEW */}
        {view === 'agenda' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--ug-muted)' }}>
                No appointments scheduled.
              </div>
            ) : (
              [...visibleAppointments]
                .sort((a, b) => `${a.date}-${String(a.startHour).padStart(2, '0')}`.localeCompare(`${b.date}-${String(b.startHour).padStart(2, '0')}`))
                .map((a) => {
                  const st = stakeholderMap.get(a.stakeholderId);
                  return (
                    <div
                      key={a.id}
                      onClick={() => openEditModal(a)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--ug-border)',
                        borderInlineStart: `4px solid ${st?.color ?? 'var(--ug-primary)'}`,
                        cursor: 'pointer',
                        background: 'var(--ug-surface)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.title}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ug-muted)', display: 'flex', gap: 10, marginTop: 2 }}>
                          <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {a.date} • {a.allDay ? 'All Day' : `${formatHour(a.startHour)} (${a.durationHours}h)`}</span>
                          <span>• {st?.name} ({st?.role})</span>
                        </div>
                      </div>
                      <Badge variant="primary">{a.category ?? 'Meeting'}</Badge>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Appointment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Appointment' : 'New Appointment'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div>
              {editingId && (
                <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Create Appointment'}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextInput
            label="Appointment Title"
            required
            placeholder="e.g., Candidate Final Interview / Payroll Sign-off"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <div className="ug-grid-2">
            <SelectControl
              label="Stakeholder"
              required
              value={formStakeholder}
              onChange={(v) => setFormStakeholder(String(v))}
              options={stakeholders.map((s) => ({ value: s.id, label: `${s.name} (${s.role})` }))}
            />
            <SelectControl
              label="Category"
              value={formCategory ?? 'Meeting'}
              onChange={(v) => setFormCategory(String(v) as ScheduleAppointment['category'])}
              options={[
                { value: 'Interview', label: 'Interview' },
                { value: 'Payroll', label: 'Payroll' },
                { value: 'Review', label: 'Appraisal / Review' },
                { value: 'Training', label: 'Training' },
                { value: 'Meeting', label: 'Meeting' },
              ]}
            />
          </div>
          <div className="ug-grid-3">
            <TextInput
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <SelectControl
              label="Start Hour"
              value={formHour}
              onChange={(v) => setFormHour(String(v))}
              options={HOURS.map((h) => ({ value: String(h), label: formatHour(h) }))}
            />
            <SelectControl
              label="Duration"
              value={formDuration}
              onChange={(v) => setFormDuration(String(v))}
              options={[
                { value: '1', label: '1 Hour' },
                { value: '2', label: '2 Hours' },
                { value: '3', label: '3 Hours' },
              ]}
            />
          </div>
          <SwitchToggle label="All-Day Event" checked={formAllDay} onChange={setFormAllDay} />
          <TextArea label="Notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};
