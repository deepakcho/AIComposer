# React

Install: `@ai-composer/react` + `@ai-composer/core` (+ plugins, `@ai-composer/themes/css/*` if wanted).

## Level 1 — zero config

```tsx
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import { PromptEditor } from '@ai-composer/react';

export function App() {
  return <PromptEditor mode="chat" placeholder="Ask anything…" />;
}
```

## Level 2 — configured

```tsx
<PromptEditor
  mode="chat"
  options={{
    plugins: [mentionPlugin({ items })],
    submit: { clearOnSubmit: true, onSubmit: (value) => send(value) },
  }}
  onSubmit={(value) => console.log('sent', value)}
/>
```

## Level 3 — own the layout

```tsx
<PromptEditor editor={editor}>
  <PromptHeader>Context: PR #128</PromptHeader>
  <div className="aic-body" data-aic-slot="body">
    <PromptInput suggestions={false} />
    <PromptSuggestions renderItem={(item, active) => <MyRow item={item} active={active} />} />
  </div>
  <PromptToolbar>
    <button onClick={() => void editor.executeCommand('undo')}>Undo</button>
    <button onClick={() => void editor.executeCommand('submit')}>Send</button>
  </PromptToolbar>
</PromptEditor>
```

Slot components: `PromptHeader`, `PromptBody`, `PromptInput`,
`PromptSuggestions`, `PromptAttachments`, `PromptToolbar`, `PromptFooter`.
`<PromptInput suggestions={false} />` disables the built-in list when you
render `<PromptSuggestions>` yourself.

## Hooks

```tsx
const editor = usePromptEditor(options);       // create/destroy lifecycle
const editor2 = usePromptEditorContext();      // from <PromptEditor> above
const state = usePromptState(editor);          // PromptEditorState
const selection = usePromptSelection(editor);
const { items, activeIndex, open, accept } = usePromptSuggestions(editor);
const run = usePromptCommand(editor);          // (id, payload?) => Promise
```

## Controlled usage

```tsx
const [text, setText] = useState('');
<PromptEditor mode="compact" value={text} onChange={(value) => setText(toText(value))} />;
```

## Notes

- The editable host is managed by the engine (model-first): React never
  touches its children — no rerender cost per keystroke on the input itself.
- `usePromptEditor` is StrictMode-safe (rebuilds after double-mount destroy).
- External editors are never destroyed by the component (`editor` prop wins).

Live demos: `pnpm storybook:react` · `pnpm dev:react` ·
[examples/react](../../examples/react/)
