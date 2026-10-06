/**
 * <AIComposer /> — three usage levels share one engine:
 *
 *   Level 1: <AIComposer mode="chat" />
 *   Level 2: <AIComposer mode="chat" options={{ plugins: [...] }} />
 *   Level 3: <AIComposer editor={editor}> <AIComposerHeader>…</AIComposerHeader> … </AIComposer>
 */

import { useEffect, type CSSProperties } from 'react';
import type {
  AIComposer as AIComposerType,
  AIComposerDocument,
  AIComposerOptions,
} from '@ai-composer/core';
import { useAIComposer, useAIComposerState, AIComposerContext } from './hooks';
import { AIComposerAttachments, AIComposerBody, AIComposerInput, AIComposerToolbar } from './slots';

export interface AIComposerProps {
  /** External editor (Level 3). When omitted one is created from `options`. */
  editor?: AIComposerType;
  /** Editor factory options (Level 2). Ignored when `editor` is provided. */
  options?: AIComposerOptions;
  mode?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Controlled value. */
  value?: AIComposerDocument | string;
  /** Fires on any value change (controlled pattern). */
  onChange?: (value: AIComposerDocument) => void;
  /** Fires after submit. */
  onSubmit?: (value: AIComposerDocument) => void;
  submitLabel?: string;
  toolbarActions?: Array<'submit' | 'undo' | 'redo'>;
  /**
   * Auto-height ceiling — number (px) or any CSS length ("40vh"). The box
   * grows with content up to this height, then scrolls inside.
   */
  maxHeight?: number | string;
  'aria-label'?: string;
}

export function AIComposer({
  editor: externalEditor,
  options,
  mode,
  placeholder,
  disabled,
  readonly,
  className,
  style,
  children,
  value,
  onChange,
  onSubmit,
  submitLabel,
  toolbarActions,
  maxHeight,
  ...aria
}: AIComposerProps): JSX.Element {
  const createdEditor = useAIComposer(externalEditor ? undefined : options);
  const editor = externalEditor ?? createdEditor;
  const state = useAIComposerState(editor);

  useEffect(() => {
    if (editor.isDestroyed()) return;
    const patch: Partial<AIComposerOptions> = {};
    if (mode !== undefined && mode !== editor.getConfig().mode) patch.mode = mode;
    if (placeholder !== undefined && placeholder !== editor.getConfig().placeholder) {
      patch.placeholder = placeholder;
    }
    if (disabled !== undefined && disabled !== editor.getConfig().disabled) patch.disabled = disabled;
    if (readonly !== undefined && readonly !== editor.getConfig().readonly) patch.readonly = readonly;
    if (Object.keys(patch).length > 0) editor.configure(patch);
  }, [editor, mode, placeholder, disabled, readonly]);

  useEffect(() => {
    if (value === undefined || editor.isDestroyed()) return;
    if (typeof value === 'string') {
      if (value !== editor.serialize('text')) editor.setValue(value);
    } else {
      editor.setValue(value);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!onChange || editor.isDestroyed()) return;
    return editor.on('change', (event) => onChange(event.value));
  }, [editor, onChange]);
  useEffect(() => {
    if (!onSubmit || editor.isDestroyed()) return;
    return editor.on('submit', (event) => onSubmit(event.value));
  }, [editor, onSubmit]);

  const rootClass = className ? `aic-root ${className}` : 'aic-root';
  const rootStyle = {
    ...(maxHeight !== undefined
      ? { '--aic-input-max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
      : {}),
    ...style,
  } as CSSProperties;

  return (
    <AIComposerContext.Provider value={editor}>
      <div className={rootClass} data-aic-mode={state.mode} style={rootStyle} {...aria}>
        {children ?? (
          <>
            <AIComposerBody>
              <AIComposerAttachments />
              {/* AIComposerInput mounts the suggestion popup inside its wrapper */}
              <AIComposerInput />
            </AIComposerBody>
            {state.mode === 'compact' || state.mode === 'chat' || state.mode === 'expanded' ? (
              <AIComposerToolbar actions={toolbarActions} submitLabel={submitLabel} />
            ) : null}
          </>
        )}
      </div>
    </AIComposerContext.Provider>
  );
}
