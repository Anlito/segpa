// Écrans de la séance 5 « Je monte et on projette » (plan : docs/PLAN-stop-motion.md §3) :
//   titre-film     le titre (une carte-idée de donnees/idees.js, ou « J'écris un titre »)
//   projection     je regarde mon film : mode 'vitesse' (🐢 lent · 🚶 normal · 🐇 rapide) ou 'final' (titre et générique)
//   trier-images   j'enlève les images ratées (toucher une image l'enlève, la toucher encore la remet)
// Le film (images, vitesse, titre) est gardé dans la sauvegarde (d.film) ; la logique est dans js/studio.js (testée).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const R = () => Object.assign({}, S.REGLAGES_FILM, P().film || {});
  const VITESSES = [
    { id: 'lent', nom: 'Lent', picto: 'vitesse-1' },
    { id: 'normal', nom: 'Normal', picto: 'vitesse-2' },
    { id: 'rapide', nom: 'Rapide', picto: 'vitesse-3' },
  ];

  const titreLigne = (O, texte, voix) =>
    `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">${O.ech(texte)}</p>${O.boutonVoix(voix || texte)}</div>`;

  // Film sans image (tournage pas encore fait) : on le dit, sans juger, et on peut continuer.
  const sansImage = (O) => ({
    milieu: `<div class="colonne" style="align-items:center;flex:0 1 auto">
        <div class="picto-grand seul">${O.pic('film')}</div>
        ${titreLigne(O, 'Ton film n’a pas encore d’image.', 'Ton film n’a pas encore d’image. Le professeur t’aide.')}
      </div>`,
    principal: O.boutonPrincipal('fait', 'Je continue', 'suivant'),
    actions: { fait: () => O.suivant({ images: 0 }) },
  });

  // ---------- Le titre du film ----------

  S.ajouterEcran('titre-film', (etape, O) => {
    const { ech, pic } = O;
    const sous = O.sous();
    const film = S.filmDe(O.D());
    if (sous.titre === undefined) sous.titre = film.titre || '';
    const idees = ((P().idees || {}).titres || []).slice(0, 6);
    const ecrit = sous.ecrire || (sous.titre && !idees.includes(sous.titre));
    const garder = () => {
      S.noterFilm(O.D(), S.noterTitre(S.filmDe(O.D()), sous.titre));
      O.suivant({ titre: S.filmDe(O.D()).titre });
    };
    const apercu = `<div class="carte-titre-apercu"><small>Le titre</small><strong>${ech(sous.titre || '…')}</strong></div>`;
    if (ecrit) {
      return {
        milieu: `<div class="colonne montage-colonne">
            ${titreLigne(O, 'J’écris le titre de mon film.')}
            <input class="champ-titre" type="text" maxlength="${S.LONGUEUR_TITRE}" autocomplete="off" spellcheck="false" aria-label="Le titre du film" value="${ech(sous.titre)}">
            ${apercu}
          </div>`,
        gauche: O.boutonRetour('idees'),
        principal: O.boutonPrincipal('garder', 'C’est mon titre', 'coche', !sous.titre.trim()),
        actions: {
          idees: () => {
            sous.ecrire = false;
            if (!idees.includes(sous.titre)) sous.titre = '';
            O.rafraichir();
          },
          garder,
        },
        apres: () => {
          const champ = O.racine.querySelector('.champ-titre');
          champ.focus();
          champ.setSelectionRange(champ.value.length, champ.value.length);
          champ.addEventListener('input', () => {
            sous.titre = champ.value;
            O.racine.querySelector('.carte-titre-apercu strong').textContent = champ.value.trim() || '…';
            O.racine.querySelector('[data-action="garder"]').disabled = !champ.value.trim();
          });
          champ.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && champ.value.trim()) garder();
          });
        },
      };
    }
    return {
      milieu: `<div class="colonne montage-colonne">
          ${titreLigne(O, etape.texte || 'Je choisis le titre de mon film.')}
          <div class="cartes-titres">${idees
            .map((t) => `<button type="button" class="carte-titre" data-action="choisir" data-titre="${ech(t)}" aria-pressed="${sous.titre === t}">${ech(t)}</button>`)
            .join('')}
            <button type="button" class="carte-titre ecrire" data-action="ecrire">${pic('crayon')}J’écris un titre</button>
          </div>
        </div>`,
      principal: O.boutonPrincipal('garder', 'C’est mon titre', 'coche', !sous.titre),
      actions: {
        choisir: (b) => {
          sous.titre = b.dataset.titre;
          for (const x of O.racine.querySelectorAll('[data-action="choisir"]')) x.setAttribute('aria-pressed', String(x === b));
          O.racine.querySelector('[data-action="garder"]').disabled = false;
        },
        ecrire: () => {
          sous.ecrire = true;
          sous.titre = '';
          O.rafraichir();
        },
        garder,
      },
    };
  });

  // ---------- Je regarde mon film ----------

  S.ajouterEcran('projection', (etape, O) => {
    const { ech, pic } = O;
    const final = etape.mode === 'final';
    let film = S.filmDe(O.D());
    if (!S.imagesVisibles(film).length) return sansImage(O);
    const eleves = O.D().equipe.eleves;
    // Pour choisir la vitesse, on regarde seulement les images, en boucle ; le film fini a son titre et son générique.
    const plans = () => {
      const p = S.sequenceFilm(film, { eleves }, R());
      return final ? p : p.filter((x) => x.type === 'image');
    };
    let lecteur = null;
    const majBouton = () => {
      const b = O.racine.querySelector('[data-action="lecture"]');
      if (!b) return;
      const joue = lecteur && lecteur.enCours();
      b.innerHTML = joue ? `${pic('stop')}Pause` : `${pic('lecture')}${final ? 'Revoir' : 'Lecture'}`;
    };
    const duree = () => Math.max(1, Math.round(S.dureeSequence(S.sequenceFilm(film, { eleves }, R()))));
    const infos = () => `${S.imagesVisibles(film).length} images · ${duree()} secondes`;
    return {
      milieu: final
        ? `<div class="colonne montage-final">
            <div class="ecran-cinema grand" data-lecteur></div>
            <div class="ligne-lecture">${titreLigne(O, etape.texte || 'Voici mon film !')}<span class="infos-film">${ech(infos())}</span>
              <button type="button" class="btn btn-second" data-action="lecture">${pic('stop')}Pause</button></div>
          </div>`
        : `<div class="ecran-cinema" data-lecteur></div>
          <div class="colonne montage-colonne">
            ${titreLigne(O, etape.texte || 'Je regarde mon film.', 'Je regarde mon film. Je choisis la vitesse.')}
            <div class="vitesses" role="group" aria-label="La vitesse du film">${VITESSES.map(
              (v) => `<button type="button" class="btn carte-vitesse" data-action="vitesse" data-v="${v.id}" aria-pressed="${film.vitesse === v.id}">${pic(v.picto)}<span>${v.nom}</span></button>`
            ).join('')}</div>
            <div class="ligne-lecture"><button type="button" class="btn btn-second" data-action="lecture">${pic('stop')}Pause</button><span class="infos-film">${ech(infos())}</span></div>
          </div>`,
      principal: O.boutonPrincipal('fait', final ? 'Mon film est prêt' : 'Cette vitesse', 'coche'),
      actions: {
        lecture: () => {
          lecteur.basculer();
          majBouton();
        },
        vitesse: (b) => {
          film = S.choisirVitesse(S.filmDe(O.D()), b.dataset.v, R());
          S.noterFilm(O.D(), film);
          O.enregistrer(false);
          for (const x of O.racine.querySelectorAll('[data-action="vitesse"]')) x.setAttribute('aria-pressed', String(x === b));
          O.racine.querySelector('.infos-film').textContent = infos();
          lecteur.changerPlans(plans());
          if (!lecteur.enCours()) lecteur.jouer().then(majBouton);
          majBouton();
        },
        fait: () => O.suivant(final ? { images: S.imagesVisibles(film).length } : { vitesse: film.vitesse }),
      },
      apres: () => {
        lecteur = S.creerLecteur(O.racine.querySelector('[data-lecteur]'), { plans: plans(), url: O.urlPhoto, boucle: !final, fin: majBouton });
        lecteur.jouer();
        O.nettoyer(() => lecteur.detruire());
      },
    };
  });

  // ---------- J'enlève les images ratées ----------

  S.ajouterEcran('trier-images', (etape, O) => {
    const { ech, pic, racine } = O;
    const sous = O.sous();
    const film0 = S.filmDe(O.D());
    if (!film0.images.length) return sansImage(O);
    const parPage = 15;
    const pages = Math.ceil(film0.images.length / parPage);
    if (sous.page === undefined || sous.page >= pages) sous.page = 0;
    const p = sous.page;
    const images = film0.images.slice(p * parPage, (p + 1) * parPage);
    const compte = () => {
      const n = S.imagesVisibles(S.filmDe(O.D())).length;
      return `${n} image${n > 1 ? 's' : ''} gardée${n > 1 ? 's' : ''}`;
    };
    return {
      milieu: `<div class="colonne montage-tri">
          <div class="ligne-tri">${titreLigne(O, etape.texte || 'J’enlève les images ratées.', 'J’enlève les images ratées. Floue, une main ? Je la touche.')}
            <p class="consigne-detail">${ech(etape.detail || 'Floue, une main ? Je la touche.')}</p></div>
          <div class="grille-tri">${images
            .map((im, k) => {
              const i = p * parPage + k;
              return `<button type="button" class="vignette-tri" data-action="basculer" data-i="${i}" aria-pressed="${!!im.enlevee}" aria-label="Image ${i + 1}${im.enlevee ? ', enlevée' : ''}">
                <img alt="" data-fichier="${ech(im.fichier)}"><small>${i + 1}</small><span class="marque-enlevee">${pic('annuler')}Enlevée</span></button>`;
            })
            .join('')}</div>
        </div>`,
      gauche: `<div class="gauche" style="display:flex;align-items:center;gap:1.25rem">${O.boutonRetour('precedent').replace(' gauche', '')}${
        pages > 1
          ? `<div class="pages"><button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + pages - 1) % pages}" aria-label="Page précédente">${pic('retour')}</button>${p + 1} sur ${pages}<button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + 1) % pages}" aria-label="Page suivante">${pic('suivant')}</button></div>`
          : ''
      }<span class="compte compte-tri">${compte()}</span></div>`,
      principal: O.boutonPrincipal('fait', 'C’est fait', 'coche'),
      actions: {
        basculer: (b) => {
          const i = Number(b.dataset.i);
          const f = S.basculerImage(S.filmDe(O.D()), i);
          S.noterFilm(O.D(), f);
          O.enregistrer(false);
          const enlevee = !!f.images[i].enlevee;
          b.setAttribute('aria-pressed', String(enlevee));
          b.setAttribute('aria-label', `Image ${i + 1}${enlevee ? ', enlevée' : ''}`);
          racine.querySelector('.compte-tri').textContent = compte();
        },
        page: (b) => {
          sous.page = Number(b.dataset.p);
          O.rafraichir();
        },
        fait: () => O.suivant({ gardees: S.imagesVisibles(S.filmDe(O.D())).length }),
      },
      apres: () => {
        for (const img of racine.querySelectorAll('.grille-tri img')) O.urlPhoto(img.dataset.fichier).then((u) => u && (img.src = u));
      },
    };
  });
})(window);
