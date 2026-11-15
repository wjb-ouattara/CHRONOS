# Chronos Ethogram — interface web (phase 0.5)

Prototype d'interface sur **données fictives** (aucun backend).

## Prérequis

Node.js `^20.19` ou `>=22.12` (voir `.nvmrc`).

## Commandes

| Commande               | Rôle                                             |
| ---------------------- | ------------------------------------------------ |
| `npm install`          | Installe les dépendances                         |
| `npm run dev`          | Serveur de développement (http://localhost:5173) |
| `npm run build`        | Vérifie les types puis construit dans `dist/`    |
| `npm run preview`      | Sert le build de production localement           |
| `npm run lint`         | ESLint (zéro avertissement toléré)               |
| `npm run typecheck`    | Vérification TypeScript                          |
| `npm run test`         | Tests Vitest (une passe)                         |
| `npm run test:watch`   | Tests en continu                                 |
| `npm run format`       | Met en forme le code avec Prettier               |
| `npm run format:check` | Vérifie la mise en forme sans modifier           |

## Structure de `src/`

| Dossier              | Contenu                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `app/`               | Composant racine, routage, fournisseurs (thème, TanStack Query)      |
| `pages/`             | Un fichier par écran (Recherche, Session, Collection, Design)        |
| `components/ui/`     | Composants génériques (bouton, champ…)                               |
| `components/domain/` | Composants métier (bande caméra-piège, frise de pertinence…)         |
| `domain/`            | Contrat de données `types.ts` : source de vérité partagée avec l'API |
| `mocks/`             | Générateur déterministe de données fictives                          |
| `api/`               | API fictive (à remplacer par la vraie API en phase 4)                |
| `lib/`               | Utilitaires, dont l'unique accès à `localStorage`                    |
| `content/`           | Textes de l'interface, centralisés                                   |
| `styles/`            | CSS Tailwind et tokens de design (`@theme`)                          |
| `test/`              | Configuration des tests                                              |

## Versions fixées volontairement

- **TypeScript 6.0** et non 7 : typescript-eslint ne supporte pas encore TypeScript 7.
- **ESLint 9** et non 10 : eslint-plugin-jsx-a11y ne supporte pas encore ESLint 10.
