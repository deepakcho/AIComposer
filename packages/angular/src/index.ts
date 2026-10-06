/**
 * @ai-composer/angular — Angular adapter (standalone components + signals).
 *
 * ```html
 * <aic-ai-composer [editor]="editor" mode="chat" placeholder="Ask anything…"
 *                    (submitted)="onSubmit($event)">
 *   <div aic-header>Context</div>
 *   <aic-ai-composer-input />
 *   <div aic-toolbar><aic-ai-composer-submit /></div>
 * </aic-ai-composer>
 * ```
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  Signal,
  computed,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  coerceDocument,
  createAIComposer,
  isAIComposer,
  type AIComposerDocument,
  type AIComposer,
  type AIComposerOptions,
  type AIComposerState,
} from '@ai-composer/core';
import { createEditableSurface, createSuggestionList } from '@ai-composer/dom';

/** Per-<aic-ai-composer> DI holder so projected children reach the editor. */
@Injectable()
export class AiComposerEditorHolder {
  editor: AIComposer | null = null;
}

/** Resolve the editor from the enclosing <aic-ai-composer>. */
export function injectAIComposer(): AIComposer {
  const holder = inject(AiComposerEditorHolder);
  if (!holder.editor) {
    throw new Error('injectAIComposer() must be called inside <aic-ai-composer>');
  }
  return holder.editor;
}

/** Live editor state as a signal (re-evaluated on every editor notify). */
export function injectAIComposerState(): Signal<AIComposerState | null> {
  const editor = injectAIComposer();
  const state = signal<AIComposerState | null>(editor.getState());
  // Cleanup rides on the root component destroying its editor.
  editor.subscribe((next) => state.set(next));
  return state.asReadonly();
}

// ---------------------------------------------------------------------------
// Slot marker directives (content projection anchors)
// ---------------------------------------------------------------------------

@Directive({ selector: '[aic-header]', standalone: true })
export class AIComposerHeaderDirective {}

@Directive({ selector: '[aic-toolbar]', standalone: true })
export class AIComposerToolbarDirective {}

@Directive({ selector: '[aic-footer]', standalone: true })
export class AIComposerFooterDirective {}

@Directive({ selector: '[aic-attachments]', standalone: true })
export class AIComposerAttachmentsDirective {}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

@Component({
  selector: 'aic-ai-composer',
  standalone: true,
  imports: [
    forwardRef(() => AIComposerInputComponent),
    forwardRef(() => SubmitButtonComponent),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AiComposerEditorHolder,
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: AIComposerComponent },
  ],
  template: `
    <ng-content select="[aic-header]" />
    <div class="aic-body" data-aic-slot="body">
      <ng-content select="[aic-attachments]" />
      <div class="aic-input-wrap">
        <aic-ai-composer-input />
      </div>
    </div>
    <ng-content select="[aic-toolbar]" />
    @if (showDefaultToolbar()) {
      <div class="aic-toolbar" data-aic-slot="toolbar">
        <aic-ai-composer-submit />
      </div>
    }
    <ng-content select="[aic-footer]" />
  `,
  host: {
    class: 'aic-root',
    '[attr.data-aic-mode]': 'state()?.mode ?? mode',
    '[style.--aic-input-max-height]':
      "maxHeight === '' ? null : (typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight)",
  },
})
export class AIComposerComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  /** External editor; when omitted one is created from `options`. */
  @Input() editor: AIComposer | null = null;
  @Input() options: AIComposerOptions | null = null;
  @Input() mode = 'default';
  @Input() placeholder = '';
  @Input({ transform: BooleanAttribute }) disabled = false;
  @Input({ transform: BooleanAttribute }) readonly = false;
  /** Auto-height ceiling — px number or CSS length; scrolls after the cap. */
  @Input() maxHeight: number | string = '';

  @Output() valueChange = new EventEmitter<AIComposerDocument>();
  @Output() submitted = new EventEmitter<AIComposerDocument>();

  /** Custom toolbar projection (suppresses the default one). */
  @ContentChild(AIComposerToolbarDirective)
  customToolbar: AIComposerToolbarDirective | null = null;

  readonly state = signal<AIComposerState | null>(null);

  /** Default circular send button for compact/chat/expanded (Copilot style). */
  readonly showDefaultToolbar = computed(() => {
    const current = this.state();
    const mode = current?.mode ?? this.mode;
    return (mode === 'compact' || mode === 'chat' || mode === 'expanded') && !this.customToolbar;
  });

  private created = false;
  private resolved: AIComposer | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(@Inject(AiComposerEditorHolder) private readonly holder: AiComposerEditorHolder) {}

  private get editorInstance(): AIComposer {
    if (!this.resolved) throw new Error('Editor not initialized');
    return this.resolved;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.resolved) return;
    const patch: Partial<AIComposerOptions> = {};
    if (changes['mode']?.currentValue) patch.mode = changes['mode'].currentValue;
    if (changes['placeholder']) patch.placeholder = changes['placeholder'].currentValue;
    if (changes['disabled']) patch.disabled = changes['disabled'].currentValue;
    if (changes['readonly']) patch.readonly = changes['readonly'].currentValue;
    if (Object.keys(patch).length > 0) this.editorInstance.configure(patch);
  }

  ngOnInit(): void {
    if (this.editor && isAIComposer(this.editor)) {
      this.resolved = this.editor;
    } else {
      this.resolved = createAIComposer({ ...(this.options ?? {}) });
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
  getEditor(): AIComposer {
    return this.editorInstance;
  }

  // -- ControlValueAccessor ---------------------------------------------------

  writeValue(value: unknown): void {
    if (value === null || value === undefined) return;
    const document = typeof value === 'string' ? value : coerceDocument(value as AIComposerDocument);
    this.editorInstance.setValue(document, { source: 'api' });
  }
  registerOnChange(fn: (value: AIComposerDocument) => void): void {
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
  selector: 'aic-ai-composer-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { class: 'aic-input-host', 'data-aic-slot': 'input' },
})
export class AIComposerInputComponent implements AfterViewInit, OnDestroy {
  private readonly holder = inject(AiComposerEditorHolder, { optional: true });
  private surface: ReturnType<typeof createEditableSurface> | null = null;
  private list: ReturnType<typeof createSuggestionList> | null = null;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const editor = this.holder?.editor;
    if (!editor) return;
    const host = this.elementRef.nativeElement;
    this.surface = createEditableSurface(editor, host);
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
  selector: 'aic-ai-composer-submit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    class="aic-toolbar-submit"
    data-aic-action="submit"
    aria-label="Send"
    [disabled]="!canSubmit()"
    (click)="submit()"
  >
    @if (state()?.submitting) {
      <span class="aic-spinner" aria-hidden="true"></span>
    } @else {
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
      </svg>
    }
  </button>`,
})
export class SubmitButtonComponent {
  private readonly editor = injectAIComposer();
  private readonly state = injectAIComposerState();
  readonly canSubmit = computed(() => {
    const state = this.state();
    if (!state) return false;
    return !state.disabled && !state.readonly && (!state.empty || state.attachments.length > 0);
  });

  submit(): void {
    void this.editor.submit();
  }
}

/** Convenience import collection. */
export const AI_COMPOSER_IMPORTS = [
  AIComposerComponent,
  AIComposerInputComponent,
  SubmitButtonComponent,
  AIComposerHeaderDirective,
  AIComposerToolbarDirective,
  AIComposerFooterDirective,
  AIComposerAttachmentsDirective,
] as const;
