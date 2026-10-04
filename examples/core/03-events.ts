/**
 * 03 — Event system.
 *
 * One typed event contract shared by every adapter. on() returns an
 * unsubscribe function; core has no framework emitters.
 */

import { createPromptEditor, type PromptEditorEventType } from '@ai-composer/core';

const editor = createPromptEditor({ value: 'hello' });

// -- value events ------------------------------------------------------------

const offChange = editor.on('change', (event) => {
  console.log(event.source); // 'user' | 'api' | 'plugin' | 'undo' | 'redo'
  console.log(event.value); // PromptDocument
});
editor.on('input', (event) => {
  // like 'change' but only for user-originated edits (typing, paste)
  void event;
});

// -- submit events ----------------------------------------------------------

editor.on('beforeSubmit', (event) => {
  if (isEmpty(event.value)) event.preventDefault(); // cancel the submission
});
editor.on('submit', (event) => {
  console.log('sent', event.value);
});

// -- trigger / suggestion events -----------------------------------------------

editor.on('triggerOpen', ({ triggerId, query }) => console.log(triggerId, query));
editor.on('triggerClose', ({ triggerId, reason }) => console.log(triggerId, reason));
editor.on('suggestionsChange', ({ suggestions, activeIndex }) => {
  console.log(suggestions.length, activeIndex);
});

// -- node + attachment events ----------------------------------------------------

editor.on('nodeInsert', ({ node, index }) => console.log(node.type, index));
editor.on('nodeRemove', ({ node }) => void node);
editor.on('attachmentAdd', ({ attachment }) => console.log(attachment.name));
editor.on('attachmentRemove', ({ attachment }) => void attachment);

// -- focus / selection / mode ---------------------------------------------------

editor.on('focus', () => console.log('focused'));
editor.on('blur', () => console.log('blurred'));
editor.on('selectionChange', ({ selection }) => console.log(selection));
editor.on('modeChange', ({ mode }) => console.log(mode));

// -- commands / errors / destroy -----------------------------------------------

editor.on('commandExecute', ({ id, payload }) => console.log(id, payload));
editor.on('error', ({ error, phase }) => console.error(phase, error));
editor.on('destroy', () => console.log('goodbye'));

// -- lifecycle of subscriptions ---------------------------------------------

offChange(); // unsubscribe a single handler
editor.once('change', () => console.log('fires exactly once'));

// The event names are a closed union:
const name: PromptEditorEventType = 'beforeSubmit';

// fire a full round
editor.insertText(' world');
void editor.submit();
editor.destroy();
void name;

function isEmpty(value: { nodes: unknown[] }): boolean {
  return value.nodes.length === 0;
}
