/** Shared fixtures for docs demos — the same data the Storybook stories use. */

import {
  createAIComposer,
  type AIComposer,
  type AIComposerOptions,
  type SuggestionItem,
} from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

export const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering · Platform' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering · Compiler' },
  { id: 'u3', label: 'Alan Turing', description: 'Research' },
  { id: 'u4', label: 'Margaret Hamilton', description: 'Engineering · Apollo' },
];

export const slashCommands = [
  { id: 'summarize', label: 'Summarize', description: 'Summarize the conversation' },
  { id: 'translate', label: 'Translate', description: 'Translate the draft' },
  { id: 'explain', label: 'Explain', description: 'Explain the selected code' },
  { id: 'reset', label: 'Reset draft', description: 'Clear the composer' },
];

/** Editor with the mention + command plugins installed. */
export function createDemoEditor(options: AIComposerOptions = {}): AIComposer {
  return createAIComposer({
    placeholder: options.placeholder ?? 'Ask anything… try @mentions and /commands',
    ...options,
    plugins: [
      mentionPlugin({ items: people }),
      commandPlugin({ commands: slashCommands }),
      ...(options.plugins ?? []),
    ],
  });
}
