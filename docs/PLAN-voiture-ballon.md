# Plan court — Course de voitures à ballon (6e SEGPA)

Version 2 · 29/10/2026 · **validé par Thomas** (avec ses retours : 5 séances, photo officielle, poules et finales). À lire avec `BRIEF-CLAUDE-CODE-voiture-ballon.md`
(proposition d'origine) et `PLAN.md` (organisation du dépôt, socle commun).

## 1. Décisions de Thomas (28/10/2026)

| Sujet | Décision |
|---|---|
| Séances | **5** (S1 je prépare · S2 je construis · S3 je décore · S4 je teste et j'améliore · S5 la course), une 6ᵉ facultative « J'améliore encore » avant la course ; le nombre de séances est un réglage des données |
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
| Photos | webcam à chaque moment clé, dont une **photo officielle** de la voiture décorée (page de course, podium, diplôme) |
| Course | **poules** (selon le nombre de couloirs du jour), puis **finales par niveau** : principale, secondaire, tertiaire ; personne n'est éliminé, chaque voiture court au moins deux fois |
| Univers graphique (29/10) | **A · Grand prix** (maquette https://claude.ai/artifact/A4HWMn9pWPbUaaCAnS7igQ) : bitume, damier, bordures orange et blanches, stands numérotés ; `css/univers.css`, le socle n'est pas touché |
| Carrosserie (29/10) | séance 3 : **carrosserie en carton** fixée dans les **fentes** du châssis v5 (7 fentes 20 × 2 mm, carton 1,6 mm), plus basse que le tube du ballon (40 mm) ; à partir d'un **gabarit imprimé** : 4 pièces ou patron à plier (`documents/`, sources `tools/gabarits/`), version choisie après les essais de Thomas |

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

**S3 — Je fabrique ma carrosserie** (29/10) : règles (colle, ciseaux) · je pose le gabarit sur le carton · je trace autour au crayon ·
je découpe · je plie · j'enfonce les languettes dans les fentes · je vérifie : les roues tournent · je décore (20 min, léger) ·
vérification (roues, carrosserie qui tient, ballon et sortie d'air libres) · 📷 **photo officielle** · rangement. Photos de Thomas :
`img/carrosserie/1.jpg` à `5.jpg`.

**S2 — Je construis ma voiture** — fiche de fabrication, une étape par écran, avec photo de Thomas. *Proposition à valider :*
1. Je passe une pique dans les trous de devant. 2. J'enfonce une roue de chaque côté. 3. Je vérifie : la roue tourne.
4. Même chose derrière. 5. J'enfile le ballon sur le tube. 6. Je serre l'élastique sous le rebord. 7. 📷 Ma voiture sans décoration.
Puis rangement + photo de la voiture à sa place (la décoration est la séance 3).
Écran d'aide **« Ma voiture ne roule pas »** : 3 pictos de causes (une roue frotte · le ballon fuit · la voiture est trop lourde) → renvoi
à l'étape de fabrication concernée, sans donner la solution.

**S4 — Je teste et j'améliore** (fait le 29/10, `js/essais.js` + `js/ecran-essais.js`) — règles (pompe, piste libre, une chose à la
fois) · « Quelles roues sont sur ma voiture ? » (une fois) · de 3 à 5 essais ; pour chaque essai : je pose la voiture sur la ligne · je gonfle le ballon avec la
pompe · je lâche · 📏 je mesure (pavé, en cm, unité toujours affichée ; un résultat 10 fois plus grand que les autres → « Mesure encore une
fois ? » en ambre) · ma voiture roule : tout droit / à gauche / à droite · **je change UNE chose** avant l'essai suivant.
Cartes « je change une chose » (*à valider*) : **les roues** (20 · 30 · 40 · 50 mm) · **le ballon** (plus ou moins gonflé : nombre de coups de
pompe) · **le poids** (j'enlève ou j'ajoute de la décoration). Deux cartes choisies → « Choisis un seul changement » en ambre.
Mon graphique : une barre épaisse par essai, la distance écrite en grand, le picto du changement dessous. 📷 avant / après.

**S5 — La course** — « Ma voiture est prête » · règles de la course (*la piste reste libre · je lâche au signal · je ne pousse pas
la voiture*) · écran d'attente « Regarde la piste ! » · **mon résultat** (lu dans `course.json` du dossier du projet ; message
encourageant quel que soit le rang ; sinon « Le professeur te donnera ton résultat ») · **Pourquoi ma voiture avance ? (réponse écrite)** ·
mon bilan (smileys) · 📷 photo finale.

## 4. Outil professeur

- **Socle repris** : suivi en direct, aide, fiche d'équipe, évaluation, exports (Excel, CSV, Carnet, feuilles ceinture), différenciation.
- Tuile : nom et couleur de la voiture, essai en cours, meilleure distance, nombre de changements, matériel pris, « prête ».
- Onglet **Essais** : tableau et graphique des essais, changements faits, directions.
- **Longueur de piste proposée** d'après les distances mesurées en S3 (par exemple un peu moins que la distance médiane, pour que la
  plupart des voitures arrivent au bout) : le professeur la garde ou la change.
- **`course.html`** (vidéoprojecteur) : le professeur choisit le nombre de couloirs du jour (2 à 4).
  1. **Poules** : l'outil répartit les voitures (ex. 8 voitures, 4 couloirs → 2 poules de 4 ; 3 couloirs → poules de 3, 3 et 2) ; le
     professeur peut déplacer une voiture. **Top départ**, un gros bouton par couloir quand la voiture passe la ligne (place + temps
     indicatif) ; une voiture qui n'arrive pas : distance mesurée.
  2. **Classement des poules** : place dans la poule, puis temps ; les voitures qui n'arrivent pas, à la distance.
  3. **Finales par niveau** : les meilleures en **finale principale**, les suivantes en **secondaire**, puis **tertiaire** (autant de voitures
     que de couloirs) ; un podium par finale, record de la classe, « Bravo à tous ».
  Résultats écrits dans `course.json` + CSV ; diplôme de pilote N&B avec la photo officielle (facultatif).

## 5. Évaluation (proposition du brief, à valider)

Même grille à 4 niveaux et même note /20 que le taille-crayon. Les 7 critères du brief §5 : suit la fiche de fabrication · respecte les
règles du matériel · voiture terminée et qui fonctionne · teste, change une seule chose, re-teste · mesure avec le bon outil et écrit
l'unité · explique pourquoi sa voiture avance (**à l'écrit**) · autonomie / binôme. Le classement de la course n'entre pas dans la note.

