/**
 * 04 — Command system.
 *
 * Commands are UI-independent named operations. Toolbars and keyboard
 * shortcuts bind to ids — never to implementation functions.
 */

import { createPromptEditor, BUILTIN_COMMANDS } from '@ai-composer/core';

const editor = createPromptEditor({ value: 'hello' });

// -- built-in commands --------------------------------------------------------

await editor.executeCommand(BUILTIN_COMMANDS.clear); // editor.clear()
await editor.executeCommand(BUILTIN_COMMANDS.insertText, { text: 'world', at: undefined });
await editor.executeCommand(BUILTIN_COMMANDS.insertNode, {
  node: { type: 'mention', key: 'm1', id: 'u1', label: 'Ada' },
});
await editor.executeCommand(BUILTIN_COMMANDS.undo);
await editor.executeCommand(BUILTIN_COMMANDS.redo);
await editor.executeCommand(BUILTIN_COMMANDS.focus);
await editor.executeCommand(BUILTIN_COMMANDS.submit);

// canExecute gates: 'submit' is blocked while disabled/readonly/submitting
console.log(editor.canExecuteCommand('submit')); // true

// -- custom commands ----------------------------------------------------------

const off = editor.registerCommand({
  id: 'app.wrap-selection',
  label: 'Wrap selection',
  canExecute: ({ state }) => !state.empty,
  execute: ({ editor: target }) => {
    const text = target.serialize('text') as string;
    target.setValue(`«${text}»`);
  },
});

await editor.executeCommand('app.wrap-selection');

// -- command events -------------------------------------------------------------

editor.on('commandExecute', ({ id, payload }) => {
  console.log('telemetry:', id, payload);
});

off(); // unregister
