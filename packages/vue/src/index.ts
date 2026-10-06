/**
 * @ai-composer/vue — Vue 3 adapter (composition API, render functions, v-model).
 *
 * ```vue
 * <script setup>
 * import { AIComposer } from '@ai-composer/vue';
 * </script>
 *
 * <template>
 *   <AIComposer mode="chat" placeholder="Ask anything…" v-model="value" @submit="onSubmit" />
 * </template>
 * ```
 */

import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
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
  createAIComposer,
  isAIComposer,
  type AIComposer as AIComposerType,
  type AIComposerDocument,
  type AIComposerOptions,
  type AIComposerState,
  type SuggestionItem,
} from '@ai-composer/core';
import { createEditableSurface, createSuggestionList, attachCaretAnchoredPopup, type CaretAnchor } from '@ai-composer/dom';

const EditorKey: InjectionKey<AIComposerType> = Symbol('ai-composer-editor');

/** Create (once) or reuse an editor; destroys internally-created editors on unmount. */
// -- inline SVG icons (lucide-derived geometry; mirrored in every adapter) --

function iconVNode(d: Array<[string, number?]>, size = 16) {
  return h('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true',
  }, d.map(([path, strokeWidth]) => h('path', { d: path, ...(strokeWidth ? { 'stroke-width': strokeWidth } : {}) })));
}
const hSendIcon = () => iconVNode([['M12 19V5', 2.4], ['m5 12 7-7 7 7', 2.4]]);
const hUndoIcon = () => iconVNode([['M3 7v6h6'], ['M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13']]);
const hRedoIcon = () => iconVNode([['M21 7v6h-6'], ['M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13']]);
const hCloseIcon = (size = 12) => iconVNode([['M18 6 6 18'], ['m6 6 12 12']], size);

export function useAIComposer(options?: AIComposerOptions): AIComposerType {
  const editor = createAIComposer(options);
  onBeforeUnmount(() => editor.destroy());
  return editor;
}

/** Live editor state as a reactive ref. */
export function useAIComposerState(editor: AIComposerType): Readonly<Ref<AIComposerState>> {
  const state = shallowRef<AIComposerState>(editor.getState());
  const unsubscribe = editor.subscribe((next) => {
    state.value = next;
  });
  onBeforeUnmount(unsubscribe);
  return state as Readonly<Ref<AIComposerState>>;
}

/** Resolve the editor provided by <AIComposer>. */
export function useAIComposerFromContext(): AIComposerType {
  const editor = inject(EditorKey);
  if (!editor || !isAIComposer(editor)) {
    throw new Error('No editor in context. Render <AIComposer> above this component.');
  }
  return editor;
}

function setupEditorProvider(props: {
  editor?: AIComposerType;
  options?: AIComposerOptions;
}): { editor: AIComposerType; state: Readonly<Ref<AIComposerState>>; created: boolean } {
  const created = !props.editor;
  const editor = props.editor ?? createAIComposer(props.options);
  const state = useAIComposerState(editor);
  provide(EditorKey, editor);
  if (created) onBeforeUnmount(() => editor.destroy());
  return { editor, state, created };
}

/** The root component. Supports v-model, events and fully custom default slots. */
export const AIComposer = defineComponent({
  name: 'AicAIComposer',
  props: {
    editor: { type: Object as PropType<AIComposerType>, default: undefined },
    options: { type: Object as PropType<AIComposerOptions>, default: undefined },
    mode: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readonly: { type: Boolean, default: undefined },
    modelValue: {
      type: [Object, String] as PropType<AIComposerDocument | string | undefined>,
      default: undefined,
    },
    submitLabel: { type: String, default: undefined },
    /** Auto-height ceiling (px or CSS length); scrolls after the cap. */
    maxHeight: { type: [Number, String], default: undefined },
  },
  emits: {
    'update:modelValue': (value: AIComposerDocument) => !!value,
    change: (value: AIComposerDocument) => !!value,
    submit: (value: AIComposerDocument) => !!value,
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
    // React to runtime prop changes (e.g. toggling mode compact ↔ expanded).
    watch(
      () => [props.mode, props.placeholder, props.disabled, props.readonly],
      applyConfig,
    );

    editor.on('change', (event) => {
      emit('change', event.value);
      emit('update:modelValue', event.value);
    });
    editor.on('submit', (event) => emit('submit', event.value));

    // controlled value
    if (props.modelValue !== undefined) {
      const sync = (value: AIComposerDocument | string | undefined): void => {
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
      const rootStyle = props.maxHeight !== undefined
        ? { '--aic-input-max-height': typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
        : undefined;
      const children: VNode[] = [];
      if (slots.default) {
        children.push(...slots.default({ state: state.value, editor }));
      } else {
        children.push(
          h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
            h(AIComposerAttachmentsVue),
            // AIComposerInput mounts the suggestion popup inside its own wrapper
            h(AIComposerInputVue),
          ]),
        );
        if (mode === 'compact' || mode === 'chat' || mode === 'expanded') {
          children.push(h(AIComposerToolbarVue, { submitLabel: props.submitLabel }));
        }
      }
      return h(
        'div',
        { class: 'aic-root', 'data-aic-mode': mode, style: rootStyle },
        children,
      );
    };
  },
});

