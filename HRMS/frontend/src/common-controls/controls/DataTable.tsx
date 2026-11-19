import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Columns, Download, Search } from 'lucide-react';
import { Button } from './HelpAndFeedback';

export interface DataColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string | number;
}

export interface DataTableProps<T extends { id: string | number }> {
  title?: string;
  data: T[];
  columns: DataColumn<T>[];
  pageSize?: number;
  searchable?: boolean;
  exportFileName?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  pageSize = 5,
  searchable = true,
  exportFileName,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const visibleCols = columns.filter((c) => !hiddenCols.includes(String(c.key)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = !q
      ? data
      : data.filter((row) =>
          Object.values(row as Record<string, unknown>).some((v) =>
            String(v ?? '').toLowerCase().includes(q)
          )
        );
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '');
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportCsv = () => {
    const headers = visibleCols.map((c) => `"${c.header}"`).join(',');
    const lines = filtered.map((row) =>
      visibleCols
        .map((c) => {
          const val = c.exportValue
            ? c.exportValue(row)
            : (row as Record<string, unknown>)[String(c.key)];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const blob = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName ?? 'hrms-export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ug-card">
      <div className="ug-card-header" style={{ flexWrap: 'wrap' }}>
        <div className="ug-card-title">{title ?? 'Data Records'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {searchable && (
            <div className="ug-input-wrap" style={{ width: 220 }}>
              <span className="ug-input-icon-start">
                <Search size={14} />
              </span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search table..."
                className="ug-input ug-input-prefix"
                style={{ paddingTop: 6, paddingBottom: 6 }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Columns size={14} />}
              onClick={() => setColMenuOpen((o) => !o)}
            >
              Columns
            </Button>
            {colMenuOpen && (
              <div className="ug-dropdown-panel" style={{ width: 190, padding: 8, insetInlineStart: 'auto' }}>
                {columns.map((c) => {
                  const k = String(c.key);
                  const visible = !hiddenCols.includes(k);
                  return (
                    <label
                      key={k}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', fontSize: '0.926rem', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() =>
                          setHiddenCols((prev) =>
                            prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
                          )
                        }
                      />
                      {c.header}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {exportFileName && (
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExportCsv}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="ug-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
        <table className="ug-table">
          <thead>
            <tr>
              {visibleCols.map((col) => {
                const k = String(col.key);
                return (
                  <th
                    key={k}
                    onClick={() => col.sortable && toggleSort(k)}
                    style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {col.header}
                      {col.sortable && sortKey === k && (sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                    </span>
                  </th>
                );
              })}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: 24, color: 'var(--ug-muted)' }}>
                  No records found
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  {visibleCols.map((col) => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                    </td>
                  ))}
                  {actions && <td>{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--ug-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.926rem',
          color: 'var(--ug-muted)',
        }}
      >
        <span>
          Showing {pageRows.length} of {filtered.length} records (Page {safePage} / {totalPages})
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="secondary" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button variant="secondary" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
