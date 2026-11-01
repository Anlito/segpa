// Écran « Je dessine ma carrosserie » (séance à part, entre la construction et le montage) : l'équipe décore chaque
// pièce du patron, que la Cricut tracera au stylo avant de la découper. Trois temps :
//   1. je choisis une pièce (5 cartes, une coche sur celles déjà décorées) ;
//   2. je dessine sur la pièce, montrée à l'endroit : tampons, Agrandir, Rapetisser, Tourner, J'efface, Annuler ;
//      l'ordinateur garde tout dans la zone de dessin (« Je l'ai remis dans la pièce. », en ambre) ;
//   3. je regarde toute ma voiture (le patron entier avec le dessin), puis « C'est fini ».
// La suite logique (pièces, zone, export) est dans js/dessin.js (testée).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const D = () => S.dessin;
  const PAT = () => (S.donneesProjet || {}).patron;

  const svgAnneaux = (anneaux, classe) => anneaux.map((a) => `<path class="${classe}" d="${D().cheminSvg(a)}"/>`).join('');
  const piecesDroites = () => PAT().pieces.map((p) => D().pieceDroite(p));

  // Dessin d'une pièce à l'endroit (contour, zone, éléments), en mm.
  function svgPiece(p, elements, options) {
    const o = options || {};
    const m = o.marge === undefined ? 2 : o.marge;
    const els = elements
      .map((el, i) => `<g class="element${i === o.choisi ? ' choisi' : ''}" data-i="${i}">${svgAnneaux(D().contoursElement(el), 'trait-dessin')}</g>`)
      .join('');
    return `<svg class="${o.classe || 'piece-svg'}" viewBox="${-m} ${-m} ${(p.largeur + 2 * m).toFixed(2)} ${(p.hauteur + 2 * m).toFixed(2)}" role="img" aria-label="${S.echapper(p.nom)}">
      <path class="piece-fond" fill-rule="evenodd" d="${[p.contour, ...p.trous].map(D().cheminSvg).join(' ')}"/>
      ${o.zone ? `<path class="piece-zone" fill-rule="evenodd" d="${[p.zone.contour, ...p.zone.trous].map(D().cheminSvg).join(' ')}"/>` : ''}
      ${els}
    </svg>`;
  }

  // Le patron entier avec le dessin (aperçu de toute la voiture).
  function svgPatron(valeur) {
    const P = PAT();
    return `<svg class="patron-svg" viewBox="-2 -2 ${P.taille[0] + 4} ${P.taille[1] + 4}" role="img" aria-label="Toute ma carrosserie">
      ${P.decoupe.map((d) => `<path class="patron-decoupe" fill-rule="evenodd" d="${d}"/>`).join('')}
      ${P.plis.map(([a, b, c, d]) => `<line class="patron-pli" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('')}
      ${D().cheminsDessin(valeur, P.pieces).map((d) => `<path class="trait-dessin" d="${d}"/>`).join('')}
    </svg>`;
  }

  S.ajouterEcran('dessin-carrosserie', (etape, O) => {
    const sid = O.seance().id;
    const lu = S.valeurEtape(O.D(), sid, etape.id);
    const valeur = lu && typeof lu === 'object' && lu.pieces ? JSON.parse(JSON.stringify(lu)) : { pieces: {} };
    const sous = O.sous();
    sous.historique = sous.historique || [];
    const garder = () => {
      S.noterBrouillon(O.D(), sid, etape.id, valeur);
      O.enregistrer(false);
    };
    const titre = (texte, voix) => `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.25rem">${O.ech(texte)}</p>${O.boutonVoix(voix || texte)}</div>`;

    // ---------- 3. Toute ma voiture ----------
    if (sous.apercu)
      return {
        milieu: `<div class="colonne" style="gap:1rem;align-items:center;max-width:none">
            ${titre('Voici toute ma carrosserie.', 'Voici toute ma carrosserie. Le professeur la découpera à la machine.')}
            <div class="apercu-patron">${svgPatron(valeur)}</div>
          </div>`,
        gauche: O.boutonRetour('retour-pieces'),
        principal: O.boutonPrincipal('dessin-fini', 'C’est fini', 'coche'),
        actions: {
          'retour-pieces': () => {
            sous.apercu = false;
            O.rafraichir();
          },
          'dessin-fini': () => O.suivant(valeur),
        },
      };

    // ---------- 1. Je choisis une pièce ----------
    if (!sous.piece) {
      const n = D().nombreElements(valeur);
      return {
        milieu: `<div class="colonne" style="gap:1.25rem;align-items:center;max-width:none">
            ${titre('Je choisis une pièce à décorer.')}
            <div class="cartes-pieces">${piecesDroites()
              .map((p) => {
                const els = valeur.pieces[p.id] || [];
                return `<button type="button" class="carte-piece-dessin${els.length ? ' decoree' : ''}" data-action="choisir-piece" data-id="${O.ech(p.id)}">
                    ${svgPiece(p, els, { classe: 'mini-piece' })}<span>${els.length ? O.pic('coche') : ''}${O.ech(p.nom)}</span></button>`;
              })
              .join('')}</div>
          </div>`,
        principal: O.boutonPrincipal('voir-voiture', 'Toute ma voiture', 'voiture', !n),
        actions: {
          'choisir-piece': (b) => {
            sous.piece = b.dataset.id;
            sous.choisi = null;
            sous.outil = null;
            sous.historique = [];
            O.rafraichir();
          },
          'voir-voiture': () => {
            sous.apercu = true;
            O.rafraichir();
          },
        },
      };
    }

    // ---------- 2. Je dessine sur la pièce ----------
    const p = piecesDroites().find((x) => x.id === sous.piece);
    const els = (valeur.pieces[p.id] = valeur.pieces[p.id] || []);
    const choisi = Number.isInteger(sous.choisi) && els[sous.choisi] ? sous.choisi : null;
    const memoriser = () => {
      sous.historique.push(JSON.stringify(els));
      if (sous.historique.length > 30) sous.historique.shift();
    };
    const appliquer = (i, changement) => {
      const avant = els[i];
      const r = D().ramener(Object.assign({}, avant, changement), p.zone);
      if (!r.element) return O.message('Il n’y a plus de place ici.', 2500);
      memoriser();
      els[i] = r.element;
      if (r.deplace) sous.alerte = true;
      garder();
      O.rafraichir();
    };
    const msg = sous.alerte ? `<div class="msg msg-ambre msg-dessin" role="status">${O.pic('main-stop')}Je l’ai remis dans la pièce.</div>` : '';
    sous.alerte = false;
    const outil = (t) => `<button type="button" class="tampon${sous.outil === t.id ? ' actif' : ''}" data-action="outil" data-id="${t.id}" aria-pressed="${sous.outil === t.id}" title="${O.ech(t.nom)}" aria-label="${O.ech(t.nom)}">
        <svg viewBox="-4 -4 ${t.boite[0] + 8} ${t.boite[1] + 8}" aria-hidden="true">${svgAnneaux(t.anneaux, 'trait-tampon')}</svg></button>`;
    const action = (id, texte, picto, inactif) => `<button type="button" class="btn btn-second btn-petit action-dessin" data-action="${id}"${inactif ? ' disabled' : ''}>${O.pic(picto)}${texte}</button>`;
    return {
      milieu: `<div class="atelier">
          <div class="atelier-haut">
            <span class="pastille">${O.ech(p.nom)}</span>
            <p class="consigne-atelier">${sous.outil ? 'Je clique sur la pièce pour poser le dessin.' : choisi !== null ? 'Je peux l’agrandir, le tourner ou l’effacer.' : 'Je choisis un dessin, en bas.'}</p>
            ${O.boutonVoix('Je choisis un dessin en bas, puis je clique sur la pièce pour le poser. Je peux l’agrandir, le tourner ou l’effacer.')}
            ${msg}
          </div>
          <div class="atelier-milieu">
            <div class="plan-de-travail${sous.outil ? ' pose' : ''}">${svgPiece(p, els, { zone: true, choisi })}</div>
            <div class="actions-atelier">
              ${action('agrandir', 'Agrandir', 'plus', choisi === null)}
              ${action('rapetisser', 'Rapetisser', 'effacer', choisi === null).replace(O.pic('effacer'), '<span class="moins" aria-hidden="true">−</span>')}
              ${action('tourner', 'Tourner', 'remonter', choisi === null)}
              ${action('effacer-element', 'J’efface', 'effacer', choisi === null)}
              ${action('annuler', 'Annuler', 'retour', !sous.historique.length)}
            </div>
          </div>
          <div class="palette-tampons" role="group" aria-label="Les dessins">${D().TAMPONS.map(outil).join('')}</div>
        </div>`,
      gauche: O.boutonRetour('retour-choix'),
      principal: O.boutonPrincipal('piece-finie', 'Pièce finie', 'coche'),
      actions: {
        'retour-choix': () => {
          sous.piece = null;
          O.rafraichir();
        },
        'piece-finie': () => {
          sous.piece = null;
          O.rafraichir();
        },
        outil: (b) => {
          sous.outil = sous.outil === b.dataset.id ? null : b.dataset.id;
          O.rafraichir();
        },
        agrandir: () => appliquer(choisi, { taille: els[choisi].taille * 1.2 }),
        rapetisser: () => appliquer(choisi, { taille: Math.max(D().TAILLE_MIN, els[choisi].taille / 1.2) }),
        tourner: () => appliquer(choisi, { angle: ((els[choisi].angle || 0) + 30) % 360 }),
        'effacer-element': () => {
          memoriser();
          els.splice(choisi, 1);
          sous.choisi = null;
          garder();
          O.rafraichir();
        },
        annuler: () => {
          const prec = sous.historique.pop();
          if (prec === undefined) return;
          valeur.pieces[p.id] = JSON.parse(prec);
          sous.choisi = null;
          garder();
          O.rafraichir();
        },
      },
      apres: () => {
        const svg = O.racine.querySelector('.plan-de-travail svg');
        svg.addEventListener('click', (e) => {
          const g = e.target.closest('.element');
          if (!sous.outil && g) {
            sous.choisi = Number(g.dataset.i);
            return O.rafraichir();
          }
          if (!sous.outil) {
            sous.choisi = null;
            return O.rafraichir();
          }
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const q = pt.matrixTransform(svg.getScreenCTM().inverse());
          const r = D().ramener({ type: 'tampon', id: sous.outil, x: q.x, y: q.y, taille: D().TAILLE_DEPART, angle: 0, miroir: false }, p.zone);
          if (!r.element) return O.message('Il n’y a plus de place ici.', 2500);
          memoriser();
          els.push(r.element);
          sous.choisi = els.length - 1;
          sous.outil = null;
          if (r.deplace) sous.alerte = true;
          garder();
          O.rafraichir();
        });
      },
    };
  });

  S.svgPatronDessine = svgPatron;
})(window);
