/**
 * DOM selection ↔ model selection mapping. All coordinates are computed as
 * document-wide offsets over the same segment order the renderer produces:
 * text characters, `<br>` = 1, chip = 1.
 */

import {
  clampSelection,
  createSelection,
  fromGlobalOffset,
  globalRange,
  type PromptDocument,
  type SelectionState,
} from '@ai-composer/core';

interface DomPoint {
  node: Node;
  offset: number;
}

function isChip(node: Node): boolean {
  return node instanceof HTMLElement && node.hasAttribute('data-aic-node');
}

/** Global offset of a DOM point inside the host, or null when outside. */
function globalOffsetOfPoint(host: HTMLElement, target: Node, targetOffset: number): number | null {
  let offset = 0;
  let found = false;

  const visit = (current: Node): boolean => {
    if (found) return true;
    if (current === target) {
      offset += targetOffset;
      found = true;
      return true;
    }
    if (current.nodeType === Node.TEXT_NODE) {
      offset += current.textContent?.length ?? 0;
      return false;
    }
    if (current.nodeName === 'BR' || isChip(current)) {
      offset += 1;
      return false;
    }
    for (const child of Array.from(current.childNodes)) {
      if (visit(child)) return true;
    }
    return false;
  };

  visit(host);
  return found ? offset : null;
}

/** DOM point at a global offset, or the host end as fallback. */
function domPointAtGlobal(host: HTMLElement, globalOffset: number): DomPoint {
  let remaining = globalOffset;

  const pointBefore = (node: Node): DomPoint => ({ node: node.parentNode ?? host, offset: indexOfChild(node) });
  const indexOfChild = (node: Node): number =>
    node.parentNode ? Array.prototype.indexOf.call(node.parentNode.childNodes, node) : 0;

  const visit = (parent: Node): DomPoint | null => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const length = child.textContent?.length ?? 0;
        if (remaining <= length) return { node: child, offset: remaining };
        remaining -= length;
        continue;
      }
      if (child.nodeName === 'BR' || isChip(child)) {
        if (remaining <= 0) return pointBefore(child);
        remaining -= 1;
        if (remaining <= 0) return { node: child.parentNode ?? host, offset: indexOfChild(child) + 1 };
        continue;
      }
      const nested = visit(child);
      if (nested) return nested;
    }
    return null;
  };

  return visit(host) ?? { node: host, offset: host.childNodes.length };
}

/** Read the DOM selection inside `host` as a model selection. */
export function domSelectionToModel(
  host: HTMLElement,
  document_: PromptDocument,
): SelectionState | null {
  const selection = host.ownerDocument.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  if (!anchorNode || !focusNode || !host.contains(anchorNode) || !host.contains(focusNode)) {
    return null;
  }

  const anchorOffset = globalOffsetOfPoint(host, anchorNode, selection.anchorOffset);
  const focusOffset = globalOffsetOfPoint(host, focusNode, selection.focusOffset);
  if (anchorOffset === null || focusOffset === null) return null;

  return clampSelection(
    document_,
    createSelection(fromGlobalOffset(document_, anchorOffset), fromGlobalOffset(document_, focusOffset)),
  );
}

/** Apply a model selection to the DOM (caret restore after renders). */
export function applyModelSelection(
  host: HTMLElement,
  document_: PromptDocument,
  selection: SelectionState,
): void {
  const ownerDocument = host.ownerDocument;
  const domSelection = ownerDocument.getSelection();
  if (!domSelection) return;

  const { start, end } = globalRange(document_, selection);
  const startPoint = domPointAtGlobal(host, start);
  const endPoint = start === end ? startPoint : domPointAtGlobal(host, end);

  try {
    const range = ownerDocument.createRange();
    range.setStart(startPoint.node, startPoint.offset);
    range.setEnd(endPoint.node, endPoint.offset);
    domSelection.removeAllRanges();
    domSelection.addRange(range);
  } catch {
    // Browsers can reject boundary points mid-render; the next render retries.
  }
}

/** Caret to the end of the host content. */
export function caretToEnd(host: HTMLElement, document_: PromptDocument): SelectionState {
  const length = document_.nodes.reduce(
    (sum, node) => sum + (node.type === 'text' ? node.text.length : 1),
    0,
  );
  return createSelection(fromGlobalOffset(document_, length));
}
