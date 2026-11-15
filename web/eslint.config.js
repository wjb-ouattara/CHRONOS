// Configuration ESLint au format « flat » (ESLint 9).
// Chaque élément du tableau est une couche ; les couches suivantes peuvent
// surcharger les précédentes.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Fichiers générés : jamais analysés.
  globalIgnores(['dist', 'coverage']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Règles « typées » : ESLint interroge le compilateur TypeScript,
      // ce qui détecte par ex. les promesses oubliées (no-floating-promises).
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Trouve automatiquement le tsconfig qui couvre chaque fichier.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Fichiers JS de configuration (comme celui-ci) : pas de règles typées.
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // Toujours en dernier : désactive les règles de style qui entreraient
  // en conflit avec Prettier (Prettier s'occupe seul de la mise en forme).
  prettier,
]);
