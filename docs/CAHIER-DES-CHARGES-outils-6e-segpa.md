# Cahier des charges — outils 6e SEGPA (socle commun)

Version 1 · 27/10/2026 · à lire **avant** les trois briefs de projet :

| Document | Projet |
|---|---|
| `BRIEF-CLAUDE-CODE-taille-crayon.md` | Je démonte un objet technique (taille-crayon à manivelle, 3 séances) |
| `BRIEF-CLAUDE-CODE-voiture-ballon.md` | Course de voitures à ballon sur une ligne droite |
| `BRIEF-CLAUDE-CODE-stop-motion.md` | Film en stop motion avec des briques |
| `BRIEF-CLAUDE-DESIGN-6e-segpa.md` | Les trois identités visuelles et les écrans à maquetter |

Ce document dit **ce qui est commun** aux trois outils (squelette, règles de lisibilité, sauvegarde, outil professeur,
évaluation). Chaque brief de projet ne dit que ce qui lui est propre.

---

## 0. Décisions de Thomas (27/10/2026) — elles priment sur le reste du document

| Sujet | Décision |
|---|---|
| Ordre des projets | **taille-crayon → voiture à ballon → stop motion** |
| Note | **les deux** : ceinture / smileys pour les élèves, **note /20 visible seulement du professeur** |
| Formule | **celle de l'Excel** : Rouge 0 · Jaune 1 · Vert clair 2 · Vert foncé 3, score ÷ 21 × 20 (7 critères) |
| Webcams | **une par binôme** |
| Prénoms | **boutons-prénoms** depuis un fichier de classe sur le réseau (pas de photo) |
| Voiture à ballon | **4 séances** · classement par **ordre d'arrivée** · le classement **n'entre pas** dans l'évaluation |
| Stop motion | **5 séances** · **projection depuis le site** (pas de fichier vidéo dans la première version) · plaques : Thomas en trouve 3 de plus (8 pour 8 binômes) |
| Taille-crayon | l'outil **complète** la fiche : le dessin à la taille réelle reste sur papier · **4 ceintures** (4 niveaux) |
| Photos | **objets et mains seulement**, pas de visages |
| Noms | dépôts `Anlito/demontage-taille-crayon`, `Anlito/course-voiture-ballon`, `Anlito/stop-motion-briques` ; dossier réseau `… › COMMUN › TECHNOLOGIE › <NOM DU PROJET>` |

**Conséquence à surveiller (§8.3)** : le Carnet de classe calcule sa propre note à partir des niveaux 1 à 4 (moyenne × 5). Les notes de
l'Excel et du Carnet seront donc différentes pour les mêmes couleurs. L'outil exporte les **niveaux** vers le Carnet ; **la note de référence
est celle de l'Excel / de l'outil professeur**. Ne pas laisser croire que les deux concordent.

Toujours ouvertes : modèle exact de taille-crayon et noms de ses pièces, matériel de la voiture, nom des niveaux de ceinture,
calendrier par période, compétences à valider, accords pour l'affichage des photos.

---

## 1. L'idée en quatre lignes

- Trois projets, **trois outils séparés** (un dépôt chacun), **trois identités visuelles** différentes, mais **le même
  squelette** : l'élève retrouve les mêmes écrans, les mêmes boutons, aux mêmes endroits, d'un projet à l'autre.
