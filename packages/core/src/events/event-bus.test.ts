import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus';

describe('event bus', () => {
  it('subscribes and emits typed payloads', () => {
    const bus = createEventBus<{ change: { value: number }; focus: { focused: boolean } }>();
    const handler = vi.fn();
    bus.on('change', handler);
    bus.emit('change', { value: 42 });
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('unsubscribe stops delivery', () => {
    const bus = createEventBus<{ ping: { n: number } }>();
    const handler = vi.fn();
    const off = bus.on('ping', handler);
    off();
    bus.emit('ping', { n: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('once fires a single time', () => {
    const bus = createEventBus<{ ping: { n: number } }>();
    const handler = vi.fn();
    bus.once('ping', handler);
    bus.emit('ping', { n: 1 });
    bus.emit('ping', { n: 2 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('off removes a specific handler', () => {
    const bus = createEventBus<{ ping: { n: number } }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    bus.on('ping', b);
    bus.off('ping', a);
    bus.emit('ping', { n: 1 });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it('a throwing listener does not break other listeners', () => {
    const bus = createEventBus<{ ping: { n: number } }>();
    const good = vi.fn();
    bus.on('ping', () => {
      throw new Error('boom');
    });
    bus.on('ping', good);
    bus.emit('ping', { n: 1 });
    expect(good).toHaveBeenCalled();
  });

  it('counts listeners and clears', () => {
    const bus = createEventBus<{ ping: { n: number } }>();
    bus.on('ping', () => undefined);
    bus.on('ping', () => undefined);
    expect(bus.listenerCount('ping')).toBe(2);
    bus.clear();
    expect(bus.listenerCount('ping')).toBe(0);
  });
});
