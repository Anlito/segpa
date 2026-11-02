// Tailles de référence du taille-crayon saisies par le professeur.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { donnees } = require('./outils.js');

const S = require(path.join(__dirname, '..', 'site', 'taille-crayon', 'js', 'tailles.js'));
const { modele } = donnees('taille-crayon');

test('les tailles du professeur remplacent les plages du modèle (taille ± tolérance)', () => {
  const f = S.fichierTailles('taille-crayon', { corps: { hauteur: 9.2, largeur: 4.4, longueur: 'x' }, manivelle: { longueur: 5.1 } }, 0.5);
  assert.equal(f.type, 'tailles');
  assert.deepEqual(f.tailles, { corps: { hauteur: 9.2, largeur: 4.4 }, manivelle: { longueur: 5.1 } }, 'une valeur illisible est laissée de côté');
  const lu = S.lireTailles(JSON.stringify(f), 'taille-crayon');
  const m = S.appliquerTailles(modele.mesures, lu);
  const corps = S.dimensionsDe(m.corps);
  assert.deepEqual(S.plageDe(corps[0].reference), [8.7, 9.7]);
  assert.deepEqual(S.plageDe(corps[1].reference), [3.9, 4.9]);
  assert.deepEqual(S.plageDe(corps[2].reference), [5, 6], 'longueur non saisie : la plage du modèle reste');
  assert.deepEqual(S.plageDe(m.manivelle.reference), [4.6, 5.6]);
  assert.deepEqual(S.plageDe(modele.mesures.manivelle.reference), [4.5, 5.5], 'le modèle reçu n’est pas modifié');
});

test('fichier absent, d’un autre projet ou illisible : les plages du modèle restent', () => {
  assert.equal(S.lireTailles('pas du json'), null);
  assert.equal(S.lireTailles({ type: 'tailles', projet: 'voiture-ballon', tailles: {} }, 'taille-crayon'), null);
  assert.deepEqual(S.appliquerTailles(modele.mesures, null), modele.mesures);
  const lu = S.lireTailles({ type: 'tailles', projet: 'taille-crayon', tolerance: 1, tailles: { manivelle: { longueur: 5 } } }, 'taille-crayon');
  assert.deepEqual(S.plageDe(S.appliquerTailles(modele.mesures, lu).manivelle.reference), [4, 6], 'tolérance choisie par le professeur');
});
