# Brief — « Je démonte un objet technique » (taille-crayon à manivelle) · 6e SEGPA

À donner à Claude Code. **Lire d'abord** `CAHIER-DES-CHARGES-outils-6e-segpa.md` (squelette, lisibilité, sauvegarde, outil
professeur, évaluation) et `BRIEF-NOUVEAU-PROJET.md` du dépôt `Anlito/atelier-cereales` (carte des fichiers à reprendre).
Ce brief ne contient que ce qui est **propre au taille-crayon**.

Dépôt proposé : `Anlito/demontage-taille-crayon` (à confirmer). Dossier réseau : `… › COMMUN › TECHNOLOGIE › DEMONTAGE TAILLE-CRAYON › Prénom_Prénom` (à confirmer).

---

## 1. Le projet en deux mots

Binômes de 6e SEGPA. Ils **démontent** un taille-crayon à manivelle (pièce par pièce, rangées dans une boîte), **mesurent et
dessinent deux pièces à leur taille réelle**, puis **remontent** l'objet et le testent. Objectifs (préparation enseignant) :
notion d'objet technique et de fonction d'une pièce, manipuler un tournevis en sécurité, travailler en binôme, autonomie par
une fiche support. 3 séances de **55 minutes**, 8 binômes. **Pas de note chiffrée affichée aux élèves.**

## 2. Les documents fournis (source de vérité)

| Fichier | Rôle dans l'outil |
|---|---|
| `Fiche_eleve_demontage_taille-crayon.docx` (4 pages) | contenu des étapes et des écrans ; **le texte est repris tel quel** (consignes, cases à cocher, questions, smileys) |
| `Introduction_projet_demontage.pptx` (7 diapositives) | écran d'ouverture de la séance 1 : « C'est quoi un objet technique ? », les 4 étapes de la mission, **l'objet du jour**, les 3 règles de sécurité, le programme des 3 séances |
| `Preparation_enseignant_demontage.docx` | déroulé minuté, matériel, vigilances, différenciation → **outil professeur** et minuteurs |
| `Evaluation_projet_demontage.xlsx` | les 7 critères et la grille 4 couleurs → **évaluation** de l'outil professeur et export Excel |

Reprendre les images et les pictogrammes du PowerPoint (extraire les médias du `.pptx`) quand ils sont libres de droits ; sinon
dessiner des pictogrammes originaux. Ne pas copier la mise en page du PowerPoint : l'outil a sa propre charte (voir Claude Design).

## 3. Ce que l'outil remplace et ce qu'il laisse sur papier

