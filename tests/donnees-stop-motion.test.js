// Contrôle des données du film en stop motion.
const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur, donnees, pictos } = require('./outils.js');

const S = moteur();
const { projet, etapes, reglages, donneesProjet } = donnees('stop-motion');
const PICTOS = new Set(pictos());
const TYPES = ['regle', 'consigne', 'photo', 'cases', 'bilan', 'tournage', 'titre-film', 'projection', 'trier-images', 'idee-histoire', 'histoire-resume', 'construire'];

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
      for (const t of [e.texte, e.texteEcrire, e.fin, ...(e.lignes || []).map((l) => l.texte)].filter(Boolean)) assert.ok(S.nombreDeMots(t) <= 8, `${s.id}/${e.id} : « ${t} »`);
      if (e.type === 'photo') assert.ok(e.legende, `${s.id}/${e.id} : légende`);
      if (e.type === 'projection') assert.ok(['vitesse', 'final'].includes(e.mode), `${s.id}/${e.id} : mode`);
      for (const ph of e.phrases || []) assert.ok(S.nombreDeMots(ph) <= 8, `${s.id}/${e.id} : « ${ph} »`);
    }
  }
});

test('les 3 règles du matériel validées par Thomas, en séance 1', () => {
  const textes = etapes.seances[0].etapes.filter((e) => e.type === 'regle').map((e) => e.texte);
  assert.deepEqual(textes, ['Je ne touche pas l\'objectif de la caméra.', 'Je compte mes briques.', 'Je range les briques par couleur.']);
});

test('séances 3 et 4 : je relis mon histoire, 3 rappels, puis l’écran de tournage', () => {
  for (const id of ['s3', 's4']) {
    const s = etapes.seances.find((x) => x.id === id);
    const types = s.etapes.map((e) => e.type);
    assert.deepEqual(types.slice(0, 5), ['histoire-resume', 'regle', 'regle', 'regle', 'tournage'], id);
    assert.ok(s.etapes[0].relire, id);
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

test('séance 5 : titre, vitesse, images ratées, film fini, cinéma, bilan ; idées de titres', () => {
  const s5 = etapes.seances.find((x) => x.id === 's5');
  assert.deepEqual(s5.etapes.map((e) => e.type), ['titre-film', 'projection', 'trier-images', 'projection', 'consigne', 'bilan']);
  const titres = donneesProjet.idees.titres;
  assert.ok(titres.length >= 6);
  for (const t of titres) assert.ok(t.length <= 40 && S.nombreDeMots(t) <= 5, t);
});

test('séance 1 : le scénario en 7 questions, le titre, puis le récap (pas de photo du storyboard) ; idées pour chaque partie', () => {
  const s1 = etapes.seances.find((x) => x.id === 's1');
  assert.deepEqual(s1.etapes.filter((e) => e.type === 'idee-histoire').map((e) => e.partie), ['heros', 'lieu', 'action', 'probleme', 'solution', 'fin', 'objets']);
  assert.deepEqual(s1.etapes.slice(-2).map((e) => e.type), ['titre-film', 'histoire-resume']);
  assert.ok(!s1.etapes.some((e) => e.type === 'photo'), 'pas de photo du storyboard (retour de Thomas)');
  for (const partie of ['heros', 'lieu', 'action', 'probleme', 'solution', 'fin', 'objets']) {
    const liste = donneesProjet.idees[partie];
    assert.ok(liste.length >= 4 && liste.length <= 6, partie);
    for (const t of liste) {
      assert.ok(t.length <= 40 && S.nombreDeMots(t) <= 6, t);
      assert.ok(!/\b(il|elle)\b/i.test(t), `« ${t} » : sans « il » ni « elle »`);
    }
  }
});

test('séance 2 : la plaque, puis décor, héros et objets (une photo après chaque construction)', () => {
  const s2 = etapes.seances.find((x) => x.id === 's2');
  const types = s2.etapes.map((e) => e.type);
  assert.ok(s2.etapes.some((e) => e.id === 'plaque'));
  for (let i = 0; i < types.length; i++) if (types[i] === 'construire') assert.equal(types[i + 1], 'photo', s2.etapes[i].id);
  assert.deepEqual(s2.etapes.filter((e) => e.type === 'construire').map((e) => e.partie), ['lieu', 'heros', 'objets']);
});

test('évaluation : 7 critères (proposition à valider), repères connus, ceinture sur un critère existant', () => {
  const { criteres } = donnees('stop-motion');
  assert.equal(criteres.criteres.length, 7);
  const ids = criteres.criteres.map((c) => c.id);
  assert.equal(new Set(ids).size, 7);
  assert.ok(ids.includes(criteres.critereCeinture));
  assert.equal(criteres.ceintures.length, 4);
  for (const c of criteres.criteres) assert.ok(c.libelle && c.entete && c.competence && c.domaine && c.repere === c.id, c.id);
});
