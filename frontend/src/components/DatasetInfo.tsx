import React from 'react';

interface ColumnInfo {
  name: string;
  type: string;
}

interface DatasetInfoProps {
  filename: string;
  rows: number;
  columns: number;
  columnList: ColumnInfo[];
  onClear?: () => void;
}

export function DatasetInfo({ filename, rows, columns, columnList, onClear }: DatasetInfoProps) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p className="section-label" style={{ margin: 0 }}>Dataset</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="tag-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            {filename}
          </span>
          {onClear && (
            <button 
              onClick={onClear} 
              className="btn-glass" 
              style={{ padding: '4px 10px', fontSize: '0.72rem', minHeight: 'auto', borderRadius: '100px' }}
              title="Load new file"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[{ label: 'Rows', val: rows.toLocaleString() }, { label: 'Columns', val: columns }].map(({ label, val }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '16px 18px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
            <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="glass-divider" style={{ marginBottom: 16 }} />

      {/* Column list */}
      <p className="section-label">Columns</p>
      <div className="custom-scrollbar" data-lenis-prevent style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {columnList.map((col, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'background 0.2s ease',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.83rem', fontWeight: 500 }}>{col.name}</span>
            <span className="tag-pill" style={{ fontSize: '0.68rem' }}>{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
