# ADR-0007: Styling strategy — tokens, headless core, optional UI

**Status:** accepted

## Decision

- `@ai-composer/core` ships **no styles**; `@ai-composer/dom` emits semantic
  structure (`data-aic-*` attributes, stable class names) with zero required CSS.
- `@ai-composer/themes` provides `--aic-*` design tokens plus default/dark/
  compact layers; all visuals derive from tokens.
- `@ai-composer/ui` is an optional convenience wrapper.
- Applications can use Tailwind/Material/custom design systems by styling the
  emitted structure directly.

## Consequences

- No mandatory CSS framework; tree-shakeable styling.
- Themes compose by token overrides at any layer
  (tokens → default → mode → app → component).
- A11y rules (reduced motion, high contrast) ship with the default theme and
  are pure token/consumers-side concerns.
