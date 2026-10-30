# 6e SEGPA — outils de technologie

Un dossier, plusieurs projets, **le même squelette** : l'élève retrouve les mêmes écrans et les mêmes boutons d'un projet
à l'autre. Hors ligne (`file://`), en français, aucun compte, rien d'envoyé ailleurs.

| Projet | Séances | État |
|---|---|---|
| Je démonte un objet technique (taille-crayon à manivelle) | 3 | jalons 1 à 4 faits (écrans élèves, outil professeur, évaluation et exports), recette avec Thomas |
| Course de voitures à ballon | 5 | jalons V1 à V4 faits (écrans élèves, essais, course au vidéoprojecteur, outil professeur), en ligne ; essais réels et critères à valider avec Thomas |
| Film en stop motion avec des briques | 5 | à venir |

Documents : `docs/CAHIER-DES-CHARGES-outils-6e-segpa.md` (socle commun), un brief par projet, `docs/PLAN.md`,
`docs/MAQUETTE.md` (écrans), `docs/sources/` (documents de Thomas pour le taille-crayon).

## Organisation

```
site/index.html            portail des élèves (une tuile par projet, aucun lien professeur)
site/professeur.html       page du professeur (non liée depuis le portail) : suivi de la classe, démonstration
site/commun/               le socle, écrit une fois : écrans élèves, sauvegarde, dossiers, caméra, voix, style, police Lexend
site/taille-crayon/        index.html (élèves), prof.html (professeur), js/ (écrans et tuiles propres), donnees/
                           (projet, classes, modèle, étapes), img/ (photos de Thomas)
site/voiture-ballon/       index.html (élèves), prof.html (professeur), course.html (vidéoprojecteur), css/univers.css
                           (Grand prix), js/ (essais, course, écrans), donnees/, documents/ (gabarits de carrosserie, SVG Cricut)
tests/                     npm test (moteur et données)
tools/                     serve.js (npm start), exemples-*.js (npm run exemples), recette.js (npm run recette),
                           gabarits/ (sources des gabarits de carrosserie)
```

Mode d'emploi du professeur : `LISEZ-MOI.md` · recette manuelle : `RECETTE.md` · recette automatique : `RECETTE-AUTO.md`.
