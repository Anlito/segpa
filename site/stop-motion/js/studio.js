// Moteur du studio de tournage (stop motion) : utilisable dans le navigateur et dans Node (tests).
// Un film, gardé dans la sauvegarde de l'équipe (les images sont des fichiers à part, jamais dans le .json) :
//   { images: [{ fichier: 'photos/film/0001.jpg', date }], vitesse: 'lent' | 'normal' | 'rapide' }
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

  // Enlever une image (la dernière par défaut). Le fichier reste dans le dossier (rien n'est jamais effacé).
  function enleverImage(valeur, i) {
    const v = copie(valeur);
    const k = i === undefined ? v.images.length - 1 : i;
    if (k >= 0 && k < v.images.length) v.images.splice(k, 1);
    return v;
  }

  // Ce que montre le compteur : « Image 12 / 30 ».
  function compteur(valeur, r) {
    const R = reglages(r);
    const n = copie(valeur).images.length;
    return { n, min: R.min, max: R.max, atteint: n >= R.min, plein: n >= R.max, part: Math.min(1, n / R.min) };
  }

  const dernieres = (valeur, k) => copie(valeur).images.slice(-(k || REGLAGES.pellicule));
  const derniere = (valeur) => copie(valeur).images.slice(-1)[0] || null;

  // Images par seconde pour la vitesse choisie, et durée du film en secondes.
  const imagesParSeconde = (vitesse, r) => reglages(r).vitesses[vitesse] || reglages(r).vitesses.normal;
  const duree = (valeur, r) => copie(valeur).images.length / imagesParSeconde(copie(valeur).vitesse, r);

  // Le conseil affiché : il change toutes les « periode » secondes, dans l'ordre de la liste.
  const conseil = (liste, secondes, periode) => (liste && liste.length ? liste[Math.floor(Math.max(0, secondes) / (periode || 40)) % liste.length] : null);

  // Le film de l'équipe, gardé à part des séances (d.film) : la séance 4 continue le film commencé en séance 3.
  const filmDe = (d) => copie(d && d.film);
  function noterFilm(d, valeur) {
    d.film = copie(valeur);
    d.modifieLe = S.maintenant();
    return d.film;
  }

  const API = { filmDe, noterFilm, REGLAGES_FILM: REGLAGES, filmVide, prochainNomFilm: prochainNom, ajouterImageFilm: ajouterImage, enleverImageFilm: enleverImage, compteurFilm: compteur, dernieresImages: dernieres, derniereImage: derniere, imagesParSeconde, dureeFilm: duree, conseilDuMoment: conseil };
  Object.assign(S, API);
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
