// Les séances du film en stop motion (plan : docs/PLAN-stop-motion.md §3).
// Jalon M1 : les séances 3 et 4 (« Je filme ») et l'écran de tournage (js/ecran-tournage.js).
// Jalon M2 : la séance 5 (titre, vitesse, images ratées, film avec titre et générique ; js/ecrans-montage.js).
// Les écrans propres des séances 1 et 2 (histoire en 3 temps, construction) arrivent au jalon M3 : en attendant, elles
// n'ont que leurs règles et leurs photos. Le titre se choisira en séance 1 ; en séance 5, il est repris (on peut le changer).
// Types d'écran du socle : regle · consigne · photo · cases · bilan. Écrans propres : tournage · titre-film ·
// projection (mode 'vitesse' ou 'final') · trier-images.
(function () {
  const REGLES_MATERIEL = [
    { "id": "regle-objectif", "type": "regle", "picto": "camera", "texte": "Je ne touche pas l'objectif de la caméra.", "detail": "Sinon, l'image devient floue." },
    { "id": "regle-compter", "type": "regle", "picto": "brique", "texte": "Je compte mes briques.", "detail": "Rien ne se perd." },
    { "id": "regle-ranger", "type": "regle", "picto": "balai", "texte": "Je range les briques par couleur." }
  ];
  const RAPPELS_TOURNAGE = [
    { "id": "rappel-camera", "type": "regle", "picto": "camera", "texte": "La caméra ne bouge pas.", "detail": "Elle reste sur son support." },
    { "id": "rappel-bouger", "type": "regle", "picto": "brique", "texte": "Je bouge un tout petit peu.", "detail": "Un personnage, un objet, un tout petit pas." },
    { "id": "rappel-photo", "type": "regle", "picto": "photo", "texte": "Je prends une photo.", "detail": "Les mains sortent de l'image avant la photo." }
  ];
  const RANGEMENT = (bravo) => ({
    "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": bravo,
    "lignes": [
      { "picto": "brique", "texte": "Les briques sont rangées par couleur." },
      { "picto": "camera", "texte": "La caméra est sur son support." },
      { "picto": "table", "texte": "Ma plaque est à sa place." }
    ]
  });

  definirEtapes({
    "seances": [
      {
        "id": "s1", "titre": "J'invente", "sousTitre": "mon histoire", "picto": "crayon",
        "etapes": REGLES_MATERIEL.concat([
          { "id": "storyboard", "type": "photo", "picto": "crayon", "texte": "Je photographie mon storyboard.", "detail": "Les 3 cases : début, milieu, fin.", "legende": "Mon storyboard" }
        ])
      },
      {
        "id": "s2", "titre": "Je construis", "sousTitre": "mon décor", "picto": "brique",
        "etapes": [
          REGLES_MATERIEL[0], REGLES_MATERIEL[2],
          { "id": "plaque", "type": "consigne", "picto": "brique", "texte": "Je prends ma plaque.", "bouton": "J'ai pris ma plaque" },
          { "id": "decor", "type": "photo", "picto": "brique", "texte": "Je photographie mon décor.", "legende": "Mon décor" },
          { "id": "secouer", "type": "consigne", "picto": "main-stop", "texte": "Je secoue doucement la table.", "detail": "Rien ne tombe ? Sinon, je renforce.", "bouton": "Rien ne tombe" },
          RANGEMENT("Le décor est construit")
        ]
      },
      {
        "id": "s3", "titre": "Je filme", "sousTitre": "mon histoire", "picto": "camera",
        "etapes": RAPPELS_TOURNAGE.concat([
          { "id": "tournage", "type": "tournage", "fin": "J'arrête pour aujourd'hui", "bravo": "Le film est commencé" },
          RANGEMENT("Le matériel est rangé")
        ])
      },
      {
        "id": "s4", "titre": "Je filme", "sousTitre": "encore", "picto": "camera",
        "etapes": RAPPELS_TOURNAGE.concat([
          { "id": "tournage", "type": "tournage", "fin": "Mon film est fini", "bravo": "Le film est tourné" },
          RANGEMENT("Le matériel est rangé")
        ])
      },
      {
        "id": "s5", "titre": "Je projette", "sousTitre": "mon film", "picto": "film",
        "etapes": [
          { "id": "titre", "type": "titre-film", "texte": "Je choisis le titre de mon film." },
          { "id": "regarder", "type": "projection", "mode": "vitesse", "texte": "Je regarde mon film." },
          { "id": "trier", "type": "trier-images", "texte": "J'enlève les images ratées.", "detail": "Floue, une main ? Je la touche." },
          { "id": "mon-film", "type": "projection", "mode": "final", "texte": "Voici mon film !", "bravo": "Le film est prêt" },
          { "id": "cinema", "type": "consigne", "picto": "film", "texte": "On regarde tous les films ensemble.", "detail": "Le professeur lance la séance cinéma.", "bouton": "On a regardé" },
          { "id": "bilan", "type": "bilan", "phrases": ["Mon film raconte une histoire.", "Les briques bougent un tout petit peu.", "J'ai bien travaillé avec mon binôme."] }
        ]
      }
    ]
  });
})();
