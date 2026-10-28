// Séances et étapes d'un projet, lues dans donnees/etapes.js (definirEtapes) :
//   { seances: [{ id: 's1', titre: 'Je démonte', picto: 'tournevis', etapes: [{ id, type, texte, … }] }] }
// Chaque étape est un écran (une seule chose à faire). Ce module dit où en est une équipe :
// état d'une séance (fait / en cours / à faire), étape à reprendre, séance du jour.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('./sauvegarde.js') : global.Segpa;

  // types : liste des types d'écran que le site sait afficher. Une étape d'un type inconnu (écran pas encore
  // construit) est laissée de côté, pour qu'un élève ne tombe jamais sur un écran vide.
  function etapesSeance(seance, types) {
    return (seance.etapes || []).filter((e) => !types || types.includes(e.type));
  }

  function etatSeance(d, seance, types) {
    const etapes = etapesSeance(seance, types);
    const terminees = etapes.filter((e) => S.etapeTerminee(d, seance.id, e.id)).length;
    if (etapes.length && terminees === etapes.length) return 'fait';
    if (terminees > 0 || (d.seances[seance.id] && Object.keys(d.seances[seance.id].etapes).length)) return 'en_cours';
    return 'a_faire';
  }

  // Première étape ni faite ni laissée pour plus tard ; la longueur de la liste si tout est fait (écran « Bravo »).
  function indexAReprendre(d, seance, types) {
    const etapes = etapesSeance(seance, types);
    const i = etapes.findIndex((e) => !S.etapeTerminee(d, seance.id, e.id));
    return i < 0 ? etapes.length : i;
  }

  // La séance du jour : la première qui n'est pas finie (la dernière si tout est fini).
  function seanceCourante(d, seances, types) {
    return seances.find((s) => etatSeance(d, s, types) !== 'fait') || seances[seances.length - 1];
  }

  function avancement(d, seance, types) {
    const etapes = etapesSeance(seance, types);
    return { faites: etapes.filter((e) => S.etapeFaite(d, seance.id, e.id)).length, total: etapes.length };
  }

  // Une consigne tient en 8 mots au plus (cahier des charges §4.2) : contrôlé par les tests sur les données.
  const nombreDeMots = (texte) => String(texte || '').split(/\s+/).filter((m) => /[\p{L}\p{N}]/u.test(m)).length;

  Object.assign(S, { etapesSeance, etatSeance, indexAReprendre, seanceCourante, avancement, nombreDeMots });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
