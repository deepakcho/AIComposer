/**
 * Live demos — the interactive counterpart of the Storybook stories, each
 * with a Preview / Code toggle.
 */

import { useEffect, useState } from 'react';
import {
  createAttachmentNode,
  createMentionNode,
  createAIComposer,
  createTextNode,
  defineTrigger,
  type NodeDefinition,
  type AIComposerPlugin,
  type SerializationFormat,
} from '@ai-composer/core';
import {
  AIComposer,
  AIComposerInput,
  AIComposerSuggestions,
  useAIComposerState,
} from '@ai-composer/react';
import { Example } from '../components/Example';
import { CodeBlock } from '../components/CodeBlock';
import { createDemoEditor, people } from '../demos/fixtures';

const topics = [
  { id: 't1', label: '#payments', description: 'billing & refunds' },
  { id: 't2', label: '#onboarding', description: 'activation funnel' },
  { id: 't3', label: '#infra', description: 'outages & latency' },
  { id: 't4', label: '#growth', description: 'experiments' },
];

/** Custom node display for hashtag chips (green tint via data-aic-node="custom"). */
const hashtagLabel = (node: Parameters<NonNullable<NodeDefinition['toDisplay']>>[0]): string =>
  node.type === 'custom' ? String((node.data as { label?: string } | undefined)?.label ?? '') : '';

const HASHTAG_DISPLAY: NodeDefinition = {
  type: 'custom',
  isAtomic: true,
  toText: hashtagLabel,
  toMarkdown: hashtagLabel,
  toHtml: hashtagLabel,
  toDisplay: hashtagLabel,
};

const hashtagPlugin = (): AIComposerPlugin => ({
  name: 'hashtag',
  triggers: [
    defineTrigger({
      id: 'hashtag',
      character: '#',
      type: 'custom',
      search: ({ query }) => topics.filter((topic) => topic.label.includes(query.toLowerCase())),
    }),
  ],
});

