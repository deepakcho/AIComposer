import { CodeBlock } from '../components/CodeBlock';
import { PropTable } from '../components/PropTable';

export function ApiReference(): JSX.Element {
  return (
    <section className="section" id="api">
      <h2>
        API reference{' '}
        <a className="section-anchor" href="#api" aria-label="Link to section">#</a>
      </h2>
      <p className="section-lead">
        The React adapter over the core engine: props and slots for the component layer,
        <code> createAIComposer()</code> for the engine. Types live in{' '}
        <code>@ai-composer/core</code> and <code>@ai-composer/react</code>.
      </p>

      <h3 className="sub" id="api-props">
        AIComposer props
      </h3>
      <PropTable
        rows={[
          { name: 'editor', type: 'AIComposer', description: 'External editor instance (Level 3). When omitted, one is created from options.' },
          { name: 'options', type: 'AIComposerOptions', description: 'Editor factory options — plugins, value, submit config (Level 2).' },
          { name: 'mode', type: 'string', default: "'default'", description: "Structural preset: 'compact' | 'chat' | 'expanded' or any custom mode name." },
          { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text while the document is empty.' },
          { name: 'value', type: 'AIComposerDocument | string', description: 'Controlled value. Strings coerce to a text document.' },
          { name: 'onChange', type: '(value: AIComposerDocument) => void', description: 'Fires on every value change (controlled pattern).' },
          { name: 'onSubmit', type: '(value: AIComposerDocument) => void', description: 'Fires after a submit completes.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks editing and submitting; maps to aria-disabled.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Selection works, editing does not; submit still callable via API.' },
          { name: 'submitLabel', type: 'string', default: "'↑'", description: 'Label of the default send button.' },
          { name: 'toolbarActions', type: "('submit' | 'undo' | 'redo')[]", default: "['submit']", description: 'Default toolbar buttons when no toolbar children are passed.' },
          { name: 'maxHeight', type: 'number | string', description: 'Auto-height ceiling — px number or any CSS length ("40vh"). The box grows to it, then scrolls.' },
          { name: 'className · style · aria-label', type: 'string / CSSProperties', description: 'Standard element props spread onto the root.' },
        ]}
      />

      <h3 className="sub" id="api-slots">
        Slot components
      </h3>
      <p className="prose-p muted">
        Slots are plain components reading the editor from context — compose them in any order and
        wrap them in your own DOM.
      </p>
      <PropTable
        columns={['Component', 'Props', 'Description']}
        rows={[
          { name: 'AIComposerInput', type: 'className · id · suggestions', description: 'The editable surface. Mounts the DOM layer once; React never touches the inner content. suggestions={false} disables the built-in popup.' },
          { name: 'AIComposerBody', type: 'children', description: 'Column wrapper for attachments + input.' },
          { name: 'AIComposerAttachments', type: 'renderItem?', description: 'Attachment chips driven by editor state; renderItem fully replaces chip rendering.' },
          { name: 'AIComposerSuggestions', type: 'renderItem · placement · className', description: 'Custom suggestion menu — pair with <AIComposerInput suggestions={false} />. Caret-anchored, viewport-aware.' },
          { name: 'AIComposerToolbar', type: 'children · actions · submitLabel', description: 'Toolbar row; children replace the default buttons entirely.' },
          { name: 'AIComposerHeader · AIComposerFooter', type: 'children', description: 'Free-form slots rendered by your layout.' },
        ]}
      />

      <h3 className="sub" id="api-hooks">
        Hooks
      </h3>
      <PropTable
        columns={['Hook', 'Signature', 'Description']}
        rows={[
          { name: 'useAIComposer', type: '(options?) => AIComposer', description: 'Creates an editor once (StrictMode-safe) and destroys it on unmount.' },
          { name: 'useAIComposerState', type: '(editor) => AIComposerState', description: 'Live state snapshot via useSyncExternalStore — the re-render source for adapters.' },
          { name: 'useAIComposerSelection', type: '(editor) => SelectionState', description: 'Live selection (anchor/focus positions).' },
          { name: 'useAIComposerSuggestions', type: '(editor) => { items, activeIndex, open, accept, move, close }', description: 'The active trigger session.' },
          { name: 'useAIComposerCommand', type: '(editor) => (id, payload?) => Promise<void>', description: 'Stable executeCommand binding for toolbars.' },
          { name: 'useAIComposerContext', type: '() => AIComposer', description: 'Resolves the editor from the nearest AIComposer / AIComposerProvider.' },
        ]}
      />

      <h3 className="sub" id="api-core">
        Core engine — createAIComposer()
      </h3>
      <CodeBlock
        lang="ts"
        code={`import { createAIComposer } from '@ai-composer/core';

const editor = createAIComposer({
  mode: 'chat',
  placeholder: 'Ask anything…',
  plugins: [],                 // AIComposerPlugin[]
  submit: {
    clearOnSubmit: true,
    allowEmpty: false,
    onSubmit: async (value, editor) => send(value),
  },
  history: { limit: 200, mergeWindowMs: 500 },
});`}
      />
      <PropTable
        columns={['Option', 'Type', 'Default', 'Description']}
        rows={[
          { name: 'value', type: 'AIComposerDocument | AIComposerNode[] | string', default: 'empty', description: 'Initial value; strings coerce to a text document.' },
          { name: 'plugins', type: 'AIComposerPlugin[]', default: '[]', description: 'Installed at creation; each may contribute triggers, commands, node types, serializers.' },
          { name: 'mode · placeholder', type: 'string', default: "'default' · ''", description: 'Initial preset and placeholder.' },
          { name: 'disabled · readonly', type: 'boolean', default: 'false', description: 'Initial state flags.' },
          { name: 'submitKey', type: "'enter' | 'shift-enter' | 'none'", default: "'enter'", description: 'DOM Enter policy.' },
          { name: 'history', type: '{ limit?, mergeWindowMs? }', default: '{200, 500}', description: 'Undo stack size and typing merge window.' },
          { name: 'submit', type: 'SubmitConfig', description: 'onSubmit(value, editor), clearOnSubmit, allowEmpty.' },
          { name: 'nodeTypes · serializers', type: 'arrays', default: 'built-ins', description: 'Extra or overriding contributions.' },
        ]}
      />
      <h4 className="sub">Editor methods</h4>
      <CodeBlock
        lang="ts"
        code={`// value
editor.getValue(): AIComposerDocument
editor.setValue(value, { source?, history?, label? })
editor.insertText(text, at?)                 // replaces the selection
editor.insertNode(node, { at?, trailingSpace? })
editor.removeNode(key)
editor.replaceRange(range, nodes, opts?)     // one history step
editor.clear()

// selection / lifecycle
editor.getSelection() / editor.setSelection(sel)
editor.focus() / editor.blur()
editor.destroy()

// history
editor.undo() / editor.redo()
editor.transaction(fn, { label? })           // one undo step

// submit
await editor.submit()

// triggers
editor.getActiveTrigger()
await editor.acceptSuggestion(item?)
editor.moveSuggestionSelection(delta)
editor.closeTrigger(reason?)
editor.openTrigger(triggerId)               // inserts the trigger char

// state / config / serialization
editor.getState() / editor.subscribe(fn)
editor.configure(patch) / editor.setMode(m)
editor.serialize('json' | 'text' | 'markdown' | 'html' | 'ai')`}
      />

      <h3 className="sub" id="api-document">
        Document model
      </h3>
      <p className="prose-p muted">
        The document is a flat list of text runs and atomic chip nodes (ADR-0002) — immutable,
        serializable, framework-neutral. Atomic nodes count as length 1 in the model.
      </p>
      <PropTable
        columns={['Node', 'Shape', 'Description']}
        rows={[
          { name: 'TextNode', type: "{ type:'text', key, text }", description: 'A run of editable text. Adjacent runs merge on normalize.' },
          { name: 'MentionNode', type: "{ type:'mention', key, id, label, metadata? }", description: 'An @entity chip; id references the mentioned thing.' },
          { name: 'CommandNode', type: "{ type:'command', key, id, label, metadata? }", description: 'A /command chip.' },
          { name: 'VariableNode', type: "{ type:'variable', key, name, value? }", description: 'A {{placeholder}} chip.' },
          { name: 'AttachmentNode', type: "{ type:'attachment', key, id, name, mimeType, size? }", description: 'A file chip.' },
          { name: 'CustomNode', type: "{ type:'custom', key, plugin, nodeType, data }", description: 'Anything a plugin defines.' },
        ]}
      />
      <CodeBlock
        lang="ts"
        code={`import {
  createTextNode, createMentionNode, createAttachmentNode,
} from '@ai-composer/core';

const doc = {
  nodes: [
    createAttachmentNode({ id: 'f1', name: 'spec.pdf', mimeType: 'application/pdf' }),
    createTextNode(' summarize for '),
    createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
  ],
  metadata: { sessionId: 's-1' },  // optional, surfaces in serialize('ai')
};`}
      />

      <h3 className="sub" id="api-events">
        Events
      </h3>
      <CodeBlock
        lang="ts"
        code={`const off = editor.on('change', (event) => {
  console.log(event.source, event.value); // 'user' | 'api' | 'plugin' | 'undo' | 'redo'
});
off(); // unsubscribe`}
      />
      <PropTable
        columns={['Event', 'Payload', 'Fires when']}
        rows={[
          { name: 'change', type: '{ value, source }', description: 'Any value change.' },
          { name: 'input', type: "{ value, source:'user' }", description: 'User edits only (typing / paste).' },
          { name: 'focus · blur', type: '{ focused }', description: 'Native focus changes.' },
          { name: 'selectionChange', type: '{ selection }', description: 'Caret or selection moved.' },
          { name: 'beforeSubmit', type: '{ value, preventDefault() }', description: 'Cancellable pre-submit.' },
          { name: 'submit', type: '{ value }', description: 'Submit finished (success or handled error).' },
          { name: 'triggerOpen · triggerClose', type: '{ triggerId, query? / reason }', description: 'Trigger session lifecycle.' },
          { name: 'suggestionsChange', type: '{ triggerId, suggestions, activeIndex }', description: 'Suggestion menu updated.' },
          { name: 'nodeInsert · nodeRemove', type: '{ node, index }', description: 'Chip lifecycle.' },
          { name: 'attachmentAdd · attachmentRemove', type: '{ attachment }', description: 'Attachment chips specifically.' },
          { name: 'commandExecute', type: '{ id, payload? }', description: 'Command dispatched.' },
          { name: 'modeChange', type: '{ mode }', description: 'Preset switched.' },
          { name: 'error', type: '{ error, phase? }', description: 'Handler failures (submit, trigger search/select).' },
          { name: 'destroy', type: "{ target:'editor' }", description: 'Teardown.' },
        ]}
      />

      <h3 className="sub" id="api-commands">
        Commands
      </h3>
      <p className="prose-p muted">
        Commands are the imperative surface — buttons and keyboard shortcuts call them. Built-ins:{' '}
        <code>submit</code>, <code>clear</code>, <code>undo</code>, <code>redo</code>,{' '}
        <code>insertText</code>, <code>insertNode</code>, <code>focus</code>, <code>blur</code>,{' '}
        <code>openTrigger</code>, <code>removeNode</code>, <code>acceptSuggestion</code>.
      </p>
      <CodeBlock
        lang="ts"
        code={`await editor.executeCommand('undo');
await editor.executeCommand('insertText', { text: 'hello', at: position });
editor.canExecuteCommand('submit'); // gated by disabled/readonly/submitting

// register your own
const off = editor.registerCommand({
  id: 'app.toggleCase',
  canExecute: ({ state }) => !state.empty,
  execute: ({ editor }) => { /* … */ },
});`}
      />

      <h3 className="sub" id="api-plugins">
        Plugins
      </h3>
      <p className="prose-p muted">
        Plugins contribute triggers, commands, node types and serializers through one contract.
        The mention and command plugins are the reference implementations.
      </p>
      <CodeBlock
        lang="ts"
        code={`import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

mentionPlugin({
  trigger: '@',                       // default '@'
  items: people,                      // static pool, or…
  search: async ({ query }) => api.search(query),  // dynamic source
  allowSpaces: false,                 // spaces end the query
  limit: 10,
});

commandPlugin({
  trigger: '/',
  commands: [
    { id: 'summarize', label: 'Summarize', description: 'Summarize the thread' },
    { id: 'escalate', label: 'Escalate', run: (editor) => escalate(editor.serialize('ai')) },
  ],
});`}
      />
      <h4 className="sub">Custom plugin</h4>
      <CodeBlock
        lang="ts"
        code={`import { defineTrigger, type AIComposerPlugin } from '@ai-composer/core';

const hashtagPlugin = (options = {}): AIComposerPlugin => ({
  name: 'hashtag',
  triggers: [
    defineTrigger({
      id: 'hashtag',
      character: '#',
      type: 'custom',
      search: ({ query }) => tags.filter((t) => t.label.includes(query)),
    }),
  ],
});`}
      />

      <h3 className="sub" id="api-serialization">
        Serialization
      </h3>
      <PropTable
        columns={['Format', 'Output', 'Use']}
        rows={[
          { name: "serialize('json')", type: 'AIComposerDocument', description: 'POJO — persistence, lossless round-trip.' },
          { name: "serialize('text')", type: 'string', description: 'Chips as readable text (@Ada) — previews, search.' },
          { name: "serialize('markdown')", type: 'string', description: 'Chips as links [@Ada](mention:u1) — MD pipelines.' },
          { name: "serialize('html')", type: 'string', description: 'Escaped, data-aic-* annotated. Export only — never trusted on input.' },
          { name: "serialize('ai')", type: '{ text, entities, metadata? }', description: 'Provider-neutral AI payload.' },
        ]}
      />
      <CodeBlock
        lang="ts"
        code={`const payload = editor.serialize('ai') as AIComposerPayload;
// {
//   text: 'Summarize @Ada Lovelace spec.pdf',
//   entities: [
//     { type: 'mention', id: 'u1', label: 'Ada Lovelace' },
//     { type: 'attachment', id: 'f1', name: 'spec.pdf' },
//   ],
//   metadata: { sessionId: 's-1' },
// }

// custom serializer
editor.registerSerializer({
  format: 'slack-mrkdwn',
  serialize: (doc) => documentToText(doc, context).replace(/@(\\w+)/g, '<@$1>'),
});`}
      />

      <h3 className="sub" id="api-ai-integration">
        Connect an AI service
      </h3>
      <p className="prose-p muted">
        The <code>ai</code> format is a provider-neutral request body, not a network client. Send it
        to an application-owned endpoint, keep credentials on the server, and return the generated
        response through your app’s state layer.
      </p>
      <CodeBlock
        lang="ts"
        code={`import { createAIComposer, type AIComposerPayload } from '@ai-composer/core';

const editor = createAIComposer({
  mode: 'chat',
  submit: {
    onSubmit: async (_document, currentEditor) => {
      const payload = currentEditor.serialize('ai') as AIComposerPayload;
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Assistant request failed');
      const result = await response.json() as { text: string };
      console.log(result.text);
    },
  },
});`}
      />
    </section>
  );
}
