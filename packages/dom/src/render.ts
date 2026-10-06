/**
 * Model → DOM rendering. The DOM is a projection of the authoritative
 * document (ADR-0001). Atomic nodes render as non-editable chips carrying
 * data-aic-* attributes so parse.ts can round-trip them safely.
 */

import type { AIComposerDocument, AIComposerNode } from '@ai-composer/core';
import type { NodeRegistry } from '@ai-composer/core';

function displayOf(node: AIComposerNode, registry: NodeRegistry): string {
  const definition = registry.get(node.type);
  return definition?.toDisplay?.(node) ?? '';
}

/** Render one atomic node as a non-editable chip element. */
export function renderChip(node: AIComposerNode, registry: NodeRegistry): HTMLElement {
  const chip = document.createElement('span');
  chip.setAttribute('contenteditable', 'false');
  chip.className = 'aic-chip';
  chip.setAttribute('data-aic-key', node.key);
  chip.setAttribute('data-aic-node', node.type);
  chip.hidden = node.type === 'attachment';
  chip.setAttribute('aria-label', displayOf(node, registry));

  switch (node.type) {
    case 'mention':
      chip.setAttribute('data-aic-id', node.id);
      chip.setAttribute('data-aic-label', node.label);
      break;
    case 'command':
      chip.setAttribute('data-aic-id', node.id);
      chip.setAttribute('data-aic-label', node.label);
      break;
    case 'variable':
      chip.setAttribute('data-aic-name', node.name);
      break;
    case 'attachment':
      chip.setAttribute('data-aic-id', node.id);
      chip.setAttribute('data-aic-name', node.name);
      chip.setAttribute('data-aic-mime', node.mimeType);
      if (node.size !== undefined) chip.setAttribute('data-aic-size', String(node.size));
      break;
    case 'custom':
      chip.setAttribute('data-aic-plugin', node.plugin);
      chip.setAttribute('data-aic-type', node.nodeType);
      chip.setAttribute('data-aic-data', safeJson(node.data));
      break;
    default:
      break;
  }

  chip.textContent = displayOf(node, registry);
  return chip;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
}

/** Render a text run; newlines become <br> so the editable area shows line breaks. */
export function renderTextRun(text: string): Node {
  if (!text.includes('\n')) return document.createTextNode(text);
  const fragment = document.createDocumentFragment();
  const parts = text.split('\n');
  parts.forEach((part, index) => {
    if (part) fragment.appendChild(document.createTextNode(part));
    if (index < parts.length - 1) fragment.appendChild(document.createElement('br'));
  });
  return fragment;
}

/**
 * Render the document into `host`, replacing previous content.
 * The placeholder <br> keeps the host clickable when empty.
 */
export function renderDocument(host: HTMLElement, document_: AIComposerDocument, registry: NodeRegistry): void {
  host.textContent = '';
  for (const node of document_.nodes) {
    host.appendChild(node.type === 'text' ? renderTextRun(node.text) : renderChip(node, registry));
  }
  if (document_.nodes.length === 0) {
    host.appendChild(document.createElement('br'));
  }
}
