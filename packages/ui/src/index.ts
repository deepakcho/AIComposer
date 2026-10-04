/**
 * @ai-composer/ui — optional ready-made UI.
 *
 * A convenience wrapper over core+dom with polished defaults. Applications
 * that want full control skip this package entirely and use core+dom directly
 * — ui is sugar, never a dependency of the engine (ADR-0007).
 */

import type { PromptEditor } from '@ai-composer/core';
import { mountPromptEditor, type MountOptions, type MountedEditor } from '@ai-composer/dom';

export interface ChatComposerOptions extends MountOptions {
  /** Extra class names on the root element. */
  className?: string;
  /** Dark/compact token theme via data attribute. */
  theme?: 'default' | 'dark' | 'compact';
}

export interface ChatComposer extends MountedEditor {
  editor: PromptEditor;
}

/**
 * Mount a production-ready chat composer.
 *
 * ```ts
 * import { createPromptEditor } from '@ai-composer/core';
 * import { createChatComposer } from '@ai-composer/ui';
 * import '@ai-composer/themes/css/default.css';
 *
 * const editor = createPromptEditor({ plugins: [mentionPlugin({ items })] });
 * const composer = createChatComposer('#composer', editor, { theme: 'dark' });
 * ```
 */
export function createChatComposer(
  target: HTMLElement | string,
  editor: PromptEditor,
  options: ChatComposerOptions = {},
): ChatComposer {
  const container = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!container) throw new Error(`createChatComposer: target not found (${String(target)})`);

  const { className, theme, ...mountOptions } = options;
  const mounted = mountPromptEditor(container, editor, { mode: 'chat', ...mountOptions });

  if (theme && theme !== 'default') mounted.root.setAttribute('data-aic-theme', theme);
  if (className) mounted.root.classList.add(...className.split(/\s+/).filter(Boolean));

  return { ...mounted, editor };
}
