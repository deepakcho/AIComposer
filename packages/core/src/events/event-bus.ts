/**
 * Minimal typed event bus. No framework emitters in core — adapters map this
 * to synthetic events, RxJS, component events, etc.
 */

export type Unsubscribe = () => void;
export type EventHandler<TPayload> = (payload: TPayload) => void;

export interface EventMapBase {
  [eventType: string]: unknown;
}

export interface EventBus<TEvents extends EventMapBase> {
  on<K extends keyof TEvents & string>(type: K, handler: EventHandler<TEvents[K]>): Unsubscribe;
  once<K extends keyof TEvents & string>(type: K, handler: EventHandler<TEvents[K]>): Unsubscribe;
  off<K extends keyof TEvents & string>(type: K, handler: EventHandler<TEvents[K]>): void;
  emit<K extends keyof TEvents & string>(type: K, payload: TEvents[K]): void;
  listenerCount<K extends keyof TEvents & string>(type: K): number;
  clear(): void;
}

export function createEventBus<TEvents extends EventMapBase>(): EventBus<TEvents> {
  const handlers = new Map<string, Set<EventHandler<unknown>>>();

  const bus: EventBus<TEvents> = {
    on(type, handler) {
      let set = handlers.get(type);
      if (!set) {
        set = new Set();
        handlers.set(type, set);
      }
      set.add(handler as EventHandler<unknown>);
      return () => bus.off(type, handler);
    },

    once(type, handler) {
      const wrapped: EventHandler<unknown> = (payload) => {
        off();
        (handler as EventHandler<unknown>)(payload);
      };
      const off = bus.on(type, wrapped as never);
      return off;
    },

    off(type, handler) {
      handlers.get(type)?.delete(handler as EventHandler<unknown>);
    },

    emit(type, payload) {
      const set = handlers.get(type);
      if (!set || set.size === 0) return;
      for (const handler of [...set]) {
        try {
          handler(payload);
        } catch (error) {
          // A broken listener must never break the editor loop.
          console.error(`[ai-composer] unhandled error in "${type}" listener`, error);
        }
      }
    },

    listenerCount(type) {
      return handlers.get(type)?.size ?? 0;
    },

    clear() {
      handlers.clear();
    },
  };

  return bus;
}
