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

## 2026-11-16 (étape 4)

- **Fait :** étape 4, interface `ChronosApi`, générateur déterministe (400 clips, 3 sites, 24 caméras), recherche simulée et reclassement de Rocchio, persistance, export CSV pour R.
- **Appris :** une simulation trop parfaite ne teste rien : le bruit a été réglé (0,3) pour que la recherche soit utile mais imparfaite ; importer un fichier de test depuis un autre duplique ses tests.
- **Prochaine action :** étape 5, mise en page générale (en-tête, navigation, bandeau démo, aide des raccourcis).

## 2026-11-16 (étape 5)

- **Fait :** étape 5, mise en page (bandeau démo, en-tête, navigation), routes et page 404, limites d'erreur, raccourcis (registre + `useShortcut`), aide en `<dialog>` natif, états vide/chargement/erreur.
- **Appris :** une limite d'erreur sur la route parente masquerait l'en-tête : il faut la poser sur une route enfant « sans chemin » ; jsdom n'implémente pas `showModal()`.
- **Prochaine action :** étape 6, écran Recherche (TanStack Query, barre, éthogramme, grille de résultats).

## 2026-11-16 (étape 6)

- **Fait :** étape 6, TanStack Query + ApiProvider, écran Recherche (barre, éthogramme en index, grille de cartes par lots de 24), recherche dans l'adresse `?q=`, états vide/chargement/erreur/introuvable.
- **Appris :** des `<span>` collés donnent un nom accessible collé (« TOOLUsage ») ; une grille sans colonne explicite s'élargit au contenu le plus large et déborde en tablette.
- **Prochaine action :** étape 7, loupe et validation au clavier (J/K, Y/N/U).

## 2026-11-16 (étape 7)

- **Fait :** étape 7, loupe (lecteur simulé, frise agrandie, verdict, note, métadonnées), validation au clavier J/K/Y/N/U/P/Échap avec passage automatique, mise à jour optimiste avec retour en arrière, compteur de session, clip ouvert dans l'adresse.
- **Appris :** des enregistrements qui se chevauchent imposent de ne relire le cache qu'après le dernier ; un « bouton étiré » rend une carte entière cliquable avec un seul élément focalisable.
- **Prochaine action :** étape 8, reclassement animé (« Apprendre de mes validations », Motion).

## 2026-11-16 (étape 8)

- **Fait :** étape 8, reclassement animé avec Motion (cartes qui glissent, entrées/sorties en fondu, balayage phosphore, indicateurs ↑ ↓ nouveau), bouton + touche R, annonce pour lecteurs d'écran, mouvement réduit respecté.
- **Appris :** une `key` qui change recrée les composants et empêche toute animation de déplacement ; une animation se vérifie mieux en mesurant les positions dans le temps qu'avec des captures trop lentes.
- **Prochaine action :** étape 9, écran Session & export (tableau, aperçu et téléchargement du CSV, horloge 24 h).
