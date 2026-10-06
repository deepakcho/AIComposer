/**
 * Vanilla JS mount — proves the stack works with zero framework. Builds the
 * DOM once (every slot exists), then applies the mode's structural preset and
 * re-applies it live when the editor's mode changes — the draft, focus and
 * undo history survive a compact ↔ chat ↔ expanded switch.
 */

import type { AIComposer, SuggestionItem, Unsubscribe } from '@ai-composer/core';
import { createEditableSurface, type EditableSurface } from './surface';
import { createSuggestionList } from './suggestions';
import { createIcon, createSpinner } from './icons';
import { templateForMode, SLOT_ATTRIBUTE, type AIComposerDomTemplate } from './template';

export interface MountOptions {
  /** Initial mode preset; can be changed later via `editor.setMode()`. */
  mode?: string;
  /** Replace the structural preset (static — not mode-switched). */
  template?: AIComposerDomTemplate;
  /**
   * Force slots on regardless of the mode preset (projection-friendly):
   * attachments/header/toolbar/footer stay mountable in compact too.
   */
  showSlots?: Array<'header' | 'attachments' | 'toolbar' | 'footer'>;
  /**
   * Auto-height ceiling — any CSS length ("160px", "40vh"). The box grows
   * with content up to this height, then scrolls inside.
   * Equivalent to the `--aic-input-max-height` token.
   */
  maxHeight?: string;
  /** Custom suggestion item renderer. */
  renderSuggestionItem?: (item: SuggestionItem, active: boolean) => HTMLElement;
  labels?: { removeAttachment?: string };
}

export interface MountedEditor {
  root: HTMLElement;
  input: HTMLElement;
  suggestions: HTMLElement;
  surface: EditableSurface;
  slots: Record<string, HTMLElement>;
  destroy(): void;
}

