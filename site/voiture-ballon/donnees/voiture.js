// Le kit, les noms amusants et les couleurs d'équipe (modifiables par Thomas).
//   materiel : une ligne par pièce du kit ; prevu = quantité prévue par binôme (le professeur voit l'écart avec « J'ai pris »).
//   noms     : cartes proposées pour le nom de la voiture (l'équipe peut aussi écrire le sien).
//   couleurs : couleur d'équipe (la voiture la garde sur la piste et le podium) ; toujours affichée avec son nom.
//   essais   : séance 4 — de min à max essais ; ecart : une mesure « ecart fois » plus grande (ou plus petite) que les
//              autres essais fait proposer « Mesure encore une fois ? » (à régler après les essais de châssis de Thomas).
//   roues    : diamètres imprimés (mm) ; changements : les cartes « je change une chose » (une seule à la fois) ;
//   directions : « ma voiture roule comment ? ».
definirDonneesProjet({
  "materiel": [
    { "id": "chassis", "nom": "Châssis", "picto": "chassis", "prevu": 1 },
    { "id": "piques", "nom": "Piques", "picto": "pique", "prevu": 2 },
    { "id": "roues", "nom": "Roues", "picto": "roue", "prevu": 4 },
    { "id": "elastique", "nom": "Élastique", "picto": "elastique", "prevu": 1 },
    { "id": "ballons", "nom": "Ballons", "picto": "ballon", "prevu": 2 }
  ],
  "noms": ["Turbo Ballon", "Flèche d'air", "Tornade", "Bolide", "Comète", "Éclair", "Fusée", "Ouragan", "Super Bulle", "Vent rapide", "Petit bolide", "Souffle express"],
  "couleurs": [
    { "nom": "Bleu", "hex": "#1D4ED8" },
    { "nom": "Vert", "hex": "#15803D" },
    { "nom": "Orange", "hex": "#EA580C" },
    { "nom": "Violet", "hex": "#7E22CE" },
    { "nom": "Rose", "hex": "#DB2777" },
    { "nom": "Jaune", "hex": "#CA8A04" }
  ],
  "essais": { "min": 3, "max": 5, "ecart": 10, "unite": "cm" },
  "roues": ["20", "30", "40", "50"],
  "changements": [
    { "id": "roues", "nom": "Les roues", "picto": "roue", "choix": "roues" },
    { "id": "ballon", "nom": "Le ballon", "picto": "ballon", "choix": [
      { "id": "plus", "nom": "Plus gonflé" },
      { "id": "moins", "nom": "Moins gonflé" }
    ] },
    { "id": "poids", "nom": "Le poids", "picto": "poids", "choix": [
      { "id": "enleve", "nom": "J'enlève du poids" },
      { "id": "ajoute", "nom": "J'ajoute du poids" }
    ] }
  ],
  "directions": [
    { "id": "droit", "nom": "Tout droit", "picto": "fleche-haut" },
    { "id": "gauche", "nom": "À gauche", "picto": "fleche-gauche" },
    { "id": "droite", "nom": "À droite", "picto": "fleche-droite" }
  ]
});
