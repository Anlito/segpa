// Évaluation du film en stop motion : 7 critères validés par Thomas le 01/11/2026 (même forme que la voiture).
//   libelle   : libellé du critère (aussi celui à créer dans le Carnet de classe pour l'import)
//   entete    : en-tête de la colonne dans l'Excel
//   repere    : observations automatiques montrées à côté du critère (js/prof-projet.js) — jamais un niveau
// Même barème que les autres projets : Rouge 0 · Jaune 1 · Vert clair 2 · Vert foncé 3 ; note /20 = score ÷ 21 × 20.
// Ceinture (élèves) : le niveau du critère « film » (un film fini, de 30 images au moins, qui raconte l'histoire) —
// validé le 01/11/2026 ; Rouge → ceinture blanche, pour ne pas montrer de rouge aux élèves.
definirCriteres({
  "criteres": [
    { "id": "scenario", "seance": "S1", "libelle": "Invente une histoire en 3 temps (début, milieu, fin)", "entete": "S1 - Histoire\nen 3 temps",
      "competence": "Pratiquer des langages", "domaine": "D1 - Langages pour penser et communiquer", "repere": "scenario" },
    { "id": "regles", "seance": "S1-S5", "libelle": "Respecte les règles du matériel (briques comptées et rangées, caméra)", "entete": "S1-S5 - Respecte les règles\ndu matériel",
      "competence": "Adopter un comportement éthique et responsable", "domaine": "D3 - Formation de la personne et du citoyen · D5 - Représentations du monde et activité humaine", "repere": "regles" },
    { "id": "construction", "seance": "S2", "libelle": "Construit un décor solide qui va avec son histoire", "entete": "S2 - Décor solide,\nqui va avec l'histoire",
      "competence": "Concevoir, créer, réaliser", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "construction" },
    { "id": "methode", "seance": "S3-S4", "libelle": "Filme image par image : caméra fixe, tout petits mouvements", "entete": "S3-S4 - Image par image\n(caméra fixe, petits pas)",
      "competence": "S'approprier des outils et des méthodes", "domaine": "D2 - Méthodes et outils pour apprendre", "repere": "methode" },
    { "id": "film", "seance": "S3-S4", "libelle": "Son film est fini (30 images au moins) et raconte son histoire", "entete": "S3-S4 - Film fini\nqui raconte l'histoire",
      "competence": "Concevoir, créer, réaliser", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "film" },
    { "id": "montage", "seance": "S5", "libelle": "Monte son film : vitesse, images ratées enlevées, titre", "entete": "S5 - Monte son film\n(vitesse, images, titre)",
      "competence": "Pratiquer des démarches scientifiques et technologiques", "domaine": "D4 - Systèmes naturels et systèmes techniques", "repere": "montage" },
    { "id": "autonomie", "seance": "", "libelle": "Autonomie / travail en binôme", "entete": "Autonomie /\ntravail en binôme",
      "competence": "Concevoir, créer, réaliser (réaliser en équipe)", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "autonomie" }
  ],
  "critereCeinture": "film",
  "ceintures": ["Ceinture blanche", "Ceinture jaune", "Ceinture verte", "Ceinture vert foncé"],
  "titreExcel": "ÉVALUATION — PROJET \"MON FILM EN BRIQUES\" (STOP MOTION) — 6ème SEGPA"
});
