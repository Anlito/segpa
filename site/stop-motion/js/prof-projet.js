// Outil professeur : ce qui est propre au film en stop motion (plan : docs/PLAN-stop-motion.md §5).
//   tuile   : titre du film, l'histoire en résumé (début / milieu / fin), scénario (parties écrites) et l'avis du
//             professeur, plaque prise / rangée, images (gardées / 30), vitesse ;
//   alertes : pas encore d'image à mi-séance de tournage ; plaque prise mais rangement pas fait ;
//   bandeau : films prêts (30 images au moins), lien vers la séance cinéma ;
//   onglets : « Scénario » (les 7 réponses, le récap et l'avis du professeur : « Validé » ou « À revoir » et un petit
//             mot, vu par l'équipe à l'écran « Je relis mon histoire ») · « Film » (le film projeté, toutes les images).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const R = () => Object.assign({}, S.REGLAGES_FILM, (S.donneesProjet || {}).film || {});
  const ech = S.echapper;
  const fait = (d, s, e) => S.etapeFaite(d, s, e);
  const coche = (b) => (b ? '✓' : '○');
  const QUESTIONS = [
    ['heros', 'Héros'],
    ['lieu', 'Lieu'],
    ['action', 'Au début, le héros'],
    ['probleme', 'Problème'],
    ['solution', 'Solution'],
    ['fin', 'Fin'],
    ['objets', 'Objets à construire'],
  ];
  const nbParties = (d) => QUESTIONS.filter(([k]) => S.histoireDe(d)[k]).length;
  const NOMS_VITESSE = { lent: 'lent', normal: 'normal', rapide: 'rapide' };

  // Un début de phrase pour la tuile : « Un dragon, sur la Lune… ».
  const court = (t, n) => (t.length > n ? t.slice(0, n).replace(/[\s,.;:!?…]+\S*$/, '') + '…' : t);
  const TEXTES_AVIS = { 'a-donner': 'avis à donner', valide: 'validé ✓', revoir: 'à revoir', corrige: 'corrigé, à relire' };
  const avisDe = (notes) => (notes && notes.scenario) || null;
  const etatAvisDe = (d, notes) => S.etatAvis(d, avisDe(notes), fait(d, 's1', 'histoire'));

  function lignes(d, notes) {
    const l = [];
    const f = S.resumeFilm(d, R());
    if (f.titre) l.push(`« ${f.titre} »`);
    const ph = S.phrasesHistoire(S.histoireDe(d));
    const h = S.histoireDe(d);
    const histoire = [ph.debut, S.phrasesHistoire({ probleme: h.probleme }).milieu, ph.fin].filter(Boolean).map((t) => court(t, 24));
    if (histoire.length) l.push(`Histoire : ${histoire.join(' / ')}`);
    const n = nbParties(d);
    const ea = etatAvisDe(d, notes);
    if (n) l.push(`Scénario : ${n} / ${QUESTIONS.length}${fait(d, 's1', 'histoire') ? ' ✓' : ''}${ea ? ' · ' + TEXTES_AVIS[ea] : ''}`);
    if (fait(d, 's2', 'plaque')) l.push(`Plaque : prise ✓ · rangée ${coche(fait(d, 's2', 'rangement'))}`);
    if (f.prises) l.push(`Film : ${f.gardees} / ${R().min} images${f.atteint ? ' ✓' : ''}${f.enlevees ? ` (${f.enlevees} enlevée${f.enlevees > 1 ? 's' : ''})` : ''} · ${NOMS_VITESSE[f.vitesse] || f.vitesse}`);
    if (fait(d, 's5', 'mon-film')) l.push('Film monté ✓');
    return l;
  }

  const alertes = (d) => S.alertesFilm(d, Date.now());

  function bandeauClasse(equipes) {
    const prets = equipes.filter((eq) => S.resumeFilm(eq.donnees, R()).atteint).length;
    const commences = equipes.filter((eq) => S.resumeFilm(eq.donnees, R()).prises).length;
    return `<div class="pc-exports pc-piste"><span>Films :</span><span><b>${prets}</b> avec ${R().min} images ou plus · ${commences} commencé${commences > 1 ? 's' : ''} sur ${equipes.length}</span>
      <a class="pb-btn" href="cinema.html" target="_blank" rel="noopener">La séance cinéma (vidéoprojecteur)</a></div>`;
  }

  // Onglet « Scénario » : les 7 réponses de la séance 1 et le récap en 3 temps.
  function ongletScenario(d, outils) {
    const h = S.histoireDe(d);
    const ph = S.phrasesHistoire(h);
    const titre = S.filmDe(d).titre;
    if (!nbParties(d) && !titre) return '<section class="pp-bloc"><h3>Séance 1 · scénario</h3><p class="pp-vide">Pas encore de scénario.</p></section>';
    return blocAvis(d, outils) + `<section class="pp-bloc"><h3>Séance 1 · scénario${titre ? ` · « ${ech(titre)} »` : ''}</h3>
        <div class="pp-reponse"><p class="pp-question">Début</p><p>${ech(ph.debut || '—')}</p></div>
        <div class="pp-reponse"><p class="pp-question">Milieu</p><p>${ech(ph.milieu || '—')}</p></div>
        <div class="pp-reponse"><p class="pp-question">Fin</p><p>${ech(ph.fin || '—')}</p></div>
        <table class="pp-table"><thead><tr><th>Question</th><th>Réponse</th></tr></thead><tbody>${QUESTIONS.map(
          ([k, t]) => `<tr><th scope="row">${ech(t)}</th><td>${h[k] ? ech(h[k]) : '<span class="pp-vide">—</span>'}</td></tr>`
        ).join('')}</tbody></table>
      </section>`;
  }

  // L'avis du professeur sur le scénario : « Validé » ou « À revoir », un petit mot, envoyé à l'équipe.
  const quand = (iso) => new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  function blocAvis(d, outils) {
    const o = outils || { notes: {}, peutEcrire: false };
    const avis = avisDe(o.notes);
    const ea = etatAvisDe(d, o.notes);
    const choix = avis ? avis.avis : '';
    const suivi = avis
      ? [`Envoyé ${quand(avis.date)}`, d.avisVu && d.avisVu >= avis.date ? 'vu par l’équipe ✓' : 'pas encore vu par l’équipe', ea === 'corrige' ? 'l’équipe a changé son histoire depuis : à relire' : ''].filter(Boolean).join(' · ')
      : fait(d, 's1', 'histoire') ? 'Scénario fini : à toi de donner ton avis.' : 'Le scénario n’est pas encore fini (tu peux déjà donner ton avis).';
    return `<section class="pp-bloc pp-avis${ea === 'corrige' ? ' a-relire' : ''}"><h3>Ton avis sur le scénario</h3>
        <div class="pp-avis-choix" role="group" aria-label="Ton avis">
          <button type="button" class="pb-btn pp-avis-btn valide" data-action="avis-choisir" data-avis="valide" aria-pressed="${choix === 'valide'}">✓ Validé</button>
          <button type="button" class="pb-btn pp-avis-btn revoir" data-action="avis-choisir" data-avis="revoir" aria-pressed="${choix === 'revoir'}">✎ À revoir</button>
        </div>
        <label class="pp-avis-mot">Un petit mot pour l’équipe (facultatif, lu à voix haute)
          <textarea rows="2" maxlength="300" data-avis-mot placeholder="Ex. : Super idée ! Pense à construire la fusée pour la fin.">${ech((avis && avis.mot) || '')}</textarea></label>
        <p class="pp-avis-pied"><button type="button" class="pb-btn pp-principal" data-action="avis-envoyer"${o.peutEcrire && choix ? '' : ' disabled'}>Envoyer à l’équipe</button>
          <span class="pp-vide">${ech(suivi)}</span></p>
        ${o.peutEcrire ? '' : '<p class="pp-vide">Ouvrez le dossier de la classe pour envoyer un avis.</p>'}
        <p class="pp-vide">L’équipe le voit au début de la séance suivante (écran « Je relis mon histoire ») ; avec « À revoir », elle peut changer une réponse. Ni note ni rouge.</p>
      </section>`;
  }
  function actionsScenario(d, outils) {
    return {
      'avis-choisir': (b) => {
        for (const x of document.querySelectorAll('[data-action="avis-choisir"]')) x.setAttribute('aria-pressed', String(x === b));
        const e = document.querySelector('[data-action="avis-envoyer"]');
        if (e && outils.peutEcrire) e.disabled = false;
      },
      'avis-envoyer': async (b) => {
        const choisi = document.querySelector('[data-action="avis-choisir"][aria-pressed="true"]');
        if (!choisi) return;
        b.disabled = true;
        const scenario = { avis: choisi.dataset.avis, mot: document.querySelector('[data-avis-mot]').value.trim().slice(0, 300), date: S.maintenant() };
        const equipe = S.nomEquipe(d.equipe.eleves);
        const ok = await outils.poserNote('scenario', scenario, { nom: 'avis-professeur.json', contenu: { application: 'segpa', projet: S.projet.id, type: 'avis', equipe, scenario } });
        if (!ok) alert('L’avis n’a pas pu être enregistré dans le dossier. Vérifiez l’accès au dossier, puis réessayez.');
      },
    };
  }

  // Onglet « Film » : le film tel qu'il sera projeté (titre, images gardées, générique), puis toutes les images.
  let lecteur = null;
  async function ongletFilm(d, url) {
    if (lecteur) lecteur.detruire();
    lecteur = null;
    const film = S.filmDe(d);
    const f = S.resumeFilm(d, R());
    if (!f.prises) return '<section class="pp-bloc"><h3>Film</h3><p class="pp-vide">Pas encore d’image.</p></section>';
    const urls = await Promise.all(film.images.map((im) => url(im.fichier)));
    const s3 = S.imagesDeSeance(d, 's3');
    const s4 = S.imagesDeSeance(d, 's4');
    // Le lecteur se branche juste après l'affichage de l'onglet.
    setTimeout(() => {
      const el = document.querySelector('.pp-lecteur');
      if (!el || !S.creerLecteur) return;
      const parFichier = new Map(film.images.map((im, i) => [im.fichier, urls[i]]));
      lecteur = S.creerLecteur(el, { plans: S.sequenceFilm(film, { eleves: d.equipe.eleves }, R()), url: async (x) => parFichier.get(x) || null });
    }, 0);
    return `<section class="pp-bloc"><h3>Film · ${f.gardees} image${f.gardees > 1 ? 's' : ''} gardée${f.gardees > 1 ? 's' : ''} sur ${f.prises} · ${f.secondes} s · vitesse ${ech(NOMS_VITESSE[f.vitesse] || f.vitesse)}</h3>
        <p>Images prises : séance 3 ${s3} · séance 4 ${s4} · ${f.atteint ? `${R().min} images atteintes ✓` : `il en manque ${R().min - f.gardees} pour ${R().min}`}${f.enlevees ? ` · ${f.enlevees} enlevée${f.enlevees > 1 ? 's' : ''} au montage` : ''}</p>
        <div class="pp-lecteur ecran-film" role="img" aria-label="Le film"></div>
        <p><button type="button" class="pb-btn" data-pp-lecture>Lecture / pause</button></p>
        <div class="pp-pellicule">${film.images
          .map((im, i) => `<figure class="${im.enlevee ? 'enlevee' : ''}">${urls[i] ? `<img src="${urls[i]}" alt="">` : '<span class="pp-vide">absente</span>'}<figcaption>${i + 1}${im.enlevee ? ' · enlevée' : ''}</figcaption></figure>`)
          .join('')}</div>
      </section>`;
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-pp-lecture]') && lecteur) lecteur.basculer();
  });

  S.profProjet = {
    lignes,
    alertes,
    bandeauClasse,
    onglets: [
      { id: 'scenario', titre: 'Scénario', html: (d, url, outils) => ongletScenario(d, outils), actions: actionsScenario },
      { id: 'film', titre: 'Film', html: (d, url) => ongletFilm(d, url) },
    ],
    // Drapeaux de différenciation (proposition à valider) : notes du professeur, visibles sur la tuile.
    drapeaux: [
      { id: 'scenario-oral', texte: 'Scénario dicté à l’adulte' },
      { id: 'roles', texte: 'Rôles : photographe / animateur' },
      { id: 'film-court', texte: 'Film plus court accepté' },
      { id: 'tuteur', texte: 'Élève rapide : aide un autre binôme' },
    ],
  };

  // Repères automatiques à côté de chaque critère d'évaluation : des observations, jamais un niveau.
  S.profProjet.repere = (id, d) => {
    const aides = (s) => d.aides.filter((a) => !s || a.seance === s).length;
    const f = S.resumeFilm(d, R());
    switch (id) {
      case 'scenario': {
        const ph = S.phrasesHistoire(S.histoireDe(d));
        return `Questions répondues : ${nbParties(d)} sur ${QUESTIONS.length} · début ${coche(ph.debut)} milieu ${coche(ph.milieu)} fin ${coche(ph.fin)} · titre ${coche(f.titre)} (onglet Scénario)`;
      }
      case 'regles': {
        const ranges = ['s2', 's3', 's4'].map((s) => `S${s.slice(1)} ${coche(fait(d, s, 'rangement'))}`).join(' ');
        return `Rangement : ${ranges} · plaque prise ${coche(fait(d, 's2', 'plaque'))} · demandes d’aide : ${aides()}`;
      }
      case 'construction':
        return `Décor ${coche(fait(d, 's2', 'decor'))} · héros ${coche(fait(d, 's2', 'heros'))} · objets ${coche(fait(d, 's2', 'objets'))} · « rien ne tombe » ${coche(fait(d, 's2', 'secouer'))} · photos séance 2 : ${S.photosDe(d, 's2').length} (onglet Album)`;
      case 'methode':
        return f.prises ? `Images prises : S3 ${S.imagesDeSeance(d, 's3')} · S4 ${S.imagesDeSeance(d, 's4')} · enlevées au montage : ${f.enlevees} — regarder le film (onglet Film)` : 'Pas encore d’image';
      case 'film':
        return f.prises ? `${f.gardees} images gardées (${f.atteint ? `${R().min} atteintes` : `moins de ${R().min}`}) · ${f.secondes} s · tournage fini ${coche(fait(d, 's4', 'tournage'))}` : 'Pas encore de film';
      case 'montage':
        return `Titre ${coche(f.titre)} · vitesse ${fait(d, 's5', 'regarder') ? NOMS_VITESSE[f.vitesse] || f.vitesse : '○'} · images ratées triées ${coche(fait(d, 's5', 'trier'))} (${f.enlevees} enlevée${f.enlevees > 1 ? 's' : ''}) · film monté ${coche(fait(d, 's5', 'mon-film'))}`;
      case 'autonomie':
        return `Demandes d’aide : ${aides()} (${S.etapes.seances.map((s, i) => `S${i + 1} ${aides(s.id)}`).join(' · ')})`;
      default:
        return '';
    }
  };
})(window);
