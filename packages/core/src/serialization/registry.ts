/**
 * Serializer registry (ADR-0006). Built-in formats: json, text, markdown,
 * html, ai. Plugins can add formats or override built-ins by re-registering
 * the same format id (last registration wins).
 */

import type { Unsubscribe } from '../events/event-bus';
import { AIComposerError } from '../errors';
import type { AIComposerDocument } from '../model/document';
import type { SerializationFormat, Serializer, SerializerContext } from './serializers';

export interface SerializerRegistry {
  register(serializer: Serializer): Unsubscribe;
  get(format: SerializationFormat): Serializer | undefined;
  formats(): SerializationFormat[];
  serialize(format: SerializationFormat, document: AIComposerDocument, context: SerializerContext): unknown;
  clear(): void;
}

export function createSerializerRegistry(): SerializerRegistry {
  const serializers = new Map<SerializationFormat, Serializer>();
  return {
    register(serializer) {
      serializers.set(serializer.format, serializer);
      return () => {
        if (serializers.get(serializer.format) === serializer) serializers.delete(serializer.format);
      };
    },
    get(format) {
      return serializers.get(format);
    },
    formats() {
      return [...serializers.keys()];
    },
    serialize(format, document, context) {
      const serializer = serializers.get(format);
      if (!serializer) {
        throw new AIComposerError(
          'UNKNOWN_FORMAT',
          `No serializer registered for "${format}". Registered: ${[...serializers.keys()].join(', ') || 'none'}`,
        );
      }
      return serializer.serialize(document, context);
    },
    clear() {
      serializers.clear();
    },
  };
}
