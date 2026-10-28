const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur, donnees } = require('./outils.js');

const S = moteur();
const { criteres } = donnees('taille-crayon');
const tout = (v) => Object.fromEntries(criteres.criteres.map((c) => [c.id, v]));

test('7 critères de l’Excel, tous rattachés à une compétence et un domaine ; ceinture sur le remontage', () => {
  assert.equal(criteres.criteres.length, 7);
  for (const c of criteres.criteres) assert.ok(c.libelle && c.entete && c.competence && c.domaine, c.id);
  assert.equal(criteres.critereCeinture, 'remontage');
  assert.equal(criteres.ceintures.length, 4);
  assert.ok(!criteres.ceintures.some((n) => /rouge/i.test(n)), 'pas de ceinture rouge pour les élèves');
});

test('note : formule de l’Excel (score ÷ 21 × 20, arrondi à 0,1) et appréciations', () => {
  assert.deepEqual(S.noter(tout(3), criteres.criteres), { score: 21, max: 21, note: 20, appreciation: 'Très satisfaisant', complet: true, evalues: 7 });
  assert.equal(S.noter(tout(1), criteres.criteres).note, 6.7, 'tout jaune = 6,7 (cahier des charges §8.3)');
  assert.equal(S.noter(tout(0), criteres.criteres).appreciation, 'Insuffisant');
  const ex = { procedure: 1, securite: 1, mesure: 2, dessin: 2, remontage: 2, questions: 2, autonomie: 3 };
  assert.equal(S.noter(ex, criteres.criteres).note, 12.4);
  assert.equal(S.noter(ex, criteres.criteres).appreciation, 'Satisfaisant');
  assert.equal(S.noter({ remontage: 3 }, criteres.criteres).complet, false);
  assert.equal(S.noter({}, criteres.criteres).note, null, 'rien d’évalué : pas de note');
});

test('ceinture = niveau du remontage fonctionnel', () => {
  assert.equal(S.ceinture({ remontage: 0 }, criteres).nom, 'Ceinture blanche');
  assert.equal(S.ceinture({ remontage: 3, procedure: 0 }, criteres).nom, 'Ceinture vert foncé');
  assert.equal(S.ceinture({ procedure: 3 }, criteres), null);
});

test('binôme lié : un geste pour les deux ; délié : chacun le sien', () => {
  const p = S.professeurVide('taille-crayon');
  S.poserNiveau(p, 'Léa_Tom', ['Léa', 'Tom'], 'Léa', 'mesure', 2);
  assert.equal(p.evaluations['Léa_Tom'].eleves.Tom.niveaux.mesure, 2);
  p.evaluations['Léa_Tom'].lie = false;
  S.poserNiveau(p, 'Léa_Tom', ['Léa', 'Tom'], 'Tom', 'mesure', 3);
  assert.equal(p.evaluations['Léa_Tom'].eleves.Léa.niveaux.mesure, 2);
  S.poserNiveau(p, 'Léa_Tom', ['Léa', 'Tom'], 'Tom', 'mesure', null);
  assert.equal(p.evaluations['Léa_Tom'].eleves.Tom.niveaux.mesure, undefined);
  assert.equal(S.niveauSuivant(undefined), 0);
  assert.equal(S.niveauSuivant(3), null);
});

function classe() {
  const p = S.professeurVide('taille-crayon');
  const eq = (eleves) => ({ nom: S.nomEquipe(eleves), donnees: S.creerSauvegarde('taille-crayon', { eleves, classe: '6A' }) });
  const equipes = [eq(['Léa', 'Tom']), eq(['Inès', 'Noah'])];
  for (const [c, v] of Object.entries(tout(2))) S.poserNiveau(p, 'Léa_Tom', ['Léa', 'Tom'], 'Léa', c, v);
  S.evaluationEquipe(p, 'Inès_Noah', ['Inès', 'Noah']).lie = false;
  S.poserNiveau(p, 'Inès_Noah', ['Inès', 'Noah'], 'Inès', 'remontage', 3);
  return S.lignesEleves(p, equipes, criteres);
}

test('export Carnet de classe : format labo-blocs/resultats v1, niveaux 1 à 4, binôme pareil = une entrée', () => {
  const r = S.resultatsCarnet(classe(), criteres, { id: 'taille-crayon' }, '2026-11-20');
  assert.equal(r.format, 'labo-blocs/resultats');
  assert.equal(r.version, 1);
  assert.deepEqual(r.competences.map((c) => c.libelle), criteres.criteres.map((c) => c.libelle));
  const lt = r.equipes.find((e) => e.eleves.includes('Léa'));
  assert.deepEqual(lt.eleves, ['Léa', 'Tom']);
  assert.equal(lt.niveaux.C1, 3, 'Vert clair → 3 dans le Carnet');
  assert.ok(r.equipes.some((e) => e.eleves.length === 1 && e.eleves[0] === 'Inès' && e.niveaux.C5 === 4));
  assert.match(r.avertissement, /peut différer/);
});

test('CSV : point-virgule, BOM, une ligne par élève ; sans note si demandé', () => {
  const t = S.csvClasse(classe(), criteres);
  assert.ok(t.startsWith('﻿'));
  const lignes = t.trim().split('\r\n');
  assert.equal(lignes.length, 5);
  assert.match(lignes.find((l) => l.includes(';Léa;')), /Vert clair.*;14;13,3;Satisfaisant;Ceinture verte/);
  assert.ok(!S.csvClasse(classe(), criteres, { note: false }).includes('Note /20'));
});

test('classeur Excel : 5 feuilles, formules de l’Excel, liste déroulante, ligne d’exemple hors synthèse', () => {
  const octets = S.classeurEvaluation(classe(), criteres);
  const texte = Buffer.from(octets).toString('utf8');
  assert.equal(Buffer.from(octets.slice(0, 2)).toString(), 'PK');
  for (const f of ['Évaluation', 'Synthèse classe', 'Légende', 'Référentiel compétences', 'Pronote']) assert.ok(texte.includes(`name="${f}"`), f);
  assert.ok(texte.includes('ROUND(K3/21*20,1)'));
  assert.ok(texte.includes('COUNTIF(D3:J3,&quot;Vert foncé&quot;)*3'));
  assert.ok(texte.includes('<formula1>"Rouge,Jaune,Vert clair,Vert foncé"</formula1>'));
  assert.ok(texte.includes("AVERAGE('Évaluation'!$L$3:$L$18)"));
  assert.ok(texte.includes('Non atteint') && texte.includes('Dépassé'), 'onglet Pronote');
  assert.ok(texte.includes('fullCalcOnLoad="1"'));
});
