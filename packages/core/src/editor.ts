/**
 * The editor engine (ADR-0001). `AIComposer` is the public, framework-neutral
 * contract implemented by `AIComposerImpl` and created via
 * `createAIComposer()`. It owns the document, selection, state, history,
 * registries and the trigger engine — but no DOM.
 */

import { createEventBus, type Unsubscribe } from './events/event-bus';
import type {
  BeforeSubmitEvent,
  ChangeSource,
  AIComposerBus,
  AIComposerEventMap,
  AIComposerEventType,
  TriggerCloseReason,
} from './events/events';
import {
  coerceDocument,
  deleteDocumentRange,
  documentsEqual,
  findNodeIndex,
  getNodesOfType,
  insertNodesAt,
  isEmptyDocument,
  normalizeNodes,
  sanitizeDocument,
  type AIComposerDocument,
} from './model/document';
import {
  createTextNode,
  ensureNodeKey,
  type AttachmentNode,
  type AIComposerNode,
} from './model/nodes';
import {
  clampSelection,
  createPosition,
  createSelection,
  equalsSelection,
  fromGlobalOffset,
  getRange,
  toGlobalOffset,
  type DocumentRange,
  type Position,
  type SelectionState,
} from './model/selection';
import type { AIComposerState, SuggestionItem, TriggerState } from './state/state';
import { createCommandRegistry, type CommandRegistry, type AIComposerCommand } from './commands/registry';
import { createBuiltinCommands } from './commands/builtins';
import { createDefaultNodeRegistry, type NodeDefinition, type NodeRegistry } from './nodes/registry';
import {
  TriggerEngine,
  createTriggerRegistry,
  type AIComposerTrigger,
  type TriggerHost,
  type TriggerRegistry,
} from './triggers/engine';
import { EditorHistory } from './history/history';
import {
  createPluginRegistry,
  type PluginContext,
  type PluginRegistry,
  type AIComposerPlugin,
} from './plugins/registry';
import {
  createDefaultSerializers,
  createSerializerRegistry,
  type SerializationFormat,
  type Serializer,
  type SerializerRegistry,
} from './serialization/index';
import { ErrorCode, AIComposerError } from './errors';
import type { AIComposerConfig, AIComposerOptions } from './types';

/** Optional DOM/view handle attached by the DOM layer or an adapter. */
export interface EditorView {
  focus(): void;
  blur(): void;
  /** Re-render the document into the view. */
  render?(): void;
}

export interface SetValueOptions {
  source?: ChangeSource;
  /** Record as an undo step (default true). */
  history?: boolean;
  label?: string;
}

export interface TransactionOptions {
  label?: string;
  source?: ChangeSource;
  history?: boolean;
}

export interface InsertNodeOptions {
  at?: Position;
  /** Insert a trailing space and place the caret after it (default true). */
  trailingSpace?: boolean;
  source?: ChangeSource;
}

interface MutationOptions {
  source: ChangeSource;
  label: string;
  history: boolean;
  merge: boolean;
}

export type StateListener = (state: AIComposerState) => void;

/**
 * Public editor contract. Stable across framework adapters — if a method makes
 * sense without a browser, it belongs here, not in an adapter.
 */
export interface AIComposer {
  // -- value ---------------------------------------------------------------
  getValue(): AIComposerDocument;
  setValue(value: AIComposerDocument | AIComposerNode[] | string, options?: SetValueOptions): void;
  clear(): void;
  /** Replace a range with nodes in a single history step. */
  replaceRange(range: DocumentRange, nodes: AIComposerNode[], options?: { trailingSpace?: boolean; source?: ChangeSource }): void;

  // -- nodes ---------------------------------------------------------------
  insertText(text: string, at?: Position): void;
  insertNode(node: AIComposerNode, options?: InsertNodeOptions): void;
  removeNode(key: string): void;
  /** Reconcile a document parsed from the view (user typing). View-layer API. */
  applyViewUpdate(next: AIComposerDocument, selection?: SelectionState): void;

  // -- selection -----------------------------------------------------------
  getSelection(): SelectionState;
  setSelection(selection: SelectionState): void;

