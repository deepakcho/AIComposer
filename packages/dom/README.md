# `@ai-composer/dom`

The browser DOM layer for AI Composer. It connects the core editor to an editable surface and
provides selection handling, clipboard integration, attachment rendering, and suggestion popups.
Framework adapters use it internally; use it directly to build a vanilla JavaScript integration.

```sh
npm install @ai-composer/core @ai-composer/dom
```

```ts
import { createAIComposer } from '@ai-composer/core';
import { mountAIComposer } from '@ai-composer/dom';

const editor = createAIComposer({ mode: 'chat' });
const mounted = mountAIComposer(document.querySelector('#composer')!, editor);

// When the host UI is removed:
mounted.destroy();
editor.destroy();
```

## Documentation

- [Vanilla JavaScript integration](https://deepakcho.github.io/AIComposer/#framework-vanilla)
- [Live demos](https://deepakcho.github.io/AIComposer/#demos)
- [Core engine API](https://deepakcho.github.io/AIComposer/#api-core)

Source: [GitHub](https://github.com/deepakcho/AIComposer)
