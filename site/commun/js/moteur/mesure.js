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

  // Une pièce peut se mesurer en plusieurs dimensions (ex. le corps : hauteur, largeur, longueur) :
  // info = { dimensions: [{ id, nom, reference }] } ; sans dimensions, une seule « longueur » (info.reference).
  function dimensionsDe(info) {
    const i = info || {};
    return Array.isArray(i.dimensions) && i.dimensions.length ? i.dimensions : [{ id: 'longueur', nom: 'Longueur', reference: i.reference || null }];
  }

  // Ce que l'élève a saisi, dimension par dimension : [{ id, nom, reference, essais, longueur, verdict }].
  // Valeur d'étape : { dimensions: { hauteur: { essais, longueur, verdict }, … } } ou, pour une seule dimension (et
  // les anciennes sauvegardes), { essais, longueur, verdict } directement.
  function mesuresSaisies(valeur, info) {
    const v = valeur || {};
    const dims = dimensionsDe(info);
    const multi = Array.isArray((info || {}).dimensions) && info.dimensions.length;
    return dims.map((d) => {
      const x = multi ? (v.dimensions || {})[d.id] || {} : v;
      return { id: d.id, nom: d.nom, reference: d.reference || null, essais: Array.isArray(x.essais) ? x.essais : [], longueur: typeof x.longueur === 'number' ? x.longueur : null, verdict: x.verdict || null };
    });
  }

  Object.assign(S, { lireNombre, ecrireNombre, verifierMesure, plageDe, dimensionsDe, mesuresSaisies });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
