// Équipes FICTIVES du film en stop motion pour essayer l'outil professeur et la séance cinéma : npm run exemples
// Crée exemples/Stop-motion/ (ignoré par git) avec classe.json et quatre équipes à différents moments du projet,
// images du film comprises. Ouvrir ensuite site/stop-motion/prof.html (ou cinema.html) → ce dossier.
// Prénoms inventés : aucune vraie donnée d'élève.
const fs = require('node:fs');
const path = require('node:path');
const { moteur, donnees } = require('../tests/outils.js');
const PHOTO = require('./photo-fictive.js');

const S = moteur();
require('../site/stop-motion/js/studio.js');
const { etapes } = donnees('stop-motion');
const DOSSIER = path.join(__dirname, '..', 'exemples', 'Stop-motion');
const maintenant = Date.now();
const ilYa = (min) => new Date(maintenant - min * 60000).toISOString();
const seance = (id) => etapes.seances.find((s) => s.id === id);

const HISTOIRES = {
  dragon: { heros: 'Un dragon', lieu: 'sur la Lune', action: 'dort tranquillement', probleme: 'Une tempête arrive.', solution: 'Un ami vient aider.', fin: "C'est la fête !", objets: 'une maison, une fusée' },
  robot: { heros: 'Un robot', lieu: 'en ville', action: 'joue au ballon', probleme: "C'est la panne !", solution: 'Une machine répare tout.', fin: 'Tout est réparé.', objets: 'une voiture, un pont' },
  chat: { heros: 'Un chat', lieu: 'à la plage', action: 'cherche un trésor', probleme: 'Le trésor disparaît.', solution: 'Tout le monde travaille ensemble.', fin: 'Le trésor est retrouvé.', objets: 'un coffre au trésor, un arbre' },
};

function equipe(eleves, options) {
  const d = S.creerSauvegarde('stop-motion', { eleves, classe: '6A' });
  const photos = [];
  const images = [];
  // faire(séance, début (minutes avant maintenant), jusqu'à l'étape exclue, { images, titre })
  const faire = (seanceId, debut, jusqua, o) => {
    o = o || {};
    let min = debut;
    d.seances[seanceId] = { debut: ilYa(debut), etapes: {} };
    for (const e of seance(seanceId).etapes) {
      if (jusqua && e.id === jusqua) break;
      min -= 2;
      let valeur;
      if (e.type === 'photo') {
        const fichier = S.nomPhoto(d, seanceId, e.id);
        d.photos.push({ fichier, seance: seanceId, etape: e.id, legende: e.legende, date: ilYa(min) });
        photos.push(fichier);
        valeur = { fichier };
      }
      if (e.type === 'idee-histoire') S.noterHistoire(d, e.partie, options.histoire[e.partie]);
      if (e.type === 'titre-film' && o.titre) S.noterFilm(d, S.noterTitre(S.filmDe(d), o.titre));
      if (e.type === 'tournage') {
        let f = S.filmDe(d);
        for (let i = 0; i < (o.images || 0); i++) {
          const fichier = S.prochainNomFilm(f);
          f = S.ajouterImageFilm(f, fichier, ilYa(min - i * 0.5)).valeur;
          images.push(fichier);
        }
        S.noterFilm(d, f);
        min -= (o.images || 0) * 0.5;
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
  fs.mkdirSync(path.join(dossier, 'photos', 'film'), { recursive: true });
  fs.writeFileSync(path.join(dossier, S.nomEquipe(eleves) + '.json'), JSON.stringify(d, null, 1));
  for (const f of photos.concat(images)) fs.writeFileSync(path.join(dossier, f), PHOTO);
}

const JOUR = 60 * 24 * 7;
fs.rmSync(DOSSIER, { recursive: true, force: true });
fs.mkdirSync(DOSSIER, { recursive: true });
fs.writeFileSync(path.join(DOSSIER, 'classe.json'), JSON.stringify({ classe: '6A', eleves: ['Adam', 'Chloé', 'Emma', 'Ilyes', 'Inès', 'Jade', 'Léa', 'Lina', 'Manon', 'Noah', 'Nolan', 'Rayan', 'Sami', 'Tom', 'Yanis', 'Zoé'] }, null, 1));

// Léa et Tom : séance 3 commencée il y a 30 minutes, pas encore d'image ; aide demandée.
equipe(['Léa', 'Tom'], { histoire: HISTOIRES.dragon, derniere: 3, aide: 3, aide_seance: 's3', aide_etape: 'tournage', faire: ({ faire }) => {
  faire('s1', 2 * JOUR, null, { titre: 'Le dragon perdu' });
  faire('s2', JOUR);
  faire('s3', 30, 'tournage');
} });
// Inès et Noah : tout le projet est fini (36 images, une enlevée, vitesse lente).
equipe(['Inès', 'Noah'], { histoire: HISTOIRES.robot, derniere: 5, faire: ({ faire, d }) => {
  faire('s1', 4 * JOUR, null, { titre: 'Le robot qui danse' });
  faire('s2', 3 * JOUR);
  faire('s3', 2 * JOUR, null, { images: 20 });
  faire('s4', JOUR, null, { images: 16 });
  faire('s5', 60);
  S.noterFilm(d, S.choisirVitesse(S.basculerImage(S.filmDe(d), 7), 'lent'));
} });
// Adam et Jade : séance 3 finie avec 18 images.
equipe(['Adam', 'Jade'], { histoire: HISTOIRES.chat, derniere: 20, faire: ({ faire }) => {
  faire('s1', 2 * JOUR, null, { titre: 'Le trésor du pirate' });
  faire('s2', JOUR);
  faire('s3', 90, null, { images: 18 });
} });
// Emma et Sami : séance 2 commencée il y a une heure, plaque prise, rangement pas fait.
equipe(['Emma', 'Sami'], { histoire: HISTOIRES.dragon, derniere: 12, faire: ({ faire }) => {
  faire('s1', JOUR, null, { titre: 'La course folle' });
  faire('s2', 60, 'secouer');
} });

console.log('Équipes fictives prêtes : ' + path.relative(process.cwd(), DOSSIER));
console.log('Ouvrir site/stop-motion/prof.html (ou cinema.html) → « Ouvrir le dossier » → ce dossier.');
