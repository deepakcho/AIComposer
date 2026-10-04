# ADR-0006: Serialization formats

**Status:** accepted

## Decision

Five built-in formats behind `editor.serialize(format)`: `json` (lossless
document), `text` (chips as readable text), `markdown` (chips as links),
`html` (escaped, `data-aic-*` annotated — export only), `ai` (provider-neutral
payload: `{ text, entities, metadata }`).

All projections resolve through the **node registry** — a plugin's
`NodeDefinition.toText/toMarkdown/toHtml` overrides the built-in projection
for its nodes. New formats register via `registerSerializer({ format, serialize })`;
re-registering an id overrides.

## Consequences

- AI integration stays provider-neutral: the editor hands structured data,
  apps map to OpenAI/Anthropic/internal APIs.
- HTML is never trusted on input; parsing rules live in `@ai-composer/dom`
  (sanitize → registry-validated nodes or plain text).
- Round-trip guarantee: `json` → editor → `json` is stable (keys preserved).
