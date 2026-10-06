export interface PropRow {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

export function PropTable({
  rows,
  columns = ['Prop', 'Type', 'Default', 'Description'],
}: {
  rows: PropRow[];
  columns?: string[];
}): JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="api-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                {row.name}
                {row.required ? <span style={{ color: '#e11d48' }}>*</span> : null}
              </td>
              <td>
                <span className="type-chip">{row.type}</span>
              </td>
              {columns.length === 4 ? (
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.3, color: 'var(--muted-foreground)' }}>
                  {row.default ?? '—'}
                </td>
              ) : null}
              <td style={{ whiteSpace: 'normal' }}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
