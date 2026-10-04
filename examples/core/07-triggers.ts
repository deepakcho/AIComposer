/**
 * 07 — Trigger system.
 *
 * Triggers react to characters typed before the caret (`@`, `/`, `#`, `$`,
 * ':' …), run a search, and manage the suggestion session in editor state.
 */

import {
  createPromptEditor,
  createPosition,
  createSelection,
  type SuggestionItem,
} from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';

const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
];

const editor = createPromptEditor({
  plugins: [mentionPlugin({ items: people, trigger: '@' })],
});

// -- the session lifecycle ------------------------------------------------

// Simulate typing "Ping @ad" as the DOM layer would report it:
function type(text: string): void {
  const current = editor.serialize('text') as string;
  editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: current + text }] });
  editor.setSelection(createSelection(createPosition(0, (current + text).length)));
}

type('Ping @ad');

// Trigger state is on the editor:
const state = editor.getState();
console.log(state.activeTrigger?.triggerId); // 'mention'
console.log(state.activeTrigger?.query); // 'ad'
console.log(state.suggestions.map((s) => s.label)); // ['Ada Lovelace']
console.log(state.activeSuggestionIndex); // 0

// -- selection inside the menu (what ArrowUp/ArrowDown do) ------------------

editor.moveSuggestionSelection(1); // -> -1 index if out of range; wraps otherwise
editor.moveSuggestionSelection(-1);

// -- accepting -----------------------------------------------------------

await editor.acceptSuggestion(); // accepts the highlighted item
// default behavior: the "@ad" run becomes a mention chip + trailing space
console.log(editor.serialize('text')); // "Ping @Ada Lovelace "

// accept a specific item programmatically:
type(' Ping @');
await editor.acceptSuggestion(people[1]);
console.log(editor.serialize('text')); // "Ping @Ada Lovelace  Ping @Grace Hopper "

// -- custom triggers (no plugin needed) --------------------------------------

const off = editor.registerTrigger({
  id: 'ticket',
  character: '#',
  type: 'custom', // produces CustomNode with plugin 'ticket'
  allowSpaces: false,
  allowMidWord: false,
  search: async ({ query, signal }) => {
    const response = await fetch(`/api/tickets?q=${encodeURIComponent(query)}`, { signal });
    const json = (await response.json()) as Array<{ key: string; title: string }>;
    return json.map((ticket) => ({
      id: ticket.key,
      label: ticket.title,
      data: { key: ticket.key }, // flows into CustomNode.data
    }));
  },
  // custom insert behavior (default: replace trigger run with a node):
  select: (item, context) => {
    context.editor.replaceRange(
      {
        start: createPosition(context.nodeIndex, context.triggerOffset),
        end: createPosition(context.nodeIndex, context.endOffset),
      },
      [{ type: 'custom', key: `t-${item.id}`, plugin: 'ticket', nodeType: 'ticket', data: item.data }],
      { trailingSpace: true },
    );
  },
});

// open programmatically (inserts the character at the caret):
await editor.executeCommand('openTrigger', 'ticket');

// close manually (what Escape does):
editor.closeTrigger('manual');

off(); // unregister
