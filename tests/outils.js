// Outils communs aux tests : chargement du moteur et des données d'un projet, comme dans le navigateur.
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs');

const SITE = path.join(__dirname, '..', 'site');

// Moteur commun (outils, sauvegarde, étapes) : un seul objet Segpa.
function moteur() {
  require(path.join(SITE, 'commun/js/outils.js'));
  require(path.join(SITE, 'commun/js/moteur/sauvegarde.js'));
  require(path.join(SITE, 'commun/js/moteur/mesure.js'));
  return require(path.join(SITE, 'commun/js/moteur/etapes.js'));
}

// Données d'un projet lues dans un bac à sable (les fichiers appellent definirXxx({...})).
function donnees(projet) {
  const lu = {};
  const bac = {
    definirProjet: (p) => (lu.projet = p),
    definirEtapes: (e) => (lu.etapes = e),
    definirReglagesAtelier: (r) => (lu.reglages = r),
    definirCollege: (c) => (lu.college = c),
    definirModele: (m) => (lu.modele = m),
  };
  vm.createContext(bac);
  for (const f of ['projet.js', 'classes.js', 'modele.js', 'etapes.js']) vm.runInContext(fs.readFileSync(path.join(SITE, projet, 'donnees', f), 'utf8'), bac, { filename: f });
  vm.runInContext(fs.readFileSync(path.join(SITE, 'commun/donnees/college.js'), 'utf8'), bac);
  return JSON.parse(JSON.stringify(lu));
}

// Noms des pictogrammes dessinés (pictos.js est écrit pour le navigateur).
function pictos() {
  const bac = { window: { Segpa: {} } };
  vm.createContext(bac);
  vm.runInContext(fs.readFileSync(path.join(SITE, 'commun/js/pictos.js'), 'utf8'), bac);
  return bac.window.Segpa.PICTOS;
}

module.exports = { SITE, moteur, donnees, pictos };
