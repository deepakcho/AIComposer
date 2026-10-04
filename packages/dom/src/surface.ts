/**
 * The editable surface: binds a contentEditable host to an editor using the
 * model-first pipeline:
 *
 *   user input → parse DOM → editor.applyViewUpdate() (model is authoritative)
 *   model change → render → restore caret from model selection
 *
 * All programmatic APIs (setValue/insertNode/undo…) write the model; the
 * surface re-projects it. See ADR-0001.
 */

import {
  createSelection,
  documentToText,
  ensureNodeKey,
  fromGlobalOffset,
  getRange,
  sanitizeDocument,
  toGlobalOffset,
  type PromptDocument,
  type PromptEditor,
  type PromptNode,
  type SubmitKey,
  type Unsubscribe,
} from '@ai-composer/core';
import { parseEditableHost, htmlToPlainText, CLIPBOARD_MIME } from './parse';
import { renderDocument } from './render';
import { applyModelSelection, domSelectionToModel } from './selection';

export interface EditableSurfaceOptions {
  /** Multiline hint for a11y and Enter handling (chat/expanded modes). */
  multiline?: boolean;
  /** Override the editor config's submit key behavior. */
  submitKey?: SubmitKey;
  /** Explicit id (used for aria-controls wiring). */
  id?: string;
  /** Additional class names for the host. */
  className?: string;
  /** Accessible label; defaults to the placeholder. */
  ariaLabel?: string;
}

export interface EditableSurface {
  readonly host: HTMLElement;
  /** Manually re-render from the model (used by undo/redo view hook). */
  render(): void;
  focus(options?: { at?: 'start' | 'end' }): void;
  blur(): void;
  /** Multiline hint (a11y + newline handling) — updated on mode switches. */
  setMultiline(multiline: boolean): void;
  /** Submit-key override (mode presets) — cleared with `undefined`. */
  setSubmitKey(key: SubmitKey | undefined): void;
  destroy(): void;
}

export const EDITABLE_SURFACE_CLASS = 'aic-input';

let surfaceCounter = 0;

