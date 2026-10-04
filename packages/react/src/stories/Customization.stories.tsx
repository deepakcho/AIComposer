/**
 * Customization — Level 3: the application owns the DOM. Slot components,
 * hooks, custom renderers.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptToolbar,
  usePromptState,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/React/Customization',
  parameters: {
    docs: {
      description: {
        component:
          'Level 3 usage: bring your own editor instance and compose slot components (`PromptHeader`, `PromptInput`, `PromptToolbar`, `PromptFooter`). The engine supplies behavior; the app owns the DOM.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

export const CustomLayout: Story = {
  name: 'Custom layout · slots',
  render: () => <CustomLayoutDemo />,
  parameters: {
    docs: {
      source: {
        code: `<PromptEditor editor={editor}>
  <PromptHeader><strong>Context:</strong> PR #128</PromptHeader>
  <div className="aic-body" data-aic-slot="body">
    <PromptInput />
  </div>
  <PromptToolbar>
    <button onClick={() => editor.executeCommand('undo')}>↺ Undo</button>
    <button onClick={() => editor.submit()}>Ship it</button>
  </PromptToolbar>
</PromptEditor>`,
      },
    },
  },
};

export const Hooks: Story = {
  name: 'Hooks · usePromptState',
  render: () => <HooksPanel />,
  parameters: {
    docs: {
      source: {
        code: `const state = usePromptState(editor);
// state.empty · state.canUndo · state.suggestions · state.mode …`,
      },
      description: { story: 'Any state field, reactively — live table next to the editor.' },
    },
  },
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
        <PromptInput />
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
