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
  corps et de la manivelle (vérification de la séance 2), 3 phrases-cartes « À quoi sert la manivelle ? ».
- `site/taille-crayon/donnees/classes.js` : la classe et le nom du dossier du projet.
- `site/taille-crayon/donnees/projet.js` : titre et couleur du projet.
Après une modification : `npm test` vérifie que les données restent lisibles.

## Voir tous les écrans (démonstration)
`site/taille-crayon/index.html?enseignant=1` (lien en bas du portail) : équipe fictive, rien n'est enregistré.

## Pour les développeurs
`npm test` (moteur et données) · `npm start` (serveur local, http://localhost:8080) · `npm run recette`
(parcours complet dans le navigateur, caméra simulée ; après `npm install`).
