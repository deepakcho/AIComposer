import type { Preview } from '@storybook/react-vite';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import '@ai-composer/themes/css/dark.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0d0e12' },
      ],
    },
    docs: {
      description: {
        component:
          'AI Composer — a framework-agnostic prompt editor. This is the **React adapter** (`@ai-composer/react`). One engine (core), a DOM layer, and thin framework bindings.',
      },
    },
  },
};

export default preview;
