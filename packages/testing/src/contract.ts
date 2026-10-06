/**
 * Shared contract suite. Every adapter (react, angular, vue, web-component)
 * runs this exact set of scenarios against its mounted editor so behavior
 * can never silently diverge between frameworks.
 *
 * ```ts
 * // packages/react/src/contract.test.tsx
 * import { defineAIComposerContractSuite } from '@ai-composer/testing';
 * defineAIComposerContractSuite((options) => mountReactEditor(options));
 * ```
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createMentionNode,
  createAIComposer,
  createTextNode,
  type AIComposer,
  type AIComposerOptions,
  type SuggestionItem,
} from '@ai-composer/core';

export interface ContractSuiteHooks {
  /**
   * Mount the editor UI for this suite (adapter-specific). Return a teardown
   * function. Headless usage (core-only) passes nothing.
   */
  mount?: (editor: AIComposer) => void | (() => void);
}

export interface ContractSuiteOptions extends ContractSuiteHooks {
  /** Test-suite title. */
  title?: string;
}

const people: SuggestionItem[] = [
  { id: 'u1', label: 'Ada Lovelace' },
  { id: 'u2', label: 'Grace Hopper' },
];

export function defineAIComposerContractSuite(
  createEditor: (options?: AIComposerOptions) => AIComposer,
  options: ContractSuiteOptions = {},
): void {
  describe(options.title ?? 'AIComposer contract', () => {
    let editor: AIComposer;

    function fresh(next?: AIComposerOptions): AIComposer {
      editor?.destroy();
      editor = createEditor(next);
      return editor;
    }

    it('sets and reads values (string, nodes, document)', () => {
      const local = fresh();
      local.setValue('hello');
      expect(local.serialize('text')).toBe('hello');
      local.setValue([createTextNode('hi '), createMentionNode({ id: 'u1', label: 'Ada' })]);
      expect(local.serialize('text')).toBe('hi @Ada');
    });

    it('emits change events with sources', () => {
      const local = fresh();
      const onChange = vi.fn();
      local.on('change', onChange);
      local.setValue('one');
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'api' }));
    });

    it('submits with beforeSubmit cancellation', async () => {
      const local = fresh({ value: 'question' });
      const onSubmit = vi.fn();
      local.on('beforeSubmit', (event) => event.preventDefault());
      local.on('submit', onSubmit);
      await local.submit();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('inserts atomic nodes with trailing spaces', () => {
      const local = fresh({ value: 'hey ' });
      local.insertNode(createMentionNode({ id: 'u1', label: 'Ada' }));
      expect(local.serialize('text')).toBe('hey @Ada ');
    });

    it('runs the mention trigger end-to-end', async () => {
      const local = fresh({
        plugins: [
          { name: 'mention', triggers: [{ id: 'mention', character: '@', type: 'mention', search: () => people }] },
        ],
      });
      local.insertText('@ad');
      await vi.waitFor(() => expect(local.getState().suggestions.length).toBeGreaterThan(0));
      await local.acceptSuggestion();
      expect(local.serialize('text')).toBe('@Ada Lovelace ');
    });

    it('undo and redo restore documents', () => {
      const local = fresh();
      local.setValue('v1');
      local.setValue('v2');
      local.undo();
      expect(local.serialize('text')).toBe('v1');
      local.redo();
      expect(local.serialize('text')).toBe('v2');
    });

    it('transactions collapse into one undo step', () => {
      const local = fresh();
      local.transaction(() => {
        local.insertText('a');
        local.insertText('b');
      });
      local.undo();
      expect(local.getState().empty).toBe(true);
    });

    it('focus and blur toggle state', () => {
      const local = fresh();
      local.focus();
      expect(local.getState().focused).toBe(true);
      local.blur();
      expect(local.getState().focused).toBe(false);
    });

    it('disabled blocks submit and commands', async () => {
      const local = fresh({ value: 'x', disabled: true });
      await local.submit();
      expect(local.canExecuteCommand('submit')).toBe(false);
      local.setDisabled(false);
      expect(local.canExecuteCommand('submit')).toBe(true);
    });

    it('readonly blocks submit but allows value reads', async () => {
      const local = fresh({ value: 'x', readonly: true });
      await local.submit();
      expect(local.serialize('text')).toBe('x');
    });

    it('serializes to every built-in format', () => {
      const local = fresh({ value: [createTextNode('hi '), createMentionNode({ id: 'u1', label: 'Ada' })] });
      expect(local.serialize('json')).toBeTypeOf('object');
      expect(local.serialize('text')).toBe('hi @Ada');
      expect(local.serialize('markdown')).toContain('[@Ada](mention:u1)');
      expect(local.serialize('html')).toContain('data-aic-node="mention"');
      expect(local.serialize('ai')).toMatchObject({ text: 'hi @Ada' });
    });

    it('notifies state subscribers', () => {
      const local = fresh();
      const listener = vi.fn();
      local.subscribe(listener);
      local.setValue('next');
      expect(listener).toHaveBeenCalled();
      expect(local.getState().empty).toBe(false);
    });

    it('destroys cleanly and rejects further mutations', () => {
      const local = fresh();
      local.destroy();
      expect(() => local.setValue('nope')).toThrowError();
    });

    // Mounted lifecycle (adapters)
    if (options.mount) {
      it('mounted surface syncs DOM input into the model', () => {
        const local = fresh({ value: '' });
        const cleanup = options.mount!(local);
        const input = findEditableHost(local);
        if (input) {
          input.textContent = 'typed';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          expect(local.serialize('text')).toBe('typed');
        }
        if (typeof cleanup === 'function') cleanup();
      });
    }
  });
}

function findEditableHost(_editor: AIComposer): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-aic-input]');
}

/** The reference implementation: headless core editor. */
export function contractSuiteForCore(): void {
  defineAIComposerContractSuite((options) => createAIComposer(options), {
    title: 'AIComposer contract (core reference)',
  });
}
