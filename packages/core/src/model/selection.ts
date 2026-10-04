/**
 * Selection model — framework-neutral positions against the document model,
 * never raw DOM Range objects (see ADR-0001).
 */

import type { PromptDocument } from './document';
import { nodeLength } from './document';

/** Caret or selection endpoint. For atomic nodes offset is 0 (before) or 1 (after). */
export interface Position {
  nodeIndex: number;
  offset: number;
}

export interface SelectionState {
  anchor: Position;
  focus: Position;
}

export interface DocumentRange {
  start: Position;
  end: Position;
}

export const createPosition = (nodeIndex: number, offset = 0): Position => ({ nodeIndex, offset });

export const createSelection = (
  anchor: Position = createPosition(0, 0),
  focus: Position = anchor,
): SelectionState => ({ anchor, focus });

export function equalsPosition(a: Position, b: Position): boolean {
  return a.nodeIndex === b.nodeIndex && a.offset === b.offset;
}

export function equalsSelection(a: SelectionState, b: SelectionState): boolean {
  return equalsPosition(a.anchor, b.anchor) && equalsPosition(a.focus, b.focus);
}

/** Total order over positions: by node index, then offset. */
export function comparePositions(a: Position, b: Position): number {
  if (a.nodeIndex !== b.nodeIndex) return a.nodeIndex < b.nodeIndex ? -1 : 1;
  if (a.offset === b.offset) return 0;
  return a.offset < b.offset ? -1 : 1;
}

export const isCollapsed = (selection: SelectionState): boolean =>
  equalsPosition(selection.anchor, selection.focus);

/** Anchor→focus ordering regardless of selection direction. */
export function getRange(selection: SelectionState): DocumentRange {
  return comparePositions(selection.anchor, selection.focus) <= 0
    ? { start: selection.anchor, end: selection.focus }
    : { start: selection.focus, end: selection.anchor };
}

export const getStart = (selection: SelectionState): Position => getRange(selection).start;
export const getEnd = (selection: SelectionState): Position => getRange(selection).end;

/** Convert a model position into a document-wide character offset. */
export function toGlobalOffset(document: PromptDocument, position: Position): number {
  let offset = 0;
  for (let i = 0; i < position.nodeIndex && i < document.nodes.length; i += 1) {
    offset += nodeLength(document.nodes[i]);
  }
  const node = document.nodes[position.nodeIndex];
  if (!node) return offset;
  if (node.type === 'text') return offset + Math.min(Math.max(position.offset, 0), node.text.length);
  return offset + (position.offset > 0 ? 1 : 0);
}

/** Convert a document-wide offset back into a node-relative position. */
export function fromGlobalOffset(document: PromptDocument, globalOffset: number): Position {
  let remaining = Math.max(0, globalOffset);
  for (let i = 0; i < document.nodes.length; i += 1) {
    const length = nodeLength(document.nodes[i]);
    if (remaining < length || (remaining === length && i === document.nodes.length - 1)) {
      return createPosition(i, remaining);
    }
    remaining -= length;
  }
  return createPosition(document.nodes.length, 0);
}

export function clampPosition(document: PromptDocument, position: Position): Position {
  const maxIndex = document.nodes.length;
  const nodeIndex = Math.min(Math.max(position.nodeIndex, 0), maxIndex);
  if (nodeIndex === maxIndex) {
    // At (or beyond) the end boundary: clamp onto the last node's end.
    if (maxIndex === 0) return createPosition(0, 0);
    const last = document.nodes[maxIndex - 1];
    return createPosition(maxIndex - 1, nodeLength(last));
  }
  const node = document.nodes[nodeIndex];
  if (!node) return createPosition(nodeIndex, 0);
  const maxOffset = nodeLength(node);
  return createPosition(nodeIndex, Math.min(Math.max(position.offset, 0), maxOffset));
}

export function clampSelection(document: PromptDocument, selection: SelectionState): SelectionState {
  return createSelection(clampPosition(document, selection.anchor), clampPosition(document, selection.focus));
}

export function globalRange(document: PromptDocument, selection: SelectionState): { start: number; end: number } {
  const { start, end } = getRange(selection);
  return { start: toGlobalOffset(document, start), end: toGlobalOffset(document, end) };
}
