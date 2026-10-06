/**
 * Real scenarios — a complete product surface powered by the composer.
 * The chat demo below is a full conversation UI: message list, simulated
 * assistant replies, attachments and a live AI Composer at the bottom.
 */

import { useEffect, useRef, useState } from 'react';
import type { AIComposerDocument } from '@ai-composer/core';
import {
  AIComposerAttachments,
  AIComposer,
  AIComposerInput,
  AIComposerToolbar,
} from '@ai-composer/react';
import { Example } from '../components/Example';
import { ArrowUpIcon, ChevronDownIcon, PaperclipIcon, SparklesIcon } from '../components/icons';
import { createDemoEditor } from '../demos/fixtures';
import '../styles/scenarios.css';

interface ChatMessage {
  id: number;
  role: 'user' | 'agent';
  text: string;
  chips: string[];
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: 'agent',
    text: 'Hi Deepak — I can see ticket #4182 (refund not received). How can I help today?',
    chips: [],
    time: '09:41',
  },
  {
    id: 2,
    role: 'user',
    text: 'The customer says the refund never landed. Can you check the payment log?',
    chips: [],
    time: '09:42',
  },
];

function now(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Render a submitted document as message text + readable chip labels. */
function readDocument(document: AIComposerDocument): { text: string; chips: string[] } {
  let text = '';
  const chips: string[] = [];
  for (const node of document.nodes) {
    if (node.type === 'text') text += node.text;
    else if (node.type === 'attachment') {
      text += `[${node.name}] `;
      chips.push(node.name);
    } else if (node.type === 'mention' || node.type === 'command') {
      text += node.label;
      chips.push(node.label);
    }
  }
  return { text: text.trim(), chips };
}

function agentReply(draft: string): string {
  const mentioned = draft.match(/@([\w-]+)/);
  if (mentioned) {
    return `Looping in ${mentioned[1]} — they own the payment pipeline. I've attached the last transaction log to the ticket. Anything else while we wait?`;
  }
  if (draft.toLowerCase().includes('refund')) {
    return 'Checked the payment log: the refund was issued on Oct 2 but returned by the bank (IBAN mismatch). I suggest re-sending with the corrected IBAN — want me to draft that note?';
  }
  if (draft.toLowerCase().includes('log')) {
    return "Pulled the last 50 payment events. One entry flags `returned_by_bank` for #4182 — that looks like our culprit. Want the CSV attached to the ticket?";
  }
  return 'Got it — noted on the ticket. I\'ll summarize the thread and ping the on-call engineer if the customer replies again.';
}

export function Scenarios(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [thinking, setThinking] = useState(false);

  const handleDocument = (document: AIComposerDocument): void => {
    const { text, chips } = readDocument(document);
    if (!text && chips.length === 0) return;
    setMessages((previous) => [
      ...previous,
      { id: Date.now(), role: 'user', text, chips, time: now() },
    ]);
    setThinking(true);
    window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'agent', text: agentReply(text), chips: [], time: now() },
      ]);
      setThinking(false);
    }, 1100);
  };

  return (
    <section className="section" id="scenarios">
      <h2>
        Real scenarios{' '}
        <a className="section-anchor" href="#scenarios" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        The composer embedded in a complete product surface — the engine handles input, chips and
        submit; the app owns the conversation UI around it.
      </p>

      <Example
        title="Support chat · conversation with the composer"
        id="scenario-chat"
        description="A working chat: submit adds your message (chips and attachments render inline), the agent thinks, then replies. Try @mentions, /commands or attach a file."
        plain
        code={`const [messages, setMessages] = useState(INITIAL_MESSAGES);
const [thinking, setThinking] = useState(false);

const editor = createAIComposer({
  mode: 'chat',
  placeholder: 'Reply to the customer… try @ada or /summarize',
  submit: {
    clearOnSubmit: true,
    onSubmit: async (doc) => {
      const { text, chips } = readDocument(doc);   // chips → inline labels
      setMessages((prev) => [...prev, userMessage(text, chips)]);
      setThinking(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, agentMessage(agentReply(text))]);
        setThinking(false);
      }, 1100);
    },
  },
  plugins: [mentionPlugin({ items: people }), commandPlugin({ commands })],
});

<div className="scn-chat">
  <header>…Support Agent · online · SLA 4h…</header>

  <div className="scn-messages">
    <span className="scn-day">Today</span>
    {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
    {thinking && <TypingIndicator />}
  </div>

  <div className="scn-composer">
    <AIComposer editor={editor}>
      <AIComposerAttachments />
      <AIComposerInput />
      <AIComposerToolbar>
        <button aria-label="Attach file"><PaperclipIcon /></button>
        <button className="tpl-model"><SparklesIcon /> Sonnet <ChevronDownIcon /></button>
        <button aria-label="Send" onClick={() => editor.submit()}><ArrowUpIcon /></button>
      </AIComposerToolbar>
    </AIComposer>
    <Footnote enter="send" shiftEnter="newline" />
  </div>
</div>`}
      >
        <ChatScenario messages={messages} thinking={thinking} onDocument={handleDocument} />
      </Example>
    </section>
  );
}

function ChatScenario({
  messages,
  thinking,
  onDocument,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  onDocument: (document: AIComposerDocument) => void;
}): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({
      placeholder: 'Reply to the customer… try @ada or /summarize',
      submit: { clearOnSubmit: true },
    }),
  );
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return editor.on('submit', (event) => onDocument(event.value));
  }, [editor, onDocument]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, thinking]);

  return (
    <div className="scn-chat">
      <header className="scn-chat-header">
        <span className="scn-chat-avatar">
          SA<span className="scn-status" />
        </span>
        <span className="scn-chat-title">
          <strong>Support Agent</strong>
          <span>online · avg. reply 2 min</span>
        </span>
        <span className="scn-chat-meta">
          <span className="tpl-tag">#4182</span>
          <span className="tpl-tag tpl-tag-accent">SLA 4h</span>
        </span>
      </header>

      <div className="scn-messages" ref={listRef}>
        <span className="scn-day">Today</span>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {thinking ? (
          <div className="scn-msg scn-msg-agent">
            <span className="scn-typing" aria-label="Agent is typing">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}
      </div>

      <div className="scn-composer">
        <AIComposer editor={editor}>
          <AIComposerAttachments />
          <AIComposerInput />
          <AIComposerToolbar>
            <button type="button" className="tpl-icon-btn" aria-label="Attach file">
              <PaperclipIcon />
            </button>
            <button type="button" className="tpl-model" aria-label="Select model">
              <SparklesIcon /> Sonnet <ChevronDownIcon />
            </button>
            <button
              type="button"
              className="tpl-icon-btn"
              aria-label="Send message"
              onClick={() => void editor.submit()}
            >
              <ArrowUpIcon />
            </button>
          </AIComposerToolbar>
        </AIComposer>
        <div className="scn-composer-footnote">
          <kbd>↵</kbd> send
          <kbd>⇧↵</kbd> newline
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }): JSX.Element {
  return (
    <div className={`scn-msg scn-msg-${message.role}`}>
      <div className="scn-bubble">
        {message.chips.map((chip) => (
          <span className="scn-chip" key={chip}>
            {chip}
          </span>
        ))}
        {message.chips.length > 0 ? ' ' : ''}
        {message.text}
      </div>
      <span className="scn-msg-time">{message.time}</span>
    </div>
  );
}
