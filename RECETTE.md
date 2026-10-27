# Recette manuelle — jalon 1 (socle élève, taille-crayon)

À faire par Thomas sur **un poste élève du collège** (Chrome ou Edge), avant la première séance.
La recette automatique (`npm run recette`, résultat dans `RECETTE-AUTO.md`) a déjà vérifié le parcours complet avec une
caméra simulée ; ici on vérifie ce qu'une machine de test ne peut pas vérifier.

## Préparer
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
- [ ] Ma mission → Je continue → les 3 règles, le matériel, « une pièce = une case », le rangement (les 3 lignes se
      cochent en touchant la ligne), la photo.
- [ ] **Webcam** : l'image s'affiche ; « Autre caméra » apparaît s'il y en a plusieurs ; la photo est prise
      (bouton ou barre d'espace) → « Je garde » → le fichier `photos/s1-boite-01.jpg` est dans le dossier de l'équipe.
- [ ] Webcam débranchée : message « Je ne vois pas la caméra. Branche-la, puis appuie sur Réessayer. »
- [ ] **Aide** : le bouton devient « Aide demandée » ; toucher encore → « Merci ! Tu continues. »
- [ ] **Bravo** → « Enregistré dans votre dossier » → J'ai fini.
- [ ] Fermer l'onglet, rouvrir → **Je continue** → Ouvrir le dossier → le bouton de l'équipe est entouré (dernière
      équipe de ce poste) → la séance 1 est « Fait », la séance 2 est « En cours ».
- [ ] Sur un **autre poste**, Je continue → la même équipe se retrouve (le travail suit l'élève, pas le poste).
- [ ] « Je commence » avec les mêmes prénoms : « Votre dossier existe déjà : vous reprenez votre travail » (rien n'est écrasé).
- [ ] Mode enseignant : `site/index.html` → lien « Professeur : voir tous les écrans » → bandeau noir, rien n'est enregistré.

## Noter ici
- Poste : fixe / portable · Navigateur et version :
- Voix française : oui / non
- Webcam : modèle, image nette ? lumière ?
- Remarques des élèves :
