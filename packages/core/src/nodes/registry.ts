/**
 * Node type registry. Core registers the built-in node types; plugins can add
 * custom ones or override serialization for built-ins (ADR-0004).
 */

import type { Unsubscribe } from '../events/event-bus';
import { escapeHtml } from '../utils/html';
import type {
  AttachmentNode,
  CommandNode,
  CustomNode,
  MentionNode,
  AIComposerNode,
  TextNode,
  VariableNode,
} from '../model/nodes';

export interface NodeDefinition {
  /** Node type identifier, e.g. 'mention'. `custom` nodes also carry `nodeType`. */
  type: string;
  /** Owning plugin id (informational, for custom nodes). */
  plugin?: string;
  /** Atomic nodes are indivisible units with model length 1. */
  isAtomic: boolean;
  /** Plain-text projection used by the `text` serializer and a11y announcements. */
  toText?(node: AIComposerNode): string;
  /** Markdown projection. */
  toMarkdown?(node: AIComposerNode): string;
  /** Safe HTML projection — must escape user content (used for copy/export, never for trusting input). */
  toHtml?(node: AIComposerNode): string;
  /** Short chip label for DOM rendering. */
  toDisplay?(node: AIComposerNode): string;
}

export interface NodeRegistry {
  register(definition: NodeDefinition): Unsubscribe;
  get(type: string): NodeDefinition | undefined;
  has(type: string): boolean;
  list(): NodeDefinition[];
  clear(): void;
}

export function createNodeRegistry(): NodeRegistry {
  const definitions = new Map<string, NodeDefinition>();
  return {
    register(definition) {
      definitions.set(definition.type, definition);
      return () => {
        if (definitions.get(definition.type) === definition) definitions.delete(definition.type);
      };
    },
    get(type) {
      return definitions.get(type);
    },
    has(type) {
      return definitions.has(type);
    },
    list() {
      return [...definitions.values()];
    },
    clear() {
      definitions.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Built-in definitions
// ---------------------------------------------------------------------------

const as = <T extends AIComposerNode>(node: AIComposerNode): T => node as T;

export const TEXT_NODE_DEFINITION: NodeDefinition = {
  type: 'text',
  isAtomic: false,
  toText: (node) => as<TextNode>(node).text,
  toMarkdown: (node) => as<TextNode>(node).text,
  toHtml: (node) => escapeHtml(as<TextNode>(node).text).replace(/\n/g, '<br>'),
  toDisplay: (node) => as<TextNode>(node).text,
};

export const MENTION_NODE_DEFINITION: NodeDefinition = {
  type: 'mention',
  isAtomic: true,
  toText: (node) => `@${as<MentionNode>(node).label}`,
  toMarkdown: (node) => `[@${as<MentionNode>(node).label}](mention:${as<MentionNode>(node).id})`,
  toHtml: (node) =>
    `<span data-aic-node="mention" data-aic-id="${escapeHtml(as<MentionNode>(node).id)}">@${escapeHtml(as<MentionNode>(node).label)}</span>`,
  toDisplay: (node) => `@${as<MentionNode>(node).label}`,
};

export const COMMAND_NODE_DEFINITION: NodeDefinition = {
  type: 'command',
  isAtomic: true,
  toText: (node) => `/${as<CommandNode>(node).label}`,
  toMarkdown: (node) => `[/${as<CommandNode>(node).label}](command:${as<CommandNode>(node).id})`,
  toHtml: (node) =>
    `<span data-aic-node="command" data-aic-id="${escapeHtml(as<CommandNode>(node).id)}">/${escapeHtml(as<CommandNode>(node).label)}</span>`,
  toDisplay: (node) => `/${as<CommandNode>(node).label}`,
};

export const VARIABLE_NODE_DEFINITION: NodeDefinition = {
  type: 'variable',
  isAtomic: true,
  toText: (node) => `{{${as<VariableNode>(node).name}}}`,
  toMarkdown: (node) => `{{${as<VariableNode>(node).name}}}`,
  toHtml: (node) =>
    `<span data-aic-node="variable" data-aic-name="${escapeHtml(as<VariableNode>(node).name)}">{{${escapeHtml(as<VariableNode>(node).name)}}}</span>`,
  toDisplay: (node) => `{{${as<VariableNode>(node).name}}}`,
};

export const ATTACHMENT_NODE_DEFINITION: NodeDefinition = {
  type: 'attachment',
  isAtomic: true,
  toText: (node) => as<AttachmentNode>(node).name,
  toMarkdown: (node) => `[${as<AttachmentNode>(node).name}](attachment:${as<AttachmentNode>(node).id})`,
  toHtml: (node) =>
    `<span data-aic-node="attachment" data-aic-id="${escapeHtml(as<AttachmentNode>(node).id)}" data-aic-mime="${escapeHtml(as<AttachmentNode>(node).mimeType)}">${escapeHtml(as<AttachmentNode>(node).name)}</span>`,
  toDisplay: (node) => as<AttachmentNode>(node).name,
};

export const CUSTOM_NODE_DEFINITION: NodeDefinition = {
  type: 'custom',
  isAtomic: true,
  toText: (node) => JSON.stringify(as<CustomNode>(node).data),
  toMarkdown: (node) => escapeHtml(JSON.stringify(as<CustomNode>(node).data)),
  toHtml: (node) =>
    `<span data-aic-node="custom" data-aic-plugin="${escapeHtml(as<CustomNode>(node).plugin)}" data-aic-type="${escapeHtml(as<CustomNode>(node).nodeType)}" data-aic-data="${escapeHtml(JSON.stringify(as<CustomNode>(node).data))}">${escapeHtml(String(as<CustomNode>(node).data ?? ''))}</span>`,
  toDisplay: (node) => String(as<CustomNode>(node).data ?? ''),
};

/** Registry pre-loaded with all built-in node types. */
export function createDefaultNodeRegistry(): NodeRegistry {
  const registry = createNodeRegistry();
  registry.register(TEXT_NODE_DEFINITION);
  registry.register(MENTION_NODE_DEFINITION);
  registry.register(COMMAND_NODE_DEFINITION);
  registry.register(VARIABLE_NODE_DEFINITION);
  registry.register(ATTACHMENT_NODE_DEFINITION);
  registry.register(CUSTOM_NODE_DEFINITION);
  return registry;
}
