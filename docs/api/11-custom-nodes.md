# API · Custom Nodes

**Concept** — a custom node is a `CustomNode` in the document plus a
`NodeDefinition` controlling text/markdown/HTML projections and chip display.
Adapters render it as a non-editable chip; the DOM layer round-trips it
losslessly via `data-aic-*` attributes.

```ts
import { createPromptEditor, type NodeDefinition, type PromptPlugin } from '@ai-composer/core';

const ticketNode: NodeDefinition = {
  type: 'ticket',
  plugin: 'tickets',
  isAtomic: true,
  toText:      (n) => `#${(n as { data: { key: string } }).data.key}`,
  toMarkdown:  (n) => `[#${(n as { data: { key: string } }).data.key}](ticket)`,
  toHtml:      (n) => `<span data-aic-node="custom" data-aic-type="ticket">#…</span>`, // escape!
  toDisplay:   (n) => `#${(n as { data: { key: string } }).data.key}`,  // chip label
};

const ticketsPlugin: PromptPlugin = {
  name: 'tickets',
  nodeTypes: [ticketNode],
  triggers: [{
    id: 'tickets',
    character: '#',
    type: 'ticket',                    // wraps suggestions into CustomNode
    search: async ({ query }) => (await api(query)).map(/* … */),
  }],
};
```

## Round-trip

The DOM chip carries `data-aic-key / data-aic-plugin / data-aic-type /
data-aic-data` (JSON). Parsing validates the type against the registry —
unknown types **degrade to plain text**, never to markup (XSS-safe).

## Advanced — override built-in projections

Re-registering a type replaces its definition (last wins):

```ts
editor.registerNodeType({
  ...MENTION_NODE_DEFINITION,
  toText: (node) => node.type === 'mention' ? `@${node.label}` : '',
});
```

Framework-specific rendering (icons, avatars inside chips) uses
`state.value` + your component tree over `toDisplay` — the DOM chip is the
zero-config baseline, not the ceiling.

Runnable version: [examples/core/09-custom-node.ts](../../examples/core/09-custom-node.ts)
