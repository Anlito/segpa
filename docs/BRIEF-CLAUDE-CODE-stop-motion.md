# Brief — Film en stop motion avec des briques · 6e SEGPA

À donner à Claude Code. **Lire d'abord** `CAHIER-DES-CHARGES-outils-6e-segpa.md` (squelette, lisibilité, sauvegarde, outil
professeur, évaluation) et `BRIEF-NOUVEAU-PROJET.md` du dépôt `Anlito/atelier-cereales`. Ce brief ne contient que ce qui est
**propre au stop motion**. Modèle de structure : `BRIEF-CLAUDE-CODE-taille-crayon.md` (à construire en premier).

Dépôt proposé : `Anlito/stop-motion-briques` (à confirmer). Dossier réseau : `… › COMMUN › TECHNOLOGIE › STOP MOTION › Prénom_Prénom` (à confirmer).

---

## 1. Le projet en deux mots

Chaque binôme invente une **petite histoire en trois temps**, construit un **décor et des personnages en briques**, puis le
**filme image par image** avec la webcam du poste. Ils obtiennent un petit film qui est projeté en fin de projet (**séance cinéma**).
L'outil est le studio : il pilote la caméra, aide à aligner les images, montre le film et garde la trace de tout le travail.
C'est le projet le plus visuel : il doit motiver sans demander de lecture.

## 2. Matériel connu et à confirmer

| Élément | Connu | À confirmer |
|---|---|---|
| Briques | 1 boîte de 1 000 briques compatibles (marque générique) | répartition par binôme (≈ 125 pour 8 binômes ?) |
| Plaques | 5 plaques de construction (Build-it) | **réglé** : Thomas en trouve 3 de plus (8 pour 8 binômes) |
| Impression 3D | possible | pied de webcam imprimé ? socle ? personnages ? |
| Caméra | une webcam par binôme (confirmé) | posée sur l'écran ou libre ? **stabilité** (voir §6) |
| Séances | **5 séances** (réglé) | durée (55 min supposée) |
| Format du film | **projection depuis le site** (réglé) | l'export vidéo `.webm` du §5 devient **facultatif** : ne pas le construire dans la première version |

## 3. Les séances (proposition à valider)

Chaque ligne = un écran (une chose à faire, 8 mots au plus, pictogramme, 🔊, minuteur facultatif).

