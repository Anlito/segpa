// Contrôle des données du film en stop motion.
const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur, donnees, pictos } = require('./outils.js');

const S = moteur();
const { projet, etapes, reglages, donneesProjet } = donnees('stop-motion');
const PICTOS = new Set(pictos());
const TYPES = ['regle', 'consigne', 'photo', 'cases', 'bilan', 'tournage'];

test('identité, classe et dossier du projet', () => {
  assert.equal(projet.id, 'stop-motion');
  assert.ok(PICTOS.has(projet.picto));
  assert.deepEqual(reglages.cheminProjet, ['Stop-motion']);
});

test('5 séances, identifiants uniques, types connus, pictogrammes dessinés, consignes de 8 mots au plus', () => {
  assert.deepEqual(etapes.seances.map((s) => s.id), ['s1', 's2', 's3', 's4', 's5']);
  for (const s of etapes.seances) {
    assert.ok(PICTOS.has(s.picto), s.id);
    const ids = s.etapes.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `identifiants en double dans ${s.id}`);
    for (const e of s.etapes) {
      assert.ok(TYPES.includes(e.type), `${s.id}/${e.id} : type ${e.type}`);
      for (const p of [e.picto, ...(e.lignes || []).map((l) => l.picto)].filter(Boolean)) assert.ok(PICTOS.has(p), `${s.id}/${e.id} : picto ${p}`);
      for (const t of [e.texte, e.fin, ...(e.lignes || []).map((l) => l.texte)].filter(Boolean)) assert.ok(S.nombreDeMots(t) <= 8, `${s.id}/${e.id} : « ${t} »`);
      if (e.type === 'photo') assert.ok(e.legende, `${s.id}/${e.id} : légende`);
    }
  }
});

test('les 3 règles du matériel validées par Thomas, en séance 1', () => {
  const textes = etapes.seances[0].etapes.filter((e) => e.type === 'regle').map((e) => e.texte);
  assert.deepEqual(textes, ['Je ne touche pas l\'objectif de la caméra.', 'Je compte mes briques.', 'Je range les briques par couleur.']);
});

test('séances 3 et 4 : 3 rappels puis l’écran de tournage', () => {
  for (const id of ['s3', 's4']) {
    const s = etapes.seances.find((x) => x.id === id);
    const types = s.etapes.map((e) => e.type);
    assert.deepEqual(types.slice(0, 4), ['regle', 'regle', 'regle', 'tournage'], id);
  }
});

test('réglages du film et conseils', () => {
  const f = donneesProjet.film;
  assert.ok(f.min >= 1 && f.max > f.min);
  assert.ok(f.vitesses.lent < f.vitesses.normal && f.vitesses.normal < f.vitesses.rapide);
  assert.ok(f.pellicule >= 3 && f.voir >= 2 && f.calque > 0 && f.calque < 1 && f.periodeConseil >= 10);
  assert.ok(donneesProjet.conseils.length >= 3);
  for (const c of donneesProjet.conseils) {
    assert.ok(PICTOS.has(c.picto), c.picto);
    assert.ok(S.nombreDeMots(c.texte) <= 8, c.texte);
  }
});
