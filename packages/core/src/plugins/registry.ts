/**
 * Plugin architecture (ADR-0004). Plugins are plain objects with declarative
 * contributions plus an optional `setup()` for imperative wiring. They receive
 * a scoped context — never raw editor internals.
 */

import type { Unsubscribe, EventBus } from '../events/event-bus';
import type { AIComposerEventMap } from '../events/events';
import type { AIComposerCommand } from '../commands/registry';
import type { AIComposerTrigger } from '../triggers/engine';
import type { NodeDefinition } from '../nodes/registry';
import type { Serializer } from '../serialization/serializers';
import type { CommandRegistry } from '../commands/registry';
import type { TriggerRegistry } from '../triggers/engine';
import type { NodeRegistry } from '../nodes/registry';
import type { SerializerRegistry } from '../serialization/registry';
import type { AIComposer } from '../editor';
import type { AIComposerConfig } from '../types';

/** Controlled capabilities exposed to plugins. */
export interface PluginContext {
  editor: AIComposer;
  getConfig(): AIComposerConfig;
  commands: CommandRegistry;
  triggers: TriggerRegistry;
  nodes: NodeRegistry;
  serializers: SerializerRegistry;
  /** Subscribe to editor events (emit is intentionally not handed out). */
  events: Pick<EventBus<AIComposerEventMap>, 'on' | 'once' | 'off'>;
  /** Register cleanup run when the plugin is destroyed. */
  onCleanup(cleanup: () => void): void;
}

export interface AIComposerPlugin {
  /** Unique plugin name. */
  name: string;
  version?: string;
  /** Imperative wiring — called once when the plugin is attached. */
  setup?(context: PluginContext): void;
  commands?: AIComposerCommand[];
  triggers?: AIComposerTrigger[];
  nodeTypes?: NodeDefinition[];
  serializers?: Serializer[];
  /** Called when the plugin is removed or the editor destroyed. */
  destroy?(): void;
}

interface InstalledPlugin {
  plugin: AIComposerPlugin;
  disposers: Array<() => void>;
}

export interface PluginRegistry {
  add(plugin: AIComposerPlugin): Unsubscribe;
  get(name: string): AIComposerPlugin | undefined;
  list(): AIComposerPlugin[];
  /** Set up a plugin immediately with the given context (used by the factory). */
  install(plugin: AIComposerPlugin, context: PluginContext): Unsubscribe;
  destroyAll(): void;
}

export function createPluginRegistry(): PluginRegistry {
  const installed: InstalledPlugin[] = [];

  const teardown = (entry: InstalledPlugin): void => {
    for (const dispose of entry.disposers.splice(0)) {
      try {
        dispose();
      } catch (error) {
        console.error(`[ai-composer] plugin "${entry.plugin.name}" cleanup failed`, error);
      }
    }
    try {
      entry.plugin.destroy?.();
    } catch (error) {
      console.error(`[ai-composer] plugin "${entry.plugin.name}" destroy failed`, error);
    }
  };

  const registry: PluginRegistry = {
    add(plugin) {
      const entry: InstalledPlugin = { plugin, disposers: [] };
      installed.push(entry);
      return () => {
        const index = installed.indexOf(entry);
        if (index >= 0) {
          installed.splice(index, 1);
          teardown(entry);
        }
      };
    },

    get(name) {
      return installed.find((entry) => entry.plugin.name === name)?.plugin;
    },

    list() {
      return installed.map((entry) => entry.plugin);
    },

    install(plugin, context) {
      const entry: InstalledPlugin = { plugin, disposers: [] };
      installed.push(entry);

      const scoped: PluginContext = {
        ...context,
        onCleanup: (cleanup: () => void) => {
          entry.disposers.push(cleanup);
        },
        events: {
          on: (type, handler) => {
            const off = context.events.on(type, handler);
            entry.disposers.push(off);
            return off;
          },
          once: (type, handler) => {
            const off = context.events.once(type, handler);
            entry.disposers.push(off);
            return off;
          },
          off: (type, handler) => context.events.off(type, handler),
        },
      };

      for (const command of plugin.commands ?? []) {
        entry.disposers.push(context.commands.register(command));
      }
      for (const trigger of plugin.triggers ?? []) {
        entry.disposers.push(context.triggers.register(trigger));
      }
      for (const nodeType of plugin.nodeTypes ?? []) {
        entry.disposers.push(context.nodes.register(nodeType));
      }
      for (const serializer of plugin.serializers ?? []) {
        entry.disposers.push(context.serializers.register(serializer));
      }

      try {
        plugin.setup?.(scoped);
      } catch (error) {
        // roll this plugin back; the editor stays alive
        const index = installed.indexOf(entry);
        if (index >= 0) installed.splice(index, 1);
        teardown(entry);
        throw error;
      }

      return () => {
        const index = installed.indexOf(entry);
        if (index >= 0) {
          installed.splice(index, 1);
          teardown(entry);
        }
      };
    },

    destroyAll() {
      for (const entry of installed.splice(0)) teardown(entry);
    },
  };

  return registry;
}