  // -- focus / lifecycle ----------------------------------------------------
  focus(): void;
  blur(): void;
  /** Called by the attached view on native focus changes. View-layer API. */
  setFocused(focused: boolean): void;
  attachView(view: EditorView): Unsubscribe;
  /** True once destroy() has run — adapters use this to rebuild safely. */
  isDestroyed(): boolean;
  destroy(): void;

  // -- submit ----------------------------------------------------------------
  submit(): Promise<void>;

  // -- history ----------------------------------------------------------------
  undo(): void;
  redo(): void;
  /** Group mutations into one undo step. */
  transaction(fn: () => void, options?: TransactionOptions): void;

  // -- commands ----------------------------------------------------------------
  readonly commands: CommandRegistry;
  executeCommand(id: string, payload?: unknown): Promise<void>;
  canExecuteCommand(id: string, payload?: unknown): boolean;

  // -- triggers ------------------------------------------------------------
  readonly triggers: TriggerRegistry;
  getActiveTrigger(): TriggerState | null;
  acceptSuggestion(item?: SuggestionItem): Promise<void>;
  moveSuggestionSelection(delta: number): void;
  closeTrigger(reason?: TriggerCloseReason): void;
  /** Insert a trigger character at the caret, opening its suggestion session. */
  openTrigger(triggerId: string): void;

  // -- registries (plugins) --------------------------------------------------
  readonly nodes: NodeRegistry;
  readonly serializers: SerializerRegistry;
  readonly pluginRegistry: PluginRegistry;
  registerPlugin(plugin: AIComposerPlugin): Unsubscribe;
  registerTrigger(trigger: AIComposerTrigger): Unsubscribe;
  registerCommand(command: AIComposerCommand): Unsubscribe;
  registerNodeType(definition: NodeDefinition): Unsubscribe;
  registerSerializer(serializer: Serializer): Unsubscribe;

  // -- events --------------------------------------------------------------
  on<K extends AIComposerEventType>(type: K, handler: (event: AIComposerEventMap[K]) => void): Unsubscribe;
  once<K extends AIComposerEventType>(type: K, handler: (event: AIComposerEventMap[K]) => void): Unsubscribe;
  off<K extends AIComposerEventType>(type: K, handler: (event: AIComposerEventMap[K]) => void): void;

  // -- state ---------------------------------------------------------------
  getState(): AIComposerState;
  subscribe(listener: StateListener): Unsubscribe;

  // -- config --------------------------------------------------------------
  getConfig(): AIComposerConfig;
  configure(patch: Partial<AIComposerOptions>): void;
  setMode(mode: string): void;
  setDisabled(disabled: boolean): void;
  setReadonly(readonly: boolean): void;

  // -- serialization ---------------------------------------------------------
  serialize(format: SerializationFormat): unknown;
}

export class AIComposerImpl implements AIComposer {
  readonly events: AIComposerBus = createEventBus<AIComposerEventMap>();
  readonly commands: CommandRegistry = createCommandRegistry();
  readonly triggers: TriggerRegistry = createTriggerRegistry();
  readonly nodes: NodeRegistry = createDefaultNodeRegistry();
  readonly serializers: SerializerRegistry = createSerializerRegistry();
  readonly pluginRegistry: PluginRegistry = createPluginRegistry();

  private readonly triggerEngine: TriggerEngine;
  private readonly history: EditorHistory;

  private config: AIComposerConfig;
  private document: AIComposerDocument;
  private selection: SelectionState = createSelection();
  private focused = false;
  private submitting = false;
  private destroyed = false;
  private mutationDepth = 0;
  private view: EditorView | null = null;
  private stateListeners = new Set<StateListener>();
  private stateCache: AIComposerState | null = null;

  constructor(options: AIComposerOptions = {}) {
    this.config = {
      mode: options.mode ?? 'default',
      placeholder: options.placeholder ?? '',
      submitKey: options.submitKey ?? 'enter',
      ...(options.disabled !== undefined ? { disabled: options.disabled } : {}),
      ...(options.readonly !== undefined ? { readonly: options.readonly } : {}),
      ...(options.submit ? { submit: options.submit } : {}),
      ...(options.history ? { history: options.history } : {}),
    };

    this.document = coerceDocument(options.value);
    this.selection = createSelection(
      fromGlobalOffset(this.document, documentLengthOf(this.document)),
    );
    this.history = new EditorHistory(this.config.history ?? {});
    this.triggerEngine = new TriggerEngine(this.createTriggerHost());

    for (const serializer of [...createDefaultSerializers(), ...(options.serializers ?? [])]) {
      this.serializers.register(serializer);
    }
    for (const definition of options.nodeTypes ?? []) {
      this.nodes.register(definition);
    }
    for (const command of createBuiltinCommands(this)) {
      this.commands.register(command);
    }
    for (const plugin of options.plugins ?? []) {
      this.pluginRegistry.install(plugin, this.createPluginContext());
    }

    this.stateCache = null;
  }

