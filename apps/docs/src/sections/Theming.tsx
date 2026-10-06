import { useState } from 'react';
import { AIComposer } from '@ai-composer/react';
import { CodeBlock } from '../components/CodeBlock';
import { Example } from '../components/Example';
import { createDemoEditor } from '../demos/fixtures';

const TOKEN_GROUPS: Array<{ title: string; tokens: Array<[string, string]> }> = [
  {
    title: 'Surface & text',
    tokens: [
      ['--aic-background', 'Editor card background'],
      ['--aic-surface-raised', 'Hover / active fills'],
      ['--aic-border', 'Card and divider borders'],
      ['--aic-border-focus', 'Focused card border'],
      ['--aic-text', 'Input text'],
      ['--aic-text-muted', 'Secondary text'],
      ['--aic-text-placeholder', 'Placeholder'],
    ],
  },
  {
    title: 'Primary action (send)',
    tokens: [
      ['--aic-accent', 'Send button background'],
      ['--aic-accent-hover', 'Send button hover'],
      ['--aic-accent-contrast', 'Send glyph color'],
      ['--aic-accent-disabled', 'Idle send button'],
    ],
  },
  {
    title: 'Chips (per node type)',
    tokens: [
      ['--aic-chip-background · --aic-chip-text', 'Fallback (attachments)'],
      ['--aic-chip-mention-*', 'Mention chips'],
      ['--aic-chip-command-*', 'Command chips'],
      ['--aic-chip-variable-*', 'Variable chips'],
      ['--aic-chip-hashtag-*', 'Custom chips'],
    ],
  },
  {
    title: 'Geometry & effects',
    tokens: [
      ['--aic-radius · --aic-radius-sm', 'Corner radii'],
      ['--aic-input-padding / -min-height / -max-height', 'Input box metrics'],
      ['--aic-font-size · --aic-font-family', 'Typography'],
      ['--aic-shadow · --aic-shadow-raised', 'Card and popup elevation'],
      ['--aic-focus-ring', 'Focus halo'],
      ['--aic-transition', 'Motion timing'],
    ],
  },
];

export function Theming(): JSX.Element {
  return (
    <section className="section" id="theming">
      <h2>
        Theming &amp; tokens{' '}
        <a className="section-anchor" href="#theming" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        Every visual value is a CSS custom property — theme by overriding tokens, no selectors to
        fight. The dark theme is just a token sheet gated on{' '}
        <code>data-aic-theme=&quot;dark&quot;</code>.
      </p>

      <h3 className="sub">Token reference</h3>
      {TOKEN_GROUPS.map((group) => (
        <div key={group.title}>
          <h4 className="sub">{group.title}</h4>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {group.tokens.map(([name, description]) => (
              <div className="token-row" key={name}>
                <code>{name}</code>
                <span style={{ color: 'var(--muted-foreground)' }}>{description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h3 className="sub" style={{ marginTop: 30 }}>
        Overriding tokens
      </h3>
      <CodeBlock
        lang="css"
        code={`/* anywhere in your app — scope it to one editor or all of them */
.aic-root {
  --aic-radius: 24px;
  --aic-accent: #16a34a;          /* green send button */
  --aic-chip-mention-background: #dcfce7;
  --aic-chip-mention-text: #15803d;
  --aic-input-max-height: 40vh;
}

/* dark mode: set the attribute on any ancestor (or the root itself) */
html[data-aic-theme='dark'] .aic-root { /* picked up automatically */ }`}
      />

      <Example
        title="Dark theme — opt-in, isolated"
        id="theming-dark"
        description="This card sets data-aic-theme on itself — it stays dark regardless of the site theme (try the header toggle)."
        code={`import '@ai-composer/themes/css/dark.css';

<div data-aic-theme="dark" style={{ background: '#131316', padding: 24, borderRadius: 16 }}>
  <AIComposer editor={editor} mode="chat" />
</div>`}
      >
        <DarkCardDemo />
      </Example>

      <div className="callout">
        <span aria-hidden>🧩</span>
        <span>
          <strong>Headless alternative.</strong> Skip <code>@ai-composer/themes</code> entirely and
          write CSS against the structural classes (<code>aic-root</code>, <code>aic-input-host</code>,{' '}
          <code>aic-chip</code>, <code>aic-suggestions</code>…) and <code>data-aic-*</code>{' '}
          attributes — Tailwind, CSS modules, or your design system.
        </span>
      </div>
    </section>
  );
}

function DarkCardDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Always dark…' }));
  return (
    <div
      data-aic-theme="dark"
      style={{ background: '#131316', padding: '22px 20px', borderRadius: 14 }}
    >
      <AIComposer editor={editor} mode="chat" />
    </div>
  );
}
