const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur } = require('./outils.js');

const S = moteur();

test('lire une longueur tapée au pavé (virgule française)', () => {
  assert.equal(S.lireNombre('7,5'), 7.5);
  assert.equal(S.lireNombre('12'), 12);
  assert.equal(S.lireNombre('7.5'), 7.5);
  assert.equal(S.lireNombre(''), null);
  assert.equal(S.lireNombre('7,'), null);
  assert.equal(S.lireNombre(','), null);
  assert.equal(S.ecrireNombre(7.5), '7,5');
});

test('plage de référence : longueur ± tolérance, ou min et max', () => {
  assert.deepEqual(S.plageDe({ longueur: 7.5 }), [7, 8]);
  assert.deepEqual(S.plageDe({ longueur: 7.5 }, 0.3), [7.2, 7.8]);
  assert.deepEqual(S.plageDe({ longueur: 7.5, tolerance: 1 }, 0.3), [6.5, 8.5]);
  assert.deepEqual(S.plageDe({ min: 6, max: 6.5 }), [6, 6.5]);
  assert.equal(S.plageDe(null), null);
});

test('vérification douce : dedans, dehors, sans référence (jamais la bonne valeur)', () => {
  assert.equal(S.verifierMesure('7,5', [7, 8]), 'dedans');
  assert.equal(S.verifierMesure(7, [7, 8]), 'dedans');
  assert.equal(S.verifierMesure(8, [7, 8]), 'dedans');
  assert.equal(S.verifierMesure('9,5', [7, 8]), 'dehors');
  assert.equal(S.verifierMesure('6,9', [7, 8]), 'dehors');
  assert.equal(S.verifierMesure('7,5', null), 'sans-reference');
  assert.equal(S.verifierMesure('', [7, 8]), 'illisible');
});
