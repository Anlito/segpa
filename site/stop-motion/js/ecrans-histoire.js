// Écrans des séances 1 et 2 (plan : docs/PLAN-stop-motion.md §3) :
//   idee-histoire     une partie de l'histoire (etape.partie : heros · lieu · probleme · fin), une carte-idée de
//                     donnees/idees.js ou « J'écris mon idée »
//   histoire-resume   mon histoire en 3 temps : Début · Milieu · Fin (3 phrases, lues à voix haute)
//   construire        une consigne de construction, avec le rappel de l'histoire (etape.partie : lieu · heros · objets)
// L'histoire est gardée dans la sauvegarde (d.histoire) ; la logique est dans js/studio.js (testée).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const TEMPS = { heros: 'Début', lieu: 'Début', probleme: 'Milieu', fin: 'Fin' };

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
      garder: (t) => {
        S.noterHistoire(O.D(), partie, t);
        O.suivant({ [partie]: S.histoireDe(O.D())[partie] });
      },
    });
  });

  S.ajouterEcran('histoire-resume', (etape, O) => {
    const { ech, pic } = O;
    const ph = S.phrasesHistoire(S.histoireDe(O.D()));
    const cases = [
      ['Début', ph.debut, 'lecture'],
      ['Milieu', ph.milieu, 'question'],
      ['Fin', ph.fin, 'drapeau'],
    ];
    const voix = cases.map(([t, p]) => `${t} : ${p || 'pas encore choisi'}`).join('. ');
    const complet = cases.every(([, p]) => p);
    return {
      milieu: `<div class="colonne montage-colonne histoire-colonne">
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">${ech(etape.texte || 'Mon histoire en 3 temps.')}</p>${O.boutonVoix(voix)}</div>
          <div class="trois-temps">${cases
            .map(
              ([t, p, picto], i) => `<div class="temps${p ? '' : ' vide'}"><span class="temps-numero">${i + 1}</span><strong>${pic(picto)}${t}</strong><p>${ech(p || 'Pas encore choisi')}</p></div>`
            )
            .join('')}</div>
          <p class="consigne-detail">${ech(etape.detail || 'Je dessine ces 3 cases sur mon storyboard.')}</p>
        </div>`,
      principal: O.boutonPrincipal('fait', etape.bouton || 'C’est mon histoire', 'coche', !complet),
      actions: { fait: () => O.suivant(ph) },
    };
  });

  // Rappel de l'histoire pendant la construction : « Mon lieu : dans la forêt ».
  const RAPPELS = {
    lieu: (h) => h.lieu && `Mon lieu : ${h.lieu}`,
    heros: (h) => h.heros && `Mon héros : ${h.heros}`,
    objets: (h) => h.probleme && `Mon problème : ${h.probleme}`,
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
