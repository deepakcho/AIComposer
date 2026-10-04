/**
 * 09 — Custom nodes.
 *
 * A custom node is a `CustomNode` in the document plus a NodeDefinition that
 * controls serialization and display. Framework adapters render it as a chip
 * using `toDisplay` (or framework-specific renderers — see the adapter docs).
 */

import {
  createPromptEditor,
  type NodeDefinition,
  type PromptPlugin,
} from '@ai-composer/core';

// -- the node definition ----------------------------------------------------

const ticketNode: NodeDefinition = {
  type: 'ticket',
  plugin: 'tickets',
  isAtomic: true,
  // plain text projection (a11y announcements, text serialization)
  toText: (node) => `#${(node as { data: { key: string } }).data.key}`,
  // markdown projection
  toMarkdown: (node) => {
    const data = (node as { data: { key: string; title: string } }).data;
    return `[#${data.key}: ${data.title}](ticket:${data.key})`;
  },
  // safe HTML projection (must escape user data)
  toHtml: (node) => {
    const data = (node as { data: { key: string; title: string } }).data;
    return `<span data-aic-node="custom" data-aic-plugin="tickets" data-aic-type="ticket">#${data.key}</span>`;
  },
  // chip label in the DOM layer
  toDisplay: (node) => `#${(node as { data: { key: string } }).data.key}`,
};

// -- a plugin contributing the node + a trigger producing it ------------------

const ticketsPlugin: PromptPlugin = {
  name: 'tickets',
  nodeTypes: [ticketNode],
  triggers: [
    {
      id: 'tickets',
      character: '#',
      type: 'ticket', // default select wraps the item into a CustomNode
      search: async ({ query }) => {
        const tickets = await searchTickets(query);
        return tickets.map((t) => ({
          id: t.key,
          label: t.title,
          data: t, // stored on CustomNode.data
        }));
      },
    },
  ],
};

// -- usage -------------------------------------------------------------------

const editor = createPromptEditor({ plugins: [ticketsPlugin] });

// insert one programmatically (keys are assigned automatically when omitted):
editor.insertNode({
  type: 'custom',
  key: 'ticket-1',
  plugin: 'tickets',
  nodeType: 'ticket',
  data: { key: 'AIC-77', title: 'Prompt editor v1' },
});

console.log(editor.serialize('text')); // "#AIC-77 "
console.log(editor.serialize('markdown')); // "[#AIC-77: Prompt editor v1](ticket:AIC-77) "

// The DOM layer renders a non-editable chip:
//   <span contenteditable="false" data-aic-node="custom" data-aic-plugin="tickets"
//         data-aic-type="ticket" data-aic-data="…">#AIC-77</span>
// and parses it back on the next read — the round-trip is lossless and
// sanitized (unknown types degrade to plain text, never to raw HTML).

async function searchTickets(query: string): Promise<Array<{ key: string; title: string }>> {
  return [{ key: `AIC-${query || '1'}`, title: 'Found ticket' }];
}
