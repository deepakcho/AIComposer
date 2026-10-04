/**
 * @ai-composer/angular — Angular adapter (standalone components + signals).
 *
 * ```html
 * <aic-prompt-editor [editor]="editor" mode="chat" placeholder="Ask anything…"
 *                    (submitted)="onSubmit($event)">
 *   <div aic-header>Context</div>
 *   <aic-prompt-input />
 *   <div aic-toolbar><aic-submit-button /></div>
 * </aic-prompt-editor>
 * ```
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  coerceDocument,
  createPromptEditor,
  isPromptEditor,
  type PromptDocument,
  type PromptEditor,
  type PromptEditorOptions,
  type PromptEditorState,
} from '@ai-composer/core';
import { createEditableSurface, createSuggestionList } from '@ai-composer/dom';

/** Per-<aic-prompt-editor> DI holder so projected children reach the editor. */
@Injectable()
export class AiComposerEditorHolder {
  editor: PromptEditor | null = null;
}

/** Resolve the editor from the enclosing <aic-prompt-editor>. */
export function injectPromptEditor(): PromptEditor {
  const holder = inject(AiComposerEditorHolder);
  if (!holder.editor) {
    throw new Error('injectPromptEditor() must be called inside <aic-prompt-editor>');
  }
  return holder.editor;
}

/** Live editor state as a signal (re-evaluated on every editor notify). */
export function injectPromptState(): Signal<PromptEditorState | null> {
  const editor = injectPromptEditor();
  const state = signal<PromptEditorState | null>(editor.getState());
  // Cleanup rides on the root component destroying its editor.
  editor.subscribe((next) => state.set(next));
  return state.asReadonly();
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

@Component({
  selector: 'aic-prompt-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AiComposerEditorHolder,
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: PromptEditorComponent },
  ],
  template: `
    <ng-content select="[aic-header]" />
    <div class="aic-body" data-aic-slot="body">
      <ng-content select="[aic-attachments]" />
      <aic-prompt-input />
    </div>
    <ng-content select="[aic-toolbar]" />
    <ng-content select="[aic-footer]" />
  `,
  host: { class: 'aic-root', '[attr.data-aic-mode]': 'state()?.mode ?? mode' },
})
export class PromptEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** External editor; when omitted one is created from `options`. */
  @Input() editor: PromptEditor | null = null;
  @Input() options: PromptEditorOptions | null = null;
  @Input() mode = 'default';
  @Input() placeholder = '';
  @Input({ transform: BooleanAttribute }) disabled = false;
  @Input({ transform: BooleanAttribute }) readonly = false;

  @Output() valueChange = new EventEmitter<PromptDocument>();
  @Output() submitted = new EventEmitter<PromptDocument>();

  readonly state = signal<PromptEditorState | null>(null);

  private created = false;
  private resolved: PromptEditor | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(@Inject(AiComposerEditorHolder) private readonly holder: AiComposerEditorHolder) {}

  private get editorInstance(): PromptEditor {
    if (!this.resolved) throw new Error('Editor not initialized');
    return this.resolved;
  }

  ngOnInit(): void {
    if (this.editor && isPromptEditor(this.editor)) {
      this.resolved = this.editor;
    } else {
      this.resolved = createPromptEditor({ ...(this.options ?? {}) });
      this.created = true;
    }
    this.holder.editor = this.resolved;
    this.editorInstance.configure({
      mode: this.mode,
      placeholder: this.placeholder,
      disabled: this.disabled,
      readonly: this.readonly,
    });
    this.state.set(this.editorInstance.getState());
    this.unsubscribe = this.editorInstance.subscribe((next) => {
      this.state.set(next);
    });
    this.editorInstance.on('change', (event) => this.valueChange.emit(event.value));
    this.editorInstance.on('submit', (event) => this.submitted.emit(event.value));
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.created) this.resolved?.destroy();
    this.holder.editor = null;
  }

  /** Direct access for template code: {{ editor().serialize('text') }} */
  getEditor(): PromptEditor {
    return this.editorInstance;
  }

  // -- ControlValueAccessor ---------------------------------------------------

  writeValue(value: unknown): void {
    if (value === null || value === undefined) return;
    const document = typeof value === 'string' ? value : coerceDocument(value as PromptDocument);
    this.editorInstance.setValue(document, { source: 'api' });
  }
  registerOnChange(fn: (value: PromptDocument) => void): void {
    this.editorInstance.on('change', (event) => fn(event.value));
  }
  registerOnTouched(fn: () => void): void {
    this.editorInstance.on('blur', () => fn());
  }
  setDisabledState(isDisabled: boolean): void {
    this.editorInstance.setDisabled(isDisabled);
  }
}

// Minimal boolean attribute transform (standalone, Angular 16+ compatible)
function BooleanAttribute(value: unknown): boolean {
  return value === '' || value === true;
}

// ---------------------------------------------------------------------------
// Input surface
// ---------------------------------------------------------------------------

@Component({
  selector: 'aic-prompt-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { class: 'aic-input-host', 'data-aic-slot': 'input' },
})
export class PromptInputComponent implements AfterViewInit, OnDestroy {
  private readonly holder = inject(AiComposerEditorHolder, { optional: true });
  private surface: ReturnType<typeof createEditableSurface> | null = null;
  private list: ReturnType<typeof createSuggestionList> | null = null;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const editor = this.holder?.editor;
    if (!editor) return;
    const host = this.elementRef.nativeElement;
    this.surface = createEditableSurface(editor, host, {
      multiline: editor.getState().mode !== 'compact',
    });
    this.list = createSuggestionList(editor, undefined, { inputHost: host });
    if (host.parentElement) host.parentElement.appendChild(this.list.element);
  }

  ngOnDestroy(): void {
    this.list?.destroy();
    this.surface?.destroy();
    this.list = null;
    this.surface = null;
  }
}

// ---------------------------------------------------------------------------
// Default actions
// ---------------------------------------------------------------------------

@Component({
  selector: 'aic-submit-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    class="aic-toolbar-submit"
    data-aic-action="submit"
    [disabled]="!canSubmit()"
    (click)="submit()"
  >{{ label() }}</button>`,
})
export class SubmitButtonComponent {
  private readonly editor = injectPromptEditor();
  private readonly state = injectPromptState();
  readonly label = computed(() => (this.state()?.submitting ? '…' : 'Send'));
  readonly canSubmit = computed(() => {
    const state = this.state();
    if (!state) return false;
    return !state.disabled && !state.readonly && (!state.empty || state.attachments.length > 0);
  });

  submit(): void {
    void this.editor.submit();
  }
}

// ---------------------------------------------------------------------------
// Slot marker directives (content projection anchors)
// ---------------------------------------------------------------------------

@Directive({ selector: '[aic-header]', standalone: true })
export class PromptHeaderDirective {}

@Directive({ selector: '[aic-toolbar]', standalone: true })
export class PromptToolbarDirective {}

@Directive({ selector: '[aic-footer]', standalone: true })
export class PromptFooterDirective {}

@Directive({ selector: '[aic-attachments]', standalone: true })
export class PromptAttachmentsDirective {}

/** Convenience import collection. */
export const AI_COMPOSER_IMPORTS = [
  PromptEditorComponent,
  PromptInputComponent,
  SubmitButtonComponent,
  PromptHeaderDirective,
  PromptToolbarDirective,
  PromptFooterDirective,
  PromptAttachmentsDirective,
] as const;
