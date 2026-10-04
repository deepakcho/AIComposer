import { useState } from 'react';
import { PromptEditor } from '@ai-composer/react';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';
import { people } from './App';

/** Level 1 — zero configuration. */
export function Level1() {
  return <PromptEditor mode="chat" placeholder="Ask anything…" />;
}

/** Level 2 — configuration via options. */
export function Level2() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <>
      <PromptEditor
        mode="chat"
        placeholder="Ask anything…"
        options={{
          plugins: [
            mentionPlugin({ items: people }),
            commandPlugin({ commands: [{ id: 'summarize', label: 'Summarize' }] }),
          ],
          submit: { clearOnSubmit: true },
        }}
        onSubmit={(value) => setSubmitted(JSON.stringify(value, null, 2))}
      />
      {submitted && <pre className="output">{submitted}</pre>}
    </>
  );
}

/** Controlled usage — value lives in React state. */
export function ControlledDemo() {
  const [text, setText] = useState('Controlled value');
  return (
    <>
      <PromptEditor
        mode="compact"
        value={text}
        onChange={(value) => setText(JSON.stringify(value.nodes.map((n) => (n.type === 'text' ? n.text : n.type))))}
      />
      <p>
        Mirror: <code>{text}</code>
      </p>
    </>
  );
}
