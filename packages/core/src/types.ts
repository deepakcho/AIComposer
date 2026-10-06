/** Editor configuration types. */

import type { AIComposerDocument } from './model/document';
import type { AIComposerNode } from './model/nodes';
import type { AIComposerPlugin } from './plugins/registry';
import type { Serializer } from './serialization/serializers';
import type { NodeDefinition } from './nodes/registry';
import type { AIComposer } from './editor';
import type { HistoryOptions } from './history/history';

export type SubmitKey = 'enter' | 'shift-enter' | 'none';

export interface SubmitConfig {
  /** Async handler invoked by editor.submit(). */
  onSubmit?(value: AIComposerDocument, editor: AIComposer): void | Promise<void>;
  /** Clear the document after a successful submit (default false). */
  clearOnSubmit?: boolean;
  /** Allow submitting an empty document (default false). */
  allowEmpty?: boolean;
}

export interface AIComposerConfig {
  /** Presentation mode / preset name — 'default' | 'compact' | 'chat' | 'expanded' | custom. */
  mode?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  submit?: SubmitConfig;
  submitKey?: SubmitKey;
  history?: HistoryOptions;
}

export interface AIComposerOptions extends AIComposerConfig {
  /** Initial value: document, node list or plain string. */
  value?: AIComposerDocument | AIComposerNode[] | string;
  plugins?: AIComposerPlugin[];
  /** Extra/overriding node type definitions. */
  nodeTypes?: NodeDefinition[];
  /** Extra/overriding serializers. */
  serializers?: Serializer[];
}

