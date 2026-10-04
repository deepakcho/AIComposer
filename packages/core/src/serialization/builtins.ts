/**
 * Built-in serializers. Every projection goes through the node registry so
 * plugins control how their custom nodes serialize.
 */

import { escapeHtml } from '../utils/html';
import type { PromptDocument } from '../model/document';
import type { PromptNode } from '../model/nodes';
import type { NodeDefinition } from '../nodes/registry';
import type { Serializer, SerializerContext } from './serializers';

/** Structured payload handed to AI providers — provider-neutral by design (see docs). */
export interface AiPromptPayload {
  text: string;
  entities: Array<{
    type: string;
    key: string;
    id?: string;
    label?: string;
    name?: string;
    data?: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

function definitionOf(context: SerializerContext, node: PromptNode): NodeDefinition | undefined {
  return context.nodes.get(node.type);
}

/** Plain-text projection of a single node. */
export function nodeToText(node: PromptNode, context: SerializerContext): string {
  const def = definitionOf(context, node);
  if (def?.toText) return def.toText(node);
  if (node.type === 'text') return node.text;
  return '';
}

export function documentToText(document: PromptDocument, context: SerializerContext): string {
  return document.nodes.map((node) => nodeToText(node, context)).join('');
}

function nodeToMarkdown(node: PromptNode, context: SerializerContext): string {
  const def = definitionOf(context, node);
  if (def?.toMarkdown) return def.toMarkdown(node);
  return nodeToText(node, context);
}

function nodeToHtml(node: PromptNode, context: SerializerContext): string {
  const def = definitionOf(context, node);
  if (def?.toHtml) return def.toHtml(node);
  return escapeHtml(nodeToText(node, context));
}

export function createJsonSerializer(): Serializer {
  return {
    format: 'json',
    serialize(document) {
      // Round-trip safe: plain JSON structures only.
      return JSON.parse(JSON.stringify(document)) as PromptDocument;
    },
  };
}

export function createTextSerializer(): Serializer {
  return {
    format: 'text',
    serialize(document, context) {
      return documentToText(document, context);
    },
  };
}

export function createMarkdownSerializer(): Serializer {
  return {
    format: 'markdown',
    serialize(document, context) {
      return document.nodes.map((node) => nodeToMarkdown(node, context)).join('');
    },
  };
}

export function createHtmlSerializer(): Serializer {
  return {
    format: 'html',
    serialize(document, context) {
      const body = document.nodes.map((node) => nodeToHtml(node, context)).join('');
      return `<div data-aic-document>${body}</div>`;
    },
  };
}

export function createAiSerializer(): Serializer {
  return {
    format: 'ai',
    serialize(document, context): AiPromptPayload {
      return {
        text: documentToText(document, context),
        entities: document.nodes
          .filter((node) => node.type !== 'text')
          .map((node) => {
            const base: AiPromptPayload['entities'][number] = { type: node.type, key: node.key };
            const record = node as unknown as Record<string, unknown>;
            if (typeof record.id === 'string') base.id = record.id;
            if (typeof record.label === 'string') base.label = record.label;
            if (typeof record.name === 'string') base.name = record.name;
            if (node.type === 'custom') base.data = record.data;
            return base;
          }),
        ...(document.metadata ? { metadata: document.metadata } : {}),
      };
    },
  };
}

export function createDefaultSerializers(): Serializer[] {
  return [
    createJsonSerializer(),
    createTextSerializer(),
    createMarkdownSerializer(),
    createHtmlSerializer(),
    createAiSerializer(),
  ];
}
