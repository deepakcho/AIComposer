# ADR-0004: Plugin contract and security model

**Status:** accepted

## Context

Plugins are the main extension surface; a leaky contract either ossifies the
core or exposes internals that break on every release.

## Decision

Plugins are plain objects: `name`, optional `version`, declarative
contributions (`commands`, `triggers`, `nodeTypes`, `serializers`) and an
optional `setup(context)` / `destroy()`.

`PluginContext` provides exactly: `editor` (public API), `getConfig()`, the
four registries, an **listeners-only** event view (`on/once/off` — no `emit`),
and `onCleanup()`.

Runtime rules:

- A throwing `setup` rolls the plugin back completely; the editor survives.
- Unregistering/removing a plugin removes all contributions and runs
  `onCleanup` callbacks + `destroy`.
- Plugins never receive editor internals (`EditorHistory`, `TriggerEngine`,
  document mutation paths).

## Consequences

- Contract is testable and stable; internal refactors don't break plugins.
- Plugins coordinate through events and commands instead of direct poking.
- Capability gaps (e.g. toolbar contributions) become additions to
  `PluginContext`, versioned deliberately.
