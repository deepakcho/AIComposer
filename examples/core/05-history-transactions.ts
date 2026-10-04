/**
 * 05 — History & transactions.
 *
 * Snapshot-based undo/redo (ADR-0003). Rapid user edits merge into one step
 * within a 500 ms window; explicit transactions group programmatic edits.
 */

import {
  createPromptEditor,
  createMentionNode,
  createPosition,
  createSelection,
} from '@ai-composer/core';

const editor = createPromptEditor();

// -- basic undo/redo -------------------------------------------------------

editor.setValue('one');
editor.setValue('two');
editor.undo();
console.log(editor.serialize('text')); // "one"
editor.redo();
console.log(editor.serialize('text')); // "two"

console.log(editor.getState().canUndo); // true
console.log(editor.getState().canRedo); // false

// -- transactions: one undo step for many edits ------------------------------

editor.transaction(() => {
  editor.insertText('Hello ');
  editor.insertNode(createMentionNode({ id: 'u1', label: 'Ada' }));
  editor.insertText('!');
});
editor.undo(); // all three edits vanish together
console.log(editor.getState().empty); // true

// transactions can skip history entirely (external sync):
editor.transaction(
  () => {
    editor.setValue('mirror-of-server-state');
  },
  { history: false, label: 'external-sync' },
);

// -- user typing merges automatically ---------------------------------------

// The DOM layer reports edits via applyViewUpdate with source 'user';
// consecutive edits within mergeWindowMs collapse into a single undo step.
const text = editor.serialize('text') as string;
editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: `${text}a` }] });
editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: `${text}ab` }] });
editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: `${text}abc` }] });
editor.undo(); // back to before "abc" — ONE step, not three

// -- selection participates in snapshots --------------------------------------

editor.setValue('hello');
editor.setSelection(createSelection(createPosition(0, 2)));
editor.undo();
console.log(editor.serialize('text'), editor.getSelection().focus.offset); // restored text + caret

// -- tuning ----------------------------------------------------------------------

editor.configure({ history: { limit: 50, mergeWindowMs: 300 } });
