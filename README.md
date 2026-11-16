# Chronos Ethogram

Outil d'aide aux chercheurs en écologie comportementale pour **retrouver, valider et exporter des
comportements animaux** dans de grandes collections de vidéos de caméras pièges.

> Décrivez le comportement que vous cherchez. Chronos vous montre où il apparaît dans toutes vos
> vidéos, vous validez, et vous repartez avec un tableau prêt pour R.

Parcours : chercher → voir l'instant clé de chaque clip → valider (oui / non / incertain) →
reclasser à partir des validations → exporter un CSV.

## État du projet

**Phase 0.5 : prototype d'interface web** (`web/`), entièrement sur **données fictives**. Pas de
backend, de base de données ni de modèle d'IA pour l'instant. Voir [web/README.md](web/README.md).

## Données et licence

- Les données de référence prévues (jeu PanAf20K) sont sous **licence non commerciale**. Elles ne
  sont **pas** distribuées avec ce dépôt.
- Aucune vidéo, image ou extrait réel n'est versionné (`data/` et les médias sont dans
  `.gitignore`). Les vignettes de l'interface sont générées procéduralement.
- Toutes les données affichées par le prototype sont fictives et signalées comme telles.

## Organisation

```
chronos/
├── docs/JOURNAL.md
└── web/           # prototype d'interface (phase 0.5)
```
