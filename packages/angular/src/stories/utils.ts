/** Shared fixtures for Angular stories. */

import { createPromptEditor, type PromptEditor, type PromptEditorOptions } from '@ai-composer/core';

export function demoEditor(options: PromptEditorOptions = {}): PromptEditor {
  return createPromptEditor({
    placeholder: options.placeholder ?? 'Ask anything… try @mentions and /commands',
    ...options,
    plugins: [
      {
        name: 'mention',
        triggers: [
          {
            id: 'mention',
            character: '@',
            type: 'mention',
            search: () => [
              { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
              { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
              { id: 'u3', label: 'Alan Turing', description: 'Research' },
            ],
          },
        ],
      },
      {
        name: 'command',
        triggers: [
          {
            id: 'command',
            character: '/',
            type: 'command',
            search: () => [
              { id: 'summarize', label: 'Summarize', description: 'Summarize the conversation' },
              { id: 'translate', label: 'Translate', description: 'Translate the prompt' },
            ],
          },
        ],
      },
      ...(options.plugins ?? []),
    ],
  });
}
