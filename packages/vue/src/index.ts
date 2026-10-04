/**
 * @ai-composer/vue — Vue 3 adapter (composition API, render functions, v-model).
 *
 * ```vue
 * <script setup>
 * import { PromptEditor } from '@ai-composer/vue';
 * </script>
 *
 * <template>
 *   <PromptEditor mode="chat" placeholder="Ask anything…" v-model="value" @submit="onSubmit" />
 * </template>
 * ```
 */

import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from 'vue';
import {
  createPromptEditor,
  isPromptEditor,
  type PromptDocument,
  type PromptEditor as PromptEditorType,
  type PromptEditorOptions,
  type PromptEditorState,
  type SuggestionItem,
} from '@ai-composer/core';
import { createEditableSurface, createSuggestionList } from '@ai-composer/dom';

const EditorKey: InjectionKey<PromptEditorType> = Symbol('ai-composer-editor');

/** Create (once) or reuse an editor; destroys internally-created editors on unmount. */
export function usePromptEditor(options?: PromptEditorOptions): PromptEditorType {
  const editor = createPromptEditor(options);
  onBeforeUnmount(() => editor.destroy());
  return editor;
}

/** Live editor state as a reactive ref. */
export function usePromptState(editor: PromptEditorType): Readonly<Ref<PromptEditorState>> {
  const state = shallowRef<PromptEditorState>(editor.getState());
  const unsubscribe = editor.subscribe((next) => {
    state.value = next;
  });
  onBeforeUnmount(unsubscribe);
  return state as Readonly<Ref<PromptEditorState>>;
}

/** Resolve the editor provided by <PromptEditor>. */
export function usePromptEditorFromContext(): PromptEditorType {
  const editor = inject(EditorKey);
  if (!editor || !isPromptEditor(editor)) {
    throw new Error('No editor in context. Render <PromptEditor> above this component.');
  }
  return editor;
}

function setupEditorProvider(props: {
  editor?: PromptEditorType;
  options?: PromptEditorOptions;
}): { editor: PromptEditorType; state: Readonly<Ref<PromptEditorState>>; created: boolean } {
  const created = !props.editor;
  const editor = props.editor ?? createPromptEditor(props.options);
  const state = usePromptState(editor);
  provide(EditorKey, editor);
  if (created) onBeforeUnmount(() => editor.destroy());
  return { editor, state, created };
}

/** The root component. Supports v-model, events and fully custom default slots. */
export const PromptEditor = defineComponent({
  name: 'AicPromptEditor',
  props: {
    editor: { type: Object as PropType<PromptEditorType>, default: undefined },
    options: { type: Object as PropType<PromptEditorOptions>, default: undefined },
    mode: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readonly: { type: Boolean, default: undefined },
    modelValue: {
      type: [Object, String] as PropType<PromptDocument | string | undefined>,
      default: undefined,
    },
    submitLabel: { type: String, default: 'Send' },
  },
  emits: {
    'update:modelValue': (value: PromptDocument) => !!value,
    change: (value: PromptDocument) => !!value,
    submit: (value: PromptDocument) => !!value,
  },
  setup(props, { emit, slots }) {
    const { editor, state } = setupEditorProvider(props);

    // props → config
    const applyConfig = (): void => {
      const patch: Record<string, unknown> = {};
      if (props.mode !== undefined && props.mode !== editor.getConfig().mode) patch.mode = props.mode;
      if (props.placeholder !== undefined) patch.placeholder = props.placeholder;
      if (props.disabled !== undefined) patch.disabled = props.disabled;
      if (props.readonly !== undefined) patch.readonly = props.readonly;
      if (Object.keys(patch).length > 0) editor.configure(patch);
    };
    applyConfig();

    editor.on('change', (event) => {
      emit('change', event.value);
      emit('update:modelValue', event.value);
    });
    editor.on('submit', (event) => emit('submit', event.value));

    // controlled value
    if (props.modelValue !== undefined) {
      const sync = (value: PromptDocument | string | undefined): void => {
        if (value === undefined) return;
        if (typeof value === 'string') {
          if (value !== editor.serialize('text')) editor.setValue(value);
        } else {
          editor.setValue(value);
        }
      };
      sync(props.modelValue);
      const stop = watch(() => props.modelValue, sync);
      onBeforeUnmount(stop);
    }

    return () => {
      const mode = state.value.mode;
      const children: VNode[] = [];
      if (slots.default) {
        children.push(...slots.default({ state: state.value, editor }));
      } else {
        children.push(
          h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
            h(PromptAttachmentsVue),
            h(PromptInputVue),
          ]),
          h(PromptSuggestionsVue),
          h(PromptToolbarVue, { submitLabel: props.submitLabel }),
        );
        if (mode === 'expanded') children.push(h('div', { class: 'aic-footer', 'data-aic-slot': 'footer' }));
      }
      return h(
        'div',
        { class: 'aic-root', 'data-aic-mode': mode },
        children,
      );
    };
  },
});

