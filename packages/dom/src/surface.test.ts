import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAttachmentNode,
  createAIComposer,
  createDefaultNodeRegistry,
  createMentionNode,
  createTextNode,
} from '@ai-composer/core';
import { createEditableSurface } from './surface';
import { parseEditableHost, htmlToPlainText } from './parse';
import { mountAIComposer } from './mount';

const registry = createDefaultNodeRegistry();

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('parse + render round-trip', () => {
  it('parses text and chips back into the model', () => {
    const editor = createAIComposer({
      value: [createTextNode('hi '), createMentionNode({ id: 'u1', label: 'Ada' }), createTextNode('!')],
    });
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    container.appendChild(host);

    const parsed = parseEditableHost(host, editor.nodes);
    expect(parsed.nodes.map((n) => (n.type === 'text' ? n.text : n.type))).toEqual([
      'hi ',
      'mention',
      '!',
    ]);
    surface.destroy();
  });

  it('flattens unknown markup to plain text (sanitization)', () => {
    const host = document.createElement('div');
    host.innerHTML = 'a<div onclick="evil()"><b>b</b></div><script>alert(1)</script>c';
    const parsed = parseEditableHost(host, registry);
    expect(parsed.nodes).toHaveLength(1);
    expect((parsed.nodes[0] as { text: string }).text).toBe('abc');
  });

  it('converts <br> to newlines', () => {
    const host = document.createElement('div');
    host.innerHTML = 'one<br>two';
    const parsed = parseEditableHost(host, registry);
    expect((parsed.nodes[0] as { text: string }).text).toBe('one\ntwo');
  });

  it('extracts plain text from HTML on the paste path', () => {
    expect(htmlToPlainText('<p>Hello</p><p><b>World</b></p>')).toContain('Hello');
    expect(htmlToPlainText('a<br>b')).toBe('a\nb');
  });
});

describe('editable surface', () => {
  it('shows attachments in the attachments slot, not inline with input text', () => {
    const editor = createAIComposer({
      value: [createTextNode('Review this'), createAttachmentNode({
        id: 'f1',
        name: 'spec.pdf',
        mimeType: 'application/pdf',
      })],
    });
    const mounted = mountAIComposer(container, editor, { mode: 'chat' });
    const inlineAttachment = mounted.input.querySelector('[data-aic-node="attachment"]');

    expect(inlineAttachment?.hasAttribute('hidden')).toBe(true);
    expect(mounted.slots.attachments.querySelectorAll('.aic-attachment-name')).toHaveLength(1);
    expect(mounted.slots.attachments.textContent).toContain('spec.pdf');
    expect(parseEditableHost(mounted.input, editor.nodes).nodes.map((node) => node.type)).toEqual([
      'text',
      'attachment',
    ]);

    mounted.destroy();
  });

  it('renders the document into the host', () => {
    const editor = createAIComposer({ value: 'hello' });
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    expect(host.textContent).toBe('hello');
    surface.destroy();
  });

  it('syncs user DOM edits back into the model', () => {
    const editor = createAIComposer();
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    container.appendChild(host);

    host.textContent = 'typed by user';
    host.dispatchEvent(new Event('input', { bubbles: true }));

    expect(editor.serialize('text')).toBe('typed by user');
    surface.destroy();
  });

  it('re-renders on programmatic model changes', () => {
    const editor = createAIComposer();
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    editor.insertNode(createMentionNode({ id: 'u1', label: 'Ada' }));
    expect(host.textContent).toBe('@Ada ');
    expect(host.querySelector('[data-aic-node="mention"]')).not.toBeNull();
    surface.destroy();
  });

  it('Enter submits when suggestions are closed (submitKey=enter)', () => {
    const onSubmit = vi.fn();
    const editor = createAIComposer({ value: 'hello', submit: { onSubmit } });
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    container.appendChild(host);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    host.dispatchEvent(enter);

    expect(enter.defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    surface.destroy();
  });

  it('Shift+Enter inserts a newline instead of submitting', () => {
    const onSubmit = vi.fn();
    const editor = createAIComposer({ value: 'hello', submit: { onSubmit } });
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    container.appendChild(host);

    host.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
    expect(editor.serialize('text')).toBe('hello\n');
    surface.destroy();
  });

  it('undo/redo keyboard shortcuts route through history', () => {
    const editor = createAIComposer();
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    container.appendChild(host);

    host.textContent = 'step';
    host.dispatchEvent(new Event('input', { bubbles: true }));
    expect(editor.serialize('text')).toBe('step');

    host.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', metaKey: true, bubbles: true, cancelable: true }),
    );
    expect(editor.getState().empty).toBe(true);

    host.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', metaKey: true, shiftKey: true, bubbles: true, cancelable: true }),
    );
    expect(editor.serialize('text')).toBe('step');
    surface.destroy();
  });

  it('reflects disabled/readonly state on the host', () => {
    const editor = createAIComposer();
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    expect(host.getAttribute('contenteditable')).toBe('true');

    editor.setReadonly(true);
    expect(host.getAttribute('contenteditable')).toBe('false');
    expect(host.hasAttribute('data-aic-readonly')).toBe(true);

    editor.setReadonly(false);
    editor.setDisabled(true);
    expect(host.getAttribute('contenteditable')).toBe('false');
    surface.destroy();
  });

  it('placeholder attributes are managed for CSS', () => {
    const editor = createAIComposer({ placeholder: 'Ask anything…' });
    const host = document.createElement('div');
    const surface = createEditableSurface(editor, host);
    expect(host.getAttribute('data-placeholder')).toBe('Ask anything…');
    expect(host.hasAttribute('data-aic-empty')).toBe(true);
    surface.destroy();
  });
});

