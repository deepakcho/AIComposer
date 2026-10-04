import { describe, expect, it, vi } from 'vitest';
import { createPromptEditor, createPosition, createSelection } from '@ai-composer/core';
import { commandPlugin } from './index';

function type(editor: ReturnType<typeof createPromptEditor>, text: string): void {
  const current = editor.serialize('text') as string;
  editor.applyViewUpdate({ nodes: [{ type: 'text', key: 't', text: current + text }] });
  editor.setSelection(createSelection(createPosition(0, (current + text).length)));
}

describe('commandPlugin', () => {
  it('inserts a command node for commands without run()', async () => {
    const editor = createPromptEditor({
      plugins: [
        commandPlugin({
          commands: [
            { id: 'summarize', label: 'Summarize', description: 'Summarize the thread' },
          ],
        }),
      ],
    });

    type(editor, '/sum');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));
    await editor.acceptSuggestion();

    expect(editor.serialize('text')).toBe('/Summarize ');
    expect(editor.getValue().nodes).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'command', id: 'summarize' })]),
    );
  });

  it('executes run() immediately and removes the trigger run', async () => {
    const run = vi.fn();
    const editor = createPromptEditor({
      plugins: [
        commandPlugin({
          commands: [{ id: 'clear', label: 'Clear all', run }],
        }),
      ],
    });

    type(editor, 'keep /cl');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));
    await editor.acceptSuggestion();

    expect(run).toHaveBeenCalledTimes(1);
    expect(editor.serialize('text')).toBe('keep ');
  });

  it('matches on id as well as label', async () => {
    const editor = createPromptEditor({
      plugins: [
        commandPlugin({
          commands: [{ id: 'translate', label: 'Translate to French' }],
        }),
      ],
    });
    type(editor, '/trans');
    await vi.waitFor(() => expect(editor.getState().suggestions.length).toBe(1));
  });
});
