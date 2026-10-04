/**
 * Vanilla JS mount — proves the stack works with zero framework. Builds the
 * default DOM for a mode template, wires toolbar/attachments/suggestions and
 * the editable surface.
 */

import type { PromptEditor, SuggestionItem, Unsubscribe } from '@ai-composer/core';
import { createEditableSurface, type EditableSurface } from './surface';
import { createSuggestionList } from './suggestions';
import { templateForMode, SLOT_ATTRIBUTE, type PromptDomTemplate } from './template';

export interface MountOptions {
  mode?: string;
  /** Replace the structural preset. */
  template?: PromptDomTemplate;
  /** Custom suggestion item renderer. */
  renderSuggestionItem?: (item: SuggestionItem, active: boolean) => HTMLElement;
  labels?: { submit?: string; undo?: string; redo?: string; removeAttachment?: string };
}

export interface MountedEditor {
  root: HTMLElement;
  input: HTMLElement;
  suggestions: HTMLElement;
  surface: EditableSurface;
  slots: Record<string, HTMLElement>;
  destroy(): void;
}

export function mountPromptEditor(
  container: HTMLElement,
  editor: PromptEditor,
  options: MountOptions = {},
): MountedEditor {
  const mode = options.mode ?? editor.getState().mode;
  const template = options.template ?? templateForMode(mode);
  const labels = {
    submit: options.labels?.submit ?? 'Send',
    undo: options.labels?.undo ?? 'Undo',
    redo: options.labels?.redo ?? 'Redo',
    removeAttachment: options.labels?.removeAttachment ?? 'Remove',
  };

  const slots: Record<string, HTMLElement> = {};
  const disposables: Unsubscribe[] = [];

  const has = (name: string): boolean => template.slots.includes(name as never);

  const slot = (name: string, className: string, tag = 'div'): HTMLElement => {
    const element = document.createElement(tag);
    element.className = className;
    element.setAttribute(SLOT_ATTRIBUTE, name);
    slots[name] = element;
    return element;
  };

  // Only create slots the template asks for.
  const header = has('header') ? slot('header', 'aic-header') : null;
  const body = has('body') ? slot('body', 'aic-body') : null;
  const attachments = has('attachments') ? slot('attachments', 'aic-attachments') : null;
  const input = slot('input', 'aic-input-host');
  const toolbar = has('toolbar') ? slot('toolbar', 'aic-toolbar') : null;
  const footer = has('footer') ? slot('footer', 'aic-footer') : null;

  const root = container;
  root.classList.add('aic-root');
  root.setAttribute('data-aic-mode', template.name);

  if (header) root.appendChild(header);
  if (body) root.appendChild(body);
  if (toolbar) root.appendChild(toolbar);
  if (footer) root.appendChild(footer);

  const bodyParent = body ?? root;
  if (attachments) bodyParent.appendChild(attachments);
  bodyParent.appendChild(input);
  // suggestions anchor needs relative positioning for the absolute list
  const suggestionsAnchor = (() => {
    if (!has('suggestions')) return bodyParent;
    const anchor = document.createElement('div');
    anchor.className = 'aic-suggestions-anchor';
    anchor.style.position = 'relative';
    anchor.setAttribute(SLOT_ATTRIBUTE, 'suggestions');
    slots.suggestions = anchor;
    bodyParent.appendChild(anchor);
    return anchor;
  })();

  // Editable surface + suggestion list
  const surface = createEditableSurface(editor, input, {
    multiline: template.multiline,
    id: input.id || undefined,
  });

  const suggestionList = createSuggestionList(editor, undefined, {
    renderItem: options.renderSuggestionItem,
    inputHost: input,
  });
  suggestionsAnchor.appendChild(suggestionList.element);

  // Toolbar buttons
  const buttons: Record<string, HTMLButtonElement> = {};
  for (const action of template.toolbarButtons ?? []) {
    if (!toolbar) break;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `aic-toolbar-${action}`;
    if (action === 'submit') {
      button.textContent = labels.submit;
      button.setAttribute('data-aic-action', 'submit');
      button.addEventListener('click', () => void editor.executeCommand('submit'));
    } else if (action === 'undo') {
      button.textContent = labels.undo;
      button.setAttribute('data-aic-action', 'undo');
      button.addEventListener('click', () => void editor.executeCommand('undo'));
    } else {
      button.textContent = labels.redo;
      button.setAttribute('data-aic-action', 'redo');
      button.addEventListener('click', () => void editor.executeCommand('redo'));
    }
    buttons[action] = button;
    toolbar.appendChild(button);
  }

  // State-driven UI (attachments, button availability, mode attr)
  const unsubscribeState = editor.subscribe((state) => {
    const canSubmit = !state.disabled && !state.readonly && !state.submitting && (!state.empty || state.attachments.length > 0);
    if (buttons.submit) {
      buttons.submit.disabled = !canSubmit;
      buttons.submit.setAttribute('aria-disabled', String(!canSubmit));
      buttons.submit.textContent = state.submitting ? '…' : labels.submit;
    }
    if (buttons.undo) buttons.undo.disabled = !state.canUndo;
    if (buttons.redo) buttons.redo.disabled = !state.canRedo;

    if (attachments) {
      attachments.textContent = '';
      attachments.toggleAttribute('hidden', state.attachments.length === 0);
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
        remove.textContent = '×';
        remove.addEventListener('click', () => editor.removeNode(attachment.key));
        item.append(name, remove);
        attachments.appendChild(item);
      }
    }
  });
  disposables.push(unsubscribeState);

  const onDestroy = (): void => mounted.destroy();
  editor.on('destroy', onDestroy);

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
