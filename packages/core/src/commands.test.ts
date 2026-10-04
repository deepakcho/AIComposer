import { describe, expect, it, vi } from 'vitest';
import { createPromptEditor } from './factory';
import { createMentionNode, createTextNode } from './model/nodes';
import { BUILTIN_COMMANDS } from './commands/builtins';

describe('command system', () => {
  it('executes built-in commands by id', async () => {
    const editor = createPromptEditor({ value: 'hello' });
    await editor.executeCommand(BUILTIN_COMMANDS.clear);
    expect(editor.getState().empty).toBe(true);
    await editor.executeCommand(BUILTIN_COMMANDS.undo);
    expect(editor.serialize('text')).toBe('hello');
  });

  it('insertText/insertNode work through commands', async () => {
    const editor = createPromptEditor();
    await editor.executeCommand(BUILTIN_COMMANDS.insertText, { text: 'hi ' });
    await editor.executeCommand(BUILTIN_COMMANDS.insertNode, {
      node: createMentionNode({ id: 'u1', label: 'Ada' }),
    });
    expect(editor.serialize('text')).toBe('hi @Ada ');
  });

  it('throws for unknown commands', async () => {
    const editor = createPromptEditor();
    await expect(editor.executeCommand('nope')).rejects.toThrowError('nope');
  });

  it('canExecute gates execution', async () => {
    const editor = createPromptEditor({ value: 'x', disabled: true });
    await editor.executeCommand(BUILTIN_COMMANDS.clear); // no-op: disabled
    expect(editor.serialize('text')).toBe('x');
  });

  it('emits commandExecute', async () => {
    const editor = createPromptEditor();
    const onExecute = vi.fn();
    editor.on('commandExecute', onExecute);
    await editor.executeCommand(BUILTIN_COMMANDS.insertText, 'hello');
    expect(onExecute).toHaveBeenCalledWith({ id: 'insertText', payload: 'hello' });
    expect(editor.serialize('text')).toBe('hello');
  });

  it('plugins contribute custom commands', async () => {
    const editor = createPromptEditor({
      plugins: [
        {
          name: 'shout',
          commands: [
            {
              id: 'shout',
              execute: (ctx) => {
                const text = ctx.editor.serialize('text') as string;
                ctx.editor.setValue(text.toUpperCase());
              },
            },
          ],
        },
      ],
      value: 'make me loud',
    });
    await editor.executeCommand('shout');
    expect(editor.serialize('text')).toBe('MAKE ME LOUD');
  });

  it('openTrigger command validates the trigger id', async () => {
    const editor = createPromptEditor();
    await expect(editor.executeCommand(BUILTIN_COMMANDS.openTrigger, 'ghost')).rejects.toThrowError();
  });
});

describe('serialization', () => {
  const editor = createPromptEditor({
    value: [createTextNode('hello '), createMentionNode({ id: 'u1', label: 'Ada' }), createTextNode('!')],
  });

  it('json round-trips the document', () => {
    const json = editor.serialize('json') as ReturnType<typeof editor.getValue>;
    const restored = createPromptEditor({ value: json as never });
    expect(restored.serialize('text')).toBe('hello @Ada!');
  });

  it('text projects chips as readable text', () => {
    expect(editor.serialize('text')).toBe('hello @Ada!');
  });

  it('markdown renders mention links', () => {
    expect(editor.serialize('markdown')).toBe('hello [@Ada](mention:u1)!');
  });

  it('html escapes user content', () => {
    const unsafe = createPromptEditor({ value: '<script>alert(1)</script>' });
    const html = unsafe.serialize('html') as string;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('ai payload separates text and entities', () => {
    const payload = editor.serialize('ai') as {
      text: string;
      entities: Array<{ type: string; id?: string }>;
    };
    expect(payload.text).toBe('hello @Ada!');
    expect(payload.entities).toEqual([{ type: 'mention', key: expect.any(String), id: 'u1', label: 'Ada' }]);
  });

  it('custom serializers can be registered', () => {
    const custom = createPromptEditor({
      serializers: [
        {
          format: 'text',
          serialize: () => 'OVERRIDE',
        },
      ],
    });
    expect(custom.serialize('text')).toBe('OVERRIDE');
  });
});
