// Écrans des séances 1 et 2 (plan : docs/PLAN-stop-motion.md §3) :
//   idee-histoire     une partie du scénario (etape.partie : heros · lieu · action · probleme · solution · fin · objets),
//                     une carte-idée de donnees/idees.js ou « J'écris mon idée » (objets : plusieurs cartes)
//   histoire-resume   le récap : le titre, puis Début · Milieu · Fin et les objets à construire, lus à voix haute
//                     (en fin de séance 1, et pour relire l'histoire au début des séances 3 et 4)
//   construire        une consigne de construction, avec le rappel de l'histoire (etape.partie : lieu · heros · objets)
// L'histoire est gardée dans la sauvegarde (d.histoire) ; la logique est dans js/studio.js (testée).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const TEMPS = { heros: 'Début', lieu: 'Début', action: 'Début', probleme: 'Milieu', solution: 'Milieu', fin: 'Fin', objets: 'Pour la séance 2' };

  S.ajouterEcran('idee-histoire', (etape, O) => {
    const partie = etape.partie;
    return S.vueChoixOuTexte(O, {
      texte: etape.texte,
      texteEcrire: etape.texteEcrire || etape.texte,
      pastille: etape.pastille || TEMPS[partie],
      idees: (P().idees || {})[partie],
      valeur: S.histoireDe(O.D())[partie],
      longueur: S.LONGUEUR_IDEE,
      libelleEcrire: 'J’écris mon idée',
      libelleGarder: 'C’est mon idée',
      plusieurs: partie === 'objets',
      garder: (t) => {
        S.noterHistoire(O.D(), partie, t);
        O.suivant({ [partie]: S.histoireDe(O.D())[partie] });
      },
    });
  });

  S.ajouterEcran('histoire-resume', (etape, O) => {
    const { ech, pic } = O;
    const ph = S.phrasesHistoire(S.histoireDe(O.D()));
    const titre = S.filmDe(O.D()).titre;
    const cases = [
      ['Début', ph.debut, 'lecture'],
      ['Milieu', ph.milieu, 'question'],
      ['Fin', ph.fin, 'drapeau'],
    ];
    const voix = [titre && `Mon film : ${titre}`]
      .concat(cases.map(([t, p]) => `${t} : ${p || 'pas encore choisi'}`))
      .concat(ph.objets ? [`Mes objets : ${ph.objets}`] : [])
      .filter(Boolean)
      .join('. ');
    const complet = cases.every(([, p]) => p);
    return {
      milieu: `<div class="colonne montage-colonne histoire-colonne">
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">${ech(etape.texte || 'Mon histoire en 3 temps.')}</p>${O.boutonVoix(voix)}</div>
          ${titre ? `<p class="titre-recap">${pic('film')}<span>${ech(titre)}</span></p>` : ''}
          <div class="trois-temps">${cases
            .map(
              ([t, p, picto], i) => `<div class="temps${p ? '' : ' vide'}"><span class="temps-numero">${i + 1}</span><strong>${pic(picto)}${t}</strong><p>${ech(p || 'Pas encore choisi')}</p></div>`
            )
            .join('')}</div>
          ${ph.objets ? `<p class="objets-recap">${pic('brique')}<span>Mes objets : ${ech(ph.objets)}</span></p>` : ''}
        </div>`,
      principal: O.boutonPrincipal('fait', etape.bouton || 'C’est mon histoire', 'coche', !complet && !etape.relire),
      actions: { fait: () => O.suivant(etape.relire ? undefined : ph) },
    };
  });

  // Rappel de l'histoire pendant la construction : « Mon lieu : dans la forêt ».
  const RAPPELS = {
    lieu: (h) => h.lieu && `Mon lieu : ${h.lieu}`,
    heros: (h) => h.heros && `Mon héros : ${h.heros}`,
    objets: (h) => (h.objets && `Mes objets : ${h.objets}`) || (h.probleme && `Mon problème : ${h.probleme}`),
  };

  S.ajouterEcran('construire', (etape, O) => {
    const h = S.histoireDe(O.D());
    const rappel = (RAPPELS[etape.partie] || (() => ''))(h);
    return {
      milieu: O.blocConsigne(etape, rappel || etape.pastille),
      principal: O.boutonPrincipal('fait', etape.bouton || 'C’est fait'),
      actions: { fait: () => O.suivant() },
    };
  });
})(window);
