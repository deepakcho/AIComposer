import { useState } from 'react';
import { AIComposer } from '@ai-composer/react';
import { CodeBlock } from '../components/CodeBlock';
import { createDemoEditor } from '../demos/fixtures';

export function StylingTutorial(): JSX.Element {
  return (
    <section className="section" id="styling-tutorial">
      <h2>
        Styling tutorial{' '}
        <a className="section-anchor" href="#styling-tutorial" aria-label="Link to section">
          #
        </a>
      </h2>
      <p className="section-lead">
        Give one composer your product’s look without fighting component styles. Start with the
        optional theme, scope a few CSS tokens, then opt into dark mode when you need it.
      </p>

      <h3 className="sub">1. Import the theme once</h3>
      <p className="prose-p muted">
        Add the token sheet and structural styles at your application entry point. The theme is
        optional; the editor also works with your own CSS.
      </p>
      <CodeBlock
        lang="tsx"
        code={`import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';`}
      />

      <h3 className="sub">2. Scope tokens to your composer</h3>
      <p className="prose-p muted">
        Override CSS custom properties on the editor root to theme this composer without changing
        other instances.
      </p>
      <CodeBlock
        lang="css"
        code={`.brand-composer {
  --aic-radius: 18px;
  --aic-accent: #6d5ce8;
  --aic-accent-hover: #5846d6;
  --aic-chip-mention-background: #eeeaff;
  --aic-chip-mention-text: #5140b8;
  --aic-input-max-height: 40vh;
}`}
      />
      <ExamplePreview />

      <h3 className="sub">3. Add dark mode only where needed</h3>
      <p className="prose-p muted">
        Import the dark token overrides and set the theme attribute on an ancestor. It can be
        toggled per composer; it does not require changing the whole page theme.
      </p>
      <CodeBlock
        lang="tsx"
        code={`import '@ai-composer/themes/css/dark.css';

<div data-aic-theme="dark">
  <AIComposer editor={editor} className="brand-composer" mode="chat" />
</div>`}
      />

      <div className="callout">
        <span aria-hidden>✦</span>
        <span>
          Want full visual control? Skip the theme and style the documented <code>aic-*</code>{' '}
          classes and <code>data-aic-*</code> slots directly. See the{' '}
          <a href="#theming">token reference</a> for the complete variable list.
        </span>
      </div>
    </section>
  );
}

function ExamplePreview(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Ask your team… try @' }));
  return (
    <div className="tutorial-style-preview">
      <span className="tutorial-preview-label">Live preview</span>
      <AIComposer editor={editor} mode="chat" className="brand-composer" />
    </div>
  );
}
