# ADR-0003: Snapshot history with merge window

**Status:** accepted

## Context

Undo/redo can be operational (inverse commands) or snapshot-based. Composer
documents are small; correctness and debuggability beat algorithmic elegance.

## Decision

Snapshot history. The undo stack stores **previous** states; the redo stack
stores forward states. Documents are immutable, so snapshots are references —
no deep copies.

- `record(previous, { label, merge })`: same-label user edits within
  `mergeWindowMs` (default 500 ms) collapse into one undo step.
- `transaction(fn)` groups any edits into exactly one step.
- `setValue(value, { history: false })` for external sync (no step).
- Selection is part of the snapshot (caret restores on undo).

## Consequences

- Trivially correct for chips, custom nodes, plugin mutations.
- Memory is bounded by `limit` (default 200) × document size — fine for typical composer
  scale; large documents may want a diffing store later.
- Typing "hello" undoes as one step (feels right), explicit transactions give
  plugins deterministic grouping.
