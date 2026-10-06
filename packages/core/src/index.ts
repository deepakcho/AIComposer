/**
 * @ai-composer/core — the framework-independent AI composer engine.
 *
 * Layers:
 *   model/         document, nodes, selection (pure data + edit primitives)
 *   state/         observable editor state
 *   events/        typed event bus + editor event map
 *   commands/      command registry + built-ins
 *   triggers/      trigger registry + suggestion engine
 *   history/       snapshot undo/redo with merge window
 *   plugins/       plugin contract + registry
 *   serialization/ json / text / markdown / html / ai serializers
 */

// model
export type { AIComposerDocument } from './model/document';
export {
  coerceDocument,
  createDocument,
  deleteDocumentRange,
  documentLength,
  documentsEqual,
  findNode,
  findNodeIndex,
  getNodesOfType,
  insertNodesAt,
  isEmptyDocument,
  nodeLength,
  normalizeNodes,
  sanitizeDocument,
} from './model/document';
export type {
  AttachmentNode,
  AtomicNode,
  BaseNode,
  CommandNode,
  CustomNode,
  MentionNode,
  NodeKey,
  AIComposerNode,
  AIComposerNodeType,
  TextNode,
  VariableNode,
} from './model/nodes';
export {
  createAttachmentNode,
  createCommandNode,
  createCustomNode,
  createMentionNode,
  createNodeKey,
  createTextNode,
  createVariableNode,
  ensureNodeKey,
  getNodeType,
  isAtomicNode,
  isAIComposerNode,
  isTextNode,
} from './model/nodes';
export type { DocumentRange, Position, SelectionState } from './model/selection';
export {
  clampPosition,
  clampSelection,
  comparePositions,
  createPosition,
  createSelection,
  equalsPosition,
  equalsSelection,
  fromGlobalOffset,
  getEnd,
  getRange,
  getStart,
  globalRange,
  isCollapsed,
  toGlobalOffset,
} from './model/selection';

// state
export type { AIComposerState, SuggestionItem, TriggerState } from './state/state';

// events
export type {
  AttachmentEvent,
  BeforeSubmitEvent,
  ChangeEvent,
  ChangeSource,
  CommandExecuteEvent,
  DestroyEvent,
  ErrorEvent,
  FocusChangeEvent,
  ModeChangeEvent,
  NodeInsertEvent,
  NodeRemoveEvent,
  AIComposerBus,
  AIComposerEventMap,
  AIComposerEventType,
  SelectionChangeEvent,
  SubmitEvent,
  SuggestionsChangeEvent,
  TriggerCloseEvent,
  TriggerCloseReason,
  TriggerOpenEvent,
} from './events/events';
export type {
  EventBus,
  EventHandler,
  EventMapBase,
  Unsubscribe,
} from './events/event-bus';
export { createEventBus } from './events/event-bus';

// commands
export type { CommandContext, CommandRegistry, AIComposerCommand } from './commands/registry';
export { createCommandRegistry } from './commands/registry';
export {
  BUILTIN_COMMANDS,
  createBuiltinCommands,
  type AcceptSuggestionPayload,
  type InsertNodePayload,
  type InsertTextPayload,
  type OpenTriggerPayload,
  type RemoveNodePayload,
} from './commands/builtins';

// triggers
export type {
  AIComposerTrigger,
  TriggerHost,
  TriggerRegistry,
  TriggerSearchContext,
  TriggerSelectContext,
} from './triggers/engine';
export {
  TriggerEngine,
  createNodeFromSuggestion,
  createTriggerRegistry,
  defineTrigger,
} from './triggers/engine';

// history
export type { HistoryOptions, HistorySnapshot, RecordOptions } from './history/history';
export { DEFAULT_HISTORY_OPTIONS, EditorHistory } from './history/history';

// plugins
export type { PluginContext, AIComposerPlugin, PluginRegistry } from './plugins/registry';
export { createPluginRegistry } from './plugins/registry';

// serialization
export type {
  AIComposerPayload,
  SerializationFormat,
  Serializer,
  SerializerContext,
  SerializerRegistry,
} from './serialization';
export {
  createAiSerializer,
  createDefaultSerializers,
  createHtmlSerializer,
  createJsonSerializer,
  createMarkdownSerializer,
  createSerializerRegistry,
  createTextSerializer,
  documentToText,
  nodeToText,
} from './serialization';

// node registry
export type { NodeDefinition, NodeRegistry } from './nodes/registry';
export {
  ATTACHMENT_NODE_DEFINITION,
  COMMAND_NODE_DEFINITION,
  CUSTOM_NODE_DEFINITION,
  MENTION_NODE_DEFINITION,
  TEXT_NODE_DEFINITION,
  VARIABLE_NODE_DEFINITION,
  createDefaultNodeRegistry,
  createNodeRegistry,
} from './nodes/registry';

// editor + factory + config
export type {
  AIComposer,
  EditorView,
  InsertNodeOptions,
  SetValueOptions,
  StateListener,
  TransactionOptions,
} from './editor';
export { AIComposerImpl, isAIComposer } from './editor';
export { createAIComposer, CORE_VERSION } from './factory';
export type {
  AIComposerConfig,
  AIComposerOptions,
  SubmitConfig,
  SubmitKey,
} from './types';

// errors
export { ErrorCode, AIComposerError, toError, type AIComposerErrorCode } from './errors';

export { escapeHtml } from './utils/html';
