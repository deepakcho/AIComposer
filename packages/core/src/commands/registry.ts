/**
 * Command system — UI-independent named operations. Toolbars and keyboard
 * shortcuts bind to command ids, never to implementation functions.
 */

import type { Unsubscribe } from '../events/event-bus';
import type { AIComposer } from '../editor';
import type { AIComposerState } from '../state/state';

export interface CommandContext {
  editor: AIComposer;
  state: AIComposerState;
  payload?: unknown;
}

export interface AIComposerCommand {
  id: string;
  label?: string;
  execute(context: CommandContext): void | Promise<void>;
  canExecute?(context: CommandContext): boolean;
}

export interface CommandRegistry {
  register(command: AIComposerCommand): Unsubscribe;
  get(id: string): AIComposerCommand | undefined;
  has(id: string): boolean;
  list(): AIComposerCommand[];
  clear(): void;
}

export function createCommandRegistry(): CommandRegistry {
  const commands = new Map<string, AIComposerCommand>();
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
