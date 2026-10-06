import { NAV } from '../content/nav';

export function TableOfContents({ activeId }: { activeId: string | null }): JSX.Element {
  const children = NAV.flatMap((group) => group.children ?? []);
  return (
    <aside className="toc" aria-label="On this page">
      <h5>On this page</h5>
      {NAV.flatMap((group) =>
        group.entries.map((entry) => (
          <a
            key={entry.id}
            href={`#${entry.id}`}
            className={entry.id === activeId ? 'active' : undefined}
          >
            {entry.label}
          </a>
        )),
      )}
      <h5 style={{ marginTop: 18 }}>Details</h5>
      {children.map((child) => (
        <a
          key={child.id}
          href={`#${child.id}`}
          className={`level-3${child.id === activeId ? ' active' : ''}`}
        >
          {child.label}
        </a>
      ))}
    </aside>
  );
}
