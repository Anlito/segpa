// Le modèle de taille-crayon de la classe.
// À RENSEIGNER PAR THOMAS après avoir démonté le modèle acheté (brief §9, question 2) : tant que c'est vide,
//   - pieces vide : l'élève écrit le nom de la pièce au clavier (ou « Je ne sais pas ») ;
//   - reference null : la longueur est notée sans vérification ;
//   - phrasesManivelle vide : l'élève écrit sa réponse ou répond à l'oral.
definirModele({
  // Modèle acheté, par exemple « JPC 850011 » (affiché seulement au professeur).
  "reference": "",

  // Noms proposés à l'élève pour chaque pièce démontée, dans l'ordre où on les retire.
  // Exemple : { "nom": "Manivelle", "image": "img/pieces/manivelle.jpg" } (image facultative, dans site/taille-crayon/img/pieces/).
  "pieces": [],

  // Lignes du tableau de la séance 1 (comme la fiche) ; « Pièce suivante » est possible jusqu'à maxPieces.
  "nombrePieces": 8,
  "maxPieces": 10,

  // Séance 2 : les deux pièces mesurées et dessinées.
  // reference : { "longueur": 7.5 } (± tolerance) ou { "min": 7, "max": 8 }, en cm ; null tant que ce n'est pas mesuré.
  "mesures": {
    "corps": { "titre": "Pièce 1 : le corps", "nom": "le corps du taille-crayon", "reference": null },
    "manivelle": { "titre": "Pièce 2 : la manivelle", "nom": "la manivelle", "reference": null }
  },
  "tolerance": 0.5,
  // Après ce nombre de mesures hors de la plage : « Montre ta mesure au professeur. »
  "essaisMesure": 2,

  // Séance 3, « À quoi sert la manivelle ? » : 3 phrases-cartes rédigées par Thomas.
  "phrasesManivelle": []
});
