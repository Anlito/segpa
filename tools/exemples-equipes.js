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
// Petite photo grise « photo fictive » (JPEG 320 × 180).
const PHOTO = Buffer.from('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CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJutVnSyuJFhEY/fpFIH3HegbkjHT5DWtVGPSbZUlWUGXzWkLZYgYckkAZ44OMigBDqMyzfZ3tlE7Fdi+Z8pDBjyccY2N2PaoI9WnkvDEsCHcFVVMmMPmQNk46fuz+Q9eL8tnBM7O6HewUbgxBG0kjBB4+8enrTDptpxiIghQoKuwPBJHIPXJPPXk+tGgFeW6mnFl5Q8vzLlo5RvwRtD5Gcc8r+OPenWmozXcSPFbBl2pvLSYIZkDenI+YZP6VaW1gRYlVMCFtycng4Iz78E9fWmR6daxNGUiI8sKFG844GBkZwSB3PNAFOz1OV4oDPGCZIoXdlbgeZuAOMeoH5+3LotYM0oVLVym8KWAY43Ywfu4xgqTkjr+dldOtFhaERHY0YjI3t90EkDOeMZP+RTvsNt5qyeXgrjADEDjoSOhIp6AWKKKKQBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Z', 'base64');

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
