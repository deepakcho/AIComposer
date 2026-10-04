# Vue 3

Install: `@ai-composer/vue` + `@ai-composer/core` (peer `vue >= 3.4`).

## Basic (v-model)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PromptEditor } from '@ai-composer/vue';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const value = ref('');
const onSubmit = (v: unknown) => console.log('submit', v);
</script>

<template>
  <PromptEditor
    v-model="value"
    mode="chat"
    placeholder="Ask anything…"
    :options="{ plugins: [mentionPlugin({ items })] }"
    @submit="onSubmit"
  />
</template>
```

## Custom layout (slots + scoped suggestions)

```vue
<template>
  <PromptEditor :editor="editor">
    <PromptHeader>Ticket #42</PromptHeader>
    <div class="aic-body" data-aic-slot="body">
      <PromptInput :suggestions="false" />
      <PromptSuggestions v-slot="{ item, active }">
        <b>{{ item.label }}</b> <i v-if="active">←</i>
      </PromptSuggestions>
    </div>
    <PromptToolbar>
      <button @click="editor.submit()">Send</button>
    </PromptToolbar>
  </PromptEditor>
</template>
```

## Composition API

```ts
import { usePromptEditor, usePromptState, usePromptSuggestions } from '@ai-composer/vue';

const editor = usePromptEditor({ plugins: [...] }); // create + auto-destroy
const state = usePromptState(editor);               // Readonly<Ref<PromptEditorState>>
const suggestions = usePromptSuggestions(editor);   // computed({ items, activeIndex, open })
```

Components are render-function based (`defineComponent` + `h`) — no SFC
compiler requirement, works in any build setup.

Live demos: `pnpm storybook:vue` · `pnpm dev:vue` ·
[examples/vue](../../examples/vue/)
