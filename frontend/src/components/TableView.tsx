import React from 'react';

interface TableViewProps {
  data: any[] | null;
}

export function TableView({ data }: TableViewProps) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <p className="section-label">Supporting Table</p>
      <div
        className="custom-scrollbar"
        data-lenis-prevent
        style={{
          overflowX: 'auto',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {columns.map((col) => (
                <th key={col} style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: rowIndex < data.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
              >
                {columns.map((col) => (
                  <td key={`${rowIndex}-${col}`} style={{
                    padding: '9px 14px',
                    color: 'rgba(255,255,255,0.75)',
                    whiteSpace: 'nowrap',
                  }}>
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: 10, textAlign: 'right' }}>
        {data.length} row{data.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
