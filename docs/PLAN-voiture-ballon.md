# Plan court — Course de voitures à ballon (6e SEGPA)

Version 1 · 28/10/2026 · **à valider par Thomas avant d'écrire du code**. À lire avec `BRIEF-CLAUDE-CODE-voiture-ballon.md`
(proposition d'origine) et `PLAN.md` (organisation du dépôt, socle commun).

## 1. Décisions de Thomas (28/10/2026)

| Sujet | Décision |
|---|---|
| Séances | 4 (S1 je prépare · S2 je construis · S3 je teste et j'améliore · S4 la course) |
| Châssis | **imprimé en 3D par Thomas**, fourni dans le kit (`Ch_ssis_voiture_ballon.stl` : 150 × 80 mm, trous d'axe Ø 3,5 mm à 6 mm de haut, entraxe 99 mm, tube du ballon Ø 15 mm avec collerette Ø 20 mm, tuyère Ø 4 mm vers l'arrière) |
| Axes | piques à brochettes **Ø 3 mm**, coupées par le professeur (≈ 11 cm) ; elles tournent librement dans le châssis |
| Roues | imprimées en 3D par Thomas : **Ø 20, 30, 40 et 50 mm**, trou serré sur la pique |
| Ballon | ballon + élastique sous la collerette ; **gonflé à la pompe** (personne ne souffle) ; allergies au latex vérifiées par Thomas (rien dans l'outil) |
| Kit par binôme | châssis, 2 piques, plusieurs roues (20 à 50 mm), élastique, ballons |
| En libre accès | carton, scotch, feuilles de couleur |
| Outils | ciseaux ; **pistolet à colle chaude uniquement avec le professeur** |
| Mesure | mètre ruban |
| Piste | longueur et nombre de couloirs **pas encore connus** : fixés après les essais de la séance 3 (l'outil propose une longueur) |
| Classement | ordre d'arrivée ; **n'entre pas** dans l'évaluation |
| Questions | réponses **toujours écrites** (comme le taille-crayon) |

## 2. Dans le dépôt

```
site/voiture-ballon/
  index.html (élèves) · prof.html · course.html (vidéoprojecteur)
  js/ecrans.js        écrans propres : nom et couleur, mon matériel, fabrication, essai, graphique, course
  js/prof-projet.js   tuiles, repères, onglet Essais
  donnees/            projet.js · classes.js · etapes.js · materiel.js · fabrication.js · changements.js · piste.js · criteres.js
  img/                photos de Thomas (modèle fini, étapes de fabrication), pictogrammes
```
Dossier réseau : `… › 6A › COMMUN › TECHNOLOGIE › Voiture-ballon` (comme `Taille-crayon`). Couleur du projet : **sarcelle**
(`#0F766E`), pour ne pas se confondre avec l'ambre des écarts ni le violet de l'aide. Le socle commun est repris tel quel.

## 3. Les écrans (une chose par écran)

**S1 — Je prépare ma voiture**
1. Règles du matériel (« J'ai compris ») : *Je coupe avec les ciseaux, doucement.* · *La colle chaude, seulement avec le professeur.* ·
   *Je compte mon matériel.* · *Je range avant de partir.* (textes à valider)
2. Notre voiture : **nom** (cartes de noms amusants ou « J'écris un nom ») puis **couleur d'équipe** (6 grosses pastilles avec leur nom).
3. Je regarde le modèle : photo de la voiture finie (à prendre par Thomas ; pictogramme en attendant).
4. Mon matériel : une carte par pièce du kit (châssis, piques, roues, élastique, ballon) avec « J'ai pris … » au pavé numérique.
5. Photo des pièces sur la table · rangement (cases + photo).

**S2 — Je construis ma voiture** — fiche de fabrication, une étape par écran, avec photo de Thomas. *Proposition à valider :*
1. Je passe une pique dans les trous de devant. 2. J'enfonce une roue de chaque côté. 3. Je vérifie : la roue tourne.
4. Même chose derrière. 5. J'enfile le ballon sur le tube. 6. Je serre l'élastique sous le rebord. 7. 📷 Ma voiture sans décoration.
8. Je décore ma voiture (carton, feuilles de couleur, scotch). 9. 📷 Ma voiture décorée. Puis rangement + photo de la voiture à sa place.
Écran d'aide **« Ma voiture ne roule pas »** : 3 pictos de causes (une roue frotte · le ballon fuit · la voiture est trop lourde) → renvoi
à l'étape de fabrication concernée, sans donner la solution.

**S3 — Je teste et j'améliore** — de 3 à 5 essais ; pour chaque essai : je pose la voiture sur la ligne · je gonfle le ballon avec la
pompe · je lâche · 📏 je mesure (pavé, en cm, unité toujours affichée ; un résultat 10 fois plus grand que les autres → « Mesure encore une
fois ? » en ambre) · ma voiture roule : tout droit / à gauche / à droite · **je change UNE chose** avant l'essai suivant.
Cartes « je change une chose » (*à valider*) : **les roues** (20 · 30 · 40 · 50 mm) · **le ballon** (plus ou moins gonflé : nombre de coups de
pompe) · **le poids** (j'enlève ou j'ajoute de la décoration). Deux cartes choisies → « Choisis un seul changement » en ambre.
Mon graphique : une barre épaisse par essai, la distance écrite en grand, le picto du changement dessous. 📷 avant / après.

**S4 — La course** — « Ma voiture est prête » · règles de la course (*la piste reste libre · je lâche au signal · je ne pousse pas
la voiture*) · écran d'attente « Regarde la piste ! » · **mon résultat** (lu dans `course.json` du dossier du projet ; message
encourageant quel que soit le rang ; sinon « Le professeur te donnera ton résultat ») · **Pourquoi ma voiture avance ? (réponse écrite)** ·
mon bilan (smileys) · 📷 photo finale.

## 4. Outil professeur

- **Socle repris** : suivi en direct, aide, fiche d'équipe, évaluation, exports (Excel, CSV, Carnet, feuilles ceinture), différenciation.
- Tuile : nom et couleur de la voiture, essai en cours, meilleure distance, nombre de changements, matériel pris, « prête ».
- Onglet **Essais** : tableau et graphique des essais, changements faits, directions.
- **Longueur de piste proposée** d'après les distances mesurées en S3 (par exemple un peu moins que la distance médiane, pour que la
  plupart des voitures arrivent au bout) : le professeur la garde ou la change.
- **`course.html`** (vidéoprojecteur) : manches de 2 à 4 voitures (nombre de couloirs choisi le jour même), **Top départ**, un gros bouton
  par couloir quand la voiture passe la ligne (place + temps indicatif) ; mode « distance » en option ; podium, classement général,
  record de la classe, « Bravo à tous » ; résultats écrits dans `course.json` + CSV ; diplôme de pilote N&B (facultatif).

## 5. Évaluation (proposition du brief, à valider)

Même grille à 4 niveaux et même note /20 que le taille-crayon. Les 7 critères du brief §5 : suit la fiche de fabrication · respecte les
règles du matériel · voiture terminée et qui fonctionne · teste, change une seule chose, re-teste · mesure avec le bon outil et écrit
l'unité · explique pourquoi sa voiture avance (**à l'écrit**) · autonomie / binôme. Le classement de la course n'entre pas dans la note.

## 6. Jalons (recette avec Thomas après chacun)

| Jalon | Contenu |
|---|---|
| V1 | données + écrans S1 et S2 (nom, couleur, matériel, fabrication, « ma voiture ne roule pas ») |
| V2 | S3 : essais, mesures, « je change une chose », graphique |
| V3 | S4 et `course.html` (manches, chrono, podium, `course.json`, résultat côté élève) |
| V4 | outil professeur : tuiles, onglet Essais, longueur de piste proposée, évaluation et exports |
| V5 | recette automatique, essai réel (piste, mètre ruban, vraies voitures), publication |

## 7. À valider ou à fournir avant de coder

1. Les **textes des règles** (S1) et des **règles de la course** (S4) ci-dessus.
2. La **fiche de fabrication** (S2) : les étapes proposées, et plus tard **une photo par étape** (sinon pictogramme).
3. Les **cartes « je change une chose »** : roues · gonflage · poids — à garder, retirer ou compléter.
4. Les **noms de voitures amusants** proposés (je peux en proposer 12) et les **6 couleurs d'équipe**.
5. Les **7 critères** et leur rattachement au cycle 3 (je proposerai le tableau comme pour le taille-crayon), et la **ceinture** : quel critère
   (proposition : « Voiture terminée et qui fonctionne ») ?
6. Le résultat de vos **essais de châssis** (distance, tuyère de 4 mm suffisante ?) — pour régler l'alerte « 10 fois plus grand ».
