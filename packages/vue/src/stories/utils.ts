/** Shared fixtures for Vue stories. */

import {
  createPromptEditor,
  type PromptEditor,
  type PromptEditorOptions,
  type SuggestionItem,
} from '@ai-composer/core';

export const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering · Platform' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering · Compiler' },
  { id: 'u3', label: 'Alan Turing', description: 'Research' },
];

export const slashCommands = [
  { id: 'summarize', label: 'Summarize', description: 'Summarize the conversation' },
  { id: 'translate', label: 'Translate', description: 'Translate the prompt' },
  { id: 'explain', label: 'Explain', description: 'Explain the selected code' },
  { id: 'reset', label: 'Reset draft', description: 'Clear the composer' },
];

export function createDemoEditor(options: PromptEditorOptions = {}): PromptEditor {
  return createPromptEditor({
    placeholder: options.placeholder ?? 'Ask anything… try @mentions and /commands',
    ...options,
    plugins: [
      {
        name: 'mention',
        triggers: [{ id: 'mention', character: '@', type: 'mention', search: () => people }],
      },
      {
        name: 'command',
        triggers: [{ id: 'command', character: '/', type: 'command', search: () => slashCommands }],
      },
      ...(options.plugins ?? []),
    ],
  });
}
