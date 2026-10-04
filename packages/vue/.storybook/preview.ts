import type { Preview } from '@storybook/vue3-vite';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'AI Composer — **Vue 3 adapter** (`@ai-composer/vue`). Composition API, `v-model`, slots; one shared engine.',
      },
    },
  },
};

export default preview;
