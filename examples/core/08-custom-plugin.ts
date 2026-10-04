/**
 * 08 — Custom plugin (the full contract).
 *
 * Plugins are plain objects with declarative contributions (commands,
 * triggers, node types, serializers) plus an optional setup() for imperative
 * wiring. They receive a SCOPED context — never raw editor internals
 * (ADR-0004).
 */

import {
  createPromptEditor,
  createVariableNode,
  type PromptPlugin,
} from '@ai-composer/core';

// -- a plugin that adds :variables ------------------------------------------

const variablesPlugin = (variables: Array<{ name: string; value: string }>): PromptPlugin => ({
  name: 'variables',
  version: '1.0.0',

  // declarative contributions ------------------------------------------------
  triggers: [
    {
      id: 'variables',
      character: ':',
      type: 'variable', // default select inserts a VariableNode
      search: ({ query }) =>
        variables
          .filter((v) => v.name.startsWith(query))
          .map((v) => ({ id: v.name, label: v.name, data: { value: v.value } })),
    },
  ],
  commands: [
    {
      id: 'variables.insert',
      label: 'Insert variable',
      execute: ({ editor, payload }) => {
        const name = typeof payload === 'string' ? payload : 'today';
        editor.insertNode(createVariableNode({ name }));
      },
    },
  ],
  // nodeTypes: [...]       — register custom node definitions (see 09)
  // serializers: [...]     — add/override serialization formats

  // imperative wiring -------------------------------------------------------
  setup(context) {
    // scoped capabilities:
    //   context.editor     — full public editor API
    //   context.getConfig() — live config
    //   context.commands / triggers / nodes / serializers — registries
    //   context.events     — on/once/off (no emit: listeners only)
    //   context.onCleanup  — register teardown

    const offChange = context.events.on('change', () => {
      const count = context.editor.getValue().nodes.filter((n) => n.type === 'variable').length;
      console.log(`[variables] document now has ${count} variables`);
    });

    context.onCleanup(offChange); // auto-removed with the plugin
  },

  destroy() {
    console.log('[variables] plugin destroyed');
  },
});

// -- install ----------------------------------------------------------------

const editor = createPromptEditor({
  plugins: [variablesPlugin([{ name: 'today', value: '2026-10-04' }])],
});

// at runtime (returns an unsubscribe):
const off = editor.registerPlugin(variablesPlugin([]));
console.log(editor.triggers.get('variables')?.character); // ':'
off();

// plugins are removed cleanly on destroy:
editor.destroy();
