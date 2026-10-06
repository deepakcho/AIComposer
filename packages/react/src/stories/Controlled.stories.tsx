/**
 * Controlled value & events — React state as the source of truth.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AIComposer } from '../index';

const meta: Meta<typeof AIComposer> = {
  component: AIComposer,
  tags: ['autodocs'],
  title: 'AI Composer/React/Controlled',
  parameters: {
    docs: {
      description: {
        component:
          '`value` + `onChange` form the controlled pattern (like a controlled input). The internal document is still authoritative for editing; the prop syncs on every change.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AIComposer>;

export const ControlledValue: Story = {
  render: () => <ControlledDemo />,
  parameters: {
    docs: {
      source: {
        code: `const [text, setText] = useState('Controlled value');

<AIComposer
  mode="compact"
  value={text}
  onChange={(doc) =>
    setText(doc.nodes.map((n) => (n.type === 'text' ? n.text : \`[\${n.type}]\`)).join(''))
  }
/>`,
      },
    },
  },
};

export const EventLog: Story = {
  name: 'Events · change / submit',
  render: () => <EventLogDemo />,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer
  mode="chat"
  onChange={(doc) => log('change', doc)}
  onSubmit={(doc) => log('submit', doc)}
/>`,
      },
      description: { story: 'Both callbacks wired to an on-page log.' },
    },
  },
};

function ControlledDemo(): JSX.Element {
  const [text, setText] = useState('Controlled value');
  return (
    <div>
      <AIComposer
        mode="compact"
        value={text}
        onChange={(value) =>
          setText(value.nodes.map((n) => (n.type === 'text' ? n.text : `[${n.type}]`)).join(''))
        }
      />
      <p>
        Parent state: <code>{text}</code>
      </p>
    </div>
  );
}

type LogEntry = { kind: string; text: string };

function EventLogDemo(): JSX.Element {
  const [log, setLog] = useState<LogEntry[]>([]);
  return (
    <div>
      <AIComposer
        mode="chat"
        onChange={(value) =>
          setLog((previous) => [
            { kind: 'change', text: value.nodes.map((n) => (n.type === 'text' ? n.text : `[${n.type}]`)).join('') },
            ...previous.slice(0, 4),
          ])
        }
        onSubmit={(value) =>
          setLog((previous) => [{ kind: 'submit', text: JSON.stringify(value) }, ...previous.slice(0, 4)])
        }
      />
      <ul style={{ fontSize: 13, color: '#555' }}>
        {log.map((entry, index) => (
          <li key={index}>
            <strong>{entry.kind}</strong> · <code>{entry.text}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