export function createEditableSurface(
  editor: PromptEditor,
  host: HTMLElement,
  options: EditableSurfaceOptions = {},
): EditableSurface {
  const surfaceId = options.id ?? `aic-input-${(surfaceCounter += 1)}`;
  let submitKeyOverride = options.submitKey;
  const submitKey = (): SubmitKey => submitKeyOverride ?? editor.getConfig().submitKey ?? 'enter';
  const ariaLabel = (): string =>
    options.ariaLabel ?? editor.getConfig().placeholder ?? 'AI Composer';

  let composing = false;
  let rendering = false;
  let fromDom = false;
  let destroyed = false;
  let multiline = options.multiline ?? true;
  let lastRendered: PromptDocument | null = null;
  const disposables: Unsubscribe[] = [];

  host.id = surfaceId;
  host.classList.add(EDITABLE_SURFACE_CLASS);
  host.setAttribute('data-aic-input', '');
  host.setAttribute('role', 'textbox');
  host.setAttribute('aria-label', ariaLabel());
  host.setAttribute('aria-multiline', String(multiline));
  host.spellcheck = false;

  // -- rendering -----------------------------------------------------------

  function render(): void {
    if (destroyed) return;
    rendering = true;
    try {
      renderDocument(host, editor.getValue(), editor.nodes);
      lastRendered = editor.getValue();
      applyModelSelection(host, editor.getValue(), editor.getSelection());
    } finally {
      rendering = false;
    }
  }

  function syncFromState(): void {
    if (destroyed) return;
    const state = editor.getState();

    const editable = !state.disabled && !state.readonly;
    if (host.getAttribute('contenteditable') !== (editable ? 'true' : 'false')) {
      host.setAttribute('contenteditable', editable ? 'true' : 'false');
    }
    host.toggleAttribute('data-aic-readonly', state.readonly);
    host.toggleAttribute('data-aic-disabled', state.disabled);
    host.setAttribute('aria-label', ariaLabel());
    if (state.placeholder) {
      host.setAttribute('data-placeholder', state.placeholder);
    }
    host.toggleAttribute('data-aic-empty', state.empty);

    if (state.value !== lastRendered) {
      if (fromDom) {
        // The change originated from this host's own input event — the DOM
        // already reflects it. Re-rendering under the browser's active input
        // processing corrupts caret/insert state (duplicated keystrokes).
        lastRendered = state.value;
      } else {
        render();
      }
    }
    syncMultilineHint();
  }

  /**
   * Multiline detection for styling (compact pill → rounded box) and a11y:
   * true when the model contains a newline OR the content spans more than one
   * line box (soft wrap). Growth then comes from `height: auto`; the cap is
   * `--aic-input-max-height` with an internal scrollbar.
   */
  function syncMultilineHint(): void {
    const hasNewline = documentToText(editor.getValue(), { nodes: editor.nodes }).includes('\n');
    const multiline = hasNewline || spansMultipleLines(host);
    host.toggleAttribute('data-aic-multiline', multiline);
  }

  // -- input pipeline --------------------------------------------------------

  function syncFromDom(): void {
    if (destroyed || rendering || composing) return;
    const parsed = parseEditableHost(host, editor.nodes);
    const selection = domSelectionToModel(host, parsed);
    fromDom = true;
    try {
      editor.applyViewUpdate(parsed, selection ?? undefined);
    } finally {
      fromDom = false;
    }
  }

  function handleEnter(shiftKey: boolean): void {
    const state = editor.getState();
    const key = submitKey();

    if (key === 'none' || (key === 'enter' && shiftKey) || (key === 'shift-enter' && !shiftKey)) {
      editor.insertText('\n');
      return;
    }
    if (state.suggestions.length > 0) {
      void editor.acceptSuggestion();
      return;
    }
    void editor.submit();
  }

  function onBeforeInput(event: Event): void {
    if (destroyed) return;
    const inputType = (event as InputEvent).inputType;
    // Enter is fully handled at keydown; beforeinput is a safety net against
    // native paragraph markup from edge paths (e.g. IME confirm).
    if (inputType === 'insertParagraph') {
      event.preventDefault();
    }
    if (inputType === 'historyUndo') {
      event.preventDefault();
      editor.undo();
    }
    if (inputType === 'historyRedo') {
      event.preventDefault();
      editor.redo();
    }
  }

  function onInput(): void {
    if (composing) return;
    syncFromDom();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (destroyed) return;
    const state = editor.getState();
    const key = event.key;

    // Suggestion menu navigation
    if (state.suggestions.length > 0) {
      if (key === 'ArrowDown') {
        event.preventDefault();
        editor.moveSuggestionSelection(1);
        return;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        editor.moveSuggestionSelection(-1);
        return;
      }
      if (key === 'Enter' || key === 'Tab') {
        event.preventDefault();
        void editor.acceptSuggestion();
        return;
      }
      if (key === 'Escape') {
        event.preventDefault();
        editor.closeTrigger('escape');
        return;
      }
    } else if (key === 'Enter') {
      // Enter semantics live here — keydown carries reliable modifier state.
      event.preventDefault();
      handleEnter(event.shiftKey);
      return;
    }

    // History shortcuts (native contentEditable undo is disabled)
    const meta = event.metaKey || event.ctrlKey;
    if (meta && key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) editor.redo();
      else editor.undo();
      return;
    }
    if (meta && key.toLowerCase() === 'y') {
      event.preventDefault();
      editor.redo();
      return;
    }
  }

  function onPaste(event: Event): void {
    if (destroyed) return;
    event.preventDefault();
    const transfer = (event as ClipboardEvent).clipboardData;
    if (!transfer) return;

    const internal = transfer.getData(CLIPBOARD_MIME);
    if (internal) {
      try {
        const parsed = JSON.parse(internal) as { nodes?: PromptNode[] };
        if (Array.isArray(parsed?.nodes)) {
          const sanitized = sanitizeDocument(
            { nodes: parsed.nodes.map(ensureNodeKey) },
            (type) => editor.nodes.has(type),
          );
          if (sanitized.nodes.length > 0) {
            editor.replaceRange(getRange(editor.getSelection()), sanitized.nodes);
            return;
          }
        }
      } catch {
        // malformed internal payload — fall through to plain text
      }
    }

    const html = transfer.getData('text/html');
    const text = transfer.getData('text/plain') || (html ? htmlToPlainText(html) : '');
    if (text) editor.insertText(text);
  }

  function onCopy(event: ClipboardEvent): void {
    const payload = sliceSelection(editor.getValue(), editor.getSelection());
    if (payload.nodes.length === 0) return;
    event.preventDefault();
    const selectedDoc: PromptDocument = { nodes: payload.nodes };
    event.clipboardData?.setData('text/plain', documentText(editor, selectedDoc));
    event.clipboardData?.setData(CLIPBOARD_MIME, JSON.stringify({ nodes: payload.nodes }));
  }

  function onFocus(): void {
    editor.setFocused(true);
  }

  function onBlur(): void {
    editor.setFocused(false);
  }

  function onSelectionChange(): void {
    if (destroyed || rendering) return;
    const ownerDocument = host.ownerDocument;
    const domSelection = ownerDocument.getSelection();
    if (!domSelection || !host.contains(domSelection.anchorNode)) return;
    const selection = domSelectionToModel(host, editor.getValue());
    if (selection) {
      try {
        editor.setSelection(selection);
      } catch {
        // Editor may have been destroyed between the timer scheduling and now.
      }
    }
  }

  // -- wiring ---------------------------------------------------------------

  host.addEventListener('beforeinput', onBeforeInput);
  host.addEventListener('input', onInput);
  host.addEventListener('keydown', onKeyDown);
  host.addEventListener('paste', onPaste);
  host.addEventListener('copy', onCopy as EventListener);
  host.addEventListener('focus', onFocus);
  host.addEventListener('blur', onBlur);
  host.addEventListener('compositionstart', () => {
    composing = true;
  });
  host.addEventListener('compositionend', () => {
    composing = false;
    syncFromDom();
  });
  host.ownerDocument.addEventListener('selectionchange', onSelectionChange);

  disposables.push(
    editor.attachView({
      focus: () => surface.focus(),
      blur: () => surface.blur(),
      render: () => render(),
    }),
  );
  disposables.push(editor.subscribe(syncFromState));
  editor.on('destroy', () => surface.destroy());

  syncFromState();

  const surface: EditableSurface = {
    host,
    render,
    focus(options2) {
      host.focus({ preventScroll: true });
      const ownerDocument = host.ownerDocument;
      const domSelection = ownerDocument.getSelection();
      if (!domSelection || !host.contains(domSelection.focusNode)) {
        const position = options2?.at ?? 'end';
        const doc = editor.getValue();
        const total = doc.nodes.reduce((sum, n) => sum + (n.type === 'text' ? n.text.length : 1), 0);
        const offset = position === 'start' ? 0 : total;
        editor.setSelection(createSelection(fromGlobalOffset(doc, offset)));
      }
    },
    blur() {
      host.blur();
    },
    setMultiline(next: boolean) {
      multiline = next;
      host.setAttribute('aria-multiline', String(next));
    },
    setSubmitKey(key: SubmitKey | undefined) {
      submitKeyOverride = key;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      host.removeEventListener('beforeinput', onBeforeInput);
      host.removeEventListener('input', onInput);
      host.removeEventListener('keydown', onKeyDown);
      host.removeEventListener('paste', onPaste);
      host.removeEventListener('copy', onCopy as EventListener);
      host.removeEventListener('focus', onFocus);
      host.removeEventListener('blur', onBlur);
      host.ownerDocument.removeEventListener('selectionchange', onSelectionChange);
      for (const dispose of disposables.splice(0)) dispose();
      host.setAttribute('contenteditable', 'false');
    },
  };

  return surface;
}

