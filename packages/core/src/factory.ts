/** Factory + version. */

import { PromptEditorImpl, type PromptEditor } from './editor';
import type { PromptEditorOptions } from './types';

/**
 * Create a framework-independent prompt editor.
 *
 * @example
 * ```ts
 * const editor = createPromptEditor({
 *   placeholder: 'Ask anything…',
 *   plugins: [mentionPlugin({ trigger: '@', items })],
 * });
 * ```
 */
export function createPromptEditor(options: PromptEditorOptions = {}): PromptEditor {
  return new PromptEditorImpl(options);
}

export const CORE_VERSION = '0.1.0';
