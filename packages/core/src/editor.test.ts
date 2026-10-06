import { describe, expect, it, vi } from 'vitest';
import { createAIComposer } from './factory';
import { createMentionNode, createTextNode } from './model/nodes';
import { createPosition, createSelection, toGlobalOffset } from './model/selection';
import { ErrorCode } from './errors';

describe('AIComposer aliases', () => {
  it('exposes the new AIComposer factory aliases', () => {
    const aiComposer = createAIComposer();
    const legacyAIComposer = createAIComposer();

    expect(aiComposer.getState().empty).toBe(true);
    expect(legacyAIComposer.getState().empty).toBe(true);
  });
});

describe('AIComposer — value API', () => {
  it('starts empty', () => {
    const editor = createAIComposer();
    expect(editor.getValue().nodes).toEqual([]);
    expect(editor.getState().empty).toBe(true);
  });

  it('setValue accepts string, nodes and documents', () => {
    const editor = createAIComposer();
    editor.setValue('hello');
    expect(editor.serialize('text')).toBe('hello');

    editor.setValue([createTextNode('a '), createMentionNode({ id: 'u1', label: 'Ada' })]);
    expect(editor.serialize('text')).toBe('a @Ada');

    editor.setValue({ nodes: [createTextNode('doc')] });
    expect(editor.serialize('text')).toBe('doc');
  });

  it('insertText appends and moves the caret', () => {
    const editor = createAIComposer();
    editor.insertText('hello');
    editor.insertText(' world');
    expect(editor.serialize('text')).toBe('hello world');
    const focus = editor.getSelection().focus;
    expect(toGlobalOffset(editor.getValue(), focus)).toBe(11);
  });

  it('insertText replaces an active selection', () => {
    const editor = createAIComposer({ value: 'hello world' });
    editor.setSelection(
      createSelection(createPosition(0, 0), createPosition(0, 5)),
    );
    editor.insertText('goodbye');
    expect(editor.serialize('text')).toBe('goodbye world');
  });

  it('insertNode adds an atomic node with trailing space', () => {
    const editor = createAIComposer({ value: 'hi ' });
    editor.insertNode(createMentionNode({ id: 'u1', label: 'Ada' }));
    expect(editor.serialize('text')).toBe('hi @Ada ');
    // caret after the trailing space ('hi '=3 + chip=1 + space=1)
    expect(toGlobalOffset(editor.getValue(), editor.getSelection().focus)).toBe(5);
  });

  it('removeNode deletes by key and reports the event', () => {
    const editor = createAIComposer();
    const onRemove = vi.fn();
    editor.on('nodeRemove', onRemove);

    const mention = createMentionNode({ id: 'u1', label: 'Ada' });
    editor.setValue([createTextNode('a '), mention, createTextNode('b')]);
    editor.removeNode(mention.key);

    expect(editor.serialize('text')).toBe('a b');
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ node: mention }));
  });

  it('clear empties the document', () => {
    const editor = createAIComposer({ value: 'x' });
    editor.clear();
    expect(editor.getState().empty).toBe(true);
  });
});

describe('AIComposer — events and state', () => {
  it('emits change/input and notifies subscribers', () => {
    const editor = createAIComposer();
    const change = vi.fn();
    const input = vi.fn();
    const stateListener = vi.fn();
    editor.on('change', change);
    editor.on('input', input);
    editor.subscribe(stateListener);

    editor.insertText('hi');

    expect(change).toHaveBeenCalledWith(expect.objectContaining({ source: 'api' }));
    // programmatic edits are 'api' — input only fires for user edits
    expect(input).not.toHaveBeenCalled();
    expect(stateListener).toHaveBeenCalled();
    expect(editor.getState().empty).toBe(false);
  });

  it('applyViewUpdate is treated as user input', () => {
    const editor = createAIComposer();
    const input = vi.fn();
    editor.on('input', input);
    editor.applyViewUpdate({ nodes: [createTextNode('typed')] });
    expect(editor.serialize('text')).toBe('typed');
    expect(input).toHaveBeenCalledWith(expect.objectContaining({ source: 'user' }));
  });

  it('selection changes are clamped and emitted', () => {
    const editor = createAIComposer({ value: 'abc' });
    const onChange = vi.fn();
    editor.on('selectionChange', onChange);
    editor.setSelection(createSelection(createPosition(0, 2)));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(editor.getSelection().focus).toEqual(createPosition(0, 2));

    editor.setSelection(createSelection(createPosition(99, 99)));
    expect(editor.getSelection().focus).toEqual(createPosition(0, 3));
  });

  it('focus/blur toggle focused state and emit events', () => {
    const editor = createAIComposer();
    const focus = vi.fn();
    const blur = vi.fn();
    editor.on('focus', focus);
    editor.on('blur', blur);
    editor.focus();
    editor.blur();
    expect(focus).toHaveBeenCalledWith({ focused: true });
    expect(blur).toHaveBeenCalledWith({ focused: false });
  });
});

