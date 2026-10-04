/**
 * 02 — Creating an editor.
 *
 * createPromptEditor() is the single factory for the framework-independent
 * engine. Everything an adapter does is mount THIS object.
 */

import {
  createPromptEditor,
  isPromptEditor,
  type PromptEditor,
} from '@ai-composer/core';

// -- minimal ---------------------------------------------------------------

const minimal = createPromptEditor();
console.log(minimal.getState().empty); // true

// -- configured ------------------------------------------------------------

const editor = createPromptEditor({
  mode: 'chat', // presentation preset: compact | default | chat | expanded
  placeholder: 'Ask anything…',
  value: 'Initial text', // string | PromptNode[] | PromptDocument
  disabled: false,
  readonly: false,
  submitKey: 'enter', // 'enter' | 'shift-enter' | 'none'
  history: { limit: 200, mergeWindowMs: 500 },
  submit: {
    onSubmit: async (value, ed) => {
      await sendToAI(ed.serialize('ai'), value);
    },
    clearOnSubmit: true,
    allowEmpty: false,
  },
  plugins: [
    // plugins go here — see 08-custom-plugin.ts and @ai-composer/plugin-mention
  ],
});

// -- value lifecycle -------------------------------------------------------

editor.setValue('replace everything'); // records an undo step
editor.setValue('no history', { history: false }); // external sync, no undo step
editor.getValue(); // PromptDocument (the live reference — treat as immutable)
editor.insertText('typed by the app');
editor.clear();

// -- runtime config ----------------------------------------------------------

editor.configure({ placeholder: 'New placeholder', mode: 'expanded' });
editor.setMode('chat');
editor.setDisabled(true);
editor.setReadonly(true);

// -- teardown ----------------------------------------------------------------

editor.destroy(); // emits 'destroy', cleans plugins + listeners
console.log(isPromptEditor(editor)); // true (identity survives destroy)

async function sendToAI(_payload: unknown, _value: unknown): Promise<void> {
  /* your provider call — core never depends on an AI SDK */
}

export { minimal, editor };
export type { PromptEditor };
