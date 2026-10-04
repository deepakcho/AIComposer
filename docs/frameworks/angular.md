# Angular

Install: `@ai-composer/angular` + `@ai-composer/core` (peer `@angular/core >= 16`).

## Basic

```ts
import { Component } from '@angular/core';
import { createPromptEditor } from '@ai-composer/core';
import { AI_COMPOSER_IMPORTS } from '@ai-composer/angular';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [...AI_COMPOSER_IMPORTS],
  template: `
    <aic-prompt-editor
      [editor]="editor"
      mode="chat"
      placeholder="Ask anything…"
      (submitted)="onSubmit($event)"
    >
      <div aic-toolbar><aic-submit-button /></div>
    </aic-prompt-editor>
  `,
})
export class ChatComponent {
  readonly editor = createPromptEditor({ plugins: [mentionPlugin({ items })] });
  onSubmit(value: unknown) { /* … */ }
}
```

## Content projection (own the layout)

Slot attributes: `aic-header`, `aic-attachments`, `aic-toolbar`, `aic-footer`
(the body/input always render).

```html
<aic-prompt-editor [editor]="editor" mode="expanded">
  <div aic-header><strong>Context:</strong> ticket #42</div>
  <div aic-toolbar>
    <button (click)="editor.executeCommand('undo')">Undo</button>
    <button (click)="editor.submit()">Submit</button>
  </div>
  <div aic-footer>Any footer</div>
</aic-prompt-editor>
```

## Signals

```ts
const state = injectPromptState();        // Signal<PromptEditorState | null> — inside <aic-prompt-editor>
const markdown = computed(() => this.editor.serialize('markdown') as string);
```

`PromptEditorComponent.state` is a public signal if you take a component ref.

## Reactive forms (ControlValueAccessor)

```ts
form = new FormBuilder().nonNullable.group({ prompt: ['Initial'] });
```

```html
<aic-prompt-editor formControlName="prompt" mode="compact" placeholder="Form-bound" />
```

`writeValue` accepts a string or `PromptDocument`; `valueChange` emits the
document; touched fires on blur.

## API surface

`AI_COMPOSER_IMPORTS` = `PromptEditorComponent`, `PromptInputComponent`,
`SubmitButtonComponent`, slot directives (`[aic-header]`, `[aic-toolbar]`,
`[aic-footer]`, `[aic-attachments]`), plus `injectPromptEditor()` /
`injectPromptState()` / `AiComposerEditorHolder`.

Live demos: `pnpm storybook:angular` · `pnpm dev:angular` ·
[examples/angular](../../examples/angular/)
