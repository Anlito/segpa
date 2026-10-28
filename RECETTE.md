# Recette manuelle — jalons 1 à 4 (écrans élèves, outil professeur, évaluation du taille-crayon)

À faire par Thomas sur **un poste élève du collège** (Chrome ou Edge), avant la première séance.
La recette automatique (`npm run recette`, résultat dans `RECETTE-AUTO.md`) a déjà vérifié le parcours complet avec une
caméra simulée ; ici on vérifie ce qu'une machine de test ne peut pas vérifier.

## Préparer
0. Remplir `site/taille-crayon/donnees/modele.js` (noms des pièces, longueurs du corps et de la manivelle) — l'outil marche aussi sans, mais sans aide au nom ni vérification de la mesure.
1. Copier le dossier `site/` du dépôt sur le réseau (ou ouvrir `site/index.html` depuis une clé USB).
2. Dans `Bureau › Classe › 6A › COMMUN › TECHNOLOGIE`, créer le dossier **`Taille-crayon`**.
3. Y déposer **`classe.json`** avec les prénoms de la classe (modèle : `docs/exemple-classe.json`) :
   `{ "classe": "6A", "eleves": ["Léa", "Tom", …] }`.

## Vérifier (cocher)
- [ ] `site/index.html` → tuile « Je démonte un objet technique » → l'accueil s'affiche **sans barre de défilement**
      (fenêtre normale, puis plein écran F11).
- [ ] **Voix** : le bouton 🔊 est visible et lit la phrase en français. (S'il n'y a pas de voix française sur le poste,
      les boutons 🔊 disparaissent : le noter.)
- [ ] **Je commence** → le chemin s'affiche → « Ouvrir le dossier » → choisir `Taille-crayon` → **Autoriser**.
- [ ] Les **boutons-prénoms** de `classe.json` s'affichent ; choisir **deux prénoms avec accent** (ex. Léa, Inès).
- [ ] Le dossier `Taille-crayon › Léa_Inès` est créé, avec `Léa_Inès.json` dedans.
- [ ] Ma mission → Je continue → la **présentation** (objet technique, mission, « Je découvre » l'objet du jour,
      programme), les 3 règles, le matériel, « une pièce = une case ».
- [ ] **Tableau des pièces** avec un vrai taille-crayon : « Pièce 1 » → je dévisse → photo → nom (cartes de
      `modele.js`, ou clavier tant qu'il est vide, ou « Je ne sais pas ») → je range dans la case 1 → la photo et le
      nom apparaissent dans la case 1. Faire 3 ou 4 pièces, puis « J'ai fini de démonter ».
- [ ] Le rangement (les 3 lignes se cochent en touchant la ligne), la photo de la boîte.
- [ ] **Séance 2** (Ma mission → toucher « Je mesure ») : je sors une seule pièce (« J'en ai sorti plus » → message
      ambre), je mesure au pavé (« 7,5 »), je trace les bords à la règle (exemple affiché), je trace la flèche de
      dimension à la règle d'une autre couleur (exemple affiché), photo du dessin, je remets la pièce. Deux fois.
      Avec les longueurs de référence dans `modele.js` : une mesure fausse donne « Mesure encore une fois, en partant
      du 0 du réglet », la deuxième fausse « Montre ta mesure au professeur ».
- [ ] **Séance 3** : les photos de la séance 1 reviennent **de la dernière à la première** ; vérification (3 cases) ;
      photos du taille-crayon remonté et d'un crayon taillé ; 3 questions, **toujours à l'écrit** (« Suivant » reste
      grisé tant que rien n'est écrit ; pour « quelle pièce… », les photos de la séance 1 restent affichées) ; le bilan.
- [ ] **Webcam** : l'image s'affiche ; « Autre caméra » apparaît s'il y en a plusieurs ; la photo est prise
      (bouton ou barre d'espace) → « Je garde » → le fichier `photos/s1-boite-01.jpg` est dans le dossier de l'équipe.
- [ ] Webcam débranchée : message « Je ne vois pas la caméra. Branche-la, puis appuie sur Réessayer. »
- [ ] **Aide** : le bouton devient « Aide demandée » ; toucher encore → « Merci ! Tu continues. »
- [ ] **Bravo** → « Enregistré dans votre dossier » → le bouton « Ma mission » ramène à la mission.
- [ ] Fermer l'onglet, rouvrir → **Je continue** → Ouvrir le dossier → le bouton de l'équipe est entouré (dernière
      équipe de ce poste) → la séance 1 est « Fait », la séance 2 est « En cours ».
- [ ] Sur un **autre poste**, Je continue → la même équipe se retrouve (le travail suit l'élève, pas le poste).
- [ ] « Je commence » avec les mêmes prénoms : « Votre dossier existe déjà : vous reprenez votre travail » (rien n'est écrasé).
- [ ] Le portail `site/index.html` ne montre **aucun lien professeur**.
- [ ] `site/professeur.html` → « Écrans élèves (démonstration) » → bandeau noir, rien n'est enregistré.

## Outil professeur (sur le poste du professeur, pendant que 2 postes élèves travaillent)
- [ ] `site/professeur.html` → « Suivre la classe » → « Ouvrir le dossier de la classe » → `Taille-crayon` de la 6A → les tuiles des équipes.
- [ ] Un élève touche **Aide** : en 20 secondes au plus, bandeau violet + son sur le poste du professeur, avec l'écran
      où il est. « J'y vais » enlève l'alerte.
- [ ] La tuile montre la dernière photo, les pièces démontées, « il y a … min ».
- [ ] Fiche d'une équipe : Album (photos en grand, « Télécharger »), Pièces et réponses, Séance 2, Historique.
- [ ] Différenciation : cocher une case → elle apparaît sur la tuile ; `professeur.json` est dans le dossier du projet.
- [ ] Fermer, rouvrir `prof.html` → « Reprendre : Taille-crayon » rouvre le même dossier.
- [ ] Essai sans élèves : dossier `exemples-equipes-fictives/Taille-crayon` du zip.

## Évaluation
- [ ] Onglet Évaluation : poser les 7 niveaux d'un binôme → même note pour les deux ; décocher « Même niveau pour tout
      le binôme » → les niveaux d'un seul élève changent.
- [ ] Note : tout jaune → 6,7 ; l'exemple Jaune, Jaune, Vert clair ×4, Vert foncé → 12,4 « Satisfaisant ».
- [ ] **Excel** : s'ouvre dans Excel (et LibreOffice) sans message de réparation ; couleurs, menus déroulants, notes et
      synthèse calculées ; la ligne d'exemple est dans la Légende ; onglet Pronote rempli.
- [ ] **Carnet de classe** : importer le fichier dans le Carnet (projet avec les 7 critères aux mêmes libellés).
- [ ] **Feuilles ceinture** : impression en noir et blanc lisible ; pas de note sauf si la case est cochée.
- [ ] Album → « Imprimer l'album » : 6 photos par page A4.

## Noter ici
- Poste : fixe / portable · Navigateur et version :
- Voix française : oui / non
- Webcam : modèle, image nette ? lumière ?
- Remarques des élèves :
