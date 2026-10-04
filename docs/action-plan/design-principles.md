# Design Principles

The binding rules for everything in this repo. When a change conflicts with a
rule, the change loses — or the rule gets amended via a new ADR.

## 1. Layering & dependency direction

```
core  →  (no deps, not even DOM)
dom   →  core
plugin→  core
adapter(react/angular/vue/web-component/ui) → core + dom (+ plugins)
themes→  (CSS only)
apps   → anything
```

Enforced mechanically:

- ESLint `@nx/enforce-module-boundaries` with tag constraints
  (`scope:core` may depend only on `scope:core`, etc.) — see `eslint.config.js`.
- `packages/*/package.json` peerDependencies mirror the same graph.
- CI fails on violations.

**The test:** `@ai-composer/core` imports nothing browser-specific — it runs in
Node, workers, and tests without jsdom.

## 2. Model-first (ADR-0001)

The `PromptDocument` is authoritative. The DOM is a projection:

- user input → **parse DOM → applyViewUpdate** → model changes → events
- programmatic APIs (`setValue`, `insertNode`, undo) → model → re-render

Consequences: serialization, history, testing, SSR and cross-framework
consistency come almost for free; DOM quirks stay in `@ai-composer/dom`.

## 3. Flat node model with stable keys (ADR-0002)

A prompt is one paragraph-scale flow: a flat list of text runs and atomic
chips. Each node has a stable instance `key` (≠ entity `id`) enabling:

- DOM↔model mapping and lossless round-trips
- React keys / Vue keys / Angular trackBy for free
- History snapshots without structural diffing

## 4. Framework adapters are thin

Adapters translate; they never re-implement:

| Adapter responsibility | NOT adapter responsibility |
| --- | --- |
| mounting the DOM surface into framework VDOM/templates | editing semantics |
| exposing state as hooks/signals/refs | history, triggers, commands |
| slot/projection APIs | serialization |
| controlled/uncontrolled value bridging | selection model |

Every adapter runs the **same contract suite** (`@ai-composer/testing`), so
behavior cannot diverge.

## 5. Plugins are first-class and sandboxed (ADR-0004)

- Plain objects; declarative contributions (`commands`, `triggers`,
  `nodeTypes`, `serializers`) + optional `setup()`.
- `PluginContext` exposes public API only — no internals, no event `emit`.
- Contributions auto-unregister on plugin removal; a throwing `setup` rolls
  back without killing the editor.

## 6. Modes are presets, not implementations

`mode` selects a template + defaults. Nothing in core branches on mode names;
new modes register via `registerTemplate()`.

## 7. Styling is tokens-only (ADR-0007)

Zero hard-coded colors/dimensions in code. `--aic-*` custom properties all the
way down; theme layers compose:
`tokens → default → mode → app → component overrides`. The engine works
unstyled/headless; `themes` and `ui` are optional.

## 8. Accessibility is a feature, not a phase

- Editable host: `role=textbox`, `aria-multiline`, `aria-label`
- Suggestions: `role=listbox`/`option`, `aria-activedescendant`, keyboard nav
  (↑ ↓ Enter Tab Esc) in the engine, pointer in the UI
- Reduced-motion and high-contrast rules ship with the default theme

## 9. Security defaults

- Parsed DOM is sanitized: unknown markup flattens to text; `script`/`style`
  subtrees are dropped entirely.
- HTML serialization escapes all user content; the HTML format is export-only.
- Paste trusts only the internal JSON mime and plain text.
- External documents (`setValue`, paste) pass node-registry validation;
  unknown types degrade to readable text.

## 10. Stability policy

- Public API = what `index.ts` exports + what the contract suite exercises.
- `@internal` markers are removed by builds — treat them as private.
- Pre-1.0: breaking changes ship in minors with a changeset note.
  Post-1.0: semver strictly; deprecate before removal.

## SOLID mapping (for reviewers)

| Principle | Where it shows |
| --- | --- |
| Single responsibility | model / state / events / commands / triggers / history / serialization are separate modules |
| Open/closed | plugins, custom node types, serializers, templates — all extension points, no core edits |
| Liskov | every adapter satisfies the same `PromptEditor` contract (verified by the shared suite) |
| Interface segregation | small role interfaces: `TriggerHost`, `PluginContext`, `CommandRegistry`, `NodeRegistry` |
| Dependency inversion | core depends on abstractions it defines; DOM and adapters depend on core, never inversely |