export function mountAIComposer(
  container: HTMLElement,
  editor: AIComposer,
  options: MountOptions = {},
): MountedEditor {
  const labels = {
    removeAttachment: options.labels?.removeAttachment ?? 'Remove',
  };

  const slots: Record<string, HTMLElement> = {};
  const disposables: Unsubscribe[] = [];

  const makeSlot = (name: string, className: string): HTMLElement => {
    const element = document.createElement('div');
    element.className = className;
    element.setAttribute(SLOT_ATTRIBUTE, name);
    slots[name] = element;
    return element;
  };

  const root = container;
  root.classList.add('aic-root');
  if (options.maxHeight) {
    root.style.setProperty('--aic-input-max-height', options.maxHeight);
  }

  const header = makeSlot('header', 'aic-header');
  const body = makeSlot('body', 'aic-body');
  const toolbar = makeSlot('toolbar', 'aic-toolbar');
  const footer = makeSlot('footer', 'aic-footer');
  const attachments = makeSlot('attachments', 'aic-attachments');
  const input = makeSlot('input', 'aic-input-host');

  root.append(header, body, toolbar, footer);

  // The input wrapper is the popup anchor: it occupies exactly the input's
  // space — the suggestion list floats out of it (no DOM-space reservation).
  const inputWrap = document.createElement('div');
  inputWrap.className = 'aic-input-wrap';
  inputWrap.setAttribute(SLOT_ATTRIBUTE, 'suggestions');
  inputWrap.appendChild(input);
  slots.suggestions = inputWrap;
  body.append(attachments, inputWrap);

  const surface = createEditableSurface(editor, input, { id: input.id || undefined });

  const suggestionList = createSuggestionList(editor, undefined, {
    renderItem: options.renderSuggestionItem,
    inputHost: input,
  });
  inputWrap.appendChild(suggestionList.element);

  // -- mode presets ----------------------------------------------------------

  const applyTemplate = (mode: string): void => {
    const template = options.template ?? templateForMode(mode);
    const present = new Set(template.slots);
    for (const slotName of options.showSlots ?? []) present.add(slotName);

    root.setAttribute('data-aic-mode', template.name);
    header.hidden = !present.has('header');
    toolbar.hidden = !present.has('toolbar');
    footer.hidden = !present.has('footer');
    surface.setMultiline(template.multiline);
    surface.setSubmitKey(template.submitKey);

    if (toolbar) {
      toolbar.textContent = '';
      for (const action of template.toolbarButtons ?? []) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `aic-toolbar-${action}`;
        button.setAttribute('data-aic-action', action);
        if (action === 'submit') {
          button.appendChild(createIcon('send'));
          button.setAttribute('aria-label', 'Send');
          button.addEventListener('click', () => void editor.executeCommand('submit'));
        } else if (action === 'undo') {
          button.appendChild(createIcon('undo'));
          button.setAttribute('aria-label', 'Undo');
          button.addEventListener('click', () => void editor.executeCommand('undo'));
        } else {
          button.appendChild(createIcon('redo'));
          button.setAttribute('aria-label', 'Redo');
          button.addEventListener('click', () => void editor.executeCommand('redo'));
        }
        toolbar.appendChild(button);
      }
    }
  };

  // -- state-driven UI -------------------------------------------------------

  let currentMode = '';
  const syncUi = (state: ReturnType<AIComposer['getState']>): void => {
    if (state.mode !== currentMode) {
      currentMode = state.mode;
      applyTemplate(state.mode);
    }

    const submit = toolbar.querySelector<HTMLButtonElement>('[data-aic-action="submit"]');
    if (submit) {
      const canSubmit =
        !state.disabled && !state.readonly && !state.submitting &&
        (!state.empty || state.attachments.length > 0);
      submit.disabled = !canSubmit;
      submit.setAttribute('aria-disabled', String(!canSubmit));
      if (state.submitting) {
        if (!submit.querySelector('.aic-spinner')) {
          submit.textContent = '';
          submit.appendChild(createSpinner());
        }
      } else if (!submit.querySelector('svg')) {
        submit.textContent = '';
        submit.appendChild(createIcon('send'));
      }
    }
    const undo = toolbar.querySelector<HTMLButtonElement>('[data-aic-action="undo"]');
    if (undo) undo.disabled = !state.canUndo;
    const redo = toolbar.querySelector<HTMLButtonElement>('[data-aic-action="redo"]');
    if (redo) redo.disabled = !state.canRedo;

    // Attachments are projection-friendly: visible whenever they exist,
    // regardless of the mode preset (apps add them via editor.addAttachment).
    attachments.hidden = state.attachments.length === 0;
    attachments.textContent = '';
    for (const attachment of state.attachments) {
      const item = document.createElement('span');
      item.className = 'aic-attachment';
      const name = document.createElement('span');
      name.className = 'aic-attachment-name';
      name.textContent = attachment.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'aic-attachment-remove';
      remove.setAttribute('aria-label', `${labels.removeAttachment} ${attachment.name}`);
      remove.appendChild(createIcon('close', 12));
      remove.addEventListener('click', () => editor.removeNode(attachment.key));
      item.append(name, remove);
      attachments.appendChild(item);
    }
  };
  const unsubscribeState = editor.subscribe(syncUi);
  disposables.push(unsubscribeState);

  if (options.mode && options.mode !== editor.getState().mode) {
    editor.setMode(options.mode);
  }
  // setMode emits to subscribers; ensure the initial template is applied even
  // when the editor was already in the target mode.
  currentMode = editor.getState().mode;
  applyTemplate(currentMode);
  syncUi(editor.getState());

  const offDestroy = editor.on('destroy', () => mounted.destroy());
  disposables.push(offDestroy);

  const mounted: MountedEditor = {
    root,
    input,
    suggestions: suggestionList.element,
    surface,
    slots,
    destroy() {
      for (const dispose of disposables.splice(0)) dispose();
      suggestionList.destroy();
      surface.destroy();
      root.textContent = '';
      root.classList.remove('aic-root');
      root.removeAttribute('data-aic-mode');
    },
  };

  return mounted;
}
