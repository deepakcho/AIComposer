/**
 * Modes — compact pill, chat box, expanded canvas; switchable live.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { demoEditor } from './utils';

const meta: Meta = {
  tags: ['autodocs'],
  title: 'AI Composer/Angular/Modes',
  parameters: {
    docs: {
      description: {
        component:
          '`mode` is a structural preset: **compact** = single-line pill (no toolbar), **chat** = auto-growing box with circular send button, **expanded** = tall canvas with undo/redo/send. The `[mode]` input re-configures the editor at runtime — the draft survives.',
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['compact', 'chat', 'expanded'] },
    placeholder: { control: 'text' },
  },
  args: { placeholder: 'Ask anything…' },
  render: (args) => ({
    props: { ...args, editor: demoEditor({ mode: args.mode, placeholder: args.placeholder }) },
    template: `
      <aic-ai-composer [editor]="editor" [mode]="mode" [placeholder]="placeholder"></aic-ai-composer>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Compact: Story = {
  args: { mode: 'compact', placeholder: 'Search or ask…' },
  parameters: {
    docs: {
      source: { code: `<aic-ai-composer mode="compact" placeholder="Search or ask…"></aic-ai-composer>` },
      description: { story: 'Inline pill while single-line; wrapped/multiline content morphs it into a rounded auto-growing box (never clips). Attachments stay projectable.' },
    },
  },
};

export const MaxHeight: Story = {
  name: 'Max height · custom cap',
  render: () => ({
    props: {
      editor: demoEditor({ mode: 'chat', placeholder: 'Type several lines — the box stops at 96px and scrolls…' }),
    },
    template: `<aic-ai-composer [editor]="editor" mode="chat" maxHeight="96px"></aic-ai-composer>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<!-- input (px or any CSS length) -->
<aic-ai-composer mode="chat" maxHeight="96px"></aic-ai-composer>

<!-- or the underlying token -->
<div style="--aic-input-max-height: 40vh">
  <aic-ai-composer mode="chat"></aic-ai-composer>
</div>`,
      },
    },
  },
};

export const Chat: Story = {
  args: { mode: 'chat' },
  parameters: {
    docs: { source: { code: `<aic-ai-composer mode="chat"></aic-ai-composer>` } },
  },
};

export const Expanded: Story = {
  args: { mode: 'expanded', placeholder: 'Write a detailed draft…' },
  parameters: {
    docs: { source: { code: `<aic-ai-composer mode="expanded"></aic-ai-composer>` } },
  },
};

export const LiveSwitch: Story = {
  name: 'Live mode switching',
  render: () => ({
    props: { editor: demoEditor({ placeholder: 'Draft survives switching…' }), mode: 'chat' },
    template: `
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button type="button" (click)="mode = 'compact'"
                [style.border]="mode === 'compact' ? '1px solid #6366f1' : '1px solid #d1d5db'">compact</button>
        <button type="button" (click)="mode = 'chat'"
                [style.border]="mode === 'chat' ? '1px solid #6366f1' : '1px solid #d1d5db'">chat</button>
        <button type="button" (click)="mode = 'expanded'"
                [style.border]="mode === 'expanded' ? '1px solid #6366f1' : '1px solid #d1d5db'">expanded</button>
      </div>
      <aic-ai-composer [editor]="editor" [mode]="mode"></aic-ai-composer>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `editor.setMode('expanded'); // same instance — draft, focus, undo history survive`,
      },
    },
  },
};
