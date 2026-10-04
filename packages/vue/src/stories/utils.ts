/** Shared fixtures for Vue stories. */

import { createPromptEditor, type PromptEditor, type SuggestionItem } from '@ai-composer/core';

export const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering · Platform' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering · Compiler' },
  { id: 'u3', label: 'Alan Turing', description: 'Research' },
];

export function createDemoEditor(): PromptEditor {
  return createPromptEditor({
    mode: 'chat',
    placeholder: 'Ask anything… try @mentions',
    plugins: [
      {
        name: 'mention',
        triggers: [{ id: 'mention', character: '@', type: 'mention', search: () => people }],
      },
    ],
  });
}
