# Plan court — Film en stop motion avec des briques (6e SEGPA)

Version 1 · 01/11/2026 · **à valider par Thomas**. À lire avec `BRIEF-CLAUDE-CODE-stop-motion.md` (proposition d'origine) et
`PLAN.md` (organisation du dépôt, socle commun).

## 1. Décisions déjà prises

| Sujet | Décision |
|---|---|
| Dépôt | le même que les autres projets (`Anlito/segpa`, décision du 27/10) : `site/stop-motion/`, socle commun repris tel quel |
| Dossier réseau | `… › 6A › COMMUN › TECHNOLOGIE › Stop-motion › Prénom_Prénom` (comme `Taille-crayon` et `Voiture-ballon`) ; images du film dans `photos/film/0001.jpg`… |
| Séances | **5** (j'invente · je construis · je filme · je filme encore · je monte et on projette), durée 55 min |
| Plaques | **8** (une par binôme) ; 1 boîte de 1 000 briques compatibles |
| Caméra | une webcam par binôme |
| Film | **projection depuis le site** (pas de fichier vidéo dans la première version ; export `.webm` ou GIF plus tard si besoin) |
| Film | 30 images au moins (compteur « 12 / 30 »), 120 au plus (« Ton film est assez long ! » en ambre) |

## 2. Dans le dépôt

```
site/stop-motion/
  index.html (élèves) · prof.html · cinema.html (séance cinéma, plein écran)
  css/univers.css     l'univers du projet (à choisir sur maquette, comme pour la voiture)
  js/studio.js        moteur du tournage et de la lecture (testé) : pellicule, calque, vitesses, enlever une image
  js/ecran-tournage.js · js/ecrans.js (histoire en 3 temps, titre, briques) · js/prof-projet.js
  donnees/            projet.js · classes.js · etapes.js · idees.js · rangement.js · conseils.js · reglages.js · criteres.js
```

## 3. Les séances (une chose par écran)

**S1 — J'invente mon histoire** : règles du matériel (« Je ne touche pas l'objectif de la caméra. » · « Je compte mes briques. » ·
« Je range les briques par couleur. ») · **Début · Milieu · Fin** : une carte-idée par temps (lieux, héros, problèmes, dans
`donnees/idees.js`) ou « mon idée » · le **titre** (cartes ou « J'écris un titre ») · 📷 le storyboard dessiné sur papier (3 cases).

**S2 — Je construis mon décor et mes personnages** : « J'ai pris … briques » et la plaque (− et +) · le décor, le héros, les objets
(📷 à chaque étape) · « Je secoue doucement la table : rien ne tombe ? » · rangement par couleur, le décor reste sur la plaque.

**S3 et S4 — Je filme** : 3 rappels (la caméra ne bouge pas · je bouge un tout petit peu · je prends une photo) puis l'**écran de
tournage** (§4). S4 reprend le même film, là où il en était.

**S5 — Je monte et on projette** : je regarde mon film (🐢 lent · 🚶 normal · 🐇 rapide, 4 / 6 / 10 images par seconde) · j'enlève
les images ratées · le titre au début et « Un film de [prénoms] » à la fin, automatiquement · 🎬 séance cinéma · bilan (3 smileys).

## 4. L'écran de tournage (le cœur, à essayer en premier sur un poste du collège)

L'image de la webcam en grand · le **calque** (l'image précédente à 40 %, activé par défaut, bouton 👻) · la **grille** des tiers ·
le gros bouton 📷 (et la barre d'espace), déclic et flash discret · la **pellicule** des 6 dernières images et « Image 12 / 30 » ·
↶ « Enlever la dernière » (confirmation avec la miniature) · ▶ « Voir » (les 10 dernières en boucle) · « Pause café » (écran noir
« La caméra ne bouge pas ! ») · un conseil qui change toutes les 40 secondes (« Bouge un tout petit peu. », « Éloigne ta main. »…).
Images JPEG 1280 × 720 dans le dossier de l'équipe, jamais dans le `.json`. « Filme les briques, pas les personnes. »
Facultatif, plus tard : « Ça a bougé ? » (comparaison grossière entre le direct et la dernière image).

## 5. Outil professeur

Socle repris (suivi, aide, évaluation, exports). Tuile : nombre d'images, dernière image, briques prises / rendues. Album : storyboard,
construction, pellicule, lecture du film. Alertes : pas encore d'image à mi-séance de tournage ; briques prises ≠ rendues.
**`cinema.html`** : tous les films de la classe l'un après l'autre, carte-titre « Titre — Un film de … », suivant, pause, vitesse,
lus directement dans les dossiers.

## 6. Jalons (recette avec Thomas après chacun)

| Jalon | Contenu |
|---|---|
| M0 | maquette de l'univers graphique (deux directions au choix) |
| M1 | écran de tournage et sauvegarde des images (calque, grille, pellicule, enlever, voir) — **essai sur un vrai poste** |
| M2 | S5 : lecture, vitesses, enlever des images, titre et générique ; `cinema.html` |
| M3 | S1 et S2 : histoire en 3 temps, titre, briques, construction |
| M4 | outil professeur, 7 critères et ceinture (à valider), exports |
| M5 | recette automatique (caméra simulée), essai réel, publication |

## 7. Questions à Thomas

1. Film **muet** (première version sans son) ?
2. **Support de webcam** imprimé en 3D (je peux le dessiner si tu me donnes la webcam) ou pâte adhésive ?
3. Un **thème imposé** (une course, un sauvetage, un voyage…) ou libre ?
4. Les **cartes-idées** (lieux, héros, problèmes) et les **titres** : tu les écris, ou je propose une première liste ?
5. **Briques par binôme** : environ 125 (1 000 ÷ 8) ? On les compte, ou seulement la plaque ?
6. Les 3 **règles du matériel** ci-dessus te vont ?
7. L'**univers graphique** : une idée (cinéma, studio de tournage, briques…) ?
