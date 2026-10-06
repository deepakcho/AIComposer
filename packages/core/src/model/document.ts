/**
 * Composer document — the authoritative, framework-neutral value of an editor
 * (model-first architecture, ADR-0001). Documents are treated as immutable:
 * edit helpers return new documents and never mutate node objects.
 */

import {
  createNodeKey,
  createTextNode,
  isAIComposerNode,
  type AIComposerNode,
} from './nodes';
import { fromGlobalOffset, toGlobalOffset, type Position, type DocumentRange } from './selection';

export interface AIComposerDocument {
  nodes: AIComposerNode[];
  metadata?: Record<string, unknown>;
}

export function createDocument(nodes: AIComposerNode[] = [], metadata?: Record<string, unknown>): AIComposerDocument {
  const document: AIComposerDocument = { nodes: normalizeNodes(nodes) };
  if (metadata !== undefined) document.metadata = metadata;
  return document;
}

/** Coerce common inputs into a document. */
export function coerceDocument(value: AIComposerDocument | AIComposerNode[] | string | null | undefined): AIComposerDocument {
  if (value === null || value === undefined) return createDocument([]);
  if (typeof value === 'string') return createDocument(value ? [createTextNode(value)] : []);
  if (Array.isArray(value)) return createDocument(value);
  return createDocument(value.nodes ?? [], value.metadata);
}

/**
 * Merge adjacent text nodes and drop empty text runs. Returns a new array;
 * input nodes are never mutated.
 */
export function normalizeNodes(nodes: AIComposerNode[]): AIComposerNode[] {
  const result: AIComposerNode[] = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      if (node.text === '') continue;
      const last = result[result.length - 1];
      if (last && last.type === 'text') {
        result[result.length - 1] = { ...last, text: last.text + node.text };
        continue;
      }
    }
    result.push(node);
  }
  return result;
}

export function nodeLength(node: AIComposerNode): number {
  return node.type === 'text' ? node.text.length : 1;
}

export function totalLength(nodes: AIComposerNode[]): number {
  return nodes.reduce((sum, node) => sum + nodeLength(node), 0);
}

export function documentLength(document: AIComposerDocument): number {
  return totalLength(document.nodes);
}

/**
 * True when there is nothing meaningful to show or submit: no chips and no
 * text beyond whitespace. ContentEditable hosts keep a layout `<br>` after
 * the user deletes everything — that artifact must read as empty or the
 * placeholder never comes back.
 */
export function isEmptyDocument(document: AIComposerDocument): boolean {
  let sawChip = false;
  let sawText = false;
  for (const node of document.nodes) {
    if (node.type !== 'text') sawChip = true;
    else if (node.text.trim().length > 0) sawText = true;
  }
  return !sawChip && !sawText;
}

export function findNodeIndex(document: AIComposerDocument, key: string): number {
  return document.nodes.findIndex((node) => node.key === key);
}

export function findNode(document: AIComposerDocument, key: string): { node: AIComposerNode; index: number } | null {
  const index = findNodeIndex(document, key);
  return index >= 0 ? { node: document.nodes[index], index } : null;
}

export function getNodesOfType<T extends AIComposerNode>(document: AIComposerDocument, type: T['type']): T[] {
  return document.nodes.filter((node): node is T => node.type === type);
}

export function cloneDocument(document: AIComposerDocument): AIComposerDocument {
  return {
    nodes: document.nodes.map((node) => ({ ...node })),
    ...(document.metadata ? { metadata: { ...document.metadata } } : {}),
  };
}

export function documentsEqual(a: AIComposerDocument, b: AIComposerDocument): boolean {
  if (a === b) return true;
  return JSON.stringify(a.nodes) === JSON.stringify(b.nodes);
}

/**
 * Replace unknown/unregistered node types with a readable text node so that
 * documents from external sources (paste, storage, setValue) can never inject
 * unrenderable nodes.
 */
export function sanitizeDocument(
  document: AIComposerDocument,
  isKnownType: (type: string) => boolean,
): AIComposerDocument {
  const nodes = document.nodes.map((node) => {
    if (isKnownType(node.type) && isAIComposerNode(node)) return node;
    if (node.type === 'text' && typeof (node as { text?: unknown }).text === 'string') {
      return createTextNode((node as { text: string }).text);
    }
    return createTextNode(JSON.stringify(node));
  });
  return createDocument(nodes, document.metadata);
}

// ---------------------------------------------------------------------------
// Edit primitives (pure)
// ---------------------------------------------------------------------------

/** Delete `range` (inclusive) and report the caret position after deletion. */
export function deleteDocumentRange(
  document: AIComposerDocument,
  range: DocumentRange,
): { document: AIComposerDocument; caret: Position } {
  const startOffset = toGlobalOffset(document, range.start);
  const endOffset = toGlobalOffset(document, range.end);
  const low = Math.min(startOffset, endOffset);
  const high = Math.max(startOffset, endOffset);

  const nodes: AIComposerNode[] = [];
  let cursor = 0;
  for (const node of document.nodes) {
    const length = nodeLength(node);
    const nodeStart = cursor;
    const nodeEnd = cursor + length;

    if (nodeEnd <= low || nodeStart >= high) {
      nodes.push(node);
      cursor = nodeEnd;
      continue;
    }

    if (node.type === 'text') {
      const keepBefore = Math.max(0, low - nodeStart);
      const keepAfter = Math.max(0, nodeEnd - high);
      if (keepBefore > 0) nodes.push({ ...node, text: node.text.slice(0, keepBefore) });
      if (keepAfter > 0) nodes.push(createTextNode(node.text.slice(node.text.length - keepAfter)));
    }
    // atomic nodes overlapping the range are removed entirely
    cursor = nodeEnd;
  }

  const next: AIComposerDocument = { nodes, ...(document.metadata ? { metadata: document.metadata } : {}) };
  const normalized: AIComposerDocument = { ...next, nodes: normalizeNodes(next.nodes) };
  return { document: normalized, caret: fromGlobalOffset(normalized, low) };
}

/** Insert `inserted` at `position` (splitting a text node when needed). */
export function insertNodesAt(
  document: AIComposerDocument,
  position: Position,
  inserted: AIComposerNode[],
): { document: AIComposerDocument; caret: Position } {
  if (inserted.length === 0) return { document, caret: position };

  const index = Math.min(Math.max(position.nodeIndex, 0), document.nodes.length);
  const target = document.nodes[index];
  const result: AIComposerNode[] = [...document.nodes.slice(0, index)];

  if (target && target.type === 'text') {
    const offset = Math.min(Math.max(position.offset, 0), target.text.length);
    if (offset === 0) {
      result.push(...inserted, target);
    } else if (offset === target.text.length) {
      result.push(target, ...inserted);
    } else {
      result.push(
        { ...target, text: target.text.slice(0, offset) },
        ...inserted,
        createTextNode(target.text.slice(offset), createNodeKey('text')),
      );
    }
  } else if (target) {
    // atomic target: offset 0 = before the chip, 1 = after it
    if (position.offset > 0) result.push(target, ...inserted);
    else result.push(...inserted, target);
  } else {
    result.push(...inserted);
  }

  result.push(...document.nodes.slice(index + 1));

  const next: AIComposerDocument = { nodes: result, ...(document.metadata ? { metadata: document.metadata } : {}) };
  const normalized: AIComposerDocument = { ...next, nodes: normalizeNodes(next.nodes) };
  const caretOffset = toGlobalOffset(document, position) + totalLength(inserted);
  return { document: normalized, caret: fromGlobalOffset(normalized, caretOffset) };
}
