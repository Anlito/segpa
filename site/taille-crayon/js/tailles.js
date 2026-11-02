// Les tailles de référence de la séance 2, saisies par le professeur dans son outil (décision de Thomas, 02/11/2026).
// Fichier « tailles-reference.json » à la racine du dossier du projet (… › Taille-crayon) :
//   { application: 'segpa', projet: 'taille-crayon', type: 'tailles', tolerance: 0.5,
//     tailles: { corps: { hauteur: 9.2, largeur: 4.4, longueur: 5.8 }, manivelle: { longueur: 5 } }, modifieLe }
// Chaque taille devient une plage « taille ± tolérance » ; sans fichier, les plages de donnees/modele.js restent.
// Utilisable dans le navigateur (élèves et professeur) et dans Node (tests).
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/moteur/mesure.js') : global.Segpa;
  const NOM_FICHIER = 'tailles-reference.json';

  const nombre = (x) => (typeof x === 'number' && x > 0 && x < 100 ? Math.round(x * 100) / 100 : null);

  // Lit le fichier (texte ou objet) → { tolerance, tailles } ou null s'il n'est pas lisible.
  function lireTailles(texte, projet) {
    try {
      const f = typeof texte === 'string' ? JSON.parse(texte) : texte;
      if (!f || f.type !== 'tailles' || (projet && f.projet !== projet) || !f.tailles || typeof f.tailles !== 'object') return null;
      const tolerance = nombre(f.tolerance) || 0.5;
      const tailles = {};
      for (const [piece, dims] of Object.entries(f.tailles)) {
        if (!dims || typeof dims !== 'object') continue;
        for (const [dim, v] of Object.entries(dims)) if (nombre(v)) (tailles[piece] = tailles[piece] || {})[dim] = nombre(v);
      }
      return { tolerance, tailles };
    } catch {
      return null;
    }
  }

  // Les mesures du modèle avec les tailles du professeur à la place des plages (la valeur reçue n'est pas modifiée).
  function appliquerTailles(mesures, lu) {
    const m = JSON.parse(JSON.stringify(mesures || {}));
    if (!lu) return m;
    for (const [piece, info] of Object.entries(m)) {
      const t = lu.tailles[piece];
      if (!t) continue;
      const ref = (v) => ({ longueur: v, tolerance: lu.tolerance });
      if (Array.isArray(info.dimensions) && info.dimensions.length) {
        for (const d of info.dimensions) if (t[d.id]) d.reference = ref(t[d.id]);
      } else if (t.longueur) info.reference = ref(t.longueur);
    }
    return m;
  }

  // Le fichier à écrire, d'après ce que le professeur a tapé : { corps: { hauteur: 9.2, … }, manivelle: { longueur: 5 } }.
  function fichierTailles(projet, tailles, tolerance) {
    const lu = lireTailles({ type: 'tailles', projet, tolerance, tailles }, projet) || { tolerance: 0.5, tailles: {} };
    return { application: 'segpa', projet, type: 'tailles', tolerance: lu.tolerance, tailles: lu.tailles, modifieLe: new Date().toISOString() };
  }

  const API = { TAILLES_FICHIER: NOM_FICHIER, lireTailles, appliquerTailles, fichierTailles };
  Object.assign(S, API);
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
