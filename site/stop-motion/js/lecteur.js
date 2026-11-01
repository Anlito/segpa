// Lecteur de film (séance 5 et séance cinéma) : la carte-titre, les images, puis le générique.
// Les plans viennent de Segpa.sequenceFilm (js/studio.js, testé) ; ici, seulement l'affichage et le temps.
//   const l = Segpa.creerLecteur(element, { plans, url: (fichier) => Promise<adresse>, fin: () => {}, boucle: false })
//   l.jouer() · l.pause() · l.basculer() · l.recommencer() · l.changerPlans(plans) · l.detruire() · l.enCours()
(function (global) {
  'use strict';

  const S = global.Segpa;
  const ech = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function creerLecteur(el, o) {
    let plans = o.plans || [];
    let i = 0;
    let minuteur = null;
    let joue = false;
    let pret = false;
    const urls = new Map();
    el.classList.add('lecteur');
    el.innerHTML = `<img class="lecteur-image" alt="" hidden>
      <div class="lecteur-carte" hidden><span class="lecteur-texte"></span></div>
      <div class="lecteur-attente">Je prépare le film…</div>`;
    const img = el.querySelector('.lecteur-image');
    const carte = el.querySelector('.lecteur-carte');
    const texte = el.querySelector('.lecteur-texte');
    const attente = el.querySelector('.lecteur-attente');

    // Toutes les images sont chargées avant de jouer : le film ne saccade pas.
    async function charger() {
      const fichiers = [...new Set(plans.filter((p) => p.type === 'image').map((p) => p.fichier))].filter((f) => !urls.has(f));
      await Promise.all(
        fichiers.map(async (f) => {
          const u = await o.url(f);
          urls.set(f, u || null);
          if (u) await new Promise((ok) => Object.assign(new Image(), { onload: ok, onerror: ok, src: u }));
        })
      );
      pret = true;
      attente.hidden = true;
      if (!joue) montrer();
    }
    const chargement = charger();

    function montrer() {
      const p = plans[i];
      if (!p) return;
      const image = p.type === 'image';
      img.hidden = !image;
      carte.hidden = image;
      if (image) {
        const u = urls.get(p.fichier);
        if (u) img.src = u;
      } else {
        carte.className = 'lecteur-carte ' + p.type;
        texte.innerHTML = ech(p.texte);
      }
      el.dataset.plan = p.type;
    }

    function avancer() {
      clearTimeout(minuteur);
      if (!joue) return;
      montrer();
      minuteur = setTimeout(() => {
        i++;
        if (i >= plans.length) {
          if (o.boucle) i = 0;
          else {
            i = plans.length - 1;
            joue = false;
            el.classList.remove('joue');
            if (o.fin) o.fin();
            return;
          }
        }
        avancer();
      }, plans[i].duree * 1000);
    }

    async function jouer() {
      if (joue) return;
      joue = true;
      el.classList.add('joue');
      if (i >= plans.length - 1) i = 0;
      if (!pret) await chargement;
      avancer();
    }

    function pause() {
      joue = false;
      el.classList.remove('joue');
      clearTimeout(minuteur);
    }

    return {
      jouer,
      pause,
      basculer: () => (joue ? pause() : jouer()),
      recommencer: () => {
        pause();
        i = 0;
        return jouer();
      },
      // Nouvelle vitesse : on garde l'image où l'on est.
      changerPlans: async (nouveaux) => {
        const fichier = plans[i] && plans[i].fichier;
        plans = nouveaux;
        const k = fichier ? plans.findIndex((p) => p.fichier === fichier) : -1;
        i = k >= 0 ? k : Math.min(i, plans.length - 1);
        await charger();
        if (joue) avancer();
        else montrer();
      },
      enCours: () => joue,
      pret: () => chargement,
      detruire: () => {
        pause();
        el.innerHTML = '';
      },
    };
  }

  S.creerLecteur = creerLecteur;
})(window);