  // -- value ---------------------------------------------------------------

  getValue(): AIComposerDocument {
    return this.document;
  }

  setValue(value: AIComposerDocument | AIComposerNode[] | string, options: SetValueOptions = {}): void {
    this.assertAlive();
    const next = coerceDocument(value);
    this.mutate(
      () => {
        this.document = next;
        this.selection = createSelection(fromGlobalOffset(next, documentLengthOf(next)));
      },
      {
        source: options.source ?? 'api',
        label: options.label ?? 'setValue',
        history: options.history !== false,
        merge: false,
      },
    );
  }

  clear(): void {
    this.setValue([], { label: 'clear' });
  }

  replaceRange(
    range: DocumentRange,
    nodes: AIComposerNode[],
    options: { trailingSpace?: boolean; source?: ChangeSource } = {},
  ): void {
    this.assertAlive();
    this.mutate(
      () => {
        const { document, caret } = deleteDocumentRange(this.document, range);
        const inserted = options.trailingSpace ? [...nodes, createTextNode(' ')] : [...nodes];
        const result = insertNodesAt(document, caret, inserted);
        this.document = result.document;
        this.selection = createSelection(result.caret);
      },
      { source: options.source ?? 'api', label: 'replaceRange', history: true, merge: false },
    );
  }

  // -- nodes ---------------------------------------------------------------

  insertText(text: string, at?: Position): void {
    if (!text) return;
    this.assertAlive();
    this.mutate(
      () => {
        if (at) this.selection = createSelection(at);
        this.deleteSelectionIfNeeded();
        const result = insertNodesAt(this.document, this.selection.focus, [createTextNode(text)]);
        this.document = result.document;
        this.selection = createSelection(result.caret);
      },
      { source: 'api', label: 'insertText', history: true, merge: false },
    );
  }

  insertNode(node: AIComposerNode, options: InsertNodeOptions = {}): void {
    this.assertAlive();
    const prepared = ensureNodeKey(node);
    this.mutate(
      () => {
        if (options.at) this.selection = createSelection(options.at);
        this.deleteSelectionIfNeeded();
        const inserted =
          options.trailingSpace === false ? [prepared] : [prepared, createTextNode(' ')];
        const result = insertNodesAt(this.document, this.selection.focus, inserted);
        this.document = result.document;
        this.selection = createSelection(result.caret);
      },
      { source: options.source ?? 'api', label: 'insertNode', history: true, merge: false },
    );
    const index = findNodeIndex(this.document, prepared.key);
    if (index >= 0) {
      this.events.emit('nodeInsert', { node: prepared, index });
      if (prepared.type === 'attachment') {
        this.events.emit('attachmentAdd', { attachment: prepared as AttachmentNode });
      }
    }
  }

  removeNode(key: string): void {
    this.assertAlive();
    const index = findNodeIndex(this.document, key);
    if (index < 0) return;
    const node = this.document.nodes[index];
    const startOffset = toGlobalOffset(this.document, createPosition(index, 0));
    this.mutate(
      () => {
        this.document = {
          nodes: this.document.nodes.filter((candidate) => candidate.key !== key),
          ...(this.document.metadata ? { metadata: this.document.metadata } : {}),
        };
        this.selection = createSelection(fromGlobalOffset(this.document, startOffset));
      },
      { source: 'api', label: 'removeNode', history: true, merge: false },
    );
    this.events.emit('nodeRemove', { node, index });
    if (node.type === 'attachment') {
      this.events.emit('attachmentRemove', { attachment: node as AttachmentNode });
    }
  }

