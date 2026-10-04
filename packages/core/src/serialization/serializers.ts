/** Serializer contracts. Built-in implementations live in ./builtins.ts. */

import type { PromptDocument } from '../model/document';
import type { NodeRegistry } from '../nodes/registry';

export type SerializationFormat = 'json' | 'text' | 'markdown' | 'html' | 'ai';

export interface SerializerContext {
  nodes: NodeRegistry;
}

export interface Serializer {
  format: SerializationFormat;
  serialize(document: PromptDocument, context: SerializerContext): unknown;
}