/** The editable input surface component. */
export const PromptInput = defineComponent({
  name: 'AicPromptInput',
  props: {
    suggestions: { type: Boolean, default: true },
  },
  setup(props) {
    const editor = usePromptEditorFromContext();
    const state = usePromptState(editor);
    const host = ref<HTMLElement | null>(null);

    onMounted(() => {
      const element = host.value;
      if (!element) return;
      const surface = createEditableSurface(editor, element, {
        multiline: state.value.mode !== 'compact',
      });
      const list = props.suggestions ? createSuggestionList(editor, undefined, { inputHost: element }) : null;
      if (list && element.parentElement) element.parentElement.appendChild(list.element);
      onBeforeUnmount(() => {
        list?.destroy();
        surface.destroy();
      });
    });

    return () =>
      h('div', { class: 'aic-suggestions-anchor', style: { position: 'relative' } }, [
        h('div', {
          ref: host,
          class: 'aic-input-host',
          'data-aic-slot': 'input',
        }),
      ]);
  },
});
const PromptInputVue = PromptInput;

export const PromptSuggestions = defineComponent({
  name: 'AicPromptSuggestions',
  props: {
    renderItem: {
      type: Function as PropType<(item: SuggestionItem, active: boolean) => VNode>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const editor = usePromptEditorFromContext();
    const state = usePromptState(editor);
    return () => {
      const current = state.value;
      if (!current.activeTrigger || current.suggestions.length === 0) return null;
      return h(
        'ul',
        { class: 'aic-suggestions', role: 'listbox' },
        current.suggestions.map((item, index) => {
          const active = index === current.activeSuggestionIndex;
          return h(
            'li',
            {
              key: item.id,
              role: 'option',
              'aria-selected': String(active),
              class: active ? 'aic-suggestion aic-active' : 'aic-suggestion',
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: () => void editor.acceptSuggestion(item),
            },
            slots.default
              ? slots.default({ item, active, index })
              : props.renderItem
                ? [props.renderItem(item, active)]
                : [item.label],
          );
        }),
      );
    };
  },
});
const PromptSuggestionsVue = PromptSuggestions;

export const PromptAttachments = defineComponent({
  name: 'AicPromptAttachments',
  setup() {
    const editor = usePromptEditorFromContext();
    const state = usePromptState(editor);
    return () => {
      const attachments = state.value.attachments;
      if (attachments.length === 0) return null;
      return h(
        'div',
        { class: 'aic-attachments', 'data-aic-slot': 'attachments' },
        attachments.map((attachment) =>
          h('span', { key: attachment.key, class: 'aic-attachment' }, [
            h('span', { class: 'aic-attachment-name' }, attachment.name),
            h(
              'button',
              {
                type: 'button',
                class: 'aic-attachment-remove',
                ariaLabel: `Remove ${attachment.name}`,
                onClick: () => editor.removeNode(attachment.key),
              },
              '×',
            ),
          ]),
        ),
      );
    };
  },
});
const PromptAttachmentsVue = PromptAttachments;

export const PromptToolbar = defineComponent({
  name: 'AicPromptToolbar',
  props: {
    submitLabel: { type: String, default: 'Send' },
    actions: {
      type: Array as PropType<Array<'submit' | 'undo' | 'redo'>>,
      default: () => ['submit'],
    },
  },
  setup(props, { slots }) {
    const editor = usePromptEditorFromContext();
    const state = usePromptState(editor);
    return () => {
      const current = state.value;
      if (slots.default) {
        return h('div', { class: 'aic-toolbar', 'data-aic-slot': 'toolbar' }, slots.default());
      }
      const buttons = props.actions.map((action) => {
        if (action === 'submit') {
          const canSubmit = !current.disabled && !current.readonly && (!current.empty || current.attachments.length > 0);
          return h(
            'button',
            {
              key: action,
              type: 'button',
              class: 'aic-toolbar-submit',
              'data-aic-action': action,
              disabled: !canSubmit || current.submitting,
              onClick: () => void editor.executeCommand('submit'),
            },
            current.submitting ? '…' : props.submitLabel,
          );
        }
        const enabled = action === 'undo' ? current.canUndo : current.canRedo;
        return h(
          'button',
          {
            key: action,
            type: 'button',
            class: `aic-toolbar-${action}`,
            'data-aic-action': action,
            disabled: !enabled,
            onClick: () => void editor.executeCommand(action),
          },
          action === 'undo' ? 'Undo' : 'Redo',
        );
      });
      return h('div', { class: 'aic-toolbar', 'data-aic-slot': 'toolbar' }, buttons);
    };
  },
});
const PromptToolbarVue = PromptToolbar;

export const PromptHeader = defineComponent({
  name: 'AicPromptHeader',
  setup(_, { slots }) {
    return () => h('div', { class: 'aic-header', 'data-aic-slot': 'header' }, slots.default?.() ?? []);
  },
});

export const PromptFooter = defineComponent({
  name: 'AicPromptFooter',
  setup(_, { slots }) {
    return () => h('div', { class: 'aic-footer', 'data-aic-slot': 'footer' }, slots.default?.() ?? []);
  },
});

/** Convenience: prebuilt hook returning suggestion state. */
export function usePromptSuggestions(editor: PromptEditorType) {
  const state = usePromptState(editor);
  return computed(() => ({
    items: state.value.suggestions,
    activeIndex: state.value.activeSuggestionIndex,
    open: state.value.activeTrigger !== null && state.value.suggestions.length > 0,
  }));
}

export { EditorKey as PROMPT_EDITOR_KEY };
