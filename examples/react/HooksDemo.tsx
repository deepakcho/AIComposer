/**
 * React — hooks for fully custom UI.
 */

import { useState } from 'react';
import { createPromptEditor } from '@ai-composer/core';
import {
  PromptEditor,
  usePromptState,
  usePromptSelection,
  usePromptSuggestions,
  usePromptCommand,
} from '@ai-composer/react';

export function HooksDemo(): JSX.Element {
  const [editor] = useState(() => createPromptEditor({ mode: 'chat' }));

  const state = usePromptState(editor); // full PromptEditorState
  const selection = usePromptSelection(editor); // SelectionState
  const suggestions = usePromptSuggestions(editor); // { items, activeIndex, open, accept, move, close }
  const run = usePromptCommand(editor); // (id, payload?) => Promise<void>

  return (
    <div>
      <PromptEditor editor={editor} />

      <dl>
        <dt>empty</dt>
        <dd>{String(state.empty)}</dd>
        <dt>caret offset</dt>
        <dd>{selection.focus.offset}</dd>
        <dt>canUndo / canRedo</dt>
        <dd>
          {String(state.canUndo)} / {String(state.canRedo)}
        </dd>
        <dt>open trigger</dt>
        <dd>
          {String(suggestions.open)} ({suggestions.items.length} items)
        </dd>
      </dl>

      <button type="button" onClick={() => void run('undo')}>
        Undo via command
      </button>
      {suggestions.open && (
        <button type="button" onClick={() => void suggestions.accept()}>
          Accept first suggestion
        </button>
      )}
    </div>
  );
}
