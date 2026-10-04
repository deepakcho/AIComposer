/** Editor configuration types. */

import type { PromptDocument } from './model/document';
import type { PromptNode } from './model/nodes';
import type { PromptPlugin } from './plugins/registry';
import type { Serializer } from './serialization/serializers';
import type { NodeDefinition } from './nodes/registry';
import type { PromptEditor } from './editor';
import type { HistoryOptions } from './history/history';

export type SubmitKey = 'enter' | 'shift-enter' | 'none';

export interface SubmitConfig {
  /** Async handler invoked by editor.submit(). */
  onSubmit?(value: PromptDocument, editor: PromptEditor): void | Promise<void>;
  /** Clear the document after a successful submit (default false). */
  clearOnSubmit?: boolean;
  /** Allow submitting an empty prompt (default false). */
  allowEmpty?: boolean;
}

export interface PromptEditorConfig {
  /** Presentation mode / preset name — 'default' | 'compact' | 'chat' | 'expanded' | custom. */
  mode?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  submit?: SubmitConfig;
  submitKey?: SubmitKey;
  history?: HistoryOptions;
}

export interface PromptEditorOptions extends PromptEditorConfig {
  /** Initial value: document, node list or plain string. */
  value?: PromptDocument | PromptNode[] | string;
  plugins?: PromptPlugin[];
  /** Extra/overriding node type definitions. */
  nodeTypes?: NodeDefinition[];
  /** Extra/overriding serializers. */
  serializers?: Serializer[];
}
