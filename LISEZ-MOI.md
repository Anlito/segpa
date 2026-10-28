# Mode d'emploi du professeur — outils 6e SEGPA

## Installer sur le réseau du collège
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
- `site/taille-crayon/donnees/modele.js` : **à remplir** — noms des pièces du modèle acheté, longueurs de référence du
  corps et de la manivelle (vérification de la séance 2).
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
Pour essayer sans élèves : le dossier `exemples-equipes-fictives/Taille-crayon` du zip (ou `npm run exemples`).

## Voir tous les écrans (démonstration)
`site/taille-crayon/index.html?enseignant=1` (depuis `professeur.html`) : équipe fictive, rien n'est enregistré.

## Pour les développeurs
`npm test` (moteur et données) · `npm start` (serveur local, http://localhost:8080) · `npm run exemples` (équipes
fictives dans `exemples/`) · `npm run recette`
(parcours complet dans le navigateur, caméra simulée ; après `npm install`).
