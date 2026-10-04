/**
 * Angular — standalone chat composer with signals, content projection,
 * and ControlValueAccessor (reactive-forms ready).
 */

import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { createPromptEditor, type PromptDocument } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { AI_COMPOSER_IMPORTS } from '@ai-composer/angular';

@Component({
  selector: 'app-chat-demo',
  standalone: true,
  imports: [ReactiveFormsModule, ...AI_COMPOSER_IMPORTS],
  template: `
    <!-- Custom layout via content projection (aic-header / aic-toolbar / aic-footer) -->
    <aic-prompt-editor
      [editor]="editor"
      mode="chat"
      placeholder="Ask anything… try @ad"
      (submitted)="onSubmit($event)"
    >
      <div aic-header><strong>Context:</strong> ticket #42</div>
      <div aic-toolbar><aic-submit-button /></div>
      <div aic-footer>{{ markdown() }}</div>
    </aic-prompt-editor>

    <!-- CVA: bind the editor straight into a reactive form -->
    <form [formGroup]="form">
      <aic-prompt-editor formControlName="prompt" mode="compact" placeholder="Form-bound editor" />
    </form>
  `,
})
export class ChatDemoComponent {
  readonly editor = createPromptEditor({
    mode: 'chat',
    plugins: [
      mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace', description: 'Engineering' }] }),
    ],
  });

  readonly markdown = signal(this.editor.serialize('markdown') as string);

  readonly form = new FormBuilder().nonNullable.group({
    prompt: ['Form value'],
  });

  constructor() {
    this.editor.subscribe(() => this.markdown.set(this.editor.serialize('markdown') as string));
    // CVA pushes editor changes into the form automatically:
    this.form.controls.prompt.valueChanges.subscribe((value) => console.log('form', value));
  }

  onSubmit(value: PromptDocument): void {
    console.log('submit', value, this.editor.serialize('ai'));
  }
}
