// Moteur de la course de voitures à ballon (séance 5).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const S = require(path.join(__dirname, '..', 'site', 'voiture-ballon', 'js', 'course.js'));

const VOITURES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Fait courir une course : ordre d'arrivée [idEquipe, temps] ; les autres n'arrivent pas (distance).
function courir(course, arrivees, distances) {
  arrivees.forEach(([v, temps], i) => (course.arrivees[v] = { place: i + 1, temps }));
  for (const [v, d] of Object.entries(distances || {})) course.arrivees[v] = { distance: d };
  return course;
}

test('poules selon les couloirs du jour (exemples du plan)', () => {
  assert.deepEqual(S.repartirPoules(VOITURES, 4).map((p) => p.voitures.length), [4, 4]);
  assert.deepEqual(S.repartirPoules(VOITURES, 3).map((p) => p.voitures.length), [3, 3, 2]);
  assert.deepEqual(S.repartirPoules(VOITURES, 2).map((p) => p.voitures.length), [2, 2, 2, 2]);
  const p = S.repartirPoules(VOITURES, 3);
  assert.deepEqual(p.flatMap((x) => x.voitures).sort(), VOITURES, 'chaque voiture dans une seule poule');
  assert.deepEqual(p.map((x) => x.nom), ['Poule 1', 'Poule 2', 'Poule 3']);
});

test('classement d’une course : les arrivées par place, puis les autres de la plus loin à la moins loin', () => {
  const c = courir({ nom: 'Poule 1', voitures: ['A', 'B', 'C', 'D'], arrivees: {} }, [['C', 4.1], ['A', 5.3]], { B: 300, D: 450 });
  assert.ok(S.courseFinie(c));
  assert.deepEqual(S.classerCourse(c).map((r) => r.equipe), ['C', 'A', 'D', 'B']);
  assert.equal(S.courseFinie({ voitures: ['A', 'B'], arrivees: { A: { place: 1 } } }), false);
});

test('finales par niveau : principale, secondaire, tertiaire ; tout le monde court deux fois', () => {
  const poules = S.repartirPoules(VOITURES, 3); // A D G · B E H · C F
  courir(poules[0], [['G', 4.0], ['A', 4.5], ['D', 6.0]]);
  courir(poules[1], [['B', 3.8], ['H', 5.0]], { E: 200 });
  courir(poules[2], [['F', 4.2]], { C: 350 });
  const ordre = S.ordreApresPoules(poules);
  assert.deepEqual(ordre, ['B', 'G', 'F', 'A', 'H', 'C', 'D', 'E']);
  const finales = S.composerFinales(ordre, 3);
  assert.deepEqual(finales.map((f) => f.nom), ['Finale principale', 'Finale secondaire', 'Finale tertiaire']);
  assert.deepEqual(finales.map((f) => f.voitures), [['B', 'G', 'F'], ['A', 'H', 'C'], ['D', 'E']]);
  assert.deepEqual(finales.flatMap((f) => f.voitures).sort(), VOITURES, 'personne n’est éliminé');
  assert.equal(S.composerFinales(ordre.concat(['I', 'J', 'K', 'L', 'M']), 3)[3].nom, 'Finale 4');
  assert.deepEqual(S.composerFinales(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 3).map((f) => f.voitures.length), [3, 2, 2], 'jamais une finale à une seule voiture si on peut l’éviter');
});

test('record de la classe et résultat d’une équipe, message toujours encourageant', () => {
  const poules = S.repartirPoules(['A', 'B', 'C', 'D'], 2); // A C · B D
  courir(poules[0], [['A', 4.0], ['C', 4.4]]);
  courir(poules[1], [['D', 3.6]], { B: 280 });
  const finales = S.composerFinales(S.ordreApresPoules(poules), 2); // D A · C B
  courir(finales[0], [['A', 3.9], ['D', 4.1]]);
  courir(finales[1], [['C', 4.8]], { B: 310 });
  const etat = { poules, finales };
  assert.deepEqual(S.recordCourse([...poules, ...finales]), { equipe: 'D', temps: 3.6, course: 'Poule 2' });
  const a = S.resultatEquipe(etat, 'A');
  assert.equal(a.course, 'Finale principale');
  assert.equal(a.rang, 1);
  assert.equal(S.messageResultat(a).titre, '1re place de la finale principale !');
  const b = S.resultatEquipe(etat, 'B');
  assert.equal(b.arrivee, false);
  assert.equal(S.messageResultat(b).titre, 'Ta voiture a roulé 310 cm.');
  assert.doesNotMatch(JSON.stringify(['A', 'B', 'C', 'D'].map((e) => S.messageResultat(S.resultatEquipe(etat, e)))), /perdu|dernier|éliminé/i);
  assert.match(S.messageResultat(S.resultatEquipe(etat, 'D')).sousTitre, /Record/);
  assert.equal(S.resultatEquipe(etat, 'Z'), null);
});

test('avant les finales, le résultat est celui de la poule', () => {
  const poules = S.repartirPoules(['A', 'B'], 2);
  courir(poules[0], [['B', 5], ['A', 6]]);
  const r = S.resultatEquipe({ poules, finales: [] }, 'A');
  assert.equal(r.course, 'Poule 1');
  assert.equal(S.messageResultat(r).titre, '2e place de ta poule !');
});

test('fichier CSV de la course', () => {
  const poules = S.repartirPoules(['A', 'B'], 2);
  courir(poules[0], [['B', 5.2]], { A: 120 });
  const l = S.lignesCsvCourse({ poules, finales: [] }, (v) => ({ equipe: v + '_X', voiture: 'Bolide ' + v }));
  assert.deepEqual(l[0].slice(0, 3), ['Course', 'Couloir', 'Équipe']);
  assert.deepEqual(l[1], ['Poule 1', 1, 'A_X', 'Bolide A', 2, 'non', '', 120]);
  assert.deepEqual(l[2], ['Poule 1', 2, 'B_X', 'Bolide B', 1, 'oui', '5,2', '']);
});