| Élément | Papier | Outil |
|---|---|---|
| Tableau des pièces (S1) | **remplacé** : photo + nom + case de la boîte, ligne par ligne | oui |
| **Dessin à la taille réelle sur quadrillage (S2)** | **reste sur papier** (1 carreau = 1 cm, c'est le but pédagogique) | l'outil photographie le dessin et note la longueur mesurée |
| Cases de fin de séance, questions de compréhension, smileys (S1, S3) | **remplacé** | oui |

**Décision de Thomas (27/10/2026)** : l'outil **complète** la fiche ; le dessin à la taille réelle reste sur papier. Voir aussi le §0 du
cahier des charges (note : ceinture/smileys pour les élèves, note /20 visible du professeur seulement ; formule de l'Excel ; boutons-prénoms ; une webcam par binôme).

## 4. Les trois séances, étape par étape

Chaque ligne ci-dessous = **un écran** (une chose à faire, 8 mots au plus, pictogramme, 🔊). Les textes entre guillemets viennent
de la fiche ; Claude Code les raccourcit seulement si besoin et les range dans `donnees/etapes.js`.

### Ouverture de la séance 1 (≈ 10 min, projetée par le professeur, puis reprise à l'écran de l'élève)

1. « C'est quoi un objet technique ? » — *Un objet fabriqué par l'Homme, qui répond à un besoin* (vélo, stylo, jouet, taille-crayon).
2. « Notre mission » — 4 pictos : **Démonter · Observer et dessiner · Mesurer · Remonter** — « Toujours en binôme, une pièce à la fois ».
3. **L'objet du jour** : le taille-crayon à manivelle (révélation, grande image).
4. **Les 3 règles** (chaque règle = un écran, à lire à voix haute, coche « J'ai compris » ; elles reviennent au début des séances 2 et 3) :
   - « Je ne force jamais une pièce. Si ça bloque, je lève la main. » (→ lié au bouton 🙋)
   - « Chaque vis va tout de suite dans la boîte. Jamais dans les mains. »
   - « Je ne touche pas aux lames à l'intérieur du taille-crayon. »
5. Le programme : Séance 1 *Je démonte et j'observe* · Séance 2 *Je mesure et je dessine* · Séance 3 *Je remonte et je teste* — « 3 séances de 55 minutes ».

### Séance 1 — Je démonte le taille-crayon (matériel : 1 taille-crayon, 1 tournevis, 1 boîte)

Rappel de la fiche : « Une pièce = une case dans la boîte. Pas de mélange avec le binôme voisin. Je dévisse 1 pièce, je la dessine, je passe à la suivante. »

Pour **chaque pièce retirée** (jusqu'à 8 lignes, comme la fiche ; bouton « Encore une pièce » possible jusqu'à 10) :
1. **« Pièce n° k »** : « Je dévisse une pièce. »
2. 📷 « Je prends la pièce en photo » (fond blanc conseillé : feuille posée sur la table).
3. 🏷 « Quel est son nom ? » : cartes de noms avec image **ou** « un autre nom » (clavier). La liste des noms vient de `donnees/modele.js`,
   à écrire **après** que Thomas a testé le modèle de taille-crayon acheté (la préparation cite JPC 850011, Derwent 2302001 ou MP ; **ne pas supposer** les pièces, question 2).
4. ✓ « Je range la pièce dans la case k de la boîte » → ligne validée, retour au tableau (photos en vignettes alignées avec les numéros).

Fin de séance (cases de la fiche, à cocher) : « Toutes les pièces sont dans ma boîte, dans l'ordre. » · « Mon nom est sur la boîte. » · « Ma table est propre. » + 📷 photo de la boîte fermée.
Minuteur conseillé par bloc (préparation) : 25 min de démontage, 5 min de rangement, 10 min de bilan oral.

### Séance 2 — Je mesure et je dessine 2 pièces à leur taille réelle (matériel : réglet)

Rappel : « 1 carreau du quadrillage = 1 cm. Je mesure la pièce avec ma règle, puis je la dessine dans la bonne taille. J'écris la longueur à côté du dessin, avec une flèche. » Pas de mot « échelle » à ce stade (préparation).

Pour **chacune des 2 pièces** (« Pièce 1 : le corps du taille-crayon », « Pièce 2 : la manivelle »), dans cet ordre :
1. « Je sors UNE pièce de la boîte. » — compteur **« pièces dehors : 1 sur 2 »** (jamais plus de 2, vigilance de la préparation ; si l'élève indique en avoir sorti plus, message en ambre « Remets les pièces en trop dans la boîte »).
2. 📏 « Je mesure avec mon réglet. » → **saisie de la longueur au pavé numérique** : « Longueur mesurée : __ cm » (une décimale).
3. ✏️ « Je dessine la pièce sur ma feuille quadrillée. » (papier)
4. 📷 « Je prends mon dessin en photo, avec la pièce à côté. »
5. **Vérification douce** (sans donner la réponse) : la longueur saisie est comparée à une **plage de référence** (`donnees/modele.js`, à renseigner par Thomas en mesurant son modèle, ±0,5 cm par défaut). Dans la plage : « Bien mesuré ! ». Hors plage : « Mesure encore une fois, en partant du 0 du réglet » (2 essais maximum, puis « Montre au professeur »). Le nombre d'essais est gardé pour le professeur.
6. ✓ « Je remets la pièce dans sa case. »

Fin de séance : boîte refermée, + photo. Minuteur : 18 min pièce 1, 17 min pièce 2.

### Séance 3 — Je remonte le taille-crayon

Rappel : « Je reprends mon tableau à l'envers : je repars de la dernière pièce dessinée. Je revisse chaque pièce, dans l'ordre inverse. Si ça bloque, je lève la main. Je ne force pas. »

1. **Le tableau à l'envers** : les photos de la séance 1 s'affichent **de la dernière à la première**, une à la fois, en grand.
   Pour chacune : « Je remets cette pièce » → ✓. (Aide visuelle, pas de contrôle automatique.)
2. **Je vérifie** (3 cases de la fiche) : « La manivelle tourne bien. » · « Ma boîte est vide. » · « Le taille-crayon fonctionne (je teste). »
   + 📷 photo du taille-crayon remonté **et** d'un crayon taillé (pour l'affichage / portfolio SEGPA, « avec accord »).
3. **Je réponds en quelques mots** (3 questions de la fiche) — chaque réponse peut se faire **en choisissant, en écrivant ou en disant à l'oral** (bouton « Je réponds à l'oral » → le professeur valide à la main) :
   1. « À quoi sert la manivelle ? » (3 phrases-cartes à choisir, rédigées par Thomas, ou texte libre)
   2. « Quelle pièce fait tourner l'autre pièce ? » (choisir parmi **ses propres photos** de la séance 1)
   3. « Quelle pièce était la plus dure à remonter ? » (choisir parmi ses photos)
   Pas de correction automatique : le professeur lit les réponses dans l'outil (critère « Répond aux questions de compréhension »).
4. **Mon bilan** (deux lignes de la fiche, trois smileys) : « J'ai réussi à démonter puis remonter mon objet » · « J'ai travaillé en équipe avec mon binôme ».

Minuteurs : 30 min de remontage, 5 min de test final, 10 min de questions et bilan.

## 5. Outil professeur (en plus du socle, §7 du cahier des charges)

- **Tuile d'équipe** : pièces démontées (n sur N), pièces dehors en S2 (1/2, 2/2), boîte fermée ou non, séance en cours.
- **Aide** : 🙋 + dernière étape où l'élève était. Une règle de la préparation devient une **alerte** : « plus de 2 pièces dehors en S2 ».
- **Album** : par pièce (S1), dessin + pièce (S2), montage final (S3) ; téléchargement des photos du taille-crayon remonté pour l'affichage.
- **Onglet Séance 2** : longueurs saisies, essais, plage de référence — pour repérer ceux qui ne savent pas lire un réglet.
- **Aides à la différenciation** (préparation §8) : drapeaux manuels « tournevis à manche large », « rôle observateur / manipulateur »,
  « réduire à 4-5 pièces » (la séance 1 n'exige alors que 4-5 lignes) ; « élève rapide → expliquer à un autre binôme » (case dans l'Évaluation).
- **Réglages** : modèle de taille-crayon (pièces, plages de mesure), nombre de pièces à photographier, durées des minuteurs.

## 6. Évaluation : les 7 critères de ton Excel, tels quels

| # | Séance | Critère (libellé du fichier) | Repères automatiques (suggestions) | Compétence cycle 3 — **proposition à valider** |
|---|---|---|---|---|
| 1 | S1 | Suit la procédure (1 pièce à la fois) | lignes remplies dans l'ordre, photos prises | S'approprier des outils et des méthodes (protocoles, procédés de réalisation) |
| 2 | S1 | Respecte la sécurité (vis rangées, ne force pas) | 🙋 utilisé quand ça bloque, règles lues | Adopter un comportement éthique et responsable (sécurité) |
| 3 | S2 | Mesure correctement au réglet | longueurs saisies, nombre d'essais | S'approprier des outils et des méthodes (mesure, unité, outil) |
| 4 | S2 | Dessin fidèle (proportions respectées) | photo du dessin | Pratiquer des langages (dessin, croquis) |
| 5 | S3 | Remontage fonctionnel | cases « manivelle tourne / boîte vide / fonctionne », photo | Concevoir, créer, réaliser (fonctionnement, composants) |
| 6 | S3 | Répond aux questions de compréhension | réponses choisies / écrites / à l'oral | Pratiquer des langages (expliquer à l'oral et à l'écrit) |
| 7 | — | Autonomie / travail en binôme | nombre de 🙋 | Concevoir, créer, réaliser (« réaliser en équipe ») |

- Barème, appréciations et formules : **ceux de l'Excel** (voir cahier des charges §8). Libellés des domaines du socle (D1 à D4) conservés dans l'onglet Référentiel.
- Préparation §9 : « *ceinture ou smiley sur la fiche, basée sur la réussite du remontage fonctionnel* » → la **ceinture** est dérivée du critère 5 (remontage), pas de la note ; valoriser « tout binôme qui a un taille-crayon qui refonctionne, même si l'ordre du tableau n'était pas parfait ». **4 ceintures = 4 niveaux** (décision de Thomas). Proposition à valider : blanche · jaune · verte · noire, dérivées du critère 5 (remontage fonctionnel) ; noms, couleurs et règle exacte à fixer avec Thomas (question 3).
- Photo du taille-crayon remonté : « avec accord » → case « accord obtenu » dans la fiche de l'équipe ; l'impression de l'affichage ne propose que les photos accordées.

## 7. Constats à corriger au passage (relevés dans tes fichiers)

1. **Préparation enseignant, §1 Objectifs** : la **troisième puce est vide** (entre « Manipuler un outil… » et « Travailler en binôme… »). À compléter — probablement « Mesurer et dessiner une pièce à sa taille réelle ».
2. **Note ou pas de note** : la préparation (§9) dit « pas de note chiffrée » mais l'Excel calcule une note /20. Voir cahier des charges §8.2.
3. **Ligne d'exemple de l'Excel** : la légende parle d'une ligne « Ex. » en gris italique, mais la ligne 3 est celle de l'élève n° 1, en police normale et sans fond, avec des couleurs saisies. Elle est **comptée** dans la moyenne, la note maximale et la note minimale de l'onglet Synthèse. Si ce sont de vraies données, la ligne d'exemple manque ; sinon, retirer les valeurs.
4. **Référentiel de l'Excel** : les « domaines de compétence » (Pratique technologique, Modélisation et simulation, Matériaux et objets techniques, Connaissance technologique, Compétence transversale) ne sont pas les compétences travaillées du programme de cycle 3. Voir cahier des charges §8.4.
5. **Onglet Pronote absent** de l'Excel (présent dans tes autres grilles).
6. Le **planning** de la préparation (« la période compte désormais 7 séances au lieu de 6 ») ne correspond pas exactement au plan que tu m'as donné (avion 3 séances + démontage 3 séances = 6) : à confirmer, sans conséquence pour l'outil.

## 8. Matériel (d'après la préparation, ne pas redemander sauf changement)

Taille-crayon à manivelle ×8 + 2 de rechange · tournevis cruciforme PH0/PH1 ×8 · boîte ou barquette ×8 · étiquettes ou gommettes · nappe ou carton de protection · crayons · réglet ×8 · vidéoprojecteur ou TBI · 16 fiches imprimées (si maintenues). Vigilance achat : tester **un seul exemplaire** avant la commande (certains modèles sont sertis ou collés).
*La webcam par binôme n'est pas dans cette liste : à confirmer (cahier des charges, question 3).*

## 9. Questions propres à ce projet

1. *(réglée : l'outil complète la fiche.)*
2. **Modèle exact** de taille-crayon acheté, **liste des pièces et leurs noms**, **longueurs de référence** du corps et de la manivelle (pour la plage de vérification de S2).
3. **Ceinture** : quels niveaux, quels noms ?
4. Garder les **16 fiches papier** imprimées en plus de l'outil, ou plus aucune ?
5. Les images du PowerPoint (vélo, stylo, jouet, taille-crayon) : de ta création, ou issues d'une banque libre ?

## 10. Ordre de travail

1. Plan court (arborescence, fichiers repris, données) → validation par Thomas.
2. Socle (accueil, mission, étape, photo, album, sauvegarde) + `donnees/etapes.js` des 3 séances.
3. Outil professeur (tuiles, alertes, album) puis évaluation et exports (Excel, Carnet, CSV, feuille ceinture).
4. Recette automatique puis **essai réel avec Thomas** sur un poste du collège, avec un vrai taille-crayon.
5. Publication GitHub Pages, ajout de la fiche du projet sur `anlito.github.io`.
