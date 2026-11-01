// Moteur du studio de tournage (stop motion) : utilisable dans le navigateur et dans Node (tests).
// Un film, gardé dans la sauvegarde de l'équipe (les images sont des fichiers à part, jamais dans le .json) :
//   { images: [{ fichier: 'photos/film/0001.jpg', date, enlevee? }], vitesse: 'lent' | 'normal' | 'rapide', titre? }
//   enlevee : image ratée enlevée au montage (le fichier reste, on peut la remettre).
// Le film se tourne sur deux séances : la séance 4 reprend le film de la séance 3, là où il en était.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/outils.js') : global.Segpa;

  const REGLAGES = { min: 30, max: 120, vitesses: { lent: 4, normal: 6, rapide: 10 }, pellicule: 6, voir: 10 };
  const reglages = (r) => Object.assign({}, REGLAGES, r || {}, { vitesses: Object.assign({}, REGLAGES.vitesses, (r && r.vitesses) || {}) });

  const filmVide = () => ({ images: [], vitesse: 'normal' });
  function copie(v) {
    const c = v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : filmVide();
    if (!Array.isArray(c.images)) c.images = [];
    if (!c.vitesse) c.vitesse = 'normal';
    return c;
  }

  // Nom du fichier de la prochaine image : photos/film/0001.jpg, 0002.jpg… (après le plus grand numéro déjà pris ;
  // pris = les noms déjà présents dans le dossier, par exemple tournés sur un autre poste : jamais d'écrasement).
  function prochainNom(valeur, pris) {
    const numero = (f) => Number((String(f).match(/(\d+)\.jpg$/) || [0, 0])[1]);
    const tous = copie(valeur).images.map((i) => i.fichier).concat(pris || []);
    let n = Math.max(0, ...tous.map(numero)) + 1;
    const deja = new Set(tous);
    while (deja.has(nom(n))) n++;
    return nom(n);
  }
  const nom = (n) => `photos/film/${String(n).padStart(4, '0')}.jpg`;

  // Une image prise. → { valeur, plein } ; plein : le film a déjà son maximum d'images (rien n'est ajouté).
  function ajouterImage(valeur, fichier, date, r) {
    const R = reglages(r);
    const v = copie(valeur);
    if (v.images.length >= R.max) return { valeur: v, plein: true };
    v.images.push({ fichier, date: date || S.maintenant() });
    return { valeur: v, plein: false };
  }

  // Enlever une image pendant le tournage (la dernière gardée par défaut). Le fichier reste dans le dossier (rien n'est jamais effacé).
  function enleverImage(valeur, i) {
    const v = copie(valeur);
    let k = i;
    if (k === undefined) for (k = v.images.length - 1; k >= 0 && v.images[k].enlevee; k--);
    if (k >= 0 && k < v.images.length) v.images.splice(k, 1);
    return v;
  }

  // Ce que montre le compteur : « Image 12 / 30 ».
  function compteur(valeur, r) {
    const R = reglages(r);
    const n = visibles(valeur).length;
    return { n, min: R.min, max: R.max, atteint: n >= R.min, plein: n >= R.max, part: Math.min(1, n / R.min) };
  }

  // Les images gardées (au montage, une image ratée est « enlevée » : elle reste dans la liste, on peut la remettre).
  const visibles = (valeur) => copie(valeur).images.filter((i) => !i.enlevee);
  const dernieres = (valeur, k) => visibles(valeur).slice(-(k || REGLAGES.pellicule));
  const derniere = (valeur) => visibles(valeur).slice(-1)[0] || null;

  // Images par seconde pour la vitesse choisie, et durée du film en secondes.
  const imagesParSeconde = (vitesse, r) => reglages(r).vitesses[vitesse] || reglages(r).vitesses.normal;
  const duree = (valeur, r) => visibles(valeur).length / imagesParSeconde(copie(valeur).vitesse, r);

  // Le conseil affiché : il change toutes les « periode » secondes, dans l'ordre de la liste.
  const conseil = (liste, secondes, periode) => (liste && liste.length ? liste[Math.floor(Math.max(0, secondes) / (periode || 40)) % liste.length] : null);

  // ---------- Montage (séance 5) ----------

  // Au montage, toucher une image l'enlève du film, la toucher encore la remet (i : rang dans toutes les images).
  function basculerImage(valeur, i) {
    const v = copie(valeur);
    const im = v.images[i];
    if (!im) return v;
    if (im.enlevee) delete im.enlevee;
    else im.enlevee = true;
    return v;
  }

  function choisirVitesse(valeur, vitesse, r) {
    const v = copie(valeur);
    if (reglages(r).vitesses[vitesse]) v.vitesse = vitesse;
    return v;
  }

  // Le titre du film : sans espaces en trop, 40 caractères au plus.
  const LONGUEUR_TITRE = 40;
  function noterTitre(valeur, titre) {
    const v = copie(valeur);
    v.titre = String(titre || '').replace(/\s+/g, ' ').trim().slice(0, LONGUEUR_TITRE).trim();
    return v;
  }

  // « Léa et Tom », « Léa, Tom et Inès ».
  function nomsGenerique(eleves) {
    const e = (eleves || []).filter(Boolean);
    return e.length > 1 ? e.slice(0, -1).join(', ') + ' et ' + e[e.length - 1] : e[0] || '';
  }

  // Le film tel qu'on le projette : la carte-titre, les images gardées à la vitesse choisie, puis le générique.
  // → [{ type: 'titre' | 'image' | 'generique', texte?, fichier?, duree (secondes) }]
  const DUREE_TITRE = 2.5;
  const DUREE_GENERIQUE = 3;
  function sequenceFilm(valeur, o, r) {
    const v = copie(valeur);
    const titre = v.titre || (o && o.titre) || 'Mon film';
    const ips = imagesParSeconde((o && o.vitesse) || v.vitesse, r);
    const noms = nomsGenerique(o && o.eleves);
    return [{ type: 'titre', texte: titre, duree: DUREE_TITRE }]
      .concat(visibles(v).map((im) => ({ type: 'image', fichier: im.fichier, duree: 1 / ips })))
      .concat([{ type: 'generique', texte: noms ? 'Un film de ' + noms : 'Fin', duree: DUREE_GENERIQUE }]);
  }
  const dureeSequence = (plans) => plans.reduce((t, p) => t + p.duree, 0);

  // ---------- L'histoire en 3 temps (séance 1) ----------
  // Gardée à part (d.histoire) : { heros, lieu, action, probleme, solution, fin, objets } — une carte-idée de
  // donnees/idees.js ou « mon idée » (objets : plusieurs cartes, « une maison, un arbre »).
  const PARTIES_HISTOIRE = ['heros', 'lieu', 'action', 'probleme', 'solution', 'fin', 'objets'];
  const LONGUEUR_IDEE = 60;
  const histoireDe = (d) => Object.assign({ heros: '', lieu: '', action: '', probleme: '', solution: '', fin: '', objets: '' }, (d && d.histoire) || {});
  function noterHistoire(d, partie, texte) {
    if (!PARTIES_HISTOIRE.includes(partie)) return histoireDe(d);
    d.histoire = Object.assign(histoireDe(d), { [partie]: String(texte || '').replace(/\s+/g, ' ').trim().slice(0, LONGUEUR_IDEE).trim() });
    d.modifieLe = S.maintenant();
    return d.histoire;
  }
  // Le scénario en 3 temps : « Un dragon, dans la forêt, dort tranquillement. » · « Une tempête arrive. Un ami vient
  // aider. » · « C'est la fête ! », et les objets à construire (« une maison, un arbre »).
  const phrase = (t) => {
    const x = String(t || '').trim();
    if (!x) return '';
    return x.charAt(0).toUpperCase() + x.slice(1) + (/[.!?…]$/.test(x) ? '' : '.');
  };
  function phrasesHistoire(h) {
    const v = Object.assign({}, h);
    const debut = [v.heros, v.lieu, v.action].map((x) => String(x || '').trim().replace(/[.!?…]+$/, '')).filter(Boolean).join(', ');
    const milieu = [phrase(v.probleme), phrase(v.solution)].filter(Boolean).join(' ');
    return { debut: phrase(debut), milieu, fin: phrase(v.fin), objets: String(v.objets || '').trim().replace(/[.!?…]+$/, '') };
  }

  // ---------- Pour le professeur ----------

  // Images prises pendant une séance (d'après leur date et le début de la séance).
  function imagesDeSeance(d, idSeance) {
    const s = d && d.seances && d.seances[idSeance];
    if (!s || !s.debut) return 0;
    const fin = Object.keys(d.seances)
      .filter((k) => k !== idSeance && d.seances[k].debut > s.debut)
      .map((k) => d.seances[k].debut)
      .sort()[0];
    return copie(d.film).images.filter((i) => i.date >= s.debut && (!fin || i.date < fin)).length;
  }

  // Alertes du suivi de classe (plan §5) : séance de tournage commencée depuis plus de « mi » minutes sans image ;
  // plaque prise mais rangement pas fait en fin de séance 2 (plus de « fin » minutes). → [{ sorte, texte }]
  function alertesFilm(d, maintenant, o) {
    const R = Object.assign({ mi: 25, fin: 50 }, o || {});
    const minutes = (iso) => (maintenant - Date.parse(iso)) / 60000;
    const a = [];
    for (const id of ['s3', 's4']) {
      const s = d.seances && d.seances[id];
      if (!s || !s.debut || (s.etapes.tournage && s.etapes.tournage.fait)) continue;
      if (minutes(s.debut) >= R.mi && minutes(s.debut) < 120 && !imagesDeSeance(d, id)) a.push({ sorte: 'film', texte: 'Pas encore d’image dans cette séance' });
    }
    const s2 = d.seances && d.seances.s2;
    if (s2 && s2.etapes.plaque && s2.etapes.plaque.fait && !(s2.etapes.rangement && s2.etapes.rangement.fait) && minutes(s2.debut) >= R.fin)
      a.push({ sorte: 'plaque', texte: 'Plaque prise, rangement pas fait' });
    return a;
  }

  // Le film en quelques nombres (tuile, onglet Film, repères de l'évaluation).
  function resumeFilm(d, r) {
    const f = copie(d && d.film);
    const gardees = visibles(f).length;
    return {
      prises: f.images.length,
      gardees,
      enlevees: f.images.length - gardees,
      atteint: gardees >= reglages(r).min,
      vitesse: f.vitesse,
      titre: f.titre || '',
      secondes: Math.round(gardees / imagesParSeconde(f.vitesse, r)),
    };
  }

  // Le film de l'équipe, gardé à part des séances (d.film) : la séance 4 continue le film commencé en séance 3.
  const filmDe = (d) => copie(d && d.film);
  function noterFilm(d, valeur) {
    d.film = copie(valeur);
    d.modifieLe = S.maintenant();
    return d.film;
  }

  const API = { imagesDeSeance, alertesFilm, resumeFilm, PARTIES_HISTOIRE, LONGUEUR_IDEE, histoireDe, noterHistoire, phrasesHistoire, imagesVisibles: visibles, basculerImage, choisirVitesse, noterTitre, LONGUEUR_TITRE, nomsGenerique, sequenceFilm, dureeSequence, filmDe, noterFilm, REGLAGES_FILM: REGLAGES, filmVide, prochainNomFilm: prochainNom, ajouterImageFilm: ajouterImage, enleverImageFilm: enleverImage, compteurFilm: compteur, dernieresImages: dernieres, derniereImage: derniere, imagesParSeconde, dureeFilm: duree, conseilDuMoment: conseil };
  Object.assign(S, API);
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
