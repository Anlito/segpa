// Le modèle de taille-crayon de la classe : « Cat » NO.722A, démonté et mesuré par Thomas le 02/11/2026.
// pieces : les pièces dans l'ordre où on les retire (une ligne par pièce ; les 2 vis et les 2 ressorts : une ligne
//          par paire, décision de Thomas).
//   nom      : proposé à l'élève sur l'écran « Quel est son nom ? », avec sa photo (img/pieces/).
//   geste    : avant de retirer la pièce n, la photo du geste (img/demontage/) et un conseil — sans dire le nom de
//              la pièce (l'élève le retrouve ensuite).
//   remonter : conseil pour la remettre en séance 3 (tableau à l'envers).
// mesures : séance 2, plages de référence en cm (« pas à 1 mm près », décision de Thomas) ; une mesure hors de la
//           plage affiche seulement « Mesure encore une fois », jamais la bonne valeur.
definirModele({
  // Modèle acheté (affiché seulement au professeur).
  "reference": "Taille-crayon à manivelle « Cat » NO.722A",

  "pieces": [
    { "nom": "Réceptacle à copeaux", "image": "img/pieces/piece-01.jpg",
      "geste": { "image": "img/demontage/geste-01.jpg", "texte": "Je retire la boîte transparente.", "detail": "Elle glisse sous le taille-crayon." },
      "remonter": "Je la fais glisser sous le taille-crayon." },
    { "nom": "Vis", "image": "img/pieces/piece-02.jpg",
      "geste": { "image": "img/demontage/geste-02.jpg", "texte": "Je dévisse à l'arrière, avec le tournevis.", "detail": "2 petites pièces sortent : attention à ne pas les perdre !" },
      "remonter": "Je revisse les 2 vis, sans trop serrer." },
    { "nom": "Ressorts", "image": "img/pieces/piece-03.jpg",
      "geste": { "image": "img/demontage/geste-03.jpg", "texte": "Je retire les 2 pièces qui poussent.", "detail": "Elles sont à l'arrière, toutes fines : attention à ne pas les perdre !" },
      "remonter": "Je glisse les 2 ressorts dans les trous, à l'arrière." },
    { "nom": "Serre-crayon", "image": "img/pieces/piece-04.jpg",
      "geste": { "image": "img/demontage/geste-04.jpg", "texte": "Je retire la tête bleue, à l'avant.", "detail": "Les oreilles bleues servent à l'ouvrir." },
      "remonter": "Je glisse ses 2 tiges dans les trous, à l'avant." },
    { "nom": "Manivelle avec la fraise", "image": "img/pieces/piece-05.jpg",
      "geste": { "image": "img/demontage/geste-05.jpg", "texte": "Je tourne un peu la bague bleue.", "detail": "Puis je tire doucement, sans forcer." },
      "remonter": "J'enfonce la manivelle, puis je tourne la bague pour la bloquer." },
    { "nom": "Plaque rose", "image": "img/pieces/piece-06.jpg",
      "geste": { "image": "img/demontage/geste-06.jpg", "texte": "Je déclipse doucement la pièce suivante.", "detail": "Je regarde la photo. Je ne force pas." },
      "remonter": "Je la clipse doucement, le grand trou au milieu." },
    { "nom": "Corps", "image": "img/pieces/piece-07.jpg",
      "geste": { "image": "img/demontage/geste-07.jpg", "texte": "Il reste la dernière pièce.", "detail": "Je la pose dans la boîte." },
      "remonter": "Je commence par elle : tout se remet dedans." }
  ],

  // Lignes du tableau de la séance 1 ; « Pièce suivante » est possible jusqu'à maxPieces.
  "nombrePieces": 7,
  "maxPieces": 9,

  // Séance 2 : les pièces mesurées et dessinées. Le corps se mesure en 3 dimensions, la manivelle sur toute sa longueur.
  "mesures": {
    "corps": { "titre": "Pièce 1 : le corps", "nom": "le corps du taille-crayon", "dimensions": [
      { "id": "hauteur", "nom": "Hauteur", "reference": { "min": 8.5, "max": 9.5 } },
      { "id": "largeur", "nom": "Largeur", "reference": { "min": 4, "max": 5 } },
      { "id": "longueur", "nom": "Longueur", "reference": { "min": 5, "max": 6 } }
    ] },
    "manivelle": { "titre": "Pièce 2 : la manivelle", "nom": "la manivelle", "reference": { "min": 4.5, "max": 5.5 } }
  },
  "tolerance": 0.5,
  // Après ce nombre de mesures hors de la plage : « Montre ta mesure au professeur. »
  "essaisMesure": 2
});
