/** Factory + version. */

import { AIComposerImpl, type AIComposer } from './editor';
import type { AIComposerOptions } from './types';

/**
 * Create a framework-independent AI Composer editor instance.
 *
 * @example
 * ```ts
 * const editor = createAIComposer({
 *   placeholder: 'Ask anything…',
 *   plugins: [mentionPlugin({ trigger: '@', items })],
 * });
 * ```
 */
export function createAIComposer(options: AIComposerOptions = {}): AIComposer {
  return new AIComposerImpl(options);
}

export const CORE_VERSION = '0.1.0';
