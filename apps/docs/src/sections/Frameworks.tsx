import { CodeBlock } from '../components/CodeBlock';
import { PropTable } from '../components/PropTable';

export function Frameworks(): JSX.Element {
  return (
    <section className="section" id="frameworks">
      <h2>
        Framework APIs{' '}
        <a className="section-anchor" href="#frameworks" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        Pick an adapter, keep the same document model. These examples cover setup, submit handling,
        provider handoff and teardown for each runtime. The <a href="#storybooks">Storybooks</a>{' '}
        show the components running live.
      </p>

      <nav className="framework-picker" aria-label="Framework guides">
        <a href="#framework-react">React</a>
        <a href="#framework-vue">Vue</a>
        <a href="#framework-angular">Angular</a>
        <a href="#framework-web-component">Web Component</a>
        <a href="#framework-vanilla">Vanilla JS</a>
      </nav>

      {/* ---------------------------------------------------------- React */}
      <h3 className="sub" id="framework-react">
        React 18+
      </h3>
      <p className="prose-p muted">
        Use <code>useAIComposer</code> when the app needs the editor instance, or pass
        <code> options</code> directly to <code>AIComposer</code> for the zero-config path. The
        engine owns submit policy; the component owns rendering.
      </p>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/react @ai-composer/themes @ai-composer/plugin-mention`}
      />
      <CodeBlock
        lang="tsx"
        code={`import { AIComposer, useAIComposer } from '@ai-composer/react';
import { type AIComposerPayload } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const people = [{ id: 'u1', label: 'Ada Lovelace' }];

export function SupportReply() {
  const editor = useAIComposer({
    mode: 'chat',
    placeholder: 'Reply to the customer…',
    plugins: [mentionPlugin({ items: people })],
    submit: {
      onSubmit: async (_document, currentEditor) => {
        const payload = currentEditor.serialize('ai') as AIComposerPayload;
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Assistant request failed');
      },
    },
  });

  return <AIComposer editor={editor} mode="chat" aria-label="Support reply" />;
}`}
      />
      <p className="prose-p muted">
        Keep provider credentials on your server. <code>serialize('ai')</code> sends plain text,
        typed entities and document metadata to your own endpoint; the package does not call an AI
        provider or retain conversation data.
      </p>

      {/* ------------------------------------------------------------ Vue */}
      <h3 className="sub" id="framework-vue">
        Vue 3
      </h3>
      <p className="prose-p muted">
        Composition-API components with <code>v-model</code> support and slot components mirroring
        the React adapter.
      </p>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/vue @ai-composer/themes`}
      />
      <CodeBlock
        lang="ts"
        code={`<script setup lang="ts">
import { ref } from 'vue';
import type { AIComposerDocument } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { AIComposer } from '@ai-composer/vue';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const people = [{ id: 'u1', label: 'Ada Lovelace' }];
const options = {
  mode: 'chat',
  placeholder: 'Reply to the customer…',
  plugins: [mentionPlugin({ items: people })],
};
const doc = ref<AIComposerDocument>({ nodes: [] });
function onSubmit(value: AIComposerDocument) {
  console.log('Submit document', value);
}
</script>

<template>
  <AIComposer v-model="doc" :options="options" @submit="onSubmit" />
</template>`}
      />
      <p className="prose-p muted">
        <code>v-model</code> receives an <code>AIComposerDocument</code> (or a string). Use the
        <code> editor</code> prop when you need imperative methods such as <code>focus()</code>,
        <code> serialize()</code> or <code>executeCommand()</code>.
      </p>
      <h4 className="sub">Props, events &amp; slots</h4>
      <PropTable
        columns={['API', 'Type', 'Description']}
        rows={[
          { name: 'v-model / modelValue', type: 'AIComposerDocument | string', description: 'Two-way document binding.' },
          { name: 'editor / options', type: 'AIComposer / AIComposerOptions', description: 'Bring your own editor, or let the adapter create one.' },
          { name: 'mode · placeholder · maxHeight', type: 'string / string / number|string', description: 'Same semantics as the React adapter.' },
          { name: 'disabled · readonly', type: 'boolean', description: 'State flags.' },
          { name: '@change · @submit', type: '(value) => void', description: 'Emitted on change and after submit.' },
          { name: 'slot components', type: 'AIComposerInput · AIComposerSuggestions · AIComposerAttachments · AIComposerToolbar · AIComposerHeader · AIComposerFooter', description: 'Compose custom layouts in the default slot.' },
          { name: 'hooks', type: 'useAIComposer · useAIComposerState · useAIComposerFromContext', description: 'Composition-API equivalents of the React hooks.' },
        ]}
      />

      {/* --------------------------------------------------------- Angular */}
      <h3 className="sub" id="framework-angular">
        Angular 19+
      </h3>
      <p className="prose-p muted">
        Standalone components with signals, <code>ControlValueAccessor</code> (works with reactive
        forms), and attribute directives for content projection.
      </p>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/angular @ai-composer/themes`}
      />
      <CodeBlock
        lang="ts"
        code={`import { Component } from '@angular/core';
import { AI_COMPOSER_IMPORTS } from '@ai-composer/angular';
import { createAIComposer, type AIComposerDocument } from '@ai-composer/core';

@Component({
  standalone: true,
  imports: [...AI_COMPOSER_IMPORTS],
  template: \`
    <aic-ai-composer [editor]="editor" mode="chat"
                       placeholder="Ask anything…"
                       (submitted)="onSubmit($event)">
      <div aic-toolbar>
        <aic-ai-composer-submit />
      </div>
    </aic-ai-composer>
  \`,
})
export class ChatComposerComponent {
  readonly editor = createAIComposer({ mode: 'chat' });
  onSubmit(value: AIComposerDocument) {
    console.log('Submit document', value);
  }
}`}
      />
      <p className="prose-p muted">
        Bind <code>[editor]</code> for imperative access, or use <code>[formControl]</code> with
        Angular reactive forms. <code>(valueChange)</code> emits document edits and
        <code> (submitted)</code> emits successful submits.
      </p>
      <h4 className="sub">Inputs, outputs &amp; directives</h4>
      <PropTable
        columns={['API', 'Type', 'Description']}
        rows={[
          { name: '<aic-ai-composer>', type: 'component', description: 'Root component; implements ControlValueAccessor for reactive forms.' },
          { name: '[editor] / [options]', type: 'AIComposer / AIComposerOptions', description: 'External editor or factory options.' },
          { name: '[mode] · [placeholder] · [maxHeight]', type: 'string', description: 'Same semantics as the React adapter.' },
          { name: '[disabled] / [readonly]', type: 'boolean', description: 'State flags (attribute coercion).' },
          { name: '(valueChange) / (submitted)', type: 'EventEmitter<AIComposerDocument>', description: 'Value changes and submit results.' },
          { name: 'aic-header · aic-toolbar · aic-footer · aic-attachments', type: 'directives', description: 'Project custom content into the slots.' },
          { name: '<aic-ai-composer-input> · <aic-ai-composer-submit>', type: 'components', description: 'Editable surface and the default circular send button.' },
        ]}
      />

      {/* --------------------------------------------------- Web Component */}
      <h3 className="sub" id="framework-web-component">
        Web Component — any stack, no framework
      </h3>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/web-component @ai-composer/themes @ai-composer/plugin-mention`}
      />
      <CodeBlock
        lang="html"
        code={`<script type="module">
  import { defineAiComposerEditor } from '@ai-composer/web-component';
  import { mentionPlugin } from '@ai-composer/plugin-mention';
  import '@ai-composer/themes/css/tokens.css';
  import '@ai-composer/themes/css/default.css';

  defineAiComposerEditor();

<ai-composer-editor mode="chat" placeholder="Ask anything…"></ai-composer-editor>

  // Set properties before connection to avoid an unnecessary remount.
  const el = document.querySelector('ai-composer-editor');
  el.plugins = [mentionPlugin({ items: people })];
  el.addEventListener('aic-submit', (event) => {
    const { value } = event.detail;
    console.log('Submit document', value);
  });
</script>`}
      />
      <p className="prose-p muted">
        HTML attributes configure primitive options. Assign <code>plugins</code> and
        <code> editor</code> as JavaScript properties; adapter events bubble as
        <code> CustomEvent</code>s whose payload is in <code>event.detail</code>.
      </p>
      <PropTable
        columns={['API', 'Type', 'Description']}
        rows={[
          { name: 'mode · placeholder · disabled · readonly', type: 'attribute', description: 'Reflected attributes on <ai-composer-editor>.' },
          { name: 'el.plugins', type: 'AIComposerPlugin[]', description: 'Plugin configuration property.' },
          { name: 'el.editor', type: 'AIComposer', description: 'The underlying engine instance (imperative access).' },
          { name: 'aic-change · aic-submit · aic-focus …', type: 'CustomEvent', description: 'Every editor event, re-dispatched with the payload in detail.' },
        ]}
      />

      {/* -------------------------------------------------------- Vanilla */}
      <h3 className="sub" id="framework-vanilla">
        Vanilla JS
      </h3>
      <p className="prose-p muted">
        Use the core and DOM packages directly when you don’t want a framework adapter. The mounted
        view can be destroyed independently from the editor instance.
      </p>
      <CodeBlock
        lang="bash"
        code={`npm install @ai-composer/core @ai-composer/dom @ai-composer/plugin-mention @ai-composer/themes`}
      />
      <CodeBlock
        lang="ts"
        code={`import { createAIComposer, type AIComposerPayload } from '@ai-composer/core';
import { mountAIComposer } from '@ai-composer/dom';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const host = document.querySelector<HTMLElement>('#composer');
if (!host) throw new Error('Missing #composer host');

const editor = createAIComposer({
  mode: 'chat',
  placeholder: 'Ask anything… try @mentions',
  plugins: [mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace' }] })],
  submit: {
    onSubmit: async (_document, currentEditor) => {
      const payload = currentEditor.serialize('ai') as AIComposerPayload;
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Assistant request failed');
    },
  },
});
const mounted = mountAIComposer(host, editor, { maxHeight: '40vh' });

// On route teardown: remove the view, then release the editor.
function dispose() {
  mounted.destroy();
  editor.destroy();
}`}
      />

      <div className="callout">
        <span aria-hidden>✦</span>
        <span>
          <strong>Adapter packages:</strong> <code>@ai-composer/react</code>,{' '}
          <code>@ai-composer/vue</code>, <code>@ai-composer/angular</code>,{' '}
          <code>@ai-composer/web-component</code> — all depending only on{' '}
          <code>core</code> + <code>dom</code>.
        </span>
      </div>
    </section>
  );
}
