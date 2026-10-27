# Brief — Course de voitures à ballon · 6e SEGPA

À donner à Claude Code. **Lire d'abord** `CAHIER-DES-CHARGES-outils-6e-segpa.md` (squelette, lisibilité, sauvegarde, outil
professeur, évaluation) et `BRIEF-NOUVEAU-PROJET.md` du dépôt `Anlito/atelier-cereales`. Ce brief ne contient que ce qui est
**propre à la voiture à ballon**. Modèle de structure : `BRIEF-CLAUDE-CODE-taille-crayon.md` (à construire en premier).

Dépôt proposé : `Anlito/course-voiture-ballon` (à confirmer). Dossier réseau : `… › COMMUN › TECHNOLOGIE › VOITURE A BALLON › Prénom_Prénom` (à confirmer).

---

## 1. Le projet en deux mots

Chaque binôme **fabrique une voiture propulsée par un ballon** (l'air qui s'échappe pousse la voiture), la **décore**, la **teste**
sur une piste, l'**améliore**, puis participe à une **course sur une ligne droite** avec podium. Ce que Thomas veut y trouver :
du bricolage manuel, un résultat visible et amusant (la course), l'usage de l'ordinateur pour garder la trace, et le respect
des règles d'utilisation du matériel. Même esprit que le concours d'avions en papier (pliage, décoration, concours), qui a très
bien marché.

## 2. Ce qu'on ne sait pas encore (à demander à Thomas avant de coder — **ne rien supposer**)

| # | Question | Pourquoi |
|---|---|---|
| 1 | **Matériel de fabrication réellement disponible** (carrosserie : bouteille, carton, briques ? roues : bouchons, CD, roues du commerce ? axes : brochettes, pailles ? ballons, ruban adhésif, colle, ciseaux…) | les cartes de choix et la fiche de fabrication en dépendent |
| 2 | **Outils** utilisés par les élèves (ciseaux, pistolet à colle, perceuse, cutter ?) | règles de sécurité à afficher, critère d'évaluation |
| 3 | ~~Nombre de séances~~ **réglé : 4 séances** (durée de 55 min supposée, à confirmer) | découpage de la mission |
| 4 | **Piste** : longueur, largeur, revêtement, nombre de couloirs, ligne de départ / d'arrivée, mètre ruban disponible ? | essais mesurés et course |
| 5 | ~~Classement~~ **réglé : ordre d'arrivée** sur une distance donnée (le mode « distance parcourue » reste un réglage facultatif de l'outil professeur) | écran de course |
| 6 | ~~Le classement compte-t-il dans l'évaluation ?~~ **réglé : non** | grille |
| 7 | Modèle de voiture fourni par Thomas : photo ou vidéo du modèle fini ? plan ? | écran « je regarde le modèle » |

## 3. Les séances (proposition à valider)

Chaque ligne = un écran (une chose à faire, 8 mots au plus, pictogramme, 🔊, minuteur facultatif).

