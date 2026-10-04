import type { Preview } from '@storybook/angular';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'AI Composer — **Angular adapter** (`@ai-composer/angular`). Standalone components, signals, content projection and ControlValueAccessor; one shared engine.',
      },
    },
  },
};

export default preview;