function documentText(editor: PromptEditor, doc: PromptDocument): string {
  return documentToText(doc, { nodes: editor.nodes });
}

/** True when the host's content occupies more than one visual line. */
function spansMultipleLines(host: HTMLElement): boolean {
  const doc = host.ownerDocument;
  const range = doc.createRange();
  range.selectNodeContents(host);
  if (typeof range.getClientRects !== 'function') return false; // jsdom
  const rects = range.getClientRects();
  if (rects.length === 0) return false;
  const firstTop = rects[0].top;
  for (let index = 1; index < rects.length; index += 1) {
    // Same-line rects (chips, inline runs) share a top within a tolerance.
    if (Math.abs(rects[index].top - firstTop) > 2) return true;
  }
  return false;
}

/** Clone the nodes intersecting the current selection (used for copy). */
function sliceSelection(doc: PromptDocument, selection: Parameters<typeof getRange>[0]): { nodes: PromptNode[] } {
  const { start, end } = getRange(selection);
  const toOffset = (position: { nodeIndex: number; offset: number }): number =>
    toGlobalOffset(doc, position);
  const low = Math.min(toOffset(start), toOffset(end));
  const high = Math.max(toOffset(start), toOffset(end));

  const nodes: PromptNode[] = [];
  let cursor = 0;
  for (const node of doc.nodes) {
    const length = node.type === 'text' ? node.text.length : 1;
    const nodeStart = cursor;
    const nodeEnd = cursor + length;
    cursor = nodeEnd;
    if (nodeEnd <= low || nodeStart >= high) continue;
    if (node.type !== 'text') {
      nodes.push(node);
    } else {
      const from = Math.max(0, low - nodeStart);
      const to = Math.min(length, high - nodeStart);
      const text = node.text.slice(from, to);
      if (text) nodes.push({ ...node, text });
    }
  }
  return { nodes };
}
