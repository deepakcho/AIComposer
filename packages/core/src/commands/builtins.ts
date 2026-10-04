/**
 * Built-in commands (see docs/api/05-commands.md). Plugins extend this set via
 * their `commands` contribution.
 */

import { PromptEditorError } from '../errors';
import type { Position } from '../model/selection';
import type { PromptNode } from '../model/nodes';
import type { SuggestionItem } from '../state/state';
import type { PromptEditor } from '../editor';
import type { PromptCommand } from './registry';

export const BUILTIN_COMMANDS = {
  submit: 'submit',
  clear: 'clear',
  undo: 'undo',
  redo: 'redo',
  insertText: 'insertText',
  insertNode: 'insertNode',
  focus: 'focus',
  blur: 'blur',
  openTrigger: 'openTrigger',
  removeNode: 'removeNode',
  acceptSuggestion: 'acceptSuggestion',
} as const;

export interface InsertTextPayload {
  text: string;
  at?: Position;
}

export interface InsertNodePayload {
  node: PromptNode;
  at?: Position;
}

export interface RemoveNodePayload {
  key: string;
}

export interface OpenTriggerPayload {
  triggerId: string;
}

export interface AcceptSuggestionPayload {
  item?: SuggestionItem;
}

function payloadOf<T>(payload: unknown): T {
  return payload as T;
}

export function createBuiltinCommands(editor: PromptEditor): PromptCommand[] {
  const commands: PromptCommand[] = [
    {
      id: BUILTIN_COMMANDS.submit,
      label: 'Submit',
      canExecute: ({ state }) => !state.disabled && !state.readonly && !state.submitting,
      execute: () => editor.submit(),
    },
    {
      id: BUILTIN_COMMANDS.clear,
      label: 'Clear',
      canExecute: ({ state }) => !state.disabled && !state.readonly,
      execute: () => editor.clear(),
    },
    {
      id: BUILTIN_COMMANDS.undo,
      label: 'Undo',
      canExecute: ({ state }) => state.canUndo,
      execute: () => editor.undo(),
    },
    {
      id: BUILTIN_COMMANDS.redo,
      label: 'Redo',
      canExecute: ({ state }) => state.canRedo,
      execute: () => editor.redo(),
    },
    {
      id: BUILTIN_COMMANDS.insertText,
      label: 'Insert text',
      execute: (_context) => {
        const payload = payloadOf<InsertTextPayload | string>(_context.payload);
        if (!payload) throw new PromptEditorError('UNKNOWN_COMMAND', 'insertText requires a payload');
        if (typeof payload === 'string') {
          editor.insertText(payload);
        } else {
          editor.insertText(payload.text, payload.at);
        }
      },
    },
    {
      id: BUILTIN_COMMANDS.insertNode,
      label: 'Insert node',
      execute: (_context) => {
        const payload = payloadOf<InsertNodePayload>(_context.payload);
        if (!payload?.node) throw new PromptEditorError('UNKNOWN_COMMAND', 'insertNode requires { node }');
        editor.insertNode(payload.node, { at: payload.at });
      },
    },
    {
      id: BUILTIN_COMMANDS.focus,
      label: 'Focus',
      execute: () => editor.focus(),
    },
    {
      id: BUILTIN_COMMANDS.blur,
      label: 'Blur',
      execute: () => editor.blur(),
    },
    {
      id: BUILTIN_COMMANDS.openTrigger,
      label: 'Open trigger',
      execute: (_context) => {
        const payload = payloadOf<OpenTriggerPayload | string>(_context.payload);
        const triggerId = typeof payload === 'string' ? payload : payload?.triggerId;
        if (!triggerId) throw new PromptEditorError('UNKNOWN_TRIGGER', 'openTrigger requires a triggerId');
        editor.openTrigger(triggerId);
      },
    },
    {
      id: BUILTIN_COMMANDS.removeNode,
      label: 'Remove node',
      execute: (_context) => {
        const payload = payloadOf<RemoveNodePayload | string>(_context.payload);
        const key = typeof payload === 'string' ? payload : payload?.key;
        if (!key) throw new PromptEditorError('UNKNOWN_COMMAND', 'removeNode requires a key');
        editor.removeNode(key);
      },
    },
    {
      id: BUILTIN_COMMANDS.acceptSuggestion,
      label: 'Accept suggestion',
      execute: async (_context) => {
        const payload = payloadOf<AcceptSuggestionPayload | undefined>(_context.payload);
        await editor.acceptSuggestion(payload?.item);
      },
    },
  ];

  return commands;
}
