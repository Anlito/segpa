# Recette manuelle — jalons 1 à 4 (écrans élèves, outil professeur, évaluation du taille-crayon)

À faire par Thomas sur **un poste élève du collège** (Chrome ou Edge), avant la première séance.
La recette automatique (`npm run recette`, résultat dans `RECETTE-AUTO.md`) a déjà vérifié le parcours complet avec une
caméra simulée ; ici on vérifie ce qu'une machine de test ne peut pas vérifier.

## Préparer
0. `site/taille-crayon/donnees/modele.js` est rempli pour le « Cat » NO.722A (02/11/2026) : pièces, photos, gestes, plages de mesure.
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
- [ ] Dans Design Space, chaque dessin est un seul objet : un clic sélectionne un mot, un numéro (« 10 ») ou un tampon (damier) en entier.

## Film en stop motion — jalon M1 (écran de tournage, univers « Cinéma en briques »)
À faire sur un vrai poste du collège, avec la webcam sur son support et une plaque devant (ouvrir
`site/stop-motion/index.html`, ou `?enseignant=1` pour essayer sans rien enregistrer).
- [ ] Accueil, Ma mission : studio sombre, clap en haut, bande de film en bas ; boutons et cartes en briques, 5 séances « J'invente · Je construis · Je filme · Je filme · Je projette ».
- [ ] Séance 3 : 3 rappels (la caméra ne bouge pas · je bouge un tout petit peu · je prends une photo), puis l'écran de tournage.
- [ ] La webcam s'allume dans le cadre de cinéma ; si elle est débranchée : message ambre et « Réessayer » ; avec 2 caméras, « Autre caméra ».
- [ ] Le gros bouton jaune et la **barre d'espace** prennent une image (déclic, flash) ; « Image 1 / 30 », la barre avance ; la pellicule montre les 6 dernières.
- [ ] Le **calque** (l'image précédente à 40 %) aide à bouger un tout petit peu ; « Calque » et « Grille » se coupent et se remettent.
- [ ] « Enlever la dernière » : la dernière image en grand, « J'enlève cette image ? » ; « Non, je la garde » ne change rien ; « Oui, j'enlève » l'enlève du film (le fichier reste dans le dossier).
- [ ] « Voir » : les 10 dernières images en boucle (6 par seconde) ; « Stop » revient à la caméra.
- [ ] « Pause café » : écran noir « La caméra ne bouge pas ! » ; « Je reviens » (ou la barre d'espace) revient au tournage.
- [ ] Le conseil en bas change toutes les 40 secondes.
- [ ] Dans le dossier de l'équipe : `photos/film/0001.jpg`, `0002.jpg`… ; 10 images prises vite : le poste ne ralentit pas.
- [ ] « J'arrête pour aujourd'hui », rangement, Bravo ; en séance 4, le film reprend là où il en était (« Image 12 / 30 »).
- [ ] Les briques bougées entre deux images se voient-elles bien avec la webcam du collège (lumière, netteté) ?

## Film en stop motion — jalon M2 (séance 5 et séance cinéma)
Élèves (`site/stop-motion/index.html`, après avoir tourné quelques images en séance 3) :
- [ ] « Je choisis le titre de mon film » : 6 cartes-idées (`donnees/idees.js`) ou « J'écris un titre » (40 caractères au plus) ; la carte-titre s'affiche comme au début du film.
- [ ] « Je regarde mon film » : le film tourne en boucle ; Lent, Normal, Rapide (4, 6, 10 images par seconde) changent la vitesse tout de suite ; la vitesse choisie est gardée.
- [ ] « J'enlève les images ratées » : toucher une image la grise (« Enlevée »), la toucher encore la remet ; « 14 images gardées » ; plusieurs pages si le film est long.
- [ ] « Voici mon film ! » : la carte-titre, les images gardées, « Un film de Léa et Tom » ; « Revoir ».
- [ ] Séance cinéma, puis le bilan (3 phrases, smileys).

Professeur (`site/stop-motion/cinema.html`, au vidéoprojecteur) :
- [ ] « Essayer avec 2 films d'exemple » marche sans dossier.
- [ ] « Ouvrir le dossier Stop-motion » : une carte par équipe (titre, prénoms, images, durée) ; une équipe sans image n'est pas au programme ; toucher une carte l'enlève du programme ou l'y remet.
- [ ] « On lance la séance » : plein écran ; chaque film avec son titre et son générique, à la vitesse choisie par l'équipe ; « Applaudissements ! » puis le film suivant au bout de 5 secondes.
- [ ] Pupitre : Précédent, Pause, Recommencer, Lent / Normal / Rapide (pour ce film), Suivant, Programme ; clavier : Espace, ←, →, R.
- [ ] « Bravo à tous les réalisateurs ! » avec tous les titres ; « Tout revoir ».
- [ ] Au vidéoprojecteur de la salle : les images sont-elles assez nettes, le texte assez grand ?

## Film en stop motion — jalon M3 (séances 1 et 2)
Séance 1 (`site/stop-motion/index.html`) — le scénario (retours de Thomas du 01/11 : pas de photo du storyboard, 3 questions en plus, un récap) :
- [ ] Les 3 règles, puis 7 questions, chacune avec 6 cartes-idées ou « J'écris mon idée » : Qui est mon héros ? · Où se passe mon histoire ? · Que fait mon héros au début ? (Début) · Quel problème arrive ? · Comment le problème est réglé ? (Milieu) · Comment finit mon histoire ? (Fin) · Quels objets je dois construire ? (3 cartes au plus).
- [ ] Les idées (`donnees/idees.js`) vous conviennent-elles ? Elles sont écrites sans « il » ni « elle », pour aller avec tous les héros.
- [ ] Le titre, puis le récap : le titre, 3 briques (« Un dragon, sur la Lune, dort tranquillement. » · « Une tempête arrive. Un ami vient aider. » · « C'est la fête ! ») et « Mes objets : … », lus à voix haute.
- [ ] Séances 3 et 4 : « Je relis mon histoire » (le même récap) avant les rappels du tournage. En séance 5, le titre est déjà là.

Séance 2 :
- [ ] « Je prends ma plaque » ; décor, héros, objets : chaque consigne rappelle l'histoire (« Mon lieu : sur la Lune », « Mes objets : une maison, un arbre ») et est suivie d'une photo.
- [ ] « Je secoue doucement la table » ; rangement : briques par couleur, décor sur la plaque, nom sur la plaque.

## Film en stop motion — jalon M4 (outil professeur)
Essai sans élèves : `npm run exemples`, puis `site/stop-motion/prof.html` → « Ouvrir le dossier de la classe » → `exemples/Stop-motion`.
- [ ] Tuiles : titre du film, « Scénario : 7 / 7 ✓ », « Plaque : prise ✓ · rangée ✓ », « Film : 18 / 30 images · normal ».
- [ ] Alertes (ambre) : « Pas encore d'image dans cette séance » (séance 3 ou 4 commencée depuis 25 min) ; « Plaque prise, rangement pas fait » (fin de séance 2).
- [ ] Bandeau « Films » : nombre de films à 30 images, lien vers la séance cinéma.
- [ ] Fiche d'une équipe → « Scénario » : début, milieu, fin et les 7 réponses ; « Film » : le film avec titre et générique, toutes les images (les enlevées grisées), images prises par séance.
- [ ] « Évaluation » : les 7 critères proposés (à valider ou à changer dans `donnees/criteres.js`), repères à côté, ceinture d'après le critère « Son film est fini » ; exports Excel, CSV, Carnet de classe, feuilles ceinture.
- [ ] Les 4 aides de différenciation proposées vous conviennent-elles ? (scénario dicté à l'adulte · rôles photographe / animateur · film plus court accepté · élève rapide tuteur)

## Outils professeur (les 3 projets) — nouvelle interface (01/11/2026)
- [ ] En-tête sur une ligne : logo du projet, « Professeur », dossier et classe, « En direct ».
- [ ] Accueil : le projet en grand, « Ouvrir le dossier de la classe » mis en avant, le chemin du dossier en étiquettes.
- [ ] Classe : bandeau violet des aides ; 3 compteurs (équipes, aides en cours, à regarder) ; l'avancement de chaque séance en barres (finies en vert, en cours hachurées) ; outils du projet et exports côte à côte.
- [ ] Filtres : Toutes · À regarder · En séance N (avec le nombre d'équipes).
- [ ] Tuiles : prénoms, « Active · il y a 2 min » (point vert), petite photo, frise des séances sur une ligne, lignes du projet, alertes en ambre avec icône.
- [ ] Fiche d'une équipe : résumé toujours visible (photo, frise, lignes, alertes), onglets en pastilles (nombre de photos sur Album), bilan des séances en cartes avec barre d'avancement ; ← → pour changer d'équipe, Échap pour revenir.

## Film en stop motion — avis du professeur sur le scénario (retour de Thomas du 01/11)
Professeur (`stop-motion/prof.html`) :
- [ ] Tuiles : « Histoire : Un dragon, sur la Lune… / Une tempête… / C'est la fête ! » et « Scénario : 7 / 7 ✓ · avis à donner » (puis « validé ✓ », « à revoir » ou « corrigé, à relire »).
- [ ] Fiche → Scénario : « Ton avis sur le scénario » : ✓ Validé ou ✎ À revoir, un petit mot, « Envoyer à l'équipe » ; « Envoyé … · pas encore vu / vu par l'équipe ✓ ».
Élèves (séance suivante, écran « Je relis mon histoire », en séances 2, 3 et 4) :
- [ ] Validé : « Ton professeur a lu ton histoire. » avec le mot (🔊), puis le récap.
- [ ] À revoir : le mot en ambre, « Je change une réponse » (choisir la réponse, puis la carte-idée ou le clavier) ou « Je garde mon histoire ». Le même avis n'est montré qu'une fois.

## Taille-crayon — le modèle « Cat » NO.722A (retours de Thomas du 02/11)
- [ ] « L'objet du jour » : la photo du taille-crayon.
- [ ] Séance 1, avant chaque pièce : la photo du geste et un conseil, sans le nom de la pièce (1 la boîte transparente · 2 dévisser à l'arrière · 3 les 2 pièces qui poussent · 4 la tête bleue, ses oreilles l'ouvrent · 5 tourner la bague · 6 déclipser sans forcer · 7 la dernière pièce).
- [ ] « Quel est son nom ? » : 7 cartes avec photo (réceptacle à copeaux, vis, ressorts, serre-crayon, manivelle avec la fraise, plaque rose, corps) ; tableau de 7 cases.
- [ ] Séance 2 : le corps se mesure en 3 fois (hauteur, largeur, longueur), puis la manivelle ; hors de la plage : « Mesure encore une fois », jamais la valeur.
- [ ] Séance 3 : pour chaque pièce, son conseil de remontage (ex. « J'enfonce la manivelle, puis je tourne la bague pour la bloquer. »).
- [ ] Outil professeur : « Mesures : corps H 9 cm ✓, l 4,5 cm ✓, L 5,5 cm ✓ » sur la tuile ; onglet Séance 2 avec une ligne par dimension.
