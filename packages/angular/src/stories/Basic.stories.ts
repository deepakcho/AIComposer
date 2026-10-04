/**
 * Basic usage — zero-config editor, initial values, submit handling.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { demoEditor } from './utils';

const meta: Meta = {
  tags: ['autodocs'],
  title: 'AI Composer/Angular/Basic',
  parameters: {
    docs: {
      description: {
        component:
          'The zero-config path: `<aic-prompt-editor>` with inputs for mode/placeholder. Implements `ControlValueAccessor`, so it drops straight into template-driven or reactive forms.',
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['compact', 'chat', 'expanded', 'default'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: { mode: 'chat', placeholder: 'Ask anything…', disabled: false, readonly: false },
  render: (args) => ({
    props: { ...args, editor: demoEditor({ mode: args.mode, placeholder: args.placeholder }) },
    template: `
      <aic-prompt-editor
        [editor]="editor"
        [mode]="mode"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        (submitted)="onSubmit($event)"
      ></aic-prompt-editor>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<aic-prompt-editor mode="chat" placeholder="Ask anything…"></aic-prompt-editor>`,
      },
      description: { story: 'Zero configuration. Enter submits, Shift+Enter adds a newline, the box auto-grows.' },
    },
  },
};

export const SubmitFlow: Story = {
  name: 'Submit · (submitted) + clearing',
  render: () => ({
    props: {
      editor: demoEditor({
        mode: 'chat',
        submit: { clearOnSubmit: true },
      }),
      log: [] as string[],
    },
    template: `
      <aic-prompt-editor [editor]="editor" mode="chat" (submitted)="log = [$any(editor).serialize('text'), ...log.slice(0, 4)]"></aic-prompt-editor>
      <pre style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px">{{ log.join('\\n') || 'press Enter…' }}</pre>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `@Component({
  template: \`
    <aic-prompt-editor [editor]="editor" mode="chat"
                       (submitted)="onSubmit($event)"></aic-prompt-editor>
  \`,
})
class Demo {
  editor = createPromptEditor({ submit: { clearOnSubmit: true, onSubmit: (v) => … } });
  onSubmit(value: PromptDocument) { /* … */ }
}`,
      },
    },
  },
};