describe('mountAIComposer (vanilla)', () => {
  it('builds the chat layout and submits from the toolbar', async () => {
    const onSubmit = vi.fn();
    const editor = createAIComposer({ value: 'ping', mode: 'chat', submit: { onSubmit } });
    const mounted = mountAIComposer(container, editor);

    expect(mounted.root.getAttribute('data-aic-mode')).toBe('chat');
    expect(mounted.slots.toolbar).toBeDefined();
    expect(mounted.input.getAttribute('role')).toBe('textbox');

    const submitButton = mounted.slots.toolbar.querySelector<HTMLButtonElement>('[data-aic-action="submit"]');
    expect(submitButton).not.toBeNull();
    submitButton!.click();
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    mounted.destroy();
    expect(container.textContent).toBe('');
  });

  it('compact renders inline send; modes switch live without remount', () => {
    const editor = createAIComposer({ mode: 'compact', value: 'draft' });
    const mounted = mountAIComposer(container, editor);

    expect(mounted.root.getAttribute('data-aic-mode')).toBe('compact');
    // Compact keeps one line: chips + input + send laid out by CSS.
    expect(mounted.slots.toolbar.hidden).toBe(false);
    expect(mounted.slots.toolbar.querySelector('[data-aic-action="submit"]')).not.toBeNull();
    expect(mounted.slots.header.hidden).toBe(true);
    expect(mounted.slots.footer.hidden).toBe(true);
    // Compact is multiline-capable (wraps + grows); single line stays flagged.
    expect(mounted.input.getAttribute('aria-multiline')).toBe('true');
    expect(mounted.input.hasAttribute('data-aic-multiline')).toBe(false);

    editor.setMode('chat');
    expect(mounted.root.getAttribute('data-aic-mode')).toBe('chat');
    expect(mounted.slots.toolbar.hidden).toBe(false);
    expect(mounted.slots.toolbar.querySelector('[data-aic-action="submit"]')).not.toBeNull();
    // Same surface instance — the draft and undo history survive the switch.
    expect(editor.serialize('text')).toBe('draft');
    expect(mounted.input.textContent).toBe('draft');
    mounted.destroy();
  });

  it('multiline detection flags wrapped/newline content (data-aic-multiline)', () => {
    const editor = createAIComposer({ mode: 'compact' });
    const mounted = mountAIComposer(container, editor);

    mounted.input.textContent = 'line one\nline two';
    mounted.input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(mounted.input.hasAttribute('data-aic-multiline')).toBe(true);
    // Mirrored onto the root — theme CSS uses plain attribute selectors.
    expect(mounted.root.hasAttribute('data-aic-multiline')).toBe(true);

    editor.setValue('single line');
    expect(mounted.input.hasAttribute('data-aic-multiline')).toBe(false);
    expect(mounted.root.hasAttribute('data-aic-multiline')).toBe(false);
    mounted.destroy();
  });

  it('typing through the mount updates state and events', () => {
    const editor = createAIComposer({ mode: 'chat' });
    const changes: string[] = [];
    editor.on('change', (event) => changes.push(event.source));
    const mounted = mountAIComposer(container, editor);

    mounted.input.textContent = 'hello';
    mounted.input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(editor.serialize('text')).toBe('hello');
    expect(changes).toContain('user');
    mounted.destroy();
  });
});
