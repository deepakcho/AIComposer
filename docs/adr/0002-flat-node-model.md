# ADR-0002: Flat node list with stable instance keys

**Status:** accepted

## Context

Rich editors usually use trees (blocks → inlines). An AI composer is one
flowing paragraph with inline chips; a tree adds mapping complexity without
product value at this stage.

## Decision

`AIComposerDocument = { nodes: AIComposerNode[], metadata? }` — a **flat list** of
text runs and atomic chip nodes (mention/command/variable/attachment/custom).
Atomic nodes have model length 1. Every node carries a stable instance `key`
(assigned by factories) distinct from entity ids (e.g. `MentionNode.id`).

## Consequences

- Selection is `(nodeIndex, offset)` pairs convertible to global offsets —
  simple, serializable, DOM-mappable.
- Keys enable React/Vue keys, DOM↔model round-trips and stable history.
- Multi-block support (headings, lists) would require a v2 model; the flat
  list is explicitly a **single-flow editing** decision, revisit when block editing
  becomes a requirement.
- Documents are immutable in practice: edits return new node arrays; history
  stores references, no cloning.
