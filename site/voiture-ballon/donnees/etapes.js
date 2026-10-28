// Les séances de la voiture à ballon et leurs écrans (plan validé le 29/10/2026 : docs/PLAN-voiture-ballon.md).
// Types d'écran du socle : regle · consigne (image : photo de Thomas, pictogramme en attendant) · photo · cases · bilan.
// Écrans propres (js/ecrans.js) : nom-voiture · couleur · materiel ; essais (jalon V2) et course (jalon V3) viendront ensuite
// (tant qu'ils n'existent pas, le site les saute).
// depannage : bouton « Ma voiture ne roule pas » sur les écrans de la séance ; chaque cause ramène à une étape
// (« verifier » dans la même séance, « s2/verifier » dans une autre).
// Photos de fabrication à déposer dans img/fabrication/ (voir img/LISEZ-MOI.txt).
(function () {
  const COLLE = { "id": "regle-colle", "type": "regle", "picto": "colle", "texte": "La colle chaude, seulement avec le professeur.", "detail": "Elle brûle : je ne la touche pas." };
  const DEPANNAGE_CONSTRUCTION = {
    "texte": "Ma voiture ne roule pas", "picto": "question",
    "causes": [
      { "picto": "roue", "texte": "Une roue frotte", "etape": "verifier" },
      { "picto": "ballon", "texte": "Le ballon fuit", "etape": "elastique" },
      { "picto": "pique", "texte": "Une roue tombe", "etape": "roues-avant" }
    ]
  };

  definirEtapes({
    "seances": [
      {
        "id": "s1", "titre": "Je prépare", "sousTitre": "ma voiture", "picto": "boite",
        "etapes": [
          { "id": "regle-ciseaux", "type": "regle", "picto": "ciseaux", "texte": "Je coupe doucement avec les ciseaux.", "detail": "Les doigts loin de la lame." },
          COLLE,
          { "id": "regle-compter", "type": "regle", "picto": "boite", "texte": "Je compte mon matériel.", "detail": "Au début et à la fin de la séance." },
          { "id": "regle-ranger", "type": "regle", "picto": "balai", "texte": "Je range avant de partir." },
          { "id": "nom", "type": "nom-voiture", "titre": "Nom de la voiture", "texte": "Je choisis le nom de ma voiture." },
          { "id": "couleur", "type": "couleur", "titre": "Couleur d'équipe", "texte": "Je choisis la couleur de mon équipe." },
          { "id": "modele", "type": "consigne", "picto": "voiture", "image": "img/modele.jpg", "texte": "Je regarde le modèle.", "detail": "Voici une voiture à ballon terminée.", "bouton": "J'ai regardé" },
          { "id": "materiel", "type": "materiel", "titre": "Mon matériel", "texte": "Je compte mon matériel." },
          { "id": "pieces", "type": "photo", "picto": "boite", "texte": "Je prends mes pièces en photo.", "legende": "Mes pièces" },
          { "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": "Le matériel est rangé",
            "lignes": [
              { "picto": "boite", "texte": "Mes pièces sont dans ma boîte." },
              { "picto": "etiquette", "texte": "Mon nom est sur la boîte." },
              { "picto": "table", "texte": "Ma table est propre." }
            ] }
        ]
      },
      {
        "id": "s2", "titre": "Je construis", "sousTitre": "ma voiture", "picto": "chassis", "depannage": DEPANNAGE_CONSTRUCTION,
        "etapes": [
          COLLE,
          { "id": "sortir", "type": "consigne", "picto": "boite", "texte": "Je sors mon matériel.", "detail": "Châssis, piques, roues, élastique, ballon." },
          { "id": "axe-avant", "type": "consigne", "picto": "pique", "image": "img/fabrication/1.jpg", "texte": "Je passe une pique devant.", "detail": "Dans les deux trous de devant du châssis." },
          { "id": "roues-avant", "type": "consigne", "picto": "roue", "image": "img/fabrication/2.jpg", "texte": "J'enfonce une roue de chaque côté." },
          { "id": "verifier", "type": "consigne", "picto": "roue", "image": "img/fabrication/3.jpg", "texte": "Je vérifie : les roues tournent.", "detail": "Elles ne frottent pas le châssis.", "bouton": "Elles tournent" },
          { "id": "arriere", "type": "consigne", "picto": "pique", "image": "img/fabrication/4.jpg", "texte": "Même chose derrière.", "detail": "Une pique, puis une roue de chaque côté." },
          { "id": "sans-deco", "type": "photo", "picto": "voiture", "texte": "Je photographie ma voiture.", "legende": "Ma voiture sans décoration" },
          { "id": "ballon", "type": "consigne", "picto": "ballon", "image": "img/fabrication/5.jpg", "texte": "J'enfile le ballon sur le tube." },
          { "id": "elastique", "type": "consigne", "picto": "elastique", "image": "img/fabrication/6.jpg", "texte": "Je serre l'élastique sous le rebord.", "detail": "Le ballon ne doit pas glisser." },
          { "id": "pousser", "type": "consigne", "picto": "voiture", "texte": "Je pousse doucement ma voiture.", "detail": "Elle roule droit ? Sinon, je touche « Ma voiture ne roule pas ».", "bouton": "Elle roule" },
          { "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": "La voiture est construite",
            "lignes": [
              { "picto": "voiture", "texte": "Ma voiture est à sa place." },
              { "picto": "roue", "texte": "Les roues en trop sont rangées." },
              { "picto": "table", "texte": "Ma table est propre." }
            ] },
          { "id": "voiture-rangee", "type": "photo", "picto": "voiture", "texte": "Je photographie ma voiture rangée.", "legende": "Ma voiture rangée" }
        ]
      },
      {
        "id": "s3", "titre": "Je décore", "sousTitre": "ma voiture", "picto": "palette",
        "depannage": {
          "texte": "Ma voiture ne roule pas", "picto": "question",
          "causes": [
            { "picto": "roue", "texte": "Une roue frotte", "etape": "verification" },
            { "picto": "ballon", "texte": "Le ballon est caché", "etape": "verification" },
            { "picto": "boite", "texte": "Elle est trop lourde", "etape": "decorer" }
          ]
        },
        "etapes": [
          COLLE,
          { "id": "idees", "type": "consigne", "picto": "palette", "texte": "Je choisis comment décorer ma voiture.", "detail": "Carton, feuilles de couleur, scotch." },
          { "id": "decorer", "type": "consigne", "picto": "palette", "texte": "Je décore ma voiture.", "detail": "Léger, et les roues doivent tourner.", "minuteur": 35 },
          { "id": "verification", "type": "cases", "picto": "voiture", "texte": "Je vérifie ma voiture.", "bravo": "La voiture est décorée",
            "lignes": [
              { "picto": "roue", "texte": "Les roues tournent toujours." },
              { "picto": "ballon", "texte": "Le ballon n'est pas caché." },
              { "picto": "fleche", "texte": "La sortie d'air est libre." }
            ] },
          { "id": "officielle", "type": "photo", "picto": "voiture", "officielle": true, "texte": "Photo officielle de ma voiture !", "detail": "De côté, toute la voiture.", "legende": "Photo officielle" },
          { "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5,
            "lignes": [
              { "picto": "voiture", "texte": "Ma voiture est à sa place." },
              { "picto": "boite", "texte": "Les chutes de carton sont jetées." },
              { "picto": "table", "texte": "Ma table est propre." }
            ] }
        ]
      },
      {
        "id": "s4", "titre": "Je teste", "sousTitre": "et j'améliore", "picto": "regle",
        "depannage": {
          "texte": "Ma voiture ne roule pas", "picto": "question",
          "causes": [
            { "picto": "roue", "texte": "Une roue frotte", "etape": "s2/verifier" },
            { "picto": "ballon", "texte": "Le ballon fuit", "etape": "s2/elastique" },
            { "picto": "boite", "texte": "Elle est trop lourde", "etape": "s3/decorer" }
          ]
        },
        "etapes": [
          { "id": "regle-pompe", "type": "regle", "picto": "pompe", "texte": "Je gonfle le ballon avec la pompe.", "detail": "Personne ne souffle dans le ballon." },
          { "id": "essais", "type": "essais", "titre": "Mes essais" }
        ]
      },
      {
        "id": "s5", "titre": "La course", "sousTitre": "", "picto": "drapeau",
        "etapes": [
          { "id": "regle-piste", "type": "regle", "pastille": "Règle de la course", "picto": "drapeau", "texte": "La piste reste libre.", "detail": "Je reste derrière la ligne." },
          { "id": "regle-signal", "type": "regle", "pastille": "Règle de la course", "picto": "main-stop", "texte": "Je lâche au signal.", "detail": "Pas avant." },
          { "id": "regle-pousser", "type": "regle", "pastille": "Règle de la course", "picto": "voiture", "texte": "Je ne pousse pas la voiture.", "detail": "Seul le ballon la fait avancer." },
          { "id": "course", "type": "course", "titre": "La course" }
        ]
      }
    ]
  });
})();
