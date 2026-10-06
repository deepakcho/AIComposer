/**
 * Templates — complete, app-owned layouts built from slot components.
 * Each story is a different product surface: the engine is identical, the
 * DOM around it belongs to the application (Level 3 usage).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createAttachmentNode } from '@ai-composer/core';
import {
  AIComposerAttachments,
  AIComposer,
  AIComposerInput,
  AIComposerToolbar,
  useAIComposerState,
} from '../index';
import { createDemoEditor } from './utils';
import './templates.css';

const meta: Meta<typeof AIComposer> = {
  component: AIComposer,
  tags: ['autodocs'],
  title: 'AI Composer/React/Templates',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ready-to-copy layouts for common product surfaces — chat composer, search bar, ticket reply, inline comment. All are Level 3 compositions: `AIComposer` + slot components + your own DOM.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AIComposer>;

export const ChatComposer: Story = {
  name: 'Chat composer',
  render: () => <ChatComposerDemo />,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer editor={editor}>
  <div className="tpl-chat-header">
    <span className="tpl-tag tpl-tag-accent">Claude 4.5</span>
    <span className="tpl-tag">3 files</span>
  </div>
  <AIComposerAttachments />
  <AIComposerInput />
  <AIComposerToolbar>
    <button className="tpl-icon-btn" aria-label="Attach">＋</button>
    <button className="tpl-model">Sonnet ▾</button>
    <button className="tpl-icon-btn" aria-label="Send" onClick={() => editor.submit()}>↑</button>
  </AIComposerToolbar>
</AIComposer>`,
      },
      description: {
        story:
          'Assistant-style composer: context chips above, attachments, custom toolbar with attach + model picker + circular send.',
      },
    },
  },
};

export const SearchCommandBar: Story = {
  name: 'Search · command bar',
  render: () => <SearchBarDemo />,
  parameters: {
    docs: {
      source: {
        code: `<div className="tpl-hero">
  <h3>How can we help?</h3>
  <div className="tpl-hero-bar">
    <AIComposer editor={editor} mode="compact" placeholder="Search docs, people, tickets…" />
  </div>
  <span className="tpl-kbd"><kbd>⌘</kbd><kbd>K</kbd> to focus</span>
</div>`,
      },
      description: {
        story:
          'Compact mode as a help-center search. The pill keeps one line; multiline content morphs it into a box (type a long query with Enter).',
      },
    },
  },
};

export const TicketReply: Story = {
  name: 'Support · ticket reply',
  render: () => <TicketReplyDemo />,
  parameters: {
    docs: {
      source: {
        code: `<div className="tpl-ticket">
  <div className="tpl-ticket-meta">
    <strong>#4182</strong> Refund not received
    <span>· owed to <span className="tpl-tag">@ada</span></span>
  </div>

  <AIComposer editor={editor} mode="chat">
    <AIComposerInput />
  </AIComposer>

  <div className="tpl-ticket-footer">
    <select className="tpl-select" aria-label="Reply as">
      <option>Support team</option><option>Personal</option>
    </select>
    <span>{count} / 2000</span>
    <button className="tpl-btn-primary" disabled={state.empty}>Reply</button>
  </div>
</div>`,
      },
      description: {
        story:
          'The editor embedded in a larger card — the app renders meta rows and the submit row, `useAIComposerState` drives the char count and button state.',
      },
    },
  },
};

export const InlineComment: Story = {
  name: 'Comment · inline',
  render: () => <InlineCommentDemo />,
  parameters: {
    docs: {
      source: {
        code: `<div className="tpl-comment">
  <span className="tpl-avatar">DC</span>
  <div style={{ flex: 1 }}>
    <AIComposer editor={editor} mode="chat" placeholder="Leave a comment…" />
    <div className="tpl-comment-actions">
      <button className="tpl-btn-ghost">Cancel</button>
      <button className="tpl-btn-primary" disabled={state.empty}>Comment</button>
    </div>
  </div>
</div>`,
      },
      description: {
        story:
          'Review-thread comment box: avatar, auto-growing input, explicit action row. The send button lives outside the editor entirely.',
      },
    },
  },
};

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
          ＋
        </button>
        <button type="button" className="tpl-model" aria-label="Select model">
          Sonnet <span aria-hidden>▾</span>
        </button>
        <button
          type="button"
          className="tpl-icon-btn"
          aria-label="Send message"
          onClick={() => void editor.submit()}
        >
          ↑
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
