/**
 * Node model.
 *
 * A composer document is a flat list of nodes (see ADR-0002): text runs and
 * atomic "chip" nodes (mention, command, variable, attachment, custom).
 *
 * Every node carries a stable instance `key`. It is NOT the entity id —
 * {@link MentionNode}.id identifies the mentioned entity, `key` identifies
 * this particular node instance and stays stable across clones, undo/redo
 * and DOM round-trips (React keys, DOM↔model mapping).
 */

/** Stable node instance key. */
export type NodeKey = string;

export interface BaseNode {
  key: NodeKey;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
}

export interface MentionNode extends BaseNode {
  type: 'mention';
  /** Entity id (user, ticket, …) — not the node instance key. */
  id: string;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface CommandNode extends BaseNode {
  type: 'command';
  id: string;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface VariableNode extends BaseNode {
  type: 'variable';
  name: string;
  value?: unknown;
}

export interface AttachmentNode extends BaseNode {
  type: 'attachment';
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

/** Application/plugin-defined node. Rendering & serialization come from the owning NodeDefinition. */
export interface CustomNode extends BaseNode {
  type: 'custom';
  plugin: string;
  nodeType: string;
  data: unknown;
}

export type AIComposerNode = TextNode | MentionNode | CommandNode | VariableNode | AttachmentNode | CustomNode;

/** Anything that is not a text run is indivisible (length 1) for edits and selection. */
export type AtomicNode = Exclude<AIComposerNode, TextNode>;

export type AIComposerNodeType = AIComposerNode['type'];

let sequence = 0;

/** Generate a unique node key, e.g. `mention_lx3a_07_f2k9q1`. */
export function createNodeKey(prefix = 'n'): NodeKey {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

export function createTextNode(text: string, key: NodeKey = createNodeKey('text')): TextNode {
  return { type: 'text', key, text };
}

export function createMentionNode(
  input: Omit<MentionNode, 'type' | 'key'>,
  key: NodeKey = createNodeKey('mention'),
): MentionNode {
  return { type: 'mention', key, ...input };
}

export function createCommandNode(
  input: Omit<CommandNode, 'type' | 'key'>,
  key: NodeKey = createNodeKey('command'),
): CommandNode {
  return { type: 'command', key, ...input };
}

export function createVariableNode(
  input: { name: string; value?: unknown },
  key: NodeKey = createNodeKey('variable'),
): VariableNode {
  return { type: 'variable', key, name: input.name, ...(input.value !== undefined ? { value: input.value } : {}) };
}

export function createAttachmentNode(
  input: Omit<AttachmentNode, 'type' | 'key'>,
  key: NodeKey = createNodeKey('attachment'),
): AttachmentNode {
  return { type: 'attachment', key, ...input };
}

export function createCustomNode(
  input: { plugin: string; nodeType: string; data: unknown },
  key: NodeKey = createNodeKey(input.nodeType || 'custom'),
): CustomNode {
  return { type: 'custom', key, plugin: input.plugin, nodeType: input.nodeType, data: input.data };
}

/** Assign a key to a hand-built node that lacks one (e.g. from parsed JSON). */
export function ensureNodeKey<T extends AIComposerNode>(node: T): T {
  return node.key ? node : { ...node, key: createNodeKey(node.type) };
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export function isTextNode(node: AIComposerNode): node is TextNode {
  return node.type === 'text';
}

export function isAtomicNode(node: AIComposerNode): node is AtomicNode {
  return node.type !== 'text';
}

export function getNodeType(node: AIComposerNode): AIComposerNodeType {
  return node.type;
}

/** Lightweight structural validation for documents coming from views / storage. */
export function isAIComposerNode(value: unknown): value is AIComposerNode {
  if (typeof value !== 'object' || value === null) return false;
  const node = value as Partial<AIComposerNode>;
  return (
    typeof node.type === 'string' &&
    typeof node.key === 'string' &&
    (node.type !== 'text' || typeof (node as Partial<TextNode>).text === 'string')
  );
}
