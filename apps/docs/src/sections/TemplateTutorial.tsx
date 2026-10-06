import { useState } from 'react';
import {
  AIComposer,
  AIComposerAttachments,
  AIComposerBody,
  AIComposerFooter,
  AIComposerHeader,
  AIComposerInput,
  AIComposerSuggestions,
  AIComposerToolbar,
  useAIComposerState,
} from '@ai-composer/react';
import { CodeBlock } from '../components/CodeBlock';
import { createDemoEditor } from '../demos/fixtures';

const TEMPLATE_CODE = `import { createAIComposer, createAttachmentNode } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { useRef } from 'react';
import {
  AIComposer, AIComposerAttachments, AIComposerBody, AIComposerFooter,
  AIComposerHeader, AIComposerInput, AIComposerSuggestions,
  AIComposerToolbar, useAIComposerState,
} from '@ai-composer/react';

const teammates = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
];

const editor = createAIComposer({
  mode: 'chat',
  plugins: [mentionPlugin({ items: teammates })],
});

function TeamComposer() {
  const state = useAIComposerState(editor);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const characterCount = state.value.nodes.reduce(
    (total, node) => total + (node.type === 'text' ? node.text.length : 1),
    0,
  );

  return (
    <AIComposer
      editor={editor}
      className="team-composer"
      onSubmit={(value) => console.log('Send this value to your AI service:', value)}
    >
      <AIComposerHeader>
        <strong>✦ Team assistant</strong>
        <span>Internal · GPT-4.1</span>
      </AIComposerHeader>
      <AIComposerBody>
        <AIComposerAttachments />
        <AIComposerInput suggestions={false} />
        <AIComposerSuggestions
          renderItem={(item, active) => (
            <span className={active ? 'team-suggestion active' : 'team-suggestion'}>
              <strong>{item.label}</strong>
              {item.description && <small>{item.description}</small>}
            </span>
          )}
        />
      </AIComposerBody>
      <AIComposerToolbar>
        <button type="button" onClick={() => fileInputRef.current?.click()}>Attach</button>
        <span>{characterCount} characters</span>
        <button
          type="button"
          disabled={state.empty || state.submitting}
          onClick={() => void editor.submit()}
        >
          Send
        </button>
      </AIComposerToolbar>
      <AIComposerFooter>AI responses may be inaccurate.</AIComposerFooter>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            editor.insertNode(createAttachmentNode({
              id: \`\${file.name}-\${file.lastModified}\`,
              name: file.name,
              mimeType: file.type || 'application/octet-stream',
              size: file.size,
            }));
          }
          event.currentTarget.value = '';
        }}
      />
    </AIComposer>
  );
}`;

export function TemplateTutorial(): JSX.Element {
  return (
    <section className="section" id="template-tutorial">
      <h2>
        Full template customization{' '}
        <a className="section-anchor" href="#template-tutorial" aria-label="Link to section">
          #
        </a>
      </h2>
      <p className="section-lead">
        Build the whole composer layout from slots: your header, input area, suggestion popup,
        toolbar and footer. The editor keeps its behavior and state while your app owns the markup.
      </p>

      <h3 className="sub">1. Create and configure the shared editor</h3>
      <p className="prose-p muted">
        Keep the editor instance outside the layout component. Configure modes and plugins once; all
        slot components read the same editor from <code>AIComposer</code>.
      </p>
      <h3 className="sub">2. Replace the default layout with slots</h3>
      <p className="prose-p muted">
        Supplying children opts into a fully custom layout. Use <code>AIComposerInput</code> for the
        managed editable surface and <code>useAIComposerState</code> for app-owned controls. If you
        render a custom suggestion list, disable the input’s built-in one.
      </p>
      <CodeBlock lang="tsx" code={TEMPLATE_CODE} />

      <h3 className="sub">3. Style the slots like the rest of your product</h3>
      <CodeBlock
        lang="css"
        code={`.team-composer {
  --aic-radius: 16px;
  --aic-accent: #2563eb;
  --aic-input-max-height: 220px;
}

.team-composer .aic-header,
.team-composer .aic-footer {
  padding: 10px 16px;
}

.team-composer .aic-header {
  display: flex;
  justify-content: space-between;
}

.team-composer .aic-toolbar {
  justify-content: space-between;
}`}
      />
      <FullTemplatePreview />

      <div className="callout">
        <span aria-hidden>✦</span>
        <span>
          The <code>aic-*</code> slot classes are styling hooks, not required wrappers. For
          framework-specific examples, continue to <a href="#frameworks">adapter integration</a> or
          explore the <a href="#templates">ready-made layouts</a>.
        </span>
      </div>
    </section>
  );
}

function FullTemplatePreview(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Ask your team… try @' }));
  const state = useAIComposerState(editor);
  const characterCount = state.value.nodes.reduce(
    (total, node) => total + (node.type === 'text' ? node.text.length : 1),
    0,
  );

  return (
    <div className="tutorial-template-preview">
      <span className="tutorial-preview-label">Live preview · type @ to mention a teammate</span>
      <AIComposer editor={editor} mode="chat" className="team-composer">
        <AIComposerHeader>
          <strong>✦ Team assistant</strong>
          <span>Internal · GPT-4.1</span>
        </AIComposerHeader>
        <AIComposerBody>
          <AIComposerAttachments />
          <AIComposerInput suggestions={false} />
          <AIComposerSuggestions
            renderItem={(item, active) => (
              <span className={active ? 'team-suggestion active' : 'team-suggestion'}>
                <strong>{item.label}</strong>
                {item.description ? <small>{item.description}</small> : null}
              </span>
            )}
          />
        </AIComposerBody>
        <AIComposerToolbar>
          <button type="button" aria-label="Attach a file">
            Attach
          </button>
          <span>{characterCount} characters</span>
          <button
            type="button"
            disabled={state.empty || state.submitting}
            onClick={() => void editor.submit()}
          >
            Send
          </button>
        </AIComposerToolbar>
        <AIComposerFooter>AI responses may be inaccurate.</AIComposerFooter>
      </AIComposer>
    </div>
  );
}
