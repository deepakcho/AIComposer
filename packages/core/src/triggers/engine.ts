/**
 * Trigger system — detects trigger characters (`@`, `/`, `#`, `$`, `:` …)
 * typed before the caret, runs the owning trigger's search, and manages the
 * suggestion session in editor state.
 */

import type { Unsubscribe } from '../events/event-bus';
import { AIComposerError, toError } from '../errors';
import {
  createCommandNode,
  createCustomNode,
  createMentionNode,
  createVariableNode,
  type AIComposerNode,
} from '../model/nodes';
import type { AIComposerDocument } from '../model/document';
import type { SelectionState } from '../model/selection';
import type { SuggestionItem, TriggerState } from '../state/state';
import type { AIComposer } from '../editor';
import type { AIComposerBus } from '../events/events';

export interface TriggerSearchContext {
  query: string;
  document: AIComposerDocument;
  selection: SelectionState;
  /** Aborted when a newer keystroke superseded this search. */
  signal?: AbortSignal;
}

export interface TriggerSelectContext {
  editor: AIComposer;
  document: AIComposerDocument;
  /** Text node index containing the trigger run. */
  nodeIndex: number;
  /** Offset of the trigger character. */
  triggerOffset: number;
  /** Offset where the query ends. */
  endOffset: number;
  query: string;
  item: SuggestionItem;
}

export interface AIComposerTrigger {
  id: string;
  /** Character that activates the trigger, e.g. '@'. */
  character: string;
  /** Node type produced by the default select behavior ('mention' by default). */
  type?: string;
  /** Allow spaces inside the query (default false). */
  allowSpaces?: boolean;
  /** Allow the trigger character mid-word, e.g. "user@x" (default false). */
  allowMidWord?: boolean;
  /** Provide suggestions for the current query. */
  search(context: TriggerSearchContext): SuggestionItem[] | Promise<SuggestionItem[]>;
  /**
   * Handle selection. When omitted, the trigger run is replaced with an
   * atomic node built from the item (see createNodeFromSuggestion).
   */
  select?(item: SuggestionItem, context: TriggerSelectContext): void;
}

export interface TriggerRegistry {
  register(trigger: AIComposerTrigger): Unsubscribe;
  get(id: string): AIComposerTrigger | undefined;
  list(): AIComposerTrigger[];
  clear(): void;
}

export function createTriggerRegistry(): TriggerRegistry {
  const triggers = new Map<string, AIComposerTrigger>();
  return {
    register(trigger) {
      triggers.set(trigger.id, trigger);
      return () => {
        if (triggers.get(trigger.id) === trigger) triggers.delete(trigger.id);
      };
    },
    get(id) {
      return triggers.get(id);
    },
    list() {
      return [...triggers.values()];
    },
    clear() {
      triggers.clear();
    },
  };
}

/** Build the atomic node a trigger inserts for a chosen suggestion. */
export function createNodeFromSuggestion(trigger: AIComposerTrigger, item: SuggestionItem): AIComposerNode {
  const type = trigger.type ?? 'mention';
  switch (type) {
    case 'mention':
      return createMentionNode({
        id: item.id,
        label: item.label,
        ...(item.data ? { metadata: item.data } : {}),
      });
    case 'command':
      return createCommandNode({
        id: item.id,
        label: item.label,
        ...(item.data ? { metadata: item.data } : {}),
      });
    case 'variable':
      return createVariableNode({ name: item.label, value: item.data?.value });
    default:
      return createCustomNode({
        plugin: trigger.id,
        nodeType: type,
        data: item.data ?? { id: item.id, label: item.label },
      });
  }
}

/** Narrow host surface the engine needs from the editor (keeps the engine testable). */
export interface TriggerHost {
  readonly editor: AIComposer;
  readonly document: AIComposerDocument;
  readonly selection: SelectionState;
  readonly triggers: TriggerRegistry;
  readonly events: AIComposerBus;
  patchState(patch: { activeTrigger?: TriggerState | null; suggestions?: SuggestionItem[]; activeSuggestionIndex?: number }): void;
  /** Replace the trigger run with nodes as one history step; caret lands after the run. */
  replaceRun(state: TriggerState, nodes: AIComposerNode[], options?: { trailingSpace?: boolean; source?: 'api' | 'plugin' | 'user' }): void;
}

const WORD_CHAR = /[\p{L}\p{N}_]/u;

export class TriggerEngine {
  private active: TriggerState | null = null;
  private items: SuggestionItem[] = [];
  private activeIndex = -1;
  private searchToken = 0;

  constructor(private readonly host: TriggerHost) {}

  get activeTrigger(): TriggerState | null {
    return this.active;
  }

  get suggestions(): SuggestionItem[] {
    return this.items;
  }

  get activeSuggestionIndex(): number {
    return this.activeIndex;
  }

  /** Re-evaluate the trigger context after a document change. */
  handleDocumentChange(): void {
    this.evaluate();
  }

  handleSelectionChange(): void {
    this.evaluate();
  }

  /** Move the highlighted suggestion (ArrowUp/ArrowDown). */
  moveSelection(delta: number): void {
    if (!this.active || this.items.length === 0) return;
    const next = (this.activeIndex + delta + this.items.length) % this.items.length;
    this.setSuggestions(this.active.triggerId, this.items, next);
  }

