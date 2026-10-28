// Les séances et leurs écrans. Un écran = une seule chose à faire.
// Textes repris de la fiche élève et de la présentation (docs/sources/), raccourcis à 8 mots au plus si besoin :
// la suite de la phrase va dans « detail » (lue aussi à voix haute).
//
// Types d'écran : regle (bouton « J'ai compris ») · consigne (« C'est fait ») · photo · cases (lignes à cocher) ·
// bilan (phrases + trois visages). Écrans propres au taille-crayon (js/ecrans.js) : ouverture (la présentation),
// pieces (tableau des pièces), mesure (une pièce au réglet), remontage (le tableau à l'envers), questions (réponse
// toujours écrite ; aide « mes-pieces » : les photos de la séance 1 restent affichées).
// Les noms des pièces et les longueurs de référence sont dans donnees/modele.js.
// titre : nom de l'écran pour le professeur (écrans sans consigne : présentation, tableau des pièces…).
// bravo : ce qui s'affiche sur l'écran « Bravo » quand l'étape est faite.
// minuteur : minutes du bloc (déroulé minuté de la préparation) ; le cercle se vide pendant le bloc.
(function () {
  const REGLES = [
    { "id": "regle-force", "type": "regle", "picto": "main-stop", "texte": "Je ne force jamais une pièce.", "detail": "Si ça bloque, je lève la main." },
    { "id": "regle-vis", "type": "regle", "picto": "vis", "picto2": "boite", "texte": "Chaque vis va dans la boîte.", "detail": "Tout de suite. Jamais dans les mains." },
    { "id": "regle-lames", "type": "regle", "picto": "lame", "texte": "Je ne touche pas aux lames.", "detail": "Elles restent à l’intérieur du taille-crayon." }
  ];

  definirEtapes({
    "seances": [
      {
        "id": "s1", "titre": "Je démonte", "sousTitre": "et j’observe", "picto": "tournevis",
        "etapes": [
          { "id": "ouverture", "type": "ouverture", "titre": "Présentation", "pages": [
            { "titre": "C’est quoi, un objet technique ?", "detail": "Un objet fabriqué par l’Homme, qui répond à un besoin.",
              "images": [{ "picto": "velo", "mot": "Le vélo" }, { "picto": "stylo", "mot": "Le stylo" }, { "picto": "jouet", "mot": "Le jouet" }, { "picto": "taille-crayon", "mot": "Le taille-crayon" }] },
            { "titre": "Notre mission", "detail": "Toujours en binôme, une pièce à la fois.", "numeros": true,
              "images": [{ "picto": "tournevis", "mot": "Démonter" }, { "picto": "oeil", "mot": "Observer et dessiner" }, { "picto": "regle", "mot": "Mesurer" }, { "picto": "remonter", "mot": "Remonter" }] },
            { "titre": "L’objet du jour", "revele": { "picto": "taille-crayon", "image": "img/taille-crayon.jpg", "mot": "Le taille-crayon à manivelle" } },
            { "titre": "Le programme", "detail": "3 séances de 55 minutes.", "programme": true }
          ] },
          ...REGLES,
          { "id": "materiel", "type": "consigne", "picto": "tournevis", "texte": "Je prépare mon matériel.", "detail": "1 taille-crayon, 1 tournevis, 1 boîte." },
          { "id": "une-case", "type": "consigne", "picto": "boite", "texte": "Une pièce = une case dans la boîte.", "detail": "Pas de mélange avec le binôme voisin." },
          { "id": "pieces", "type": "pieces", "titre": "Tableau des pièces", "minuteur": 25 },
          { "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": "La boîte est rangée",
            "lignes": [
              { "picto": "boite", "texte": "Mes pièces sont dans la boîte, dans l’ordre." },
              { "picto": "etiquette", "texte": "Mon nom est sur la boîte." },
              { "picto": "table", "texte": "Ma table est propre." }
            ] },
          { "id": "boite", "type": "photo", "picto": "boite", "texte": "Prends ta boîte fermée en photo.", "legende": "Ma boîte fermée" }
        ]
      },
      {
        "id": "s2", "titre": "Je mesure", "sousTitre": "et je dessine", "picto": "regle",
        "etapes": [
          ...REGLES,
          { "id": "carreau", "type": "consigne", "picto": "regle", "texte": "1 carreau du quadrillage = 1 cm.", "detail": "Je mesure, puis je dessine dans la bonne taille." },
          { "id": "mesure-corps", "type": "mesure", "titre": "Mesure du corps", "piece": "corps", "minuteur": 18 },
          { "id": "mesure-manivelle", "type": "mesure", "titre": "Mesure de la manivelle", "piece": "manivelle", "minuteur": 17 },
          { "id": "rangement", "type": "cases", "picto": "balai", "texte": "Je range.", "minuteur": 5, "bravo": "La boîte est rangée",
            "lignes": [
              { "picto": "boite", "texte": "Les 2 pièces sont dans la boîte." },
              { "picto": "boite", "texte": "Ma boîte est fermée." },
              { "picto": "table", "texte": "Ma table est propre." }
            ] },
          { "id": "boite", "type": "photo", "picto": "boite", "texte": "Prends ta boîte fermée en photo.", "legende": "Ma boîte fermée" }
        ]
      },
      {
        "id": "s3", "titre": "Je remonte", "sousTitre": "et je teste", "picto": "remonter",
        "etapes": [
          ...REGLES,
          { "id": "a-l-envers", "type": "consigne", "picto": "remonter", "texte": "Je reprends mon tableau à l’envers.", "detail": "Je repars de la dernière pièce. Je revisse dans l’ordre inverse." },
          { "id": "remontage", "type": "remontage", "titre": "Tableau à l’envers", "minuteur": 30 },
          { "id": "verification", "type": "cases", "picto": "taille-crayon", "texte": "Je vérifie.", "minuteur": 5, "bravo": "Le taille-crayon est remonté",
            "lignes": [
              { "picto": "remonter", "texte": "La manivelle tourne bien." },
              { "picto": "boite", "texte": "Ma boîte est vide." },
              { "picto": "crayon", "texte": "Le taille-crayon fonctionne : je teste." }
            ] },
          { "id": "remonte", "type": "photo", "picto": "taille-crayon", "texte": "Prends le taille-crayon remonté en photo.", "legende": "Mon taille-crayon remonté" },
          { "id": "crayon", "type": "photo", "picto": "crayon", "texte": "Prends un crayon taillé en photo.", "legende": "Un crayon taillé" },
          { "id": "questions", "type": "questions", "titre": "Questions", "minuteur": 10, "questions": [
            { "id": "manivelle", "texte": "À quoi sert la manivelle ?" },
            { "id": "tourner", "texte": "Quelle pièce fait tourner l’autre pièce ?", "aide": "mes-pieces" },
            { "id": "difficile", "texte": "Quelle pièce était la plus dure à remonter ?", "aide": "mes-pieces" }
          ] },
          { "id": "bilan", "type": "bilan", "texte": "Mon bilan", "bravo": "Mon bilan est fait",
            "phrases": [
              "J’ai réussi à démonter puis remonter mon objet.",
              "J’ai travaillé en équipe avec mon binôme."
            ] }
        ]
      }
    ]
  });
})();
