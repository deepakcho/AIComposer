import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAIComposer } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { defineAIComposerContractSuite } from '@ai-composer/testing';
import { defineAiComposerEditor } from './index';

defineAiComposerEditor();

let host: HTMLDivElement | null = null;

function attach(html: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host.firstElementChild as HTMLElement;
}

async function attachUpgraded(html: string): Promise<HTMLElement> {
  const element = attach(html);
  // mount() promotes the element itself to .aic-root
  await vi.waitFor(() => expect(element.classList.contains('aic-root')).toBe(true));
  return element;
}

afterEach(() => {
  host?.remove();
  host = null;
});

describe('<ai-composer-editor>', () => {
  it('defines and upgrades the custom element', async () => {
    const element = await attachUpgraded('<ai-composer-editor mode="chat"></ai-composer-editor>');
    expect(element.getAttribute('data-aic-mode')).toBe('chat');
    expect(element.querySelector('[data-aic-input]')).not.toBeNull();
  });

  it('attributes map to editor config', async () => {
    const element = await attachUpgraded(
      '<ai-composer-editor placeholder="Hi" disabled></ai-composer-editor>',
    );
    const editor = (element as unknown as { editor: ReturnType<typeof createAIComposer> }).editor;
    expect(editor.getState().placeholder).toBe('Hi');
    expect(editor.getState().disabled).toBe(true);
  });

  it('typing syncs and aic-change/aic-submit events fire', async () => {
    const element = await attachUpgraded('<ai-composer-editor></ai-composer-editor>');
    const editor = (element as unknown as { editor: ReturnType<typeof createAIComposer> }).editor;
    const onChange = vi.fn();
    element.addEventListener('aic-change', onChange);

    const input = element.querySelector<HTMLElement>('[data-aic-input]');
    input!.textContent = 'from web component';
    input!.dispatchEvent(new Event('input', { bubbles: true }));

    expect(editor.serialize('text')).toBe('from web component');
    expect(onChange).toHaveBeenCalled();
  });

  it('works with plugins set before connection', async () => {
    const hostDiv = document.createElement('div');
    document.body.appendChild(hostDiv);
    host = hostDiv;
    const element = document.createElement('ai-composer-editor') as HTMLElement & {
      plugins: unknown[];
    };
    element.plugins = [
      mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace' }] }),
    ];
    hostDiv.appendChild(element); // triggers connectedCallback

    const editor = (element as unknown as { editor: ReturnType<typeof createAIComposer> }).editor;
    editor.insertText('@ad');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));
    await editor.acceptSuggestion();
    expect(editor.serialize('text')).toBe('@Ada Lovelace ');
  });
});

defineAIComposerContractSuite((options) => createAIComposer(options), {
  title: 'AIComposer contract (web-component package, headless reference)',
});