### Séance 1 — Je prépare ma voiture
1. Les **règles du matériel** (une règle par écran, à lire à voix haute, « J'ai compris ») — à écrire avec Thomas d'après les outils réellement utilisés ; au minimum : « J'utilise mes outils comme on me l'a montré. » · « Je compte mon matériel. » · « Je range avant de partir. »
2. **Notre voiture** : choisir le **nom** de la voiture (cartes de noms amusants ou « écrire mon nom ») et la **couleur d'équipe** (la voiture garde cette couleur sur la piste et le podium).
3. 👀 **Je regarde le modèle** (photo / vidéo fournie par Thomas).
4. **Mon matériel** : cartes-images des pièces mises à disposition (`donnees/materiel.js`) ; pour chaque pièce, le pavé numérique demande « J'ai pris … » ; le professeur voit les écarts avec les quantités prévues.
5. 📷 Photo des pièces sur la table.
Fin : rangement (voir cahier des charges §3 écran 6).

### Séance 2 — Je construis ma voiture
1. **Fiche de fabrication** en cartes numérotées, une étape par écran (photo ou schéma + 8 mots), ✓ à chaque étape. Le découpage vient de `donnees/fabrication.js`, à écrire avec le **vrai** modèle de Thomas. *Exemple de structure seulement, à remplacer :* carrosserie → axes et roues → tuyère → ballon → décoration.
2. Points de photo obligatoires (📷) : « voiture sans ballon », « voiture terminée ».
3. **Décoration** : étape libre, photo « ma voiture décorée » (c'est ce qui a plu avec les avions).
Fin : rangement + photo de la voiture rangée au bon endroit (les voitures restent sur l'étagère jusqu'à la séance suivante).

### Séance 3 — Je teste et j'améliore ma voiture
Une boucle, **trois essais au minimum, cinq au maximum** :
1. **Essai n° k** : « Je pose la voiture sur la ligne de départ. » → « Je gonfle le ballon. » → « Je lâche. »
2. 📏 « Je mesure jusqu'où elle est allée » → **pavé numérique** en cm (unité affichée) — la mesure se fait avec un mètre ruban ou la piste graduée (question 4).
3. « Ma voiture roule… » trois pictogrammes : **tout droit · vers la gauche · vers la droite**.
4. **Je change UNE chose** (cartes : roues, poids, ballon, tuyère, forme… selon `donnees/changements.js`) avant l'essai suivant. « Un seul changement à la fois » est le point clé : l'écran bloque si l'élève en choisit deux (message ambre « Choisis un seul changement »).
5. **Mon graphique** : barres épaisses, une par essai, avec le pictogramme du changement fait ; pas d'axes chiffrés compliqués (la distance en grand au-dessus de chaque barre). Montre si la voiture « va plus loin » sans formuler de reproche.
6. 📷 Photo avant / après la modification.
Fin : rangement.

### Séance 4 — La course
1. **« Ma voiture est prête »** : bouton qui met l'équipe « prête » dans l'outil professeur ; rappel des règles de la course (une règle par écran).
2. **La course** est menée par le professeur (voir §4). Côté élève : écran d'attente « Regarde la piste ! ».
3. **Mon résultat** : l'outil lit `course.json` dans le dossier du projet (le professeur l'y a écrit) et montre la place de l'équipe et sa distance ou son temps, avec un message encourageant quel que soit le rang. Si le fichier est absent : « Le professeur te donnera ton résultat. »
4. **Pourquoi ma voiture avance ?** — 3 phrases-cartes à choisir, rédigées par Thomas (par exemple « L'air qui sort du ballon pousse la voiture »), ou « Je réponds à l'oral » (validé par le professeur).
5. **Mon bilan** : 3 phrases courtes avec smileys — « J'ai fabriqué ma voiture » · « J'ai fait mes essais » · « J'ai travaillé en équipe ».
6. 📷 Photo finale de la voiture + du podium.

## 4. Outil professeur : le mode « Course » (propre à ce projet)

En plus du socle (cahier des charges §7), une page `course.html`, **lisible au vidéoprojecteur** :
- **Pistes** : une piste par équipe de la manche (couleur d'équipe, nom de la voiture, **photo de la voiture** prise en séance 2 ou 3).
- **Manches** : le professeur choisit qui court (par exemple 2 à 4 équipes par manche selon le nombre de couloirs) ; plusieurs
  manches ; la meilleure performance de chaque équipe compte (réglable : meilleure / dernière / moyenne).
- **Mode ordre d'arrivée** : bouton **Top départ** (chrono commun), puis un **gros bouton par piste** à toucher quand la voiture
  passe la ligne → place + temps. Précision humaine : afficher « temps indicatif » (pas de millisecondes).
- **Mode distance** : saisie au pavé numérique de la distance de chaque voiture (cm).
- **Podium** : classement de la manche et classement général, photos des voitures, **record de la classe**. Pas de rouge pour les derniers ; message « Bravo à tous ».
- Résultats écrits dans `course.json` (dossier du projet) + export CSV ; une page imprimable « Diplôme de pilote » en noir et blanc par équipe (facultatif, à proposer).
- Aucun résultat de course n'est ajouté tout seul à l'évaluation (question 6).

Autres tuiles de la vue « Classe », propres à ce projet : numéro d'essai en cours, meilleure distance, nombre de changements faits,
matériel pris / rendu, voiture « prête ».

## 5. Évaluation : 7 critères proposés (à valider) — même échelle à 4 niveaux

| # | Séance | Critère | Repères automatiques | Compétence cycle 3 — **proposition à valider** |
|---|---|---|---|---|
| 1 | S2 | Suit la fiche de fabrication, dans l'ordre | étapes cochées, photos | S'approprier des outils et des méthodes (procédés de réalisation) |
| 2 | S1–S4 | Respecte les règles du matériel (outils en sécurité, matériel compté et rangé) | pris = rendu, rangement photographié, 🙋 | Adopter un comportement éthique et responsable (sécurité) |
| 3 | S2 | Sa voiture est terminée et fonctionne | photo « terminée », premier essai | Concevoir, créer, réaliser (réaliser en équipe tout ou partie d'un objet technique) |
| 4 | S3 | Teste, change une seule chose, re-teste | nombre d'essais, changements | Pratiquer des démarches scientifiques et technologiques (proposer des expériences simples, interpréter un résultat) |
| 5 | S3 | Mesure avec le bon outil et écrit l'unité | distances saisies | S'approprier des outils et des méthodes (lien entre mesure, unités et outil) |
| 6 | S4 | Explique à l'oral pourquoi sa voiture avance | réponse choisie / à l'oral | Pratiquer des langages (expliquer à l'oral) |
| 7 | — | Autonomie / travail en binôme | nombre de 🙋 | Concevoir, créer, réaliser (en équipe) |

Barème, appréciations, exports : voir cahier des charges §8. Le **classement de la course n'entre pas** dans la note (par défaut).

## 6. Données à écrire dans des fichiers (modifiables par Thomas sans toucher au code)

`donnees/projet.js` (identité) · `etapes.js` (séances et écrans) · `materiel.js` (pièces, images, quantités) · `fabrication.js`
(étapes de fabrication, images) · `changements.js` (cartes « je change une chose ») · `regles.js` (règles du matériel et de la course) ·
`criteres.js` · `piste.js` (longueur, couloirs, mode de classement).

## 7. Risques et points d'attention

- **Mesures** : un élève qui se trompe d'unité (m / cm) doit être aidé, pas puni : le pavé numérique affiche toujours « cm » et le
  graphique signale un résultat dix fois plus grand que les autres par « Mesure encore une fois ? » en ambre.
- **Ballons** : allergie au latex possible → information au professeur (hors outil, ne rien stocker sur la santé).
- Course dans un couloir ou une salle : la piste doit rester **dégagée** (règle de la course).
- Voiture qui ne roule pas : prévoir un écran « Ma voiture ne roule pas » (3 pictos de causes : roues qui frottent, ballon qui fuit, voiture trop lourde) qui renvoie à l'étape de fabrication concernée, sans donner la solution.

## 8. Ordre de travail

Après le taille-crayon (socle validé) : plan court → données et écrans S1–S4 → mode Course → évaluation et exports → recette
automatique → **essai réel** avec Thomas (piste, mètre ruban, vraies voitures) → publication.
