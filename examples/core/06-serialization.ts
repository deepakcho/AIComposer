/**
 * 06 — Serialization.
 *
 * Built-in formats: json | text | markdown | html | ai. All projections flow
 * through the node registry, so plugins control how custom nodes serialize.
 */

import { createPromptEditor, createMentionNode, createAttachmentNode, createTextNode } from '@ai-composer/core';

const editor = createPromptEditor({
  value: [
    createTextNode('Summarize '),
    createMentionNode({ id: 'user-42', label: 'Ada Lovelace' }),
    createAttachmentNode({ id: 'file-1', name: 'spec.pdf', mimeType: 'application/pdf', size: 1024 }),
  ],
});

// -- JSON: lossless round-trip ------------------------------------------------

const json = editor.serialize('json'); // PromptDocument POJO
const restored = createPromptEditor({ value: json as never });
console.log(restored.serialize('text') === editor.serialize('text')); // true

// -- plain text ------------------------------------------------------------

console.log(editor.serialize('text'));
// "Summarize @Ada Lovelace spec.pdf"

// -- markdown ----------------------------------------------------------------

console.log(editor.serialize('markdown'));
// "Summarize [@Ada Lovelace](mention:user-42) [spec.pdf](attachment:file-1)"

// -- safe HTML ----------------------------------------------------------------

// Text is escaped; chips carry data-aic-* attributes. This is an EXPORT
// format — never feed untrusted HTML back without parsing rules.
console.log(editor.serialize('html'));
// <div data-aic-document>Summarize <span data-aic-node="mention" ...>...</span>...</div>

const unsafe = createPromptEditor({ value: '<script>alert(1)</script>' });
console.log((unsafe.serialize('html') as string).includes('<script>')); // false

// -- AI payload: provider-neutral ---------------------------------------------

const ai = editor.serialize('ai') as {
  text: string;
  entities: Array<{ type: string; id?: string }>;
  metadata?: Record<string, unknown>;
};
console.log(ai.text); // "Summarize @Ada Lovelace spec.pdf"
console.log(ai.entities); // [{ type: 'mention', ... }, { type: 'attachment', ... }]

// metadata set on the document flows into the payload:
editor.setValue({ nodes: editor.getValue().nodes, metadata: { sessionId: 's-1' } });

// -- custom serializer / override ----------------------------------------------

editor.registerSerializer({
  format: 'text',
  serialize: (doc) => doc.nodes.map((n) => (n.type === 'text' ? n.text : `[${n.type}]`)).join(''),
});

console.log(editor.serialize('text')); // "Summarize [mention][attachment]"
