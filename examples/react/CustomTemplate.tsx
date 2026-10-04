/**
 * React — Level 3: the application owns the entire layout.
 * The engine supplies behavior + state; you supply the DOM.
 */

import { useEffect, useState } from 'react';
import { createPromptEditor } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
} from '@ai-composer/react';

export function CustomTemplate(): JSX.Element {
  const [editor] = useState(() =>
    createPromptEditor({
      placeholder: 'Fully custom layout…',
      plugins: [mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace' }] })],
    }),
  );
  const [log, setLog] = useState<string[]>([]);

  useEffect(
    () =>
      editor.on('change', (event) => {
        setLog((prev) => [`${event.source}: ${editor.serialize('text')}`, ...prev].slice(0, 5));
      }),
    [editor],
  );

  return (
    <PromptEditor editor={editor}>
      {/* any header you want */}
      <PromptHeader>
        <strong>Context:</strong> PR #128 · 3 files changed
      </PromptHeader>

      {/* body: input + custom suggestion renderer (PromptInput's built-in
          list is disabled so ours takes over) */}
      <div className="aic-body" data-aic-slot="body">
        <PromptInput suggestions={false} />
        <PromptSuggestions
          renderItem={(item, active) => (
            <span>
              <img alt="" src={`/avatars/${item.id}.png`} width={18} height={18} />
              {item.label}
              {active ? ' ←' : ''}
            </span>
          )}
        />
      </div>

      {/* toolbar: your buttons, engine commands */}
      <PromptToolbar>
        <button type="button" onClick={() => void editor.executeCommand('undo')}>
          Undo
        </button>
        <button type="button" onClick={() => void editor.executeCommand('submit')}>
          Send
        </button>
      </PromptToolbar>

      <div className="aic-footer" data-aic-slot="footer">
        {log[0] ?? 'start typing…'}
      </div>
    </PromptEditor>
  );
}
