import { CodeBlock } from '../components/CodeBlock';

export function QuickStart(): JSX.Element {
  return (
    <section className="section" id="quick-start">
      <h2>
        Quick start <a className="section-anchor" href="#quick-start" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        Three usage levels, one engine underneath. Start at level 1; drop to level 3 only when you
        need to own the DOM.
      </p>

      <h3 className="sub" id="quick-level-1">
        Level 1 · zero configuration
      </h3>
      <CodeBlock
        lang="tsx"
        code={`import { AIComposer } from '@ai-composer/react';

export function App() {
  return <AIComposer mode="chat" placeholder="Ask anything…" />;
}`}
      />

      <h3 className="sub" id="quick-level-2">
        Level 2 · configured
      </h3>
      <p className="prose-p muted">
        Pass plugins and editor options through props — the adapter creates the editor for you.
      </p>
      <CodeBlock
        lang="tsx"
        code={`import { AIComposer } from '@ai-composer/react';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

<AIComposer
  mode="chat"
  placeholder="Ask anything…"
  options={{
    plugins: [
      mentionPlugin({ items: people }),
      commandPlugin({ commands }),
    ],
  }}
  onSubmit={(value) => send(value)}
/>`}
      />

      <h3 className="sub" id="quick-level-3">
        Level 3 · full custom layout
      </h3>
      <p className="prose-p muted">
        Own the editor instance and compose slot components — the application controls the entire
        DOM; the engine supplies behavior and state.
      </p>
      <CodeBlock
        lang="tsx"
        code={`import { createAIComposer } from '@ai-composer/core';
import {
  AIComposer, AIComposerHeader, AIComposerInput, AIComposerToolbar,
} from '@ai-composer/react';

const editor = createAIComposer({ mode: 'chat', /* plugins… */ });

<AIComposer editor={editor}>
  <AIComposerHeader>Context · PR #128</AIComposerHeader>
  <div className="aic-body" data-aic-slot="body">
    <AIComposerInput />
  </div>
  <AIComposerToolbar>
    <button onClick={() => editor.executeCommand('undo')}>Undo</button>
    <button onClick={() => editor.submit()}>Send</button>
  </AIComposerToolbar>
</AIComposer>`}
      />

      <div className="callout">
        <span aria-hidden>✦</span>
        <span>
          <strong>The same engine powers all three levels</strong> — modes are presets, not
          separate components, and switching modes keeps the draft, selection and undo history.
        </span>
      </div>
    </section>
  );
}
