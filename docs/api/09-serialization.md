# API · Serialization

**Concept** — every projection flows through the node registry, so plugins
control how their nodes serialize (ADR-0006).

```ts
editor.serialize('json');
editor.serialize('text');
editor.serialize('markdown');
editor.serialize('html');
editor.serialize('ai');
```

## Formats

| Format | Output | Use |
| --- | --- | --- |
| `json` | `PromptDocument` POJO | persistence, lossless round-trip |
| `text` | chips as readable text (`@Ada`) | previews, search |
| `markdown` | chips as links `[@Ada](mention:u1)` | export to MD pipelines |
| `html` | escaped, `data-aic-*` annotated | export only — **never** trusted on input |
| `ai` | `{ text, entities, metadata? }` | provider-neutral AI payloads |

## AI payload example

```ts
const payload = editor.serialize('ai') as AiPromptPayload;
// {
//   text: 'Summarize @Ada Lovelace spec.pdf',
//   entities: [
//     { type: 'mention', key: '…', id: 'u1', label: 'Ada Lovelace' },
//     { type: 'attachment', key: '…', id: 'file-1', name: 'spec.pdf' },
//   ],
//   metadata: { sessionId: 's-1' },   // from document.metadata
// }
await openai.chat.completions.create({ messages: [{ role: 'user', content: payload.text }] });
```

The editor never depends on an AI SDK — it hands structured data.

## Custom / override serializers

```ts
editor.registerSerializer({
  format: 'text',
  serialize: (doc) => doc.nodes.map((n) => (n.type === 'text' ? n.text : `[{n.type}]`)).join(''),
});
```

## Safety

- `html` escapes all user content (`<script>` can never survive).
- Parsed input (paste, `setValue`) is sanitized: unknown node types degrade to
  text; `script`/`style` subtrees are dropped entirely (see 12-dom-layer.md).

Runnable version: [examples/core/06-serialization.ts](../../examples/core/06-serialization.ts)
