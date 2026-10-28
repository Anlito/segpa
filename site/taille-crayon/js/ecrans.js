// Écrans propres au taille-crayon (brief §4) : la présentation d'ouverture, le tableau des pièces (séance 1),
// la mesure d'une pièce au réglet (séance 2), le tableau à l'envers et les questions (séance 3).
// Chaque écran se fait en plusieurs temps (une seule chose à faire à la fois) ; le temps en cours est gardé dans
// O.sous() et le travail dans la sauvegarde (brouillon de l'étape), pour reprendre après une fermeture de la page.
// Les noms des pièces et les longueurs de référence viennent de donnees/modele.js.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const M = () => S.modele || {};
  const deux = (n) => String(n).padStart(2, '0');

  // Brouillon d'une étape (copie modifiable), avec des valeurs par défaut.
  function brouillon(O, etape, defaut) {
    const v = S.valeurEtape(O.D(), O.seance().id, etape.id);
    return v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : defaut;
  }
  function garderBrouillon(O, etape, valeur) {
    S.noterBrouillon(O.D(), O.seance().id, etape.id, valeur);
    O.enregistrer(true);
  }

  // Les pièces démontées en séance 1, dans l'ordre (tableau de la fiche).
  function piecesDemontees(d) {
    const s1 = d.seances.s1 && d.seances.s1.etapes.pieces;
    return (s1 && s1.valeur && Array.isArray(s1.valeur.pieces) && s1.valeur.pieces) || [];
  }
  const nomPiece = (p) => p.nom || `Pièce ${p.numero}`;

  // Remplit les <img data-photo="…"> avec les photos du dossier de l'équipe.
  async function chargerPhotos(O) {
    for (const img of O.racine.querySelectorAll('img[data-photo]')) {
      const u = await O.urlPhoto(img.dataset.photo);
      if (u) img.src = u;
      else img.replaceWith(Object.assign(document.createElement('span'), { className: 'sans-image', innerHTML: S.picto('photo') }));
    }
  }

  const vignette = (O, fichier, alt) => (fichier ? `<img data-photo="${O.ech(fichier)}" alt="${O.ech(alt || '')}">` : `<span class="sans-image">${S.picto('photo')}</span>`);

  // ---------- Ouverture : la présentation du projet, page par page ----------

  S.ajouterEcran('ouverture', (etape, O) => {
    const sous = O.sous();
    sous.page = sous.page || 0;
    const pages = etape.pages || [];
    const page = pages[sous.page];
    const derniere = sous.page === pages.length - 1;
    let contenu = '';
    let aLire = O.lisible(page.titre, page.detail);
    if (page.images) {
      contenu = `<div class="tuiles-ouverture">${page.images
        .map((im, i) => `<div class="tuile-ouverture">${page.numeros ? `<span class="numero-mission">${i + 1}</span>` : ''}${S.picto(im.picto)}<span>${O.ech(im.mot)}</span></div>`)
        .join('')}</div>`;
      aLire = O.lisible(page.titre, page.images.map((im) => im.mot).join(', ') + '.', page.detail);
    } else if (page.revele) {
      contenu = sous.vu
        ? `<div class="revele">${S.picto(page.revele.picto)}<strong>${O.ech(page.revele.mot)}</strong></div>`
        : `<button type="button" class="btn btn-principal" data-action="decouvrir">${S.picto('oeil')}Je découvre</button>`;
      if (sous.vu) aLire = O.lisible(page.titre, page.revele.mot + '.');
    } else if (page.programme) {
      const seances = S.etapes.seances;
      contenu = `<div class="tuiles-ouverture">${seances
        .map((s, i) => `<div class="tuile-ouverture"><span class="numero-mission">${i + 1}</span>${S.picto(s.picto)}<span>${O.ech(s.titre)}<br><small>${O.ech(s.sousTitre || '')}</small></span></div>`)
        .join('')}</div>`;
      aLire = O.lisible(page.titre, seances.map((s, i) => `Séance ${i + 1} : ${s.titre} ${s.sousTitre || ''}.`).join(' '), page.detail);
    }
    const visible = !page.revele || sous.vu;
    return {
      milieu: `<div class="colonne ouverture" style="align-items:center;text-align:center">
          <span class="pastille">${sous.page + 1} sur ${pages.length}</span>
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte">${O.ech(page.titre)}</p>${O.boutonVoix(aLire)}</div>
          ${contenu}
          ${page.detail ? `<p class="consigne-detail">${O.ech(page.detail)}</p>` : ''}
        </div>`,
      gauche: O.boutonRetour('retour-sous'),
      principal: visible ? O.boutonPrincipal('suivant-page', derniere ? 'C’est parti !' : 'Suivant', derniere ? 'lecture' : 'suivant') : '',
      actions: {
        decouvrir: () => {
          sous.vu = true;
          S.voix.son('ok');
          O.rafraichir();
        },
        'suivant-page': () => {
          if (derniere) return O.suivant();
          sous.page++;
          sous.vu = false;
          O.rafraichir();
        },
        'retour-sous': () => {
          if (sous.page === 0) return O.etat.actions.precedent();
          sous.page--;
          sous.vu = true;
          O.rafraichir();
        },
      },
    };
  });

  // ---------- Séance 1 : le tableau des pièces ----------
  // Pour chaque pièce : je dévisse → je photographie → je nomme → je range dans la case n. Retour au tableau.

  S.ajouterEcran('pieces', (etape, O) => {
    const sous = O.sous();
    const valeur = brouillon(O, etape, { pieces: [] });
    const pieces = valeur.pieces;
    const max = M().maxPieces || 10;
    const n = pieces.length + 1;
    sous.temps = sous.temps || 'tableau';
    const vers = (temps) => () => {
      sous.temps = temps;
      O.rafraichir();
    };

    if (sous.temps === 'devisser')
      return {
        milieu: O.blocConsigne({ picto: 'tournevis', texte: 'Je dévisse une pièce.', detail: 'Si ça bloque, je lève la main.' }, `Pièce ${n}`),
        gauche: O.boutonRetour('tableau'),
        principal: O.boutonPrincipal('devissee', 'C’est fait'),
        actions: { tableau: vers('tableau'), devissee: vers('photo') },
      };

    if (sous.temps === 'photo') {
      const vue = O.vuePhoto({
        texte: 'Je prends la pièce en photo.',
        detail: 'Pose-la sur la feuille blanche.',
        legende: `Pièce ${n}`,
        etapeId: `piece-${deux(n)}`,
        retour: 'retour-photo',
        garder: (p) => {
          sous.photo = p.fichier;
          vers('nom')();
        },
        plusTard: () => {
          sous.photo = null;
          vers('nom')();
        },
      });
      vue.actions['retour-photo'] = vers('devisser');
      return vue;
    }

    if (sous.temps === 'nom' && (M().pieces || []).length) {
      const pris = new Set(pieces.map((p) => p.nom));
      return {
        milieu: `<div class="colonne" style="gap:1.25rem">
            <div class="consigne-ligne" style="align-items:center"><span class="pastille">Pièce ${n}</span><p class="consigne-texte" style="font-size:2.75rem">Quel est son nom ?</p>${O.boutonVoix('Quel est son nom ?')}</div>
            <div class="cartes-noms">${M()
              .pieces.map((p, i) => `<button type="button" class="carte-nom${pris.has(p.nom) ? ' deja' : ''}" data-action="nom" data-i="${i}">${p.image ? `<img src="${O.ech(p.image)}" alt="">` : ''}<span>${O.ech(p.nom)}</span></button>`)
              .join('')}<button type="button" class="carte-nom autre" data-action="autre">${S.picto('crayon')}<span>Un autre nom</span></button></div>
          </div>`,
        gauche: O.boutonRetour('retour-nom'),
        principal: '',
        actions: {
          'retour-nom': vers('photo'),
          nom: (b) => {
            sous.nom = M().pieces[Number(b.dataset.i)].nom;
            sous.autre = false;
            vers('ranger')();
          },
          autre: vers('autre-nom'),
        },
      };
    }

    if (sous.temps === 'nom' || sous.temps === 'autre-nom')
      return {
        milieu: `<div class="colonne" style="gap:2rem;max-width:56rem">
            <div class="consigne-ligne" style="align-items:center"><span class="pastille">Pièce ${n}</span><p class="consigne-texte" style="font-size:2.75rem">Écris le nom de la pièce.</p>${O.boutonVoix('Écris le nom de la pièce.')}</div>
            <input class="champ-libre" maxlength="40" autocomplete="off" aria-label="Nom de la pièce" value="${O.ech(sous.saisie || '')}">
          </div>`,
        gauche: `<div class="gauche" style="display:flex;gap:1rem">${O.boutonRetour('retour-nom').replace(' gauche', '')}<button type="button" class="btn btn-second" data-action="sais-pas">${S.picto('question')}Je ne sais pas</button></div>`,
        principal: O.boutonPrincipal('nomme', 'C’est son nom', 'coche', !(sous.saisie || '').trim()),
        actions: {
          'retour-nom': vers((M().pieces || []).length ? 'nom' : 'photo'),
          nomme: () => {
            sous.nom = S.majuscule(O.racine.querySelector('.champ-libre').value);
            sous.autre = true;
            sous.saisie = '';
            vers('ranger')();
          },
          'sais-pas': () => {
            sous.nom = null;
            sous.autre = false;
            vers('ranger')();
          },
        },
        apres: () => {
          const champ = O.racine.querySelector('.champ-libre');
          champ.focus();
          champ.addEventListener('input', () => {
            sous.saisie = champ.value;
            O.racine.querySelector('[data-action="nomme"]').disabled = !champ.value.trim();
          });
          champ.addEventListener('keydown', (e) => e.key === 'Enter' && champ.value.trim() && O.etat.actions.nomme());
        },
      };

    if (sous.temps === 'ranger')
      return {
        milieu: O.blocConsigne({ picto: 'boite', texte: `Je range la pièce dans la case ${n}.`, detail: sous.nom ? `${sous.nom}.` : '' }, `Pièce ${n}`),
        gauche: O.boutonRetour('retour-ranger'),
        principal: O.boutonPrincipal('rangee', 'C’est rangé'),
        actions: {
          'retour-ranger': vers('nom'),
          rangee: () => {
            pieces.push({ numero: n, photo: sous.photo || null, nom: sous.nom || null, autreNom: !!sous.autre, date: S.maintenant() });
            // La photo prend le nom de la pièce dans l'album.
            const ph = sous.photo && O.D().photos.find((p) => p.fichier === sous.photo);
            if (ph && sous.nom) ph.legende = `Pièce ${n} : ${sous.nom}`;
            garderBrouillon(O, etape, valeur);
            S.voix.son('ok');
            Object.assign(sous, { temps: 'tableau', photo: null, nom: null, autre: false });
            O.rafraichir();
          },
        },
      };

    // Le tableau : les pièces rangées, dans l'ordre, et la case suivante.
    const cases = Math.max(M().nombrePieces || 8, Math.min(max, pieces.length + 1));
    const grille = Array.from({ length: cases }, (_, i) => {
      const p = pieces[i];
      if (p)
        return `<div class="case-piece faite">${vignette(O, p.photo, nomPiece(p))}<span class="num">${p.numero}</span><span class="nom">${S.picto('coche')}${O.ech(nomPiece(p))}</span></div>`;
      if (i === pieces.length) return `<div class="case-piece ici"><span class="num">${i + 1}</span><strong>À toi !</strong>${S.picto('tournevis')}</div>`;
      return `<div class="case-piece vide"><span class="num">${i + 1}</span></div>`;
    }).join('');
    const texte = pieces.length ? `${pieces.length} pièce${pieces.length > 1 ? 's' : ''} dans la boîte` : 'Une pièce à la fois';
    return {
      milieu: `<div class="colonne" style="gap:1rem;align-self:stretch;justify-content:center">
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.25rem">${texte}</p>${O.boutonVoix('Je dévisse une pièce, je la photographie, je la range. ' + texte + '.')}</div>
          <div class="grille-pieces${cases > 8 ? ' cinq' : ''}">${grille}</div>
        </div>`,
      gauche: `<div class="gauche" style="display:flex;gap:1rem">${O.boutonRetour('precedent').replace(' gauche', '')}<button type="button" class="btn btn-second" data-action="fin-demontage"${pieces.length ? '' : ' disabled'}>${S.picto('coche')}J’ai fini de démonter</button></div>`,
      principal: pieces.length < max ? O.boutonPrincipal('piece', `Pièce ${n}`, 'tournevis') : '',
      actions: {
        piece: vers('devisser'),
        'fin-demontage': () => O.suivant(valeur),
      },
      apres: () => chargerPhotos(O),
    };
  });

  // Exemple de dessin à la taille réelle sur quadrillage (1 carreau = 1 cm), pour montrer la méthode :
  //   temps 'bords'  : bords droits à la règle (trait épais), arrondis à main levée (marqués) ;
  //   temps 'fleche' : flèche de dimension à la règle, d'une autre couleur, avec la longueur écrite.
  // La pièce de l'exemple est inventée (6 cm × 3 cm) : ce n'est jamais une pièce du taille-crayon.
  function exempleDessin(temps) {
    const c = 10; // taille d'un carreau dans le dessin
    const grille = [];
    for (let x = 0; x <= 12; x++) grille.push(`<line x1="${x * c}" y1="0" x2="${x * c}" y2="${8 * c}"/>`);
    for (let y = 0; y <= 8; y++) grille.push(`<line x1="0" y1="${y * c}" x2="${12 * c}" y2="${y * c}"/>`);
    // Pièce : de x = 3 à 9 (6 cm), de y = 1,5 à 4,5 (3 cm), deux coins arrondis à droite (rayon 1 cm).
    const droits = `M${8 * c} ${1.5 * c} H${3 * c} V${4.5 * c} H${8 * c} M${9 * c} ${2.5 * c} V${3.5 * c}`;
    const arrondis = `M${8 * c} ${1.5 * c} A${c} ${c} 0 0 1 ${9 * c} ${2.5 * c} M${9 * c} ${3.5 * c} A${c} ${c} 0 0 1 ${8 * c} ${4.5 * c}`;
    const bords = temps === 'bords';
    const fleche = `<g class="ex-fleche">
        <line x1="${3 * c}" y1="${4.9 * c}" x2="${3 * c}" y2="${6.6 * c}"/><line x1="${9 * c}" y1="${4.9 * c}" x2="${9 * c}" y2="${6.6 * c}"/>
        <line x1="${3 * c + 1}" y1="${6.1 * c}" x2="${9 * c - 1}" y2="${6.1 * c}"/>
        <path d="M${3 * c} ${6.1 * c} l4 -2.5 v5 z M${9 * c} ${6.1 * c} l-4 -2.5 v5 z" class="ex-pointe"/>
        <text x="${6 * c}" y="${5.75 * c}">6 cm</text>
      </g>`;
    return `<figure class="exemple-dessin">
        <figcaption><span class="pastille">Exemple</span> ce n’est pas ta pièce</figcaption>
        <svg viewBox="-2 -2 ${12 * c + 4} ${8 * c + 4}" role="img" aria-label="${bords ? 'Exemple : les bords droits tracés à la règle, les arrondis à main levée.' : 'Exemple : la flèche de dimension tracée à la règle, d’une autre couleur, avec 6 cm écrit à côté.'}">
          <g class="ex-grille">${grille.join('')}</g>
          <path d="${droits}" class="ex-trait${bords ? ' fort' : ''}"/>
          <path d="${arrondis}" class="ex-trait${bords ? ' fort' : ''}"/>
          ${bords ? `<path d="${arrondis}" class="ex-arrondi"/>` : fleche}
        </svg>
        <div class="ex-legende">${
          bords
            ? `<span><i class="ex-cle regle"></i>à la règle</span><span><i class="ex-cle main"></i>à main levée</span>`
            : `<span><i class="ex-cle couleur"></i>flèche à la règle, autre couleur</span>`
        }</div>
      </figure>`;
  }

  function blocDessin(O, temps, texte, detail, pastille) {
    return `${exempleDessin(temps)}
      <div class="consigne">
        <span class="pastille">${O.ech(pastille)}</span>
        <div class="consigne-ligne"><p class="consigne-texte" style="font-size:2.875rem">${O.ech(texte)}</p>${O.boutonVoix(O.lisible(texte, detail))}</div>
        <p class="consigne-detail">${O.ech(detail)}</p>
      </div>`;
  }

  // ---------- Séance 2 : mesurer et dessiner une pièce ----------
  // Je sors une pièce → je mesure (vérification douce) → je trace les bords à la règle → je trace la flèche de
  // dimension à la règle, d'une autre couleur → photo du dessin → je la remets.

  S.ajouterEcran('mesure', (etape, O) => {
    const sous = O.sous();
    const info = (M().mesures || {})[etape.piece] || { titre: etape.piece, nom: etape.piece };
    const plage = S.plageDe(info.reference, M().tolerance);
    const essaisMax = M().essaisMesure || 2;
    const valeur = brouillon(O, etape, { essais: [], longueur: null, verdict: null, tropDehors: false, photo: null });
    sous.temps = sous.temps || 'sortir';
    const vers = (temps) => () => {
      sous.temps = temps;
      O.rafraichir();
    };
    const pastille = info.titre;
    const dehors = `<span class="pastille" style="background:#fff;border:0.125rem solid var(--trait);color:var(--encre)">Pièces dehors : 1 sur 2</span>`;

    if (sous.temps === 'sortir')
      return {
        milieu: `${O.blocConsigne({ picto: 'boite', texte: 'Je sors une seule pièce de la boîte.', detail: `${info.nom.charAt(0).toUpperCase() + info.nom.slice(1)}.` }, pastille)}
          ${sous.trop ? `<div class="msg msg-ambre msg-flottant" role="alert">${S.picto('boite')}Remets les pièces en trop dans la boîte.</div>` : ''}`,
        gauche: `<div class="gauche" style="display:flex;gap:1rem">${O.boutonRetour('precedent').replace(' gauche', '')}<button type="button" class="btn btn-second" data-action="trop">J’en ai sorti plus</button></div>`,
        principal: O.boutonPrincipal('sortie', 'J’ai sorti 1 pièce'),
        actions: {
          trop: () => {
            sous.trop = true;
            valeur.tropDehors = true;
            garderBrouillon(O, etape, valeur);
            O.rafraichir();
          },
          sortie: vers('mesurer'),
        },
      };

    if (sous.temps === 'mesurer') {
      sous.saisie = sous.saisie || '';
      const essais = valeur.essais.length;
      let msg = '';
      if (sous.verdict === 'dedans') msg = `<div class="msg msg-ok" role="status">${S.picto('coche')}Bien mesuré !</div>`;
      else if (sous.verdict === 'dehors' && essais < essaisMax) msg = `<div class="msg msg-ambre" role="alert">${S.picto('remonter')}Mesure encore une fois, en partant du 0 du réglet.</div>`;
      else if (sous.verdict === 'dehors') msg = `<div class="msg msg-ambre" role="alert">${S.picto('aide')}Montre ta mesure au professeur.</div>`;
      const termine = sous.verdict === 'dedans' || (sous.verdict === 'dehors' && essais >= essaisMax);
      return {
        milieu: `<div class="colonne" style="gap:1.5rem">
            <div style="display:flex;gap:1rem;align-items:center"><span class="pastille">${O.ech(pastille)}</span>${dehors}</div>
            <div class="consigne-ligne" style="align-items:center"><span class="tuile-picto">${S.picto('regle')}</span><p class="consigne-texte" style="font-size:2.75rem">Je mesure avec mon réglet.</p>${O.boutonVoix('Je mesure avec mon réglet. Je tape la longueur en centimètres.')}</div>
            <div class="ligne-mesure">Longueur : <output class="affichage-mesure" aria-live="polite">${O.ech(sous.saisie) || '&nbsp;'}</output><span class="unite">cm</span></div>
            ${msg}
          </div>
          ${termine ? '' : O.pave.html()}`,
        gauche: O.boutonRetour('retour-mesure'),
        principal: termine ? O.boutonPrincipal('mesure-suivant', 'Suivant', 'suivant') : O.boutonPrincipal('mesure', 'C’est mesuré', 'coche', S.lireNombre(sous.saisie) === null),
        actions: {
          'retour-mesure': vers('sortir'),
          touche: (b) => {
            sous.saisie = O.pave.appui(sous.saisie, b.dataset.c);
            if (sous.verdict === 'dehors') sous.verdict = null;
            O.racine.querySelector('.affichage-mesure').innerHTML = O.ech(sous.saisie) || '&nbsp;';
            O.racine.querySelector('[data-action="mesure"]').disabled = S.lireNombre(sous.saisie) === null;
            const m = O.racine.querySelector('.colonne .msg');
            if (m) m.remove();
          },
          mesure: () => {
            const n = S.lireNombre(sous.saisie);
            const verdict = S.verifierMesure(n, plage);
            valeur.essais.push(n);
            valeur.longueur = n;
            valeur.verdict = verdict;
            garderBrouillon(O, etape, valeur);
            if (verdict === 'sans-reference') return vers('dessiner')();
            sous.verdict = verdict;
            if (verdict === 'dehors' && valeur.essais.length < essaisMax) sous.saisie = '';
            S.voix.son(verdict === 'dedans' ? 'ok' : 'aide');
            O.rafraichir();
          },
          'mesure-suivant': vers('dessiner'),
        },
      };
    }

    // Le dessin sur papier, en deux temps, avec un exemple sur quadrillage (une pièce inventée : pas la réponse).
    if (sous.temps === 'dessiner')
      return {
        milieu: blocDessin(O, 'bords', 'Je trace les bords droits à la règle.', 'Les arrondis, à main levée. 1 carreau = 1 cm.', pastille),
        gauche: O.boutonRetour('retour-dessin'),
        principal: O.boutonPrincipal('dessinee', 'C’est tracé'),
        actions: { 'retour-dessin': vers('mesurer'), dessinee: vers('fleche') },
      };

    if (sous.temps === 'fleche')
      return {
        milieu: blocDessin(O, 'fleche', 'Je trace la flèche à la règle.', 'D’une autre couleur. J’écris la longueur à côté.', pastille),
        gauche: O.boutonRetour('retour-fleche'),
        principal: O.boutonPrincipal('fleche-faite', 'C’est fait'),
        actions: { 'retour-fleche': vers('dessiner'), 'fleche-faite': vers('photo') },
      };

    if (sous.temps === 'photo') {
      const vue = O.vuePhoto({
        texte: 'Je prends mon dessin en photo.',
        detail: 'Avec la pièce à côté du dessin.',
        legende: `Dessin : ${info.nom}`,
        etapeId: etape.id,
        retour: 'retour-photo',
        garder: (p) => {
          valeur.photo = p.fichier;
          garderBrouillon(O, etape, valeur);
          vers('remettre')();
        },
        plusTard: vers('remettre'),
      });
      vue.actions['retour-photo'] = vers('fleche');
      return vue;
    }

    // remettre
    return {
      milieu: O.blocConsigne({ picto: 'boite', texte: 'Je remets la pièce dans sa case.' }, pastille),
      gauche: O.boutonRetour('retour-remettre'),
      principal: O.boutonPrincipal('remise', 'C’est fait'),
      actions: { 'retour-remettre': vers('photo'), remise: () => O.suivant(valeur) },
    };
  });

  // ---------- Séance 3 : le tableau à l'envers ----------
  // Les photos de la séance 1, de la dernière pièce à la première, une à la fois (aide visuelle, pas de contrôle).

  S.ajouterEcran('remontage', (etape, O) => {
    const sous = O.sous();
    const pieces = piecesDemontees(O.D()).slice().reverse();
    sous.i = sous.i || 0;
    if (!pieces.length)
      return {
        milieu: O.blocConsigne({ picto: 'remonter', texte: 'Je remonte le taille-crayon.', detail: 'Je commence par la dernière pièce.' }),
        principal: O.boutonPrincipal('fait', 'C’est remonté'),
        actions: { fait: () => O.suivant({ remises: 0 }) },
      };
    const p = pieces[sous.i];
    return {
      milieu: `<div class="zone-camera photo-piece">${vignette(O, p.photo, nomPiece(p))}<span class="num-grand">${p.numero}</span></div>
        <div class="colonne">
          <span class="pastille">${sous.i + 1} sur ${pieces.length}</span>
          <div class="consigne-ligne"><p class="consigne-texte" style="font-size:2.875rem">Je remets cette pièce.</p>${O.boutonVoix(`Je remets cette pièce : ${nomPiece(p)}.`)}</div>
          <p class="consigne-detail">${O.ech(nomPiece(p))}</p>
          <p class="consigne-detail" style="font-size:1.5rem">Si ça bloque, je lève la main. Je ne force pas.</p>
        </div>`,
      gauche: O.boutonRetour('retour-remontage'),
      principal: O.boutonPrincipal('remise', 'C’est remis'),
      actions: {
        'retour-remontage': () => {
          if (sous.i === 0) return O.etat.actions.precedent();
          sous.i--;
          O.rafraichir();
        },
        remise: () => {
          S.voix.son('ok');
          if (sous.i + 1 >= pieces.length) return O.suivant({ remises: pieces.length });
          sous.i++;
          O.rafraichir();
        },
      },
      apres: () => chargerPhotos(O),
    };
  });

  // ---------- Séance 3 : les questions de compréhension ----------
  // Réponse toujours écrite (décision de Thomas, 27/10/2026). Pour « quelle pièce… », les photos et les noms des pièces
  // de la séance 1 restent sous les yeux, pour aider à écrire. Pas de correction : le professeur lit les réponses.

  S.ajouterEcran('questions', (etape, O) => {
    const sous = O.sous();
    const questions = etape.questions || [];
    const valeur = brouillon(O, etape, { reponses: {} });
    sous.q = sous.q || 0;
    const q = questions[sous.q];
    const rep = valeur.reponses[q.id];
    const texte = (rep && typeof rep.valeur === 'string' && rep.valeur) || '';
    const derniere = sous.q === questions.length - 1;
    const pieces = q.aide === 'mes-pieces' ? piecesDemontees(O.D()) : [];
    const ecrire = (valeurTexte) => {
      valeur.reponses[q.id] = { mode: 'texte', valeur: valeurTexte };
      S.noterBrouillon(O.D(), O.seance().id, etape.id, valeur);
      O.enregistrer(false);
    };
    return {
      milieu: `<div class="colonne" style="gap:1.25rem;align-self:stretch;justify-content:center;max-width:72rem">
          <div class="consigne-ligne" style="align-items:center"><span class="pastille">Question ${sous.q + 1} sur ${questions.length}</span><p class="consigne-texte" style="font-size:2.5rem">${O.ech(q.texte)}</p>${O.boutonVoix(q.texte + ' J’écris ma réponse.')}</div>
          ${pieces.length ? `<div class="rappel-pieces" aria-label="Mes pièces">${pieces.map((p) => `<div class="rappel-piece">${vignette(O, p.photo, nomPiece(p))}<span>${O.ech(nomPiece(p))}</span></div>`).join('')}</div>` : ''}
          <label class="etiquette-reponse">${S.picto('texte')}J’écris ma réponse</label>
          <textarea class="champ-libre" rows="${pieces.length ? 2 : 3}" maxlength="300" aria-label="Ma réponse">${O.ech(texte)}</textarea>
        </div>`,
      gauche: O.boutonRetour('retour-question'),
      principal: O.boutonPrincipal('question-suivante', derniere ? 'C’est fini' : 'Suivant', derniere ? 'coche' : 'suivant', !texte.trim()),
      actions: {
        'retour-question': () => {
          if (sous.q === 0) return O.etat.actions.precedent();
          sous.q--;
          O.rafraichir();
        },
        'question-suivante': () => {
          ecrire(O.racine.querySelector('.champ-libre').value.trim());
          if (derniere) return O.suivant(valeur);
          sous.q++;
          O.rafraichir();
        },
      },
      apres: () => {
        const t = O.racine.querySelector('.champ-libre');
        t.focus();
        t.setSelectionRange(t.value.length, t.value.length);
        t.addEventListener('input', () => {
          O.racine.querySelector('[data-action="question-suivante"]').disabled = !t.value.trim();
          ecrire(t.value);
        });
        chargerPhotos(O);
      },
    };
  });
})(window);
