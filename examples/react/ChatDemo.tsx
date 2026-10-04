/**
 * React — chat composer with mentions (Level 1 & 2 combined).
 * Run it: apps/playground-react has live versions of every level.
 */

import { PromptEditor } from '@ai-composer/react';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

// Level 1 — zero configuration:
//   <PromptEditor mode="chat" />

// Level 2 — configured:
export function ChatDemo(): JSX.Element {
  return (
    <PromptEditor
      mode="chat"
      placeholder="Ask anything…"
      options={{
        plugins: [
          mentionPlugin({
            items: [
              { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
              { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
            ],
          }),
          commandPlugin({
            commands: [
              { id: 'summarize', label: 'Summarize', description: 'Summarize the thread' },
              { id: 'reset', label: 'Reset draft', run: (editor) => editor.clear() },
            ],
          }),
        ],
        submit: {
          clearOnSubmit: true,
          onSubmit: async (value) => {
            await fetch('/api/chat', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ prompt: value }), // or editor.serialize('ai')
            });
          },
        },
      }}
      onSubmit={(value) => console.log('submitted', value.nodes.length)}
    />
  );
}
