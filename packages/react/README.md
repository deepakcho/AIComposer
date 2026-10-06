# `@ai-composer/react`

React components and hooks for building customizable AI chat inputs and prompt editors. Compose the
input, attachments, suggestions, and toolbar, or start with the ready-to-use `<AIComposer />`.

```sh
npm install @ai-composer/core @ai-composer/dom @ai-composer/react
```

```tsx
import { AIComposer } from '@ai-composer/react';

export function ChatInput() {
  return <AIComposer mode="chat" placeholder="Ask anything…" />;
}
```

Add [`@ai-composer/themes`](https://www.npmjs.com/package/@ai-composer/themes) for ready-made CSS.
Install optional triggers with [`@ai-composer/plugin-mention`](https://www.npmjs.com/package/@ai-composer/plugin-mention)
or [`@ai-composer/plugin-command`](https://www.npmjs.com/package/@ai-composer/plugin-command).

## Documentation

- [React setup and API reference](https://deepakcho.github.io/AIComposer/#framework-react)
- [Component props, slots, and hooks](https://deepakcho.github.io/AIComposer/#api-props)
- [Custom templates](https://deepakcho.github.io/AIComposer/#template-tutorial)
- [Styling guide](https://deepakcho.github.io/AIComposer/#styling-tutorial)

Source: [GitHub](https://github.com/deepakcho/AIComposer)
