/**
 * AI Composer · React — full scenario matrix.
 *
 * Every story runs the same engine (`@ai-composer/core`) through the React
 * adapter. Stories marked *Interaction* execute real user flows via
 * `@storybook/test` play functions.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useEffect, useState } from 'react';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
  usePromptState,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/PromptEditor',
  parameters: {
    docs: {
      description: {
        component: `
The React adapter. Three usage levels share one engine:

- **Level 1 — zero config:** \`<PromptEditor mode="chat" />\`
- **Level 2 — configured:** pass \`options={{ plugins: [...] }}\`
- **Level 3 — custom layout:** pass \`editor\` + slot components

See [docs/frameworks/react.md](https://github.com/) in the repo for the full guide.
`,
      },
    },
  },
  args: {
    mode: 'chat',
    placeholder: 'Ask anything… try @mentions and /commands',
    submitLabel: 'Send',
  },
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

export const Compact: Story = {
  args: { mode: 'compact', placeholder: 'Search or ask…' },
};

export const Chat: Story = {
  args: { mode: 'chat' },
};

export const Expanded: Story = {
  args: { mode: 'expanded', placeholder: 'Write a long, detailed prompt…' },
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { mode: 'chat', value: 'You cannot edit me', disabled: true },
};

export const Readonly: Story = {
  args: { mode: 'chat', value: 'Read-only but submittable via API', readonly: true },
};

export const DarkTheme: Story = {
  args: { mode: 'chat', className: 'dark-story' },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <div data-aic-theme="dark" style={{ minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
};

// ---------------------------------------------------------------------------
// Content: chips, attachments, initial value
// ---------------------------------------------------------------------------

export const WithMentionChips: Story = {
  args: {
    mode: 'chat',
    value: {
      nodes: [
        createTextNode('Ping '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' about the '),
        createMentionNode({ id: 'u3', label: 'Alan Turing' }),
        createTextNode(' review'),
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Interactions (play functions)
// ---------------------------------------------------------------------------

export const TypingAndSuggestionMenu: Story = {
  name: 'Interaction · typing & suggestion menu',
  render: () => <InteractiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, 'Hello @ad');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Ada Lovelace');
    // Accept with Enter
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('textbox').textContent).toContain('@Ada Lovelace'),
    );
  },
};

/** Demonstrates the mention flow end-to-end (type → menu → Enter → chip). */
export const MentionFlowInteraction: Story = {
  name: 'Interaction · mention flow',
  render: () => <InteractiveDemo />,
};

function InteractiveDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor());
  return <PromptEditor editor={editor} mode="chat" />;
}

/** Custom layout (Level 3) — the application owns the DOM. */
export const CustomTemplateSlots: Story = {
  name: 'Level 3 · custom template slots',
  render: () => <CustomLayoutDemo />,
};

function CustomLayoutDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Fully custom layout…' }));
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    return editor.on('change', (event) => {
      setLog((previous) => [
        `${new Date().toLocaleTimeString()} · ${event.source} · ${editor.serialize('text')}`,
        ...previous.slice(0, 4),
      ]);
    });
  }, [editor]);

  return (
    <PromptEditor editor={editor}>
      <PromptHeader>
        <strong>Context:</strong> PR #128 · review thread · 3 files
      </PromptHeader>

      <div className="aic-body" data-aic-slot="body">
        <PromptInput suggestions={false} />
        <PromptSuggestions
          renderItem={(item, active) => (
            <span>
              <strong>{item.label}</strong>
              {item.description && <em> — {item.description}</em>}
              {active ? ' ◀' : ''}
            </span>
          )}
        />
      </div>

      <PromptToolbar>
        <button type="button" onClick={() => void editor.executeCommand('undo')} aria-keyshortcuts="Meta+Z">
          ↺ Undo
        </button>
        <button
          type="button"
          onClick={() => void editor.executeCommand('submit')}
          style={{ background: '#16a34a' }}
        >
          Ship it
        </button>
      </PromptToolbar>

      <div className="aic-footer" data-aic-slot="footer">
        <code>{log[0] ?? 'start typing…'}</code>
      </div>
    </PromptEditor>
  );
}

/** Hook access for fully custom UI. */
export const HooksDemo: Story = {
  name: 'Hooks · usePromptState/usePromptCommand',
  render: () => <HooksPanel />,
};

function HooksPanel(): JSX.Element {
  const [editor] = useState(() => createDemoEditor());
  const state = usePromptState(editor);
  return (
    <div>
      <PromptEditor editor={editor} mode="chat" />
      <table className="aic-api-table">
        <tbody>
          <tr><td><code>state.empty</code></td><td>{String(state.empty)}</td></tr>
          <tr><td><code>state.canUndo</code></td><td>{String(state.canUndo)}</td></tr>
          <tr><td><code>state.suggestions.length</code></td><td>{state.suggestions.length}</td></tr>
          <tr><td><code>state.activeTrigger?.query</code></td><td>{state.activeTrigger?.query ?? '—'}</td></tr>
          <tr><td><code>state.mode</code></td><td>{state.mode}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

/** Controlled usage. */
export const Controlled: Story = {
  name: 'Controlled value',
  render: () => <ControlledDemo />,
};

function ControlledDemo(): JSX.Element {
  const [text, setText] = useState('Controlled value');
  return (
    <div>
      <PromptEditor
        mode="compact"
        value={text}
        onChange={(value) => setText(String(value.nodes.map((n) => (n.type === 'text' ? n.text : `[${n.type}]`)).join('')))}
      />
      <p>
        Parent state: <code>{text}</code>
      </p>
    </div>
  );
}