## 6. Jalons (recette avec Thomas après chacun)

| Jalon | Contenu |
|---|---|
| V1 ✓ 29/10 | données + écrans S1, S2 et S3 (nom, couleur, matériel, fabrication, « ma voiture ne roule pas », décoration, photo officielle) |
| V2 ✓ 29/10 | S4 : essais, mesures, « je change une chose », graphique ; univers Grand prix ; S3 carrosserie |
| V3 | S5 et `course.html` (poules, finales, chrono, podiums, `course.json`, résultat côté élève) |
| V4 | outil professeur : tuiles, onglet Essais, longueur de piste proposée, évaluation et exports |
| V5 | recette automatique, essai réel (piste, mètre ruban, vraies voitures), publication |

## 7. Réglé et restant

**Validé le 29/10/2026** (« OK pour le plan ») : textes des règles du matériel et de la course, étapes de fabrication, cartes
« je change une chose » (roues · gonflage · poids), tels que proposés ci-dessus ; noms de voitures et couleurs d'équipe proposés par
Claude dans `donnees/` (modifiables).

**Restant** : photos de Thomas (modèle fini, une par étape de fabrication et de carrosserie) ; choix du gabarit (4 pièces ou
patron à plier) après essai ; façon de mesurer à confirmer (proposé : de la ligne de départ à l'avant de la voiture, en cm) ; les 7 critères et la ceinture (au jalon V4) ; le résultat
des essais de châssis (distance, tuyère de 4 mm) pour régler l'alerte « 10 fois plus grand ».
