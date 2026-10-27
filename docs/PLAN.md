# Plan court — dépôt SEGPA, premier projet : le taille-crayon

Version 2 · 27/10/2026 · **validé par Thomas le 27/10/2026** (plan, organisation du dépôt). Maquette : `docs/MAQUETTE.md`.

## 0. Ce qui change par rapport au cahier des charges

**Décision de Thomas (27/10/2026)** : un seul dépôt **`Anlito/segpa`** (« dossier SEGPA ») regroupe les projets, au lieu
des trois dépôts du §0 (`demontage-taille-crayon`, `course-voiture-ballon`, `stop-motion-briques`).

Conséquence : le socle commun (cahier des charges §3, §6, §7, §8) est écrit **une seule fois**, dans `site/commun/`.
Chaque projet ne contient que ses données, sa charte et ses écrans propres. Un correctif du socle profite aux trois
projets d'un coup ; « un élève qui change de projet retrouve les mêmes écrans » (§13) est garanti par construction.

Ce qui reste séparé par projet : les **clés de stockage** du navigateur (préfixe = identifiant du projet), le nom
d'application dans les sauvegardes, le dossier réseau, la charte (couleur d'accent), les exports.

## 1. Arborescence

```
segpa/
├── CLAUDE.md, README.md, LISEZ-MOI.md (mode d'emploi du professeur)
├── docs/                       cahier des charges, briefs, ce plan, documents de Thomas (docs/sources/)
├── site/                       ← publié tel quel (GitHub Pages) et copié sur le réseau ; marche en file://
│   ├── index.html              portail « 6e SEGPA » : une grande tuile par projet (élève / professeur)
│   ├── commun/                 LE SOCLE (identique pour tous les projets)
│   │   ├── css/socle.css       mise en page du squelette, lisibilité (§4), tokens de couleur
│   │   ├── polices/            Lexend (licence OFL), en local
│   │   ├── sons/               déclic, confirmation (coupables)
│   │   └── js/
│   │       ├── outils.js       nomEquipe, simplifierNom, remplirChemin… (repris du noyau Labo Blocs, sans Labo Blocs)
│   │       ├── moteur/sauvegarde.js   création, lecture, versions, rubriques par séance (≈ progression.js)
│   │       ├── moteur/etapes.js       séances → écrans, états fait / en cours / à faire, avancement
│   │       ├── moteur/evaluation.js   niveaux 0-3 → score /21 → note /20 → appréciation → ceinture ; export Carnet
│   │       ├── moteur/classe.js       fusion des fichiers, tuiles, alertes, CSV
│   │       ├── moteur/xlsx.js         export Excel sans bibliothèque (étendu : couleurs, formules, listes)
│   │       ├── session.js, fichiers.js        repris d'atelier-cereales
│   │       ├── camera.js       webcam (choix, mémorisation par poste, messages en français) ← prof-dessins.js
│   │       ├── voix.js         lecture à voix haute (bouton masqué sans voix française)
│   │       ├── ecrans/         accueil, mission, etape, photo, album, rangement, bilan, bravo, pave-numerique, minuteur
│   │       └── prof/           prof.js (accueil, classe, équipe, album, évaluation, historique, exports)
│   ├── taille-crayon/
│   │   ├── index.html, prof.html
│   │   ├── css/charte.css      identité visuelle du projet (Claude Design)
│   │   ├── img/                pictogrammes, images de l'ouverture
│   │   ├── js/                 écrans propres : tableau des pièces, mesure S2, tableau à l'envers, questions
│   │   └── donnees/            projet.js, etapes.js, modele.js, regles.js, rangement.js, criteres.js, classes.js, college.js
│   ├── voiture-ballon/         (plus tard)
│   └── stop-motion/            (plus tard)
├── tests/                      node:test : sauvegarde, étapes, évaluation, exports Carnet et Excel, données
└── tools/                      serve.js, recette.js, exemples-equipes.js, archive.js (un zip par projet, socle inclus)
```

Les pages d'un projet chargent `../commun/js/…` puis `donnees/…` : scripts classiques, aucun module, aucune construction.
Sur le réseau, on copie `site/` (ou le zip du projet, qui contient `commun/` + le projet).

