// La course au vidéoprojecteur (séance 5), pilotée par le professeur (plan : docs/PLAN-voiture-ballon.md §4).
//   1. les voitures : lues dans le dossier Voiture-ballon (nom, couleur, photo officielle), ou une démonstration ;
//      le professeur retire les équipes absentes et choisit le nombre de couloirs du jour (2 à 4) ;
//   2. les poules (le professeur peut déplacer une voiture) ; 3. chaque course : « Top départ », un gros bouton par
//      couloir à l'arrivée (touches 1 à 4 aussi), « N'arrive pas » avec la distance ; 4. le classement des poules et les
//      finales par niveau ; 5. un podium par finale ; 6. « Bravo à tous », le record, l'enregistrement.
// Enregistrement : course.json dans le dossier du projet (toute la course) et dans le dossier de chaque équipe (son
// résultat, lu par l'écran « Mon résultat ») ; tableau CSV ; diplômes de pilote à imprimer (noir et blanc).
// La course en cours est gardée dans ce navigateur : une page rechargée reprend où elle en était.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const F = S.fichiers;
  const P = () => S.donneesProjet || {};
  const ech = S.echapper;
  const pic = (n) => S.picto(n);
  const racine = document.getElementById('app');
  const CLE = 'segpa-voiture-ballon-course';

  const vide = () => ({ etape: 'accueil', demo: false, voitures: [], absents: [], couloirs: 3, poules: [], finales: [], file: [], courant: 0, depart: null });
  let etat = vide();
  let dossierProjet = null;
  const dossiersEquipes = new Map();
  const photos = new Map();
  let actions = {};
  let tic = null;

  function garder() {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {}
  }
  function relire() {
    try {
      const e = JSON.parse(localStorage.getItem(CLE) || 'null');
      return e && e.etape && e.etape !== 'accueil' ? e : null;
    } catch {
      return null;
    }
  }

  const voiture = (id) => etat.voitures.find((v) => v.id === id) || { id, nom: id, couleur: '#475569', nomCouleur: '', eleves: [] };
  const presentes = () => etat.voitures.filter((v) => !etat.absents.includes(v.id));
  const toutes = () => [...etat.poules, ...etat.finales];
  const courseDe = (f) => (f.phase === 'poule' ? etat.poules : etat.finales)[f.index];
  const courante = () => etat.file[etat.courant] && courseDe(etat.file[etat.courant]);
  const nombre = (n) => String(n).replace('.', ',');

  // ---------- Affichage ----------

  function afficher(nom, html, acts, apres) {
    clearInterval(tic);
    racine.innerHTML = `<div class="ecran" data-ecran="${nom}">${html}</div>`;
    actions = acts || {};
    garder();
    if (apres) apres();
  }
  racine.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (b && !b.disabled && actions[b.dataset.action]) actions[b.dataset.action](b);
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input')) return;
    if (/^[1-6]$/.test(e.key) && actions.arrivee) {
      const b = racine.querySelector(`[data-action="arrivee"][data-couloir="${Number(e.key) - 1}"]`);
      if (b && !b.disabled) actions.arrivee(b);
    } else if ((e.key === ' ' || e.key === 'Enter') && actions['top-depart'] && racine.querySelector('[data-action="top-depart"]')) {
      e.preventDefault();
      actions['top-depart']();
    }
  });

  const haut = (titre, droite) => `<div class="haut"><h1 class="titre-ecran">${ech(titre)}</h1><div class="espace"></div>${droite || ''}</div>`;
  const bas = (gauche, principal) => `<div class="bas"><div class="gauche" style="display:flex;gap:1rem">${gauche || ''}</div>${principal || ''}</div>`;
  const bouton = (action, texte, picto, classe, desactive) => `<button type="button" class="btn ${classe || 'btn-second'}" data-action="${action}"${desactive ? ' disabled' : ''}>${picto ? pic(picto) : ''}${ech(texte)}</button>`;
  const principal = (action, texte, picto, desactive) => bouton(action, texte, picto, 'btn-principal', desactive);

  function pastilleVoiture(id, extra) {
    const v = voiture(id);
    return `<span class="voiture-course"><span class="carrosserie" style="background:${ech(v.couleur)}">${pic('voiture')}</span><span><strong>${ech(v.nom)}</strong><small>${ech(v.eleves.join(' · '))}</small></span>${extra || ''}</span>`;
  }

  // ---------- 1. Accueil ----------

  function ecranAccueil() {
    const reprise = relire();
    afficher(
      'accueil',
      `<div class="accueil-titre"><div class="logo-projet">${pic('drapeau')}</div><div><div class="sur-titre">Voitures à ballon · séance 5</div><h1 class="grand-titre">La course</h1></div></div>
      <div class="milieu" style="gap:3rem">
        <button type="button" class="choix" data-action="ouvrir"><span class="rond plein">${pic('dossier')}</span>Ouvrir le dossier ${ech((S.reglages.cheminProjet || ['Voiture-ballon']).slice(-1)[0])}</button>
        ${reprise ? `<button type="button" class="choix" data-action="reprendre"><span class="rond plein">${pic('lecture')}</span>Reprendre la course</button>` : ''}
        <button type="button" class="choix" data-action="demo"><span class="rond">${pic('voiture')}</span>Démonstration</button>
      </div>`,
      {
        ouvrir: () => ouvrirDossier(),
        demo: () => {
          const noms = P().noms || [];
          const couleurs = P().couleurs || [];
          const prenoms = ['Léa', 'Tom', 'Inès', 'Noah', 'Jade', 'Rayan', 'Emma', 'Sami', 'Chloé', 'Yanis', 'Lina', 'Adam', 'Zoé', 'Nolan', 'Manon', 'Ilyes'];
          etat = vide();
          etat.demo = true;
          etat.voitures = Array.from({ length: 8 }, (_, i) => {
            const c = couleurs[i % couleurs.length] || { nom: '', hex: '#475569' };
            return { id: `${prenoms[2 * i]}_${prenoms[2 * i + 1]}`, nom: noms[i] || `Voiture ${i + 1}`, couleur: c.hex, nomCouleur: c.nom, eleves: [prenoms[2 * i], prenoms[2 * i + 1]] };
          });
          ecranVoitures();
        },
        reprendre: () => {
          etat = Object.assign(vide(), reprise);
          aller();
        },
      }
    );
  }

  async function ouvrirDossier() {
    let d;
    try {
      d = await F.choisirDossier();
    } catch {
      return message('Le dossier ne s’ouvre pas.');
    }
    if (!d) return;
    if ((await F.analyserDossier(d)) !== 'projet') return message(`Ce n’est pas le dossier ${(S.reglages.cheminProjet || []).slice(-1)[0]}.`);
    dossierProjet = d;
    const equipes = await F.equipesDans(d);
    const anciennes = etat.voitures;
    etat = vide();
    etat.voitures = equipes
      .map((e) => {
        const n = S.valeurEtape(e.donnees, 's1', 'nom');
        const c = S.valeurEtape(e.donnees, 's1', 'couleur');
        const off = (e.donnees.photos || []).filter((p) => p.legende === 'Photo officielle').slice(-1)[0];
        dossiersEquipes.set(e.dossier.name, e.dossier);
        if (off) photos.set(e.dossier.name, { dossier: e.dossier, chemin: off.fichier });
        return { id: e.dossier.name, nom: (n && n.nom) || e.donnees.equipe.eleves.join(' et '), couleur: (c && c.hex) || '#475569', nomCouleur: (c && c.nom) || '', eleves: e.donnees.equipe.eleves };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
    if (!etat.voitures.length) {
      etat.voitures = anciennes;
      return message('Aucune équipe dans ce dossier.');
    }
    ecranVoitures();
  }

  function message(texte) {
    const m = document.createElement('div');
    m.className = 'message-bref';
    m.textContent = texte;
    document.body.append(m);
    setTimeout(() => m.remove(), 4000);
  }

  async function chargerPhotos() {
    for (const img of racine.querySelectorAll('img[data-photo]')) {
      const p = photos.get(img.dataset.photo);
      if (!p) continue;
      if (!p.url) {
        const f = await F.lirePhoto(p.dossier, p.chemin);
        if (f) p.url = URL.createObjectURL(f);
      }
      if (p.url) img.src = p.url;
    }
  }

  // ---------- 2. Les voitures du jour, les couloirs ----------

  function ecranVoitures() {
    etat.etape = 'voitures';
    const n = presentes().length;
    afficher(
      'course-voitures',
      haut('Les voitures du jour', `<span class="compte-course">${n} voiture${n > 1 ? 's' : ''}</span>`) +
        `<div class="milieu" style="flex-direction:column;gap:1.25rem">
          <div class="grille-voitures">${etat.voitures
            .map((v) => {
              const absente = etat.absents.includes(v.id);
              return `<button type="button" class="carte-voiture" data-action="absente" data-id="${ech(v.id)}" aria-pressed="${!absente}">
                ${photos.has(v.id) ? `<img data-photo="${ech(v.id)}" alt="">` : `<span class="carrosserie" style="background:${ech(v.couleur)}">${pic('voiture')}</span>`}
                <strong>${ech(v.nom)}</strong><small>${absente ? 'Absente' : ech(v.eleves.join(' · '))}</small></button>`;
            })
            .join('')}</div>
          <div class="couloirs"><span>Couloirs aujourd’hui :</span>${[2, 3, 4]
            .map((c) => `<button type="button" class="carte-choix mode" data-action="couloirs" data-n="${c}" aria-pressed="${etat.couloirs === c}">${c}</button>`)
            .join('')}</div>
        </div>` +
        bas(bouton('accueil', 'Accueil', 'retour'), principal('poules', 'Faire les poules', 'suivant', n < 2)),
      {
        accueil: () => ecranAccueil(),
        absente: (b) => {
          const id = b.dataset.id;
          etat.absents = etat.absents.includes(id) ? etat.absents.filter((x) => x !== id) : etat.absents.concat(id);
          ecranVoitures();
        },
        couloirs: (b) => {
          etat.couloirs = Number(b.dataset.n);
          ecranVoitures();
        },
        poules: () => {
          etat.poules = S.repartirPoules(presentes().map((v) => v.id), etat.couloirs);
          etat.finales = [];
          ecranPoules();
        },
      },
      chargerPhotos
    );
  }

  // ---------- 3. Les poules (une voiture touchée passe dans la poule suivante qui a de la place) ----------

  function ecranPoules() {
    etat.etape = 'poules';
    afficher(
      'course-poules',
      haut('Les poules', `<span class="compte-course">${etat.couloirs} couloirs</span>`) +
        `<div class="milieu" style="flex-direction:column;gap:1rem">
          <p class="aide-prof">Touchez une voiture pour la changer de poule.</p>
          <div class="colonnes-course">${etat.poules
            .map((p, i) => `<div class="colonne-course"><h2>${ech(p.nom)}</h2>${p.voitures.map((v) => `<button type="button" class="ligne-voiture" data-action="deplacer" data-p="${i}" data-id="${ech(v)}">${pastilleVoiture(v)}</button>`).join('')}</div>`)
            .join('')}</div>
        </div>` +
        bas(bouton('voitures', 'Retour', 'retour'), principal('lancer-poules', 'Lancer les poules', 'drapeau')),
      {
        voitures: () => ecranVoitures(),
        deplacer: (b) => {
          const i = Number(b.dataset.p);
          for (let k = 1; k < etat.poules.length; k++) {
            const j = (i + k) % etat.poules.length;
            if (etat.poules[j].voitures.length < etat.couloirs) {
              etat.poules[i].voitures = etat.poules[i].voitures.filter((x) => x !== b.dataset.id);
              etat.poules[j].voitures.push(b.dataset.id);
              etat.poules = etat.poules.filter((p) => p.voitures.length).map((p, n) => Object.assign(p, { id: 'p' + (n + 1), nom: `Poule ${n + 1}` }));
              return ecranPoules();
            }
          }
          message('Les autres poules sont pleines.');
        },
        'lancer-poules': () => {
          etat.file = etat.poules.map((_, index) => ({ phase: 'poule', index }));
          etat.courant = 0;
          etat.depart = null;
          ecranCourse();
        },
      }
    );
  }

  // ---------- 4. Une course ----------

  function ecranCourse() {
    etat.etape = 'course';
    const c = courante();
    const f = etat.file[etat.courant];
    const memes = etat.file.filter((x) => x.phase === f.phase);
    const rangs = S.classerCourse(c);
    const fini = S.courseFinie(c);
    const derniere = etat.courant === etat.file.length - 1;
    const temps = () => (etat.depart ? (Date.now() - etat.depart) / 1000 : 0);
    const couloir = (v, i) => {
      const a = c.arrivees[v];
      const r = rangs.find((x) => x.equipe === v);
      let droite;
      if (a && typeof a.place === 'number') droite = `<span class="arrivee-faite">${S.ordinal(r.rang)} · ${nombre(a.temps)} s</span>`;
      else if (a) droite = `<span class="arrivee-faite non">${nombre(a.distance)} cm</span>`;
      else
        droite = `${bouton('arrivee', `Arrivée (${i + 1})`, 'drapeau', 'btn-principal btn-arrivee', !etat.depart).replace('data-action="arrivee"', `data-action="arrivee" data-couloir="${i}" data-id="${ech(v)}"`)}
          <span class="distance"><input type="number" min="0" max="5000" inputmode="numeric" aria-label="Distance en cm" placeholder="cm" data-id="${ech(v)}">${bouton('distance', 'N’arrive pas', '', 'btn-second btn-petit').replace('data-action="distance"', `data-action="distance" data-id="${ech(v)}"`)}</span>`;
      return `<div class="couloir"><span class="numero-couloir">${i + 1}</span>${pastilleVoiture(v)}<span class="droite">${droite}</span></div>`;
    };
    afficher(
      'course',
      haut(`${c.nom}`, `<span class="compte-course">${f.phase === 'poule' ? 'Poule' : 'Finale'} ${memes.indexOf(f) + 1} sur ${memes.length}</span><span class="chrono" aria-live="off">${nombre(temps().toFixed(1))} s</span>`) +
        `<div class="milieu" style="flex-direction:column;gap:0.75rem;align-items:stretch">${c.voitures.map(couloir).join('')}</div>` +
        bas(
          bouton('faux-depart', 'Faux départ', 'remonter', 'btn-second', !etat.depart && !Object.keys(c.arrivees).length) + (etat.courant ? bouton('course-precedente', 'Course précédente', 'retour') : bouton('poules-retour', 'Les poules', 'retour')),
          !etat.depart && !fini
            ? principal('top-depart', 'Top départ !', 'lecture')
            : principal('course-suivante', fini ? (derniere ? (f.phase === 'poule' ? 'Le classement' : 'Le podium') : f.phase === 'finale' ? 'Le podium' : 'Course suivante') : 'En course…', 'suivant', !fini)
        ),
      {
        'top-depart': () => {
          etat.depart = Date.now();
          ecranCourse();
        },
        arrivee: (b) => {
          const places = Object.values(c.arrivees).filter((a) => typeof a.place === 'number').length;
          c.arrivees[b.dataset.id] = { place: places + 1, temps: Math.round(temps() * 10) / 10 };
          if (S.courseFinie(c)) etat.depart = null;
          ecranCourse();
        },
        distance: (b) => {
          const champ = racine.querySelector(`input[data-id="${CSS.escape(b.dataset.id)}"]`);
          const d = Math.round(Number(String(champ.value).replace(',', '.')));
          if (!champ.value || !(d >= 0)) {
            champ.focus();
            return message('Écrivez la distance en cm.');
          }
          c.arrivees[b.dataset.id] = { distance: d };
          if (S.courseFinie(c)) etat.depart = null;
          ecranCourse();
        },
        'faux-depart': () => {
          c.arrivees = {};
          etat.depart = null;
          ecranCourse();
        },
        'course-precedente': () => {
          etat.courant--;
          etat.depart = null;
          ecranCourse();
        },
        'poules-retour': () => ecranPoules(),
        'course-suivante': () => {
          etat.depart = null;
          if (f.phase === 'finale') return ecranPodium();
          if (derniere) return ecranClassement();
          etat.courant++;
          ecranCourse();
        },
      },
      () => {
        if (etat.depart) tic = setInterval(() => (racine.querySelector('.chrono').textContent = nombre(temps().toFixed(1)) + ' s'), 100);
      }
    );
  }

  // ---------- 5. Classement des poules, finales ----------

  function ecranClassement() {
    etat.etape = 'classement';
    const ordre = S.ordreApresPoules(etat.poules);
    if (!etat.finales.length) etat.finales = S.composerFinales(ordre, etat.couloirs);
    afficher(
      'course-classement',
      haut('Les finales', `<span class="compte-course">Tout le monde court encore !</span>`) +
        `<div class="milieu" style="flex-direction:column;gap:1rem">
          <div class="colonnes-course">${etat.finales
            .map((fi) => `<div class="colonne-course"><h2>${ech(fi.nom)}</h2>${fi.voitures.map((v) => `<div class="ligne-voiture">${pastilleVoiture(v)}</div>`).join('')}</div>`)
            .join('')}</div>
          <p class="aide-prof">Les finales se courent de la dernière à la finale principale.</p>
        </div>` +
        bas(bouton('retour-poules', 'Dernière poule', 'retour'), principal('lancer-finales', 'Lancer les finales', 'drapeau')),
      {
        'retour-poules': () => {
          etat.finales = [];
          etat.courant = etat.file.length - 1;
          ecranCourse();
        },
        'lancer-finales': () => {
          etat.file = etat.finales.map((_, index) => ({ phase: 'finale', index })).reverse();
          etat.courant = 0;
          ecranCourse();
        },
      }
    );
  }

  // ---------- 6. Podium d'une finale ----------

  function ecranPodium() {
    etat.etape = 'podium';
    const c = courante();
    const r = S.classerCourse(c);
    const derniere = etat.courant === etat.file.length - 1;
    const marche = (x, h) =>
      x
        ? `<div class="marche"><span class="carrosserie grande" style="background:${ech(voiture(x.equipe).couleur)}">${pic('voiture')}</span><strong>${ech(voiture(x.equipe).nom)}</strong><small>${ech(voiture(x.equipe).eleves.join(' · '))}</small><span class="socle" style="height:${h}rem">${S.ordinal(x.rang)}</span></div>`
        : '';
    afficher(
      'course-podium',
      haut(`Podium · ${c.nom}`) +
        `<div class="milieu"><div class="podium">${marche(r[1], 6)}${marche(r[0], 9)}${marche(r[2], 4)}</div>${r.length > 3 ? `<div class="autres-places">${r.slice(3).map((x) => `<span>${S.ordinal(x.rang)} · ${ech(voiture(x.equipe).nom)}</span>`).join('')}</div>` : ''}</div>` +
        bas(bouton('revoir', 'Revoir la course', 'retour'), principal('apres-podium', derniere ? 'Bravo à tous' : 'Finale suivante', 'suivant')),
      {
        revoir: () => ecranCourse(),
        'apres-podium': () => {
          if (derniere) return ecranFin();
          etat.courant++;
          ecranCourse();
        },
      }
    );
  }

  // ---------- 7. Bravo à tous, enregistrement ----------

  function ecranFin() {
    etat.etape = 'fin';
    const rec = S.recordCourse(toutes());
    afficher(
      'course-fin',
      haut('Bravo à tous !') +
        `<div class="milieu" style="flex-direction:column;gap:1.5rem">
          ${rec ? `<div class="record">${pic('drapeau')}<span><small>Record de la classe</small><strong>${nombre(rec.temps)} s · ${ech(voiture(rec.equipe).nom)}</strong><small>${ech(rec.course)}</small></span></div>` : ''}
          <div class="actions-fin">
            ${bouton('enregistrer', etat.demo ? 'Télécharger course.json' : 'Enregistrer les résultats', 'dossier-ok', 'btn-principal')}
            ${bouton('csv', 'Tableau (CSV)', 'texte')}
            ${bouton('diplomes', 'Diplômes de pilote', 'photo')}
          </div>
          <p class="aide-prof">Les résultats vont dans le dossier du projet et dans le dossier de chaque équipe : les élèves les voient sur l’écran « Mon résultat ».</p>
        </div>` +
        bas(bouton('revoir-podium', 'Dernier podium', 'retour'), bouton('accueil', 'Nouvelle course', 'remonter')),
      {
        'revoir-podium': () => ecranPodium(),
        accueil: () => {
          if (!confirm('Commencer une nouvelle course ? Celle-ci reste dans les fichiers enregistrés.')) return;
          etat = vide();
          garder();
          ecranAccueil();
        },
        enregistrer: () => enregistrer(),
        csv: () => {
          const l = S.lignesCsvCourse(etat, (v) => ({ equipe: v, voiture: voiture(v).nom }));
          telecharger('course.csv', '﻿' + l.map((x) => x.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n'), 'text/csv');
        },
        diplomes: () => imprimerDiplomes(),
      }
    );
  }

  function telecharger(nom, contenu, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([contenu], { type }));
    a.download = nom;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const fichierCourse = () => ({ application: 'segpa', projet: 'voiture-ballon', type: 'course', format: 1, date: S.maintenant(), couloirs: etat.couloirs, voitures: presentes(), poules: etat.poules, finales: etat.finales, record: S.recordCourse(toutes()) });

  async function ecrire(dossier, nom, objet) {
    const h = await dossier.getFileHandle(nom, { create: true });
    const w = await h.createWritable();
    await w.write(JSON.stringify(objet, null, 1));
    await w.close();
  }

  // course.json est le fichier de la course (réécrit à chaque enregistrement) ; les sauvegardes des élèves ne sont
  // jamais touchées.
  async function enregistrer() {
    if (etat.demo) return telecharger('course.json', JSON.stringify(fichierCourse(), null, 1), 'application/json');
    try {
      if (!dossierProjet) {
        const d = await F.choisirDossier();
        if (!d) return;
        dossierProjet = d;
      }
      if (!(await F.autorise(dossierProjet, true))) return message('Touchez « Autoriser » quand le navigateur le demande.');
      await ecrire(dossierProjet, 'course.json', fichierCourse());
      let n = 0;
      for (const v of presentes()) {
        let d = dossiersEquipes.get(v.id);
        if (!d)
          try {
            d = await dossierProjet.getDirectoryHandle(v.id);
          } catch {
            continue;
          }
        const resultat = S.resultatEquipe(etat, v.id);
        if (!resultat) continue;
        await ecrire(d, 'course.json', { application: 'segpa', projet: 'voiture-ballon', type: 'course', format: 1, date: S.maintenant(), equipe: v.id, voiture: v.nom, resultat });
        n++;
      }
      message(`Résultats enregistrés : ${n} équipe${n > 1 ? 's' : ''}.`);
    } catch {
      message('L’enregistrement n’a pas marché. Téléchargez course.json à la place.');
      telecharger('course.json', JSON.stringify(fichierCourse(), null, 1), 'application/json');
    }
  }

  function imprimerDiplomes() {
    const zone = document.getElementById('diplomes');
    zone.innerHTML = presentes()
      .map((v) => {
        const r = S.resultatEquipe(etat, v.id);
        const m = S.messageResultat(r);
        const p = photos.get(v.id);
        return `<section class="diplome">
          <p class="surtitre">Course de voitures à ballon · ${ech(S.reglages.classes ? S.reglages.classes.join(', ') : '')}</p>
          <h1>Diplôme de pilote</h1>
          ${p && p.url ? `<img src="${p.url}" alt="">` : `<div class="sans-photo">${pic('voiture')}</div>`}
          <h2>${ech(v.nom)}</h2>
          <p class="pilotes">${ech(v.eleves.join(' et '))}</p>
          <p class="resultat">${ech(r ? r.course : '')}${m ? ' · ' + ech(m.titre.replace(/ !$/, '')) : ''}</p>
          <p class="date">${new Date().toLocaleDateString('fr-FR')}</p>
        </section>`;
      })
      .join('');
    window.print();
  }

  function aller() {
    ({ voitures: ecranVoitures, poules: ecranPoules, course: ecranCourse, classement: ecranClassement, podium: ecranPodium, fin: ecranFin }[etat.etape] || ecranAccueil)();
  }

  const r = document.documentElement.style;
  if (S.projet.accent) r.setProperty('--accent', S.projet.accent);
  if (S.projet.accentFonce) r.setProperty('--accent-fonce', S.projet.accentFonce);
  if (S.projet.accentClair) r.setProperty('--accent-clair', S.projet.accentClair);
  S.course = { etat: () => etat };
  ecranAccueil();
})(window);
