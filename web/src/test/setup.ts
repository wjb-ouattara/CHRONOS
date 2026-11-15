// Exécuté avant chaque fichier de test (voir `test.setupFiles` dans vite.config.ts).
// Ajoute les assertions DOM : toBeInTheDocument(), toHaveTextContent()…
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Démonte les composants rendus entre deux tests pour qu'ils restent isolés.
afterEach(() => {
  cleanup();
});
