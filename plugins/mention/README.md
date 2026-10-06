# `@ai-composer/plugin-mention`

Optional `@` mention trigger plugin for AI Composer. Provide suggestion items such as people,
teams, or documents; accepted suggestions are stored as typed document nodes.

```sh
npm install @ai-composer/core @ai-composer/plugin-mention
```

```ts
import { createAIComposer } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';

const editor = createAIComposer({
  plugins: [
    mentionPlugin({
      items: [{ id: 'ada', label: 'Ada Lovelace' }],
    }),
  ],
});
```

## Documentation

- [Plugin API reference](https://deepakcho.github.io/AIComposer/#api-plugins)
- [Mentions in live demos](https://deepakcho.github.io/AIComposer/#demos)
- [Build a custom plugin](https://deepakcho.github.io/AIComposer/#api-plugins)

Source: [GitHub](https://github.com/deepakcho/AIComposer)
