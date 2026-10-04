/**
 * @ai-composer/react — React adapter.
 *
 * ```tsx
 * import { PromptEditor } from '@ai-composer/react';
 *
 * <PromptEditor mode="chat" placeholder="Ask anything…" />;
 * ```
 */

export { PromptEditor, type PromptEditorProps } from './PromptEditor';
export {
  PromptAttachments,
  PromptBody,
  PromptFooter,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
} from './slots';
export {
  PromptEditorContext,
  PromptEditorProvider,
  usePromptCommand,
  usePromptEditor,
  usePromptEditorContext,
  usePromptSelection,
  usePromptState,
  usePromptSuggestions,
} from './hooks';
