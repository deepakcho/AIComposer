/**
 * Mentions & commands — trigger-driven suggestion popups. The menu opens at
 * the caret where `@` / `/` was typed, flips to fit the viewport and never
 * takes layout space.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import {
  AIComposer,
  AIComposerInput,
  AIComposerSuggestions,
  useAIComposerState,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof AIComposer> = {
  component: AIComposer,
  tags: ['autodocs'],
  title: 'AI Composer/React/Mentions & Commands',
  parameters: {
    docs: {
      description: {
        component:
          'Triggers are plugin-provided: type `@` for people, `/` for commands. The popup is anchored to the caret (where the trigger key was hit), clamps into the viewport and flips sides when there is no room above. Arrow keys navigate, Enter/Tab accept, Escape dismisses.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AIComposer>;

export const MentionChips: Story = {
  name: 'Mention chips · initial value',
  args: {
    mode: 'chat',
    value: {
      nodes: [
        createTextNode('Review with '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' and '),
        createMentionNode({ id: 'u4', label: 'Margaret Hamilton' }),
        createTextNode(' please'),
      ],
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<AIComposer
  value={{
    nodes: [
      createTextNode('Review with '),
      createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
      createTextNode(' and '),
      createMentionNode({ id: 'u4', label: 'Margaret Hamilton' }),
      createTextNode(' please'),
    ],
  }}
/>`,
      },
    },
  },
};

export const MentionFlow: Story = {
  name: 'Interaction · type @, pick from popup',
  render: () => <EditorDemo />,
  parameters: {
    docs: {
      source: {
        code: `const [editor] = useState(() => createDemoEditor());
<AIComposer editor={editor} mode="chat" />`,
      },
      description: { story: 'Play function: types "Hello @ad", asserts the popup lists Ada Lovelace, accepts with Enter and checks the chip landed in the document.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, 'Hello @ad');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Ada Lovelace');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('textbox').textContent).toContain('@Ada Lovelace'),
    );
  },
};

export const CommandMenu: Story = {
  name: 'Interaction · slash commands',
  render: () => <EditorDemo />,
  parameters: {
    docs: {
      source: {
        code: `const [editor] = useState(() => createDemoEditor());
<AIComposer editor={editor} mode="chat" /> // type "/" for commands`,
      },
      description: { story: 'Play function: types "/", picks "Summarize" with ArrowDown + Enter.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '/');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Summarize');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('textbox').textContent).toContain('/Translate'),
    );
  },
};

export const CustomItemRenderer: Story = {
  name: 'Custom suggestion items',
  render: () => <CustomSuggestionsDemo />,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer editor={editor}>
  <div className="aic-body" data-aic-slot="body">
    <AIComposerInput suggestions={false} />
    <AIComposerSuggestions
      renderItem={(item, active) => (
        <span>
          <strong>{item.label}</strong>
          {item.description && <em> — {item.description}</em>}
          {active ? ' ◀' : ''}
        </span>
      )}
    />
  </div>
</AIComposer>`,
      },
      description: { story: 'Own the popup markup: `<AIComposerInput suggestions={false} />` + `<AIComposerSuggestions>` with a render prop. Positioning stays caret-anchored and viewport-aware.' },
    },
  },
};

function EditorDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor());
  return <AIComposer editor={editor} mode="chat" />;
}

function CustomSuggestionsDemo(): JSX.Element {
  const [editor] = useState(() => createDemoEditor());
  const state = useAIComposerState(editor);
  return (
    <AIComposer editor={editor}>
      <div className="aic-body" data-aic-slot="body">
        <AIComposerInput suggestions={false} />
        <AIComposerSuggestions
          renderItem={(item, active) => (
            <span>
              <strong>{item.label}</strong>
              {item.description && <em> — {item.description}</em>}
              {active ? ' ◀' : ''}
            </span>
          )}
        />
      </div>
      <div className="aic-footer" data-aic-slot="footer">
        <code>{state.suggestions.length} suggestions · query "{state.activeTrigger?.query ?? ''}"</code>
      </div>
    </AIComposer>
  );
}
