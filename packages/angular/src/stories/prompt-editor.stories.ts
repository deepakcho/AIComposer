/**
 * AI Composer · Angular — full scenario matrix (standalone components, signals,
 * content projection). Stories render <aic-prompt-editor> via template strings
 * with a per-story editor instance.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { createPromptEditor, type PromptEditor } from '@ai-composer/core';
import { PromptEditorComponent } from '../index';

function demoEditor(mode = 'chat'): PromptEditor {
  return createPromptEditor({
    mode,
    placeholder: 'Ask anything… try @mentions',
    plugins: [
      {
        name: 'mention',
        triggers: [
          {
            id: 'mention',
            character: '@',
            type: 'mention',
            search: () => [
              { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
              { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
            ],
          },
        ],
      },
    ],
  });
}

const baseTemplate = `
  <aic-prompt-editor
    [editor]="editor"
    [mode]="mode"
    [placeholder]="placeholder"
    [disabled]="disabled"
    [readonly]="readonly"
    (submitted)="onSubmit($event)"
  >
    <div aic-toolbar>
      <button type="button" (click)="editor.submit()">Send</button>
    </div>
  </aic-prompt-editor>
`;

const meta: Meta = {
  component: PromptEditorComponent,
  tags: ['autodocs'],
  title: 'AI Composer/PromptEditor (Angular)',
  parameters: {
    docs: {
      description: {
        component: `
Angular adapter:

\`\`\`html
<aic-prompt-editor [editor]="editor" mode="chat" (submitted)="onSubmit($event)">
  <div aic-header>Context</div>
  <div aic-toolbar><aic-submit-button /></div>
</aic-prompt-editor>
\`\`\`

Implements \`ControlValueAccessor\` — drop it straight into reactive/template-driven forms.
`,
      },
    },
  },
  argTypes: {
    editor: { control: false },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    mode: { control: 'select', options: ['compact', 'chat', 'expanded', 'default'] },
    placeholder: { control: 'text' },
  },
  args: {
    mode: 'chat',
    placeholder: 'Ask anything… try @mentions',
    disabled: false,
    readonly: false,
  },
  render: (args) => ({
    props: {
      ...args,
      editor: demoEditor(args.mode),
      onSubmit: (value: unknown) => console.log('submit', value),
    },
    template: baseTemplate,
  }),
};

export default meta;
type Story = StoryObj;

export const Compact: Story = { args: { mode: 'compact', placeholder: 'Search…' } };
export const Chat: Story = { args: { mode: 'chat' } };
export const Expanded: Story = { args: { mode: 'expanded' } };
export const Disabled: Story = { args: { disabled: true } };
export const Readonly: Story = { args: { readonly: true } };

/** Content projection: header + custom toolbar (Level 3). */
export const CustomProjection: Story = {
  name: 'Custom layout · content projection',
  render: (args) => ({
    props: {
      ...args,
      editor: demoEditor('chat'),
      onSubmit: (value: unknown) => console.log('submit', value),
    },
    template: `
      <aic-prompt-editor [editor]="editor" mode="chat" placeholder="Custom layout…">
        <div aic-header><strong>Context:</strong> invoice #9021</div>
        <div aic-toolbar>
          <button type="button" (click)="editor.executeCommand('undo')">↺</button>
          <button type="button" (click)="editor.executeCommand('redo')">↻</button>
          <button type="button" (click)="editor.submit()">Submit</button>
        </div>
        <div aic-footer>One engine, any framework.</div>
      </aic-prompt-editor>
    `,
  }),
};

/** Signals: state drives the component around the editor. */
export const SignalsDemo: Story = {
  name: 'Signals · reactive state',
  render: (args) => ({
    props: {
      ...args,
      editor: (() => {
        const editor = demoEditor('chat');
        return editor;
      })(),
      log: [] as string[],
      pushLog: (_entry: string) => undefined,
    },
    template: `
      <aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor>
    `,
  }),
};

/** Interaction: mention flow through the Angular-rendered surface. */
export const MentionFlow: Story = {
  name: 'Interaction · mention flow',
  render: (args) => ({
    props: { ...args, editor: demoEditor('chat'), onSubmit: () => undefined },
    template: `<aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor>`,
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
