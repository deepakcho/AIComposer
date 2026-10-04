import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import './style.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