export function Demos(): JSX.Element {
  return (
    <section className="section" id="demos">
      <h2>
        Live demos{' '}
        <a className="section-anchor" href="#demos" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        Every demo below is live — type in it. The same examples ship as Storybook stories in each
        adapter package (<code>packages/react/src/stories</code>).
      </p>

      <Example
        title="Basic"
        id="demo-basic"
        description="Level 1, zero configuration: chat mode with the default send button. Enter submits, Shift+Enter adds a newline."
        code={`<AIComposer mode="chat" placeholder="Ask anything…" />`}
      >
        <BasicDemo />
      </Example>

      <Example
        title="Modes — compact · chat · expanded"
        id="demo-modes"
        description="Modes are presets of the same component. Compact is a single-line pill that morphs into a box on multiline content; chat auto-grows; expanded is a tall canvas."
        code={`<AIComposer mode="compact" placeholder="Search or ask…" />
<AIComposer mode="chat"    placeholder="Ask anything…" />
<AIComposer mode="expanded" placeholder="Write a detailed draft…" />`}
      >
        <ModesDemo />
      </Example>

      <Example
        title="Mentions & commands"
        id="demo-triggers"
        description="Type @ for people or / for commands. The popup anchors to the caret, flips to fit the viewport, and selections become typed chips you can read as structured nodes."
        code={`const editor = createAIComposer({
  plugins: [
    mentionPlugin({ items: people }),      // @
    commandPlugin({ commands: slashCommands }), // /
  ],
});

<AIComposer editor={editor} mode="chat" />`}
      >
        <TriggersDemo />
      </Example>

      <Example
        title="Attachments"
        id="demo-attachments"
        description="Attachment nodes render as removable chips in their own row. Remove re-enters the document into history — undo restores the chip."
        code={`const editor = createAIComposer({
  value: {
    nodes: [
      createAttachmentNode({ id: 'a1', name: 'spec-diff.png', mimeType: 'image/png' }),
      createAttachmentNode({ id: 'a2', name: 'notes.md', mimeType: 'text/markdown' }),
      createTextNode(' sanity-check these before the review?'),
    ],
  },
});

<AIComposer editor={editor} mode="chat" />`}
      >
        <AttachmentsDemo />
      </Example>

      <Example
        title="States — disabled · readonly · dark"
        id="demo-states"
        description="State flags map to data-aic-* attributes and ARIA. Dark is a token override on any ancestor — flip the site theme in the header to see this page's demos follow."
        code={`<AIComposer mode="chat" value="Cannot edit me" disabled />
<AIComposer mode="chat" value="Read-only but selectable" readonly />

// dark: opt-in on any ancestor (or the root itself)
<div data-aic-theme="dark">
  <AIComposer mode="chat" />
</div>`}
      >
        <StatesDemo />
      </Example>

      <Example
        title="Controlled"
        id="demo-controlled"
        description="Drive the editor from the outside: value / onChange / onSubmit give you a fully controlled component, with the live document JSON one subscription away."
        code={`const [value, setValue] = useState<AIComposerDocument>({ nodes: [] });

<AIComposer
  mode="chat"
  value={value}
  onChange={setValue}
  onSubmit={(doc) => console.log('submit', doc)}
/>`}
      >
        <ControlledDemo />
      </Example>

      <Example
        title="Custom trigger & node — hashtags"
        id="demo-hashtag"
        description="A plugin of your own: # opens a topic picker, selections become custom nodes with a custom chip renderer (green) and their own text serialization."
        code={`const hashtagPlugin = (): AIComposerPlugin => ({
  name: 'hashtag',
  triggers: [
    defineTrigger({
      id: 'hashtag',
      character: '#',
      type: 'custom',                       // → CustomNode, green chip tint
      search: ({ query }) => topics.filter((t) => t.label.includes(query)),
    }),
  ],
});

const editor = createAIComposer({
  mode: 'chat',
  plugins: [hashtagPlugin(), mentionPlugin({ items: people })],
  nodeTypes: [{
    type: 'custom',                          // custom chip label + serialization
    isAtomic: true,
    toDisplay: (node) => node.data.label,
    toText: (node) => node.data.label,
  }],
});`}
      >
        <HashtagDemo />
      </Example>

      <Example
        title="Custom suggestion items — avatars"
        id="demo-custom-suggestions"
        description="Own the menu entirely: disable the built-in popup and render AIComposerSuggestions with your own item markup — avatars, roles, keyboard hints."
        code={`<AIComposer editor={editor} mode="chat">
  <AIComposerInput suggestions={false} />
  <AIComposerSuggestions
    renderItem={(item) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="sugg-avatar">{initials(item.label)}</span>
        <span className="sugg-body" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong>{item.label}</strong>
          <em>{item.description}</em>
        </span>
      </span>
    )}
  />
</AIComposer>`}
      >
        <CustomSuggestionsDemo />
      </Example>

      <Example
        title="Serialization playground"
        id="demo-serialization"
        description="One document, five projections — switch format and watch the output update as you type. Chips carry their entity data through every format."
        code={`const state = useAIComposerState(editor);
const [format, setFormat] = useState<SerializationFormat>('ai');

<AIComposer editor={editor} mode="chat" />

<select value={format} onChange={(e) => setFormat(e.target.value)}>
  {['ai', 'text', 'markdown', 'json', 'html'].map((f) => <option key={f}>{f}</option>)}
</select>

<pre>{JSON.stringify(editor.serialize(format), null, 2)}</pre>`}
      >
        <SerializationDemo />
      </Example>
    </section>
  );
}

/* --------------------------------------------------------------- demos */

function BasicDemo(): JSX.Element {
  return <AIComposer mode="chat" placeholder="Ask anything…" />;
}

function ModesDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Draft survives switching…' }));
  const [mode, setMode] = useState<'compact' | 'chat' | 'expanded'>('chat');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['compact', 'chat', 'expanded'] as const).map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={mode === candidate}
            onClick={() => setMode(candidate)}
            style={{
              padding: '4px 14px',
              borderRadius: 999,
              border: `1px solid ${mode === candidate ? 'var(--foreground)' : 'var(--border-strong)'}`,
              background: mode === candidate ? 'var(--accent)' : 'transparent',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {candidate}
          </button>
        ))}
      </div>
      <AIComposer editor={editor} mode={mode} />
    </div>
  );
}

function TriggersDemo(): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({
      placeholder: 'Ping @someone or run /summarize…',
      value: {
        nodes: [
          createTextNode('Review with '),
          createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
          createTextNode(' and '),
          createMentionNode({ id: 'u4', label: 'Margaret Hamilton' }),
          createTextNode(' — '),
        ],
      },
    }),
  );
  return (
    <div>
      <AIComposer editor={editor} mode="chat" />
      <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--muted-foreground)' }}>
        {people.length} people and 4 commands registered · arrow keys navigate · Enter accepts ·
        Esc closes
      </p>
    </div>
  );
}

