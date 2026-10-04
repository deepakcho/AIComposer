/**
 * Vue 3 — chat composer with v-model, custom slots and state hooks.
 */

import { defineComponent, h, ref } from 'vue';
import { createPromptEditor } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
  usePromptState,
} from '@ai-composer/vue';

/** Simple usage with v-model. */
export const ChatDemo = defineComponent({
  name: 'AicChatDemo',
  props: {},
  emits: {},
  setup() {
    const value = ref('');
    return () =>
      h('div', [
        h(
          PromptEditor as never,
          {
            mode: 'chat',
            placeholder: 'Ask anything… try @ad',
            options: {
              plugins: [
                mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace' }] }),
              ],
            },
            modelValue: value.value,
            'onUpdate:modelValue': (next: unknown) => {
              value.value = next as never;
            },
            onSubmit: (submitted: unknown) => console.log('submit', submitted),
          },
        ),
      ]);
  },
});

/** Custom layout + live state via usePromptState. */
export const CustomLayoutDemo = defineComponent({
  name: 'AicCustomLayoutDemo',
  setup() {
    const editor = createPromptEditor({
      placeholder: 'Custom layout…',
      plugins: [mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace' }] })],
    });
    const state = usePromptState(editor);

    return () =>
      h(PromptEditor as never, { editor }, {
        default: () => [
          h(PromptHeader as never, null, { default: () => 'Ticket #42 · Support' }),
          h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
            h(PromptInput as never, { suggestions: false }),
            h(PromptSuggestions as never, null, {
              default: ({ item, active }: { item: { label: string }; active: boolean }) =>
                h('span', [item.label, active ? ' ←' : '']),
            }),
          ]),
          h(PromptToolbar as never, null, {
            default: () => [
              h('button', { type: 'button', onClick: () => void editor.undo() }, 'Undo'),
              h('button', { type: 'button', onClick: () => void editor.submit() }, 'Send'),
            ],
          }),
          h('div', { class: 'aic-footer' }, [
            `empty=${state.value.empty} · canUndo=${state.value.canUndo}`,
          ]),
        ],
      });
  },
});
