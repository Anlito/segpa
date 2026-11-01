// Écran « Je dessine ma carrosserie » (séance à part, entre la construction et le montage) : l'équipe décore chaque
// pièce du patron, que la Cricut tracera au stylo avant de la découper. Trois temps :
//   1. je choisis une pièce (5 cartes, une coche sur celles déjà décorées) ;
//   2. je dessine sur la pièce, montrée à l'endroit : tampons, le nom de la voiture, un numéro, un texte, le crayon,
//      en bleu, rouge ou marron (les stylos de la Cricut) ; je fais glisser un dessin à la souris ;
//      Agrandir, Rapetisser, Tourner, J'efface, Annuler ; sur un côté, « Pareil de l'autre côté » ;
//      l'ordinateur garde tout dans la zone de dessin (« Je l'ai remis dans la pièce. », en ambre) ;
//   3. je regarde toute ma voiture (le patron entier avec le dessin), puis « C'est fini ».
// La suite logique (pièces, zone, police, crayon, miroir, export) est dans js/dessin.js (testée).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const D = () => S.dessin;
  const PAT = () => (S.donneesProjet || {}).patron;
  const AUTRE_COTE = { 'cote-gauche': 'cote-droit', 'cote-droit': 'cote-gauche' };
  const TAILLE_TEXTE = { nom: 9, numero: 14, texte: 9 };

  const cheminForme = (f) => D().cheminSvg(f.points, !f.ferme);
  const STYLOS = () => (S.donneesProjet || {}).stylos || [{ id: 'bleu', nom: 'Bleu', hex: '#1D4ED8' }];
  const teinte = (id) => (STYLOS().find((x) => x.id === (id || D().COULEUR_PAR_DEFAUT)) || STYLOS()[0]).hex;
  const piecesDroites = () => PAT().pieces.map((p) => D().pieceDroite(p));

  // Dessin d'une pièce à l'endroit (contour, zone, éléments), en mm.
  function svgPiece(p, elements, options) {
    const o = options || {};
    const m = o.marge === undefined ? 2 : o.marge;
    const els = elements
      .map((el, i) => {
        const formes = D().formesElement(el);
        const d = formes.map(cheminForme).join(' ');
        // zone de prise : tout le rectangle du dessin (on peut le saisir par le milieu, pas seulement par le trait)
        const pts = formes.flatMap((f) => f.points);
        const [x0, y0] = [Math.min(...pts.map((q) => q[0])) - 1.5, Math.min(...pts.map((q) => q[1])) - 1.5];
        const [x1, y1] = [Math.max(...pts.map((q) => q[0])) + 1.5, Math.max(...pts.map((q) => q[1])) + 1.5];
        const prise = o.zone ? `<rect class="zone-prise" x="${x0.toFixed(2)}" y="${y0.toFixed(2)}" width="${(x1 - x0).toFixed(2)}" height="${(y1 - y0).toFixed(2)}" rx="1.5"/><path class="zone-clic" d="${d}"/>` : '';
        return `<g class="element${i === o.choisi ? ' choisi' : ''}" data-i="${i}">${prise}<path class="trait-dessin" style="stroke:${teinte(el.couleur)}" d="${d}"/></g>`;
      })
      .join('');
    return `<svg class="${o.classe || 'piece-svg'}" viewBox="${-m} ${-m} ${(p.largeur + 2 * m).toFixed(2)} ${(p.hauteur + 2 * m).toFixed(2)}" role="img" aria-label="${S.echapper(p.nom)}">
      <path class="piece-fond" fill-rule="evenodd" d="${[p.contour, ...p.trous].map((a) => D().cheminSvg(a)).join(' ')}"/>
      ${o.zone ? `<path class="piece-zone" fill-rule="evenodd" d="${[p.zone.contour, ...p.zone.trous].map((a) => D().cheminSvg(a)).join(' ')}"/>` : ''}
      ${els}
    </svg>`;
  }

  // Le patron entier avec le dessin (aperçu de toute la voiture, outil professeur).
  function svgPatron(valeur) {
    const P = PAT();
    return `<svg class="patron-svg" viewBox="-2 -2 ${P.taille[0] + 4} ${P.taille[1] + 4}" role="img" aria-label="Toute ma carrosserie">
      ${P.decoupe.map((d) => `<path class="patron-decoupe" fill-rule="evenodd" d="${d}"/>`).join('')}
      ${P.plis.map(([a, b, c, d]) => `<line class="patron-pli" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('')}
      ${Object.entries(D().cheminsParCouleur(valeur, P.pieces)).map(([c, liste]) => liste.map((d) => `<path class="trait-dessin" style="stroke:${teinte(c)}" d="${d}"/>`).join('')).join('')}
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
            Object.assign(sous, { piece: b.dataset.id, choisi: null, outil: null, saisie: null, aPoser: null, confirmerMiroir: false, historique: [] });
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
    const estTrait = choisi !== null && els[choisi].type === 'trait';
    const autre = AUTRE_COTE[p.id];
    const memoriser = () => {
      sous.historique.push(JSON.stringify(els));
      if (sous.historique.length > 30) sous.historique.shift();
    };
    const appliquer = (i, changement) => {
      const r = D().ramener(Object.assign({}, els[i], changement), p.zone);
      if (!r.element) return O.message('Il n’y a plus de place ici.', 2500);
      memoriser();
      els[i] = r.element;
      if (r.deplace) sous.alerte = true;
      garder();
      O.rafraichir();
    };
    const copierMiroir = () => {
      const pa = piecesDroites().find((x) => x.id === autre);
      valeur.pieces[autre] = D().miroirElements(els, p.largeur, pa.zone);
      sous.confirmerMiroir = false;
      garder();
      O.message(`C’est fait : pareil sur le ${pa.nom.toLowerCase()}.`, 3000);
      O.rafraichir();
    };
    const voiture = S.voitureDe ? S.voitureDe(O.D()) : { nom: '' };
    const couleur = STYLOS().some((x) => x.id === valeur.couleur) ? valeur.couleur : STYLOS()[0].id;
    const pastillesStylos = `<div class="stylos" role="group" aria-label="Couleur du stylo">${STYLOS()
      .map((x) => `<button type="button" class="stylo" data-action="stylo" data-id="${x.id}" aria-pressed="${x.id === couleur}"><span class="point-stylo" style="background:${x.hex}"></span>${O.ech(x.nom)}</button>`)
      .join('')}</div>`;

    // Ce qui s'affiche en haut de l'atelier : la consigne, ou la saisie d'un texte, ou une question.
    let haut;
    if (sous.saisie) {
      const numero = sous.saisie === 'numero';
      haut = `<label class="saisie-texte">${O.pic(numero ? 'plus' : 'texte')}<span>${numero ? 'Mon numéro' : 'Mon texte'}</span>
          <input class="champ-libre champ-atelier" maxlength="${numero ? 3 : 12}" ${numero ? 'inputmode="numeric"' : ''} autocomplete="off" aria-label="${numero ? 'Mon numéro' : 'Mon texte'}"></label>
          <button type="button" class="btn btn-principal btn-petit" data-action="texte-ecrit" disabled>${O.pic('coche')}C’est écrit</button>
          <button type="button" class="btn btn-second btn-petit" data-action="texte-annule">Non</button>`;
    } else if (sous.confirmerMiroir) {
      haut = `<div class="msg msg-ambre msg-dessin" role="alert">${O.pic('question')}L’autre côté a déjà des dessins. Je les remplace ?</div>
          <button type="button" class="btn btn-principal btn-petit" data-action="miroir-oui">Oui</button>
          <button type="button" class="btn btn-second btn-petit" data-action="miroir-non">Non</button>`;
    } else {
      const consigne = sous.outil === 'crayon' ? 'Je dessine, bouton appuyé.' : sous.outil ? 'Je clique sur la pièce pour le poser.' : choisi !== null ? (estTrait ? 'Je le fais glisser, ou je l’efface.' : 'Je le fais glisser, l’agrandis, le tourne…') : 'Je choisis un dessin, en bas.';
      haut = `<span class="pastille">${O.ech(p.nom)}</span>
          ${sous.alerte ? `<div class="msg msg-ambre msg-dessin" role="status">${O.pic('main-stop')}Je l’ai remis dans la pièce.</div>` : `<p class="consigne-atelier">${consigne}</p>`}
          ${O.boutonVoix('Je choisis un dessin en bas, puis je clique sur la pièce pour le poser. Je peux le faire glisser avec la souris. Je choisis aussi la couleur du stylo.')}
          ${pastillesStylos}`;
    }
    sous.alerte = false;

    const outilTampon = (t) => `<button type="button" class="tampon${sous.outil === t.id ? ' actif' : ''}" data-action="outil" data-id="${t.id}" aria-pressed="${sous.outil === t.id}" title="${O.ech(t.nom)}" aria-label="${O.ech(t.nom)}">
        <svg viewBox="-4 -4 ${t.boite[0] + 8} ${t.boite[1] + 8}" aria-hidden="true">${t.anneaux.map((a) => `<path class="trait-tampon" d="${D().cheminSvg(a)}"/>`).join('')}</svg></button>`;
    const outilTexte = (id, texte, picto, actif) => `<button type="button" class="tampon outil-texte${actif ? ' actif' : ''}" data-action="${id}" aria-pressed="${!!actif}">${picto}<span>${texte}</span></button>`;
    const action = (id, texte, picto, inactif) => `<button type="button" class="btn btn-second btn-petit action-dessin" data-action="${id}"${inactif ? ' disabled' : ''}>${picto}${texte}</button>`;
    const enTexte = sous.outil === 'texte' && sous.aPoser;
    return {
      milieu: `<div class="atelier">
          <div class="atelier-haut">${haut}</div>
          <div class="atelier-milieu">
            <div class="plan-de-travail${sous.outil ? ' pose' : ''}">${svgPiece(p, els, { zone: true, choisi })}</div>
            <div class="actions-atelier">
              ${action('agrandir', 'Agrandir', O.pic('plus'), choisi === null || estTrait)}
              ${action('rapetisser', 'Rapetisser', '<span class="moins" aria-hidden="true">−</span>', choisi === null || estTrait)}
              ${action('tourner', 'Tourner', O.pic('remonter'), choisi === null || estTrait)}
              ${action('effacer-element', 'J’efface', O.pic('effacer'), choisi === null)}
              ${action('annuler', 'Annuler', O.pic('retour'), !sous.historique.length)}
              ${autre ? action('miroir', autre === 'cote-droit' ? 'Pareil à droite' : 'Pareil à gauche', O.pic('fleche'), !els.length) : ''}
            </div>
          </div>
          <div class="palette-tampons" role="group" aria-label="Les dessins">${D().TAMPONS.map(outilTampon).join('')}
            <span class="separateur" aria-hidden="true"></span>
            ${outilTexte('outil-nom', 'Nom', O.pic('voiture'), enTexte && sous.aPoser.sorte === 'nom')}
            ${outilTexte('outil-numero', 'Numéro', '<b class="diese" aria-hidden="true">12</b>', enTexte && sous.aPoser.sorte === 'numero')}
            ${outilTexte('outil-texte', 'Texte', O.pic('texte'), enTexte && sous.aPoser.sorte === 'texte')}
            ${outilTexte('outil-crayon', 'Crayon', O.pic('crayon'), sous.outil === 'crayon')}
          </div>
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
          sous.aPoser = null;
          O.rafraichir();
        },
        'outil-nom': () => {
          const t = D().texteTracable(voiture.nom, 16);
          if (!t) return O.message('Ma voiture n’a pas encore de nom.', 3000);
          Object.assign(sous, { outil: 'texte', aPoser: { sorte: 'nom', texte: t } });
          O.rafraichir();
        },
        'outil-numero': () => {
          Object.assign(sous, { saisie: 'numero', outil: null, aPoser: null });
          O.rafraichir();
        },
        'outil-texte': () => {
          Object.assign(sous, { saisie: 'texte', outil: null, aPoser: null });
          O.rafraichir();
        },
        'outil-crayon': () => {
          Object.assign(sous, { outil: sous.outil === 'crayon' ? null : 'crayon', aPoser: null });
          O.rafraichir();
        },
        'texte-ecrit': () => {
          const champ = O.racine.querySelector('.champ-atelier');
          const t = D().texteTracable(champ.value, sous.saisie === 'numero' ? 3 : 12);
          if (!t) return;
          Object.assign(sous, { outil: 'texte', aPoser: { sorte: sous.saisie, texte: t }, saisie: null });
          O.rafraichir();
        },
        'texte-annule': () => {
          sous.saisie = null;
          O.rafraichir();
        },
        agrandir: () => appliquer(choisi, { taille: els[choisi].taille * 1.2 }),
        rapetisser: () => appliquer(choisi, { taille: els[choisi].taille / 1.2 }),
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
        miroir: () => {
          if ((valeur.pieces[autre] || []).length) {
            sous.confirmerMiroir = true;
            return O.rafraichir();
          }
          copierMiroir();
        },
        stylo: (b) => {
          valeur.couleur = b.dataset.id;
          if (choisi !== null) {
            memoriser();
            els[choisi] = Object.assign({}, els[choisi], { couleur: b.dataset.id });
          }
          garder();
          O.rafraichir();
        },
        'miroir-oui': copierMiroir,
        'miroir-non': () => {
          sous.confirmerMiroir = false;
          O.rafraichir();
        },
      },
      apres: () => {
        const svg = O.racine.querySelector('.plan-de-travail svg');
        const versMm = (e) => {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const q = pt.matrixTransform(svg.getScreenCTM().inverse());
          return [q.x, q.y];
        };
        const champ = O.racine.querySelector('.champ-atelier');
        if (champ) {
          champ.focus();
          const bouton = O.racine.querySelector('[data-action="texte-ecrit"]');
          champ.addEventListener('input', () => {
            if (sous.saisie === 'numero') champ.value = champ.value.replace(/\D/g, '');
            bouton.disabled = !D().texteTracable(champ.value, 12);
          });
          champ.addEventListener('keydown', (e) => e.key === 'Enter' && !bouton.disabled && O.etat.actions['texte-ecrit']());
        }
        // Crayon : on dessine bouton appuyé ; le tracé est coupé hors de la zone, puis lissé.
        if (sous.outil === 'crayon') {
          let trace = null;
          let vue = null;
          svg.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            svg.setPointerCapture(e.pointerId);
            trace = [versMm(e)];
            vue = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            vue.setAttribute('class', 'trait-dessin en-cours');
            svg.append(vue);
          });
          svg.addEventListener('pointermove', (e) => {
            if (!trace) return;
            const q = versMm(e);
            const der = trace[trace.length - 1];
            if (Math.hypot(q[0] - der[0], q[1] - der[1]) < 0.6) return;
            trace.push(q);
            vue.setAttribute('d', D().cheminSvg(trace, true));
          });
          const fin = () => {
            if (!trace) return;
            const { elements, coupe } = D().traitsCrayon(trace, p.zone);
            trace = null;
            if (!elements.length) return vue.remove();
            memoriser();
            els.push(...elements.map((x) => Object.assign(x, { couleur })));
            if (coupe) sous.alerte = true;
            garder();
            O.rafraichir();
          };
          svg.addEventListener('pointerup', fin);
          svg.addEventListener('pointercancel', fin);
          return;
        }
        // Sans outil : un clic choisit un dessin ; bouton appuyé, on le fait glisser (il suit la souris, puis il est posé
        // là où on le lâche, ou ramené à la place libre la plus proche).
        if (!sous.outil) {
          let glisse = null;
          svg.addEventListener('pointerdown', (e) => {
            const g = e.target.closest('.element');
            if (!g) return;
            e.preventDefault();
            svg.setPointerCapture(e.pointerId);
            glisse = { i: Number(g.dataset.i), g, depart: versMm(e), dx: 0, dy: 0 };
          });
          svg.addEventListener('pointermove', (e) => {
            if (!glisse) return;
            const [x, y] = versMm(e);
            glisse.dx = x - glisse.depart[0];
            glisse.dy = y - glisse.depart[1];
            glisse.g.setAttribute('transform', `translate(${glisse.dx.toFixed(2)} ${glisse.dy.toFixed(2)})`);
          });
          const lache = (e) => {
            if (!glisse) {
              if (e.type === 'pointerup' && !e.target.closest('.element') && choisi !== null) {
                sous.choisi = null;
                O.rafraichir();
              }
              return;
            }
            const { i, dx, dy } = glisse;
            glisse = null;
            sous.choisi = i;
            if (Math.hypot(dx, dy) < 0.8) return O.rafraichir();
            const r = D().deplacerElement(els[i], dx, dy, p.zone);
            memoriser();
            els[i] = r.element;
            if (r.deplace) sous.alerte = true;
            garder();
            O.rafraichir();
          };
          svg.addEventListener('pointerup', lache);
          svg.addEventListener('pointercancel', lache);
          return;
        }
        svg.addEventListener('click', (e) => {
          const [x, y] = versMm(e);
          const el =
            sous.outil === 'texte' && sous.aPoser
              ? { type: 'texte', texte: sous.aPoser.texte, x, y, taille: TAILLE_TEXTE[sous.aPoser.sorte] || 9, angle: 0, couleur }
              : { type: 'tampon', id: sous.outil, x, y, taille: D().TAILLE_DEPART, angle: 0, miroir: false, couleur };
          const r = D().ramener(el, p.zone);
          if (!r.element) return O.message(el.type === 'texte' ? 'Ce texte est trop long pour cette pièce.' : 'Il n’y a plus de place ici.', 3000);
          memoriser();
          els.push(r.element);
          Object.assign(sous, { choisi: els.length - 1, outil: null, aPoser: null });
          if (r.deplace) sous.alerte = true;
          garder();
          O.rafraichir();
        });
      },
    };
  });

  S.svgPatronDessine = svgPatron;
})(window);
