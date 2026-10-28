// Évaluation (cahier des charges §8) : 4 niveaux, note /20 de l'Excel de Thomas, appréciation, ceinture,
// exports Carnet de classe et CSV. L'évaluation est OBSERVÉE par le professeur : l'outil propose des repères,
// il ne pose jamais un niveau tout seul. Les élèves ne voient jamais la note (seulement leur ceinture).
//
// Où c'est gardé : professeur.json › evaluations › « Léa_Tom » › { lie, eleves: { Léa: { niveaux: { critère: 0-3 }, commentaire } } }
//   lie : vrai tant que le professeur évalue le binôme d'un seul geste (même niveau pour les deux élèves).
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../outils.js') : global.Segpa;

  // Excel : Rouge 0 · Jaune 1 · Vert clair 2 · Vert foncé 3. Carnet de classe : 1 à 4. Jamais la couleur seule :
  // lettre et symbole à côté. Couleurs : celles de la mise en forme conditionnelle de l'Excel de Thomas.
  const NIVEAUX = [
    { valeur: 0, carnet: 1, nom: 'Rouge', lettre: 'R', symbole: '✗', pronote: 'Non atteint', fond: 'FFC7CE', encre: '9C0006' },
    { valeur: 1, carnet: 2, nom: 'Jaune', lettre: 'J', symbole: '~', pronote: 'Partiellement atteint', fond: 'FFEB9C', encre: '9C6500' },
    { valeur: 2, carnet: 3, nom: 'Vert clair', lettre: 'V', symbole: '✓', pronote: 'Atteint', fond: 'C6EFCE', encre: '006100' },
    { valeur: 3, carnet: 4, nom: 'Vert foncé', lettre: 'VV', symbole: '★', pronote: 'Dépassé', fond: '1E7B34', encre: 'FFFFFF' },
  ];
  const APPRECIATIONS = [
    { min: 16, nom: 'Très satisfaisant', niveau: 3 },
    { min: 12, nom: 'Satisfaisant', niveau: 2 },
    { min: 8, nom: 'Fragile', niveau: 1 },
    { min: -Infinity, nom: 'Insuffisant', niveau: 0 },
  ];

  const estNiveau = (v) => Number.isInteger(v) && v >= 0 && v <= 3;
  const appreciation = (note) => APPRECIATIONS.find((a) => note >= a.min);

  // niveaux : { idCritère: 0-3 } → { score, max, note, appreciation, complet, evalues }
  // Comme l'Excel : une case vide compte 0 ; « complet » dit si les 7 critères sont remplis.
  function noter(niveaux, criteres) {
    const n = niveaux || {};
    const evalues = criteres.filter((c) => estNiveau(n[c.id])).length;
    const score = criteres.reduce((t, c) => t + (estNiveau(n[c.id]) ? n[c.id] : 0), 0);
    const max = criteres.length * 3;
    // Aucun critère évalué : pas de note (l'Excel laisse aussi la ligne vide).
    if (!evalues) return { score: null, max, note: null, appreciation: '', complet: false, evalues };
    const note = Math.round((score / max) * 20 * 10) / 10;
    return { score, max, note, appreciation: appreciation(note).nom, complet: evalues === criteres.length, evalues };
  }

  // Ceinture : le niveau du critère choisi (remontage fonctionnel), ou null s'il n'est pas encore évalué.
  function ceinture(niveaux, def) {
    const v = (niveaux || {})[def.critereCeinture];
    return estNiveau(v) ? { niveau: v, nom: def.ceintures[v] } : null;
  }

  // ---------- Lecture et écriture dans professeur.json ----------

  function evaluationEquipe(professeur, nomEquipe, eleves) {
    const tout = (professeur.evaluations = professeur.evaluations || {});
    const e = (tout[nomEquipe] = tout[nomEquipe] || { lie: true, eleves: {} });
    for (const p of eleves) e.eleves[p] = e.eleves[p] || { niveaux: {}, commentaire: '' };
    if (typeof e.lie !== 'boolean') e.lie = true;
    return e;
  }

  // Pose un niveau (null efface). Binôme lié : pour tous les élèves de l'équipe.
  function poserNiveau(professeur, nomEquipe, eleves, eleve, critere, niveau) {
    const e = evaluationEquipe(professeur, nomEquipe, eleves);
    for (const p of e.lie ? eleves : [eleve]) {
      if (niveau === null || niveau === undefined) delete e.eleves[p].niveaux[critere];
      else e.eleves[p].niveaux[critere] = niveau;
    }
    return e;
  }

  // Clic sur une case : niveau suivant (vide → Rouge → Jaune → Vert clair → Vert foncé → vide).
  const niveauSuivant = (v) => (v === undefined || v === null ? 0 : v >= 3 ? null : v + 1);

  // Une ligne par élève, dans l'ordre des équipes : ce que lisent l'Excel, le CSV et la feuille imprimable.
  // equipes : [{ nom, donnees }] (fiches de l'outil professeur).
  function lignesEleves(professeur, equipes, def) {
    const lignes = [];
    for (const eq of equipes) {
      const eleves = eq.donnees.equipe.eleves;
      const e = evaluationEquipe(JSON.parse(JSON.stringify(professeur)), eq.nom, eleves);
      for (const p of eleves) {
        const x = e.eleves[p];
        lignes.push(
          Object.assign(
            { classe: eq.donnees.equipe.classe || '', equipe: eq.nom, eleve: p, binome: eleves.filter((q) => q !== p).join(', '), niveaux: x.niveaux, commentaire: x.commentaire || '' },
            noter(x.niveaux, def.criteres),
            { ceinture: ceinture(x.niveaux, def) }
          )
        );
      }
    }
    return lignes.sort((a, b) => a.eleve.localeCompare(b.eleve, 'fr'));
  }

  // ---------- Export Carnet de classe (format « labo-blocs/resultats », version 1) ----------
  // Le Carnet relie chaque critère par son LIBELLÉ (créer les mêmes critères dans le projet du Carnet) et
  // recalcule sa propre note (moyenne des niveaux × 5) : elle peut différer de celle de l'Excel.
  // Binôme évalué pareil : une entrée pour les deux ; sinon une entrée par élève.
  function resultatsCarnet(lignes, def, projet, date) {
    const competences = def.criteres.map((c, i) => ({ code: 'C' + (i + 1), n: i + 1, libelle: c.libelle }));
    const parEquipe = new Map();
    for (const l of lignes) parEquipe.set(l.equipe, [...(parEquipe.get(l.equipe) || []), l]);
    const equipes = [];
    const entree = (ls) => {
      const niveaux = {};
      def.criteres.forEach((c, i) => {
        if (estNiveau(ls[0].niveaux[c.id])) niveaux['C' + (i + 1)] = NIVEAUX[ls[0].niveaux[c.id]].carnet;
      });
      return { eleves: ls.map((l) => l.eleve), classe: ls[0].classe, niveaux, note: ls[0].note, commentaire: ls[0].commentaire };
    };
    for (const ls of parEquipe.values()) {
      const pareil = ls.every((l) => JSON.stringify(def.criteres.map((c) => l.niveaux[c.id])) === JSON.stringify(def.criteres.map((c) => ls[0].niveaux[c.id])) && l.commentaire === ls[0].commentaire);
      if (pareil) equipes.push(entree(ls));
      else for (const l of ls) equipes.push(entree([l]));
    }
    return {
      format: 'labo-blocs/resultats',
      version: 1,
      date: date || new Date().toISOString().slice(0, 10),
      projet: projet || null,
      parcours: null,
      source: 'Programme de sciences et technologie du cycle 3 · compétences travaillées (critères du projet)',
      avertissement: 'La note du Carnet de classe (moyenne des niveaux × 5) peut différer de la note de l’Excel (score ÷ 21 × 20).',
      competences,
      niveaux: NIVEAUX.map((n) => ({ v: n.carnet, pronote: n.pronote })),
      equipes,
    };
  }

  // ---------- CSV (Excel en français : point-virgule, UTF-8 avec BOM) ----------
  function csvClasse(lignes, def, options) {
    const avecNote = !options || options.note !== false;
    const cel = (v) => {
      const t = v === null || v === undefined ? '' : String(v);
      return /[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    const entete = ['Classe', 'Équipe', 'Prénom', 'Binôme', ...def.criteres.map((c) => c.libelle), ...(avecNote ? ['Score brut (/21)', 'Note /20', 'Appréciation'] : []), 'Ceinture', 'Commentaire'];
    const rangs = lignes.map((l) => [
      l.classe,
      l.equipe,
      l.eleve,
      l.binome,
      ...def.criteres.map((c) => (estNiveau(l.niveaux[c.id]) ? NIVEAUX[l.niveaux[c.id]].nom : '')),
      ...(avecNote ? [l.score, l.note === null ? '' : String(l.note).replace('.', ','), l.appreciation] : []),
      l.ceinture ? l.ceinture.nom : '',
      l.commentaire,
    ]);
    return '﻿' + [entete, ...rangs].map((r) => r.map(cel).join(';')).join('\r\n') + '\r\n';
  }

  Object.assign(S, { NIVEAUX, APPRECIATIONS, noter, ceinture, evaluationEquipe, poserNiveau, niveauSuivant, lignesEleves, resultatsCarnet, csvClasse });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
