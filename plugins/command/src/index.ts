/**
 * @ai-composer/plugin-command — `/slash` commands.
 *
 * ```ts
 * import { createAIComposer } from '@ai-composer/core';
 * import { commandPlugin } from '@ai-composer/plugin-command';
 *
 * const editor = createAIComposer({
 *   plugins: [
 *     commandPlugin({
 *       commands: [
 *         { id: 'summarize', label: 'Summarize', description: 'Summarize the thread' },
 *         { id: 'translate', label: 'Translate', run: (editor) => { … } },
 *       ],
 *     }),
 *   ],
 * });
 * ```
 *
 * Commands WITHOUT `run` insert a command node into the document; commands WITH
 * `run` execute immediately and the trigger run is simply removed.
 */

import {
  createCommandNode,
  defineTrigger,
  type DocumentRange,

  type AIComposer,
  type AIComposerPlugin,
  type AIComposerTrigger,
  type SuggestionItem,
  type TriggerSearchContext,
  type TriggerSelectContext,
} from '@ai-composer/core';

export interface SlashCommandDefinition {
  id: string;
  label: string;
  description?: string;
  /** Immediate action; when omitted the command is inserted as a node. */
  run?: (editor: AIComposer) => void | Promise<void>;
  /** Extra payload stored on the node metadata / suggestion data. */
  data?: Record<string, unknown>;
}

export interface CommandPluginOptions {
  /** Trigger character (default '/'). */
  trigger?: string;
  /** Trigger id (default 'command'). */
  id?: string;
  /** Available commands. */
  commands: SlashCommandDefinition[];
  /** Dynamic command source; overrides `commands`. */
  search?: (context: TriggerSearchContext) => SlashCommandDefinition[] | Promise<SlashCommandDefinition[]>;
}

export function commandPlugin(options: CommandPluginOptions): AIComposerPlugin {
  const character = options.trigger ?? '/';
  const definitions = options.commands ?? [];

  const toSuggestion = (definition: SlashCommandDefinition): SuggestionItem => ({
    id: definition.id,
    label: definition.label,
    description: definition.description,
    data: definition.data,
  });

  const defaultSearch = (context: TriggerSearchContext): SuggestionItem[] => {
    const query = context.query.trim().toLowerCase().replace(/^\//, '');
    const matches = definitions.filter(
      (definition) =>
        !query ||
        definition.label.toLowerCase().includes(query) ||
        definition.id.toLowerCase().includes(query),
    );
    return matches.map(toSuggestion);
  };

  const select = (item: SuggestionItem, context: TriggerSelectContext): void => {
    const definition = definitions.find((candidate) => candidate.id === item.id);
    const range: DocumentRange = {
      start: { nodeIndex: context.nodeIndex, offset: context.triggerOffset },
      end: { nodeIndex: context.nodeIndex, offset: context.endOffset },
    };

    if (definition?.run) {
      // Immediate action: strip the trigger run and run the handler.
      context.editor.replaceRange(range, []);
      void definition.run(context.editor);
      return;
    }

    // Command nodes replace the trigger run in the document.
    context.editor.replaceRange(
      range,
      [
        createCommandNode({
          id: definition?.id ?? item.id,
          label: definition?.label ?? item.label,
          ...(definition?.data ? { metadata: definition.data } : {}),
        }),
      ],
      { trailingSpace: true },
    );
  };

  const trigger: AIComposerTrigger = defineTrigger({
    id: options.id ?? 'command',
    character,
    type: 'command',
    search: async (context) => {
      if (options.search) {
        const found = await options.search(context);
        return found.map(toSuggestion);
      }
      return defaultSearch(context);
    },
    select,
  });

  return {
    name: options.id ?? 'command',
    version: '0.1.0',
    triggers: [trigger],
  };
}
