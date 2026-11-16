# Journal de bord

Trois lignes par session : fait, appris, prochaine action.

## 2026-11-15

- **Fait :** étape 1, initialisation de `web/` (Vite 8, React 19, TypeScript 6.0 strict, Tailwind v4, ESLint 9, Prettier, Vitest).
- **Appris :** typescript-eslint ne supporte pas encore TypeScript 7 et jsx-a11y pas encore ESLint 10, d'où les versions fixées.
- **Prochaine action :** étape 2, tokens de design, typographie, thèmes et page `/design`.

## 2026-11-16

- **Fait :** étape 2, tokens à trois niveaux (palette → thème → Tailwind), thèmes sombre/clair, polices auto-hébergées, page `/design`, test automatique des contrastes AA.
- **Appris :** `@theme inline` permet d'imbriquer un thème dans un autre ; Tailwind ne détecte que les classes écrites en entier dans le code.
- **Prochaine action :** étape 3, composants de base (bouton, champ, badge de verdict, bande caméra-piège, frise de pertinence, vignette procédurale).

## 2026-11-16 (suite)

- **Fait :** étape 3, contrat `types.ts` (avec SearchResponse, heure locale, species), composants Button, TextField, VerdictBadge, CameraStrip, RelevanceTimeline, ProceduralThumbnail, galerie sur `/design`.
- **Appris :** un `--fix` ESLint peut casser la compilation (assertion jugée inutile) : toujours relancer `typecheck` et `build` après ; `new Date()` décalerait l'heure des caméras.
- **Prochaine action :** étape 4, générateur déterministe de données fictives et API fictive.
