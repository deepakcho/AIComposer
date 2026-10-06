import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Editor theme (tokens + structure + dark override). The dark override is
// inert until an ancestor sets data-aic-theme="dark" — which the site
// toggle does on <html>.
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import '@ai-composer/themes/css/dark.css';
import './styles/site.css';
import './styles/templates.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