## 2. Ce qui est repris d'`atelier-cereales` (lu le 27/10/2026)

| Fichier d'atelier-cereales | Dans segpa | Remarque |
|---|---|---|
| `session.js`, `fichiers.js` | `commun/js/` | presque tels quels ; clés `atelier-cereales-*` → `<projet>-*` lues dans `projet.js` |
| `moteur/progression.js` | `commun/js/moteur/sauvegarde.js` | **ne peut pas être repris tel quel** : il s'appuie sur le noyau Labo Blocs (`LB.creerSauvegarde`, `relierParcours`, exercices). On garde le principe (un objet, `APPLICATION`, version, lecture des anciens formats) avec des rubriques par séance |
| `moteur/classe.js` | `commun/js/moteur/classe.js` | fusion et « plus récent gagne » gardés ; tableau d'exercices remplacé par les tuiles |
| `moteur/xlsx.js` | `commun/js/moteur/xlsx.js` | **à étendre** : il n'écrit aujourd'hui que des valeurs et un en-tête gras ; l'Excel d'évaluation demande couleurs, formules, listes déroulantes, ligne d'exemple grise |
| `prof-dessins.js` | `commun/js/camera.js` | la partie webcam (choix de la caméra, enregistrement .jpg dans le dossier de l'équipe) |
| `accueil.js` | `commun/js/ecrans/accueil.js` | réécrit : boutons-prénoms (`classe.json`), repli clavier |
| `prof.js` / `prof.html` / `prof.css` (961 lignes) | `commun/js/prof/` | simplifié : pas de barème à pénalités, pas de parcours, pas de carnet à types |
| `tools/serve.js`, `archive.js`, `recette.js`, `tests/outils.js`, `pages.yml` | idem | adaptés à plusieurs projets |
| `LB.nomEquipe`, `simplifierNom`, `remplirChemin` | `commun/js/outils.js` | petites fonctions recopiées du noyau Labo Blocs (pas de dépendance à Labo Blocs) |
| `LB.resultatsClasse` (export Carnet) | `commun/js/moteur/evaluation.js` | même forme `labo-blocs/resultats` v1, à vérifier contre `gestion-de-classe-et-suivi-projet › js/labo-blocs.js` |

Non repris : `exercices.js`, `mise-a-jour.js`, `notation.js`, `carnet*.js`, `catalogue.js`, `parcours-source.js`, `tuto*`, `carte-virtuelle.js`.

## 3. Formats

**Sauvegarde** `Prénom_Prénom.json` (dossier `Bureau › Classe › 6A › COMMUN › TECHNOLOGIE › Taille-crayon › Prénom_Prénom`, photos dans `photos/`) :

```js
{
  application: 'segpa', projet: 'taille-crayon', formatVersion: 1,
  equipe: { eleves: ['Léa', 'Tom'], classe: '6A' }, creeLe, modifieLe,
  seances: {
    s1: { etapes: { 'regle-1': { fait: '2026-11-03T10:12' } , … },
          pieces: [{ numero: 1, photo: 'photos/s1-piece-01.jpg', nom: 'Manivelle', autreNom: null, rangee: true }],
          photos: [{ fichier, legende, etape, date }], rangement: { … }, bilan: { … } },
    s2: { mesures: [{ piece: 'corps', longueur: 7.5, essais: [7.2, 7.5], dehors: 1 }], … },
    s3: { remontage: [...], verifications: {...}, reponses: [{ question, mode: 'carte'|'texte'|'photo'|'oral', valeur }] }
  },
  aides: [{ date, etape, resolue: false }],
  observations: {},                 // calculées pour le professeur, jamais un niveau
  evaluation: null                  // écrite seulement par l'outil professeur (fichier à part, voir §5)
}
```

Règles : jamais d'écrasement, ancienne version toujours lisible (fonction `mettreAJour(donnees)` par version), le `.json`
ne contient jamais d'image.

**Données du projet** : `definirProjet({ id, titre, dossier, accent, seances })`, `definirEtapes({ s1: [ { id, type, texte, picto, duree } … ] })`
où `type` ∈ `consigne · regle · photo · cartes · pave · cases · rangement · bilan` (+ types propres : `piece`, `mesure`,
`tableau-envers`, `question`), `definirModele({ pieces: [...], plages: { corps: [min, max], manivelle: [min, max] } })`,
`definirCriteres([...7 critères, compétence…])`.

**Évaluation du professeur** : gardée dans un fichier `evaluation-<classe>.json` du dossier du projet (pas dans le
fichier des élèves, qui l'écrivent au même moment) + copie dans le navigateur du professeur.

## 4. Découpage en jalons (recette avec Thomas après chacun)

| Jalon | Contenu | Recette |
|---|---|---|
| **J1 — Socle élève** ✓ 27/10 | portail, accueil (boutons-prénoms), ma mission, écran d'étape, 🔊, 🙋, minuteur, photo, album, rangement, bilan, bravo, sauvegarde ; données de la **séance 1** | essai sur un poste du collège : **webcam, voix française, droits d'écriture du dossier réseau** |
| **J2 — Taille-crayon complet** | ouverture S1, tableau des pièces, S2 (pièces dehors, pavé, vérification douce), S3 (tableau à l'envers, questions, bilan) | parcours complet d'une équipe fictive |
| **J3 — Outil professeur** | classe (tuiles, alertes 🙋 et « plus de 2 pièces dehors »), équipe (bilan, album, historique), onglet Séance 2, drapeaux de différenciation | suivi en direct avec 2 postes |
| **J4 — Évaluation et exports** | grille 7 critères, observations, note /20, ceinture, Excel (4 onglets + Pronote), Carnet de classe, CSV, feuille ceinture N&B, album A4 | Excel ouvert dans Excel/LibreOffice, fichier relu par le Carnet |
| **J5 — Recette et publication** | `npm run recette` (caméra simulée, 1366×768 et 1920×1080, file:// et serveur), zip, GitHub Pages, fiche sur anlito.github.io | essai réel avec un vrai taille-crayon |

Puis voiture à ballon, puis stop motion, chacun avec son propre plan court.

Tests `node:test` à chaque jalon (CLAUDE.md).

## 5. Décisions et ce qu'il reste à obtenir

**Réglé le 27/10/2026**
- Dépôt `Anlito/segpa` créé ; plan validé.
- Documents sources reçus, rangés dans `docs/sources/` (fiche élève, introduction, préparation, grille d'évaluation).
- Pas de maquette Claude Design : Claude propose la maquette (`docs/MAQUETTE.md`), à valider par Thomas.
- Classe : **6A**. Dossier réseau : même structure, nom de dossier projet simplifié → `… › 6A › COMMUN › TECHNOLOGIE › Taille-crayon`
  (de même `Voiture-ballon`, `Stop-motion` plus tard). `donnees/classes.js` : `definirReglagesAtelier({ classes: ['6A'], cheminProjet: ['Taille-crayon'] })`.

**Relevé dans les documents reçus** (complète le §7 du brief)
- La préparation enseignant reçue a bien ses 4 objectifs (le 3e est « Suivre une procédure dans l'ordre, puis dans l'ordre
  inverse ») : le constat 1 du brief ne s'applique plus.
- Grille Excel : la ligne 3 (élève n° 1) contient des couleurs et entre dans la synthèse ; la « ligne Ex. » annoncée par la
  légende n'existe pas. L'export de l'outil ajoute une vraie ligne d'exemple grise hors synthèse (cahier des charges §8.5).
- Synthèse : les pourcentages divisent par 16 en dur (`=B8/16`) ; l'export divisera par le nombre d'élèves évalués.
- Les pictogrammes du PowerPoint ressemblent à ceux de Font Awesome (licence libre avec attribution) : l'outil dessine ses
  propres pictogrammes, dans le même esprit.

**Bloquant pour J2** (questions du brief §9) : modèle exact du taille-crayon, liste et noms des pièces, longueurs de
référence du corps et de la manivelle ; les 3 phrases-cartes « À quoi sert la manivelle ? ».

**Bloquant pour J4** : noms et couleurs des 4 ceintures et règle exacte ; validation du rattachement critères → compétences
(cahier des charges §8.4).

**Non bloquant** : postes fixes ou portables, fiches papier gardées ou non.
