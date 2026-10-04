/**
 * Slot components. Applications compose these to fully control layout —
 * the engine supplies behavior, the app owns the DOM (design principle 14).
 */

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createEditableSurface, createSuggestionList, attachCaretAnchoredPopup } from '@ai-composer/dom';
import {
  usePromptEditorContext,
  usePromptState,
  usePromptSuggestions,
} from './hooks';

function Slot({
  name,
  className,
  children,
  style,
}: {
  name: string;
  className: string;
  children?: ReactNode;
  style?: CSSProperties;
}): JSX.Element {
  return (
    <div className={className} data-aic-slot={name} style={style}>
      {children}
    </div>
  );
}

export function PromptHeader({ children }: { children?: ReactNode }): JSX.Element {
  return <Slot name="header" className="aic-header">{children}</Slot>;
}

export function PromptFooter({ children }: { children?: ReactNode }): JSX.Element {
  return <Slot name="footer" className="aic-footer">{children}</Slot>;
}

export function PromptBody({ children }: { children?: ReactNode }): JSX.Element {
  return <Slot name="body" className="aic-body">{children}</Slot>;
}

/**
 * The editable input surface. Mounts the DOM layer once; React never touches
 * the inner content — the editor engine owns it (model-first rendering).
 */
export const PromptInput = forwardRef<HTMLDivElement, { className?: string; id?: string; suggestions?: boolean }>(
  function PromptInput({ className, id, suggestions = true }, ref) {
    const editor = usePromptEditorContext();
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const surface = createEditableSurface(editor, host, { id });
      const list = suggestions ? createSuggestionList(editor, undefined, { inputHost: host }) : null;
      const anchor = host.parentElement;
      if (list && anchor) anchor.appendChild(list.element);
      return () => {
        list?.destroy();
        surface.destroy();
      };
    }, [editor, suggestions, id]);

    return (
      <div className="aic-input-wrap">
        <div
          ref={(node) => {
            hostRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={className ? `aic-input-host ${className}` : 'aic-input-host'}
          data-aic-slot="input"
        />
      </div>
    );
  },
);

/** Attachment chips driven by editor state. */
export function PromptAttachments({
  renderItem,
}: {
  renderItem?: (attachment: ReturnType<typeof usePromptState>['attachments'][number], remove: () => void) => ReactNode;
}): JSX.Element | null {
  const editor = usePromptEditorContext();
  const state = usePromptState(editor);
  if (state.attachments.length === 0) return null;
  return (
    <div className="aic-attachments" data-aic-slot="attachments">
      {state.attachments.map((attachment) =>
        renderItem ? (
          renderItem(attachment, () => editor.removeNode(attachment.key))
        ) : (
          <span className="aic-attachment" key={attachment.key}>
            <span className="aic-attachment-name">{attachment.name}</span>
            <button
              type="button"
              className="aic-attachment-remove"
              aria-label={`Remove ${attachment.name}`}
              onClick={() => editor.removeNode(attachment.key)}
            >
              ×
            </button>
          </span>
        ),
      )}
    </div>
  );
}

/** Custom suggestion menu (pair with `<PromptInput suggestions={false} />`). */
export function PromptSuggestions({
  renderItem,
  className,
  placement = 'above',
}: {
  renderItem?: (item: ReturnType<typeof usePromptSuggestions>['items'][number], active: boolean) => ReactNode;
  className?: string;
  /** Preferred placement relative to the caret; flips to fit the viewport. */
  placement?: 'above' | 'below';
}): JSX.Element | null {
  const editor = usePromptEditorContext();
  const { items, activeIndex, open, accept } = usePromptSuggestions(editor);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listId = useMemo(() => `aic-suggestions-react-${Math.random().toString(36).slice(2, 8)}`, []);

  // Caret-anchored, viewport-aware positioning from the DOM layer.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !open) return;
    const host = list.closest('.aic-root')?.querySelector<HTMLElement>('[data-aic-input]');
    if (!host) return;
    const anchor = attachCaretAnchoredPopup(list, host, { placement });
    anchor.update();
    return () => anchor.destroy();
  }, [open, items, activeIndex, placement]);

  if (!open) return null;
  return (
    <ul
      ref={listRef}
      className={className ?? 'aic-suggestions'}
      role="listbox"
      id={listId}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <li
            key={item.id}
            id={`${listId}-option-${index}`}
            role="option"
            aria-selected={active}
            className={active ? 'aic-suggestion aic-active' : 'aic-suggestion'}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void accept(item)}
          >
            {renderItem ? (
              renderItem(item, active)
            ) : (
              <>
                <span className="aic-suggestion-label">{item.label}</span>
                {item.description && (
                  <span className="aic-suggestion-description">{item.description}</span>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Toolbar slot; renders default submit/undo/redo buttons when empty. */
export function PromptToolbar({
  children,
  actions,
  submitLabel = '↑',
}: {
  children?: ReactNode;
  /** Default buttons when no children: 'submit' | 'undo' | 'redo' (default ['submit']). */
  actions?: Array<'submit' | 'undo' | 'redo'>;
  submitLabel?: string;
}): JSX.Element {
  const editor = usePromptEditorContext();
  const state = usePromptState(editor);
  const buttons = actions ?? ['submit'];
  return (
    <div className="aic-toolbar" data-aic-slot="toolbar">
      {children ??
        buttons.map((action) => {
          if (action === 'submit') {
            const canSubmit =
              !state.disabled && !state.readonly && (!state.empty || state.attachments.length > 0);
            return (
              <button
                key={action}
                type="button"
                className="aic-toolbar-submit"
                data-aic-action="submit"
                disabled={!canSubmit || state.submitting}
                aria-disabled={!canSubmit || state.submitting}
                aria-label="Send"
                onClick={() => void editor.executeCommand('submit')}
              >
                {state.submitting ? '…' : submitLabel}
              </button>
            );
          }
          const enabled = action === 'undo' ? state.canUndo : state.canRedo;
          return (
            <button
              key={action}
              type="button"
              className={`aic-toolbar-${action}`}
              data-aic-action={action}
              disabled={!enabled}
              aria-label={action}
              onClick={() => void editor.executeCommand(action)}
            >
              {action === 'undo' ? '↺' : '↻'}
            </button>
          );
        })}
    </div>
  );
}
