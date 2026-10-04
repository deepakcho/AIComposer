/**
 * AI Composer · Web Component & Vanilla JS — full scenario matrix.
 * Stories render plain HTML (`<ai-composer-editor>`) — proving the engine is
 * genuinely framework-independent. Includes a vanilla-JS mount story using
 * core+dom directly.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { createPromptEditor } from '@ai-composer/core';
import { mountPromptEditor } from '@ai-composer/dom';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/<ai-composer-editor>',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Universal custom element — attributes, properties, custom events, works anywhere:

\`\`\`html
<ai-composer-editor mode="chat" placeholder="Ask anything…"></ai-composer-editor>
\`\`\`

\`\`\`js
document.querySelector('ai-composer-editor')
  .addEventListener('aic-submit', (e) => console.log(e.detail));
\`\`\`
`,
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['compact', 'chat', 'expanded'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: { mode: 'chat', placeholder: 'Ask anything…', disabled: false, readonly: false },
  render: (args) => ({
    template: `
      <ai-composer-editor
        mode="${args.mode}"
        placeholder="${args.placeholder}"
        ${args.disabled ? 'disabled' : ''}
        ${args.readonly ? 'readonly' : ''}
      ></ai-composer-editor>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = { args: { mode: 'compact', placeholder: 'Search…' } };
export const Chat: Story = { args: { mode: 'chat' } };
export const Expanded: Story = { args: { mode: 'expanded', placeholder: 'Write a long prompt…' } };
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } };
export const Readonly: Story = { args: { readonly: true, placeholder: 'Readonly' } };

export const DarkTheme: Story = {
  args: { mode: 'chat', placeholder: 'Dark tokens via data-aic-theme' },
  render: (args) => ({
    template: `
      <div data-aic-theme="dark" style="background:#0d0e12;padding:24px;border-radius:12px">
        <ai-composer-editor mode="${args.mode}" placeholder="${args.placeholder}"></ai-composer-editor>
      </div>
    `,
  }),
};

/** Events: aic-change / aic-submit surfaced on the page. */
export const Events: Story = {
  name: 'Events · aic-change / aic-submit',
  render: () => ({
    template: `
      <div>
        <ai-composer-editor id="events-demo" mode="chat" placeholder="Type and press Enter…"></ai-composer-editor>
        <pre id="events-log" style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px">—</pre>
      </div>
    `,
    effects: [
      {
        selector: '#events-demo',
        setup: (element: HTMLElement) => {
          const log = document.querySelector('#events-log')!;
          const editor = (element as unknown as { editor: ReturnType<typeof createPromptEditor> }).editor;
          const write = (line: string): void => {
            log.textContent = `${line}\n${log.textContent}`;
          };
          element.addEventListener('aic-change', () => write(`change → ${editor.serialize('text')}`));
          element.addEventListener('aic-submit', () => write(`submit → ${JSON.stringify(editor.serialize('ai'))}`));
        },
      },
    ],
  }),
};

/** Plugins set as a property before connection. */
export const WithMentionPlugin: Story = {
  name: 'Plugin · @mentions via element property',
  render: () => ({
    template: `<ai-composer-editor id="mention-demo" mode="chat" placeholder="Try typing @ad…"></ai-composer-editor>`,
    effects: [
      {
        selector: '#mention-demo',
        setup: (element: HTMLElement & { plugins?: unknown[] }) => {
          element.plugins = [
            mentionPlugin({
              items: [
                { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
                { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
              ],
            }),
          ];
        },
      },
    ],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '@ad');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Ada Lovelace');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('@Ada Lovelace'));
  },
};

/** Vanilla JS: core + dom only, zero adapters — the independence proof. */
export const VanillaJsMount: Story = {
  name: 'Vanilla JS · mountPromptEditor()',
  render: () => ({
    template: `
      <div>
        <div id="vanilla-mount" style="max-width:640px"></div>
        <pre id="vanilla-output" style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px">—</pre>
      </div>
    `,
    effects: [
      {
        selector: '#vanilla-mount',
        setup: (container: HTMLElement) => {
          const editor = createPromptEditor({
            mode: 'chat',
            placeholder: 'Vanilla JS — no framework at all',
            plugins: [
              mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace', description: 'Engineering' }] }),
            ],
          });
          mountPromptEditor(container, editor, { mode: 'chat' });
          const output = document.querySelector('#vanilla-output')!;
          editor.subscribe((state) => {
            output.textContent = JSON.stringify(
              { text: editor.serialize('text'), canUndo: state.canUndo, mode: state.mode },
              null,
              2,
            );
          });
        },
      },
    ],
  }),
};
