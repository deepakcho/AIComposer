import { describe, expect, it, vi } from 'vitest';
import { createPromptEditor, createPosition, createSelection } from '@ai-composer/core';
import { mentionPlugin } from './index';

const items = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Alan Turing' },
  { id: 'u3', label: 'Grace Hopper' },
];

function type(editor: ReturnType<typeof createPromptEditor>, text: string): void {
  const current = editor.serialize('text') as string;
  editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: current + text }] });
  editor.setSelection(createSelection(createPosition(0, (current + text).length)));
}

describe('mentionPlugin', () => {
  it('registers the mention trigger', () => {
    const editor = createPromptEditor({ plugins: [mentionPlugin({ items })] });
    expect(editor.triggers.get('mention')).toBeDefined();
    expect(editor.triggers.get('mention')?.character).toBe('@');
  });

  it('filters the static pool and inserts a mention node on accept', async () => {
    const editor = createPromptEditor({ plugins: [mentionPlugin({ items })] });
    type(editor, 'cc @tu');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));

    await editor.acceptSuggestion();
    expect(editor.serialize('text')).toBe('cc @Alan Turing ');
    const mention = editor.getValue().nodes.find((n) => n.type === 'mention');
    expect(mention).toMatchObject({ id: 'u2', label: 'Alan Turing' });
  });

  it('supports async search providers', async () => {
    const search = vi.fn(async (ctx: { query: string }) =>
      items.filter((item) => item.label.toLowerCase().startsWith(ctx.query.toLowerCase())),
    );
    const editor = createPromptEditor({ plugins: [mentionPlugin({ search })] });

    type(editor, '@gr');
    await vi.waitFor(() => expect(editor.getState().suggestions.map((s) => s.id)).toEqual(['u3']));
    expect(search).toHaveBeenCalled();
  });

  it('honors a custom trigger character', async () => {
    const editor = createPromptEditor({
      plugins: [mentionPlugin({ items, trigger: '#', id: 'hashtag' })],
    });
    type(editor, '#ad');
    await vi.waitFor(() => expect(editor.getState().activeTrigger?.triggerId).toBe('hashtag'));
  });
});
