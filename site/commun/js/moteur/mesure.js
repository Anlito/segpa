// Mesures saisies au pavé numérique (« 7,5 » cm) et vérification douce : on dit seulement si la mesure est dans la
// plage de référence du professeur, jamais la bonne valeur (cahier des charges §4.7).
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../outils.js') : global.Segpa;

  // « 7,5 » ou « 7.5 » → 7.5 ; texte vide ou illisible → null.
  function lireNombre(texte) {
    const t = String(texte === null || texte === undefined ? '' : texte).trim().replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(t)) return null;
    return Number(t);
  }

  // 7.5 → « 7,5 » (écriture française).
  const ecrireNombre = (n) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

  // plage : [min, max] en cm, ou null tant que le professeur ne l'a pas renseignée.
  // → 'dedans' · 'dehors' · 'sans-reference' (pas de vérification possible) · 'illisible'
  function verifierMesure(valeur, plage) {
    const n = typeof valeur === 'number' ? valeur : lireNombre(valeur);
    if (n === null || Number.isNaN(n)) return 'illisible';
    if (!Array.isArray(plage) || plage.length !== 2 || plage.some((x) => typeof x !== 'number')) return 'sans-reference';
    return n >= plage[0] - 1e-9 && n <= plage[1] + 1e-9 ? 'dedans' : 'dehors';
  }

  // Plage de référence d'une pièce : { min, max } ou { longueur, tolerance } (tolérance par défaut ±0,5 cm).
  function plageDe(reference, toleranceParDefaut) {
    if (!reference) return null;
    if (typeof reference.min === 'number' && typeof reference.max === 'number') return [reference.min, reference.max];
    if (typeof reference.longueur === 'number') {
      const t = typeof reference.tolerance === 'number' ? reference.tolerance : typeof toleranceParDefaut === 'number' ? toleranceParDefaut : 0.5;
      return [Math.round((reference.longueur - t) * 100) / 100, Math.round((reference.longueur + t) * 100) / 100];
    }
    return null;
  }

  Object.assign(S, { lireNombre, ecrireNombre, verifierMesure, plageDe });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
