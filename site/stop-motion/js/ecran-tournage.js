// Écran de tournage du film en stop motion (séances 3 et 4 ; plan : docs/PLAN-stop-motion.md §4).
// L'image de la caméra en grand, le calque (l'image précédente par-dessus, à 40 %), la grille des tiers, le gros bouton
// photo (et la barre d'espace), la pellicule des dernières images, « Image 12 / 30 », « Enlever la dernière »
// (avec confirmation), « Voir » (les dernières images en boucle), « Pause café » (écran noir) et un conseil qui change.
// Les images vont dans le dossier de l'équipe (photos/film/0001.jpg…), jamais dans le .json ; le film (la liste des
// images) est gardé dans la sauvegarde (d.film) : la séance 4 reprend le film de la séance 3, là où il en était.
// La logique est dans js/studio.js (testée) ; ici, seulement l'affichage. L'écran ne se redessine jamais en entier
// pendant le tournage (la caméra resterait éteinte un instant) : chaque geste met à jour seulement ce qui change.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const R = () => Object.assign({}, S.REGLAGES_FILM, P().film || {});

  S.ajouterEcran('tournage', (etape, O) => {
    const { pic, ech, racine } = O;
    const sous = O.sous();
    if (sous.calque === undefined) sous.calque = true;
    if (sous.grille === undefined) sous.grille = true;
    const vue = { occupe: false, cameras: [], choisie: '', lecture: null, minuteurConseil: null, debut: Date.now(), question: false, pause: false };
    const film = () => S.filmDe(O.D());
    const $ = (sel) => racine.querySelector(sel);
    const conseils = () => P().conseils || [];

    // Un bouton des côtés (pictogramme au-dessus du texte), en forme de brique.
    const cote = (action, picto, texte, o) =>
      `<button type="button" class="btn brique-cote${o && o.actif ? ' actif' : ''}" data-action="${action}"${o && o.presse !== undefined ? ` aria-pressed="${o.presse}"` : ''}${o && o.desactive ? ' disabled' : ''}>${pic(picto)}<span>${ech(texte)}</span></button>`;

    const conseilHtml = (c) => (c ? `${pic(c.picto || 'brique')}<span>${ech(c.texte)}</span>` : '');

    // ---------- Ce qui change à chaque image ----------

    async function majAffichage() {
      const f = film();
      const c = S.compteurFilm(f, R());
      const n = c.n;
      $('.compteur-film strong').textContent = `Image ${n} / ${c.min}`;
      $('.compteur-film .barre span').style.width = Math.round(c.part * 100) + '%';
      $('.compteur-film').classList.toggle('atteint', c.atteint);
      $('[data-action="enlever"]').disabled = !n;
      $('[data-action="voir"]').disabled = n < 2 && !vue.lecture;
      $('[data-action="prendre"]').disabled = c.plein;
      const conseil = $('.conseil-studio');
      conseil.classList.toggle('msg-ambre', c.plein);
      if (c.plein) conseil.innerHTML = `${pic('film')}<span>Ton film est assez long !</span>`;
      else if (conseil.dataset.plein === '1') conseil.innerHTML = conseilHtml(S.conseilDuMoment(conseils(), 0, 1));
      conseil.dataset.plein = c.plein ? '1' : '';
      // La pellicule : les dernières images, la plus récente à droite ; des cases vides au début du film.
      const dernieres = S.dernieresImages(f, R().pellicule);
      const premiere = n - dernieres.length;
      const cases = [];
      for (let i = 0; i < R().pellicule; i++) {
        const im = dernieres[i];
        cases.push(im ? `<span class="case-film"><img alt="" data-fichier="${ech(im.fichier)}"><small>${premiere + i + 1}</small></span>` : '<span class="case-film vide"></span>');
      }
      $('.pellicule').innerHTML = cases.join('');
      for (const img of racine.querySelectorAll('.pellicule img')) O.urlPhoto(img.dataset.fichier).then((u) => u && (img.src = u));
      // Le calque : la dernière image, par-dessus la caméra.
      const calque = $('.calque-image');
      const derniere = S.derniereImage(f);
      const u = derniere ? await O.urlPhoto(derniere.fichier) : null;
      if (!racine.contains(calque)) return;
      if (u) calque.src = u;
      calque.hidden = !(u && sous.calque);
    }

    // ---------- Caméra ----------

    async function allumer(id) {
      const zone = $('.ecran-cinema');
      const vide = zone.querySelector('.vide');
      vide.hidden = false;
      vide.innerHTML = `${pic('camera')}La caméra s’allume…`;
      const ancienne = zone.querySelector('video');
      if (ancienne) ancienne.remove();
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('aria-label', 'Image de la caméra');
      const r = await S.camera.allumer(video, id);
      if (!racine.contains(zone)) return S.camera.arreter();
      if (!r.ok) {
        vide.innerHTML = `<div class="msg msg-ambre" role="alert">${pic('camera')}${ech(r.message)}</div>
          <button type="button" class="btn btn-second" data-action="allumer">${pic('remonter')}Réessayer</button>`;
        return;
      }
      vue.cameras = r.cameras;
      vue.choisie = r.choisie;
      vide.hidden = true;
      zone.prepend(video);
      const autre = $('[data-action="autre-camera"]');
      if (vue.cameras.length > 1 && !autre) $('.studio-cote.droite').insertAdjacentHTML('beforeend', cote('autre-camera', 'camera', 'Autre caméra'));
    }

    async function prendre() {
      const video = $('.ecran-cinema video');
      const bouton = $('[data-action="prendre"]');
      if (vue.occupe || vue.question || vue.pause || !video || !bouton || bouton.disabled) return;
      if (S.compteurFilm(film(), R()).plein) return;
      if (vue.lecture) arreterLecture();
      vue.occupe = true;
      bouton.disabled = true;
      try {
        let r;
        try {
          r = await S.camera.prendre(video);
        } catch {
          return O.message('La caméra démarre… Réessaie dans une seconde.');
        }
        S.voix.son('photo');
        const flash = $('.ecran-cinema .flash');
        flash.classList.add('on');
        setTimeout(() => flash.classList.remove('on'), 30);
        let fichier;
        try {
          fichier = await O.ecrireImage(r.blob, (pris) => S.prochainNomFilm(film(), pris));
        } catch {
          return O.message('L’image ne s’enregistre pas. Touche « Autoriser », ou touche Aide.', 5000);
        }
        const res = S.ajouterImageFilm(film(), fichier, undefined, R());
        S.noterFilm(O.D(), res.valeur);
        O.enregistrer(false);
      } finally {
        vue.occupe = false;
        if (racine.contains(bouton)) {
          bouton.disabled = false;
          await majAffichage();
        }
      }
    }

    // ---------- Enlever la dernière image (avec confirmation) ----------

    async function enlever() {
      const derniere = S.derniereImage(film());
      if (!derniere) return;
      if (vue.lecture) arreterLecture();
      vue.question = true;
      const u = await O.urlPhoto(derniere.fichier);
      const zone = $('.ecran-cinema');
      zone.insertAdjacentHTML(
        'beforeend',
        `<div class="question-image" role="dialog" aria-label="Enlever la dernière image ?">
          ${u ? `<img alt="La dernière image" src="${u}">` : `<div class="vide">${pic('photo')}</div>`}
          <div class="question-bande">
            <p>J’enlève cette image ?</p>
            <button type="button" class="btn btn-second" data-action="garder-image">${pic('coche')}Non, je la garde</button>
            <button type="button" class="btn actif" data-action="oui-enlever">${pic('annuler')}Oui, j’enlève</button>
          </div>
        </div>`
      );
      $('[data-action="garder-image"]').focus();
    }

    function fermerQuestion() {
      const q = $('.question-image');
      if (q) q.remove();
      vue.question = false;
      $('[data-action="prendre"]').focus({ preventScroll: true });
    }

    async function ouiEnlever() {
      S.noterFilm(O.D(), S.enleverImageFilm(film()));
      O.enregistrer(true);
      fermerQuestion();
      await majAffichage();
      O.message('Image enlevée.');
    }

    // ---------- Voir : les dernières images en boucle ----------

    async function voir() {
      if (vue.lecture) return arreterLecture();
      const images = S.dernieresImages(film(), R().voir);
      if (images.length < 2) return;
      const urls = (await Promise.all(images.map((im) => O.urlPhoto(im.fichier)))).filter(Boolean);
      const zone = $('.ecran-cinema');
      if (!racine.contains(zone) || !urls.length) return;
      zone.insertAdjacentHTML('beforeend', `<div class="lecture-film"><img alt="Les dernières images du film"><span class="pastille-lecture">${pic('lecture')}Les ${urls.length} dernières images</span></div>`);
      const img = zone.querySelector('.lecture-film img');
      let i = 0;
      const montrer = () => {
        img.src = urls[i % urls.length];
        i++;
      };
      montrer();
      vue.lecture = setInterval(montrer, 1000 / S.imagesParSeconde(film().vitesse, R()));
      const b = $('[data-action="voir"]');
      b.setAttribute('aria-pressed', 'true');
      b.classList.add('actif');
      b.innerHTML = `${pic('stop')}<span>Stop</span>`;
    }

    function arreterLecture() {
      clearInterval(vue.lecture);
      vue.lecture = null;
      const l = $('.lecture-film');
      if (l) l.remove();
      const b = $('[data-action="voir"]');
      if (!b) return;
      b.setAttribute('aria-pressed', 'false');
      b.classList.remove('actif');
      b.innerHTML = `${pic('lecture')}<span>Voir</span>`;
      b.disabled = S.compteurFilm(film(), R()).n < 2;
    }

    // ---------- Calque, grille, pause café ----------

    function basculer(quoi) {
      sous[quoi] = !sous[quoi];
      const b = $(`[data-action="${quoi}"]`);
      b.setAttribute('aria-pressed', String(sous[quoi]));
      b.classList.toggle('actif', sous[quoi]);
      if (quoi === 'grille') $('.grille-tiers').hidden = !sous.grille;
      else $('.calque-image').hidden = !(sous.calque && $('.calque-image').getAttribute('src'));
    }

    function pause() {
      if (vue.lecture) arreterLecture();
      vue.pause = true;
      $('.ecran').insertAdjacentHTML(
        'beforeend',
        `<div class="pause-cafe" role="dialog" aria-label="Pause café">
          ${pic('cafe')}
          <p>Pause café</p>
          <p class="grand">La caméra ne bouge pas !</p>
          <button type="button" class="btn btn-principal" data-action="reprendre">${pic('lecture')}Je reviens</button>
        </div>`
      );
      $('[data-action="reprendre"]').focus();
    }

    function reprendre() {
      const p = $('.pause-cafe');
      if (p) p.remove();
      vue.pause = false;
      $('[data-action="prendre"]').focus({ preventScroll: true });
    }

    // ---------- Clavier : la barre d'espace prend la photo ----------

    function touche(e) {
      if (e.code !== 'Space' || vue.question || vue.pause) return;
      if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
      e.preventDefault();
      if (e.type === 'keydown' && !e.repeat) prendre();
    }

    // ---------- L'écran ----------

    const f0 = film();
    const c0 = S.compteurFilm(f0, R());
    const premierConseil = S.conseilDuMoment(conseils(), 0, R().periodeConseil);

    return {
      milieu: `<div class="studio">
          <div class="studio-cote">
            ${cote('enlever', 'annuler', 'Enlever la dernière', { desactive: !c0.n })}
            ${cote('voir', 'lecture', 'Voir', { presse: false, desactive: c0.n < 2 })}
            ${cote('fin', 'coche', etape.fin || 'J’arrête pour aujourd’hui')}
          </div>
          <div class="studio-centre">
            <div class="ecran-cinema">
              <img class="calque-image" alt="" hidden style="opacity:${Number(R().calque) || 0.4}">
              <div class="grille-tiers"${sous.grille ? '' : ' hidden'}><span></span><span></span><span></span><span></span></div>
              <span class="flash"></span>
              <div class="vide">${pic('camera')}La caméra s’allume…</div>
            </div>
            <div class="ligne-pellicule">
              <div class="pellicule" aria-label="Les dernières images"></div>
              <div class="compteur-film${c0.atteint ? ' atteint' : ''}">
                <strong>Image ${c0.n} / ${c0.min}</strong>
                <span class="barre"><span style="width:${Math.round(c0.part * 100)}%"></span></span>
              </div>
            </div>
          </div>
          <div class="studio-cote droite">
            ${cote('calque', 'calque', 'Calque', { presse: sous.calque, actif: sous.calque })}
            ${cote('grille', 'grille', 'Grille', { presse: sous.grille, actif: sous.grille })}
            ${cote('pause', 'cafe', 'Pause café')}
          </div>
        </div>`,
      gauche: `<div class="gauche bas-studio">${O.boutonRetour('precedent').replace(' gauche', '')}<div class="conseil-studio" role="status">${conseilHtml(premierConseil)}</div></div>`,
      principal: `<button type="button" class="btn btn-principal declic" data-action="prendre" aria-label="Prendre la photo (barre d’espace)">${pic('photo')}</button>`,
      actions: {
        prendre,
        allumer: () => allumer(),
        'autre-camera': () => {
          const i = vue.cameras.findIndex((c) => c.deviceId === vue.choisie);
          allumer(vue.cameras[(i + 1) % vue.cameras.length].deviceId);
        },
        enlever,
        'garder-image': fermerQuestion,
        'oui-enlever': ouiEnlever,
        voir,
        calque: () => basculer('calque'),
        grille: () => basculer('grille'),
        pause,
        reprendre,
        fin: () => O.suivant({ images: film().images.length }),
      },
      apres: () => {
        allumer();
        majAffichage();
        document.addEventListener('keydown', touche);
        document.addEventListener('keyup', touche);
        // Le conseil change toutes les 40 secondes (dans l'ordre de la liste).
        vue.minuteurConseil = setInterval(() => {
          const el = $('.conseil-studio');
          if (!el || el.dataset.plein === '1') return;
          const c = S.conseilDuMoment(conseils(), (Date.now() - vue.debut) / 1000, R().periodeConseil);
          if (c && el.textContent !== c.texte) el.innerHTML = conseilHtml(c);
        }, 1000);
        O.nettoyer(() => {
          document.removeEventListener('keydown', touche);
          document.removeEventListener('keyup', touche);
          clearInterval(vue.minuteurConseil);
          clearInterval(vue.lecture);
        });
      },
    };
  });
})(window);
