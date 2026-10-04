/**
 * <PromptEditor /> — three usage levels share one engine:
 *
 *   Level 1: <PromptEditor mode="chat" />
 *   Level 2: <PromptEditor mode="chat" options={{ plugins: [...] }} />
 *   Level 3: <PromptEditor editor={editor}> <PromptHeader>…</PromptHeader> … </PromptEditor>
 */

import { useEffect, type CSSProperties } from 'react';
import type {
  PromptDocument,
  PromptEditor as PromptEditorType,
  PromptEditorOptions,
} from '@ai-composer/core';
import { usePromptEditor, usePromptState, PromptEditorContext } from './hooks';
import { PromptAttachments, PromptBody, PromptInput, PromptToolbar } from './slots';

export interface PromptEditorProps {
  /** External editor (Level 3). When omitted one is created from `options`. */
  editor?: PromptEditorType;
  /** Editor factory options (Level 2). Ignored when `editor` is provided. */
  options?: PromptEditorOptions;
  mode?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Controlled value. */
  value?: PromptDocument | string;
  /** Fires on any value change (controlled pattern). */
  onChange?: (value: PromptDocument) => void;
  /** Fires after submit. */
  onSubmit?: (value: PromptDocument) => void;
  submitLabel?: string;
  toolbarActions?: Array<'submit' | 'undo' | 'redo'>;
  /**
   * Auto-height ceiling — number (px) or any CSS length ("40vh"). The box
   * grows with content up to this height, then scrolls inside.
   */
  maxHeight?: number | string;
  'aria-label'?: string;
}

export function PromptEditor({
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
}: PromptEditorProps): JSX.Element {
  const createdEditor = usePromptEditor(externalEditor ? undefined : options);
  const editor = externalEditor ?? createdEditor;
  const state = usePromptState(editor);

  // Config props → editor config
  useEffect(() => {
    const patch: Partial<PromptEditorOptions> = {};
    if (mode !== undefined && mode !== editor.getConfig().mode) patch.mode = mode;
    if (placeholder !== undefined && placeholder !== editor.getConfig().placeholder) {
      patch.placeholder = placeholder;
    }
    if (disabled !== undefined && disabled !== editor.getConfig().disabled) patch.disabled = disabled;
    if (readonly !== undefined && readonly !== editor.getConfig().readonly) patch.readonly = readonly;
    if (Object.keys(patch).length > 0) editor.configure(patch);
  }, [editor, mode, placeholder, disabled, readonly]);

  // Controlled value
  useEffect(() => {
    if (value === undefined) return;
    if (typeof value === 'string') {
      if (value !== editor.serialize('text')) editor.setValue(value);
    } else {
      editor.setValue(value);
    }
  }, [editor, value]);

  // Event props
  useEffect(() => {
    if (!onChange) return;
    return editor.on('change', (event) => onChange(event.value));
  }, [editor, onChange]);
  useEffect(() => {
    if (!onSubmit) return;
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
    <PromptEditorContext.Provider value={editor}>
      <div className={rootClass} data-aic-mode={state.mode} style={rootStyle} {...aria}>
        {children ?? (
          <>
            <PromptBody>
              <PromptAttachments />
              {/* PromptInput mounts the suggestion popup inside its wrapper */}
              <PromptInput />
            </PromptBody>
            {state.mode === 'expanded' || state.mode === 'chat' ? (
              <PromptToolbar actions={toolbarActions} submitLabel={submitLabel} />
            ) : null}
          </>
        )}
      </div>
    </PromptEditorContext.Provider>
  );
}
