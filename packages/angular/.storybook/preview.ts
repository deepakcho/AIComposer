import type { Preview } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AI_COMPOSER_IMPORTS } from '../src';

const preview: Preview = {
  decorators: [moduleMetadata({ imports: [...AI_COMPOSER_IMPORTS] })],
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
