const test = require('node:test');
const assert = require('node:assert/strict');
const { moteur } = require('./outils.js');

const S = moteur();
const equipe = { eleves: ['Léa', 'Tom'], classe: '6A' };

test('une nouvelle sauvegarde porte l’application, le projet, la version et l’équipe', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  assert.equal(d.application, 'segpa');
  assert.equal(d.projet, 'taille-crayon');
  assert.equal(d.formatVersion, 1);
  assert.deepEqual(d.equipe, equipe);
  assert.deepEqual(d.photos, []);
  assert.deepEqual(d.aides, []);
});

test('relire une sauvegarde écrite donne les mêmes données', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  S.noterEtape(d, 's1', 'regle-force');
  const r = S.lireSauvegarde(JSON.stringify(d), 'taille-crayon');
  assert.ok(r.ok);
  assert.ok(S.etapeFaite(r.donnees, 's1', 'regle-force'));
});

test('un fichier illisible, d’une autre application ou d’un autre projet est refusé avec une phrase pour l’élève', () => {
  assert.equal(S.lireSauvegarde('pas du json').ok, false);
  assert.equal(S.lireSauvegarde(JSON.stringify({ application: 'atelier-cereales', equipe: equipe })).ok, false);
  const autre = S.creerSauvegarde('voiture-ballon', equipe);
  const r = S.lireSauvegarde(JSON.stringify(autre), 'taille-crayon');
  assert.equal(r.ok, false);
  assert.equal(r.autreProjet, 'voiture-ballon');
  assert.match(r.raison, /autre projet/);
});

test('une sauvegarde d’une version plus récente du site n’est pas ouverte (rien ne se perd)', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  d.formatVersion = 99;
  assert.equal(S.lireSauvegarde(JSON.stringify(d), 'taille-crayon').ok, false);
});

test('une sauvegarde incomplète (rubriques manquantes) se lit et se complète', () => {
  const r = S.lireSauvegarde(JSON.stringify({ application: 'segpa', projet: 'taille-crayon', equipe: { eleves: ['Léa'] } }), 'taille-crayon');
  assert.ok(r.ok);
  assert.deepEqual(r.donnees.photos, []);
  assert.deepEqual(r.donnees.seances, {});
  assert.equal(r.donnees.formatVersion, 1);
});

test('étape faite, passée, brouillon', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  S.noterBrouillon(d, 's1', 'rangement', [true, false, false]);
  assert.equal(S.etapeFaite(d, 's1', 'rangement'), false);
  assert.deepEqual(S.valeurEtape(d, 's1', 'rangement'), [true, false, false]);
  S.noterEtape(d, 's1', 'rangement', [true, true, true]);
  assert.ok(S.etapeFaite(d, 's1', 'rangement'));
  S.passerEtape(d, 's1', 'boite');
  assert.equal(S.etapeFaite(d, 's1', 'boite'), false);
  assert.ok(S.etapeTerminee(d, 's1', 'boite'));
  S.passerEtape(d, 's1', 'rangement');
  assert.ok(S.etapeFaite(d, 's1', 'rangement'), 'une étape faite ne redevient pas « passée »');
});

test('les noms de photos ne se répètent jamais', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  const a = S.nomPhoto(d, 's1', 'boite');
  assert.equal(a, 'photos/s1-boite-01.jpg');
  S.ajouterPhoto(d, { fichier: a, seance: 's1', etape: 'boite', legende: 'Ma boîte fermée' });
  assert.equal(S.nomPhoto(d, 's1', 'boite'), 'photos/s1-boite-02.jpg');
  assert.equal(S.nomPhoto(d, 's1', 'boite', ['photos/s1-boite-02.jpg']), 'photos/s1-boite-03.jpg');
  assert.equal(S.photosDe(d, 's1').length, 1);
  assert.equal(S.photosDe(d, 's2').length, 0);
});

test('une seule demande d’aide à la fois, horodatée, puis résolue', () => {
  const d = S.creerSauvegarde('taille-crayon', equipe);
  const a = S.demanderAide(d, 's1', 'pieces');
  assert.equal(S.demanderAide(d, 's1', 'autre'), a);
  assert.equal(d.aides.length, 1);
  assert.ok(a.date);
  S.finirAide(d);
  assert.equal(S.aideEnCours(d), null);
  assert.ok(d.aides[0].resolue);
});

test('noms d’équipe et prénoms', () => {
  assert.equal(S.nomEquipe(['Léa', 'Tom']), 'Léa_Tom');
  assert.equal(S.nomEquipe(['Jean Paul', 'A/B']), 'Jean-Paul_A-B');
  assert.equal(S.simplifierNom('Inès'), S.simplifierNom('ines'));
  assert.equal(S.majuscule('  léa '), 'Léa');
  assert.deepEqual(S.remplirChemin(['Classe', '{classe}', 'COMMUN'], '6A'), ['Classe', '6A', 'COMMUN']);
});
