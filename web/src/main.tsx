import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import '@/styles/index.css';

const rootElement = document.getElementById('root');
// Plutôt qu'un `!` qui ferait taire TypeScript, on échoue avec un message clair.
if (!rootElement) throw new Error('Élément #root introuvable dans index.html');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
