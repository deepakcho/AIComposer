/**
 * Mentions & commands — caret-anchored popup triggers.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { demoEditor } from './utils';

const meta: Meta = {
  tags: ['autodocs'],
  title: 'AI Composer/Angular/Mentions & Commands',
  parameters: {
    docs: {
      description: {
        component:
          'Type `@` for people, `/` for commands. The popup opens at the caret, clamps into the viewport, flips when there is no room above; Arrow keys navigate, Enter/Tab accept, Escape dismisses.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const editorStory = (placeholder = 'Ask anything…') => ({
  props: { editor: demoEditor({ mode: 'chat', placeholder }) },
  template: `<aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor>`,
});

export const MentionFlow: Story = {
  name: 'Interaction · type @, pick from popup',
  render: () => editorStory(),
  parameters: {
    docs: {
      source: {
        code: `@Component({
  template: \`<aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor>\`,
})
class Demo {
  editor = createPromptEditor({
    plugins: [mentionPlugin({ items: people })],
  });
}`,
      },
      description: { story: 'Play function: types "@ad", asserts the popup lists Ada Lovelace, accepts with Enter.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '@ad');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Ada Lovelace');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('@Ada Lovelace'));
  },
};

export const CommandMenu: Story = {
  name: 'Interaction · slash commands',
  render: () => editorStory(),
  parameters: {
    docs: {
      source: { code: `<aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor> <!-- type / -->` },
      description: { story: 'Play function: types "/", picks the second command with ArrowDown + Enter.' },
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
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('/Translate'));
  },
};
