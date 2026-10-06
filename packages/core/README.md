# `@ai-composer/core`

The framework-independent engine behind AI Composer. It manages the editor document, state,
commands, triggers, plugins, undo/redo history, and serialization. Use it directly for a custom UI,
or pair it with a framework adapter.

```sh
npm install @ai-composer/core
```

```ts
import { createAIComposer } from '@ai-composer/core';

const editor = createAIComposer({
  mode: 'chat',
  placeholder: 'Ask anything…',
});

editor.insertText('Hello');
const message = editor.serialize('text');
editor.destroy();
```

## Documentation

- [Core engine API reference](https://deepakcho.github.io/AIComposer/#api-core)
- [Document and serialization API](https://deepakcho.github.io/AIComposer/#api-document)
- [Plugins, commands, and events](https://deepakcho.github.io/AIComposer/#api-plugins)
- [Quick start and live examples](https://deepakcho.github.io/AIComposer/#quick-start)

Source: [GitHub](https://github.com/deepakcho/AIComposer)
