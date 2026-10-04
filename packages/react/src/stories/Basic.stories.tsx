/**
 * Basic usage — zero-config editor, initial values, submit handling.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import { PromptEditor } from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/React/Basic',
  parameters: {
    docs: {
      description: {
        component:
          'The zero-config path (Level 1): drop `<PromptEditor>` in and you get the editable surface, caret-anchored suggestion popups, undo/redo and submit. Everything below is one prop away.',
      },
    },
  },
  args: { mode: 'chat', placeholder: 'Ask anything…' },
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: "<PromptEditor mode=\"chat\" placeholder=\"Ask anything…\" />" },
      description: { story: 'Zero configuration. Enter submits, Shift+Enter adds a newline, the box auto-grows with content.' },
    },
  },
};

export const InitialValue: Story = {
  args: {
    value: {
      nodes: [
        createTextNode('Ping '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' about the release'),
      ],
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<PromptEditor
  mode="chat"
  value={{
    nodes: [
      createTextNode('Ping '),
      createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
      createTextNode(' about the release'),
    ],
  }}
/>`,
      },
      description: { story: 'Seed the composer with a document — mention chips render immediately.' },
    },
  },
};

export const SubmitFlow: Story = {
  name: 'Submit · onSubmit + clearing',
  render: () => <SubmitDemo />,
  parameters: {
    docs: {
      source: {
        code: `function SubmitDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [editor] = useState(() => createDemoEditor({
    submit: { clearOnSubmit: true, onSubmit: (v) => setLog((l) => [editor.serialize('text'), ...l]) },
  }));
  return (
    <>
      <PromptEditor editor={editor} mode="chat" />
      <pre>{log.join('\\n') || 'press Enter…'}</pre>
    </>
  );
}`,
      },
      description: { story: 'Enter submits, clears the draft (Copilot behaviour) and logs the serialized value.' },
    },
  },
};

function SubmitDemo(): JSX.Element {
  const [log, setLog] = useState<string[]>([]);
  const [editor] = useState(() =>
    createDemoEditor({
      submit: {
        clearOnSubmit: true,
        onSubmit: () => setLog((previous) => [editor.serialize('text'), ...previous.slice(0, 4)]),
      },
    }),
  );
  return (
    <div>
      <PromptEditor editor={editor} mode="chat" />
      <pre
        style={{
          background: '#f6f7f9',
          padding: 12,
          borderRadius: 8,
          fontSize: 13,
          margin: '12px 0 0',
        }}
      >
        {log.join('\n') || 'press Enter…'}
      </pre>
    </div>
  );
}
