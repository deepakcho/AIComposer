/**
 * Accessible suggestion list (role=listbox) driven by editor state. Keyboard
 * navigation lives in the editable surface; this module renders and handles
 * pointer selection.
 */

import type { PromptEditor, SuggestionItem, Unsubscribe } from '@ai-composer/core';

export interface SuggestionListOptions {
  /** Custom item renderer; default is a simple label/description row. */
  renderItem?: (item: SuggestionItem, active: boolean) => HTMLElement;
  /** The editable host to wire aria-controls / aria-activedescendant onto. */
  inputHost?: HTMLElement;
}

export interface SuggestionList {
  readonly element: HTMLElement;
  destroy(): void;
}

let listCounter = 0;

export function createSuggestionList(
  editor: PromptEditor,
  element?: HTMLElement,
  options: SuggestionListOptions = {},
): SuggestionList {
  const list = element ?? document.createElement('ul');
  if (!list.id) list.id = `aic-suggestions-${(listCounter += 1)}`;
  list.className = 'aic-suggestions';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-hidden', 'true');
  list.hidden = true;
  list.style.position = 'absolute';
  list.style.left = '0';
  list.style.width = '100%';

  const defaultItem = (item: SuggestionItem, active: boolean): HTMLElement => {
    const li = document.createElement('li');
    li.className = 'aic-suggestion' + (active ? ' aic-active' : '');
    li.setAttribute('role', 'option');
    if (item.description) {
      const label = document.createElement('span');
      label.className = 'aic-suggestion-label';
      label.textContent = item.label;
      const description = document.createElement('span');
      description.className = 'aic-suggestion-description';
      description.textContent = item.description;
      li.append(label, description);
    } else {
      li.textContent = item.label;
    }
    return li;
  };

  const renderItem = options.renderItem ?? defaultItem;

  const sync = (state: ReturnType<PromptEditor['getState']>): void => {
    const open = state.activeTrigger !== null && state.suggestions.length > 0;
    list.hidden = !open;
    list.setAttribute('aria-hidden', String(!open));

    const input = options.inputHost;
    if (input) {
      input.setAttribute('aria-controls', list.id);
      input.setAttribute('aria-expanded', String(open));
      if (open && state.activeSuggestionIndex >= 0) {
        input.setAttribute('aria-activedescendant', `${list.id}-option-${state.activeSuggestionIndex}`);
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    list.textContent = '';
    if (!open) return;

    state.suggestions.forEach((item, index) => {
      const active = index === state.activeSuggestionIndex;
      const li = renderItem(item, active);
      li.id = `${list.id}-option-${index}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(active));
      li.addEventListener('mousedown', (event) => event.preventDefault()); // keep caret in place
      li.addEventListener('click', () => {
        void editor.acceptSuggestion(item);
      });
      list.appendChild(li);
    });
  };

  const unsubscribe: Unsubscribe = editor.subscribe(sync);
  editor.on('destroy', () => destroy());

  function destroy(): void {
    unsubscribe();
    list.textContent = '';
    list.hidden = true;
  }

  sync(editor.getState());

  return { element: list, destroy };
}