  /** Accept a suggestion (click, Enter/Tab, or programmatic). */
  async accept(item?: SuggestionItem): Promise<void> {
    const state = this.active;
    if (!state) return;
    const trigger = this.host.triggers.get(state.triggerId);
    if (!trigger) {
      this.close('manual');
      return;
    }
    const chosen = item ?? (this.activeIndex >= 0 ? this.items[this.activeIndex] : undefined) ?? this.items[0];
    if (!chosen) return;

    const context: TriggerSelectContext = {
      editor: this.host.editor,
      document: this.host.document,
      nodeIndex: state.nodeIndex,
      triggerOffset: state.triggerOffset,
      endOffset: state.endOffset,
      query: state.query,
      item: chosen,
    };

    this.close('select');
    try {
      if (trigger.select) {
        await trigger.select(chosen, context);
      } else {
        this.host.replaceRun(state, [createNodeFromSuggestion(trigger, chosen)], {
          trailingSpace: true,
          source: 'plugin',
        });
      }
    } catch (error) {
      this.host.events.emit('error', { error: toError(error), phase: `trigger:${trigger.id}:select` });
    }
  }

  /** Close the active trigger session. */
  close(reason: 'select' | 'escape' | 'blur' | 'input' | 'manual' | 'editor-destroy'): void {
    const state = this.active;
    if (!state) return;
    this.active = null;
    this.items = [];
    this.activeIndex = -1;
    this.host.patchState({ activeTrigger: null, suggestions: [], activeSuggestionIndex: -1 });
    this.host.events.emit('triggerClose', { triggerId: state.triggerId, reason });
  }

  private evaluate(): void {
    const document = this.host.document;
    const selection = this.host.selection;

    if (selection.anchor.nodeIndex !== selection.focus.nodeIndex ||
        selection.anchor.offset !== selection.focus.offset) {
      this.close('input');
      return;
    }

    const node = document.nodes[selection.focus.nodeIndex];
    if (!node || node.type !== 'text') {
      this.close('input');
      return;
    }

    const before = node.text.slice(0, selection.focus.offset);
    let best: { trigger: AIComposerTrigger; state: TriggerState } | null = null;

    for (const trigger of this.host.triggers.list()) {
      const index = before.lastIndexOf(trigger.character);
      if (index === -1) continue;
      const query = before.slice(index + 1);
      if (query.includes('\n')) continue;
      if (!trigger.allowSpaces && /\s/.test(query)) continue;
      if (!trigger.allowMidWord && index > 0 && WORD_CHAR.test(before[index - 1] ?? '')) continue;
      if (!best || index > best.state.triggerOffset) {
        best = {
          trigger,
          state: {
            triggerId: trigger.id,
            query,
            nodeIndex: selection.focus.nodeIndex,
            triggerOffset: index,
            endOffset: selection.focus.offset,
          },
        };
      }
    }

    const previous = this.active;
    if (!best) {
      this.close('input');
      return;
    }

    const changed =
      !previous ||
      previous.triggerId !== best.state.triggerId ||
      previous.query !== best.state.query ||
      previous.nodeIndex !== best.state.nodeIndex ||
      previous.triggerOffset !== best.state.triggerOffset;

    this.active = best.state;
    if (!previous || previous.triggerId !== best.trigger.id) {
      this.host.events.emit('triggerOpen', { triggerId: best.trigger.id, query: best.state.query });
    }
    this.host.patchState({ activeTrigger: best.state });
    if (changed) {
      this.setSuggestions(best.state.triggerId, [], -1);
      void this.runSearch(best.trigger, best.state);
    }
  }

  private async runSearch(trigger: AIComposerTrigger, state: TriggerState): Promise<void> {
    const token = ++this.searchToken;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    try {
      const results = await trigger.search({
        query: state.query,
        document: this.host.document,
        selection: this.host.selection,
        signal: controller?.signal,
      });
      if (token !== this.searchToken || this.active !== state) return;
      const items = (results ?? []).filter((item) => item && typeof item.id === 'string');
      if (items.length === 0) {
        this.setSuggestions(state.triggerId, [], -1);
        return;
      }
      this.setSuggestions(state.triggerId, items, 0);
    } catch (error) {
      if (token === this.searchToken) {
        this.host.events.emit('error', { error: toError(error), phase: `trigger:${trigger.id}:search` });
      }
    }
  }

  private setSuggestions(triggerId: string, items: SuggestionItem[], activeIndex: number): void {
    this.items = items;
    this.activeIndex = activeIndex;
    this.host.patchState({ suggestions: items, activeSuggestionIndex: activeIndex });
    this.host.events.emit('suggestionsChange', { triggerId: items.length ? triggerId : null, suggestions: items, activeIndex });
  }
}

/** Convenience factory used by tests and plugins to build triggers quickly. */
export function defineTrigger(trigger: AIComposerTrigger): AIComposerTrigger {
  if (!trigger.character || trigger.character.length !== 1) {
    throw new AIComposerError('UNKNOWN_TRIGGER', `Trigger "${trigger.id}" must define a single character`);
  }
  return trigger;
}
