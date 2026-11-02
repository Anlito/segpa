// Écrans des séances 1 et 2 (plan : docs/PLAN-stop-motion.md §3) :
//   idee-histoire     une partie du scénario (etape.partie : heros · lieu · action · probleme · solution · fin · objets),
//                     une carte-idée de donnees/idees.js ou « J'écris mon idée » (objets : plusieurs cartes)
//   histoire-resume   le récap : le titre, puis Début · Milieu · Fin et les objets à construire, lus à voix haute
//                     (en fin de séance 1, et pour relire l'histoire au début des séances 2, 3 et 4 : avec l'avis
//                     du professeur, « Validé » ou « À revoir », et la possibilité de changer une réponse)
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

  function vueRecap(etape, O) {
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
  }

  // ---------- L'avis du professeur (écran « Je relis mon histoire », séances 2, 3 et 4) ----------
  // Le professeur dépose avis-professeur.json dans le dossier de l'équipe. Un nouvel avis s'affiche d'abord :
  // « Validé » → « Ton professeur a lu ton histoire » ; « À revoir » (ambre) → son mot et « Je change une réponse ».
  // Ensuite le récap habituel. Chaque avis n'est montré qu'une fois (d.avisVu).
  async function lireAvis(O) {
    const se = O.etat.session;
    if (se.lecture || !se.dossier) return null;
    try {
      return S.lireAvis(await (await (await se.dossier.getFileHandle('avis-professeur.json')).getFile()).text(), S.projet.id);
    } catch {
      return null;
    }
  }
  const PARTIES = [
    ['heros', 'Mon héros'],
    ['lieu', 'Le lieu'],
    ['action', 'Au début'],
    ['probleme', 'Le problème'],
    ['solution', 'La solution'],
    ['fin', 'La fin'],
    ['objets', 'Mes objets'],
  ];
  const etapeDePartie = (partie) => S.etapes.seances.flatMap((x) => x.etapes).find((e) => e.type === 'idee-histoire' && e.partie === partie) || {};

  S.ajouterEcran('histoire-resume', (etape, O) => {
    const { ech, pic } = O;
    if (!etape.relire) return vueRecap(etape, O);
    const sous = O.sous();
    if (!('avis' in sous))
      return {
        milieu: `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte">Je relis mon histoire…</p></div>`,
        principal: O.boutonPrincipal('fait', etape.bouton || 'J’ai relu', 'coche', true),
        actions: {},
        apres: async () => {
          sous.avis = await lireAvis(O);
          sous.montrer = S.avisAMontrer(sous.avis, O.D());
          O.rafraichir();
        },
      };
    const avis = sous.avis;
    const vu = () => {
      S.noterAvisVu(O.D(), avis);
      O.enregistrer(true);
    };
    // Changer une réponse : d'abord laquelle, puis la carte-idée ou le clavier.
    if (sous.partie) {
      const e = etapeDePartie(sous.partie);
      const vue = S.vueChoixOuTexte(O, {
        texte: e.texte || 'Je change ma réponse.',
        texteEcrire: e.texteEcrire || e.texte,
        pastille: 'Je change ma réponse',
        idees: (S.donneesProjet.idees || {})[sous.partie],
        valeur: S.histoireDe(O.D())[sous.partie],
        longueur: S.LONGUEUR_IDEE,
        libelleEcrire: 'J’écris mon idée',
        libelleGarder: 'C’est ma nouvelle idée',
        plusieurs: sous.partie === 'objets',
        garder: (t) => {
          S.noterHistoire(O.D(), sous.partie, t);
          O.enregistrer(true);
          for (const k of ['partie', 'choix', 'ecrire']) delete sous[k];
          sous.change = true;
          O.message('C’est changé !');
          O.rafraichir();
        },
      });
      if (!sous.ecrire) vue.gauche = O.boutonRetour('fin-partie');
      vue.actions['fin-partie'] = () => {
        for (const k of ['partie', 'choix', 'ecrire']) delete sous[k];
        O.rafraichir();
      };
      return vue;
    }
    if (sous.parties) {
      const h = S.histoireDe(O.D());
      return {
        milieu: `<div class="colonne montage-colonne histoire-colonne">
            <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">Quelle réponse je change ?</p>${O.boutonVoix('Quelle réponse je change ? Je touche la réponse à changer.')}</div>
            <div class="cartes-parties">${PARTIES.map(([k, t]) => `<button type="button" class="carte-partie" data-action="partie" data-p="${k}"><small>${ech(t)}</small><span>${ech(h[k] || '—')}</span></button>`).join('')}</div>
          </div>`,
        gauche: O.boutonRetour('fin-parties'),
        principal: O.boutonPrincipal('fini-parties', sous.change ? 'J’ai fini de changer' : 'Je ne change rien', 'coche'),
        actions: {
          partie: (b) => {
            sous.partie = b.dataset.p;
            O.rafraichir();
          },
          'fin-parties': () => {
            sous.parties = false;
            O.rafraichir();
          },
          'fini-parties': () => {
            sous.parties = false;
            sous.montrer = false;
            O.rafraichir();
          },
        },
      };
    }
    if (sous.montrer) {
      const revoir = avis.avis === 'revoir';
      const titre = revoir ? 'Ton professeur te propose de changer un peu ton histoire.' : 'Ton professeur a lu ton histoire.';
      const voix = titre + (avis.mot ? ' Son mot : ' + avis.mot : '');
      return {
        milieu: `<div class="colonne montage-colonne avis-colonne${revoir ? ' revoir' : ''}">
            <div class="avis-icone">${pic(revoir ? 'crayon' : 'visage-oui')}</div>
            <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">${ech(titre)}</p>${O.boutonVoix(voix)}</div>
            ${avis.mot ? `<blockquote class="avis-mot${revoir ? ' msg-ambre' : ''}">« ${ech(avis.mot)} »</blockquote>` : ''}
            ${revoir ? `<button type="button" class="btn btn-second avis-garder" data-action="lu">${pic('suivant')}Je garde mon histoire</button>` : ''}
          </div>`,
        principal: revoir ? O.boutonPrincipal('changer', 'Je change une réponse', 'crayon') : O.boutonPrincipal('lu', 'Je relis mon histoire', 'lecture'),
        actions: {
          changer: () => {
            vu();
            sous.parties = true;
            O.rafraichir();
          },
          lu: () => {
            vu();
            sous.montrer = false;
            O.rafraichir();
          },
        },
      };
    }
    return vueRecap(etape, O);
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
