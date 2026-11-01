# Plan court — Film en stop motion avec des briques (6e SEGPA)

Version 3 · 01/11/2026 · réponses de Thomas reportées (§1 et §7) · **jalon M1 fait** (§6, §8). À lire avec `BRIEF-CLAUDE-CODE-stop-motion.md` (proposition d'origine) et
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
| Son (01/11) | **film muet** dans la première version ; plus tard, une **banque de bandes-son** où chaque équipe choisit celle qui va avec son histoire |
| Caméra (01/11) | **support imprimé en 3D** pour garder le même point de vue (webcams achetées par Thomas : dimensions à relever) |
| Histoire (01/11) | **pas de thème imposé** ; des **idées proposées** (lieux, héros, problèmes, titres) écrites par Claude dans `donnees/idees.js`, modifiables |
| Matériel (01/11) | on compte **seulement la plaque** (pas les briques) ; les 3 règles du matériel sont validées |
| Univers (01/11) | deux directions à proposer sur maquette (jalon M0) |

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

**S2 — Je construis mon décor et mes personnages** : « J'ai pris ma plaque » (on ne compte pas les briques) · le décor, le héros, les objets
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

Socle repris (suivi, aide, évaluation, exports). Tuile : nombre d'images, dernière image, plaque prise / rendue. Album : storyboard,
construction, pellicule, lecture du film. Alertes : pas encore d'image à mi-séance de tournage ; plaque non rendue.
**`cinema.html`** : tous les films de la classe l'un après l'autre, carte-titre « Titre — Un film de … », suivant, pause, vitesse,
lus directement dans les dossiers.

## 6. Jalons (recette avec Thomas après chacun)

| Jalon | Contenu |
|---|---|
| M0 | maquette de l'univers graphique (deux directions au choix) — **fait : direction C « Cinéma en briques » choisie le 01/11** |
| M1 | écran de tournage et sauvegarde des images (calque, grille, pellicule, enlever, voir) — **essai sur un vrai poste** — **fait le 01/11, recette de Thomas à faire** (`RECETTE.md`) |
| M2 | S5 : lecture, vitesses, enlever des images, titre et générique ; `cinema.html` |
| M3 | S1 et S2 : histoire en 3 temps, titre, briques, construction |
| M4 | outil professeur, 7 critères et ceinture (à valider), exports |
| M5 | recette automatique (caméra simulée), essai réel, publication |

## 7. Restant

- Dimensions de la webcam (ou photo avec une règle) pour dessiner le support 3D.
- Bandes-son : après la première version (sons écrits dans le dépôt ou fichiers libres de droits, rien en ligne).

## 8. Fait au jalon M1 (01/11/2026)

- `site/stop-motion/` : `index.html`, univers C (`css/univers.css`), données (`projet`, `classes`, `etapes`, `film` : réglages et conseils).
- `js/studio.js` (testé) : noms des images, compteur, enlever, pellicule, vitesses, conseils ; le film est gardé dans `d.film`
  (à part des séances, pour que la séance 4 continue le film de la séance 3).
- `js/ecran-tournage.js` : l'écran du §4. Pendant une question (« J'enlève cette image ? ») ou la pause café, la barre
  d'espace touche le bouton qui a la main (« Non, je la garde », « Je reviens ») : jamais de photo prise par erreur.
- Socle : `session.ecrireImage` (image écrite sans entrée dans l'album, jamais par-dessus un fichier), `O.ecrireImage`,
  `O.nettoyer` (écouteurs et minuteurs d'un écran propre), pictogrammes film, brique, calque, grille, café, annuler, stop.
- Séances 1, 2 et 5 : seulement leurs règles et photos en attendant M2 et M3. Le portail garde « bientôt » jusqu'à M5.