describe('AIComposer — submit', () => {
  it('runs the async handler and emits submit', async () => {
    const onSubmit = vi.fn(async () => undefined);
    const editor = createAIComposer({ value: 'question', submit: { onSubmit } });
    const beforeSubmit = vi.fn();
    const submitted = vi.fn();
    editor.on('beforeSubmit', beforeSubmit);
    editor.on('submit', submitted);

    await editor.submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(beforeSubmit).toHaveBeenCalled();
    expect(submitted).toHaveBeenCalledWith(expect.objectContaining({ value: editor.getValue() }));
    expect(editor.getState().submitting).toBe(false);
  });

  it('beforeSubmit can cancel', async () => {
    const onSubmit = vi.fn();
    const editor = createAIComposer({ value: 'x', submit: { onSubmit } });
    editor.on('beforeSubmit', (event) => event.preventDefault());
    await editor.submit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('skips empty documents unless allowEmpty', async () => {
    const onSubmit = vi.fn();
    const strict = createAIComposer({ submit: { onSubmit } });
    await strict.submit();
    expect(onSubmit).not.toHaveBeenCalled();

    const lax = createAIComposer({ submit: { onSubmit, allowEmpty: true } });
    await lax.submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('clearOnSubmit resets the document', async () => {
    const editor = createAIComposer({
      value: 'hello',
      submit: { clearOnSubmit: true },
    });
    await editor.submit();
    expect(editor.getState().empty).toBe(true);
  });

  it('disabled editors do not submit', async () => {
    const onSubmit = vi.fn();
    const editor = createAIComposer({ value: 'x', disabled: true, submit: { onSubmit } });
    await editor.submit();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AIComposer — history', () => {
  it('undoes and redoes setValue steps', () => {
    const editor = createAIComposer();
    editor.setValue('one');
    editor.setValue('two');
    editor.undo();
    expect(editor.serialize('text')).toBe('one');
    editor.undo();
    expect(editor.getState().empty).toBe(true);
    editor.redo();
    expect(editor.serialize('text')).toBe('one');
    editor.redo();
    expect(editor.serialize('text')).toBe('two');
  });

  it('a transaction is a single undo step', () => {
    const editor = createAIComposer();
    editor.transaction(() => {
      editor.insertText('Hello');
      editor.insertNode(createMentionNode({ id: 'u1', label: 'Ada' }));
      editor.insertText('rest');
    });
    expect(editor.serialize('text')).toBe('Hello@Ada rest');
    editor.undo();
    expect(editor.getState().empty).toBe(true);
  });

  it('rapid user input merges into one undo step', async () => {
    const editor = createAIComposer();
    const type = (text: string) =>
      editor.applyViewUpdate({ nodes: [createTextNode(editor.serialize('text') + text)] });

    type('a');
    type('b');
    type('c');
    expect(editor.serialize('text')).toBe('abc');
    editor.undo();
    expect(editor.getState().empty).toBe(true);
  });

  it('tracks canUndo/canRedo in state', () => {
    const editor = createAIComposer();
    expect(editor.getState().canUndo).toBe(false);
    editor.setValue('x');
    expect(editor.getState().canUndo).toBe(true);
    expect(editor.getState().canRedo).toBe(false);
    editor.undo();
    expect(editor.getState().canUndo).toBe(false);
    expect(editor.getState().canRedo).toBe(true);
  });

  it('setValue can skip history', () => {
    const editor = createAIComposer({ value: 'keep' });
    editor.setValue('staged', { label: 'stage' });
    editor.setValue('external', { history: false });
    // the history-less setValue left no step, so undo returns to before 'staged'
    editor.undo();
    expect(editor.serialize('text')).toBe('keep');
  });
});

describe('AIComposer — disabled / readonly / destroy', () => {
  it('disabled blocks editing commands', async () => {
    const editor = createAIComposer({ value: 'x', disabled: true });
    expect(editor.canExecuteCommand('submit')).toBe(false);
    editor.setDisabled(false);
    expect(editor.canExecuteCommand('submit')).toBe(true);
  });

  it('readonly blocks submit but allows programmatic reads', async () => {
    const editor = createAIComposer({ value: 'x', readonly: true });
    await editor.submit();
    expect(editor.serialize('text')).toBe('x');
  });

  it('destroyed editors throw on mutation', () => {
    const editor = createAIComposer();
    const onDestroy = vi.fn();
    editor.on('destroy', onDestroy);
    editor.destroy();
    expect(onDestroy).toHaveBeenCalled();
    expect(() => editor.insertText('nope')).toThrowError(ErrorCode.EDITOR_DESTROYED);
  });

  it('configure/setMode update state and emit modeChange', () => {
    const editor = createAIComposer();
    const onMode = vi.fn();
    editor.on('modeChange', onMode);
    editor.setMode('chat');
    expect(editor.getState().mode).toBe('chat');
    expect(onMode).toHaveBeenCalledWith({ mode: 'chat' });
    editor.configure({ placeholder: 'Ask anything' });
    expect(editor.getState().placeholder).toBe('Ask anything');
  });
});

describe('AIComposer — registries', () => {
  it('exposes built-in commands', () => {
    const editor = createAIComposer();
    for (const id of ['submit', 'clear', 'undo', 'redo', 'insertText', 'insertNode', 'focus']) {
      expect(editor.commands.has(id), id).toBe(true);
    }
  });

  it('serializes through registered serializers', () => {
    const editor = createAIComposer({ value: 'plain' });
    expect(editor.serialize('json')).toMatchObject({ nodes: [{ type: 'text', text: 'plain' }] });
    expect(editor.serialize('text')).toBe('plain');
    expect(() => editor.serialize('nope' as never)).toThrowError();
  });

  it('supports runtime plugin registration with cleanup', () => {
    const editor = createAIComposer();
    const cleanup = vi.fn();
    const plugin = {
      name: 'test-plugin',
      setup: vi.fn((ctx: { onCleanup: (fn: () => void) => void }) => ctx.onCleanup(cleanup)),
    };
    const off = editor.registerPlugin(plugin);
    expect(plugin.setup).toHaveBeenCalled();
    off();
    expect(cleanup).toHaveBeenCalled();
  });
});
