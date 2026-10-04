# API · Testing (`@ai-composer/testing`)

**Concept** — one shared contract suite every adapter must pass, so React,
Angular, Vue and the Web Component can never silently diverge.

```ts
import { definePromptEditorContractSuite } from '@ai-composer/testing';

// Headless (core):
definePromptEditorContractSuite((options) => createPromptEditor(options));

// Adapter: run it against a MOUNTED editor
definePromptEditorContractSuite((options) => mountReactEditor(options), {
  title: 'PromptEditor contract (react)',
  mount: (editor) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    createRoot(host).render(<PromptEditor editor={editor} />);
    return () => host.remove();
  },
});
```

## Covered scenarios

set value · change sources · submit + beforeSubmit cancellation · insert node ·
mention trigger end-to-end · undo/redo · transaction collapse · focus/blur ·
disabled · readonly · all serialization formats · state subscription · destroy
safety · mounted surface DOM sync.

## Storybook = living API documentation

Every adapter ships stories covering the full matrix (modes, states, chips,
interactions, custom templates, hooks/signals/v-model, vanilla mount):

```bash
pnpm storybook:react      # http://localhost:6006
pnpm storybook:vue        # 6007
pnpm storybook:angular    # 6008
pnpm storybook:wc         # 6009  (includes the Vanilla JS mount story)
pnpm storybook:build      # static bundles → dist/storybook/*
```

Interaction stories (`play` functions) type real text, assert the suggestion
menu, and accept via Enter — the same flows as the contract suite, in the
browser. Add `@storybook/test-runner` in CI to execute them headlessly
(Phase 11 task).

## Unit-test your own code

```ts
const editor = createPromptEditor({ value: 'hello' });
editor.on('change', listener);          // assert events
expect(editor.serialize('text')).toBe('hello');
```
