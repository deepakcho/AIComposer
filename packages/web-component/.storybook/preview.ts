import type { Preview } from '@storybook/web-components-vite';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import '@ai-composer/themes/css/dark.css';
// Register <ai-composer-editor> for every story.
import '@ai-composer/web-component';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'AI Composer — **universal `<ai-composer-editor>` custom element** (`@ai-composer/web-component`). Works in React, Angular, Vue, Svelte or plain HTML/JS.',
      },
    },
  },
};

export default preview;
