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
    filtre: 'toutes',
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
    const p = S.projet;
    afficher(
      `<section class="pa">
        <div class="pa-hero">
          <span class="pa-logo">${pic(p.picto)}</span>
          <div><p class="pa-sur">Outil professeur · ${ech(p.niveau || '6e SEGPA')}</p><h2>${ech(p.titre)}</h2>
            <p class="pa-intro">Suivez les équipes en direct pendant la séance, répondez aux demandes d’aide, puis évaluez.</p></div>
        </div>
        ${S.fichiers.accesDossiers ? '' : '<p class="pa-alerte">Ce navigateur ne peut pas ouvrir un dossier : utilisez Chrome ou Edge pour le suivi en direct, ou importez les fichiers .json.</p>'}
        <div class="pa-cartes">
          ${S.fichiers.accesDossiers ? `<button type="button" class="pa-carte principale" data-action="ouvrir"><span class="pa-icone">${pic('dossier')}</span><strong>Ouvrir le dossier de la classe</strong><span>Suivi en direct : relu toutes les 20 secondes, alerte quand une équipe demande de l’aide.</span></button>` : ''}
          ${dernier ? `<button type="button" class="pa-carte" data-action="reprendre"><span class="pa-icone">${pic('remonter')}</span><strong>Reprendre : ${ech(dernier.name)}</strong><span>Le dernier dossier suivi sur ce poste.</span></button>` : ''}
          <label class="pa-carte"><span class="pa-icone">${pic('continuer')}</span><strong>Importer des fichiers .json</strong><span>Sans suivi en direct ni photos (ex. : fichiers rapportés sur une clé).</span><input type="file" accept=".json,application/json" multiple hidden data-change="importer"></label>
        </div>
        <p class="pa-message" role="alert" hidden></p>
        <div class="pa-chemin"><span>Le dossier à ouvrir</span><p class="pa-fil">${chemin.map((c, i) => `<span${i === chemin.length - 1 ? ' class="cible"' : ''}>${ech(c)}</span>`).join('<i aria-hidden="true">›</i>')}</p>
          <small>Il contient un dossier par équipe (Prénom_Prénom).</small></div>
        <ul class="pa-notes">
          <li>${pic('coche')}Les fichiers sont lus dans ce navigateur : rien n’est envoyé ailleurs.</li>
          <li>${pic('coche')}Vos notes (aides vues, évaluation, différenciation) sont écrites dans <code>professeur.json</code>, dans le dossier du projet.</li>
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

  // Une équipe : prénoms, activité, frise des séances, dernière photo, lignes du projet, alertes, aides prévues.
  function tuile(eq) {
    const r = eq.resume;
    const aide = eq.alertes.find((a) => a.sorte === 'aide');
    const autres = eq.alertes.filter((a) => a.sorte !== 'aide');
    const drapeaux = (etat.professeur.drapeaux[eq.nom] || []).map((id) => (P().drapeaux.find((d) => d.id === id) || { texte: id }).texte);
    const actif = r.minutes !== null && r.minutes < 5;
    return `<button type="button" class="pt${aide ? ' pt-aide' : autres.length ? ' pt-alerte' : ''}" data-action="equipe" data-cle="${ech(eq.cle)}">
      <span class="pt-haut">
        <span class="pt-nom"><strong>${ech(r.noms)}</strong><span class="pt-temps"><i class="pt-point${actif ? ' actif' : ''}"></i>${actif ? 'Active · ' : ''}${ilYa(r.minutes)}</span></span>
        ${aide ? `<span class="pt-badge aide">${pic('aide')}Aide</span>` : ''}
        <span class="pt-photo">${r.dernierePhoto && eq.dossier ? `<img data-photo="${ech(r.dernierePhoto.fichier)}" alt="${ech(r.dernierePhoto.legende)}">` : pic('photo')}</span>
      </span>
      ${frise(r)}
      <span class="pt-infos">${eq.lignes.map((l) => `<span class="pt-ligne">${ech(l)}</span>`).join('') || '<span class="pt-ligne pt-rien">Pas encore commencé</span>'}</span>
      ${autres.length || drapeaux.length ? `<span class="pt-alertes">${autres.map((a) => `<span class="pt-badge ambre">${pic('question')}${ech(a.texte)}</span>`).join('')}${drapeaux.map((t) => `<span class="pt-badge drapeau">${pic('etiquette')}${ech(t)}</span>`).join('')}</span>` : ''}
    </button>`;
  }

  // La frise des séances : un segment par séance (✓ faite · ● en cours · ○ à faire), jamais la couleur seule.
  const frise = (r) =>
    `<span class="pt-frise" style="--n:${r.seances.length}">${r.seances
      .map((x, i) => `<span class="${CLASSE_ETAT[x.etat][0]}" title="Séance ${i + 1} · ${ech(x.titre)}">${CLASSE_ETAT[x.etat][1]} S${i + 1}</span>`)
      .join('')}</span>`;

  const aRegarder = (eq) => eq.alertes.length > 0;

  function ecranClasse() {
    etat.vue = 'classe';
    const liste = S.trier(etat.equipes);
    const aides = liste.filter((eq) => eq.alertes.some((a) => a.sorte === 'aide'));
    const n = etat.equipes.length;
    const nbSeance = (id, e) => etat.equipes.filter((eq) => eq.resume.seances.find((s) => s.id === id).etat === e).length;
    // Filtres : toutes · à regarder (aide ou alerte) · en séance N (la séance où en est l'équipe).
    const filtres = [{ id: 'toutes', texte: 'Toutes', garde: () => true }, { id: 'regarder', texte: 'À regarder', garde: aRegarder }].concat(
      S.etapes.seances.map((s, i) => ({ id: s.id, texte: `En séance ${i + 1}`, garde: (eq) => eq.resume.courante === s.id && eq.resume.seances[i].etat !== 'fait' }))
    );
    const filtresVus = filtres.filter((f) => f.id === 'toutes' || f.id === etat.filtre || liste.some(f.garde));
    const filtre = filtres.find((f) => f.id === etat.filtre) || filtres[0];
    const montrees = liste.filter(filtre.garde);
    const regarder = liste.filter(aRegarder).length;
    afficher(
      `<section class="pc">
        ${
          aides.length
            ? `<div class="pc-aides" role="alert">${aides
                .map((eq) => `<div class="pc-aide">${pic('aide')}<strong>${ech(eq.resume.noms)}</strong><span>${ech(eq.alertes.find((a) => a.sorte === 'aide').texte)}${eq.resume.aide.seance ? ` · ${ech(etapeLisible(eq.resume.aide))}` : ''}</span><button type="button" class="pb-btn" data-action="vu" data-cle="${ech(eq.cle)}"${etat.dossier ? '' : ' disabled'}>J’y vais</button></div>`)
                .join('')}</div>`
            : ''
        }
        <div class="pc-tableau">
          <div class="pc-kpis">
            <div class="pc-kpi"><b>${n}</b><span>équipe${n > 1 ? 's' : ''}</span></div>
            <div class="pc-kpi${aides.length ? ' aide' : ''}"><b>${aides.length}</b><span>aide${aides.length > 1 ? 's' : ''} en cours</span></div>
            <div class="pc-kpi${regarder ? ' ambre' : ''}"><b>${regarder}</b><span>à regarder</span></div>
          </div>
          <div class="pc-avancement" aria-label="Avancement de la classe">${S.etapes.seances
            .map((s, i) => {
              const f = nbSeance(s.id, 'fait');
              const c = nbSeance(s.id, 'en_cours');
              return `<div class="pc-seance"><span class="pc-seance-nom"><b>S${i + 1}</b> ${ech(s.titre)}</span>
                <span class="pc-barre" role="img" aria-label="${f} finies, ${c} en cours sur ${n}"><i class="fait" style="width:${n ? (f / n) * 100 : 0}%"></i><i class="en-cours" style="width:${n ? (c / n) * 100 : 0}%"></i></span>
                <span class="pc-seance-compte">${f} / ${n}${c ? ` <small>· ${c} en cours</small>` : ''}</span></div>`;
            })
            .join('')}</div>
        </div>
        <div class="pc-outils">
          ${P().bandeauClasse ? P().bandeauClasse(etat.equipes) : ''}
          ${S.criteres ? `<div class="pc-exports"><span>Évaluation</span><button type="button" class="pb-btn" data-action="excel">Excel</button><button type="button" class="pb-btn" data-action="csv">CSV</button><button type="button" class="pb-btn" data-action="carnet" title="Niveaux 1 à 4 par critère, à importer dans le Carnet de classe">Carnet de classe</button><button type="button" class="pb-btn" data-action="ceintures">Feuilles ceinture</button>${etat.dossier ? '' : '<span class="pc-attention">Fichiers importés : l’évaluation n’est pas enregistrée, pensez à exporter.</span>'}</div>` : ''}
        </div>
        <div class="pc-filtres" role="toolbar" aria-label="Filtrer les équipes">${filtresVus
          .map((f) => `<button type="button" class="pc-filtre" data-action="filtre" data-f="${f.id}" aria-pressed="${f.id === filtre.id}">${ech(f.texte)} <b>${liste.filter(f.garde).length}</b></button>`)
          .join('')}</div>
        <div class="pc-tuiles">${montrees.map(tuile).join('') || `<p class="pc-vide">${liste.length ? 'Aucune équipe dans ce filtre.' : 'Aucune équipe pour l’instant : elles apparaissent dès qu’elles commencent.'}</p>`}</div>
        ${etat.invalides.length ? `<details class="pc-invalides"><summary>${etat.invalides.length} fichier(s) non lu(s)</summary><ul>${etat.invalides.map((x) => `<li>${ech(x.nom)} : ${ech(x.raison)}</li>`).join('')}</ul></details>` : ''}
      </section>`,
      {
        equipe: (b) => {
          etat.courante = b.dataset.cle;
          etat.onglet = 'bilan';
          ecranEquipe();
        },
        excel: () => telecharger(S.classeurEvaluation(lignesEval(), S.criteres), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', nomExport('evaluation.xlsx')),
        csv: () => telecharger(S.csvClasse(lignesEval(), S.criteres), 'text/csv;charset=utf-8', nomExport('evaluation.csv')),
        carnet: () => {
          const r = S.resultatsCarnet(lignesEval(), S.criteres, { id: S.projet.id, titre: S.projet.titre });
          telecharger(JSON.stringify(r, null, 2) + '\n', 'application/json', nomExport('labo-resultats.json'));
          alert('Fichier pour le Carnet de classe enregistré dans Téléchargements.\n\nDans le projet du Carnet, créez d’abord les 7 critères avec les mêmes libellés.\nLe Carnet recalcule sa propre note (moyenne des niveaux × 5) : elle peut différer de la note de l’Excel, qui reste la note de référence.');
        },
        ceintures: () => ecranCeintures(),
        filtre: (b) => {
          etat.filtre = b.dataset.f;
          ecranClasse();
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
    const ligne = (ok, texte, plus) => `<li class="${ok === true ? 'ok' : ok === 'passe' ? 'passe' : ''}"><span class="pe-coche">${ok === true ? '✓' : ok === 'passe' ? '⚠' : '○'}</span><span>${texte}${plus || ''}</span></li>`;
    const cartes = S.etapes.seances
      .map((s, i) => {
        const r = eq.resume.seances[i];
        const details = s.etapes
          .map((e) => {
            const x = S.etatEtape(d, s.id, e.id);
            const fait = !!(x && x.fait);
            if (e.type === 'cases') return ligne(fait, ech(e.texte), `<span class="pe-sous">${(e.lignes || []).map((l, j) => `<span>${x && Array.isArray(x.valeur) && x.valeur[j] ? '✓' : '○'} ${ech(l.texte)}</span>`).join('')}</span>`);
            if (e.type === 'bilan') return ligne(fait, 'Bilan', `<span class="pe-sous">${(e.phrases || []).map((ph, j) => `<span>${ech(ph)} → <b>${x && Array.isArray(x.valeur) && Number.isInteger(x.valeur[j]) ? MOTS_BILAN[x.valeur[j]] : '—'}</b></span>`).join('')}</span>`);
            if (e.type === 'photo') return ligne(fait ? true : x && x.passe ? 'passe' : false, `${x && x.passe && !fait ? 'Laissée pour plus tard : ' : ''}${ech(e.texte)}`);
            return '';
          })
          .join('');
        const part = r.avancement.total ? Math.round((r.avancement.faites / r.avancement.total) * 100) : 0;
        return `<section class="pp-bloc pe-seance ${CLASSE_ETAT[r.etat][0]}"><h3><span class="pe-numero">S${i + 1}</span>${ech(s.titre)} <span class="pe-etat ${CLASSE_ETAT[r.etat][0]}">${CLASSE_ETAT[r.etat][1]} ${r.avancement.faites} / ${r.avancement.total} écrans</span></h3>
          <span class="pe-barre"><i style="width:${part}%"></i></span>${details ? `<ul class="pe-liste">${details}</ul>` : ''}</section>`;
      })
      .join('');
    return `<div class="pe-grille">${cartes}<section class="pp-bloc"><h3>Aide</h3><p>${d.aides.length} demande${d.aides.length > 1 ? 's' : ''} d’aide${d.aides.length ? ' — voir l’onglet Historique' : ''}.</p></section></div>`;
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
    return `<div><button type="button" class="pb-btn" data-action="imprimer-album">Imprimer l’album (A4, 6 photos par page)</button></div>` + parSeance.join('');
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
    const onglets = [{ id: 'bilan', titre: 'Bilan' }, ...(S.criteres ? [{ id: 'evaluation', titre: 'Évaluation' }] : []), { id: 'album', titre: 'Album' }, ...P().onglets, { id: 'historique', titre: 'Historique' }, { id: 'differenciation', titre: 'Différenciation' }];
    const o = onglets.find((x) => x.id === etat.onglet) || onglets[0];
    let contenu;
    if (o.id === 'bilan') contenu = ongletBilan(eq);
    else if (o.id === 'evaluation') contenu = ongletEvaluation(eq);
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
          <span class="pe-info">${eq.donnees.equipe.classe ? ech(eq.donnees.equipe.classe) + ' · ' : ''}équipe ${i + 1} sur ${liste.length} · dernière activité ${ilYa(eq.resume.minutes)} · ← → pour changer, Échap pour revenir${eq.autres.length ? ` · ⚠ autres fichiers ignorés : ${ech(eq.autres.join(', '))}` : ''}</span>
        </div>
        <div class="pe-resume">
          <span class="pt-photo">${eq.resume.dernierePhoto && eq.dossier ? `<img data-photo="${ech(eq.resume.dernierePhoto.fichier)}" alt="${ech(eq.resume.dernierePhoto.legende)}">` : pic('photo')}</span>
          <div class="pe-resume-infos">${frise(eq.resume)}
            <div class="pe-lignes">${eq.lignes.map((l) => `<span>${ech(l)}</span>`).join('') || '<span class="pt-rien">Pas encore commencé</span>'}</div>
            ${eq.alertes.length ? `<div class="pe-alertes">${eq.alertes.map((a) => `<span class="pt-badge ${a.sorte === 'aide' ? 'aide' : 'ambre'}">${pic(a.sorte === 'aide' ? 'aide' : 'question')}${ech(a.texte)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        <nav class="pe-onglets" role="tablist">${onglets.map((x) => `<button type="button" role="tab" aria-selected="${x.id === o.id}" data-action="onglet" data-id="${x.id}">${ech(x.titre)}${x.id === 'album' && eq.resume.nbPhotos ? ` <small>${eq.resume.nbPhotos}</small>` : ''}</button>`).join('')}</nav>
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
        niveau: async (b) => {
          const eleves = eq.donnees.equipe.eleves;
          const actuel = S.evaluationEquipe(etat.professeur, eq.nom, eleves).eleves[b.dataset.eleve].niveaux[b.dataset.critere];
          const n = Number(b.dataset.n);
          S.poserNiveau(etat.professeur, eq.nom, eleves, b.dataset.eleve, b.dataset.critere, actuel === n ? null : n);
          await ecrireProfesseur();
          ecranEquipe();
        },
        lie: async (c) => {
          S.evaluationEquipe(etat.professeur, eq.nom, eq.donnees.equipe.eleves).lie = c.checked;
          await ecrireProfesseur();
          ecranEquipe();
        },
        commentaire: async (t) => {
          const e = S.evaluationEquipe(etat.professeur, eq.nom, eq.donnees.equipe.eleves);
          for (const p of e.lie ? eq.donnees.equipe.eleves : [t.dataset.eleve]) e.eleves[p].commentaire = t.value.trim();
          await ecrireProfesseur();
        },
        'imprimer-album': () => ecranAlbumImprime(eq),
        drapeau: async (c) => {
          const set = new Set(etat.professeur.drapeaux[eq.nom] || []);
          if (c.checked) set.add(c.value);
          else set.delete(c.value);
          etat.professeur.drapeaux[eq.nom] = [...set];
          if (!(await ecrireProfesseur())) c.checked = !c.checked;
        },
      },
      () => chargerPhotos()
    );
  }

  // ---------- Évaluation ----------

  const lignesEval = () => S.lignesEleves(etat.professeur, S.trier(etat.equipes), S.criteres);
  const caseNiveau = (v) => (Number.isInteger(v) ? `<span class="niv niv-${v}">${S.NIVEAUX[v].symbole} ${S.NIVEAUX[v].lettre}</span>` : '<span class="niv niv-vide">—</span>');

  function ongletEvaluation(eq) {
    const def = S.criteres;
    const eleves = eq.donnees.equipe.eleves;
    const e = S.evaluationEquipe(etat.professeur, eq.nom, eleves);
    const repere = P().repere || (() => '');
    const lignes = def.criteres
      .map(
        (c) => `<tr><th scope="row"><span class="ev-seance">${ech(c.seance || '—')}</span> ${ech(c.libelle)}<small>${ech(c.competence)}</small></th>
          ${eleves
            .map(
              (p) => `<td><div class="ev-niveaux" role="group" aria-label="${ech(c.libelle)} — ${ech(p)}">${S.NIVEAUX.map(
                (n) => `<button type="button" class="niv-btn niv-${n.valeur}" data-action="niveau" data-eleve="${ech(p)}" data-critere="${ech(c.id)}" data-n="${n.valeur}" aria-pressed="${e.eleves[p].niveaux[c.id] === n.valeur}" title="${ech(n.nom)}">${n.symbole} ${n.lettre}</button>`
              ).join('')}</div></td>`
            )
            .join('')}
          <td class="ev-repere">${ech(repere(c.repere, eq.donnees))}</td></tr>`
      )
      .join('');
    const bilans = eleves
      .map((p) => {
        const r = S.noter(e.eleves[p].niveaux, def.criteres);
        const ce = S.ceinture(e.eleves[p].niveaux, def);
        return `<div class="ev-bilan"><strong>${ech(p)}</strong>
          <span>Score : <b>${r.score === null ? '—' : r.score}</b> / ${r.max}</span>
          <span>Note : <b>${r.note === null ? '—' : String(r.note).replace('.', ',')}</b> / 20${r.note !== null && !r.complet ? ` <small>(${r.evalues} critères sur ${def.criteres.length})</small>` : ''}</span>
          <span>${ech(r.appreciation || '—')}</span>
          <span>${ce ? `${ceintureSvg(ce.niveau, 22)} ${ech(ce.nom)}` : 'Ceinture : —'}</span>
          <label>Commentaire${e.lie && eleves.length > 1 ? ' (binôme)' : ''}<textarea data-change="commentaire" data-eleve="${ech(p)}" rows="2">${ech(e.eleves[p].commentaire || '')}</textarea></label></div>`;
      })
      .join('');
    return `<section class="pp-bloc">
        <div class="ev-tete">${eleves.length > 1 ? `<label class="ev-lie"><input type="checkbox" data-change="lie"${e.lie ? ' checked' : ''}> Même niveau pour tout le binôme</label>` : ''}
          <span class="ev-legende">${S.NIVEAUX.map((n) => `${caseNiveau(n.valeur)} ${ech(n.nom)}`).join(' ')}</span></div>
        <table class="pp-table ev-table"><thead><tr><th>Critère · compétence</th>${eleves.map((p) => `<th>${ech(p)}</th>`).join('')}<th>Repères (observations, pas une note)</th></tr></thead><tbody>${lignes}</tbody></table>
      </section>
      <section class="pp-bloc ev-bilans">${bilans}</section>
      <p class="pp-vide">La note /20 n’est visible que dans l’outil professeur et les exports. Les élèves ne voient que leur ceinture (feuilles ceinture).${etat.dossier ? '' : ' Fichiers importés : rien n’est enregistré, pensez à exporter.'}</p>`;
  }

  // Ceinture en noir et blanc : motif + lettre (jamais la couleur seule). blanche · jaune (points) · verte (hachures) · vert foncé (plein).
  function ceintureSvg(niveau, taille) {
    const motifs = ['none', 'url(#c-points)', 'url(#c-hachures)', '#222'];
    const lettres = ['B', 'J', 'V', 'VF'];
    const h = taille || 40;
    return `<svg class="ceinture" viewBox="0 0 120 40" width="${h * 3}" height="${h}" role="img" aria-label="${ech(S.criteres.ceintures[niveau])}">
      <defs><pattern id="c-points" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#222"/></pattern>
        <pattern id="c-hachures" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#222" stroke-width="2.2"/></pattern></defs>
      <rect x="2" y="12" width="116" height="16" rx="3" fill="${motifs[niveau] === 'none' ? '#fff' : motifs[niveau]}" stroke="#222" stroke-width="2"/>
      <rect x="48" y="6" width="24" height="28" rx="3" fill="#fff" stroke="#222" stroke-width="2"/>
      <text x="60" y="25.5" text-anchor="middle" font-size="13" font-weight="700" font-family="Lexend, sans-serif">${lettres[niveau]}</text></svg>`;
  }

  function telecharger(contenu, type, nom) {
    const url = URL.createObjectURL(new Blob([contenu], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  function nomExport(fin) {
    const classe = etat.equipes.map((x) => x.donnees.equipe.classe).find(Boolean) || 'classe';
    return `${S.projet.id}-${classe}-${new Date().toISOString().slice(0, 10)}-${fin}`;
  }

  // Feuilles « ceinture » à imprimer (noir et blanc), une carte par élève : ceinture, auto-évaluation (smileys).
  // La note n'y figure que si le professeur coche « Afficher la note chiffrée ».
  function ecranCeintures(avecNote) {
    etat.vue = 'impression';
    const lignes = lignesEval();
    const bilan = (eqNom) => {
      const eq = etat.equipes.find((x) => x.nom === eqNom);
      const etape = S.etapes.seances.flatMap((s) => s.etapes.map((e) => Object.assign({ seance: s.id }, e))).find((e) => e.type === 'bilan');
      const v = etape && eq ? S.valeurEtape(eq.donnees, etape.seance, etape.id) : null;
      return etape ? etape.phrases.map((ph, i) => `<li>${ech(ph)} <b>${Array.isArray(v) && Number.isInteger(v[i]) ? ['😀 Oui', '😐 Un peu', '😕 Pas encore'][v[i]] : '—'}</b></li>`).join('') : '';
    };
    afficher(
      `<section class="impression">
        <div class="impression-outils"><button type="button" class="pb-btn" data-action="classe">${pic('retour')}Classe</button>
          <label><input type="checkbox" data-change="avec-note"${avecNote ? ' checked' : ''}> Afficher la note chiffrée</label>
          <button type="button" class="pb-btn" data-action="imprimer">Imprimer</button></div>
        <div class="feuilles">${lignes
          .map(
            (l) => `<article class="feuille-ceinture"><header><strong>${ech(l.eleve)}</strong><span>${ech(S.projet.titre)}${l.binome ? ` · avec ${ech(l.binome)}` : ''}</span></header>
              <div class="fc-ceinture">${l.ceinture ? `${ceintureSvg(l.ceinture.niveau, 48)}<b>${ech(l.ceinture.nom)}</b>` : '<b>Ceinture : pas encore</b>'}</div>
              <ul class="fc-bilan">${bilan(l.equipe)}</ul>
              ${avecNote && l.note !== null ? `<p class="fc-note">Note : ${String(l.note).replace('.', ',')} / 20 · ${ech(l.appreciation)}</p>` : ''}
              ${l.commentaire ? `<p class="fc-commentaire">${ech(l.commentaire)}</p>` : ''}</article>`
          )
          .join('')}</div></section>`,
      {
        classe: () => ecranClasse(),
        imprimer: () => print(),
        'avec-note': (c) => ecranCeintures(c.checked),
      }
    );
  }

  // Album imprimable d'une équipe : A4, 6 photos par page.
  async function ecranAlbumImprime(eq) {
    etat.vue = 'impression';
    const photos = eq.donnees.photos || [];
    const cartes = await Promise.all(photos.map(async (p) => {
      const u = await urlPhoto(eq, p.fichier);
      return `<figure>${u ? `<img src="${u}" alt="">` : '<span class="pp-sans">fichier absent</span>'}<figcaption>${ech(p.legende)}</figcaption></figure>`;
    }));
    const pages = [];
    for (let i = 0; i < cartes.length; i += 6) pages.push(cartes.slice(i, i + 6).join(''));
    afficher(
      `<section class="impression">
        <div class="impression-outils"><button type="button" class="pb-btn" data-action="retour">${pic('retour')}${ech(eq.resume.noms)}</button><button type="button" class="pb-btn" data-action="imprimer">Imprimer</button></div>
        ${pages.map((pg) => `<div class="page-album"><h2>${ech(eq.resume.noms)} · ${ech(S.projet.titre)}</h2><div class="album-a4">${pg}</div></div>`).join('') || '<p class="pp-vide">Pas de photo.</p>'}
      </section>`,
      { retour: () => ecranEquipe(), imprimer: () => print() }
    );
  }

  document.addEventListener('keydown', (e) => {
    if (etat.vue === 'impression' && e.key === 'Escape') return ecranClasse();
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
    document.querySelector('.pb-titre').innerHTML = `${ech(p.titre)} <span class="pb-role">Professeur</span>`;
    document.querySelector('.pb-logo').innerHTML = pic(p.picto);
    ecranAccueil();
  }

  S.prof = { etat, relire };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})(window);
