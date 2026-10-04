/**
 * @ai-composer/plugin-mention — `@mention` trigger.
 *
 * ```ts
 * import { createPromptEditor } from '@ai-composer/core';
 * import { mentionPlugin } from '@ai-composer/plugin-mention';
 *
 * const editor = createPromptEditor({
 *   plugins: [
 *     mentionPlugin({
 *       items: [
 *         { id: 'u1', label: 'Ada Lovelace', data: { team: 'eng' } },
 *       ],
 *     }),
 *   ],
 * });
 * ```
 */

import {
  defineTrigger,
  type PromptPlugin,
  type PromptTrigger,
  type SuggestionItem,
  type TriggerSearchContext,
  type TriggerSelectContext,
} from '@ai-composer/core';

export interface MentionPluginOptions {
  /** Trigger character (default '@'). */
  trigger?: string;
  /** Trigger id (default 'mention'). */
  id?: string;
  /** Static suggestion pool. */
  items?: SuggestionItem[];
  /** Dynamic search; overrides `items` filtering. */
  search?: (context: TriggerSearchContext) => SuggestionItem[] | Promise<SuggestionItem[]>;
  /** Allow spaces inside the query (default false). */
  allowSpaces?: boolean;
  /** Custom selection behavior (default: insert a mention node). */
  select?: (item: SuggestionItem, context: TriggerSelectContext) => void;
  /** Maximum suggestions rendered (default 10). */
  limit?: number;
}

export function mentionPlugin(options: MentionPluginOptions = {}): PromptPlugin {
  const character = options.trigger ?? '@';
  const limit = options.limit ?? 10;

  const defaultSearch = (context: TriggerSearchContext): SuggestionItem[] => {
    const query = context.query.trim().toLowerCase();
    const pool = options.items ?? [];
    if (!query) return pool.slice(0, limit);
    return pool
      .filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query),
      )
      .slice(0, limit);
  };

  const trigger: PromptTrigger = defineTrigger({
    id: options.id ?? 'mention',
    character,
    type: 'mention',
    allowSpaces: options.allowSpaces,
    search: options.search ?? defaultSearch,
    ...(options.select ? { select: options.select } : {}),
  });

  return {
    name: options.id ?? 'mention',
    version: '0.1.0',
    triggers: [trigger],
  };
}
