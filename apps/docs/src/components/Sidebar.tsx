import { NAV } from '../content/nav';

export function Sidebar({ activeId }: { activeId: string | null }): JSX.Element {
  return (
    <aside className="sidebar" aria-label="Section navigation">
      {NAV.map((group) => (
        <div className="sidebar-group" key={group.title}>
          <h5>{group.title}</h5>
          {group.entries.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className={entry.id === activeId ? 'active' : undefined}
            >
              {entry.label}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}
