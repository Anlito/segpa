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

## Voiture à ballon — jalon V1 (séances 1 à 3)
`site/professeur.html` → « Course de voitures à ballon » → Écrans élèves (démonstration) :
- [ ] Ma mission : 5 séances lisibles, sans défilement.
- [ ] Séance 1 : 4 règles, nom de la voiture (cartes ou « J'écris un nom »), couleur d'équipe (aperçu de la voiture), modèle
      (photo `img/modele.jpg` quand elle existe), « J'ai pris… » avec − et +, photo des pièces, rangement.
- [ ] Séance 2 : la fabrication pas à pas (photos `img/fabrication/1.jpg`… quand elles existent), « Ma voiture ne roule pas »
      → la cause ramène à la bonne étape.
- [ ] Séance « Je fabrique ma carrosserie » : je récupère ma carrosserie découpée (feuille cartonnée), je colorie (20 min),
      je plie, je colle ou j'agrafe, je l'installe (languettes scotchées dessous), roues qui tournent, aileron et
      protège-roues à la main si je veux, vérification, **photo officielle**, rangement.

## Voiture à ballon — jalon V2 (séance 4 et univers Grand prix)
- [ ] L'univers : bitume, damier en haut, cartes bordées orange et blanc, stands numérotés dans Ma mission ; tout se lit bien
      au vidéoprojecteur et sur les postes élèves.
- [ ] Séance 4 : roues du départ, **avant puis arrière** (20 à 50 mm, elles peuvent différer), puis pour chaque essai : je pose · je gonfle (coups de pompe, − et +) · je lâche ·
      je mesure (pavé, en cm) · ma voiture roule comment ?
- [ ] Une mesure 10 fois plus grande (ou plus petite) que les autres → message ambre « Mesure encore une fois ? » avec « Je
      mesure encore » et « C'est juste ».
- [ ] Je change une seule chose : deux cartes touchées → « Choisis un seul changement » (ambre) ; roues, ballon (plus ou moins
      gonflé), poids (j'enlève, j'ajoute) ; pour les roues : roues avant **ou** roues arrière, puis le diamètre.
- [ ] Après 2 essais : « Encore un essai ? » ou « Ma voiture est prête » ; au 5e essai, le graphique directement ; « Retour » défait
      le dernier geste sans rien perdre.
- [ ] Mon graphique : une barre par essai, la distance écrite, le changement dessous, « Le plus loin » sous le meilleur.
- [ ] La bande orange et blanche ne cache jamais le bas d'un bouton ou d'un texte ; les prénoms se lisent sur la page Bravo.
- [ ] On peut toujours revenir en arrière : « Retour » sur chaque étape, après une photo prise, et sur la page Bravo (retour à
      la dernière étape de la séance, même en rouvrant une séance finie depuis Ma mission).
- [ ] Gabarits (page professeur) : imprimer à 100 %, le trait mesure 50 mm ; les languettes entrent dans les fentes.

## Voiture à ballon — jalon V3 (séance 5 et course au vidéoprojecteur)
Page professeur → « La course (vidéoprojecteur) » (d'abord en « Démonstration », puis avec le vrai dossier Voiture-ballon) :
- [ ] Les voitures du jour : nom, couleur et photo officielle de chaque équipe ; toucher une voiture la marque « Absente ».
- [ ] Couloirs du jour (2, 3 ou 4) → les poules ; toucher une voiture la fait changer de poule.
- [ ] Une course : « Top départ ! » (ou la barre d'espace), le chrono tourne ; « Arrivée » dans chaque couloir (ou les touches
      1 à 4) ; « N'arrive pas » avec la distance en cm ; « Faux départ » efface la course.
- [ ] Après les poules : les finales par niveau (principale, secondaire, tertiaire), courues de la dernière à la principale ;
      un podium par finale ; « Bravo à tous » avec le record de la classe.
- [ ] « Enregistrer les résultats » : course.json dans le dossier Voiture-ballon et dans le dossier de chaque équipe ;
      « Tableau (CSV) » s'ouvre dans le tableur ; « Diplômes de pilote » s'imprime en noir et blanc, une page par voiture.
- [ ] Page rechargée au milieu de la course : « Reprendre la course » repart où on en était.
- [ ] Côté élève, séance 5 : voiture prête, 3 règles, « Je regarde la piste ! », **Mon résultat** (message encourageant, ou
      « Le professeur te donnera ton résultat » et « Je regarde encore »), « Pourquoi ma voiture avance ? » (réponse écrite),
      bilan, photo finale.

## Voiture à ballon — jalon V4 (outil professeur)
Page professeur → « Suivre la classe » (essai sans élèves : `npm run exemples`, puis ouvrir `exemples/Voiture-ballon`) :
- [ ] Tuiles : nom et couleur de la voiture, matériel (kit complet ou écart), essais (nombre, meilleur, changements), course.
- [ ] Alertes en ambre : matériel pris différent du kit, voiture qui n'avance pas (deux essais à 0 cm), rien depuis 15 min.
- [ ] Bandeau « Piste » : longueur proposée d'après les meilleurs essais (vous la gardez ou la changez sur la piste).
- [ ] Fiche d'une équipe : onglets Essais (tableau, graphique, roues avant et arrière) et Voiture et course (matériel,
      carrosserie, résultat, réponse écrite « Pourquoi ma voiture avance ? »).
- [ ] Évaluation : les 7 critères (à valider), repères automatiques à côté, note /20, ceinture ; exports Excel, CSV, Carnet,
      feuilles ceinture.
- [ ] Patron pour la Cricut (SVG) : s'importe à la bonne taille (207 × 154 mm), découpe et plis sur deux calques.

## Voiture à ballon — atelier « Je dessine ma carrosserie », jalon D1
Écrans élèves (démonstration) → Ma mission (6 séances) → Séance 3 « Je dessine » :
- [ ] Ma mission : les 6 séances tiennent sans défilement.
- [ ] Je choisis une pièce : côté gauche, côté droit, capot, toit, arrière, chacune à l'endroit ; une coche verte sur les pièces décorées.
- [ ] Sur une pièce : toucher un dessin en bas, puis cliquer sur la pièce le pose ; Agrandir, Rapetisser, Tourner, J'efface, Annuler.
- [ ] Un dessin posé trop près d'un bord, d'un pli ou de la fente du toit est remis dans la pièce (« Je l'ai remis dans la pièce. », en ambre).
- [ ] Toute ma voiture : le patron entier avec les dessins, aux bons endroits ; « C'est fini ».
- [ ] Les dessins sont-ils assez gros et assez simples pour le stylo gel de 0,8 mm et le coloriage ?

## Voiture à ballon — atelier « Je dessine ma carrosserie », jalon D2
- [ ] « Nom » : le nom choisi en séance 1 s'écrit en majuscules à un trait, là où je clique ; trop long pour une pièce, il rapetisse (7 mm au moins).
- [ ] « Numéro » : 3 chiffres au plus, tapés au clavier ; « Texte » : 12 caractères au plus (lettres, chiffres, accents).
- [ ] « Crayon » : je dessine bouton appuyé ; le tracé est lissé, et coupé là où il sort de la pièce (message ambre).
- [ ] Sur un côté, « Pareil à droite » (ou « à gauche ») reproduit le dessin en miroir ; le texte reste lisible ; si l'autre côté a déjà des dessins, on me demande avant de les remplacer.
- [ ] Les lettres sont-elles assez grandes et nettes au stylo gel de 0,8 mm ?

## Voiture à ballon — atelier, retours de Thomas (déplacer, couleurs)
- [ ] Je fais glisser un dessin à la souris, en le prenant par le milieu ; lâché trop près d'un bord ou dehors, il revient dans la pièce (message ambre) ; Annuler le remet à sa place.
- [ ] Trois couleurs de stylo (bleu, rouge, marron), toujours avec leur nom : la couleur choisie s'applique aux dessins suivants et au dessin choisi.
- [ ] Dans le SVG pour la Cricut, les plis sont maintenant en vert (le rouge est un stylo).

## Voiture à ballon — atelier, jalon D3 (outil professeur)
« Suivre la classe » de la voiture (essai sans élèves : dossier exemples/Voiture-ballon) :
- [ ] Tuile : « Carrosserie : 3 dessins ✓ » pour une équipe qui a fini.
- [ ] Fiche → onglet Carrosserie : le patron décoré dans ses couleurs, les stylos utilisés, « Télécharger le patron (SVG pour la Cricut) » → carrosserie-Prenom_Prenom.svg.
- [ ] Bandeau « Piste » : « Tous les patrons (.zip) » → un SVG par équipe décorée.
- [ ] Dans Design Space : calques decoupe (noir), plis (vert), dessin-bleu / dessin-rouge / dessin-marron ; la Cricut demande de changer de stylo entre deux couleurs ; taille 207 × 154 mm.
