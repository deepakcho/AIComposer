import { useRef, useState } from 'react';
import { createAttachmentNode } from '@ai-composer/core';
import {
  AIComposer,
  AIComposerAttachments,
  AIComposerBody,
  AIComposerHeader,
  AIComposerInput,
  AIComposerToolbar,
  SendIcon,
  useAIComposerState,
} from '@ai-composer/react';
import { createDemoEditor } from '../demos/fixtures';

export function Hero(): JSX.Element {
  const [editor] = useState(() => createDemoEditor({ placeholder: 'Ask anything… try @ or /' }));
  const state = useAIComposerState(editor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFile = (file: File | undefined): void => {
    if (!file) return;
    editor.insertNode(
      createAttachmentNode({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      }),
    );
  };

  return (
    <section className="hero" id="overview">
      <span className="badge">
        <span className="dot" /> v0.1 · MIT · one engine, every framework
      </span>
      <h1>AI Composer</h1>
      <p className="hero-promise">Ship the AI Composer. Skip the plumbing.</p>
      <p className="tagline">
        A framework-agnostic, pluggable AI input component for building rich AI experiences.
      </p>
      <div className="hero-actions">
        <a className="btn-primary" href="#installation">
          Get started
        </a>
        <a className="btn-secondary" href="#demos">
          Explore live demos <span aria-hidden>↓</span>
        </a>
        <a
          className="btn-secondary"
          href="https://github.com/deepakcho/AIComposer"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
        <a
          className="btn-secondary"
          href="https://www.npmjs.com/org/ai-composer"
          target="_blank"
          rel="noopener noreferrer"
        >
          Browse npm packages
        </a>
      </div>
      <div className="hero-stats" aria-label="Package highlights">
        <div className="hero-stat">
          <strong>4</strong>
          <span>framework adapters</span>
        </div>
        <div className="hero-stat">
          <strong>68.6 kB</strong>
          <span>core package · packed</span>
        </div>
        <div className="hero-stat">
          <strong>0</strong>
          <span>core runtime dependencies</span>
        </div>
      </div>
      <div className="hero-demo">
        <div className="hero-demo-caption">
          <span className="hero-demo-caption-dot" aria-hidden />
          Try it now <span>— mention someone or attach a file</span>
        </div>
        <div className="hero-demo-inner">
          <AIComposer
            editor={editor}
            mode="chat"
            className="hero-composer"
            aria-label="Support reply composer"
          >
            <AIComposerHeader>
              <div className="hero-composer-context">
                <span className="hero-composer-live" />
                <span className="hero-composer-context-label">Support reply</span>
                <span className="hero-composer-ticket">Ticket #4182</span>
              </div>
            </AIComposerHeader>
            <AIComposerBody>
              <AIComposerAttachments />
              <AIComposerInput />
            </AIComposerBody>
            <AIComposerToolbar>
              <div className="hero-composer-toolbar">
                <div className="hero-composer-tools">
                  <button type="button" onClick={() => fileInputRef.current?.click()}>
                    Add file
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.openTrigger('mention')}
                  >
                    @ Mention
                  </button>
                </div>
                <span className="hero-composer-shortcut">
                  <kbd>Enter</kbd> to send
                </span>
                <button
                  type="button"
                  className="aic-toolbar-submit"
                  data-aic-action="submit"
                  aria-label="Send reply"
                  title="Send reply"
                  disabled={
                    state.disabled ||
                    state.readonly ||
                    state.submitting ||
                    (state.empty && state.attachments.length === 0)
                  }
                  onClick={() => void editor.executeCommand('submit')}
                >
                  <SendIcon />
                </button>
              </div>
            </AIComposerToolbar>
          </AIComposer>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            aria-label="Choose a file to attach"
            onChange={(event) => {
              addFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
        </div>
      </div>
    </section>
  );
}
