// Outil professeur commun aux projets SEGPA (cahier des charges §7) :
//   accueil  : ouvrir le dossier du projet d'une classe (suivi en direct), reprendre le dernier, importer des .json ;
//   classe   : une tuile par équipe (prénoms, séances ✓ ● ○, dernière photo, lignes du projet, alertes), aide d'abord ;
//   équipe   : ‹ › entre équipes, Échap pour revenir ; onglets Bilan · Album · (onglets du projet) · Historique ·
//              Différenciation.
// Le suivi relit les fichiers toutes les 20 secondes (« lu à 10:42 ») : il y a donc un léger décalage.
// Le professeur n'écrit jamais dans le fichier d'une équipe : ses notes vont dans « professeur.json ».
(function (global) {
  'use strict';

  const S = global.Segpa;
  const ech = S.echapper;
  const pic = (n, t) => S.picto(n, t);
  const racine = document.getElementById('prof');
  const P = () => S.profProjet || { lignes: () => [], alertes: () => [], onglets: [], drapeaux: [] };
  const RELECTURE = 20000;

  const etat = {
    dossier: null, // dossier du projet (suivi en direct) ; null en mode « fichiers importés »
    equipes: [],
    invalides: [],
    professeur: S.professeurVide(S.projet.id),
    lecture: null,
    vue: 'accueil',
    courante: null,
    onglet: 'bilan',
    aidesConnues: new Set(),
    urls: new Map(),
    actions: {},
  };
  let minuteur = null;

  const heure = (d) => (d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
  const jourHeure = (d) => (d ? new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
  const ilYa = (m) => (m === null ? '' : m < 1 ? 'à l’instant' : m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.floor(m / 60)} h` : `il y a ${Math.floor(m / 1440)} j`);

  function afficher(html, actions, apres) {
    etat.actions = actions || {};
    racine.innerHTML = html;
    majBandeau();
    if (apres) apres();
  }

  racine.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const f = etat.actions[b.dataset.action];
    if (f) f(b, e);
  });
  racine.addEventListener('change', (e) => {
    const f = e.target.dataset.change && etat.actions[e.target.dataset.change];
    if (f) f(e.target, e);
  });

  // ---------- Bandeau ----------

  function majBandeau() {
    const classe = etat.equipes.map((x) => x.donnees.equipe.classe).find(Boolean) || '';
    document.querySelector('.pb-classe').textContent = etat.vue === 'accueil' ? '' : [etat.dossier ? etat.dossier.name : 'Fichiers importés', classe].filter(Boolean).join(' · ');
    const direct = document.querySelector('.pb-direct');
    direct.hidden = etat.vue === 'accueil';
    direct.textContent = etat.dossier ? `● En direct · lu à ${heure(etat.lecture)}` : 'Sans suivi en direct';
    direct.classList.toggle('arret', !etat.dossier);
    for (const b of document.querySelectorAll('.pb-suivi')) b.hidden = etat.vue === 'accueil';
  }

  document.querySelector('.btn-actualiser').addEventListener('click', () => relire(true));
  document.querySelector('.btn-autre-classe').addEventListener('click', () => {
    clearInterval(minuteur);
    Object.assign(etat, { dossier: null, equipes: [], invalides: [], vue: 'accueil' });
    ecranAccueil();
  });

  // ---------- Lecture des fichiers ----------

  async function lireDossier(dossier) {
    const fichiers = [];
    for await (const h of dossier.values()) {
      if (h.kind !== 'directory') continue;
      for await (const f of h.values()) {
        if (f.kind !== 'file' || !/\.json$/i.test(f.name)) continue;
        try {
          fichiers.push({ nom: `${h.name}/${f.name}`, texte: await (await f.getFile()).text(), dossier: h });
        } catch {
          /* fichier en cours d'écriture : relu au prochain passage */
        }
      }
    }
    let professeur = S.professeurVide(S.projet.id);
    try {
      professeur = S.lireProfesseur(await (await (await dossier.getFileHandle('professeur.json')).getFile()).text(), S.projet.id);
    } catch {
      /* pas encore de notes du professeur */
    }
    return { fichiers, professeur };
  }

  function preparer(fichiers) {
    const { equipes, invalides } = S.fusionner(fichiers, S.projet.id);
    const t = Date.now();
    etat.equipes = equipes.map((eq) => {
      const resume = S.resumer(eq.donnees, S.etapes.seances, t);
      const vue = etat.professeur.aidesVues[eq.nom] || null;
      return Object.assign(eq, { resume, alertes: S.alertes(resume, vue, P().alertes(eq.donnees)), lignes: P().lignes(eq.donnees) });
    });
    etat.invalides = invalides;
    etat.lecture = new Date();
    // Nouvelle demande d'aide : son et titre de l'onglet.
    let nouvelle = false;
    for (const eq of etat.equipes)
      if (eq.alertes.some((a) => a.sorte === 'aide')) {
        const cle = eq.cle + eq.resume.aide.date;
        if (!etat.aidesConnues.has(cle)) nouvelle = true;
        etat.aidesConnues.add(cle);
      }
    if (nouvelle) signalerAide();
  }

  async function relire(forcer) {
    if (!etat.dossier) return;
    try {
      const { fichiers, professeur } = await lireDossier(etat.dossier);
      etat.professeur = professeur;
      preparer(fichiers);
    } catch {
      document.querySelector('.pb-direct').textContent = '⚠ Dossier illisible : touchez « Actualiser »';
      return;
    }
    if (etat.vue === 'classe') ecranClasse();
    else if (etat.vue === 'equipe' && forcer) ecranEquipe();
    else majBandeau();
  }

  let audio = null;
  function signalerAide() {
    try {
      audio = audio || new AudioContext();
      for (const [f, debut] of [[660, 0], [880, 0.18]]) {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.frequency.value = f;
        const t = audio.currentTime + debut;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(audio.destination);
        o.start(t);
        o.stop(t + 0.35);
      }
    } catch {
      /* pas de son */
    }
    document.title = '🙋 Aide demandée — ' + document.title.replace(/^🙋 Aide demandée — /, '');
    setTimeout(() => (document.title = document.title.replace(/^🙋 Aide demandée — /, '')), 15000);
  }

  async function ecrireProfesseur() {
    if (!etat.dossier) return false;
    try {
      etat.professeur.modifieLe = S.maintenant();
      const h = await etat.dossier.getFileHandle('professeur.json', { create: true });
      const flux = await h.createWritable();
      await flux.write(JSON.stringify(etat.professeur, null, 1));
      await flux.close();
      return true;
    } catch {
      return false;
    }
  }

  async function urlPhoto(eq, fichier) {
    if (!eq.dossier || !fichier) return null;
    const cle = eq.cle + '|' + fichier;
    if (etat.urls.has(cle)) return etat.urls.get(cle);
    const blob = await S.fichiers.lirePhoto(eq.dossier, fichier);
    const u = blob ? URL.createObjectURL(blob) : null;
    if (u) etat.urls.set(cle, u);
    return u;
  }

  // ---------- Accueil ----------

  async function ecranAccueil() {
    etat.vue = 'accueil';
    const dernier = S.fichiers.accesDossiers ? await S.fichiers.memorise('prof-projet') : null;
    const chemin = S.remplirChemin((S.college && S.college.cheminClasse) || [], (S.reglages.classes || ['…']).join(' / ')).concat(S.reglages.cheminProjet || []);
    afficher(
      `<section class="pa">
        <h2>Suivre une classe</h2>
        <p class="pa-intro">Ouvrez le dossier <strong>${ech(chemin.join(' › '))}</strong> : l’outil lit le dossier de chaque équipe
          (Prénom_Prénom) et le relit toutes les 20 secondes pendant la séance.</p>
        ${S.fichiers.accesDossiers ? '' : '<p class="pa-alerte">Ce navigateur ne peut pas ouvrir un dossier : utilisez Chrome ou Edge pour le suivi en direct, ou importez les fichiers .json.</p>'}
        <div class="pa-cartes">
          ${S.fichiers.accesDossiers ? `<button type="button" class="pa-carte" data-action="ouvrir">${pic('dossier')}<strong>Ouvrir le dossier de la classe</strong><span>Suivi en direct, alerte quand une équipe demande de l’aide.</span></button>` : ''}
          ${dernier ? `<button type="button" class="pa-carte" data-action="reprendre">${pic('remonter')}<strong>Reprendre : ${ech(dernier.name)}</strong><span>Le dernier dossier suivi sur ce poste.</span></button>` : ''}
          <label class="pa-carte">${pic('continuer')}<strong>Importer des fichiers .json</strong><span>Sans suivi en direct ni photos.</span><input type="file" accept=".json,application/json" multiple hidden data-change="importer"></label>
        </div>
        <p class="pa-message" role="alert" hidden></p>
        <ul class="pa-notes">
          <li>Les fichiers sont lus dans ce navigateur : rien n’est envoyé ailleurs.</li>
          <li>Vos notes (aides vues, différenciation) sont écrites dans <code>professeur.json</code>, dans le dossier du projet.</li>
        </ul>
      </section>`,
      {
        ouvrir: async () => {
          let d;
          try {
            d = await global.showDirectoryPicker({ id: S.projet.id + '-prof', mode: 'readwrite' });
          } catch (e) {
            if (e && e.name === 'AbortError') return;
            return message('Le dossier ne s’ouvre pas.');
          }
          suivre(d);
        },
        reprendre: async () => {
          if (!(await S.fichiers.autorise(dernier, true))) return message('Autorisez la lecture du dossier quand le navigateur le demande.');
          suivre(dernier);
        },
        importer: async (entree) => {
          const fichiers = await Promise.all([...entree.files].map(async (f) => ({ nom: f.name, texte: await f.text() })));
          etat.dossier = null;
          etat.professeur = S.professeurVide(S.projet.id);
          preparer(fichiers);
          if (!etat.equipes.length) return message(`Aucune sauvegarde de ce projet dans ${fichiers.length} fichier(s).`);
          ecranClasse();
        },
      }
    );
  }

  function message(texte) {
    const m = racine.querySelector('.pa-message');
    if (m) {
      m.textContent = texte;
      m.hidden = false;
    }
  }

  async function suivre(dossier) {
    etat.dossier = dossier;
    S.fichiers.memoriser('prof-projet', dossier);
    try {
      const { fichiers, professeur } = await lireDossier(dossier);
      etat.professeur = professeur;
      preparer(fichiers);
    } catch {
      etat.dossier = null;
      return message('Ce dossier ne se lit pas.');
    }
    if (!etat.equipes.length && !etat.invalides.length) message('Aucune équipe dans ce dossier pour l’instant : le suivi démarre quand même.');
    ecranClasse();
    clearInterval(minuteur);
    minuteur = setInterval(() => relire(false), RELECTURE);
  }

  // ---------- Classe ----------

  const CLASSE_ETAT = { fait: ['fait', '✓'], en_cours: ['en-cours', '●'], a_faire: ['a-faire', '○'] };

  function tuile(eq) {
    const r = eq.resume;
    const aide = eq.alertes.find((a) => a.sorte === 'aide');
    const drapeaux = (etat.professeur.drapeaux[eq.nom] || []).map((id) => (P().drapeaux.find((d) => d.id === id) || { texte: id }).texte);
    return `<button type="button" class="pt${aide ? ' pt-aide' : eq.alertes.length ? ' pt-alerte' : ''}" data-action="equipe" data-cle="${ech(eq.cle)}">
      <span class="pt-haut"><strong>${ech(r.noms)}</strong>${aide ? `<span class="pt-badge aide">${pic('aide')}Aide</span>` : ''}</span>
      <span class="pt-milieu">
        <span class="pt-photo">${r.dernierePhoto && eq.dossier ? `<img data-photo="${ech(r.dernierePhoto.fichier)}" alt="${ech(r.dernierePhoto.legende)}">` : pic('photo')}</span>
        <span class="pt-infos">
          <span class="pt-frise">${r.seances.map((s, i) => `<span class="${CLASSE_ETAT[s.etat][0]}" title="${ech(s.titre)}">${CLASSE_ETAT[s.etat][1]} S${i + 1}</span>`).join('')}</span>
          ${eq.lignes.map((l) => `<span class="pt-ligne">${ech(l)}</span>`).join('')}
          <span class="pt-temps">${ilYa(r.minutes)}</span>
        </span>
      </span>
      ${eq.alertes.filter((a) => a.sorte !== 'aide').map((a) => `<span class="pt-badge ambre">${ech(a.texte)}</span>`).join('')}
      ${drapeaux.map((t) => `<span class="pt-badge drapeau">${ech(t)}</span>`).join('')}
    </button>`;
  }

  function ecranClasse() {
    etat.vue = 'classe';
    const liste = S.trier(etat.equipes);
    const aides = liste.filter((eq) => eq.alertes.some((a) => a.sorte === 'aide'));
    const finies = (id) => etat.equipes.filter((eq) => eq.resume.seances.find((s) => s.id === id).etat === 'fait').length;
    afficher(
      `<section class="pc">
        ${
          aides.length
            ? `<div class="pc-aides" role="alert">${aides
                .map((eq) => `<div class="pc-aide">${pic('aide')}<strong>${ech(eq.resume.noms)}</strong><span>${ech(eq.alertes.find((a) => a.sorte === 'aide').texte)}${eq.resume.aide.seance ? ` · ${ech(etapeLisible(eq.resume.aide))}` : ''}</span><button type="button" class="pb-btn" data-action="vu" data-cle="${ech(eq.cle)}"${etat.dossier ? '' : ' disabled'}>J’y vais</button></div>`)
                .join('')}</div>`
            : ''
        }
        <div class="pc-resume"><span><b>${etat.equipes.length}</b> équipe${etat.equipes.length > 1 ? 's' : ''}</span>${S.etapes.seances.map((s, i) => `<span>Séance ${i + 1} finie : <b>${finies(s.id)}</b></span>`).join('')}<span>Aides en cours : <b>${aides.length}</b></span></div>
        <div class="pc-tuiles">${liste.map(tuile).join('') || '<p class="pc-vide">Aucune équipe pour l’instant.</p>'}</div>
        ${etat.invalides.length ? `<details class="pc-invalides"><summary>${etat.invalides.length} fichier(s) non lu(s)</summary><ul>${etat.invalides.map((x) => `<li>${ech(x.nom)} : ${ech(x.raison)}</li>`).join('')}</ul></details>` : ''}
      </section>`,
      {
        equipe: (b) => {
          etat.courante = b.dataset.cle;
          etat.onglet = 'bilan';
          ecranEquipe();
        },
        vu: async (b) => {
          const eq = etat.equipes.find((x) => x.cle === b.dataset.cle);
          etat.professeur.aidesVues[eq.nom] = eq.resume.aide.date;
          await ecrireProfesseur();
          eq.alertes = eq.alertes.filter((a) => a.sorte !== 'aide');
          ecranClasse();
        },
      },
      () => chargerPhotos()
    );
  }

  function etapeLisible(aide) {
    const s = S.etapes.seances.find((x) => x.id === aide.seance);
    if (!s) return '';
    const e = s.etapes.find((x) => x.id === aide.etape);
    return `${s.titre}${e ? ' · ' + S.nomEtape(e) : ''}`;
  }

  async function chargerPhotos() {
    for (const img of racine.querySelectorAll('img[data-photo]')) {
      const eq = etat.equipes.find((x) => x.cle === (img.closest('[data-cle]') || {}).dataset?.cle) || etat.equipes.find((x) => x.cle === etat.courante);
      const u = eq ? await urlPhoto(eq, img.dataset.photo) : null;
      if (u) img.src = u;
      else img.replaceWith(Object.assign(document.createElement('span'), { innerHTML: pic('photo') }));
    }
  }

  // ---------- Équipe ----------

  const MOTS_BILAN = ['😀 Oui', '😐 Un peu', '😕 Pas encore'];

  function ongletBilan(eq) {
    const d = eq.donnees;
    return S.etapes.seances
      .map((s, i) => {
        const r = eq.resume.seances[i];
        const details = s.etapes
          .map((e) => {
            const x = S.etatEtape(d, s.id, e.id);
            if (e.type === 'cases') return `<li>${x && x.fait ? '✓' : '○'} ${ech(e.texte)} ${(e.lignes || []).map((l, j) => `<span class="pe-case">${x && Array.isArray(x.valeur) && x.valeur[j] ? '✓' : '○'} ${ech(l.texte)}</span>`).join('')}</li>`;
            if (e.type === 'bilan') return `<li>${x && x.fait ? '✓' : '○'} Bilan : ${(e.phrases || []).map((ph, j) => `<span class="pe-case">${ech(ph)} → <b>${x && Array.isArray(x.valeur) && Number.isInteger(x.valeur[j]) ? MOTS_BILAN[x.valeur[j]] : '—'}</b></span>`).join('')}</li>`;
            if (e.type === 'photo') return `<li>${x && x.fait ? '✓' : x && x.passe ? '⚠ laissée pour plus tard :' : '○'} ${ech(e.texte)}</li>`;
            return '';
          })
          .join('');
        return `<section class="pp-bloc"><h3>Séance ${i + 1} · ${ech(s.titre)} <span class="pe-etat ${CLASSE_ETAT[r.etat][0]}">${CLASSE_ETAT[r.etat][1]} ${r.avancement.faites} écrans sur ${r.avancement.total}</span></h3><ul class="pe-liste">${details}</ul></section>`;
      })
      .join('') + `<section class="pp-bloc"><h3>Aide</h3><p>${d.aides.length} demande${d.aides.length > 1 ? 's' : ''} d’aide${d.aides.length ? ' — voir l’historique' : ''}.</p></section>`;
  }

  async function ongletAlbum(eq) {
    if (!eq.dossier) return '<p class="pp-vide">Photos visibles seulement en ouvrant le dossier de la classe (pas avec des fichiers importés).</p>';
    const parSeance = await Promise.all(
      S.etapes.seances.map(async (s, i) => {
        const photos = S.photosDe(eq.donnees, s.id);
        const cartes = await Promise.all(
          photos.map(async (p) => {
            const u = await urlPhoto(eq, p.fichier);
            const nom = `${eq.nom}_${p.fichier.split('/').pop()}`;
            return `<figure class="pp-photo">${u ? `<a href="${u}" target="_blank" rel="noopener"><img src="${u}" alt="${ech(p.legende)}"></a>` : '<span class="pp-sans">fichier absent</span>'}<figcaption>${ech(p.legende)}<small>${jourHeure(p.date)}</small>${u ? `<a class="pp-telecharger" href="${u}" download="${ech(nom)}">Télécharger</a>` : ''}</figcaption></figure>`;
          })
        );
        return `<section class="pp-bloc"><h3>Séance ${i + 1} · ${ech(s.titre)} (${photos.length})</h3>${photos.length ? `<div class="pp-album">${cartes.join('')}</div>` : '<p class="pp-vide">Pas de photo.</p>'}</section>`;
      })
    );
    return parSeance.join('');
  }

  function ongletHistorique(eq) {
    const lignes = S.historique(eq.donnees, S.etapes.seances);
    return `<section class="pp-bloc"><table class="pp-table"><thead><tr><th>Quand</th><th>Quoi</th></tr></thead><tbody>${
      lignes.map((l) => `<tr${l.sorte === 'aide' ? ' class="pe-aide"' : ''}><td>${jourHeure(l.date)}</td><td>${ech(l.texte)}</td></tr>`).join('') || '<tr><td colspan="2">Rien pour l’instant.</td></tr>'
    }</tbody></table></section>`;
  }

  function ongletDifferenciation(eq) {
    const pris = new Set(etat.professeur.drapeaux[eq.nom] || []);
    return `<section class="pp-bloc"><h3>Aides à la différenciation</h3>
      ${etat.dossier ? '' : '<p class="pp-vide">Ouvrez le dossier de la classe pour enregistrer ces choix.</p>'}
      <div class="pe-drapeaux">${P()
        .drapeaux.map((d) => `<label><input type="checkbox" data-change="drapeau" value="${ech(d.id)}"${pris.has(d.id) ? ' checked' : ''}${etat.dossier ? '' : ' disabled'}> ${ech(d.texte)}</label>`)
        .join('')}</div>
      <p class="pp-vide">Notes pour vous : elles s’affichent sur la tuile de l’équipe ; les élèves ne les voient pas.</p></section>`;
  }

  async function ecranEquipe() {
    etat.vue = 'equipe';
    const liste = S.trier(etat.equipes);
    const i = liste.findIndex((x) => x.cle === etat.courante);
    if (i < 0) return ecranClasse();
    const eq = liste[i];
    const onglets = [{ id: 'bilan', titre: 'Bilan' }, { id: 'album', titre: 'Album' }, ...P().onglets, { id: 'historique', titre: 'Historique' }, { id: 'differenciation', titre: 'Différenciation' }];
    const o = onglets.find((x) => x.id === etat.onglet) || onglets[0];
    let contenu;
    if (o.id === 'bilan') contenu = ongletBilan(eq);
    else if (o.id === 'album') contenu = await ongletAlbum(eq);
    else if (o.id === 'historique') contenu = ongletHistorique(eq);
    else if (o.id === 'differenciation') contenu = ongletDifferenciation(eq);
    else contenu = await o.html(eq.donnees, (f) => urlPhoto(eq, f));
    afficher(
      `<section class="pe">
        <div class="pe-tete">
          <button type="button" class="pb-btn" data-action="classe">${pic('retour')}Classe</button>
          <button type="button" class="pb-btn" data-action="aller" data-i="${(i + liste.length - 1) % liste.length}" aria-label="Équipe précédente">‹</button>
          <h2>${ech(eq.resume.noms)}</h2>
          <button type="button" class="pb-btn" data-action="aller" data-i="${(i + 1) % liste.length}" aria-label="Équipe suivante">›</button>
          <span class="pe-info">${eq.donnees.equipe.classe ? ech(eq.donnees.equipe.classe) + ' · ' : ''}dernière activité ${ilYa(eq.resume.minutes)}${eq.autres.length ? ` · ⚠ autres fichiers ignorés : ${ech(eq.autres.join(', '))}` : ''}</span>
        </div>
        ${eq.alertes.length ? `<div class="pe-alertes">${eq.alertes.map((a) => `<span class="pt-badge ${a.sorte === 'aide' ? 'aide' : 'ambre'}">${ech(a.texte)}</span>`).join('')}</div>` : ''}
        <nav class="pe-onglets" role="tablist">${onglets.map((x) => `<button type="button" role="tab" aria-selected="${x.id === o.id}" data-action="onglet" data-id="${x.id}">${ech(x.titre)}</button>`).join('')}</nav>
        <div class="pe-contenu" role="tabpanel">${contenu}</div>
      </section>`,
      {
        classe: () => ecranClasse(),
        aller: (b) => {
          etat.courante = liste[Number(b.dataset.i)].cle;
          ecranEquipe();
        },
        onglet: (b) => {
          etat.onglet = b.dataset.id;
          ecranEquipe();
        },
        drapeau: async (c) => {
          const set = new Set(etat.professeur.drapeaux[eq.nom] || []);
          if (c.checked) set.add(c.value);
          else set.delete(c.value);
          etat.professeur.drapeaux[eq.nom] = [...set];
          if (!(await ecrireProfesseur())) c.checked = !c.checked;
        },
      }
    );
  }

  document.addEventListener('keydown', (e) => {
    if (etat.vue !== 'equipe') return;
    if (e.key === 'Escape') ecranClasse();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const b = racine.querySelectorAll('[data-action="aller"]')[e.key === 'ArrowLeft' ? 0 : 1];
      if (b) b.click();
    }
  });

  // ---------- Démarrage ----------

  function demarrer() {
    const p = S.projet;
    const r = document.documentElement.style;
    if (p.accent) r.setProperty('--accent', p.accent);
    if (p.accentFonce) r.setProperty('--accent-fonce', p.accentFonce);
    if (p.accentClair) r.setProperty('--accent-clair', p.accentClair);
    document.querySelector('.pb-titre').innerHTML = `${ech(p.titre)} <span>· Professeur</span>`;
    document.querySelector('.pb-logo').innerHTML = pic(p.picto);
    ecranAccueil();
  }

  S.prof = { etat, relire };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})(window);
