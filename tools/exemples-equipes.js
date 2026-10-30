// Équipes FICTIVES pour essayer l'outil professeur : npm run exemples
// Crée exemples/Taille-crayon/ (ignoré par git) avec classe.json et cinq équipes à différents moments du projet,
// photos comprises. Ouvrir ensuite site/taille-crayon/prof.html → « Ouvrir le dossier de la classe » → exemples/Taille-crayon.
// Prénoms inventés : aucune vraie donnée d'élève.
const fs = require('node:fs');
const path = require('node:path');
const { moteur, donnees } = require('../tests/outils.js');

const S = moteur();
const { etapes, modele } = donnees('taille-crayon');
S.etapes = etapes;
const DOSSIER = path.join(__dirname, '..', 'exemples', 'Taille-crayon');
const PHOTO = require('./photo-fictive.js');

const maintenant = Date.now();
const ilYa = (min) => new Date(maintenant - min * 60000).toISOString();
const seance = (id) => etapes.seances.find((s) => s.id === id);

function equipe(eleves, options) {
  const d = S.creerSauvegarde('taille-crayon', { eleves, classe: '6A' });
  const photos = [];
  const photo = (seanceId, etapeId, legende, min) => {
    const fichier = S.nomPhoto(d, seanceId, etapeId);
    d.photos.push({ fichier, seance: seanceId, etape: etapeId, legende, date: ilYa(min) });
    photos.push(fichier);
    return fichier;
  };
  let min = options.debut;
  const faire = (seanceId, jusqua, valeurs) => {
    for (const e of seance(seanceId).etapes) {
      if (jusqua && e.id === jusqua) break;
      min -= 1;
      let valeur = (valeurs || {})[e.id];
      if (e.type === 'photo') valeur = { fichier: photo(seanceId, e.id, e.legende, min) };
      if (e.type === 'cases') valeur = e.lignes.map(() => true);
      if (e.type === 'bilan') valeur = e.phrases.map((_, i) => i);
      S.noterEtape(d, seanceId, e.id, valeur);
      d.seances[seanceId].etapes[e.id].fait = ilYa(min);
    }
  };
  const pieces = (n) => ({
    pieces: Array.from({ length: n }, (_, i) => ({ numero: i + 1, photo: photo('s1', `piece-${String(i + 1).padStart(2, '0')}`, `Pièce ${i + 1}`, min), nom: `Pièce ${String.fromCharCode(65 + i)}`, autreNom: true, date: ilYa(min) })),
  });
  options.faire({ faire, pieces, d, ilYa });
  d.modifieLe = ilYa(options.derniere);
  if (options.aide) d.aides.push({ date: ilYa(options.aide), seance: options.aide_seance || 's1', etape: options.aide_etape || 'pieces', resolue: null });
  const dossier = path.join(DOSSIER, S.nomEquipe(eleves));
  fs.mkdirSync(path.join(dossier, 'photos'), { recursive: true });
  fs.writeFileSync(path.join(dossier, S.nomEquipe(eleves) + '.json'), JSON.stringify(d, null, 1));
  for (const f of photos) fs.writeFileSync(path.join(dossier, f), PHOTO);
}

fs.rmSync(DOSSIER, { recursive: true, force: true });
fs.mkdirSync(DOSSIER, { recursive: true });
fs.writeFileSync(path.join(DOSSIER, 'classe.json'), JSON.stringify({ classe: '6A', eleves: ['Adam', 'Chloé', 'Emma', 'Ilyes', 'Inès', 'Jade', 'Léa', 'Lina', 'Manon', 'Noah', 'Nolan', 'Rayan', 'Sami', 'Tom', 'Yanis', 'Zoé'] }, null, 1));

// Léa et Tom : séance 1 finie, en train de mesurer, aide demandée il y a 2 minutes.
equipe(['Léa', 'Tom'], { debut: 120, derniere: 2, aide: 2, aide_seance: 's2', aide_etape: 'mesure-manivelle', faire: ({ faire, pieces }) => {
  faire('s1', null, { pieces: pieces(6) });
  faire('s2', 'mesure-manivelle', { 'mesure-corps': { essais: [7.5], longueur: 7.5, verdict: 'sans-reference', tropDehors: false, photo: null } });
} });
// Inès et Noah : 2 pièces démontées, rien depuis 15 minutes.
equipe(['Inès', 'Noah'], { debut: 40, derniere: 15, faire: ({ faire, pieces, d }) => {
  faire('s1', 'pieces');
  S.noterBrouillon(d, 's1', 'pieces', pieces(2));
} });
// Adam et Jade : ont sorti trop de pièces, mesure hors de la plage deux fois.
equipe(['Adam', 'Jade'], { debut: 110, derniere: 1, faire: ({ faire, pieces }) => {
  faire('s1', null, { pieces: pieces(8) });
  faire('s2', 'mesure-manivelle', { 'mesure-corps': { essais: [12, 11.5], longueur: 11.5, verdict: 'dehors', tropDehors: true, photo: null } });
} });
// Chloé et Sami : tout le projet est fini.
equipe(['Chloé', 'Sami'], { debut: 200, derniere: 3, faire: ({ faire, pieces }) => {
  faire('s1', null, { pieces: pieces(7) });
  faire('s2', null, {
    'mesure-corps': { essais: [7.5], longueur: 7.5, verdict: 'sans-reference', tropDehors: false, photo: null },
    'mesure-manivelle': { essais: [6], longueur: 6, verdict: 'sans-reference', tropDehors: false, photo: null },
  });
  faire('s3', null, { questions: { reponses: { manivelle: { mode: 'texte', valeur: 'Elle fait tourner les lames.' }, tourner: { mode: 'texte', valeur: 'La manivelle.' }, difficile: { mode: 'texte', valeur: 'Le couvercle.' } } } });
} });
// Emma et Nolan : viennent de commencer.
equipe(['Emma', 'Nolan'], { debut: 5, derniere: 0, faire: ({ faire }) => faire('s1', 'materiel') });

console.log('Équipes fictives prêtes : ' + path.relative(process.cwd(), DOSSIER));
console.log('Ouvrir site/taille-crayon/prof.html → « Ouvrir le dossier de la classe » → ce dossier.');