function AttachmentsDemo(): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({
      placeholder: 'Add context…',
      value: {
        nodes: [
          createAttachmentNode({ id: 'a1', name: 'spec-diff.png', mimeType: 'image/png' }),
          createAttachmentNode({ id: 'a2', name: 'notes.md', mimeType: 'text/markdown' }),
          createTextNode(' sanity-check these before the review?'),
        ],
      },
    }),
  );
  return <AIComposer editor={editor} mode="chat" />;
}

function StatesDemo(): JSX.Element {
  return (
    <div className="demo-grid">
      <AIComposer mode="chat" value="You cannot edit me" disabled />
      <AIComposer mode="chat" value="Read-only but selectable" readonly />
    </div>
  );
}

function ControlledDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Type, then press Enter…' }));
  const state = useAIComposerState(editor);
  const [lastSubmit, setLastSubmit] = useState<string | null>(null);

  useEffect(() => {
    return editor.on('submit', (event) => setLastSubmit(JSON.stringify(event.value, null, 2)));
  }, [editor]);

  return (
    <div>
      <AIComposer editor={editor} mode="chat" />
      <div
        style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 10,
          background: 'var(--code-bg)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.6,
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {lastSubmit ?? JSON.stringify(state.value, null, 2)}
      </div>
      {lastSubmit ? (
        <button
          type="button"
          className="btn-secondary"
          style={{ marginTop: 10, padding: '4px 12px', fontSize: 12.5 }}
          onClick={() => setLastSubmit(null)}
        >
          Back to live value
        </button>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--muted-foreground)' }}>
          The document is the source of truth — press Enter to capture a submit payload.
        </p>
      )}
    </div>
  );
}


function HashtagDemo(): JSX.Element {
  const [editor] = useState(() =>
    createAIComposer({
      mode: 'chat',
      placeholder: 'Tag it — type # or @…',
      plugins: [hashtagPlugin()],
      nodeTypes: [HASHTAG_DISPLAY],
    }),
  );
  return <AIComposer editor={editor} mode="chat" />;
}

const initials = (label: string): string =>
  label
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function CustomSuggestionsDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Assign to @someone…' }));
  return (
    <div>
      <AIComposer editor={editor} mode="chat">
        <AIComposerInput suggestions={false} />
        <AIComposerSuggestions
          renderItem={(item, active) => (
            <span className="demo-suggestion-row">
              <span
                className={`demo-suggestion-avatar${active ? ' is-active' : ''}`}
              >
                {initials(item.label)}
              </span>
              <span className="demo-suggestion-copy">
                <strong>{item.label}</strong>
                {item.description ? (
                  <em>
                    {item.description}
                  </em>
                ) : null}
              </span>
            </span>
          )}
        />
      </AIComposer>
      <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--muted-foreground)' }}>
        Type @ to open the custom menu — same keyboard model, your markup.
      </p>
    </div>
  );
}

const FORMATS: SerializationFormat[] = ['ai', 'text', 'markdown', 'json', 'html'];

function SerializationDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Mix text, @ada, /summarize…' }));
  const state = useAIComposerState(editor);
  const [format, setFormat] = useState<SerializationFormat>('ai');
  const output =
    format === 'text' || format === 'markdown'
      ? String(editor.serialize(format))
      : JSON.stringify(editor.serialize(format), null, 2);

  return (
    <div>
      <AIComposer editor={editor} mode="chat" />
      <div
        style={{
          display: 'flex',
          gap: 6,
          margin: '12px 0 8px',
        }}
      >
        {FORMATS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={format === candidate}
            onClick={() => setFormat(candidate)}
            style={{
              padding: '3px 12px',
              borderRadius: 999,
              border: `1px solid ${format === candidate ? 'var(--foreground)' : 'var(--border-strong)'}`,
              background: format === candidate ? 'var(--accent)' : 'transparent',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {candidate}
          </button>
        ))}
      </div>
      <CodeBlock
        lang={format === 'html' ? 'html' : 'ts'}
        code={output}
      />
      <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--muted-foreground)' }}>
        {state.value.nodes.length} nodes · live output — the same document feeds every format.
      </p>
    </div>
  );
}
