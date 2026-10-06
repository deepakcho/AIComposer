import { describe, expect, it, vi } from 'vitest';
import { createAIComposer } from './factory';
import { createPosition, createSelection } from './model/selection';
import type { SuggestionItem } from './state/state';

const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace' },
  { id: 'u2', label: 'Alan Turing' },
  { id: 'u3', label: 'Grace Hopper' },
];

function editorWithMention() {
  const search = vi.fn(async (ctx: { query: string }) =>
    people.filter((p) => p.label.toLowerCase().includes(ctx.query.toLowerCase())),
  );
  const editor = createAIComposer({
    plugins: [
      {
        name: 'mention',
        triggers: [{ id: 'mention', character: '@', type: 'mention', search }],
      },
    ],
  });
  return { editor, search };
}

function type(editor: ReturnType<typeof createAIComposer>, text: string): void {
  const current = editor.serialize('text') as string;
  editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: current + text }] });
  editor.setSelection(createSelection(createPosition(0, (current + text).length)));
}

describe('trigger engine', () => {
  it('opens a trigger session when @ is typed and yields suggestions', async () => {
    const { editor } = editorWithMention();
    const onOpen = vi.fn();
    const onSuggestions = vi.fn();
    editor.on('triggerOpen', onOpen);
    editor.on('suggestionsChange', onSuggestions);

    type(editor, 'Hey @ad');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBeGreaterThan(0));

    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ triggerId: 'mention', query: 'ad' }));
    const state = editor.getState();
    expect(state.activeTrigger?.query).toBe('ad');
    expect(state.suggestions.map((s) => s.label)).toEqual(['Ada Lovelace']);
    expect(state.activeSuggestionIndex).toBe(0);
    expect(onSuggestions).toHaveBeenCalled();
  });

  it('does not open the trigger mid-word', async () => {
    const { editor } = editorWithMention();
    type(editor, 'user@example');
    await Promise.resolve();
    expect(editor.getState().activeTrigger).toBeNull();
  });

  it('closes when a space breaks the query', async () => {
    const { editor } = editorWithMention();
    const onClose = vi.fn();
    editor.on('triggerClose', onClose);

    type(editor, '@jo');
    await vi.waitFor(() => expect(editor.getState().activeTrigger).not.toBeNull());
    type(editor, 'hn smith');
    expect(editor.getState().activeTrigger).toBeNull();
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ reason: 'input' }));
  });

  it('accepting a suggestion replaces the trigger run with a node', async () => {
    const { editor } = editorWithMention();
    type(editor, 'Ping @gr');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));

    await editor.acceptSuggestion();

    expect(editor.serialize('text')).toBe('Ping @Grace Hopper ');
    expect(editor.getState().activeTrigger).toBeNull();
    expect(editor.getValue().nodes.some((n) => n.type === 'mention')).toBe(true);
    // caret sits after the inserted chip + trailing space
    expect(editor.serialize('text')).toContain('Ping @Grace Hopper ');
  });

  it('moves the highlighted suggestion', async () => {
    const editor = createAIComposer({
      plugins: [
        {
          name: 'mention',
          triggers: [
            { id: 'mention', character: '@', search: () => people },
          ],
        },
      ],
    });
    type(editor, '@');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(3));

    editor.moveSuggestionSelection(1);
    expect(editor.getState().activeSuggestionIndex).toBe(1);
    editor.moveSuggestionSelection(1);
    expect(editor.getState().activeSuggestionIndex).toBe(2);
    editor.moveSuggestionSelection(1);
    expect(editor.getState().activeSuggestionIndex).toBe(0); // wraps

    await editor.acceptSuggestion();
    expect(editor.serialize('text')).toBe('@Ada Lovelace ');
  });

  it('openTrigger inserts the character programmatically', async () => {
    const { editor } = editorWithMention();
    editor.setValue('hello ');
    editor.openTrigger('mention');
    await vi.waitFor(() => expect(editor.getState().activeTrigger?.query).toBe(''));
    expect(editor.serialize('text')).toBe('hello @');
  });

  it('custom select handlers control the inserted nodes', async () => {
    const select = vi.fn();
    const editor = createAIComposer({
      plugins: [
        {
          name: 'mention',
          triggers: [
            { id: 'mention', character: '@', search: () => people, select },
          ],
        },
      ],
    });
    type(editor, '@a');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBeGreaterThan(0));
    await editor.acceptSuggestion();
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1' }),
      expect.objectContaining({ query: 'a' }),
    );
  });
});
