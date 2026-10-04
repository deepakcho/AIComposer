import { afterEach, describe, expect, it, vi } from 'vitest';
import { StrictMode, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPromptEditor } from '@ai-composer/core';
import { definePromptEditorContractSuite } from '@ai-composer/testing';
import { PromptEditor, PromptInput, PromptToolbar } from './index';

let container: HTMLDivElement;
let root: Root | null = null;

function render(element: ReactElement): void {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(<StrictMode>{element}</StrictMode>);
}

function flush(): void {
  return void 0;
}

async function rendered(): Promise<void> {
  await vi.waitFor(() => {
    if (!container.firstElementChild) throw new Error('not rendered yet');
  });
}

afterEach(() => {
  root?.unmount();
  root = null;
  container?.remove();
});

describe('PromptEditor component', () => {
  it('renders the editor with mode attributes', async () => {
    render(<PromptEditor mode="chat" placeholder="Ask anything…" />);
    flush();
    await rendered();
    const rootEl = container.querySelector('.aic-root');
    expect(rootEl).not.toBeNull();
    expect(rootEl?.getAttribute('data-aic-mode')).toBe('chat');
    const input = container.querySelector('[data-aic-input]');
    expect(input?.getAttribute('data-placeholder')).toBe('Ask anything…');
  });

  it('typing through the React-mounted surface updates the model', async () => {
    const editor = createPromptEditor();
    render(
      <PromptEditor editor={editor}>
        <PromptInput />
      </PromptEditor>,
    );
    flush();
    await rendered();
    const input = container.querySelector<HTMLElement>('[data-aic-input]');
    expect(input).not.toBeNull();
    input!.textContent = 'hello from react';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(editor.serialize('text')).toBe('hello from react');
  });

  it('submits via the default toolbar button', async () => {
    const onSubmit = vi.fn();
    const editor = createPromptEditor({ value: 'ping', submit: { onSubmit } });
    render(
      <PromptEditor editor={editor}>
        <PromptInput />
        <PromptToolbar />
      </PromptEditor>,
    );
    flush();
    await rendered();
    const button = container.querySelector<HTMLButtonElement>('[data-aic-action="submit"]');
    expect(button).not.toBeNull();
    button!.click();
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});

// The same contract every adapter must pass.
definePromptEditorContractSuite((options) => createPromptEditor(options), {
  title: 'PromptEditor contract (react package, headless reference)',
});
