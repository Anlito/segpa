# Mode d'emploi du professeur — outils 6e SEGPA

## En ligne (GitHub Pages)
Élèves : `https://anlito.github.io/segpa/` · professeur : `https://anlito.github.io/segpa/professeur.html` (en favori).
Le site en ligne enregistre toujours dans les dossiers du réseau du collège (Chrome ou Edge) : rien n'est envoyé ailleurs.
Chaque envoi sur la branche `main` relance les tests puis republie le site (`.github/workflows/pages.yml`).

## Installer sur le réseau du collège (sans Internet)
1. Copier le dossier **`site/`** à un endroit que les élèves peuvent ouvrir (par exemple dans le dossier commun de la
   technologie). Les élèves ouvrent `site/index.html` dans **Chrome ou Edge** (Firefox ne sait pas écrire dans les dossiers).
2. Pour chaque classe, créer le dossier du projet : `Bureau › Classe › 6A › COMMUN › TECHNOLOGIE › Taille-crayon`.
3. Y déposer **`classe.json`** (prénoms de la classe, jamais dans le dépôt) — modèle : `docs/exemple-classe.json`.
   Sans ce fichier, les élèves écrivent leurs prénoms au clavier.

## Ce que l'outil écrit
`Taille-crayon › Léa_Tom › Léa_Tom.json` (le travail de l'équipe, réécrit tout seul) et `photos/` (les photos, en JPEG).
Rien n'est envoyé ailleurs, aucun compte. Une sauvegarde existante n'est jamais écrasée.

## Modifier le contenu sans toucher au code
- `site/taille-crayon/donnees/etapes.js` : les séances, les écrans, les textes (8 mots au plus), les minuteurs.
- `site/taille-crayon/donnees/modele.js` : le taille-crayon « Cat » NO.722A (rempli le 02/11/2026) — les 7 pièces dans
  l'ordre du démontage (nom, photo, geste et conseil pour la retirer, conseil pour la remettre) et les plages de mesure
  de la séance 2 (corps : hauteur 8,5–9,5 cm, largeur 4–5 cm, longueur 5–6 cm ; manivelle : 4,5–5,5 cm). Photos dans
  `site/taille-crayon/img/` (pièces, gestes, l'objet du jour).
- Feuille de dessin de la séance 2 : `site/taille-crayon/feuille-dessin.html` (A4, 1 carreau = 1 cm, les 2 pièces) ;
  l'outil professeur la prépare avec les prénoms de chaque équipe (bandeau « Séance 2 »). Imprimer en taille réelle (100 %).
- Présentation du début de projet, à projeter : `site/taille-crayon/presentation.html` (11 diapositives ; ← → ou clic
  pour avancer, F plein écran, N notes du professeur) ; liens sur la page professeur et dans l'outil professeur.
- Tailles de référence de la séance 2 : à saisir dans l'outil professeur (bandeau « Séance 2 » → « Tailles de référence »),
  enregistrées dans `tailles-reference.json` du dossier de la classe ; elles remplacent les plages de `modele.js`.
- `site/taille-crayon/donnees/classes.js` : la classe et le nom du dossier du projet.
- `site/taille-crayon/donnees/projet.js` : titre et couleur du projet.
Après une modification : `npm test` vérifie que les données restent lisibles.

## Page du professeur
`site/professeur.html` (en ligne : `…/segpa/professeur.html`) : **pas de lien depuis le portail des élèves**, à garder
en favori. Elle mène au suivi de la classe et aux écrans élèves en démonstration, pour chaque projet.

## Suivre la classe (outil professeur)
`site/taille-crayon/prof.html` (depuis `professeur.html`), dans Chrome ou Edge :
1. « Ouvrir le dossier de la classe » → choisir `… › 6A › COMMUN › TECHNOLOGIE › Taille-crayon` → Autoriser.
2. Une tuile par équipe : séances ✓ ● ○, dernière photo, pièces démontées, mesures, dernière activité. Le dossier est
   relu toutes les 20 secondes (« lu à 10:42 ») : il y a un léger décalage avec l'écran des élèves.
3. Une équipe touche « Aide » : bandeau violet en haut, petit son, avec la séance et l'écran où elle est.
   « J'y vais » enlève l'alerte. Repères en ambre : « Rien depuis 12 min », « Plus de 2 pièces dehors », mesure
   hors de la plage, photo laissée pour plus tard.
4. Toucher une tuile : la fiche de l'équipe (‹ › pour passer à la suivante, Échap pour revenir) avec les onglets
   Bilan, Album (photos à télécharger), Pièces et réponses, Séance 2 (longueurs saisies et essais), Historique,
   Différenciation (vos notes, visibles sur la tuile, jamais par les élèves).
Vos notes vont dans `professeur.json`, dans le dossier du projet ; l'outil n'écrit jamais dans le fichier d'une équipe.

## Voiture à ballon
Même fonctionnement que le taille-crayon, dossier `… › 6A › COMMUN › TECHNOLOGIE › Voiture-ballon` (avec `classe.json`).
- **Suivre la classe** : `site/voiture-ballon/prof.html`. Tuiles : nom et couleur de la voiture, matériel, essais,
  course ; alertes « matériel pris différent du kit », « voiture qui n'avance pas » ; bandeau **Piste** avec une
  longueur proposée d'après les meilleurs essais ; onglets **Essais** et **Voiture et course**.
- **La course** : `site/voiture-ballon/course.html`, au vidéoprojecteur. Ouvrir le dossier Voiture-ballon (ou
  « Démonstration »), retirer les absents, choisir les couloirs, puis les poules, chaque course au chrono (« Top départ »,
  « Arrivée » ou touches 1 à 4, « N'arrive pas » avec la distance), les finales et les podiums. « Enregistrer les
  résultats » écrit `course.json` dans le dossier du projet et dans celui de chaque équipe : les élèves voient leur
  résultat sur l'écran « Mon résultat ». Tableau CSV et diplômes de pilote à imprimer.
- **Gabarits de carrosserie** (`site/voiture-ballon/documents/`) : 4 pièces (PDF A4) ou patron à plier (PDF A3 : toit à 30 mm,
  languettes de 10 mm en biseau à plier et scotcher sous le châssis, rabats de 12 mm à coller ou agrafer ; imprimer à 100 %), et le patron en SVG pour la Cricut (207 × 154 mm, calques découpe et plis), pour le châssis v8. Les réglages de
  Design Space sont rappelés sur la page professeur (encart « Découper la carrosserie à la Cricut »).
- Les 7 critères d'évaluation de la voiture sont une **proposition à valider** (`donnees/criteres.js`).

## Film en stop motion (« Mon film en briques »)
Même fonctionnement, dossier `… › 6A › COMMUN › TECHNOLOGIE › Stop-motion` (avec `classe.json`). Une webcam par binôme,
sur son support ; les images du film vont dans `Prénom_Prénom/photos/film/0001.jpg`, `0002.jpg`… (jamais dans le .json).
- **Élèves** (`site/stop-motion/index.html`) : S1 le scénario (7 questions, cartes-idées de `donnees/idees.js` ou idée
  écrite, titre, récap) · S2 la plaque, le décor, le héros, les objets · S3 et S4 l'écran de tournage (calque, grille,
  barre d'espace, enlever la dernière, voir, pause café ; 30 images au moins, 120 au plus) · S5 le titre, la vitesse,
  les images ratées, le film avec son générique, le bilan.
- **Suivre la classe** : `site/stop-motion/prof.html`. Tuiles : titre, scénario, plaque, images ; alertes « pas encore
  d'image » (25 min après le début d'une séance de tournage) et « plaque prise, rangement pas fait » ; onglets
  **Scénario** et **Film** (le film tel qu'il sera projeté, toutes les images). 7 critères validés ; ceinture d'après
  « Son film est fini ».
- **La séance cinéma** : `site/stop-motion/cinema.html`, au vidéoprojecteur. Ouvrir le dossier Stop-motion (ou
  « Essayer avec 2 films d'exemple »), choisir le programme, « On lance la séance » : chaque film en plein écran avec
  son titre et « Un film de … », applaudissements, film suivant. Pupitre et clavier (Espace, ←, →, R). Rien n'est écrit.

## Évaluer
Fiche d'une équipe → onglet **Évaluation** : les 7 critères de votre Excel, une colonne par élève, 4 boutons par case
(✗ R Rouge · ~ J Jaune · ✓ V Vert clair · ★ VV Vert foncé ; toucher encore le même bouton efface). « Même niveau pour
tout le binôme » (coché par défaut) évalue les deux élèves d'un geste ; décochez pour les distinguer. À droite, les
**repères** observés par l'outil (pièces démontées, mesures, cases cochées, demandes d'aide) : jamais un niveau.
Sous le tableau : score /21, note /20 (formule de l'Excel : score ÷ 21 × 20), appréciation, ceinture, commentaire.
- **Ceinture** = niveau du critère « Remontage fonctionnel » : Rouge → blanche · Jaune → jaune · Vert clair → verte ·
  Vert foncé → vert foncé. Les élèves ne voient jamais la note.
- Vue Classe → **Excel** (votre classeur : Évaluation, Synthèse classe, Légende avec la ligne d'exemple, Référentiel
  compétences, Pronote ; formules recalculées à l'ouverture ; une ligne vide n'est plus comptée) · **CSV** ·
  **Carnet de classe** (niveaux 1 à 4 ; créer d'abord les 7 critères avec les mêmes libellés dans le projet du Carnet ;
  sa note peut différer de celle de l'Excel, qui reste la note de référence) · **Feuilles ceinture** (une carte par
  élève, noir et blanc, motif et lettre ; note seulement si vous cochez « Afficher la note chiffrée »).
- Onglet Album → « Imprimer l'album » (A4, 6 photos par page).
- Les critères et leurs compétences sont dans `site/taille-crayon/donnees/criteres.js`.
Pour essayer sans élèves : le dossier `exemples-equipes-fictives/Taille-crayon` du zip (ou `npm run exemples`).

## Voir tous les écrans (démonstration)
`site/taille-crayon/index.html?enseignant=1` (depuis `professeur.html`) : équipe fictive, rien n'est enregistré.

## Pour les développeurs
`npm test` (moteur et données) · `npm start` (serveur local, http://localhost:8080) · `npm run exemples` (équipes
fictives dans `exemples/`) · `npm run recette`
(parcours complet dans le navigateur, caméra simulée ; après `npm install`).
