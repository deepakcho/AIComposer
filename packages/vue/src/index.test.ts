import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { createPromptEditor } from '@ai-composer/core';
import { definePromptEditorContractSuite } from '@ai-composer/testing';
import { PromptEditor, PromptInput, PromptToolbar } from './index';

let host: HTMLDivElement | null = null;

async function mount(component: ReturnType<typeof defineComponent>): Promise<void> {
  host = document.createElement('div');
  document.body.appendChild(host);
  const app = createApp(component);
  app.mount(host);
  await nextTick();
  await nextTick();
}

afterEach(() => {
  host?.remove();
  host = null;
});

describe('PromptEditor (Vue)', () => {
  it('renders with mode attributes and placeholder', async () => {
    await mount(
      defineComponent({
        render: () => h(PromptEditor, { mode: 'chat', placeholder: 'Ask anything…' }),
      }),
    );
    const rootEl = host!.querySelector('.aic-root');
    expect(rootEl?.getAttribute('data-aic-mode')).toBe('chat');
    expect(host!.querySelector('[data-aic-input]')?.getAttribute('data-placeholder')).toBe(
      'Ask anything…',
    );
  });

  it('typing through the Vue-mounted surface updates the model', async () => {
    const editor = createPromptEditor();
    await mount(
      defineComponent({
        render: () =>
          h(PromptEditor, { editor }, { default: () => [h(PromptInput)] }),
      }),
    );
    const input = host!.querySelector<HTMLElement>('[data-aic-input]');
    input!.textContent = 'hello from vue';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(editor.serialize('text')).toBe('hello from vue');
  });

  it('emits submit via the default toolbar', async () => {
    const editor = createPromptEditor({ value: 'ping' });
    const submitted = vi.fn();
    await mount(
      defineComponent({
        render: () =>
          h(PromptEditor, { editor, onSubmit: submitted }, {
            default: () => [h(PromptInput), h(PromptToolbar)],
          }),
      }),
    );
    const button = host!.querySelector<HTMLButtonElement>('[data-aic-action="submit"]');
    button!.click();
    await vi.waitFor(() => expect(submitted).toHaveBeenCalledTimes(1));
  });
});

definePromptEditorContractSuite((options) => createPromptEditor(options), {
  title: 'PromptEditor contract (vue package, headless reference)',
});