- Ce sont des outils **très simplifiés** par rapport à tes autres projets : peu de texte, pictogrammes, une chose par écran,
  lecture à voix haute. Pas de programmation (donc **pas de Labo Blocs, pas d'Arduino**).
- Ils servent à trois choses : **apprendre à utiliser l'ordinateur** (ouvrir, enregistrer, photographier, retrouver son travail),
  **garder une trace** par la photo, et **respecter le matériel** (compter, ranger, vérifier).
- Un **outil professeur** par projet (même organisation que `prof.html` du distributeur de céréales) pour suivre les équipes
  en direct et les évaluer, avec export vers l'Excel de ton projet et vers le **Carnet de classe**.

## 2. Public et contraintes

- 6e SEGPA, environ 16 élèves, **8 binômes** (d'après ta préparation du projet taille-crayon). Séances de 55 minutes.
- Difficultés d'attention et de lecture : voir §4. Ces élèves sont aussi ceux qui ont aimé le concours d'avions en papier
  (pliage, décoration) : l'outil doit **valoriser le résultat visible** (photo, film, podium), pas le texte.
- Postes élèves du collège sous Windows, Chrome ou Edge, webcam. **Une webcam par binôme** (confirmé). Reste à
  vérifier : résolution, postes fixes ou portables (question 1, §11).
- Hors ligne, depuis un dossier réseau (`file://`), aucun CDN, aucun compte, scripts classiques, tout en français — mêmes
  contraintes que `BRIEF-NOUVEAU-PROJET.md` §2 du dépôt `atelier-cereales`.
- Dépôt public : **aucune vraie donnée d'élève** (prénoms fictifs dans les exemples, listes de classe hors dépôt).

## 3. Le squelette commun (mêmes écrans, mêmes positions dans les trois outils)

| N° | Écran | Contenu |
|---|---|---|
| 1 | **Accueil** | deux gros boutons : « Je commence » / « Je continue ». Choix du binôme : deux prénoms (voir §6.3). |
| 2 | **Ma mission** | une frise de **3 à 5 étapes** (les séances) : chaque étape = un grand pictogramme + un mot, état **fait / en cours / à faire** (✓ ● ○ — jamais la couleur seule). |
| 3 | **Une étape** | **une consigne par écran** : pictogramme, 8 mots au plus, bouton 🔊, gros bouton « C'est fait » (ou « Suivant »). Barre de progression « 3 sur 7 ». |
| 4 | **Photo** | aperçu de la caméra, gros bouton 📷, puis « Je garde » / « Je recommence ». |
| 5 | **Mon album** | toutes les photos de l'équipe, rangées par séance, en grand au toucher / au clic. |
| 6 | **Rangement** | liste en images (« je range », « je compte », « je nettoie »), chaque ligne se coche ; **photo du poste rangé**. Propre au respect du matériel. |
| 7 | **Mon bilan** | 2 ou 3 phrases courtes avec trois smileys (😀 😐 😕) — reprend l'auto-évaluation de ta fiche taille-crayon. |
| 8 | **Bravo** | écran de fin de séance : l'élève voit ce qu'il a fait (photos), pas une note. |

Présents sur **tous** les écrans, au même endroit :
- 🏠 retour à « Ma mission » (en haut à gauche) ;
- 🔊 « lire à voix haute » (à côté de la consigne) ;
- 🙋 **« J'ai besoin d'aide »** (en bas à droite) : l'élève lève la main, l'outil l'écrit dans le fichier de l'équipe et
  l'outil professeur le montre (voir §7) — fidèle à la règle « si ça bloque, je lève la main, je ne force pas » ;
- ⏱ un **minuteur visuel** facultatif (un cercle qui se vide), réglé par séance dans les données du projet (le
  déroulé minuté du taille-crayon donne déjà les durées).

## 4. Règles de lisibilité (valables pour les trois outils)

Pour des élèves qui lisent peu et décrochent vite :

1. **Une seule action par écran.** Pas de défilement : tout tient à 1366 × 768 sans barre de défilement.
2. **Consignes de 8 mots au plus**, verbes d'action (« Prends la photo », « Range la pièce »), jamais de négation seule.
   Chaque consigne a un **pictogramme** (même pictogramme pour la même action dans les trois outils : 📷 photographier,
   📏 mesurer, 🧹 ranger, 🔧 outil, 🙋 aide, ✓ fait).
3. **Lecture à voix haute** de chaque consigne (`speechSynthesis`, voix française du poste). Si le poste n'a pas de voix
   française, masquer le bouton plutôt que lire avec un accent anglais. **À tester sur un poste du collège** avant de
   compter dessus.
4. **Police lisible** (proposition : *Lexend*, conçue pour faciliter la lecture, licence ouverte, copiée **en local** dans
   le dépôt), corps **≥ 22 px**, interligne large, jamais de texte justifié, pas de majuscules continues.
5. **Cibles larges** : boutons ≥ 72 px de haut, espacés ; clic simple partout ; **pas de glisser-déposer obligatoire**, pas
   de double-clic, pas de clavier obligatoire. Les nombres se saisissent avec un **pavé numérique à l'écran**.
6. **Contrastes forts**, aucune information portée par la couleur seule, pas d'animation qui clignote.
7. **Ton bienveillant** : on décrit, on ne reproche pas (« Ta pièce n'est pas encore dans la boîte », pas « Erreur »).
   Écarts en **ambre**, jamais en rouge. Une vérification ne donne **jamais la réponse**.
8. **Le travail visible compte plus que le texte** : chaque étape se termine si possible par une **photo**.
9. Sons : seulement de petits sons de confirmation, coupables d'un bouton 🔇 (la salle est déjà bruyante).

## 5. Webcam et photos

- Reprendre le code webcam existant (`site/js/prof-dessins.js` dans `atelier-cereales` : choix de la caméra, mémorisation
  par poste, photo JPEG enregistrée dans le dossier de l'équipe). Une clé de stockage **par projet** (pas de mélange entre
  les trois outils sur un même poste).
- Photos en **JPEG 1280 × 720, qualité ≈ 0,8** (≈ 150 Ko) ; fichiers dans `photos/` du dossier de l'équipe, **pas** dans
  le `.json` (qui reste petit et lisible).
- Messages de caméra en français simple, avec la prochaine action : « Je ne vois pas la caméra. Branche-la, puis appuie
  sur *Réessayer*. » · « Une autre page utilise la caméra. Ferme-la, puis réessaie. » · « Autorise la caméra en haut de
  l'écran. »
- **Droit à l'image** : l'outil dit « Photographie l'objet, pas les visages ». Les photos restent dans le dossier réseau de la classe,
  rien n'est envoyé ailleurs. Les photos affichées en classe ou dans un portfolio se font « avec accord » (ta préparation).
  La liste des accords n'est pas gérée par l'outil.

## 6. Équipes, sauvegarde, dossiers

### 6.1 Reprise de `atelier-cereales`

Reprendre **tels quels** `session.js`, `fichiers.js`, `moteur/progression.js` : une sauvegarde par équipe
(`Prénom_Prénom.json`), réécrite toute seule, copie de secours dans le navigateur, droit d'écriture demandé au premier
vrai geste, **jamais d'écrasement**, une sauvegarde déjà présente est proposée à l'ouverture.
Dossier de l'équipe : `… › COMMUN › TECHNOLOGIE › <NOM DU PROJET> › Prénom_Prénom` avec un sous-dossier `photos/`.
Firefox : pas de choix de dossier, « Enregistrer » télécharge le fichier (message clair).

### 6.2 Contenu de la sauvegarde

Rubriques par séance : étapes faites (horodatées), photos (nom de fichier + légende + séance), réponses, bilan smileys,
demandes d'aide (horodatées, résolues ou non), contrôle du matériel (nombre pris / rendu), **observations** pour le
professeur (voir §7.3). Le `.json` contient un numéro de version et le nom du projet (`APPLICATION`, `projet`) ; les anciennes
sauvegardes restent lisibles après une mise à jour du site.

### 6.3 Choisir son prénom sans taper

Le prénom est le point de friction pour des élèves en difficulté de lecture-écriture. Proposition :
- le professeur dépose un fichier `classe.json` (prénoms de la classe) **dans le dossier du projet sur le réseau**, jamais
  dans le dépôt ;
- l'élève voit des **boutons-prénoms** (éventuellement avec la photo du trombinoscope si tu en as une, `photos/` de la classe) et
  touche les deux prénoms du binôme ;
- sans `classe.json`, repli sur la saisie au clavier (deux champs, majuscule automatique).
**Décision** : boutons-prénoms (sans photo) ; repli sur la saisie au clavier si `classe.json` est absent.

## 7. Outil professeur (`prof.html`, un par projet, même organisation)

Reprendre `site/prof.html`, `site/js/prof.js`, `site/css/prof.css`, `moteur/classe.js`, `moteur/xlsx.js` d'`atelier-cereales`
en **simplifiant**, puis adapter les onglets.

### 7.1 Écrans

- **Accueil** : ouvrir le dossier de la classe (suivi en direct), reprendre le dernier dossier, importer des `.json`.
- **Classe** (lisible au vidéoprojecteur) : **une tuile par équipe** — prénoms, frise des étapes ✓ ● ○, **dernière photo**
  (miniature), dernière activité, 🙋 aide demandée, rangement fait ou non. Tri par « a besoin d'aide » d'abord.
  **Alerte « aide »** (son + bandeau), comme l'alerte « bloqué » du distributeur. Le suivi est « en direct » à la
  cadence de l'enregistrement automatique (donc avec un léger décalage — le dire : « lu à 10:42 »).
- **Équipe** (‹ › entre équipes, Échap pour revenir), onglets : **Bilan** · **Album** (photos en grand, légende,
  téléchargement) · **Évaluation** (§8) · **Historique** (étapes horodatées, demandes d'aide).
- Bandeau : état du suivi, **Excel**, **CSV**, **Carnet de classe**, **Imprimer** (feuille ceinture / smileys), Autre classe.
- **Atelier enseignant** : tous les écrans élèves ouverts, rien n'est enregistré (sert de démonstration et de corrigé).
- `npm run exemples` : équipes **fictives** (prénoms inventés, photos de démonstration) pour essayer `prof.html`.

### 7.2 Ce qu'on ne reprend pas

- **Pas de note évolutive à pénalités** (−10 % par indice, −5 % par vérification ratée) : ce principe du distributeur est
  adapté à des élèves de 4e qui programment, pas à des 6e SEGPA ; ici l'évaluation est **observée** par le professeur.
- Pas de « Mettre à jour les exercices » (il n'y a pas de parcours Labo Blocs) : le contenu vient de `donnees/*.js`.
- Pas de carnet à onglets de types « classement / algorigramme ».

### 7.3 Observations automatiques (suggestions, jamais des notes)

L'outil sait des choses utiles pour évaluer ; il les **affiche à côté** de chaque critère comme repères, sans jamais
poser un niveau tout seul : étapes faites dans l'ordre ? rangement validé par photo ? nombre pris = nombre rendu ?
demandes d'aide (nombre) ? Le professeur décide.

## 8. Évaluation

### 8.1 Grille (celle de ton Excel, à garder)

- **7 critères** par projet, regroupés par séance, chacun à **4 niveaux** : Rouge · Jaune · Vert clair · Vert foncé
  (valeurs 0-1-2-3 dans ton Excel du taille-crayon ; 1-2-3-4 dans le Carnet de classe, voir §8.3).
- Dans l'outil, chaque niveau a **couleur + lettre ou symbole** (R · J · V · VV, ou ✗ ~ ✓ ★) : jamais la couleur seule.
- Remplissage rapide : clic sur la case = niveau suivant, ou 4 boutons colorés. Colonne **Commentaire** libre.
- Critères d'évaluation **propres à chaque projet** (voir chaque brief), toujours rattachés à une **compétence du programme
  cycle 3** (§8.4). Pour le taille-crayon : ceux de ton Excel, tels quels.

### 8.2 Note : une décision à prendre avant de coder (question 1, §11)

Tes documents se contredisent :
- la **préparation enseignant** dit « *pas de note chiffrée : ceinture ou smiley* » ;
- l'**Excel** calcule un « Score brut /21 », une « Note /20 » et une appréciation (≥ 16 « Très satisfaisant », ≥ 12 « Satisfaisant »,
  ≥ 8 « Fragile », sinon « Insuffisant »).

**Décision** : l'outil calcule tout (niveaux → score → note → appréciation → **ceinture**). Les élèves ne voient **jamais** de note : ils
voient leurs photos, leurs smileys et leur ceinture. La note /20 n'apparaît que dans l'outil professeur et dans les exports (Excel, CSV).
Un réglage « *Afficher la note chiffrée* » reste disponible pour la masquer d'un export ou d'une impression.

### 8.3 Deux formules différentes pour la même échelle à 4 couleurs

| | Rouge | Jaune | Vert clair | Vert foncé | Note /20 |
|---|---|---|---|---|---|
| **Excel taille-crayon** | 0 | 1 | 2 | 3 | somme ÷ 21 × 20 (tout rouge = 0) |
| **Carnet de classe** (`js/model.js`) | 1 | 2 | 3 | 4 | moyenne × 5 (tout rouge = 5, tout vert foncé = 20) |

Les deux outils donneront des notes différentes pour les mêmes couleurs (par exemple un élève « tout jaune » : 6,7 dans l'Excel,
10 dans le Carnet). **Tranché : formule de l'Excel.** L'outil exporte les **niveaux** (1 à 4 = Rouge à Vert foncé) vers le Carnet de classe, qui recalcule sa propre note
avec sa formule : prévenir Thomas dans l'export (« la note du Carnet peut différer de celle de l'Excel »).

### 8.4 Rattachement au programme (cycle 3, 6e)

Le référentiel de ton Excel utilise des intitulés (« Pratique technologique », « Modélisation et simulation », « Connaissance
technologique »…) qui **ne sont pas** les « compétences travaillées » du programme de sciences et technologie du cycle 3.
Les sept compétences travaillées (d'après le texte du programme consulté sur le site de l'académie de Guyane ; **à vérifier
sur Éduscol avant d'écrire les libellés définitifs** — la page consultée ne donne pas la référence du BO) :

1. Pratiquer des démarches scientifiques et technologiques (domaine 4)
2. Concevoir, créer, réaliser (domaines 4, 5)
3. S'approprier des outils et des méthodes (domaine 2)
4. Pratiquer des langages (domaine 1)
5. Mobiliser des outils numériques (domaine 2)
6. Adopter un comportement éthique et responsable (domaines 3, 5)
7. Se situer dans l'espace et dans le temps (domaine 5)

Chaque brief propose un rattachement **provisoire** critère → compétence ; Thomas le valide ou le corrige, **Claude Code
n'invente aucun libellé**. Le thème « Matériaux et objets techniques » est le plus proche des trois projets.

### 8.5 Exports

1. **Excel** : le même classeur que `Evaluation_projet_demontage.xlsx` (4 onglets : Évaluation, Synthèse classe, Légende,
   Référentiel), mêmes formules, mêmes menus déroulants, mêmes couleurs, avec deux corrections : (a) la ligne d'exemple de la
   légende est vraiment grise et en italique et **n'entre pas** dans la synthèse (aujourd'hui la ligne 3 est comptée) ;
   (b) un onglet **Pronote** (correspondance niveaux → « Non atteint / Partiellement atteint / Atteint / Dépassé ») comme dans
   tes autres grilles. L'onglet « Légende » fait déjà office de mode d'emploi. Générer avec le `moteur/xlsx.js` du modèle, **sans bibliothèque**.
2. **Carnet de classe** : fichier `…labo-resultats.json` **au format que le Carnet sait déjà lire**
   (`gestion-de-classe-et-suivi-projet › js/labo-blocs.js` : `format: 'labo-blocs/resultats'`, `version: 1`, `competences[{ code, libelle }]`,
   `equipes[{ eleves[prénoms], classe, niveaux{ code → 1…4 }, commentaire }]`). Regarder la fonction qui l'écrit
   (`LB.resultatsClasse`, appelée dans `prof.js` d'`atelier-cereales`) et reproduire **la même forme**. Si la clé `format` pose
   problème, proposer d'élargir `labo-blocs.js` du Carnet plutôt que de tordre le fichier.
   Le Carnet relie un critère à un `libelle` **identique** (sans accents ni casse) au libellé du critère ou au libellé Pronote du
   projet : créer d'abord les critères dans le projet du Carnet avec les mêmes libellés (le programme intégré au Carnet est
   celui du cycle 4 : ici les critères sont **libres**).
3. **CSV** (tableau de classe) · 4. **Feuille imprimable** « ceinture / smileys » par élève, en **noir et blanc**, motif et lettre au
   lieu de la couleur · 5. **Album** imprimable des photos d'une équipe (A4, 6 photos par page).

## 9. Ce que Claude Code doit reprendre d'`atelier-cereales`

| Catégorie | Fichiers |
|---|---|
| **Tels quels** | `session.js`, `fichiers.js`, `moteur/progression.js`, `moteur/classe.js` (tableau, alertes), `moteur/xlsx.js`, `prof-dessins.js` (webcam), `tools/serve.js`, `tools/archive.js`, `tools/recette.js`, `.github/workflows/pages.yml`, `tests/outils.js` |
| **À adapter fortement** | `accueil.js` (boutons-prénoms), `prof.js` / `prof.html` / `prof.css` (tuiles, album, évaluation), `icones.js`, `atelier.css` → **charte du projet** |
| **À écrire** | les écrans élèves (§3), `donnees/projet.js` (`definirProjetAtelier({ id, titre, dossier, accent })`), `donnees/etapes.js` (les séances, leurs étapes, textes, pictogrammes, durées), `donnees/criteres.js`, `donnees/rangement.js` |
| **Ne pas reprendre** | `exercices.js`, `mise-a-jour.js`, `moteur/notation.js` (pénalités), parcours et carnet à types (`carnet.js`, `carnet-ecran.js`), `carte-virtuelle.js`, tutoriel de câblage |

Tout le contenu pédagogique est dans des **fichiers de données** (`definirXxx({...})`) que Thomas peut corriger sans toucher au
code. Un seul fichier d'identité (`donnees/projet.js`) : clés de stockage, noms d'export, titres, dossier réseau, couleur d'accent.

## 10. Tests et recette

`npm test` (moteur : sauvegarde, étapes, évaluation, export Carnet, export Excel relu par `openpyxl` ou équivalent) et
`npm run recette` (Chrome et Edge, `file://` et serveur) : parcours complet d'une équipe fictive, **pas de défilement** à
1366×768 et 1920×1080, aucune requête hors du site, aucune erreur console, enregistrer / fermer / rouvrir / reprendre, fichier
lu par `prof.html`, **caméra simulée** (flux de test) pour photographier, export Carnet réimporté par le Carnet. Résultat dans `RECETTE-AUTO.md`.
Essai réel de Thomas sur un poste du collège (webcam, voix, droits d'écriture du dossier réseau) avant la première séance.

## 11. Questions encore ouvertes

Réglées le 27/10/2026 : note, formule, webcams, prénoms, nombre de séances, ordre, noms, droit à l'image (voir §0). Restent :
1. **Postes** : fixes ou portables ? **voix française** disponible (à tester) ?
2. **Calendrier** : dans quelle période passent les trois projets ? (Le plan de l'année mentionne labyrinthe carton, feu tricolore,
   distributeur simplifié, impression 3D : où s'insèrent-ils ?)
3. **Compétences** : valides-tu le rattachement des critères au programme du cycle 3 (§8.4) ?
4. **Niveaux de ceinture** : noms et couleurs des 4 niveaux, et règle de calcul (voir le brief du taille-crayon).
5. **Accords** pour l'affichage des photos : géré hors de l'outil ?

## 12. Ordre de travail conseillé

1. **Taille-crayon d'abord** : tes documents existent, le contenu est connu, et il valide tout le socle (étapes, photo, album,
   rangement, outil professeur, évaluation, exports). Le brief prévoit une recette avec toi avant de passer au suivant.
2. **Voiture à ballon** : reprend le socle ; ajoute essais mesurés, course, podium (le matériel exact reste à confirmer).
3. **Stop motion** : le plus technique (capture image par image, papier calque, lecture, export vidéo).
4. Pour chaque outil : lire ce cahier des charges + le brief, **proposer un plan court** et le faire valider, coder par étapes
   avec recette après chaque étape.

## 13. Critères de réussite

- Une équipe fait **tout** le projet sans quitter l'outil, sans que le professeur touche son clavier, sauf pour les demandes d'aide.
- Un élève qui change de projet **retrouve** les mêmes écrans et les mêmes boutons.
- Le professeur voit en un coup d'œil qui a besoin d'aide, qui a fini, qui n'a pas rangé, et sort l'évaluation vers l'Excel et le Carnet.
- Aucune dépendance en ligne, aucune donnée d'élève dans le dépôt, anciennes sauvegardes toujours lisibles.
