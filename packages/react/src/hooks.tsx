/**
 * React hooks. `usePromptEditor` owns an editor instance; the others subscribe
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
  createPromptEditor,
  isPromptEditor,
  type PromptEditor,
  type PromptEditorOptions,
  type PromptEditorState,
  type SelectionState,
  type SuggestionItem,
} from '@ai-composer/core';

export const PromptEditorContext = createContext<PromptEditor | null>(null);

/** Provide an existing editor to the slot components below. */
export function PromptEditorProvider({
  editor,
  children,
}: {
  editor: PromptEditor;
  children: ReactNode;
}): JSX.Element {
  return <PromptEditorContext.Provider value={editor}>{children}</PromptEditorContext.Provider>;
}

/** Create (once) or reuse an editor. Destroys internally-created editors on unmount. */
export function usePromptEditor(options?: PromptEditorOptions): PromptEditor {
  const optionsRef = useRef<PromptEditorOptions | undefined>(options);
  optionsRef.current = options;

  // StrictMode mounts → unmounts → remounts: rebuild if the previous
  // instance was destroyed by the first cleanup.
  const editorRef = useRef<PromptEditor | null>(null);
  if (editorRef.current === null || editorRef.current.isDestroyed()) {
    editorRef.current = createPromptEditor(optionsRef.current);
  }
  const editor = editorRef.current;

  useEffect(() => {
    const instance = editor;
    return () => {
      instance.destroy();
    };
  }, [editor]);

  return editor;
}

/** Resolve the editor from context (slot components). */
export function usePromptEditorContext(): PromptEditor {
  const editor = useContext(PromptEditorContext);
  if (!editor || !isPromptEditor(editor)) {
    throw new Error(
      'No editor in context. Render <PromptEditor> or <PromptEditorProvider editor={editor}> above this component.',
    );
  }
  return editor;
}

function subscribe(editor: PromptEditor, onChange: () => void): () => void {
  return editor.subscribe(onChange);
}

/** Live editor state (re-renders on every state change). */
export function usePromptState(editor: PromptEditor): PromptEditorState {
  return useSyncExternalStore(
    (onChange) => subscribe(editor, onChange),
    () => editor.getState(),
    () => editor.getState(),
  );
}

/** Live selection. */
export function usePromptSelection(editor: PromptEditor): SelectionState {
  return usePromptState(editor).selection;
}

/** Suggestion session (items + highlighted index + accept). */
export function usePromptSuggestions(editor: PromptEditor): {
  items: SuggestionItem[];
  activeIndex: number;
  open: boolean;
  accept: (item?: SuggestionItem) => Promise<void>;
  move: (delta: number) => void;
  close: () => void;
} {
  const state = usePromptState(editor);
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
export function usePromptCommand(
  editor: PromptEditor,
): (id: string, payload?: unknown) => Promise<void> {
  return (id: string, payload?: unknown) => editor.executeCommand(id, payload);
}
