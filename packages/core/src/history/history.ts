/**
 * Undo/redo — snapshot-based history (ADR-0003). Prompt documents are small,
 * so storing immutable document references beats operational transforms in
 * simplicity and debuggability. Rapid consecutive user edits (typing) within
 * `mergeWindowMs` collapse into a single undo step.
 */

import type { PromptDocument } from '../model/document';
import type { SelectionState } from '../model/selection';

export interface HistorySnapshot {
  document: PromptDocument;
  selection: SelectionState;
}

interface HistoryEntry extends HistorySnapshot {
  label: string;
  timestamp: number;
}

export interface HistoryOptions {
  /** Max undo steps kept (default 200). */
  limit?: number;
  /** Window in ms within which same-label user edits merge (default 500). */
  mergeWindowMs?: number;
}

export const DEFAULT_HISTORY_OPTIONS: Required<HistoryOptions> = {
  limit: 200,
  mergeWindowMs: 500,
};

export interface RecordOptions {
  /** Change label — merges only happen between identical labels. */
  label?: string;
  /** Only same-label merges; requires the caller to opt in (user typing). */
  merge?: boolean;
}

export class EditorHistory {
  private options: Required<HistoryOptions>;
  /** States we can go back TO. */
  private undoStack: HistoryEntry[] = [];
  /** States we can go forward TO. */
  private redoStack: HistoryEntry[] = [];

  constructor(options: HistoryOptions = {}) {
    this.options = { ...DEFAULT_HISTORY_OPTIONS, ...options };
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Record a change. `previous` is the state BEFORE the change; documents are
   * immutable so no cloning is needed.
   */
  record(previous: HistorySnapshot, options: RecordOptions = {}): void {
    const label = options.label ?? 'edit';
    this.redoStack = [];

    const top = this.undoStack[this.undoStack.length - 1];
    const shouldMerge =
      options.merge === true &&
      top !== undefined &&
      top.label === label &&
      Date.now() - top.timestamp <= this.options.mergeWindowMs;

    if (!shouldMerge) {
      this.undoStack.push({ ...previous, label, timestamp: Date.now() });
      if (this.undoStack.length > this.options.limit) this.undoStack.shift();
    }
  }

  /** Return the state to restore, or null when nothing to undo. */
  undo(current: HistorySnapshot): HistorySnapshot | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.redoStack.push({ ...current, label: entry.label, timestamp: Date.now() });
    return { document: entry.document, selection: entry.selection };
  }

  /** Return the state to restore, or null when nothing to redo. */
  redo(current: HistorySnapshot): HistorySnapshot | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    this.undoStack.push({ ...current, label: entry.label, timestamp: Date.now() });
    return { document: entry.document, selection: entry.selection };
  }

  setOptions(options: HistoryOptions): void {
    this.options = { ...this.options, ...options };
  }

  getOptions(): Required<HistoryOptions> {
    return { ...this.options };
  }

  reset(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
