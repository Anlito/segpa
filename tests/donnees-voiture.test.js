// Contrôle des données de la voiture à ballon.
const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur, donnees, pictos } = require('./outils.js');

const S = moteur();
const { projet, etapes, reglages, donneesProjet } = donnees('voiture-ballon');
const PICTOS = new Set(pictos());
const TYPES = ['regle', 'consigne', 'photo', 'cases', 'bilan', 'nom-voiture', 'couleur', 'materiel', 'essais', 'course'];

test('identité, classe et dossier du projet', () => {
  assert.equal(projet.id, 'voiture-ballon');
  assert.ok(PICTOS.has(projet.picto));
  assert.deepEqual(reglages.cheminProjet, ['Voiture-ballon']);
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
      for (const t of [e.texte, ...(e.lignes || []).map((l) => l.texte)].filter(Boolean)) assert.ok(S.nombreDeMots(t) <= 8, `${s.id}/${e.id} : « ${t} »`);
      if (e.type === 'photo') assert.ok(e.legende, `${s.id}/${e.id} : légende`);
    }
  }
});

test('dépannage : chaque cause ramène à une étape qui existe (même séance ou « s2/etape »)', () => {
  for (const s of etapes.seances.filter((x) => x.depannage)) {
    assert.ok(S.nombreDeMots(s.depannage.texte) <= 8);
    for (const c of s.depannage.causes) {
      assert.ok(PICTOS.has(c.picto), c.picto);
      const [idS, idE] = c.etape.includes('/') ? c.etape.split('/') : [s.id, c.etape];
      const cible = etapes.seances.find((x) => x.id === idS);
      assert.ok(cible && cible.etapes.some((e) => e.id === idE), `${s.id} : étape ${c.etape} introuvable`);
    }
  }
});

test('une photo officielle de la voiture décorée', () => {
  const officielles = etapes.seances.flatMap((s) => s.etapes.filter((e) => e.officielle));
  assert.equal(officielles.length, 1);
});

test('kit, noms et couleurs d’équipe', () => {
  for (const m of donneesProjet.materiel) assert.ok(m.id && m.nom && PICTOS.has(m.picto) && Number.isInteger(m.prevu), m.id);
  assert.ok(donneesProjet.noms.length >= 6);
  assert.ok(donneesProjet.couleurs.length >= 4);
  for (const c of donneesProjet.couleurs) assert.match(c.hex, /^#[0-9A-F]{6}$/i, c.nom);
});

test('essais : réglages, cartes « je change une chose » et directions', () => {
  const { essais, roues, changements, directions } = donneesProjet;
  assert.ok(essais.min >= 1 && essais.max >= essais.min && essais.ecart > 1 && essais.unite);
  assert.ok(roues.length >= 2);
  for (const c of changements) {
    assert.ok(c.id && c.nom && PICTOS.has(c.picto), c.id);
    assert.ok(c.choix === 'roues' || (Array.isArray(c.choix) && c.choix.length >= 2), c.id);
    for (const x of Array.isArray(c.choix) ? c.choix : []) assert.ok(S.nombreDeMots(x.nom) <= 4, x.nom);
  }
  for (const d of directions) assert.ok(d.id && d.nom && PICTOS.has(d.picto), d.id);
  const s4 = etapes.seances.find((s) => s.id === 's4');
  assert.ok(s4.etapes.some((e) => e.type === 'essais'));
});
