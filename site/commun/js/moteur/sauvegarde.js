// Sauvegarde d'une équipe : tout tient dans un objet, écrit dans « Prénom_Prénom.json » dans le dossier de l'équipe.
// Les photos ne sont jamais dans ce fichier : elles sont à côté, dans le sous-dossier « photos/ ».
//
//   application   'segpa' (le même pour tous les projets du dossier SEGPA)
//   projet        identifiant du projet ('taille-crayon'…) : une sauvegarde ne s'ouvre que dans son projet
//   formatVersion version du format ; les anciennes versions se lisent toujours (voir mettreAJour)
//   equipe        { eleves: ['Léa', 'Tom'], classe: '6A' }
//   seances       { s1: { debut, etapes: { <id d'étape>: { fait, valeur } | { passe } } } }
//   photos        [{ fichier: 'photos/s1-boite-01.jpg', seance, etape, legende, date }]
//   aides         [{ date, seance, etape, resolue: null | date }] — « J'ai besoin d'aide »
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../outils.js') : global.Segpa;

  const APPLICATION = 'segpa';
  const FORMAT = 1;

  function creerSauvegarde(projet, equipe) {
    const date = S.maintenant();
    return {
      application: APPLICATION,
      projet,
      formatVersion: FORMAT,
      equipe: { eleves: [...equipe.eleves], classe: equipe.classe || '' },
      creeLe: date,
      modifieLe: date,
      seances: {},
      photos: [],
      aides: [],
    };
  }

  // Une version plus ancienne du format est recopiée dans la version actuelle, sans rien perdre.
  // (Format 1 : rien à faire. Le jour où le format change, ajouter ici « if (d.formatVersion < 2) { … } ».)
  function mettreAJour(d) {
    d.formatVersion = FORMAT;
    return d;
  }

  function completer(d) {
    if (!d.seances || typeof d.seances !== 'object') d.seances = {};
    for (const s of Object.values(d.seances)) if (!s.etapes || typeof s.etapes !== 'object') s.etapes = {};
    if (!Array.isArray(d.photos)) d.photos = [];
    if (!Array.isArray(d.aides)) d.aides = [];
    d.equipe.classe = d.equipe.classe || '';
    return d;
  }

  // texte du fichier → { ok: true, donnees } ou { ok: false, raison } (raison écrite pour l'élève).
  function lireSauvegarde(texte, projet) {
    let d;
    try {
      d = JSON.parse(texte);
    } catch {
      return { ok: false, raison: 'Ce fichier ne se lit pas : ce n’est pas une sauvegarde.' };
    }
    if (!d || typeof d !== 'object' || d.application !== APPLICATION)
      return { ok: false, raison: 'Ce fichier n’est pas une sauvegarde de ce projet.' };
    if (projet && d.projet !== projet) return { ok: false, raison: 'Cette sauvegarde est celle d’un autre projet.', autreProjet: d.projet };
    if (!d.equipe || !Array.isArray(d.equipe.eleves) || !d.equipe.eleves.length)
      return { ok: false, raison: 'Cette sauvegarde n’a pas de prénoms.' };
    if (typeof d.formatVersion === 'number' && d.formatVersion > FORMAT)
      return { ok: false, raison: 'Cette sauvegarde vient d’une version plus récente du site. Demande au professeur.' };
    return { ok: true, donnees: completer(mettreAJour(d)) };
  }

  const toucher = (d) => (d.modifieLe = S.maintenant());

  function seance(d, id) {
    if (!d.seances[id]) d.seances[id] = { debut: S.maintenant(), etapes: {} };
    return d.seances[id];
  }

  const etatEtape = (d, idSeance, idEtape) => (d.seances[idSeance] && d.seances[idSeance].etapes[idEtape]) || null;
  const etapeFaite = (d, idSeance, idEtape) => {
    const e = etatEtape(d, idSeance, idEtape);
    return !!(e && e.fait);
  };
  // Faite, ou laissée pour plus tard (photo impossible…) : on peut passer à la suite.
  const etapeTerminee = (d, idSeance, idEtape) => {
    const e = etatEtape(d, idSeance, idEtape);
    return !!(e && (e.fait || e.passe));
  };

  function noterEtape(d, idSeance, idEtape, valeur) {
    const e = { fait: S.maintenant() };
    if (valeur !== undefined) e.valeur = valeur;
    seance(d, idSeance).etapes[idEtape] = e;
    toucher(d);
    return e;
  }

  function passerEtape(d, idSeance, idEtape) {
    if (etapeFaite(d, idSeance, idEtape)) return etatEtape(d, idSeance, idEtape);
    const e = { passe: S.maintenant() };
    seance(d, idSeance).etapes[idEtape] = e;
    toucher(d);
    return e;
  }

  // Réponse en cours (cases cochées, smileys) sans valider l'étape.
  function noterBrouillon(d, idSeance, idEtape, valeur) {
    const s = seance(d, idSeance);
    const e = s.etapes[idEtape] || {};
    e.valeur = valeur;
    s.etapes[idEtape] = e;
    toucher(d);
  }

  const valeurEtape = (d, idSeance, idEtape) => {
    const e = etatEtape(d, idSeance, idEtape);
    return e ? e.valeur : undefined;
  };

  // Nom du prochain fichier photo d'une étape : « photos/s1-boite-01.jpg », « …-02.jpg »… (jamais deux fois le même).
  function nomPhoto(d, idSeance, idEtape, existants) {
    const pris = new Set([...d.photos.map((p) => p.fichier), ...(existants || [])]);
    for (let n = 1; ; n++) {
      const f = `photos/${idSeance}-${idEtape}-${String(n).padStart(2, '0')}.jpg`;
      if (!pris.has(f)) return f;
    }
  }

  function ajouterPhoto(d, photo) {
    const p = { fichier: photo.fichier, seance: photo.seance, etape: photo.etape, legende: photo.legende || '', date: S.maintenant() };
    d.photos.push(p);
    toucher(d);
    return p;
  }

  const photosDe = (d, idSeance) => d.photos.filter((p) => !idSeance || p.seance === idSeance);

  const aideEnCours = (d) => d.aides.find((a) => !a.resolue) || null;

  function demanderAide(d, idSeance, idEtape) {
    const deja = aideEnCours(d);
    if (deja) return deja;
    const a = { date: S.maintenant(), seance: idSeance || null, etape: idEtape || null, resolue: null };
    d.aides.push(a);
    toucher(d);
    return a;
  }

  function finirAide(d) {
    const a = aideEnCours(d);
    if (!a) return null;
    a.resolue = S.maintenant();
    toucher(d);
    return a;
  }

  Object.assign(S, {
    APPLICATION,
    FORMAT_SAUVEGARDE: FORMAT,
    creerSauvegarde,
    lireSauvegarde,
    etatEtape,
    etapeFaite,
    etapeTerminee,
    noterEtape,
    passerEtape,
    noterBrouillon,
    valeurEtape,
    nomPhoto,
    ajouterPhoto,
    photosDe,
    aideEnCours,
    demanderAide,
    finirAide,
  });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
