// Les séances du film en stop motion (plan : docs/PLAN-stop-motion.md §3).
// Jalon M1 : les séances 3 et 4 (« Je filme ») et l'écran de tournage (js/ecran-tournage.js).
// Jalon M2 : la séance 5 (titre, vitesse, images ratées, film avec titre et générique ; js/ecrans-montage.js).
// Jalon M3 : la séance 1 (le scénario : héros, lieu, ce que fait le héros, problème, solution, fin, objets à construire,
// le titre, puis le récap ; pas de photo du storyboard, retour de Thomas du 01/11) et la séance 2
// (la plaque, le décor, le héros, les objets, avec le rappel de l'histoire ; js/ecrans-histoire.js).
// Le titre choisi en séance 1 est repris en séance 5 (on peut le changer).
// Types d'écran du socle : regle · consigne · photo · cases · bilan. Écrans propres : tournage · titre-film ·
// projection (mode 'vitesse' ou 'final') · trier-images · idee-histoire · histoire-resume · construire.
(function () {
  const REGLES_MATERIEL = [
    { "id": "regle-objectif", "type": "regle", "picto": "camera", "texte": "Je ne touche pas l'objectif de la caméra.", "detail": "Sinon, l'image devient floue." },
    { "id": "regle-compter", "type": "regle", "picto": "brique", "texte": "Je compte mes briques.", "detail": "Rien ne se perd." },
    { "id": "regle-ranger", "type": "regle", "picto": "balai", "texte": "Je range les briques par couleur." }
  ];
  // Au début des séances 2, 3 et 4 : je relis mon scénario (écrit en séance 1), avec l'avis du professeur s'il en a
  // donné un (« Validé » ou « À revoir » : l'équipe peut alors changer une réponse).
  const RELIRE = { "id": "relire", "type": "histoire-resume", "relire": true, "texte": "Je relis mon histoire.", "bouton": "J'ai relu" };
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
          { "id": "heros", "type": "idee-histoire", "partie": "heros", "texte": "Qui est mon héros ?", "texteEcrire": "J'écris mon héros." },
          { "id": "lieu", "type": "idee-histoire", "partie": "lieu", "texte": "Où se passe mon histoire ?", "texteEcrire": "J'écris le lieu." },
          { "id": "action", "type": "idee-histoire", "partie": "action", "texte": "Que fait mon héros au début ?", "texteEcrire": "J'écris ce que fait mon héros." },
          { "id": "probleme", "type": "idee-histoire", "partie": "probleme", "texte": "Quel problème arrive ?", "texteEcrire": "J'écris le problème." },
          { "id": "solution", "type": "idee-histoire", "partie": "solution", "texte": "Comment le problème est réglé ?", "texteEcrire": "J'écris comment c'est réglé." },
          { "id": "fin", "type": "idee-histoire", "partie": "fin", "texte": "Comment finit mon histoire ?", "texteEcrire": "J'écris la fin." },
          { "id": "objets", "type": "idee-histoire", "partie": "objets", "texte": "Quels objets je dois construire ?", "texteEcrire": "J'écris les objets à construire." },
          { "id": "titre", "type": "titre-film", "texte": "Je choisis le titre de mon film." },
          { "id": "histoire", "type": "histoire-resume", "texte": "Mon histoire en 3 temps.", "bravo": "Le scénario est écrit" }
        ])
      },
      {
        "id": "s2", "titre": "Je construis", "sousTitre": "mon décor", "picto": "brique",
        "etapes": [
          RELIRE, REGLES_MATERIEL[1], REGLES_MATERIEL[2],
          { "id": "plaque", "type": "consigne", "picto": "brique", "texte": "Je prends ma plaque.", "detail": "Une plaque par équipe.", "bouton": "J'ai pris ma plaque" },
          { "id": "construire-decor", "type": "construire", "partie": "lieu", "picto": "brique", "texte": "Je construis le décor.", "detail": "Sur la plaque. Je regarde mon storyboard.", "bouton": "Le décor est fini" },
          { "id": "decor", "type": "photo", "picto": "brique", "texte": "Je photographie mon décor.", "legende": "Mon décor" },
          { "id": "construire-heros", "type": "construire", "partie": "heros", "picto": "brique", "texte": "Je construis mon héros.", "detail": "Il doit tenir debout tout seul.", "bouton": "Mon héros est fini" },
          { "id": "heros", "type": "photo", "picto": "brique", "texte": "Je photographie mon héros.", "legende": "Mon héros" },
          { "id": "construire-objets", "type": "construire", "partie": "objets", "picto": "brique", "texte": "Je construis les objets de l'histoire.", "detail": "Ce qu'il faut pour le problème et la fin.", "bouton": "Les objets sont finis" },
          { "id": "objets", "type": "photo", "picto": "brique", "texte": "Je photographie mes objets.", "legende": "Mes objets" },
          { "id": "secouer", "type": "consigne", "picto": "main-stop", "texte": "Je secoue doucement la table.", "detail": "Rien ne tombe ? Sinon, je renforce.", "bouton": "Rien ne tombe" },
          {
            "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": "Le décor est construit",
            "lignes": [
              { "picto": "brique", "texte": "Les briques sont rangées par couleur." },
              { "picto": "table", "texte": "Le décor reste sur la plaque." },
              { "picto": "etiquette", "texte": "Mon nom est sur la plaque." }
            ]
          }
        ]
      },
      {
        "id": "s3", "titre": "Je filme", "sousTitre": "mon histoire", "picto": "camera",
        "etapes": [RELIRE].concat(RAPPELS_TOURNAGE, [
          { "id": "tournage", "type": "tournage", "fin": "J'arrête pour aujourd'hui", "bravo": "Le film est commencé" },
          RANGEMENT("Le matériel est rangé")
        ])
      },
      {
        "id": "s4", "titre": "Je filme", "sousTitre": "encore", "picto": "camera",
        "etapes": [RELIRE].concat(RAPPELS_TOURNAGE, [
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
