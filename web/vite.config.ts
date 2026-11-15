/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@/…` pointe vers `src/…` : évite les imports du type '../../../lib/x'.
    // Doit rester synchronisé avec `paths` dans tsconfig.app.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Vitest lit sa configuration ici : un seul fichier pour le build et les tests.
  test: {
    environment: 'jsdom', // DOM simulé dans Node
    setupFiles: ['./src/test/setup.ts'],
    css: false, // inutile de compiler Tailwind pendant les tests
    restoreMocks: true,
  },
});