  applyViewUpdate(next: AIComposerDocument, selection?: SelectionState): void {
    this.assertAlive();
    if (documentsEqual(this.document, next)) {
      if (selection && !equalsSelection(clampSelection(next, selection), this.selection)) {
        this.setSelection(selection);
      }
      return;
    }
    const sanitized = sanitizeDocument(next, (type) => this.nodes.has(type));
    this.mutate(
      () => {
        this.document = sanitized;
        this.selection = clampSelection(sanitized, selection ?? this.selection);
      },
      // Typing merges within the history window so undo steps feel natural.
      { source: 'user', label: 'input', history: true, merge: true },
    );
  }

  // -- selection -----------------------------------------------------------

  getSelection(): SelectionState {
    return this.selection;
  }

  setSelection(selection: SelectionState): void {
    this.assertAlive();
    const next = clampSelection(this.document, selection);
    if (equalsSelection(next, this.selection)) return;
    this.selection = next;
    this.invalidateState();
    this.notify();
    this.events.emit('selectionChange', { selection: next });
    this.triggerEngine.handleSelectionChange();
  }

  // -- focus / lifecycle ------------------------------------------------------

  focus(): void {
    this.assertAlive();
    if (this.view) {
      this.view.focus();
      return;
    }
    this.setFocused(true);
  }

  blur(): void {
    this.assertAlive();
    if (this.view) {
      this.view.blur();
      return;
    }
    this.setFocused(false);
  }

  setFocused(focused: boolean): void {
    if (this.destroyed || this.focused === focused) return;
    this.focused = focused;
    this.invalidateState();
    this.notify();
    this.events.emit(focused ? 'focus' : 'blur', { focused });
    if (!focused) this.triggerEngine.close('blur');
  }

