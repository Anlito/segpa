const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur } = require('./outils.js');

const S = moteur();
const seances = [
  { id: 's1', titre: 'Je démonte', etapes: [{ id: 'a', type: 'regle', texte: 'Règle' }, { id: 'p', type: 'photo', texte: 'Photo' }] },
  { id: 's2', titre: 'Je mesure', etapes: [{ id: 'c', type: 'consigne', texte: 'Consigne' }] },
];
const equipe = (eleves, modifieLe) => {
  const d = S.creerSauvegarde('taille-crayon', { eleves, classe: '6A' });
  d.modifieLe = modifieLe || d.modifieLe;
  return d;
};

test('fusion des fichiers : une tuile par équipe, le fichier le plus récent gagne, les autres sont signalés', () => {
  const ancien = equipe(['Léa', 'Tom'], '2026-11-03T09:00:00Z');
  const recent = equipe(['Lea', 'Tom'], '2026-11-03T10:00:00Z');
  const autre = equipe(['Inès', 'Noah']);
  const r = S.fusionner(
    [
      { nom: 'a.json', texte: JSON.stringify(ancien) },
      { nom: 'b.json', texte: JSON.stringify(recent) },
      { nom: 'c.json', texte: JSON.stringify(autre) },
      { nom: 'classe.json', texte: '{"eleves":[]}' },
    ],
    'taille-crayon'
  );
  assert.equal(r.equipes.length, 2);
  const lt = r.equipes.find((e) => e.donnees.equipe.eleves.includes('Tom'));
  assert.equal(lt.donnees.modifieLe, '2026-11-03T10:00:00Z');
  assert.deepEqual(lt.autres, ['a.json']);
  assert.equal(r.invalides.length, 1);
});

test('résumé : séances, séance du jour, aide, dernière photo, photo laissée pour plus tard', () => {
  const d = equipe(['Léa', 'Tom']);
  S.noterEtape(d, 's1', 'a');
  S.passerEtape(d, 's1', 'p');
  S.ajouterPhoto(d, { fichier: 'photos/s1-x-01.jpg', seance: 's1', etape: 'x', legende: 'X' });
  S.demanderAide(d, 's2', 'c');
  const r = S.resumer(d, seances, Date.now());
  assert.equal(r.noms, 'Léa · Tom');
  assert.deepEqual(r.seances.map((s) => s.etat), ['fait', 'a_faire']);
  assert.equal(r.courante, 's2');
  assert.ok(r.aide);
  assert.equal(r.dernierePhoto.fichier, 'photos/s1-x-01.jpg');
  assert.deepEqual(r.passees, [{ seance: 's1', etape: 'p' }]);
});

test('alertes : aide (disparaît quand le professeur l’a vue), inactivité, alertes du projet', () => {
  const d = equipe(['Léa', 'Tom']);
  const aide = S.demanderAide(d, 's1', 'a');
  const t = new Date(d.modifieLe).getTime() + 12 * 60000;
  const r = S.resumer(d, seances, t);
  const a = S.alertes(r, null, [{ sorte: 'dehors', texte: 'Plus de 2 pièces dehors' }]);
  assert.deepEqual(a.map((x) => x.sorte), ['aide', 'inactif', 'dehors']);
  assert.match(a[0].texte, /depuis 12 min/);
  assert.ok(!S.alertes(r, aide.date).some((x) => x.sorte === 'aide'), 'aide vue par le professeur');
  const plusTard = S.resumer(d, seances, t + 3 * 3600000);
  assert.ok(!S.alertes(plusTard).some((x) => x.sorte === 'inactif'), 'pas d’alerte d’inactivité le lendemain');
});

test('ordre des tuiles : aide d’abord, puis alertes, puis prénoms', () => {
  const x = (noms, alertes, date) => ({ resume: { noms, aide: date ? { date } : null }, alertes });
  const r = S.trier([x('Zoé', []), x('Adam', [{ sorte: 'inactif' }]), x('Tom', [{ sorte: 'aide' }], '2'), x('Léa', [{ sorte: 'aide' }], '1'), x('Emma', [])]);
  assert.deepEqual(r.map((e) => e.resume.noms), ['Léa', 'Tom', 'Adam', 'Emma', 'Zoé']);
});

test('historique : étapes et aides, du plus récent au plus ancien', () => {
  const d = equipe(['Léa']);
  d.seances = { s1: { etapes: { a: { fait: '2026-11-03T09:00:00Z' } } } };
  d.aides = [{ date: '2026-11-03T09:05:00Z', seance: 's1', etape: 'p', resolue: '2026-11-03T09:07:00Z' }];
  const h = S.historique(d, seances);
  assert.deepEqual(h.map((l) => l.date), ['2026-11-03T09:07:00Z', '2026-11-03T09:05:00Z', '2026-11-03T09:00:00Z']);
});

test('professeur.json : lu s’il est du bon projet, vide sinon', () => {
  const p = S.lireProfesseur(JSON.stringify({ application: 'segpa', projet: 'taille-crayon', type: 'professeur', drapeaux: { Léa_Tom: ['roles'] } }), 'taille-crayon');
  assert.deepEqual(p.drapeaux, { Léa_Tom: ['roles'] });
  assert.deepEqual(p.aidesVues, {});
  assert.deepEqual(S.lireProfesseur('{"application":"segpa","projet":"voiture-ballon","type":"professeur"}', 'taille-crayon').drapeaux, {});
  assert.deepEqual(S.lireProfesseur('pas du json', 'taille-crayon').drapeaux, {});
});
