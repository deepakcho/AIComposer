# ADR-0008: Nx monorepo, boundaries and tooling

**Status:** accepted

## Decision

Nx + pnpm workspaces. `nx.json` defines caching + task graph; boundaries are
enforced by ESLint `@nx/enforce-module-boundaries` with project tags
(`scope:core|dom|plugin|adapter|app`). Library builds emit to
`packages/<name>/dist` via `@nx/js:tsc` (ESM, declarations, `exports` maps) so
workspace consumers resolve built output; dev/test resolve sources through
tsconfig paths + vitest aliases.

Angular is the exception pipeline: the package type-checks via `tsc --noEmit`
and is compiled from source by consumers (playground via
`@analogjs/vite-plugin-angular`, Storybook via the `angular.json`
`@storybook/angular` builders); an ng-packgr publishing build lands in Phase 7b.

## Consequences

- `pnpm affected:*` runs only what a PR touches.
- Builds are cacheable; CI stays fast as the repo grows.
- Adding a framework = new package with `scope:adapter` tag; the boundary rule
  list rarely changes.
