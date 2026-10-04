# API · Triggers & Suggestions

**Concept** — trigger characters (`@`, `/`, `#`, `$`, `:`…) typed before the
caret open a suggestion session. The engine scans text, runs the trigger's
`search`, stores results in state, and replaces the trigger run with a node on
accept.

## Defining a trigger

```ts
import { registerTrigger via editor or plugin } from '@ai-composer/core';

const off = editor.registerTrigger({
  id: 'mention',
  character: '@',            // single character, required
  type: 'mention',           // node produced by default select
  allowSpaces: false,        // query dies on whitespace
  allowMidWord: false,       // "user@x" does NOT trigger
  search: async ({ query, document, selection, signal }) => {
    const response = await fetch(`/api/users?q=${query}`, { signal });
    const users = await response.json();
    return users.map((u: { id: string; name: string }) => ({ id: u.id, label: u.name }));
  },
  // optional custom insertion (default: replace run with node + trailing space)
  select: (item, context) => {
    context.editor.replaceRange(
      {
        start: { nodeIndex: context.nodeIndex, offset: context.triggerOffset },
        end:   { nodeIndex: context.nodeIndex, offset: context.endOffset },
      },
      [/* nodes */],
      { trailingSpace: true },
    );
  },
});
```

## Session state

```ts
const state = editor.getState();
state.activeTrigger;          // { triggerId, query, nodeIndex, triggerOffset, endOffset } | null
state.suggestions;            // SuggestionItem[]
state.activeSuggestionIndex;  // highlighted row
```

## Driving the session

```ts
editor.moveSuggestionSelection(1);      // ArrowDown (wraps; -1 goes up)
await editor.acceptSuggestion(item?);   // Enter/Tab/click — item defaults to highlighted
editor.closeTrigger('manual');          // Escape
editor.openTrigger('mention');          // programmatic: inserts '@' at caret
await editor.executeCommand('openTrigger', 'mention'); // via command
```

## Default node mapping

`type: 'mention' | 'command' | 'variable'` produce those node types from
`{ id, label, data }`; any other `type` produces a `CustomNode`
(`{ plugin: trigger.id, nodeType: type, data: item.data ?? { id, label } }`).

## Keyboard (wired by the DOM layer)

`↑/↓` move · `Enter`/`Tab` accept · `Esc` closes — available in every adapter
because it lives in the engine + DOM surface, not in per-framework code.

Runnable version: [examples/core/07-triggers.ts](../../examples/core/07-triggers.ts)
