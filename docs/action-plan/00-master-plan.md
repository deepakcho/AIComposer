# Master Action Plan

Refined from `prompt-editor-action-plan.md` into an executable roadmap for the
**AI Composer** monorepo. Each phase lists tasks with acceptance criteria; the
[status board](#status-board) tracks what exists today.

Guiding sequence (unchanged): **architecture → core model → state →
commands/events → plugin API → DOM → selection → history → vanilla editor →
templates → presets → plugins → adapters → web component → themes → extras →
AI → hardening.**

---

## Phase 1 — Foundation ✅

Nx + pnpm monorepo with enforced boundaries.

- [x] Git repository
- [x] Nx workspace (`nx.json`, `apps/`, `packages/`, `plugins/`)
- [x] pnpm workspaces + `workspace:*` linking
- [x] TypeScript project references via paths (`tsconfig.base.json`)
- [x] ESLint (flat config) + `@nx/enforce-module-boundaries` dep-constraints by tag
- [x] Prettier
- [x] Vitest workspace (per-project configs, node/jsdom environments)
- [x] Changesets
- [x] CI pipeline skeleton (`.github/workflows/ci.yml`)
- [x] Package naming `@ai-composer/*` + dependency policy

**Acceptance:** `pnpm build && pnpm test && pnpm lint` green on a clean clone.

## Phase 2 — Core engine ✅

- [x] `PromptDocument` / flat node model with stable keys (ADR-0002)
- [x] TextNode, MentionNode, CommandNode, VariableNode, AttachmentNode, CustomNode + factories/guards
- [x] `SelectionState`/`Position` + global-offset conversions + clamping
- [x] `PromptEditorState` (single observable snapshot)
- [x] Typed `EventBus` + full editor event map (18 events)
- [x] Command registry + 11 built-in commands
- [x] Trigger engine (scan → search → suggestions → accept, async + abortable)
- [x] Plugin contract + registry (declarative contributions + scoped context + cleanup)
- [x] Node registry with serialization hooks (toText/toMarkdown/toHtml/toDisplay)
- [x] Snapshot history: undo/redo, transactions, merge window, limit
- [x] Serializers: json / text / markdown / html (escaped) / ai payload
- [x] `createPromptEditor()` factory + runtime config
- [x] 65 unit tests incl. contract behaviors

**Acceptance:** engine fully usable headless; `editor.serialize(...)` and
undo/redo verified without any DOM.

## Phase 3 — DOM engine ✅ (baseline)

- [x] `createEditableSurface` — contentEditable binding with model-first pipeline
- [x] render (model→DOM chips with `data-aic-*`) + parse (DOM→model, sanitized)
- [x] Selection mapping both ways + caret restore after renders
- [x] Keyboard: Enter/Shift-Enter submit policy, suggestion nav, undo/redo shortcuts
- [x] Paste: internal JSON mime → plain text → sanitized HTML extraction; copy support
- [x] Composition/IME flags (compositionstart/end)
- [x] Accessible suggestion listbox (`role=listbox/option`, aria-activedescendant)
- [ ] Production IME matrix (CJK), drag/drop foundations, MutationObserver hardening
- [x] 15 jsdom tests

**Acceptance:** working vanilla editor (see `examples/vanilla/`).

## Phase 4 — Template system ✅ (baseline)

- [x] Structural templates as data (`PromptDomTemplate.slots`)
- [x] Presets: compact / default / chat / expanded + `registerTemplate` for custom
- [x] `mountPromptEditor()` vanilla mount honoring templates
- [x] Every slot addressable via `data-aic-slot` + replaceable by adapters
- [ ] Template-builder / explorer tool (playground feature)

**Acceptance:** layout completely replaceable without touching core.

## Phase 5 — Plugin system ✅

- [x] Plugin contract (`name`, setup, commands/triggers/nodeTypes/serializers, destroy)
- [x] Scoped `PluginContext` (no editor internals; listeners-only event access)
- [x] Setup failure rollback; automatic contribution cleanup
- [x] `mentionPlugin` (static pool, async search, custom char)
- [x] `commandPlugin` (node-inserting + immediate-run commands)
- [ ] attachment / markdown / variable / hashtag / emoji plugins (Phase 5b)

**Acceptance:** features install/uninstall at runtime (tests prove it).

## Phase 6 — React adapter ✅

- [x] `<PromptEditor>` — three usage levels, controlled/uncontrolled
- [x] Slots: `PromptHeader/Body/Input/Suggestions/Attachments/Toolbar/Footer`
- [x] Hooks: `usePromptEditor/State/Selection/Command/Suggestions/EditorContext`
- [x] StrictMode-safe lifecycle (rebuild after double-mount destroy)
- [x] 16 tests incl. shared contract suite
- [x] Storybook (modes, states, chips, interactions, custom layout, hooks, controlled)

## Phase 7 — Angular adapter ✅ (baseline)

- [x] Standalone `PromptEditorComponent` (+ signals state, `ChangeDetectionStrategy.OnPush`)
- [x] `PromptInputComponent` (host-as-surface), `SubmitButtonComponent`
- [x] Content projection via `[aic-header]/[aic-toolbar]/[aic-footer]/[aic-attachments]`
- [x] `ControlValueAccessor` (reactive + template-driven forms)
- [x] Type-check build target + Angular 19 playground (Analog.js/Vite) + Storybook
- [ ] ng-packgr publishing build; TestBed component tests (Phase 7b)

## Phase 8 — Web component ✅

- [x] `<ai-composer-editor>` custom element (`defineAiComposerEditor`)
- [x] Attributes (mode/placeholder/disabled/readonly) + properties (editor/plugins/value)
- [x] Forwarded events (`aic-change`, `aic-submit`, …) as bubbling CustomEvents
- [x] 17 tests incl. upgrade + plugin-before-connect flows; Storybook incl. vanilla-JS story

## Phase 9 — Vue adapter ✅

- [x] `PromptEditor` + slots as render-function components (no SFC compiler needed)
- [x] `v-model` support, custom suggestion slots, `usePromptState` composable
- [x] 16 tests incl. contract suite; Storybook with interactions

## Phase 10 — UI / themes ✅ (baseline)

- [x] Design tokens (`--aic-*`) — colors, geometry, motion, z-index
- [x] default / dark / compact themes; reduced-motion + high-contrast rules
- [x] `@ai-composer/ui` `createChatComposer()` convenience wrapper
- [ ] Additional themes, Tailwind/Material recipes (docs)

## Phase 11 — Quality (in progress)

- [x] Unit + contract tests across packages (130+ assertions)
- [x] Storybook interaction stories (mention flows per adapter)
- [ ] Playwright E2E suite; visual regression; axe a11y audit in CI
- [ ] Performance benchmarks (100/500/1000 nodes, typing latency budget <16ms)
- [ ] Bundle-size budgets per package

## Phase 12 — Documentation & DX ✅ (baseline)

- [x] This docs tree: action plan, design principles, ADRs, API reference, framework guides
- [x] `examples/` per API area + per framework
- [x] Storybook as living API documentation (autodocs)
- [ ] Docs site (VitePress/Astro), interactive playground with generated config/code

## Phase 13 — Release (next)

- [ ] Changesets-driven versioning wired in CI
- [ ] npm publish (public scope), `README` compatibility matrix
- [ ] Alpha → feedback → beta → stabilize → v1 (see definition of done)

---

## Status board

| Area | State | Where |
| --- | --- | --- |
| Monorepo + boundaries | ✅ done | `nx.json`, `eslint.config.js` |
| Core engine | ✅ done | `packages/core` (65 tests) |
| DOM layer | ✅ baseline | `packages/dom` (15 tests) |
| Mention / command plugins | ✅ done | `plugins/*` (7 tests) |
| Contract suite | ✅ done | `packages/testing` (14 scenarios) |
| React adapter | ✅ done | `packages/react` (16 tests) |
| Vue adapter | ✅ done | `packages/vue` (16 tests) |
| Angular adapter | ✅ baseline | `packages/angular` (typecheck + playground + storybook) |
| Web component | ✅ done | `packages/web-component` (17 tests) |
| Themes / UI | ✅ baseline | `packages/themes`, `packages/ui` |
| Playgrounds | ✅ done | `apps/playground-*` (4) |
| Storybook (all adapters + JS) | ✅ done | `pnpm storybook:react\|vue\|angular\|wc` |
| Examples per API | ✅ done | `examples/` |
| E2E / visual / a11y in CI | ⬜ next | Phase 11 |
| Perf budgets | ⬜ next | Phase 11 |
| npm release flow | ⬜ next | Phase 13 |

## Definition of done for v1

From the original plan, verbatim checklist — verified by CI:

- [ ] Core is framework-independent *(proven: contract suite + vanilla mount)*
- [ ] DOM implementation works in modern browsers *(jsdom suite green; browser matrix pending)*
- [ ] React / Angular adapters stable *(React ✓; Angular needs TestBed suite)*
- [ ] Compact / chat / expanded modes work *(presets + storybook stories)*
- [ ] Custom templates + slots work *(Level-3 examples on all adapters)*
- [ ] Plugins work; mention + slash commands verified *(7 tests + interactions)*
- [ ] Undo/redo, clipboard, serialization work *(core + dom tests)*
- [ ] Accessibility baseline met *(listbox semantics shipped; audit pending)*
- [ ] E2E + contract tests pass across adapters *(contract ✓, Playwright pending)*
- [ ] Documentation complete *(this tree + Storybook autodocs)*
- [ ] npm packages publishable *(builds ✓, publishing flow pending)*
- [ ] CI/CD automated *(lint/type/test/build wired; e2e pending)*
- [ ] API reviewed for long-term stability *(ADR set complete; v1 review pending)*
