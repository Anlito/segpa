// Réglages du film et du tournage (plan : docs/PLAN-stop-motion.md §4). Modifiables par le professeur.
//   min / max      : 30 images au moins (compteur « Image 12 / 30 »), 120 au plus (« Ton film est assez long ! »)
//   vitesses       : images par seconde pour 🐢 lent, 🚶 normal, 🐇 rapide
//   pellicule      : nombre de petites images sous la caméra ; voir : nombre d'images rejouées par « Voir »
//   calque         : opacité de l'image précédente posée sur la caméra (0,4 = 40 %)
//   conseils       : un conseil, qui change toutes les « periodeConseil » secondes
definirDonneesProjet({
  "film": {
    "min": 30,
    "max": 120,
    "vitesses": { "lent": 4, "normal": 6, "rapide": 10 },
    "pellicule": 6,
    "voir": 10,
    "calque": 0.4,
    "periodeConseil": 40
  },
  "conseils": [
    { "picto": "brique", "texte": "Bouge un tout petit peu." },
    { "picto": "aide", "texte": "Éloigne ta main avant la photo." },
    { "picto": "camera", "texte": "Ne touche pas la caméra." },
    { "picto": "calque", "texte": "Regarde le calque : ça a bougé un peu ?" },
    { "picto": "oeil", "texte": "La lumière doit rester pareille." },
    { "picto": "photo", "texte": "Filme les briques, pas les personnes." }
  ]
});
