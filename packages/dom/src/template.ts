/**
 * Structural templates. Modes are presets, not separate implementations:
 * a template describes which slots exist and how the surface behaves.
 */

import type { SubmitKey } from '@ai-composer/core';

export type TemplateSlotName =
  | 'root'
  | 'header'
  | 'body'
  | 'attachments'
  | 'input'
  | 'suggestions'
  | 'toolbar'
  | 'actions'
  | 'footer'
  | 'status';

export interface PromptDomTemplate {
  name: string;
  /** Slots rendered by the default mount, in order. */
  slots: TemplateSlotName[];
  /** Multiline editing surface. */
  multiline: boolean;
  /** Default submit key behavior for the mode. */
  submitKey?: SubmitKey;
  /** Toolbar buttons included by the default mount. */
  toolbarButtons?: Array<'undo' | 'redo' | 'submit'>;
}

export const COMPACT_TEMPLATE: PromptDomTemplate = {
  name: 'compact',
  slots: ['body', 'input', 'suggestions'],
  multiline: false,
  submitKey: 'enter',
};

export const DEFAULT_TEMPLATE: PromptDomTemplate = {
  name: 'default',
  slots: ['body', 'attachments', 'input', 'suggestions'],
  multiline: true,
  submitKey: 'enter',
};

export const CHAT_TEMPLATE: PromptDomTemplate = {
  name: 'chat',
  slots: ['header', 'body', 'attachments', 'input', 'suggestions', 'toolbar', 'actions'],
  multiline: true,
  submitKey: 'enter',
  toolbarButtons: ['submit'],
};

export const EXPANDED_TEMPLATE: PromptDomTemplate = {
  name: 'expanded',
  slots: ['header', 'body', 'attachments', 'input', 'suggestions', 'toolbar', 'footer'],
  multiline: true,
  submitKey: 'shift-enter',
  toolbarButtons: ['undo', 'redo', 'submit'],
};

const TEMPLATES: Record<string, PromptDomTemplate> = {
  compact: COMPACT_TEMPLATE,
  default: DEFAULT_TEMPLATE,
  chat: CHAT_TEMPLATE,
  expanded: EXPANDED_TEMPLATE,
};

export function templateForMode(mode: string): PromptDomTemplate {
  return TEMPLATES[mode] ?? DEFAULT_TEMPLATE;
}

/** Register a custom mode preset (used by applications/other packages). */
export function registerTemplate(template: PromptDomTemplate): void {
  TEMPLATES[template.name] = template;
}

export const SLOT_ATTRIBUTE = 'data-aic-slot';
