/**
 * React hooks. `useAIComposer` owns an editor instance; the others subscribe
 * re-render-efficiently via useSyncExternalStore.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  createAIComposer,
  isAIComposer,
  type AIComposer,
  type AIComposerOptions,
  type AIComposerState,
  type SelectionState,
  type SuggestionItem,
} from '@ai-composer/core';

export const AIComposerContext = createContext<AIComposer | null>(null);

/** Provide an existing editor to the slot components below. */
export function AIComposerProvider({
  editor,
  children,
}: {
  editor: AIComposer;
  children: ReactNode;
}): JSX.Element {
  return <AIComposerContext.Provider value={editor}>{children}</AIComposerContext.Provider>;
}

/** Create (once) or reuse an editor. Destroys internally-created editors on unmount. */
export function useAIComposer(options?: AIComposerOptions): AIComposer {
  const optionsRef = useRef<AIComposerOptions | undefined>(options);
  optionsRef.current = options;

  const editorRef = useRef<AIComposer | null>(null);
  if (editorRef.current === null || editorRef.current.isDestroyed()) {
    editorRef.current = createAIComposer(optionsRef.current);
  }
  const editor = editorRef.current;

  const destroyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (destroyTimer.current !== null) {
      window.clearTimeout(destroyTimer.current);
      destroyTimer.current = null;
    }
    return () => {
      destroyTimer.current = window.setTimeout(() => {
        destroyTimer.current = null;
        editor.destroy();
      });
    };
  }, [editor]);

  return editor;
}

/** Resolve the editor from context (slot components). */
export function useAIComposerContext(): AIComposer {
  const editor = useContext(AIComposerContext);
  if (!editor || !isAIComposer(editor)) {
    throw new Error(
      'No editor in context. Render <AIComposer> or <AIComposerProvider editor={editor}> above this component.',
    );
  }
  return editor;
}

function subscribe(editor: AIComposer, onChange: () => void): () => void {
  return editor.subscribe(onChange);
}

/** Live editor state (re-renders on every state change). */
export function useAIComposerState(editor: AIComposer): AIComposerState {
  return useSyncExternalStore(
    (onChange) => subscribe(editor, onChange),
    () => editor.getState(),
    () => editor.getState(),
  );
}

/** Live selection. */
export function useAIComposerSelection(editor: AIComposer): SelectionState {
  return useAIComposerState(editor).selection;
}

/** Suggestion session (items + highlighted index + accept). */
export function useAIComposerSuggestions(editor: AIComposer): {
  items: SuggestionItem[];
  activeIndex: number;
  open: boolean;
  accept: (item?: SuggestionItem) => Promise<void>;
  move: (delta: number) => void;
  close: () => void;
} {
  const state = useAIComposerState(editor);
  return {
    items: state.suggestions,
    activeIndex: state.activeSuggestionIndex,
    open: state.activeTrigger !== null && state.suggestions.length > 0,
    accept: (item?: SuggestionItem) => editor.acceptSuggestion(item),
    move: (delta: number) => editor.moveSuggestionSelection(delta),
    close: () => editor.closeTrigger('manual'),
  };
}

/** Execute commands bound to the editor (toolbars, menus). */
export function useAIComposerCommand(
  editor: AIComposer,
): (id: string, payload?: unknown) => Promise<void> {
  return (id: string, payload?: unknown) => editor.executeCommand(id, payload);
}
