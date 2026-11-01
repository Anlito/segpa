// Moteur du studio de tournage (stop motion).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const S = require(path.join(__dirname, '..', 'site', 'stop-motion', 'js', 'studio.js'));

const film = (n) => {
  let v = S.filmVide();
  for (let i = 0; i < n; i++) v = S.ajouterImageFilm(v, S.prochainNomFilm(v), '2026-11-02T10:00:00.000Z').valeur;
  return v;
};

test('les images se suivent : photos/film/0001.jpg, 0002.jpg…, jamais un nom déjà pris', () => {
  const v = film(3);
  assert.deepEqual(v.images.map((i) => i.fichier), ['photos/film/0001.jpg', 'photos/film/0002.jpg', 'photos/film/0003.jpg']);
  assert.equal(S.prochainNomFilm(v), 'photos/film/0004.jpg');
  assert.equal(S.prochainNomFilm(v, ['photos/film/0004.jpg', 'photos/film/0005.jpg']), 'photos/film/0006.jpg', 'images déjà dans le dossier (autre poste)');
  const sans = S.enleverImageFilm(v);
  assert.equal(S.prochainNomFilm(sans), 'photos/film/0003.jpg');
  assert.equal(S.prochainNomFilm(sans, ['photos/film/0003.jpg']), 'photos/film/0004.jpg', 'le fichier enlevé reste dans le dossier : on ne l’écrase pas');
});

test('compteur « Image 12 / 30 », 120 images au plus', () => {
  assert.deepEqual(S.compteurFilm(film(12)), { n: 12, min: 30, max: 120, atteint: false, plein: false, part: 0.4 });
  assert.equal(S.compteurFilm(film(30)).atteint, true);
  const plein = film(120);
  assert.equal(S.compteurFilm(plein).plein, true);
  const r = S.ajouterImageFilm(plein, 'photos/film/0121.jpg');
  assert.ok(r.plein, 'au-delà de 120 : « Ton film est assez long ! »');
  assert.equal(r.valeur.images.length, 120);
  assert.equal(S.compteurFilm(film(3), { min: 10 }).min, 10, 'réglable dans les données');
});

test('enlever la dernière image ou une image choisie ; la valeur reçue n’est pas modifiée', () => {
  const v = film(5);
  const avant = JSON.stringify(v);
  assert.equal(S.enleverImageFilm(v).images.length, 4);
  assert.deepEqual(S.enleverImageFilm(v, 1).images.map((i) => i.fichier.slice(-8)), ['0001.jpg', '0003.jpg', '0004.jpg', '0005.jpg']);
  assert.equal(JSON.stringify(v), avant);
  assert.equal(S.enleverImageFilm(S.filmVide()).images.length, 0);
});

test('pellicule, vitesses, durée, conseils', () => {
  const v = film(8);
  assert.equal(S.dernieresImages(v).length, 6);
  assert.equal(S.derniereImage(v).fichier, 'photos/film/0008.jpg');
  assert.equal(S.derniereImage(S.filmVide()), null);
  assert.deepEqual(['lent', 'normal', 'rapide'].map((x) => S.imagesParSeconde(x)), [4, 6, 10]);
  assert.equal(S.dureeFilm(film(30)), 5, '30 images à 6 images par seconde : 5 secondes');
  const conseils = ['A', 'B', 'C'];
  assert.deepEqual([0, 39, 40, 85, 125].map((s) => S.conseilDuMoment(conseils, s)), ['A', 'A', 'B', 'C', 'A']);
});

test('le film est gardé à part des séances : la séance 4 reprend le film de la séance 3', () => {
  const d = { projet: 'stop-motion', equipe: { eleves: ['Léa', 'Tom'] }, seances: {}, photos: [] };
  assert.deepEqual(S.filmDe(d), S.filmVide(), 'pas encore de film : un film vide');
  S.noterFilm(d, film(4));
  assert.equal(S.filmDe(d).images.length, 4);
  const lu = S.filmDe(d);
  lu.images.pop();
  assert.equal(S.filmDe(d).images.length, 4, 'la valeur lue est une copie');
  assert.ok(d.modifieLe);
  // Une image enlevée ne libère pas son nom : le fichier reste dans le dossier, la suivante prend un nouveau numéro.
  const sans = S.enleverImageFilm(S.filmDe(d));
  assert.equal(S.prochainNomFilm(sans, ['photos/film/0004.jpg']), 'photos/film/0005.jpg');
});
