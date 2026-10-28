const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur } = require('./outils.js');

const S = moteur();
const TYPES = ['regle', 'consigne', 'photo', 'cases', 'bilan'];
const seances = [
  { id: 's1', etapes: [{ id: 'a', type: 'regle' }, { id: 'x', type: 'pas-encore-construit' }, { id: 'b', type: 'photo' }] },
  { id: 's2', etapes: [{ id: 'c', type: 'consigne' }] },
];
const nouvelle = () => S.creerSauvegarde('essai', { eleves: ['Léa'] });

test('les écrans d’un type inconnu sont laissés de côté', () => {
  assert.deepEqual(S.etapesSeance(seances[0], TYPES).map((e) => e.id), ['a', 'b']);
});

test('état des séances : à faire, en cours, fait', () => {
  const d = nouvelle();
  assert.equal(S.etatSeance(d, seances[0], TYPES), 'a_faire');
  S.noterEtape(d, 's1', 'a');
  assert.equal(S.etatSeance(d, seances[0], TYPES), 'en_cours');
  S.passerEtape(d, 's1', 'b');
  assert.equal(S.etatSeance(d, seances[0], TYPES), 'fait');
});

test('on reprend à la première étape non terminée, puis à l’écran « Bravo »', () => {
  const d = nouvelle();
  assert.equal(S.indexAReprendre(d, seances[0], TYPES), 0);
  S.noterEtape(d, 's1', 'a');
  assert.equal(S.indexAReprendre(d, seances[0], TYPES), 1);
  S.noterEtape(d, 's1', 'b');
  assert.equal(S.indexAReprendre(d, seances[0], TYPES), 2);
});

test('la séance du jour est la première non finie', () => {
  const d = nouvelle();
  assert.equal(S.seanceCourante(d, seances, TYPES).id, 's1');
  S.noterEtape(d, 's1', 'a');
  S.noterEtape(d, 's1', 'b');
  assert.equal(S.seanceCourante(d, seances, TYPES).id, 's2');
  S.noterEtape(d, 's2', 'c');
  assert.equal(S.seanceCourante(d, seances, TYPES).id, 's2');
  assert.deepEqual(S.avancement(d, seances[1], TYPES), { faites: 1, total: 1 });
});

test('compter les mots d’une consigne', () => {
  assert.equal(S.nombreDeMots('Une pièce = une case dans la boîte.'), 7);
  assert.equal(S.nombreDeMots('Je reprends mon tableau à l’envers.'), 6);
});
