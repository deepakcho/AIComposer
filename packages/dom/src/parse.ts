/**
 * DOM → model parsing with strict sanitization: only elements we generate
 * (data-aic-node chips) survive as structured nodes — everything else is
 * flattened to plain text (see the serialization ADR).
 */

import {
  createDocument,
  createNodeKey,
  type NodeRegistry,
  type AIComposerNode,
  type TextNode,
} from '@ai-composer/core';

const INTERNAL_CLIP_MIME = 'application/x-ai-composer';

function textNode(text: string, previous?: TextNode): TextNode {
  if (previous) return { ...previous, text: previous.text + text };
  return { type: 'text', key: createNodeKey('text'), text };
}

/** Parse the editable host back into a document. Never trusts markup: unknown nodes collapse to text. */
export function parseEditableHost(host: HTMLElement, registry: NodeRegistry): ReturnType<typeof createDocument> {
  const nodes: AIComposerNode[] = [];

  const appendText = (text: string): void => {
    if (!text) return;
    const last = nodes[nodes.length - 1];
    if (last && last.type === 'text') nodes[nodes.length - 1] = textNode(text, last);
    else nodes.push(textNode(text));
  };

  const walk = (parent: Node): void => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        appendText(child.textContent ?? '');
        continue;
      }
      if (child.nodeName === 'BR') {
        appendText('\n');
        continue;
      }
      if (child instanceof HTMLElement) {
        // Never surface executable/style content as text.
        if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
        const type = child.getAttribute('data-aic-node');
        const parsed = type ? chipFromElement(child, type, registry) : null;
        if (parsed) {
          nodes.push(parsed);
          continue;
        }
        // Unknown wrapper (browser artifact, pasted markup) — flatten to text only.
        walk(child);
      }
      // Comments and other node types are dropped.
    }
  };

  walk(host);
  return createDocument(nodes);
}

function chipFromElement(element: HTMLElement, type: string, registry: NodeRegistry): AIComposerNode | null {
  if (!registry.has(type)) return null;
  const key = element.getAttribute('data-aic-key') ?? createNodeKey(type);
  const attr = (name: string): string | null => element.getAttribute(`data-aic-${name}`);

  switch (type) {
    case 'mention':
    case 'command': {
      const id = attr('id');
      const label = attr('label');
      if (!id || !label) return null;
      return type === 'mention'
        ? { type: 'mention', key, id, label }
        : { type: 'command', key, id, label };
    }
    case 'variable': {
      const name = attr('name');
      if (!name) return null;
      return { type: 'variable', key, name };
    }
    case 'attachment': {
      const id = attr('id');
      const name = attr('name');
      const mimeType = attr('mime') ?? 'application/octet-stream';
      if (!id || !name) return null;
      const sizeAttr = attr('size');
      const size = sizeAttr ? Number(sizeAttr) : undefined;
      return { type: 'attachment', key, id, name, mimeType, ...(Number.isFinite(size) ? { size } : {}) };
    }
    case 'custom': {
      const plugin = attr('plugin');
      const nodeType = attr('type');
      if (!plugin || !nodeType) return null;
      let data: unknown = null;
      try {
        data = JSON.parse(attr('data') ?? 'null');
      } catch {
        data = null;
      }
      return { type: 'custom', key, plugin, nodeType, data };
    }
    default:
      // Registered custom node types without a known chip shape degrade to text.
      return null;
  }
}

/** Extract safe plain text from arbitrary HTML (paste path). Tags are dropped, <br> becomes \n. */
export function htmlToPlainText(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html; // parsed, never inserted into the page
  let text = '';
  const walk = (parent: Node): void => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) text += child.textContent ?? '';
      else if (child.nodeName === 'BR') text += '\n';
      else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (element.tagName === 'DIV' || element.tagName === 'P') {
          walk(element);
          text += '\n';
        } else {
          walk(element);
        }
      }
    }
  };
  walk(container);
  return text;
}

/** Clipboard mime used for lossless internal copy/paste round-trips. */
export const CLIPBOARD_MIME = INTERNAL_CLIP_MIME;
