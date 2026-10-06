/**
 * @ai-composer/react — React adapter.
 *
 * ```tsx
 * import { AIComposer } from '@ai-composer/react';
 *
 * <AIComposer mode="chat" placeholder="Ask anything…" />;
 * ```
 */

export { AIComposer, type AIComposerProps } from './AIComposer';
export {
  AIComposerAttachments,
  AIComposerBody,
  AIComposerFooter,
  AIComposerHeader,
  AIComposerInput,
  AIComposerSuggestions,
  AIComposerToolbar,
} from './slots';
export { CloseIcon, RedoIcon, SendIcon, SpinnerIcon, UndoIcon } from './icons';
export {
  AIComposerContext,
  AIComposerProvider,
  useAIComposer,
  useAIComposerCommand,
  useAIComposerContext,
  useAIComposerSelection,
  useAIComposerState,
  useAIComposerSuggestions,
} from './hooks';
