// Évaluation du taille-crayon : les 7 critères de Evaluation_projet_demontage.xlsx (docs/sources/), tels quels,
// rattachés aux compétences travaillées du cycle 3 (validé par Thomas le 28/10/2026).
//   libelle   : libellé du critère (aussi celui à créer dans le Carnet de classe pour l'import)
//   entete    : en-tête de la colonne dans l'Excel (comme le fichier de Thomas)
//   repere    : observations automatiques montrées à côté du critère (js/prof-projet.js) — jamais un niveau
// Barème de l'Excel : Rouge 0 · Jaune 1 · Vert clair 2 · Vert foncé 3 ; note /20 = score ÷ 21 × 20, arrondie à 0,1.
// Ceinture (élèves) : le niveau du critère « remontage » (préparation §9 : « basée sur la réussite du remontage
// fonctionnel ») ; Rouge → ceinture blanche, pour ne pas montrer de rouge aux élèves.
definirCriteres({
  "criteres": [
    { "id": "procedure", "seance": "S1", "libelle": "Suit la procédure (1 pièce à la fois)", "entete": "S1 - Suit la procédure\n(1 pièce à la fois)",
      "competence": "S'approprier des outils et des méthodes", "domaine": "D2 - Méthodes et outils pour apprendre", "repere": "procedure" },
    { "id": "securite", "seance": "S1", "libelle": "Respecte la sécurité (vis rangées, ne force pas)", "entete": "S1 - Respecte la sécurité\n(vis rangées, ne force pas)",
      "competence": "Adopter un comportement éthique et responsable", "domaine": "D3 - Formation de la personne et du citoyen · D5 - Représentations du monde et activité humaine", "repere": "securite" },
    { "id": "mesure", "seance": "S2", "libelle": "Mesure correctement au réglet", "entete": "S2 - Mesure correctement\nau réglet",
      "competence": "S'approprier des outils et des méthodes", "domaine": "D2 - Méthodes et outils pour apprendre", "repere": "mesure" },
    { "id": "dessin", "seance": "S2", "libelle": "Dessin fidèle (proportions respectées)", "entete": "S2 - Dessin fidèle\n(proportions respectées)",
      "competence": "Pratiquer des langages", "domaine": "D1 - Langages pour penser et communiquer", "repere": "dessin" },
    { "id": "remontage", "seance": "S3", "libelle": "Remontage fonctionnel", "entete": "S3 - Remontage\nfonctionnel",
      "competence": "Concevoir, créer, réaliser", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "remontage" },
    { "id": "questions", "seance": "S3", "libelle": "Répond aux questions de compréhension", "entete": "S3 - Répond aux questions\nde compréhension",
      "competence": "Pratiquer des langages", "domaine": "D1 - Langages pour penser et communiquer", "repere": "questions" },
    { "id": "autonomie", "seance": "", "libelle": "Autonomie / travail en binôme", "entete": "Autonomie /\ntravail en binôme",
      "competence": "Concevoir, créer, réaliser (réaliser en équipe)", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "autonomie" }
  ],
  "critereCeinture": "remontage",
  "ceintures": ["Ceinture blanche", "Ceinture jaune", "Ceinture verte", "Ceinture vert foncé"],
  "titreExcel": "ÉVALUATION — PROJET \"JE DÉMONTE UN OBJET TECHNIQUE\" — 6ème SEGPA"
});
