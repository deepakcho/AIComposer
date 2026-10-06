/**
 * Customization — content projection (Level 3), signals, reactive forms.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { demoEditor } from './utils';

const meta: Meta = {
  tags: ['autodocs'],
  title: 'AI Composer/Angular/Customization',
  parameters: {
    docs: {
      description: {
        component:
          'Level 3 usage: project your own header/toolbar/footer via attribute directives (`aic-header`, `aic-toolbar`, `aic-footer`). `ControlValueAccessor` support means `[(ngModel)]` and reactive forms work out of the box.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const CustomProjection: Story = {
  name: 'Custom layout · content projection',
  render: () => ({
    props: { editor: demoEditor({ mode: 'chat', placeholder: 'Custom layout…' }) },
    template: `
      <aic-ai-composer [editor]="editor" mode="chat" placeholder="Custom layout…">
        <div aic-header><strong>Context:</strong> invoice #9021</div>
        <div aic-toolbar>
          <button type="button" (click)="editor.executeCommand('undo')">↺</button>
          <button type="button" (click)="editor.executeCommand('redo')">↻</button>
          <button type="button" (click)="editor.submit()">Submit</button>
        </div>
        <div aic-footer>One engine, any framework.</div>
      </aic-ai-composer>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `<aic-ai-composer [editor]="editor" mode="chat">
  <div aic-header><strong>Context:</strong> invoice #9021</div>
  <div aic-toolbar>
    <button (click)="editor.executeCommand('undo')">↺</button>
    <button (click)="editor.submit()">Submit</button>
  </div>
  <div aic-footer>One engine, any framework.</div>
</aic-ai-composer>`,
      },
    },
  },
};

export const ReactiveForm: Story = {
  name: 'Reactive forms · ControlValueAccessor',
  render: () => ({
    props: { composerValue: new FormControl('Typed via form control') },
    moduleMetadata: { imports: [ReactiveFormsModule] },
    template: `
      <aic-ai-composer [formControl]="composerValue" mode="compact"></aic-ai-composer>
      <p>Form value: <code>{{ composerValue.value }}</code></p>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `@Component({
  imports: [ReactiveFormsModule],
  template: \`
    <aic-ai-composer [formControl]="composerValue" mode="compact"></aic-ai-composer>
    <p>Form value: {{ composerValue.value }}</p>
  \`,
})
class Demo {
  composerValue = new FormControl('');
}`,
      },
    },
  },
};