  attachView(view: EditorView): Unsubscribe {
    this.view = view;
    return () => {
      if (this.view === view) this.view = null;
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.triggerEngine.close('editor-destroy');
    this.events.emit('destroy', { target: 'editor' });
    this.pluginRegistry.destroyAll();
    this.view = null;
    this.events.clear();
    this.commands.clear();
    this.triggers.clear();
    this.serializers.clear();
    this.stateListeners.clear();
    this.history.reset();
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  // -- submit ----------------------------------------------------------------

  async submit(): Promise<void> {
    this.assertAlive();
    const state = this.getState();
    if (state.disabled || state.readonly || this.submitting) return;
    const allowEmpty = this.config.submit?.allowEmpty ?? false;
    if (!allowEmpty && isEmptyDocument(this.document) && state.attachments.length === 0) return;

    const before: BeforeSubmitEvent = {
      value: this.document,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    this.events.emit('beforeSubmit', before);
    if (before.defaultPrevented) return;

    this.submitting = true;
    this.invalidateState();
    this.notify();

    try {
      await this.config.submit?.onSubmit?.(this.document, this);
    } catch (error) {
      this.events.emit('error', { error: error instanceof Error ? error : new Error(String(error)), phase: 'submit' });
    } finally {
      this.submitting = false;
      this.invalidateState();
      this.notify();
      this.events.emit('submit', { value: this.document });
      if (this.config.submit?.clearOnSubmit) this.clear();
    }
  }

  // -- history ----------------------------------------------------------------

  undo(): void {
    this.assertAlive();
    const previous = this.history.undo({ document: this.document, selection: this.selection });
    if (!previous) return;
    this.restore(previous, 'undo');
  }

  redo(): void {
    this.assertAlive();
    const next = this.history.redo({ document: this.document, selection: this.selection });
    if (!next) return;
    this.restore(next, 'redo');
  }

  transaction(fn: () => void, options: TransactionOptions = {}): void {
    this.assertAlive();
    // Nested transactions join the outer one.
    if (this.mutationDepth > 0) {
      fn();
      return;
    }
    this.mutate(fn, {
      source: options.source ?? 'api',
      label: options.label ?? 'transaction',
      history: options.history !== false,
      merge: false,
    });
  }

  // -- commands ----------------------------------------------------------------

  async executeCommand(id: string, payload?: unknown): Promise<void> {
    this.assertAlive();
    const command = this.commands.get(id);
    if (!command) {
      throw new AIComposerError('UNKNOWN_COMMAND', `No command registered for "${id}"`);
    }
    const context = { editor: this as AIComposer, state: this.getState(), payload };
    if (command.canExecute && !command.canExecute(context)) return;
    this.events.emit('commandExecute', { id, payload });
    await command.execute(context);
  }

  canExecuteCommand(id: string, payload?: unknown): boolean {
    const command = this.commands.get(id);
    if (!command) return false;
    const context = { editor: this as AIComposer, state: this.getState(), payload };
    return command.canExecute ? command.canExecute(context) : true;
  }

  // -- triggers ------------------------------------------------------------

  getActiveTrigger(): TriggerState | null {
    return this.triggerEngine.activeTrigger;
  }

  async acceptSuggestion(item?: SuggestionItem): Promise<void> {
    await this.triggerEngine.accept(item);
  }

  moveSuggestionSelection(delta: number): void {
    this.triggerEngine.moveSelection(delta);
  }

  closeTrigger(reason: TriggerCloseReason = 'manual'): void {
    this.triggerEngine.close(reason);
  }

  openTrigger(triggerId: string): void {
    this.assertAlive();
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new AIComposerError('UNKNOWN_TRIGGER', `No trigger registered for "${triggerId}"`);
    }
    this.insertText(trigger.character, this.selection.focus);
    if (this.view) this.view.focus();
  }

  // -- plugins ---------------------------------------------------------------

  registerPlugin(plugin: AIComposerPlugin): Unsubscribe {
    this.assertAlive();
    return this.pluginRegistry.install(plugin, this.createPluginContext());
  }

  registerTrigger(trigger: AIComposerTrigger): Unsubscribe {
    return this.triggers.register(trigger);
  }

  registerCommand(command: AIComposerCommand): Unsubscribe {
    return this.commands.register(command);
  }

  registerNodeType(definition: NodeDefinition): Unsubscribe {
    return this.nodes.register(definition);
  }

  registerSerializer(serializer: Serializer): Unsubscribe {
    return this.serializers.register(serializer);
  }

  // -- events ----------------------------------------------------------------

  on<K extends AIComposerEventType>(
    type: K,
    handler: (event: AIComposerEventMap[K]) => void,
  ): Unsubscribe {
    return this.events.on(type, handler);
  }

  once<K extends AIComposerEventType>(
    type: K,
    handler: (event: AIComposerEventMap[K]) => void,
  ): Unsubscribe {
    return this.events.once(type, handler);
  }

  off<K extends AIComposerEventType>(type: K, handler: (event: AIComposerEventMap[K]) => void): void {
    this.events.off(type, handler);
  }

  // -- state ----------------------------------------------------------------

  getState(): AIComposerState {
    if (!this.stateCache) {
      this.stateCache = {
        value: this.document,
        focused: this.focused,
        disabled: this.config.disabled ?? false,
        readonly: this.config.readonly ?? false,
        submitting: this.submitting,
        selection: this.selection,
        activeTrigger: this.triggerEngine.activeTrigger,
        suggestions: this.triggerEngine.suggestions,
        activeSuggestionIndex: this.triggerEngine.activeSuggestionIndex,
        attachments: getNodesOfType<AttachmentNode>(this.document, 'attachment'),
        canUndo: this.history.canUndo,
        canRedo: this.history.canRedo,
        mode: this.config.mode ?? 'default',
        placeholder: this.config.placeholder ?? '',
        empty: isEmptyDocument(this.document),
      };
    }
    return this.stateCache;
  }

  subscribe(listener: StateListener): Unsubscribe {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  // -- config ----------------------------------------------------------------

  getConfig(): AIComposerConfig {
    return this.config;
  }

  configure(patch: Partial<AIComposerOptions>): void {
    const previousMode = this.config.mode;
    this.config = { ...this.config, ...patch };
    if (patch.history) this.history.setOptions(patch.history);
    this.invalidateState();
    this.notify();
    if (patch.mode !== undefined && patch.mode !== previousMode) {
      this.events.emit('modeChange', { mode: patch.mode });
    }
  }

  setMode(mode: string): void {
    if (this.config.mode === mode) return;
    this.configure({ mode });
  }

  setDisabled(disabled: boolean): void {
    if ((this.config.disabled ?? false) === disabled) return;
    this.configure({ disabled });
  }

  setReadonly(readonly: boolean): void {
    if ((this.config.readonly ?? false) === readonly) return;
    this.configure({ readonly });
  }

  // -- serialization -----------------------------------------------------------

  serialize(format: SerializationFormat): unknown {
    return this.serializers.serialize(format, this.document, { nodes: this.nodes });
  }

  // -- internals ----------------------------------------------------------------

  private assertAlive(): void {
    if (this.destroyed) {
      throw new AIComposerError(ErrorCode.EDITOR_DESTROYED, 'This editor has been destroyed');
    }
  }

  private deleteSelectionIfNeeded(): void {
    const { start, end } = getRange(this.selection);
    if (start.nodeIndex === end.nodeIndex && start.offset === end.offset) return;
    const result = deleteDocumentRange(this.document, { start, end });
    this.document = result.document;
    this.selection = createSelection(result.caret);
  }

  private mutate(fn: () => void, options: MutationOptions): void {
    if (this.mutationDepth > 0) {
      fn();
      return;
    }
    const previous = { document: this.document, selection: this.selection };
    this.mutationDepth += 1;
    try {
      fn();
    } finally {
      this.mutationDepth -= 1;
    }

    // Normalize (merge text runs) while keeping selection stable via global offsets.
    const anchorOffset = toGlobalOffset(this.document, this.selection.anchor);
    const focusOffset = toGlobalOffset(this.document, this.selection.focus);
    this.document = {
      nodes: normalizeNodes(this.document.nodes),
      ...(this.document.metadata ? { metadata: this.document.metadata } : {}),
    };
    this.selection = clampSelection(
      this.document,
      createSelection(
        fromGlobalOffset(this.document, anchorOffset),
        fromGlobalOffset(this.document, focusOffset),
      ),
    );

    if (options.history) {
      this.history.record(previous, { label: options.label, merge: options.merge });
    }
    this.commit(options.source);
  }

  private commit(source: ChangeSource): void {
    this.invalidateState();
    this.notify();
    this.events.emit('change', { value: this.document, source });
    if (source === 'user') {
      this.events.emit('input', { value: this.document, source });
    }
    this.triggerEngine.handleDocumentChange();
  }

  private restore(snapshot: { document: AIComposerDocument; selection: SelectionState }, source: 'undo' | 'redo'): void {
    this.document = snapshot.document;
    this.selection = clampSelection(snapshot.document, snapshot.selection);
    this.invalidateState();
    this.notify();
    this.events.emit('change', { value: this.document, source });
    this.view?.render?.();
  }

  private invalidateState(): void {
    this.stateCache = null;
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of [...this.stateListeners]) {
      try {
        listener(state);
      } catch (error) {
        console.error('[ai-composer] state listener failed', error);
      }
    }
  }

  private createTriggerHost(): TriggerHost {
    // Intentional this-alias: the host exposes getters bound to this instance.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const editor = this;
    return {
      get editor() {
        return editor as AIComposer;
      },
      get document() {
        return editor.document;
      },
      get selection() {
        return editor.selection;
      },
      get triggers() {
        return editor.triggers;
      },
      get events() {
        return editor.events;
      },
      patchState() {
        // State getters read the engine live — just invalidate + notify.
        editor.invalidateState();
        editor.notify();
      },
      replaceRun(state: TriggerState, nodes: AIComposerNode[], options?: { trailingSpace?: boolean; source?: ChangeSource }) {
        const range: DocumentRange = {
          start: createPosition(state.nodeIndex, state.triggerOffset),
          end: createPosition(state.nodeIndex, state.endOffset),
        };
        editor.replaceRange(range, nodes, options);
      },
    };
  }

  private createPluginContext(): PluginContext {
    return {
      editor: this as AIComposer,
      getConfig: () => this.config,
      commands: this.commands,
      triggers: this.triggers,
      nodes: this.nodes,
      serializers: this.serializers,
      events: this.events,
      onCleanup: () => undefined,
    };
  }
}

function documentLengthOf(document: AIComposerDocument): number {
  return document.nodes.reduce((sum, node) => sum + (node.type === 'text' ? node.text.length : 1), 0);
}

/** Runtime guard for values claimed to be editors (useful in adapters). */
export function isAIComposer(value: unknown): value is AIComposer {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AIComposer).getValue === 'function' &&
    typeof (value as AIComposer).setValue === 'function' &&
    typeof (value as AIComposer).subscribe === 'function'
  );
}
