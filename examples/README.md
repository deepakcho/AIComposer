# Examples

Runnable, commented examples for **every API area** of AI Composer.
Each file is self-contained — import paths resolve via the workspace tsconfig
paths (see `tsconfig.base.json`).

Run them:

```bash
# headless examples execute in vitest-style environments; the quickest way is
# copying a file into a playground (apps/playground-*) or running with tsx:
pnpm dlx tsx examples/core/02-create-editor.ts
```

| # | File | API area |
| --- | --- | --- |
| 01 | [core/01-document-model.ts](core/01-document-model.ts) | PromptDocument, nodes, keys, edit primitives |
| 02 | [core/02-create-editor.ts](core/02-create-editor.ts) | createPromptEditor, config, value lifecycle |
| 03 | [core/03-events.ts](core/03-events.ts) | typed event bus, all events |
| 04 | [core/04-commands.ts](core/04-commands.ts) | built-in + custom commands |
| 05 | [core/05-history-transactions.ts](core/05-history-transactions.ts) | undo/redo, transactions, merge window |
| 06 | [core/06-serialization.ts](core/06-serialization.ts) | json / text / markdown / html / ai |
| 07 | [core/07-triggers.ts](core/07-triggers.ts) | triggers, suggestions, selection |
| 08 | [core/08-custom-plugin.ts](core/08-custom-plugin.ts) | full plugin contract |
| 09 | [core/09-custom-node.ts](core/09-custom-node.ts) | custom nodes + serialization control |
| R1 | [react/ChatDemo.tsx](react/ChatDemo.tsx) | React — chat composer |
| R2 | [react/CustomTemplate.tsx](react/CustomTemplate.tsx) | React — full custom layout |
| R3 | [react/HooksDemo.tsx](react/HooksDemo.tsx) | React — hooks |
| A1 | [angular/chat-demo.component.ts](angular/chat-demo.component.ts) | Angular — standalone + signals + CVA |
| V1 | [vue/ChatDemo.ts](vue/ChatDemo.ts) | Vue — v-model + slots |
| W1 | [web-component/index.html](web-component/index.html) | `<ai-composer-editor>` in plain HTML |
| N1 | [vanilla/index.html](vanilla/index.html) | vanilla `mountPromptEditor` |

Live, interactive versions of everything above live in:

- **Storybook** — `pnpm storybook:react` / `storybook:vue` / `storybook:angular` / `storybook:wc` (all scenarios, examples, and API docs)
- **Playgrounds** — `pnpm dev:vanilla` / `dev:react` / `dev:vue` / `dev:angular`