### Séance 1 — J'invente mon histoire
1. **Règles du matériel** (une règle par écran, « J'ai compris ») : « Je ne touche pas l'objectif de la caméra. » · « Je compte mes briques. » · « Je range les briques par couleur. » (à ajuster par Thomas)
2. **Une histoire en 3 temps** : trois grandes cartes **Début · Milieu · Fin**. Pour chacune : choisir une **carte-idée** (lieux, héros, problèmes — `donnees/idees.js`, écrites par Thomas) **ou** « mon idée » (dessin sur papier photographié).
3. Le **titre** : cartes de titres amusants ou saisie libre.
4. 📷 Photo du **storyboard dessiné** sur papier (3 cases).

### Séance 2 — Je construis mon décor et mes personnages
1. **Mes briques** : pavé numérique « J'ai pris … briques » (+ plaques) ; le professeur voit l'écart avec la quantité prévue.
2. Construction libre guidée par 3 étapes images : **décor · héros · objets**. 📷 Photo à chaque étape.
3. **Test de stabilité** : « Je secoue doucement la table : rien ne tombe ? » (case à cocher).
Fin : rangement des briques par couleur dans la boîte du binôme (liste en images + photo) ; le décor reste sur la plaque, protégé.

### Séances 3 et 4 — Je filme
Voir §4 (écran de tournage). Rappels à l'ouverture : « La caméra ne bouge pas. » · « Je bouge un tout petit peu. » · « Je prends une photo. » (3 pictos en boucle).
Objectif minimal : **un film d'au moins 30 images** (≈ 5 secondes à 6 images par seconde) ; au plus **120 images** (limite de poids). Un compteur d'images « 12 / 30 » donne un but visible, le film peut dépasser.

### Séance 5 — Je monte et on projette
1. **Je regarde mon film** (lecture) ; réglage de la vitesse avec trois grosses icônes (🐢 lent · 🚶 normal · 🐇 rapide, soit environ 4, 6 et 10 images par seconde).
2. **Je supprime les images ratées** : je clique l'image dans la pellicule, « Enlever cette image » (demande de confirmation en grand).
3. **Titre et générique** : le titre est ajouté au début ; **« Un film de [prénoms] »** est ajouté à la fin automatiquement.
4. **Je fabrique mon film** (export vidéo, si le format est voulu : voir §5).
5. 🎬 **Séance cinéma** : le professeur lance la projection de tous les films (voir §7).
6. **Mon bilan** : trois smileys — « J'ai construit mon décor » · « J'ai filmé mon histoire » · « J'ai travaillé en équipe ».

## 4. L'écran de tournage (le cœur de l'outil)

Disposition (un seul écran, sans défilement, 1366 × 768) :
- au centre, **l'image en direct** de la webcam (16/9) ;
- **papier calque** (« onion skin ») : l'**image précédente** superposée à 40 % d'opacité sur le direct, bouton **👻 Calque** pour l'activer / la couper ; le calque est **activé par défaut** ;
- bouton **▦ Grille** (tiers) pour aligner le décor ;
- en bas à droite, **gros bouton 📷** (touche Espace aussi) : prise de la photo, petit son de déclic (coupable), flash visuel discret, ajout à la pellicule ;
- en bas, la **pellicule** : les 6 dernières images en miniature, la dernière en surbrillance ; le compteur « Image 12 » ;
- à gauche : **↶ Enlever la dernière** (confirmation « Enlever l'image 12 ? » avec miniature) ; **▶ Voir** (lecture rapide des 10 dernières images en boucle) ;
- à droite : **Pause café** (écran noir « La caméra ne bouge pas ! » avec compte à rebours de rappel, pour ranger sans toucher le dispositif) ;
- 🙋 et 🏠 comme partout ;
- un **bandeau de conseils** qui change toutes les ~40 secondes en une phrase de 6 mots avec pictogramme : « Bouge un tout petit peu. » · « Éloigne ta main. » · « Ne touche pas la caméra. » · « La lumière doit rester pareille. »

Détails :
- Prise de vue par `getUserMedia` (`video`), dessin dans un `canvas`, export **JPEG 1280 × 720, qualité ≈ 0,8** ; fichiers `photos/film/0001.jpg`… dans le dossier de l'équipe (pas dans le `.json`, qui garde seulement l'ordre, les légendes et le réglage de vitesse).
- Choix de la caméra si plusieurs (grosses vignettes) ; mémorisation par poste ; message d'erreur en français simple (cahier des charges §5).
- **Limite** : 120 images par film (≈ 18 Mo). Au-delà : message ambre « Ton film est assez long ! ».
- Aucun cadrage de visages demandé : le message d'aide dit « Filme les briques, pas les personnes ».
- **Facultatif** (à proposer, pas à construire d'office) : détection de « caméra bougée » ou de « lumière qui change » (comparaison grossière entre l'image directe et la dernière image prise) avec un message en ambre « Ça a bougé ? ».

## 5. Lecture et export

- **Lecture dans l'outil** : les images défilent dans un `canvas` à la vitesse choisie (aucun fichier vidéo nécessaire) ; boucle, pause, image par image.
- **Export vidéo** (« Je fabrique mon film ») : `MediaRecorder` sur `canvas.captureStream()` → fichier **`.webm`** dans le dossier de l'équipe, avec barre de progression (l'enregistrement dure aussi longtemps que le film). Lecture garantie dans Chrome et Edge ; **à vérifier** sur le lecteur du vidéoprojecteur et dans l'ENT. Si Thomas a besoin d'un `.mp4`, le dire à Thomas : le navigateur ne sait pas l'écrire de façon fiable sans bibliothèque (et aucune bibliothèque en ligne n'est permise) ; un export **GIF animé** avec un encodeur écrit dans le dépôt est une alternative possible.
- Voir la question 1 du §10 : la projection depuis le site suffit-elle ?

