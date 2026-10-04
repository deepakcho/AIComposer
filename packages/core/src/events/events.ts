/**
 * The editor event contract. Every adapter emits exactly these semantics, so
 * behavior can be contract-tested across frameworks.
 */

import type { EventBus } from './event-bus';
import type { PromptDocument } from '../model/document';
import type { AttachmentNode, PromptNode } from '../model/nodes';
import type { SelectionState } from '../model/selection';
import type { SuggestionItem } from '../state/state';

/** What caused a document change. */
export type ChangeSource = 'init' | 'user' | 'api' | 'plugin' | 'undo' | 'redo';

export interface ChangeEvent {
  value: PromptDocument;
  source: ChangeSource;
}

export interface FocusChangeEvent {
  focused: boolean;
}

export interface BeforeSubmitEvent {
  value: PromptDocument;
  defaultPrevented: boolean;
  preventDefault(): void;
}

export interface SubmitEvent {
  value: PromptDocument;
}

export interface SelectionChangeEvent {
  selection: SelectionState;
}

export interface TriggerOpenEvent {
  triggerId: string;
  query: string;
}

export type TriggerCloseReason =
  | 'select'
  | 'escape'
  | 'blur'
  | 'input'
  | 'manual'
  | 'editor-destroy';

export interface TriggerCloseEvent {
  triggerId: string;
  reason: TriggerCloseReason;
}

export interface SuggestionsChangeEvent {
  triggerId: string | null;
  suggestions: SuggestionItem[];
  activeIndex: number;
}

export interface NodeInsertEvent {
  node: PromptNode;
  index: number;
}

export interface NodeRemoveEvent {
  node: PromptNode;
  index: number;
}

export interface AttachmentEvent {
  attachment: AttachmentNode;
}

export interface CommandExecuteEvent {
  id: string;
  payload?: unknown;
}

export interface ModeChangeEvent {
  mode: string;
}

export interface ErrorEvent {
  error: Error;
  /** Where it happened, e.g. `trigger:mention:search`, `submit`. */
  phase?: string;
}

export interface DestroyEvent {
  target: 'editor';
}

export type PromptEditorEventMap = {
  /** Any value change, from any source. */
  change: ChangeEvent;
  /** Value change caused by user input (typing, paste, chip insert). */
  input: ChangeEvent;
  focus: FocusChangeEvent;
  blur: FocusChangeEvent;
  beforeSubmit: BeforeSubmitEvent;
  submit: SubmitEvent;
  selectionChange: SelectionChangeEvent;
  triggerOpen: TriggerOpenEvent;
  triggerClose: TriggerCloseEvent;
  suggestionsChange: SuggestionsChangeEvent;
  nodeInsert: NodeInsertEvent;
  nodeRemove: NodeRemoveEvent;
  attachmentAdd: AttachmentEvent;
  attachmentRemove: AttachmentEvent;
  commandExecute: CommandExecuteEvent;
  modeChange: ModeChangeEvent;
  error: ErrorEvent;
  destroy: DestroyEvent;
};

export type PromptEditorEventType = keyof PromptEditorEventMap & string;

export type PromptEditorBus = EventBus<PromptEditorEventMap>;
