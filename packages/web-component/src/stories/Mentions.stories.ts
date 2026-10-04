/**
 * Mentions & commands — plugins set as an element property.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/Web Component/Mentions & Commands',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Plugins are set as the `plugins` element property before the element connects (or re-set — the element re-mounts its editor view). The popup opens at the caret, clamps into the viewport, flips when there is no room above.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MentionFlow: Story = {
  name: 'Interaction · type @, pick from popup',
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
  parameters: {
    docs: {
      source: {
        code: `const el = document.querySelector('ai-composer-editor');
el.plugins = [mentionPlugin({ items: people })];`,
      },
    },
  },
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

export const CommandMenu: Story = {
  name: 'Interaction · slash commands',
  render: () => ({
    template: `<ai-composer-editor id="command-demo" mode="chat" placeholder="Try typing /…"></ai-composer-editor>`,
    effects: [
      {
        selector: '#command-demo',
        setup: (element: HTMLElement & { plugins?: unknown[] }) => {
          element.plugins = [
            commandPlugin({
              commands: [
                { id: 'summarize', label: 'Summarize', description: 'Summarize the conversation' },
                { id: 'translate', label: 'Translate', description: 'Translate the prompt' },
              ],
            }),
          ];
        },
      },
    ],
  }),
  parameters: {
    docs: {
      source: {
        code: `el.plugins = [
  commandPlugin({ commands: [{ id: 'summarize', label: 'Summarize' }] }),
];`,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '/');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Summarize');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('/Translate'));
  },
};
