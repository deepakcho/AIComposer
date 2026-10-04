/**
 * @ai-composer/web-component — universal `<ai-composer-editor>` custom element.
 *
 * ```html
 * <ai-composer-editor mode="chat" placeholder="Ask anything…"></ai-composer-editor>
 *
 * <script type="module">
 *   import { defineAiComposerEditor } from '@ai-composer/web-component';
 *   defineAiComposerEditor();
 * </script>
 * ```
 *
 * Attributes: mode, placeholder, disabled, readonly, max-height (CSS length).
 * Properties: editor (external PromptEditor), plugins, value.
 * Events:     aic-change, aic-input, aic-submit, aic-focus, aic-blur (CustomEvent, detail = payload).
 */

import {
  createPromptEditor,
  isPromptEditor,
  type PromptEditor,
  type PromptEditorEventMap,
  type PromptEditorEventType,
  type PromptPlugin,
} from '@ai-composer/core';
import { mountPromptEditor, type MountedEditor } from '@ai-composer/dom';

const TAG_NAME = 'ai-composer-editor';

const ATTRIBUTE_MAP: Record<string, 'mode' | 'placeholder' | 'disabled' | 'readonly' | 'maxHeight'> = {
  mode: 'mode',
  placeholder: 'placeholder',
  disabled: 'disabled',
  readonly: 'readonly',
  'max-height': 'maxHeight',
};

const FORWARDED_EVENTS: PromptEditorEventType[] = [
  'change',
  'input',
  'submit',
  'focus',
  'blur',
  'triggerOpen',
  'triggerClose',
  'commandExecute',
  'error',
];

export class AiComposerEditorElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.keys(ATTRIBUTE_MAP);
  }

  private _plugins: PromptPlugin[] = [];
  private _editor: PromptEditor | null = null;
  private mounted: MountedEditor | null = null;
  private unsubscribes: Array<() => void> = [];

  /**
   * Plugins for the internally created editor. May be set before or after
   * connection — after connection the internal editor is rebuilt.
   */
  get plugins(): PromptPlugin[] {
    return this._plugins;
  }
  set plugins(value: PromptPlugin[]) {
    this._plugins = value;
    if (!this.isConnected) return;
    this.teardown();
    this._editor?.destroy();
    this._editor = null;
    this.remount();
  }

  /** Use an externally owned editor (takes precedence over internal creation). */
  get editor(): PromptEditor | null {
    return this._editor;
  }
  set editor(value: PromptEditor | null) {
    if (value && !isPromptEditor(value)) return;
    this._editor = value;
    if (this.isConnected) this.remount();
  }

  get value(): string {
    return this._editor ? (this._editor.serialize('json') as unknown as string) : '';
  }
  set value(json: string) {
    if (!this._editor) return;
    try {
      this._editor.setValue(JSON.parse(json));
    } catch {
      this._editor.setValue(json);
    }
  }

  connectedCallback(): void {
    this.remount();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, _old: string | null, next: string | null): void {
    const key = ATTRIBUTE_MAP[name];
    if (!key) return;
    // Auto-height ceiling is a pure style concern (token override).
    if (key === 'maxHeight') {
      if (next === null) this.style.removeProperty('--aic-input-max-height');
      else this.style.setProperty('--aic-input-max-height', next);
      return;
    }
    if (!this._editor) return;
    if (key === 'disabled' || key === 'readonly') {
      this._editor.configure({ [key]: next !== null });
    } else if (next !== null) {
      this._editor.configure({ [key]: next });
    }
  }

  private remount(): void {
    this.teardown();
    if (!this._editor) this._editor = createPromptEditor({ plugins: this._plugins });

    this.mounted = mountPromptEditor(this, this._editor, {
      mode: this.getAttribute('mode') ?? undefined,
    });
    if (this.getAttribute('placeholder')) {
      this._editor.configure({ placeholder: this.getAttribute('placeholder')! });
    }
    if (this.hasAttribute('disabled')) this._editor.configure({ disabled: true });
    if (this.hasAttribute('readonly')) this._editor.configure({ readonly: true });

    for (const type of FORWARDED_EVENTS) {
      this.unsubscribes.push(
        this._editor.on(type, (payload) => {
          this.dispatchEvent(
            new CustomEvent(`aic-${type}`, {
              detail: payload as PromptEditorEventMap[typeof type],
              bubbles: type === 'submit' || type === 'change',
              composed: true,
            }),
          );
        }),
      );
    }
  }

  private teardown(): void {
    for (const unsubscribe of this.unsubscribes.splice(0)) unsubscribe();
    this.mounted?.destroy();
    this.mounted = null;
  }
}

/** Register <ai-composer-editor>. Idempotent. */
export function defineAiComposerEditor(): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, AiComposerEditorElement);
  }
}

export { TAG_NAME };
