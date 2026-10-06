/**
 * Observable, framework-neutral editor state. Adapters expose it as
 * React hooks state, Angular signals, Vue refs, Svelte stores — core stays UI-free.
 */

import type { AIComposerDocument } from '../model/document';
import type { AttachmentNode } from '../model/nodes';
import type { SelectionState } from '../model/selection';

/** One entry of a trigger's suggestion list. */
export interface SuggestionItem {
  id: string;
  label: string;
  description?: string;
  /** Optional grouping heading in the suggestion UI. */
  group?: string;
  /** Icon name/URL — rendering is up to the UI layer. */
  icon?: string;
  /** Plugin-specific payload handed back on select. */
  data?: Record<string, unknown>;
}

/** Live trigger session, e.g. while the user types "@jo". */
export interface TriggerState {
  triggerId: string;
  /** Text typed after the trigger character. */
  query: string;
  /** Index of the text node containing the trigger run. */
  nodeIndex: number;
  /** Offset of the trigger character within that text node. */
  triggerOffset: number;
  /** Offset where the query ends (the caret at scan time). */
  endOffset: number;
}

export interface AIComposerState {
  /** Current document value. */
  value: AIComposerDocument;
  focused: boolean;
  disabled: boolean;
  readonly: boolean;
  /** True while an async submit handler is running. */
  submitting: boolean;
  selection: SelectionState;
  activeTrigger: TriggerState | null;
  suggestions: SuggestionItem[];
  /** Highlighted suggestion (-1 when none). */
  activeSuggestionIndex: number;
  /** Convenience view of attachment nodes inside the document. */
  attachments: AttachmentNode[];
  canUndo: boolean;
  canRedo: boolean;
  /** Active presentation mode / preset name (e.g. 'chat'). */
  mode: string;
  placeholder: string;
  empty: boolean;
}
