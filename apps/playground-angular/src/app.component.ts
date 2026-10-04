import { Component, signal } from '@angular/core';
import { createPromptEditor, type PromptDocument } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { AI_COMPOSER_IMPORTS } from '@ai-composer/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [...AI_COMPOSER_IMPORTS],
  template: `
    <main>
      <h1>AI Composer · Angular</h1>

      <aic-prompt-editor
        [editor]="editor"
        mode="chat"
        placeholder="Ask anything… try @mentions"
        (submitted)="onSubmit($event)"
      >
        <div aic-header><strong>Context:</strong> ticket #42</div>
        <div aic-toolbar><aic-submit-button /></div>
      </aic-prompt-editor>

      <p>
        Markdown: <code>{{ markdown() }}</code>
      </p>
      <pre class="output">{{ lastSubmit() ?? '— submit something —' }}</pre>
    </main>
  `,
  styles: [
    `
      main { max-width: 720px; margin: 40px auto; font-family: system-ui, sans-serif; padding: 0 16px; }
      .output { background: #f6f7f9; border-radius: 8px; padding: 12px; font-size: 13px; }
    `,
  ],
})
export class AppComponent {
  readonly editor = createPromptEditor({
    mode: 'chat',
    plugins: [
      mentionPlugin({
        items: [
          { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
          { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
        ],
      }),
    ],
  });

  readonly markdown = signal(this.editor.serialize('markdown') as string);
  readonly lastSubmit = signal<string | null>(null);

  constructor() {
    this.editor.subscribe(() => {
      this.markdown.set(this.editor.serialize('markdown') as string);
    });
  }

  onSubmit(value: PromptDocument): void {
    this.lastSubmit.set(JSON.stringify(value, null, 2));
  }
}
