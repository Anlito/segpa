# Gabarits de carrosserie (voiture à ballon, séance 3)

Prototypes calculés d'après le châssis v5 de Thomas (`Ch_ssis_voiture_ballon_5.stl`, 29/10/2026) : 7 fentes de
20 × 2 mm, plaque de 3 mm, supports d'axes de 11 mm, sortie d'air de 18 mm, tube du ballon de 40 mm. Carton de 1,6 mm.
La version gardée sera choisie après les essais de Thomas.

| Fichier produit (`site/voiture-ballon/documents/`) | Source | Commande |
|---|---|---|
| `gabarit-carrosserie.pdf` : 4 pièces (2 flancs avec nez à plier, avant, arrière avec arche), A4 portrait | `gabarit-4-pieces.js` | `node gabarit-4-pieces.js` puis `node pdf-a4-portrait.js "$PWD/gabarit.html" gabarit-carrosserie.pdf apercu.png` |
| `patron-carrosserie.pdf` : une pièce à plier (toit percé Ø 22, capot, nez, côtés, arrière), A4 paysage | `patron-a-plier.py` (Python + shapely) | `python3 patron-a-plier.py` puis `node pdf-a4-paysage.js "$PWD/patron.html" patron-carrosserie.pdf apercu.png` |

Les commandes se lancent dans ce dossier ; les cotes sont en tête de chaque source. Imprimer à 100 % (le trait de 50 mm
sur la page permet de vérifier).
