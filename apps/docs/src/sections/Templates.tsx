/**
 * Custom templates — complete app-owned layouts built from slot components.
 * The engine is identical in every template; only the surrounding DOM
 * changes. These mirror the Storybook "Templates" stories.
 */

import { useState } from 'react';
import { createAttachmentNode } from '@ai-composer/core';
import {
  AIComposerAttachments,
  AIComposer,
  AIComposerInput,
  AIComposerToolbar,
  useAIComposerState,
} from '@ai-composer/react';
import { Example } from '../components/Example';
import {
  ArrowUpIcon,
  ChevronDownIcon,
  PaperclipIcon,
  SparklesIcon,
} from '../components/icons';
import { createDemoEditor } from '../demos/fixtures';

export function Templates(): JSX.Element {
  return (
    <section className="section" id="templates">
      <h2>
        Custom templates{' '}
        <a className="section-anchor" href="#templates" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        Level 3 in practice: real product surfaces assembled from slot components. Copy any of
        these as a starting point — the app owns every element outside the editable surface.
      </p>

      <Example
        title="Chat composer"
        id="template-chat"
        description="Assistant-style composer: context chips above, attachments row, custom toolbar with attach + model picker + circular send."
        code={`<AIComposer editor={editor}>
  <div className="tpl-chat-header">
    <span className="tpl-tag tpl-tag-accent">✦ Claude 4.5</span>
    <span className="tpl-tag">2 files attached</span>
  </div>
  <AIComposerAttachments />
  <AIComposerInput />
  <AIComposerToolbar>
    <button className="tpl-icon-btn" aria-label="Attach files"><PaperclipIcon /></button>
    <button className="tpl-model"><SparklesIcon /> Sonnet <ChevronDownIcon /></button>
    <button className="tpl-icon-btn" aria-label="Send" onClick={() => editor.submit()}>
      <ArrowUpIcon />
    </button>
  </AIComposerToolbar>
</AIComposer>`}
      >
        <ChatComposerDemo />
      </Example>

      <Example
        title="Search · command bar"
        id="template-search"
        description="Compact mode as a help-center search. The pill stays single-line; wrapped content morphs it into a box (type a long query)."
        code={`<div className="tpl-hero">
  <h3>How can we help?</h3>
  <div className="tpl-hero-bar">
    <AIComposer editor={editor} mode="compact" />
  </div>
  <span className="tpl-kbd"><kbd>⌘</kbd><kbd>K</kbd> to focus</span>
</div>`}
      >
        <SearchBarDemo />
      </Example>

      <Example
        title="Support · ticket reply"
        id="template-ticket"
        description="The editor embedded in a larger card — app-rendered meta and submit rows; useAIComposerState drives the counter and button state."
        code={`const state = useAIComposerState(editor);

<div className="tpl-ticket">
  <div className="tpl-ticket-meta">
    <strong>#4182</strong> Refund not received · SLA 4h
  </div>

  <AIComposer editor={editor} mode="chat">
    <AIComposerInput />
  </AIComposer>

  <div className="tpl-ticket-footer">
    <select className="tpl-select" aria-label="Reply as">
      <option>Support team</option>
    </select>
    <span>{count} / 2000</span>
    <button className="tpl-btn-primary" disabled={state.empty}>Reply</button>
  </div>
</div>`}
      >
        <TicketReplyDemo />
      </Example>

      <Example
        title="Comment · inline"
        id="template-comment"
        description="Review-thread comment box: avatar, auto-growing input, and an action row that lives entirely outside the editor."
        code={`<div className="tpl-comment">
  <span className="tpl-avatar">DC</span>
  <div style={{ flex: 1 }}>
    <AIComposer editor={editor} mode="chat" placeholder="Leave a comment…" />
    <div className="tpl-comment-actions">
      <button className="tpl-btn-ghost">Cancel</button>
      <button className="tpl-btn-primary" disabled={state.empty}>Comment</button>
    </div>
  </div>
</div>`}
      >
        <InlineCommentDemo />
      </Example>
    </section>
  );
}

/* --------------------------------------------------------------- demos */

function ChatComposerDemo(): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({
      placeholder: 'Reply to Claude… try @mentions and /commands',
      value: {
        nodes: [
          createAttachmentNode({ id: 'a1', name: 'spec-diff.png', mimeType: 'image/png' }),
          createAttachmentNode({ id: 'a2', name: 'notes.md', mimeType: 'text/markdown' }),
        ],
      },
    }),
  );
  return (
    <AIComposer editor={editor}>
      <div className="tpl-chat-header">
        <span className="tpl-tag tpl-tag-accent">✦ Claude 4.5</span>
        <span className="tpl-tag">2 files attached</span>
      </div>
      <AIComposerAttachments />
      <AIComposerInput />
      <AIComposerToolbar>
        <button type="button" className="tpl-icon-btn" aria-label="Attach files">
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
  );
}

function SearchBarDemo(): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({ placeholder: 'Search docs, people, tickets…  try @ or /' }),
  );
  return (
    <div className="tpl-hero">
      <h3>How can we help?</h3>
      <div className="tpl-hero-bar">
        <AIComposer editor={editor} mode="compact" />
      </div>
      <span className="tpl-kbd">
        <kbd>⌘</kbd>
        <kbd>K</kbd> to focus
      </span>
    </div>
  );
}

function TicketReplyDemo(): JSX.Element {
  const [editor] = useState(() =>
    createDemoEditor({ placeholder: 'Write a reply… mention teammates with @' }),
  );
  const state = useAIComposerState(editor);
  const count = state.value.nodes.reduce(
    (sum, node) => sum + (node.type === 'text' ? node.text.length : 8),
    0,
  );
  return (
    <div className="tpl-ticket">
      <div className="tpl-ticket-meta">
        <strong>#4182</strong> Refund not received
        <span>
          · assigned to <span className="tpl-tag">Ada</span> · SLA 4h
        </span>
      </div>

      <AIComposer editor={editor} mode="chat">
        <AIComposerInput />
      </AIComposer>

      <div className="tpl-ticket-footer">
        <select className="tpl-select" aria-label="Reply as">
          <option>Support team</option>
          <option>Personal (you@company.com)</option>
        </select>
        <span>{count} / 2000</span>
        <button
          type="button"
          className="tpl-btn-primary"
          disabled={state.empty}
          onClick={() => void editor.submit()}
        >
          Reply
        </button>
      </div>
    </div>
  );
}

function InlineCommentDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Leave a comment…' }));
  const state = useAIComposerState(editor);
  return (
    <div className="tpl-comment">
      <span className="tpl-avatar" aria-hidden>
        DC
      </span>
      <div style={{ flex: 1 }}>
        <AIComposer editor={editor} mode="chat" />
        <div className="tpl-comment-actions">
          <button type="button" className="tpl-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            className="tpl-btn-primary"
            disabled={state.empty}
            onClick={() => void editor.submit()}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}
