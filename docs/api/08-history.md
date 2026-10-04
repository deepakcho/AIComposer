# API · History & Transactions

**Concept** — snapshot undo/redo (ADR-0003). Documents are immutable, so
snapshots are references. Selection is part of every snapshot.

```ts
editor.setValue('one');
editor.setValue('two');
editor.undo();                          // → "one"
editor.redo();                          // → "two"
editor.getState().canUndo;              // true
```

## Transactions — many edits, one step

```ts
editor.transaction(() => {
  editor.insertText('Hello ');
  editor.insertNode(mentionNode);
  editor.insertText('!');
});
editor.undo(); // all three edits revert together
```

Options: `transaction(fn, { label?: string; history?: boolean; source?: ChangeSource })`.
Nested transactions join the outer one.

## Typing merges automatically

User edits (reported by the DOM layer with source `user`) merge into one undo
step within `mergeWindowMs` (default 500 ms) — typing "hello" undoes as one
step. Programmatic edits never merge.

## Skipping history

```ts
editor.setValue(serverState, { history: false }); // external sync, no step
editor.transaction(fn, { history: false });
```

## Tuning

```ts
createPromptEditor({ history: { limit: 500, mergeWindowMs: 300 } });
editor.configure({ history: { limit: 100 } });
```

Keyboard `⌘/Ctrl+Z`, `⌘/Ctrl+Shift+Z`, `Ctrl+Y` are wired by the DOM surface.

Runnable version: [examples/core/05-history-transactions.ts](../../examples/core/05-history-transactions.ts)
