/**
 * @ai-composer/dom — browser layer over @ai-composer/core.
 *
 *   surface     contentEditable binding (input pipeline, keyboard, clipboard, IME)
 *   render      model → DOM projection (chips carry data-aic-* attributes)
 *   parse       DOM → model with strict sanitization
 *   selection   DOM selection ↔ model selection mapping
 *   suggestions accessible suggestion listbox driven by state
 *   template    structural mode presets (compact/default/chat/expanded)
 *   mount       vanilla JS mountAIComposer()
 */

export {
  createEditableSurface,
  EDITABLE_SURFACE_CLASS,
  type EditableSurface,
  type EditableSurfaceOptions,
} from './surface';

export { renderChip, renderDocument, renderTextRun } from './render';
export { htmlToPlainText, parseEditableHost, CLIPBOARD_MIME } from './parse';
export { applyModelSelection, caretToEnd, domSelectionToModel } from './selection';
export {
  createSuggestionList,
  type SuggestionList,
  type SuggestionListOptions,
} from './suggestions';
export {
  attachCaretAnchoredPopup,
  measureCaret,
  type CaretAnchor,
  type CaretAnchorOptions,
  type CaretPoint,
} from './popup';
export {
  CHAT_TEMPLATE,
  COMPACT_TEMPLATE,
  DEFAULT_TEMPLATE,
  EXPANDED_TEMPLATE,
  registerTemplate,
  SLOT_ATTRIBUTE,
  templateForMode,
  type AIComposerDomTemplate,
  type TemplateSlotName,
} from './template';
export {
  mountAIComposer,
  type MountedEditor,
  type MountOptions,
} from './mount';
