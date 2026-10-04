# API · Document Model

**Concept** — the `PromptDocument` is the authoritative value of an editor:
a flat list of text runs and atomic chip nodes (ADR-0002). Documents are
treated as immutable; edit helpers return new documents.

```ts
import { createDocument, documentLength } from '@ai-composer/core';

const doc = createDocument();           // { nodes: [] }
documentLength(doc);                    // 0
```

## Node types

| Node | Shape | Model length |
| --- | --- | --- |
| `TextNode` | `{ type:'text', key, text }` | `text.length` |
| `MentionNode` | `{ type:'mention', key, id, label, metadata? }` | 1 |
| `CommandNode` | `{ type:'command', key, id, label, metadata? }` | 1 |
| `VariableNode` | `{ type:'variable', key, name, value? }` | 1 |
| `AttachmentNode` | `{ type:'attachment', key, id, name, mimeType, size?, metadata? }` | 1 |
| `CustomNode` | `{ type:'custom', key, plugin, nodeType, data }` | 1 |

`key` is a **stable instance id** (survives clones/undo/DOM round-trips).
Entity ids (`MentionNode.id`) reference the mentioned thing.

## Factories & guards

```ts
import {
  createTextNode, createMentionNode, createCommandNode,
  createVariableNode, createAttachmentNode, createCustomNode,
  ensureNodeKey, isTextNode, isAtomicNode, isPromptNode,
} from '@ai-composer/core';

const text = createTextNode('hello');                       // key auto-assigned
const ada  = createMentionNode({ id: 'u1', label: 'Ada' }); // "@Ada"
const handBuilt = ensureNodeKey({ type: 'text', text: 'x' } as never); // key backfilled
```

## Positions & offsets

```ts
import {
  createPosition, createSelection, toGlobalOffset, fromGlobalOffset,
  getRange, isCollapsed, clampSelection,
} from '@ai-composer/core';

const position = createPosition(1, 0);          // before node[1] (offset 0|1 for chips)
toGlobalOffset(doc, position);                  // document-wide character offset
fromGlobalOffset(doc, 11);                      // → Position
const selection = createSelection(anchorPos, focusPos);
isCollapsed(selection);                          // anchor === focus
getRange(selection);                             // { start, end } anchor-order independent
clampSelection(doc, selection);                  // bounds-safe copy
```

## Pure edit primitives

```ts
import { deleteDocumentRange, insertNodesAt } from '@ai-composer/core';

const removed = deleteDocumentRange(doc, { start, end }); // { document, caret }
const added   = insertNodesAt(doc, position, [ada]);      // { document, caret }
```

## Advanced

- `normalizeNodes()` merges adjacent text runs (used internally after edits).
- `sanitizeDocument(doc, isKnownType)` downgrades unknown node types to text —
  applied automatically on `setValue` and paste.
- `documentsEqual(a, b)` is **key-sensitive**: same content with different
  node identities is not equal (identity is part of the value).

**Framework note** — you rarely touch documents directly; adapters hand you
`state.value` (React/Vue/Angular) and accept documents back through
`value`/`v-model`/`writeValue`.

Runnable version: [examples/core/01-document-model.ts](../../examples/core/01-document-model.ts)
