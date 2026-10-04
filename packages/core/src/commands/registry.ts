/**
 * Command system — UI-independent named operations. Toolbars and keyboard
 * shortcuts bind to command ids, never to implementation functions.
 */

import type { Unsubscribe } from '../events/event-bus';
import type { PromptEditor } from '../editor';
import type { PromptEditorState } from '../state/state';

export interface CommandContext {
  editor: PromptEditor;
  state: PromptEditorState;
  payload?: unknown;
}

export interface PromptCommand {
  id: string;
  label?: string;
  execute(context: CommandContext): void | Promise<void>;
  canExecute?(context: CommandContext): boolean;
}

export interface CommandRegistry {
  register(command: PromptCommand): Unsubscribe;
  get(id: string): PromptCommand | undefined;
  has(id: string): boolean;
  list(): PromptCommand[];
  clear(): void;
}

export function createCommandRegistry(): CommandRegistry {
  const commands = new Map<string, PromptCommand>();
  return {
    register(command) {
      commands.set(command.id, command);
      return () => {
        if (commands.get(command.id) === command) commands.delete(command.id);
      };
    },
    get(id) {
      return commands.get(id);
    },
    has(id) {
      return commands.has(id);
    },
    list() {
      return [...commands.values()];
    },
    clear() {
      commands.clear();
    },
  };
}