## 6. Stabilité de la caméra : un risque pédagogique

Un film dont la caméra bouge est le premier échec de ce projet, et les élèves sont facilement distraits. À prévoir côté matériel (hors outil, à discuter avec Thomas) : webcam fixée avec de la pâte adhésive ou posée dans un **support imprimé en 3D** (Bambu Studio) ; un repère au sol pour la plaque ; un éclairage constant (pas de fenêtre derrière le décor). L'outil aide avec le calque, la grille et les conseils affichés, mais il ne peut pas remplacer un support stable.

## 7. Outil professeur (en plus du socle, §7 du cahier des charges)

- **Tuile d'équipe** : nombre d'images prises, **dernière image** en miniature, séance en cours, briques prises / rendues, 🙋.
- **Album d'une équipe** : le storyboard, les photos de construction, la pellicule complète, le film (lecture).
- **Séance cinéma** (`cinema.html`, plein écran) : lecture de tous les films de la classe l'un après l'autre, avec carte-titre « Titre — Un film de … » ; commandes : suivant, pause, vitesse ; lecture directement depuis les dossiers (aucun fichier à convertir).
- **Alerte** : image 1 pas encore prise à mi-séance ; plus de 120 images ; 🙋.
- Vérification de rangement : briques prises = briques rendues ; sinon bandeau ambre sur la tuile.

## 8. Évaluation : 7 critères proposés (à valider) — même échelle à 4 niveaux

| # | Séance | Critère | Repères automatiques | Compétence cycle 3 — **proposition à valider** |
|---|---|---|---|---|
| 1 | S1 | Invente une histoire en trois temps | cartes Début / Milieu / Fin, storyboard | Pratiquer des langages (utiliser différents modes de représentation : dessin, schéma, texte) |
| 2 | S2 | Construit son décor et ses personnages | photos de construction | Concevoir, créer, réaliser (réaliser en équipe tout ou partie d'un objet) |
| 3 | S1–S5 | Respecte les règles du matériel (caméra, briques, rangement) | pris = rendu, photo de rangement, 🙋 | Adopter un comportement éthique et responsable |
| 4 | S3–S4 | Filme image par image sans bouger la caméra | nombre d'images, alertes « ça a bougé » | S'approprier des outils et des méthodes (utiliser le matériel adapté pour réaliser une production) |
| 5 | S5 | Son film se comprend (début, milieu, fin) | film terminé | Pratiquer des langages |
| 6 | S1–S5 | Utilise l'ordinateur seul(e) (photographier, enregistrer, retrouver) | peu de 🙋 pour l'outil | Mobiliser des outils numériques |
| 7 | — | Autonomie / travail en binôme | nombre de 🙋 | Concevoir, créer, réaliser (en équipe) |

Barème, appréciations, exports : voir cahier des charges §8.

## 9. Données à écrire dans des fichiers (modifiables par Thomas)

`donnees/projet.js` · `etapes.js` · `idees.js` (cartes Début / Milieu / Fin et titres) · `regles.js` · `rangement.js` (briques, plaques, quantités par binôme) · `criteres.js` · `conseils.js` (les phrases du bandeau) · `reglages.js` (images minimum et maximum, vitesses, caméra).

## 10. Questions propres à ce projet

1. *(réglée : projection depuis le site.)*
2. **Sans son** (film muet) ou avec une bande-son ? (pas de micro, pas de montage audio dans la première version.)
3. Support de caméra imprimé en 3D ?
4. *(réglée : 8 plaques.)*
5. Souhaites-tu un **thème imposé** (ex. : « une course », « un sauvetage », « un voyage ») pour cadrer les idées de chaque binôme ?

## 11. Ordre de travail

Après le taille-crayon (socle validé) : plan court → écran de tournage et sauvegarde des images (le plus risqué : à essayer sur un
vrai poste du collège dès la première étape) → pellicule, lecture, export → séance cinéma → étapes S1, S2 → évaluation et exports →
recette automatique avec **caméra simulée** → **essai réel** avec Thomas → publication.
