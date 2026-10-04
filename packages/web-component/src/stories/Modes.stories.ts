/**
 * Modes — compact pill, chat box, expanded canvas.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/Web Component/Modes',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`mode` is a structural preset: **compact** = single-line pill, **chat** = auto-growing Copilot box, **expanded** = tall canvas. Change it via the attribute (or `element.editor.setMode()` for live switching with the draft preserved).',
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['compact', 'chat', 'expanded'] },
    placeholder: { control: 'text' },
  },
  args: { placeholder: 'Ask anything…' },
  render: (args) => ({
    template: `
      <ai-composer-editor mode="${args.mode}" placeholder="${args.placeholder}"></ai-composer-editor>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  args: { mode: 'compact', placeholder: 'Search or ask…' },
  parameters: {
    docs: {
      source: { code: `<ai-composer-editor mode="compact" placeholder="Search…"></ai-composer-editor>` },
      description: { story: 'Inline pill while single-line; wrapped/multiline content morphs it into a rounded auto-growing box (never clips).' },
    },
  },
};

export const MaxHeight: Story = {
  name: 'Max height · custom cap',
  render: () => ({
    template: `<ai-composer-editor mode="chat" max-height="96px" placeholder="Type several lines — the box stops at 96px and scrolls…"></ai-composer-editor>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<!-- attribute (any CSS length) -->
<ai-composer-editor mode="chat" max-height="96px"></ai-composer-editor>

<!-- or the underlying token -->
<div style="--aic-input-max-height: 40vh">
  <ai-composer-editor mode="chat"></ai-composer-editor>
</div>`,
      },
    },
  },
};

export const Chat: Story = {
  args: { mode: 'chat' },
  parameters: {
    docs: { source: { code: `<ai-composer-editor mode="chat"></ai-composer-editor>` } },
  },
};

export const Expanded: Story = {
  args: { mode: 'expanded', placeholder: 'Write a long, detailed prompt…' },
  parameters: {
    docs: { source: { code: `<ai-composer-editor mode="expanded"></ai-composer-editor>` } },
  },
};
