// Écran « Mes essais » de la séance 4 (plan : docs/PLAN-voiture-ballon.md §3). Un écran par geste :
//   roues (une fois) · je pose · je gonfle (coups de pompe) · je lâche · je mesure (pavé, en cm) · ma voiture roule
//   comment ? · je change UNE chose (ou, après 3 essais : encore un essai / mon graphique) · mon graphique.
// La suite logique est dans js/essais.js (testée) ; ici, seulement l'affichage. Tout est gardé au fur et à mesure dans
// la rubrique de l'étape : l'équipe reprend là où elle en était.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const R = () => P().essais || {};
  const unite = () => R().unite || 'cm';

  // « Roues 40 mm », « Plus gonflé »… (pour le rappel en haut des écrans et le graphique)
  function nomChangement(c) {
    if (!c) return 'Départ';
    const def = (P().changements || []).find((x) => x.id === c.type);
    if (!def) return c.type;
    if (def.choix === 'roues') return `Roues ${c.choix} mm`;
    const choix = (def.choix || []).find((x) => x.id === c.choix);
    return choix ? choix.nom : def.nom;
  }
  const pictoChangement = (c) => ((P().changements || []).find((x) => c && x.id === c.type) || { picto: 'drapeau' }).picto;

  S.ajouterEcran('essais', (etape, O) => {
    const sid = O.seance().id;
    const lu = S.valeurEtape(O.D(), sid, etape.id);
    const v = lu && typeof lu === 'object' ? JSON.parse(JSON.stringify(lu)) : S.essaisVides();
    const sous = O.sous();
    let ecran = S.ecranEssai(v, R());
    if (ecran === 'suite' && sous.changer) ecran = 'changer';

    const garder = (nv) => {
      for (const k of ['roues', 'pompe', 'saisie', 'verifier', 'direction', 'type', 'choix', 'deux', 'changer']) delete sous[k];
      S.noterBrouillon(O.D(), sid, etape.id, nv);
      O.enregistrer(true);
      O.rafraichir();
    };
    const n = v.essais.length;
    const dernier = v.essais[n - 1];
    const numero = ecran === 'changer' || ecran === 'suite' ? n + 1 : Math.max(1, n);
    const rappel = `Essai ${numero}` + (ecran !== 'changer' && dernier && dernier.changement && ecran !== 'graphique' ? ' · ' + nomChangement(dernier.changement) : '');
    const titre = (texte, voix) => `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.5rem">${O.ech(texte)}</p>${O.boutonVoix(voix || texte)}</div>`;
    const pastille = `<span class="pastille">${O.ech(rappel)}</span>`;
    const gauche = sous.changer
      ? O.boutonRetour('fin-changer')
      : S.reculerEssai(v) === null ? O.boutonRetour('precedent') : O.boutonRetour('retour-essai');
    const communes = {
      'retour-essai': () => garder(S.reculerEssai(v)),
      'fin-changer': () => {
        sous.changer = false;
        O.rafraichir();
      },
    };
    const vue = (o) => ({ gauche, ...o, actions: Object.assign({}, communes, o.actions) });

    // ---------- Les roues du départ ----------
    if (ecran === 'roues') {
      const roues = P().roues || ['20', '30', '40', '50'];
      const plus = Math.max(...roues.map(Number));
      return vue({
        milieu: `<div class="colonne" style="gap:1.75rem;align-items:center">
            ${titre('Quelles roues sont sur ma voiture ?')}
            <div class="cartes-roues">${roues
              .map((r) => `<button type="button" class="carte-roue" data-action="choisir-roues" data-r="${O.ech(r)}" aria-pressed="${sous.roues === r}">
                  <svg viewBox="0 0 100 100" style="width:${(7.5 * Number(r)) / plus}rem;height:${(7.5 * Number(r)) / plus}rem" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="50" cy="50" r="9" fill="currentColor"/></svg>
                  <span>${O.ech(r)} mm</span></button>`)
              .join('')}</div>
          </div>`,
        principal: O.boutonPrincipal('roues-choisies', 'C’est celles-là', 'coche', !sous.roues),
        actions: {
          'choisir-roues': (b) => {
            sous.roues = b.dataset.r;
            O.rafraichir();
          },
          'roues-choisies': () => garder(S.noterEssai(v, 'roues', sous.roues)),
        },
      });
    }

    // ---------- Je pose · je lâche ----------
    if (ecran === 'ligne')
      return vue({
        milieu: O.blocConsigne({ picto: 'drapeau', texte: 'Je pose ma voiture sur la ligne.', detail: 'L’avant de la voiture touche la ligne.' }, rappel),
        principal: O.boutonPrincipal('essai-place', 'C’est fait'),
        actions: { 'essai-place': () => garder(S.noterEssai(v, 'ligne')) },
      });
    if (ecran === 'lache')
      return vue({
        milieu: O.blocConsigne({ picto: 'main-stop', texte: 'Je lâche la voiture au signal.', detail: 'Je ne la pousse pas.' }, rappel),
        principal: O.boutonPrincipal('essai-parti', 'Elle est partie', 'fleche'),
        actions: { 'essai-parti': () => garder(S.noterEssai(v, 'lache')) },
      });

    // ---------- Je gonfle : je compte les coups de pompe ----------
    if (ecran === 'gonfle') {
      if (sous.pompe === undefined) {
        const avant = v.essais.slice(0, -1).reverse().find((e) => e.pompe > 0);
        sous.pompe = avant ? avant.pompe : 0;
      }
      const maj = () => {
        O.racine.querySelector('.compteur-grand .nombre').textContent = String(sous.pompe);
        O.racine.querySelector('[data-action="pompe-moins"]').disabled = !sous.pompe;
        O.racine.querySelector('[data-action="essai-pompe"]').disabled = !sous.pompe;
      };
      return vue({
        milieu: `<div class="picto-grand seul">${O.pic('pompe')}</div>
          <div class="consigne">
            ${pastille}
            <div class="consigne-ligne"><p class="consigne-texte">Je gonfle le ballon avec la pompe.</p>${O.boutonVoix('Je gonfle le ballon avec la pompe. Je compte les coups de pompe.')}</div>
            <div class="compteur-grand">
              <button type="button" class="compteur grand" data-action="pompe-moins" aria-label="Un coup de moins"${sous.pompe ? '' : ' disabled'}>−</button>
              <output class="nombre" aria-live="polite">${sous.pompe}</output>
              <button type="button" class="compteur grand" data-action="pompe-plus" aria-label="Un coup de plus">+</button>
              <span>coups de pompe</span>
            </div>
          </div>`,
        principal: O.boutonPrincipal('essai-pompe', 'C’est gonflé', 'coche', !sous.pompe),
        actions: {
          'pompe-plus': () => {
            sous.pompe = Math.min(60, sous.pompe + 1);
            maj();
          },
          'pompe-moins': () => {
            sous.pompe = Math.max(0, sous.pompe - 1);
            maj();
          },
          'essai-pompe': () => garder(S.noterEssai(v, 'gonfle', sous.pompe)),
        },
      });
    }

    // ---------- Je mesure (pavé numérique, en cm) ----------
    if (ecran === 'mesure') {
      sous.saisie = sous.saisie || '';
      const msg = sous.verifier
        ? `<div class="msg msg-ambre" role="alert">${O.pic('metre')}${sous.verifier === 'plus' ? 'C’est beaucoup plus loin que tes autres essais.' : 'C’est beaucoup moins loin que tes autres essais.'} Mesure encore une fois ?</div>
           <button type="button" class="btn btn-second" data-action="mesurer-encore" style="align-self:flex-start">${O.pic('metre')}Je mesure encore</button>`
        : '';
      return vue({
        milieu: `<div class="colonne" style="gap:1.5rem;max-width:40rem">
            ${pastille}
            ${titre('Je mesure la distance.', 'Je mesure la distance avec le mètre ruban, en centimètres.')}
            <p class="consigne-detail">Avec le mètre ruban, en centimètres.</p>
            <div class="ligne-mesure"><span class="affichage-mesure">${O.ech(sous.saisie) || '&nbsp;'}</span><span class="unite">${O.ech(unite())}</span></div>
          </div>
          ${sous.verifier ? `<div class="colonne" style="max-width:32rem;gap:1.5rem">${msg}</div>` : O.pave.html()}`,
        principal: sous.verifier
          ? O.boutonPrincipal('mesure-juste', 'C’est juste', 'coche')
          : O.boutonPrincipal('mesure', 'C’est mesuré', 'coche', S.lireNombre(sous.saisie) === null),
        actions: {
          touche: (b) => {
            sous.saisie = O.pave.appui(sous.saisie, b.dataset.c);
            O.racine.querySelector('.affichage-mesure').innerHTML = O.ech(sous.saisie) || '&nbsp;';
            O.racine.querySelector('[data-action="mesure"]').disabled = S.lireNombre(sous.saisie) === null;
          },
          mesure: () => {
            const d = S.lireNombre(sous.saisie);
            if (d === null) return;
            sous.verifier = S.mesureSuspecte(v, d, R());
            if (sous.verifier) return O.rafraichir();
            garder(S.noterEssai(v, 'mesure', d));
          },
          'mesurer-encore': () => {
            sous.verifier = null;
            sous.saisie = '';
            O.rafraichir();
          },
          'mesure-juste': () => garder(S.noterEssai(v, 'mesure', S.lireNombre(sous.saisie))),
        },
      });
    }

    // ---------- Ma voiture roule comment ? ----------
    if (ecran === 'direction') {
      const dirs = P().directions || [];
      return vue({
        milieu: `<div class="colonne" style="gap:1.75rem;align-items:center">
            ${pastille}
            ${titre('Ma voiture roule comment ?', 'Ma voiture roule comment ? ' + dirs.map((d) => d.nom).join(', ') + ' ?')}
            <div class="causes">${dirs
              .map((d) => `<button type="button" class="cause" data-action="choisir-direction" data-id="${O.ech(d.id)}" aria-pressed="${sous.direction === d.id}"><span class="tuile">${O.pic(d.picto)}</span>${O.ech(d.nom)}</button>`)
              .join('')}</div>
          </div>`,
        principal: O.boutonPrincipal('direction-choisie', 'C’est ça', 'coche', !sous.direction),
        actions: {
          'choisir-direction': (b) => {
            sous.direction = b.dataset.id;
            O.rafraichir();
          },
          'direction-choisie': () => garder(S.noterEssai(v, 'direction', sous.direction)),
        },
      });
    }

    // ---------- Après 3 essais : encore un essai, ou mon graphique ----------
    if (ecran === 'suite')
      return vue({
        milieu: `<div class="colonne" style="gap:2rem;align-items:center">
            ${titre('Encore un essai ?', 'Encore un essai ? Je change une chose, ou je regarde mon graphique.')}
            <div style="display:flex;gap:3rem">
              <button type="button" class="choix" data-action="encore"><span class="rond plein">${O.pic('remonter')}</span>Je change une chose</button>
              <button type="button" class="choix" data-action="voir-graphique"><span class="rond">${O.pic('graphique')}</span>Mon graphique</button>
            </div>
          </div>`,
        principal: '',
        actions: {
          encore: () => {
            sous.changer = true;
            O.rafraichir();
          },
          'voir-graphique': () => garder(S.noterEssai(v, 'graphique')),
        },
      });

    // ---------- Je change UNE chose ----------
    if (ecran === 'changer') {
      const defs = P().changements || [];
      const def = defs.find((d) => d.id === sous.type);
      let details = [];
      if (def && def.choix === 'roues') details = (P().roues || []).filter((r) => r !== S.rouesDe(v)).map((r) => ({ id: r, nom: r + ' mm' }));
      else if (def) details = def.choix || [];
      return vue({
        milieu: `<div class="colonne" style="gap:1.25rem;align-items:center">
            ${titre('Je change une seule chose.', 'Je change une seule chose : ' + defs.map((d) => d.nom).join(', ') + '.')}
            <div class="causes compact">${defs
              .map((d) => `<button type="button" class="cause" data-action="choisir-changement" data-id="${O.ech(d.id)}" aria-pressed="${sous.type === d.id}"><span class="tuile">${O.pic(d.picto)}</span>${O.ech(d.nom)}</button>`)
              .join('')}</div>
            ${sous.deux ? `<div class="msg msg-ambre" role="alert">${O.pic('main-stop')}Choisis un seul changement.</div>` : ''}
            ${details.length ? `<div class="choix-details">${details.map((c) => `<button type="button" class="carte-choix mode" data-action="choisir-detail" data-c="${O.ech(c.id)}" aria-pressed="${sous.choix === c.id}">${O.ech(c.nom)}</button>`).join('')}</div>` : ''}
          </div>`,
        principal: O.boutonPrincipal('change-fait', 'C’est changé', 'coche', !(sous.type && sous.choix)),
        actions: {
          'choisir-changement': (b) => {
            const id = b.dataset.id;
            if (sous.type && sous.type !== id) sous.deux = true;
            else if (sous.type === id) Object.assign(sous, { type: null, choix: null, deux: false });
            else Object.assign(sous, { type: id, choix: null, deux: false });
            O.rafraichir();
          },
          'choisir-detail': (b) => {
            sous.choix = b.dataset.c;
            sous.deux = false;
            O.rafraichir();
          },
          'change-fait': () => garder(S.noterEssai(v, 'changer', { type: sous.type, choix: sous.choix })),
        },
      });
    }

    // ---------- Mon graphique ----------
    const faits = v.essais.filter((e) => typeof e.distance === 'number' && e.direction);
    const plus = Math.max(1, ...faits.map((e) => e.distance));
    const best = S.meilleurEssai(v);
    const lu2 = faits.map((e, i) => `Essai ${i + 1}, ${nomChangement(e.changement)} : ${S.ecrireNombre(e.distance)} centimètres.`).join(' ');
    return vue({
      milieu: `<div class="colonne" style="gap:1rem;align-items:center">
          ${titre('Mon graphique', 'Mon graphique. ' + lu2)}
          <div class="graphique" role="img" aria-label="${O.ech(lu2)}">${faits
            .map((e, i) => `<div class="barre-essai${i === best ? ' meilleur' : ''}"><span class="valeur">${S.ecrireNombre(e.distance)} ${O.ech(unite())}</span><span class="barre" style="height:${Math.max(3, (e.distance / plus) * 100)}%"></span></div>`)
            .join('')}</div>
          <div class="legende-essais">${faits
            .map((e, i) => `<div class="nom-essai"><strong>Essai ${i + 1}</strong><span>${O.pic(pictoChangement(e.changement))}${O.ech(nomChangement(e.changement))}</span>${i === best ? '<em>Le plus loin</em>' : ''}</div>`)
            .join('')}</div>
        </div>`,
      principal: O.boutonPrincipal('essais-finis', 'C’est fini', 'coche'),
      actions: { 'essais-finis': () => O.suivant(v) },
    });
  });
})(window);
