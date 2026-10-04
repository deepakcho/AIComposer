/**
 * Modes — compact pill, chat box, expanded canvas. Presets, not separate
 * components: one editor instance can switch modes live.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createAttachmentNode, createTextNode } from '@ai-composer/core';
import { createPromptEditor } from '@ai-composer/core';
import { PromptEditor } from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/React/Modes',
  parameters: {
    docs: {
      description: {
        component:
          '`mode` is a structural preset: **compact** is a single-line search pill, **chat** is the Copilot-style auto-growing box with a circular send button, **expanded** is a tall writing canvas with the full toolbar. Switching modes keeps the draft, selection and undo history.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

export const Compact: Story = {
  args: { mode: 'compact', placeholder: 'Search or ask…' },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="compact" placeholder="Search or ask…" />' },
      description: { story: 'Inline pill while single-line. Wrapped or multiline content is detected (`data-aic-multiline`) — the pill morphs into a rounded box, auto-grows up to the cap, then scrolls. Never clips text.' },
    },
  },
};

export const MaxHeight: Story = {
  name: 'Max height · custom cap',
  args: { mode: 'chat', maxHeight: 96, placeholder: 'Type several lines — the box stops at 96px and scrolls…' },
  parameters: {
    docs: {
      source: {
        code: `<!-- prop (px or any CSS length) -->
<PromptEditor mode="chat" maxHeight={96} />

<!-- or the underlying token, from anywhere -->
<div style="--aic-input-max-height: 40vh">
  <PromptEditor mode="chat" />
</div>`,
      },
      description: { story: 'The box auto-grows with content up to the ceiling, then scrolls inside. Defaults per mode: compact 120px · chat 200px (viewport-aware) · expanded 60vh.' },
    },
  },
};

export const CompactWithAttachments: Story = {
  name: 'Compact · attachments project through',
  render: () => <CompactAttachmentsDemo />,
  parameters: {
    docs: {
      source: {
        code: `const [editor] = useState(() =>
  createPromptEditor({
    mode: 'compact',
    value: {
      nodes: [
        createAttachmentNode({ name: 'screenshot.png' }),
        createTextNode(' this look right?'),
      ],
    },
  }),
);
<PromptEditor editor={editor} mode="compact" />`,
      },
      description: { story: 'Attachment chips (and header/footer/toolbar slots) are projectable in every mode — presets shape defaults, never forbid content.' },
    },
  },
};

function CompactAttachmentsDemo(): JSX.Element {
  const [editor] = useState(() =>
    createPromptEditor({
      mode: 'compact',
      placeholder: 'Search or ask…',
      value: {
        nodes: [createAttachmentNode({ name: 'screenshot.png' }), createTextNode(' does this look right?')],
      },
    }),
  );
  return <PromptEditor editor={editor} mode="compact" />;
}

export const Chat: Story = {
  args: { mode: 'chat', placeholder: 'Ask anything…' },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="chat" placeholder="Ask anything…" />' },
      description: { story: 'Auto-growing box (28px → 200px), then scrolls inside. Circular send button.' },
    },
  },
};

export const Expanded: Story = {
  args: { mode: 'expanded', placeholder: 'Write a long, detailed prompt…' },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="expanded" placeholder="Write a long, detailed prompt…" />' },
      description: { story: 'Tall canvas with undo/redo/send toolbar. Enter adds a newline; Shift+Enter submits.' },
    },
  },
};

export const LiveSwitch: Story = {
  name: 'Live mode switching',
  render: () => <ModeSwitchDemo />,
  parameters: {
    docs: {
      source: {
        code: `const [editor] = useState(() => createDemoEditor());
const [mode, setMode] = useState<'compact' | 'chat' | 'expanded'>('chat');

<PromptEditor editor={editor} mode={mode} placeholder="Draft survives switching…" />
{(['compact', 'chat', 'expanded'] as const).map((m) => (
  <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>
))}`,
      },
      description: { story: 'The same editor instance morphs between modes — text, focus and undo history survive.' },
    },
  },
};

function ModeSwitchDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Draft survives switching…' }));
  const [mode, setMode] = useState<'compact' | 'chat' | 'expanded'>('chat');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['compact', 'chat', 'expanded'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              border: mode === m ? '1px solid #6366f1' : '1px solid #d1d5db',
              background: mode === m ? '#eef2ff' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <PromptEditor editor={editor} mode={mode} />
    </div>
  );
}
