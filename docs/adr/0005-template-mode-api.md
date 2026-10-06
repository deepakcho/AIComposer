# ADR-0005: Template & mode API

**Status:** accepted

## Context

Modes (compact/chat/expanded) could be separate implementations or presets.
Templates could be imperative renderers or structural descriptions.

## Decision

**Modes are presets, not implementations.** A `AIComposerDomTemplate` is data:
`{ name, slots: TemplateSlotName[], multiline, submitKey?, toolbarButtons? }`.
Built-ins: compact / default / chat / expanded; `registerTemplate()` adds more.
The default mount (`mountAIComposer`) builds DOM from a template; adapters
use templates as guidance for their own layout and are free to ignore them
entirely (Level-3 customization).

## Consequences

- New modes (e.g. "enterprise") are registrations, not forks.
- Nothing in core branches on mode names; behavior differences live in
  config (`submitKey`) and templates.
- Adapters that fully own layout still work — templates are a convenience,
  never a constraint.
