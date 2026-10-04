import { useState } from 'react';
import { createPromptEditor } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
} from '@ai-composer/react';
import { Level1, Level2, ControlledDemo } from './demos';

export const people = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
  { id: 'u3', label: 'Alan Turing', description: 'Research' },
];

const tabs = ['Level 1 · zero config', 'Level 2 · configured', 'Level 3 · custom layout', 'Controlled'] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  return (
    <main>
      <h1>AI Composer · React</h1>
      <nav>
        {tabs.map((name) => (
          <button key={name} className={name === tab ? 'active' : ''} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </nav>

      {tab === tabs[0] && <Level1 />}
      {tab === tabs[1] && <Level2 />}
      {tab === tabs[2] && <CustomLayoutDemo />}
      {tab === tabs[3] && <ControlledDemo />}
    </main>
  );
}

/** Level 3: the application owns the entire layout via slots. */
function CustomLayoutDemo() {
  const [editor] = useState(() =>
    createPromptEditor({
      plugins: [mentionPlugin({ items: people }), commandPlugin({ commands: [{ id: 'summarize', label: 'Summarize' }] })],
      placeholder: 'Custom layout…',
    }),
  );

  return (
    <PromptEditor editor={editor}>
      <PromptHeader>
        <strong>Context:</strong> PR #128 · review-thread
      </PromptHeader>

      <div className="aic-body" data-aic-slot="body">
        <PromptInput suggestions={false} />
        <PromptSuggestions />
      </div>

      <PromptToolbar>
        <button type="button" onClick={() => void editor.executeCommand('undo')}>
          ↺
        </button>
        <button type="button" onClick={() => void editor.executeCommand('redo')}>
          ↻
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => void editor.executeCommand('submit')}
        >
          Ship it
        </button>
      </PromptToolbar>
    </PromptEditor>
  );
}
