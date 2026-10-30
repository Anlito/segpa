// Évaluation de la voiture à ballon : les 7 critères du brief §5 (PROPOSITION À VALIDER par Thomas), adaptés à ses
// décisions : la réponse « pourquoi ma voiture avance » est écrite (pas orale), les séances sont celles du plan validé.
//   libelle   : libellé du critère (aussi celui à créer dans le Carnet de classe pour l'import)
//   entete    : en-tête de la colonne dans l'Excel
//   repere    : observations automatiques montrées à côté du critère (js/prof-projet.js) — jamais un niveau
// Même barème que le taille-crayon : Rouge 0 · Jaune 1 · Vert clair 2 · Vert foncé 3 ; note /20 = score ÷ 21 × 20.
// Le classement de la course n'entre pas dans la note.
// Ceinture (élèves) : le niveau du critère « fonctionne » (voiture terminée et qui roule) — proposition à valider ;
// Rouge → ceinture blanche, pour ne pas montrer de rouge aux élèves.
definirCriteres({
  "criteres": [
    { "id": "fabrication", "seance": "S2", "libelle": "Suit la fiche de fabrication, dans l'ordre", "entete": "S2 - Suit la fiche\nde fabrication",
      "competence": "S'approprier des outils et des méthodes", "domaine": "D2 - Méthodes et outils pour apprendre", "repere": "fabrication" },
    { "id": "regles", "seance": "S1-S5", "libelle": "Respecte les règles du matériel (sécurité, matériel compté et rangé)", "entete": "S1-S5 - Respecte les règles\ndu matériel",
      "competence": "Adopter un comportement éthique et responsable", "domaine": "D3 - Formation de la personne et du citoyen · D5 - Représentations du monde et activité humaine", "repere": "regles" },
    { "id": "fonctionne", "seance": "S2-S3", "libelle": "Sa voiture est terminée et fonctionne", "entete": "S2-S3 - Voiture terminée\net qui fonctionne",
      "competence": "Concevoir, créer, réaliser", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "fonctionne" },
    { "id": "essais", "seance": "S4", "libelle": "Teste, change une seule chose, re-teste", "entete": "S4 - Teste, change\nune seule chose, re-teste",
      "competence": "Pratiquer des démarches scientifiques et technologiques", "domaine": "D4 - Systèmes naturels et systèmes techniques", "repere": "essais" },
    { "id": "mesure", "seance": "S4", "libelle": "Mesure avec le bon outil et écrit l'unité", "entete": "S4 - Mesure avec le bon outil\net écrit l'unité",
      "competence": "S'approprier des outils et des méthodes", "domaine": "D2 - Méthodes et outils pour apprendre", "repere": "mesure" },
    { "id": "explique", "seance": "S5", "libelle": "Explique à l'écrit pourquoi sa voiture avance", "entete": "S5 - Explique à l'écrit\npourquoi sa voiture avance",
      "competence": "Pratiquer des langages", "domaine": "D1 - Langages pour penser et communiquer", "repere": "explique" },
    { "id": "autonomie", "seance": "", "libelle": "Autonomie / travail en binôme", "entete": "Autonomie /\ntravail en binôme",
      "competence": "Concevoir, créer, réaliser (réaliser en équipe)", "domaine": "D4 - Systèmes naturels et systèmes techniques · D5 - Représentations du monde et activité humaine", "repere": "autonomie" }
  ],
  "critereCeinture": "fonctionne",
  "ceintures": ["Ceinture blanche", "Ceinture jaune", "Ceinture verte", "Ceinture vert foncé"],
  "titreExcel": "ÉVALUATION — PROJET \"COURSE DE VOITURES À BALLON\" — 6ème SEGPA"
});
