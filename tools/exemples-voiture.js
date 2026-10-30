// Équipes FICTIVES de la voiture à ballon pour essayer l'outil professeur : npm run exemples
// Crée exemples/Voiture-ballon/ (ignoré par git) avec classe.json et quatre équipes à différents moments du projet,
// photos comprises. Ouvrir ensuite site/voiture-ballon/prof.html → « Ouvrir le dossier de la classe » → ce dossier.
// Prénoms inventés : aucune vraie donnée d'élève.
const fs = require('node:fs');
const path = require('node:path');
const { moteur, donnees } = require('../tests/outils.js');
const PHOTO = require('./photo-fictive.js');

const S = moteur();
require('../site/voiture-ballon/js/essais.js');
const { etapes } = donnees('voiture-ballon');
const DOSSIER = path.join(__dirname, '..', 'exemples', 'Voiture-ballon');
const maintenant = Date.now();
const ilYa = (min) => new Date(maintenant - min * 60000).toISOString();
const seance = (id) => etapes.seances.find((s) => s.id === id);

// Essais : [[pompe, distance, direction, changement]] (le premier sans changement).
function serieEssais(avant, arriere, liste, graphique) {
  let v = S.noterEssai(S.noterEssai(S.essaisVides(), 'roues-avant', avant), 'roues-arriere', arriere);
  liste.forEach(([pompe, distance, direction, changement], i) => {
    if (i) v = S.noterEssai(v, 'changer', changement);
    for (const [quoi, x] of [['ligne'], ['gonfle', pompe], ['lache'], ['mesure', distance], ['direction', direction]]) v = S.noterEssai(v, quoi, x);
  });
  return graphique ? S.noterEssai(v, 'graphique') : v;
}

function equipe(eleves, options) {
  const d = S.creerSauvegarde('voiture-ballon', { eleves, classe: '6A' });
  const photos = [];
  let min = options.debut;
  const faire = (seanceId, jusqua, valeurs) => {
    for (const e of seance(seanceId).etapes) {
      if (jusqua && e.id === jusqua) break;
      min -= 1;
      let valeur = (valeurs || {})[e.id];
      if (e.type === 'photo') {
        const fichier = S.nomPhoto(d, seanceId, e.id);
        d.photos.push({ fichier, seance: seanceId, etape: e.id, legende: e.legende, date: ilYa(min) });
        photos.push(fichier);
        valeur = { fichier };
      }
      if (e.type === 'cases') valeur = e.lignes.map(() => true);
      if (e.type === 'bilan') valeur = e.phrases.map((_, i) => i % 2);
      S.noterEtape(d, seanceId, e.id, valeur);
      d.seances[seanceId].etapes[e.id].fait = ilYa(min);
    }
  };
  options.faire({ faire, d });
  d.modifieLe = ilYa(options.derniere);
  if (options.aide) d.aides.push({ date: ilYa(options.aide), seance: options.aide_seance, etape: options.aide_etape, resolue: null });
  const dossier = path.join(DOSSIER, S.nomEquipe(eleves));
  fs.mkdirSync(path.join(dossier, 'photos'), { recursive: true });
  fs.writeFileSync(path.join(dossier, S.nomEquipe(eleves) + '.json'), JSON.stringify(d, null, 1));
  for (const f of photos) fs.writeFileSync(path.join(dossier, f), PHOTO);
}

const KIT = { chassis: 1, piques: 2, roues: 4, elastique: 1, ballons: 2 };
const s1 = (nom, couleur, hex, pris) => ({ nom: { nom, ecrit: false }, couleur: { nom: couleur, hex }, materiel: { pris: pris || KIT } });

fs.rmSync(DOSSIER, { recursive: true, force: true });
fs.mkdirSync(DOSSIER, { recursive: true });
fs.writeFileSync(path.join(DOSSIER, 'classe.json'), JSON.stringify({ classe: '6A', eleves: ['Adam', 'Chloé', 'Emma', 'Ilyes', 'Inès', 'Jade', 'Léa', 'Lina', 'Manon', 'Noah', 'Nolan', 'Rayan', 'Sami', 'Tom', 'Yanis', 'Zoé'] }, null, 1));

// Léa et Tom : en plein dans les essais (2 essais), aide demandée il y a 2 minutes.
equipe(['Léa', 'Tom'], { debut: 300, derniere: 2, aide: 2, aide_seance: 's4', aide_etape: 'essais', faire: ({ faire, d }) => {
  faire('s1', null, s1('Turbo Ballon', 'Bleu', '#1D4ED8'));
  faire('s2');
  faire('s3');
  faire('s4', 'essais');
  S.noterBrouillon(d, 's4', 'essais', serieEssais('30', '30', [[10, 210, 'droit'], [10, 280, 'gauche', { type: 'roues', cote: 'arriere', choix: '40' }]]));
} });
// Inès et Noah : tout le projet est fini ; une pique en moins dans le kit.
equipe(['Inès', 'Noah'], { debut: 500, derniere: 4, faire: ({ faire }) => {
  faire('s1', null, s1('Comète', 'Rose', '#DB2777', Object.assign({}, KIT, { piques: 1 })));
  faire('s2');
  faire('s3');
  faire('s4', null, { essais: serieEssais('40', '40', [[12, 310, 'droit'], [15, 390, 'droit', { type: 'ballon', choix: 'plus' }], [15, 420, 'droite', { type: 'poids', choix: 'enleve' }]], true) });
  faire('s5', null, { resultat: { resultat: { course: 'Finale principale', finale: true, rang: 2, nombre: 3, arrivee: true, temps: 3.9, distance: null, record: false } }, pourquoi: { texte: 'L’air sort du ballon vers l’arrière et pousse la voiture vers l’avant.' } });
} });
// Adam et Jade : la voiture n'avance pas (deux essais à 0 cm).
equipe(['Adam', 'Jade'], { debut: 280, derniere: 1, faire: ({ faire, d }) => {
  faire('s1', null, s1('Bolide', 'Orange', '#EA580C'));
  faire('s2');
  faire('s3');
  faire('s4', 'essais');
  S.noterBrouillon(d, 's4', 'essais', serieEssais('20', '20', [[8, 0, 'gauche'], [12, 0, 'gauche', { type: 'ballon', choix: 'plus' }], [12, 150, 'droit', { type: 'roues', cote: 'avant', choix: '40' }]]));
} });
// Emma et Sami : séance 2 en cours, rien depuis 15 minutes.
equipe(['Emma', 'Sami'], { debut: 90, derniere: 15, faire: ({ faire }) => {
  faire('s1', null, s1('Éclair', 'Jaune', '#CA8A04'));
  faire('s2', 'ballon');
} });

console.log('Équipes fictives prêtes : ' + path.relative(process.cwd(), DOSSIER));
console.log('Ouvrir site/voiture-ballon/prof.html → « Ouvrir le dossier de la classe » → ce dossier.');
