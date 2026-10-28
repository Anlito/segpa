// Moteur des essais de la voiture à ballon (séance 4).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const S = require(path.join(__dirname, '..', 'site', 'voiture-ballon', 'js', 'essais.js'));

// Un essai entier : je pose, je gonfle, je lâche, je mesure, la direction.
function essai(v, pompe, distance, direction) {
  for (const [quoi, donnee] of [['ligne'], ['gonfle', pompe], ['lache'], ['mesure', distance], ['direction', direction]]) v = S.noterEssai(v, quoi, donnee);
  return v;
}

test('les écrans d’un essai s’enchaînent dans l’ordre', () => {
  let v = S.essaisVides();
  assert.equal(S.ecranEssai(v), 'roues');
  v = S.noterEssai(v, 'roues', 30);
  const vus = [];
  for (const [quoi, donnee] of [['ligne'], ['gonfle', 12], ['lache'], ['mesure', 240], ['direction', 'droit']]) {
    vus.push(S.ecranEssai(v));
    v = S.noterEssai(v, quoi, donnee);
  }
  assert.deepEqual(vus, ['ligne', 'gonfle', 'lache', 'mesure', 'direction']);
  assert.equal(S.ecranEssai(v), 'changer', 'avant 3 essais, on change une chose');
});

test('on change UNE chose, puis après 3 essais on choisit : encore un essai ou le graphique ; 5 essais au plus', () => {
  let v = S.noterEssai(S.essaisVides(), 'roues', 30);
  v = essai(v, 10, 200, 'droit');
  v = S.noterEssai(v, 'changer', { type: 'roues', choix: 40 });
  assert.equal(S.ecranEssai(v), 'ligne');
  assert.equal(S.rouesDe(v), '40');
  assert.equal(S.rouesDe(v, 0), '30');
  v = essai(v, 10, 260, 'gauche');
  v = S.noterEssai(v, 'changer', { type: 'ballon', choix: 'plus' });
  v = essai(v, 14, 310, 'droit');
  assert.equal(S.ecranEssai(v), 'suite');
  v = S.noterEssai(v, 'changer', { type: 'poids', choix: 'enleve' });
  v = essai(v, 14, 330, 'droit');
  v = S.noterEssai(v, 'changer', { type: 'roues', choix: 50 });
  v = essai(v, 14, 300, 'droite');
  assert.equal(S.ecranEssai(v), 'graphique', 'au 5e essai, le graphique');
  assert.equal(S.meilleurEssai(v), 3);
  const r = S.resumeEssais(v);
  assert.equal(r.nombre, 5);
  assert.equal(r.meilleure, 330);
  assert.deepEqual(r.changements, ['roues', 'ballon', 'poids', 'roues']);
  assert.ok(r.fini);
});

test('« Mon graphique » après 3 essais', () => {
  let v = S.noterEssai(S.essaisVides(), 'roues', 20);
  for (let i = 0; i < 3; i++) {
    if (i) v = S.noterEssai(v, 'changer', { type: 'ballon', choix: 'moins' });
    v = essai(v, 8, 100 + i, 'droit');
  }
  v = S.noterEssai(v, 'graphique');
  assert.equal(S.ecranEssai(v), 'graphique');
  assert.equal(S.ecranEssai(S.reculerEssai(v)), 'suite');
});

test('Retour défait la dernière chose notée, sans rien perdre d’autre', () => {
  let v = S.noterEssai(S.essaisVides(), 'roues', 30);
  v = essai(v, 10, 200, 'droit');
  v = S.reculerEssai(v);
  assert.equal(S.ecranEssai(v), 'direction');
  assert.equal(v.essais[0].distance, 200);
  v = S.noterEssai(S.noterEssai(v, 'direction', 'droit'), 'changer', { type: 'poids', choix: 'ajoute' });
  assert.equal(S.ecranEssai(S.reculerEssai(v)), 'changer', 'on revient au choix du changement');
  let w = S.noterEssai(S.essaisVides(), 'roues', 30);
  w = S.reculerEssai(w);
  assert.equal(S.ecranEssai(w), 'roues');
  assert.equal(S.reculerEssai(w), null, 'plus rien à défaire : étape précédente');
});

test('la valeur reçue n’est jamais modifiée', () => {
  const v = S.noterEssai(S.essaisVides(), 'roues', 30);
  const avant = JSON.stringify(v);
  S.noterEssai(v, 'ligne');
  S.reculerEssai(v);
  assert.equal(JSON.stringify(v), avant);
});

test('mesure 10 fois plus grande ou plus petite que les autres : « Mesure encore une fois ? »', () => {
  let v = S.noterEssai(S.essaisVides(), 'roues', 30);
  assert.equal(S.mesureSuspecte(v, 2500), null, 'premier essai : rien à comparer');
  v = essai(v, 10, 250, 'droit');
  assert.equal(S.mesureSuspecte(v, 2500), 'plus');
  assert.equal(S.mesureSuspecte(v, 25), 'moins');
  assert.equal(S.mesureSuspecte(v, 300), null);
  assert.equal(S.mesureSuspecte(v, 0), null, 'une voiture qui n’avance pas, ça arrive');
  assert.equal(S.mesureSuspecte(v, 1200, { ecart: 4 }), 'plus', 'écart réglable dans les données');
});

test('médiane', () => {
  assert.equal(S.mediane([3, 1, 2]), 2);
  assert.equal(S.mediane([4, 1, 2, 3]), 2.5);
  assert.equal(S.mediane([]), null);
});
