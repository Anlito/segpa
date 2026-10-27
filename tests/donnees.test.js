// Contrôle des données du taille-crayon : ce que Thomas modifie doit rester lisible par l'outil.
const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur, donnees, pictos } = require('./outils.js');

const S = moteur();
const { projet, etapes, reglages, college } = donnees('taille-crayon');
const PICTOS = new Set(pictos());
const TYPES = ['regle', 'consigne', 'photo', 'cases', 'bilan', 'ouverture', 'pieces', 'mesure', 'remontage', 'questions'];

test('identité du projet', () => {
  assert.equal(projet.id, 'taille-crayon');
  assert.ok(projet.titre && projet.accent && PICTOS.has(projet.picto));
  assert.deepEqual(reglages.classes, ['6A']);
  assert.deepEqual(reglages.cheminProjet, ['Taille-crayon']);
  assert.ok(Array.isArray(college.cheminClasse));
});

test('trois séances, identifiants uniques, types connus, pictogrammes dessinés', () => {
  assert.deepEqual(etapes.seances.map((s) => s.id), ['s1', 's2', 's3']);
  for (const s of etapes.seances) {
    assert.ok(PICTOS.has(s.picto), s.id);
    const ids = s.etapes.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `identifiants en double dans ${s.id}`);
    for (const e of s.etapes) {
      assert.ok(TYPES.includes(e.type), `${s.id}/${e.id} : type ${e.type}`);
      for (const p of [e.picto, e.picto2, ...(e.lignes || []).map((l) => l.picto)].filter(Boolean)) assert.ok(PICTOS.has(p), `${s.id}/${e.id} : picto ${p}`);
    }
  }
});

test('chaque consigne tient en 8 mots au plus (cahier des charges §4.2)', () => {
  for (const s of etapes.seances)
    for (const e of s.etapes) {
      for (const t of [e.texte, ...(e.lignes || []).map((l) => l.texte)].filter(Boolean))
        assert.ok(S.nombreDeMots(t) <= 8, `${s.id}/${e.id} : « ${t} » (${S.nombreDeMots(t)} mots)`);
    }
});

test('les écrans à cocher, les photos et le bilan ont ce qu’il leur faut', () => {
  for (const s of etapes.seances)
    for (const e of s.etapes) {
      if (e.type === 'cases') assert.ok(e.lignes.length >= 1 && e.lignes.length <= 4, `${s.id}/${e.id}`);
      if (e.type === 'photo') assert.ok(e.legende, `${s.id}/${e.id} : légende`);
      if (e.type === 'bilan') assert.ok(e.phrases.length >= 1 && e.phrases.length <= 3, `${s.id}/${e.id}`);
    }
});

test('les trois règles reviennent au début de chaque séance', () => {
  for (const s of etapes.seances) {
    const regles = s.etapes.filter((e) => e.type === 'regle').map((e) => e.id);
    assert.deepEqual(regles, ['regle-force', 'regle-vis', 'regle-lames'], s.id);
  }
});