/** The editable input surface component. */
export const AIComposerInput = defineComponent({
  name: 'AicAIComposerInput',
  props: {
    suggestions: { type: Boolean, default: true },
  },
  setup(props) {
    const editor = useAIComposerFromContext();
    const host = ref<HTMLElement | null>(null);

    onMounted(() => {
      const element = host.value;
      if (!element) return;
      const surface = createEditableSurface(editor, element);
      const list = props.suggestions ? createSuggestionList(editor, undefined, { inputHost: element }) : null;
      if (list && element.parentElement) element.parentElement.appendChild(list.element);
      onBeforeUnmount(() => {
        list?.destroy();
        surface.destroy();
      });
    });

    return () =>
      h('div', { class: 'aic-input-wrap' }, [
        h('div', {
          ref: host,
          class: 'aic-input-host',
          'data-aic-slot': 'input',
        }),
      ]);
  },
});
const AIComposerInputVue = AIComposerInput;

export const AIComposerSuggestions = defineComponent({
  name: 'AicAIComposerSuggestions',
  props: {
    renderItem: {
      type: Function as PropType<(item: SuggestionItem, active: boolean) => VNode>,
      default: undefined,
    },
    /** Preferred placement relative to the caret; flips to fit the viewport. */
    placement: { type: String as PropType<'above' | 'below'>, default: 'above' },
  },
  setup(props, { slots }) {
    const editor = useAIComposerFromContext();
    const state = useAIComposerState(editor);
    const list = ref<HTMLElement | null>(null);
    let anchor: CaretAnchor | null = null;

    // Caret-anchored, viewport-aware positioning from the DOM layer.
    watch(
      () => [state.value.activeTrigger, state.value.suggestions.length],
      async () => {
        await nextTick();
        const element = list.value;
        if (!element || state.value.suggestions.length === 0) return;
        const host = element.closest('.aic-root')?.querySelector<HTMLElement>('[data-aic-input]');
        if (!host) return;
        if (!anchor) anchor = attachCaretAnchoredPopup(element, host, { placement: props.placement });
        anchor.update();
      },
    );
    onBeforeUnmount(() => anchor?.destroy());

    return () => {
      const current = state.value;
      if (!current.activeTrigger || current.suggestions.length === 0) return null;
      return h(
        'ul',
        {
          ref: list,
          class: 'aic-suggestions',
          role: 'listbox',
        },
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

export const AIComposerAttachments = defineComponent({
  name: 'AicAIComposerAttachments',
  setup() {
    const editor = useAIComposerFromContext();
    const state = useAIComposerState(editor);
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
              hCloseIcon(12),
            ),
          ]),
        ),
      );
    };
  },
});
const AIComposerAttachmentsVue = AIComposerAttachments;

export const AIComposerToolbar = defineComponent({
  name: 'AicAIComposerToolbar',
  props: {
    submitLabel: { type: String, default: undefined },
    actions: {
      type: Array as PropType<Array<'submit' | 'undo' | 'redo'>>,
      default: () => ['submit'],
    },
  },
  setup(props, { slots }) {
    const editor = useAIComposerFromContext();
    const state = useAIComposerState(editor);
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
              ariaLabel: 'Send',
              disabled: !canSubmit || current.submitting,
              onClick: () => void editor.executeCommand('submit'),
            },
            current.submitting ? h('span', { class: 'aic-spinner', ariaHidden: 'true' }) : hSendIcon(),
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
          action === 'undo' ? hUndoIcon() : hRedoIcon(),
        );
      });
      return h('div', { class: 'aic-toolbar', 'data-aic-slot': 'toolbar' }, buttons);
    };
  },
});
const AIComposerToolbarVue = AIComposerToolbar;

export const AIComposerHeader = defineComponent({
  name: 'AicAIComposerHeader',
  setup(_, { slots }) {
    return () => h('div', { class: 'aic-header', 'data-aic-slot': 'header' }, slots.default?.() ?? []);
  },
});

export const AIComposerFooter = defineComponent({
  name: 'AicAIComposerFooter',
  setup(_, { slots }) {
    return () => h('div', { class: 'aic-footer', 'data-aic-slot': 'footer' }, slots.default?.() ?? []);
  },
});

/** Convenience: prebuilt hook returning suggestion state. */
export function useAIComposerSuggestions(editor: AIComposerType) {
  const state = useAIComposerState(editor);
  return computed(() => ({
    items: state.value.suggestions,
    activeIndex: state.value.activeSuggestionIndex,
    open: state.value.activeTrigger !== null && state.value.suggestions.length > 0,
  }));
}
