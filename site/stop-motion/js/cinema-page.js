// La séance cinéma au vidéoprojecteur (séance 5), pilotée par le professeur (plan : docs/PLAN-stop-motion.md §5).
//   1. les films : lus dans le dossier Stop-motion (chaque équipe : son film, son titre, sa vitesse), ou 2 films d'exemple ;
//   2. le programme : le professeur enlève les films qui ne passent pas aujourd'hui ;
//   3. la projection en grand : carte-titre, images, « Un film de … », puis « Applaudissements ! » et le film suivant ;
//      Pause, Recommencer, Précédent, Suivant, vitesse (pour ce film) ; clavier : Espace, ←, →, R ;
//   4. « Bravo à tous les réalisateurs ! » avec tous les titres.
// Rien n'est écrit : la page lit seulement les dossiers des équipes.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const F = S.fichiers;
  const P = () => S.donneesProjet || {};
  const R = () => Object.assign({}, S.REGLAGES_FILM, P().film || {});
  const ech = S.echapper;
  const pic = (n) => S.picto(n);
  const racine = document.getElementById('app');
  const ENTRACTE = 5; // secondes entre deux films
  const VITESSES = [
    { id: 'lent', nom: 'Lent', picto: 'vitesse-1' },
    { id: 'normal', nom: 'Normal', picto: 'vitesse-2' },
    { id: 'rapide', nom: 'Rapide', picto: 'vitesse-3' },
  ];

  // films : [{ id, eleves, film, url(fichier) → Promise<adresse>, auProgramme }]
  const etat = { films: [], demo: false, courant: 0, vitesse: null };
  let actions = {};
  let nettoyage = null;
  let lecteur = null;

  const programme = () => etat.films.filter((f) => f.auProgramme);
  const nbImages = (f) => S.imagesVisibles(f.film).length;
  const titreDe = (f) => f.film.titre || 'Mon film';
  const plansDe = (f, vitesse) => S.sequenceFilm(f.film, { eleves: f.eleves, vitesse: vitesse || f.film.vitesse }, R());

  function afficher(nom, html, acts, apres) {
    if (nettoyage) nettoyage();
    nettoyage = null;
    if (lecteur) lecteur.detruire();
    lecteur = null;
    racine.innerHTML = `<div class="ecran" data-ecran="${nom}">${html}</div>`;
    actions = acts || {};
    if (apres) apres();
  }
  racine.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const f = actions[b.dataset.action];
    if (f) f(b, e);
  });

  function message(texte) {
    const m = document.createElement('div');
    m.className = 'message-bref';
    m.setAttribute('role', 'status');
    m.textContent = texte;
    document.body.append(m);
    setTimeout(() => m.remove(), 4000);
  }

  // ---------- 1. Accueil ----------

  function ecranAccueil() {
    afficher(
      'accueil',
      `<div class="accueil-titre">
        <div class="logo-projet">${S.picto('film', 80)}</div>
        <div><div class="sur-titre">${ech(S.projet.titre)} · professeur</div><h1 class="grand-titre">Séance cinéma</h1></div>
      </div>
      <div class="milieu">
        <button type="button" class="choix" data-action="ouvrir"><span class="rond plein">${pic('dossier')}</span>Ouvrir le dossier ${ech((S.reglages.cheminProjet || ['Stop-motion']).slice(-1)[0])}</button>
        <button type="button" class="choix" data-action="demo"><span class="rond">${pic('lecture')}</span>Essayer avec 2 films d’exemple</button>
      </div>
      <div class="bas"><span class="gauche consigne-detail">Les films sont lus dans les dossiers des équipes. Rien n’est écrit.</span></div>`,
      { ouvrir: ouvrirDossier, demo: chargerDemo }
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
    const equipes = await F.equipesDans(d);
    etat.films = equipes
      .map((e) => {
        const urls = new Map();
        return {
          id: e.dossier.name,
          eleves: e.donnees.equipe.eleves,
          film: S.filmDe(e.donnees),
          url: async (fichier) => {
            if (!urls.has(fichier)) {
              const b = await F.lirePhoto(e.dossier, fichier);
              urls.set(fichier, b ? URL.createObjectURL(b) : null);
            }
            return urls.get(fichier);
          },
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
    for (const f of etat.films) f.auProgramme = nbImages(f) > 0;
    etat.demo = false;
    if (!etat.films.length) return message('Aucune équipe dans ce dossier.');
    ecranProgramme();
  }

  // Deux petits films dessinés à la volée (une brique qui avance, un soleil qui se lève) : pour essayer sans dossier.
  async function chargerDemo() {
    const dessiner = (n, fond, dessin) =>
      Promise.all(
        Array.from({ length: n }, (_, i) => {
          const c = document.createElement('canvas');
          c.width = 640;
          c.height = 360;
          const g = c.getContext('2d');
          g.fillStyle = fond;
          g.fillRect(0, 0, 640, 360);
          g.fillStyle = '#4ADE80';
          g.fillRect(0, 290, 640, 70);
          dessin(g, i / (n - 1));
          return new Promise((ok) => c.toBlob((b) => ok(URL.createObjectURL(b)), 'image/jpeg', 0.8));
        })
      );
    const brique = (g, x, y, coul) => {
      g.fillStyle = coul;
      g.fillRect(x, y, 120, 50);
      g.fillRect(x + 15, y - 14, 26, 14);
      g.fillRect(x + 79, y - 14, 26, 14);
    };
    const a = await dessiner(30, '#93C5FD', (g, t) => brique(g, 20 + t * 480, 240, '#E8590C'));
    const b = await dessiner(24, '#1E3A8A', (g, t) => {
      g.fillStyle = '#FACC15';
      g.beginPath();
      g.arc(320, 300 - t * 200, 50, 0, 7);
      g.fill();
      brique(g, 260, 240, '#2563EB');
    });
    const film = (urls, titre, vitesse) => ({
      film: { titre, vitesse, images: urls.map((_, i) => ({ fichier: `photos/film/${String(i + 1).padStart(4, '0')}.jpg` })) },
      url: async (f) => urls[Number(f.match(/(\d+)\.jpg$/)[1]) - 1],
    });
    etat.films = [
      Object.assign({ id: 'Exemple_1', eleves: ['Léa', 'Tom'], auProgramme: true }, film(a, 'La course folle', 'normal')),
      Object.assign({ id: 'Exemple_2', eleves: ['Inès', 'Noah'], auProgramme: true }, film(b, 'Le soleil se lève', 'lent')),
      { id: 'Exemple_3', eleves: ['Jade', 'Sami'], film: S.filmVide(), url: async () => null, auProgramme: false },
    ];
    etat.demo = true;
    ecranProgramme();
  }

  // ---------- 2. Le programme ----------

  function ecranProgramme() {
    const n = programme().length;
    afficher(
      'programme',
      `<div class="haut"><h1 class="titre-ecran">Le programme</h1>${etat.demo ? '<span class="pastille">Films d’exemple</span>' : ''}<div class="espace"></div>
        <span class="compte">${n} film${n > 1 ? 's' : ''} au programme</span></div>
      <div class="milieu"><div class="grille-programme">${etat.films
        .map((f, i) => {
          const k = nbImages(f);
          const duree = Math.round(S.dureeSequence(plansDe(f)));
          return `<button type="button" class="carte-programme" data-action="basculer" data-i="${i}" aria-pressed="${!!f.auProgramme}"${k ? '' : ' disabled'}>
            <span class="coche-programme">${pic('coche')}</span>
            <strong>${ech(k ? titreDe(f) : 'Pas encore de film')}</strong>
            <span>${ech(S.nomsGenerique(f.eleves))}</span>
            <small>${k ? `${k} images · ${duree} s` : 'Aucune image'}</small>
          </button>`;
        })
        .join('')}</div></div>
      <div class="bas"><button type="button" class="btn btn-second gauche" data-action="accueil">${pic('retour')}Retour</button>
        <button type="button" class="btn btn-principal" data-action="lancer"${n ? '' : ' disabled'}>${pic('lecture')}On lance la séance</button></div>`,
      {
        accueil: ecranAccueil,
        basculer: (b) => {
          const f = etat.films[Number(b.dataset.i)];
          f.auProgramme = !f.auProgramme;
          ecranProgramme();
        },
        lancer: () => {
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
          etat.courant = 0;
          projeter();
        },
      }
    );
  }

  // ---------- 3. La projection ----------

  function projeter() {
    const liste = programme();
    const f = liste[etat.courant];
    if (!f) return ecranFin();
    etat.vitesse = null;
    let entracte = null;
    const vitesse = () => etat.vitesse || f.film.vitesse || 'normal';
    const majLecture = () => {
      const b = racine.querySelector('[data-action="lecture"]');
      if (b) b.innerHTML = lecteur && lecteur.enCours() ? `${pic('stop')}Pause` : `${pic('lecture')}Lecture`;
    };
    const finFilm = () => {
      majLecture();
      const dernier = etat.courant >= liste.length - 1;
      const voile = racine.querySelector('.entracte');
      voile.hidden = false;
      let reste = ENTRACTE;
      const dire = () => (voile.querySelector('small').textContent = dernier ? 'C’était le dernier film.' : `Film suivant dans ${reste} s`);
      dire();
      entracte = setInterval(() => {
        reste--;
        if (reste <= 0) {
          clearInterval(entracte);
          if (dernier) ecranFin();
          else suivant();
        } else dire();
      }, 1000);
    };
    const arreterEntracte = () => {
      clearInterval(entracte);
      const voile = racine.querySelector('.entracte');
      if (voile) voile.hidden = true;
    };
    const suivant = () => {
      etat.courant++;
      projeter();
    };
    const precedent = () => {
      if (etat.courant > 0) etat.courant--;
      projeter();
    };
    const basculer = () => {
      arreterEntracte();
      lecteur.basculer();
      majLecture();
    };
    const recommencer = () => {
      arreterEntracte();
      lecteur.recommencer().then(majLecture);
      majLecture();
    };
    function touche(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) basculer();
      } else if (e.key === 'ArrowRight') suivant();
      else if (e.key === 'ArrowLeft') precedent();
      else if (e.key === 'r' || e.key === 'R') recommencer();
    }
    afficher(
      'projection',
      `<div class="salle">
        <div class="toile" data-lecteur></div>
        <div class="entracte" hidden><span>${pic('visage-oui')}</span><strong>Applaudissements !</strong><small></small></div>
      </div>
      <div class="pupitre">
        <span class="numero-film">Film ${etat.courant + 1} sur ${liste.length}</span>
        <button type="button" class="btn btn-second btn-petit" data-action="precedent"${etat.courant ? '' : ' disabled'}>${pic('retour')}Précédent</button>
        <button type="button" class="btn btn-second btn-petit" data-action="lecture">${pic('stop')}Pause</button>
        <button type="button" class="btn btn-second btn-petit" data-action="recommencer">${pic('remonter')}Recommencer</button>
        <span class="vitesses-pupitre" role="group" aria-label="Vitesse de ce film">${VITESSES.map(
          (v) => `<button type="button" class="btn btn-second btn-petit" data-action="vitesse" data-v="${v.id}" aria-pressed="${vitesse() === v.id}">${pic(v.picto)}${v.nom}</button>`
        ).join('')}</span>
        <button type="button" class="btn btn-second btn-petit" data-action="suivant">${etat.courant >= liste.length - 1 ? 'Fin' : 'Suivant'}${pic('suivant')}</button>
        <button type="button" class="btn btn-second btn-petit" data-action="programme">Programme</button>
      </div>`,
      {
        precedent,
        suivant,
        lecture: basculer,
        recommencer,
        programme: () => {
          if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
          ecranProgramme();
        },
        vitesse: (b) => {
          etat.vitesse = b.dataset.v;
          for (const x of racine.querySelectorAll('[data-action="vitesse"]')) x.setAttribute('aria-pressed', String(x === b));
          lecteur.changerPlans(plansDe(f, vitesse()));
        },
      },
      () => {
        lecteur = S.creerLecteur(racine.querySelector('[data-lecteur]'), { plans: plansDe(f, vitesse()), url: f.url, fin: finFilm });
        lecteur.jouer().then(majLecture);
        document.addEventListener('keydown', touche);
        nettoyage = () => {
          clearInterval(entracte);
          document.removeEventListener('keydown', touche);
        };
      }
    );
  }

  // ---------- 4. Bravo à tous ----------

  function ecranFin() {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    const liste = programme();
    afficher(
      'fin',
      `<div class="haut"><h1 class="titre-ecran">Bravo à tous les réalisateurs !</h1></div>
      <div class="milieu"><ol class="palmares">${liste
        .map((f) => `<li><strong>${ech(titreDe(f))}</strong><span>Un film de ${ech(S.nomsGenerique(f.eleves))}</span></li>`)
        .join('')}</ol></div>
      <div class="bas"><button type="button" class="btn btn-second gauche" data-action="programme">${pic('retour')}Le programme</button>
        <button type="button" class="btn btn-principal" data-action="revoir">${pic('lecture')}Tout revoir</button></div>`,
      {
        programme: ecranProgramme,
        revoir: () => {
          etat.courant = 0;
          projeter();
        },
      }
    );
  }

  S.cinema = { etat, ecranAccueil };
  const demarrer = () => {
    const p = S.projet;
    const r = document.documentElement.style;
    if (p.accent) r.setProperty('--accent', p.accent);
    if (p.accentFonce) r.setProperty('--accent-fonce', p.accentFonce);
    if (p.accentClair) r.setProperty('--accent-clair', p.accentClair);
    ecranAccueil();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})(window);
