# Gabarits de carrosserie (voiture à ballon, séance 3)

Calculés d'après le châssis **v8** de Thomas (`Ch_ssis_voiture_ballon_8.stl`, 30/10/2026) : 7 fentes de 20 × 2 mm
(comme le v5), plaque de 2 mm, 4 plots d'axes de 10 mm, ballon sur un tube incliné (23°, Ø 10, passage Ø 7) porté par
une tour de 20 × 20 mm. Carton de 1,6 mm.
Patron à plier (retours de Thomas du 31/10) : toit à 30 mm (fente de 46 × 23 mm, l'embout dépasse de 23 mm), languettes
de 10 mm au bout en biseau, pliées sous la plaque, rabats de 12 mm (colle ou agrafes), arche arrière de 20 mm ;
207 × 154 mm (tapis Cricut 30 × 30 cm), PDF d'exemple en A3.
La version gardée sera choisie après les essais de Thomas.

| Fichier produit (`site/voiture-ballon/documents/`) | Source | Commande |
|---|---|---|
| `gabarit-carrosserie.pdf` : 4 pièces (2 flancs avec nez à plier, avant, arrière avec arche), A4 portrait | `gabarit-4-pieces.js` | `node gabarit-4-pieces.js` puis `node pdf-a4-portrait.js "$PWD/gabarit.html" gabarit-carrosserie.pdf apercu.png` |
| `patron-carrosserie.pdf` : une pièce à plier (toit avec fente du tube, capot, nez, côtés, arrière), A3 paysage | `patron-a-plier.py` (Python + shapely) | `python3 patron-a-plier.py` puis `node pdf-a3-paysage.js "$PWD/patron.html" patron-carrosserie.pdf apercu.png` |

| `patron-carrosserie-cricut.svg` : le même patron pour une machine de découpe (Cricut Design Space) : calque « decoupe » (contour + trou du ballon), calque « plis » en rouge, en mm, sans texte | `patron-a-plier.py` (produit en même temps) | — |

Les commandes se lancent dans ce dossier ; les cotes sont en tête de chaque source. Imprimer à 100 % (le trait de 50 mm
sur la page permet de vérifier).
