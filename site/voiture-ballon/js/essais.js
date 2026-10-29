// Moteur des essais de la séance 4 (« Je teste et j'améliore ») : utilisable dans le navigateur et dans Node (tests).
// Une valeur d'essais, enregistrée dans la rubrique de l'étape « essais » :
//   { roues: { avant: '30', arriere: '40' }, essais: [{ changement, place, pompe, parti, distance, direction }], graphique: false }
//   changement : null pour le premier essai, sinon { type: 'ballon' | 'poids', choix: 'plus' | … }
//                ou { type: 'roues', cote: 'avant' | 'arriere', choix: '40' } (les roues avant et arrière peuvent différer).
//   Ancien format (une seule taille, roues: '30') : lu comme les mêmes roues devant et derrière.
// Chaque essai se fait en 5 écrans (je pose · je gonfle · je lâche · je mesure · ma voiture roule comment ?), puis on
// change UNE chose avant l'essai suivant. Après le minimum d'essais, l'équipe choisit « encore un essai » ou son graphique.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/outils.js') : global.Segpa;

  const REGLES = { min: 3, max: 5, ecart: 10 };
  const regles = (r) => Object.assign({}, REGLES, r || {});

  function vide() {
    return { roues: { avant: '', arriere: '' }, essais: [], graphique: false };
  }

  function copie(v) {
    const c = v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : vide();
    if (!Array.isArray(c.essais)) c.essais = [];
    if (!c.roues || typeof c.roues !== 'object') c.roues = { avant: c.roues ? String(c.roues) : '', arriere: c.roues ? String(c.roues) : '' };
    return c;
  }

  const complet = (e) => !!(e && e.place && e.pompe > 0 && e.parti && typeof e.distance === 'number' && e.direction);
  const essaisFaits = (v) => copie(v).essais.filter(complet);

  // Le prochain écran : roues-avant · roues-arriere · ligne · gonfle · lache · mesure · direction · changer · suite · graphique
  function ecranEssai(valeur, r) {
    const R = regles(r);
    const v = copie(valeur);
    if (!v.roues.avant) return 'roues-avant';
    if (!v.roues.arriere) return 'roues-arriere';
    const e = v.essais[v.essais.length - 1];
    if (!e) return 'ligne';
    if (!e.place) return 'ligne';
    if (!(e.pompe > 0)) return 'gonfle';
    if (!e.parti) return 'lache';
    if (typeof e.distance !== 'number') return 'mesure';
    if (!e.direction) return 'direction';
    const n = v.essais.length;
    if (v.graphique || n >= R.max) return 'graphique';
    return n < R.min ? 'changer' : 'suite';
  }

  // Une étape d'essai est faite : on renvoie la nouvelle valeur (la valeur reçue n'est pas modifiée).
  function noter(valeur, quoi, donnee) {
    const v = copie(valeur);
    const dernier = () => {
      if (!v.essais.length || complet(v.essais[v.essais.length - 1])) v.essais.push({ changement: null });
      return v.essais[v.essais.length - 1];
    };
    if (quoi === 'roues-avant') v.roues.avant = String(donnee);
    else if (quoi === 'roues-arriere') v.roues.arriere = String(donnee);
    else if (quoi === 'ligne') dernier().place = true;
    else if (quoi === 'gonfle') dernier().pompe = Number(donnee);
    else if (quoi === 'lache') dernier().parti = true;
    else if (quoi === 'mesure') dernier().distance = Number(donnee);
    else if (quoi === 'direction') dernier().direction = String(donnee);
    else if (quoi === 'changer') v.essais.push({ changement: Object.assign({ type: donnee.type, choix: String(donnee.choix) }, donnee.type === 'roues' ? { cote: donnee.cote === 'arriere' ? 'arriere' : 'avant' } : {}) });
    else if (quoi === 'graphique') v.graphique = true;
    return v;
  }

  // « Retour » pendant les essais : on défait la dernière chose notée. Renvoie null s'il n'y a plus rien à défaire
  // (on revient alors à l'étape précédente de la séance).
  function reculer(valeur) {
    const v = copie(valeur);
    if (v.graphique) {
      v.graphique = false;
      return v;
    }
    const e = v.essais[v.essais.length - 1];
    if (!e) {
      if (v.roues.arriere) v.roues.arriere = '';
      else if (v.roues.avant) v.roues.avant = '';
      else return null;
      return v;
    }
    if (e.direction) delete e.direction;
    else if (typeof e.distance === 'number') delete e.distance;
    else if (e.parti) delete e.parti;
    else if (e.pompe > 0) delete e.pompe;
    else if (e.place) delete e.place;
    else v.essais.pop();
    return v;
  }

  // Les roues sur la voiture au moment de l'essai i : { avant, arriere } (celles du départ, puis les changements).
  function rouesDe(valeur, i) {
    const v = copie(valeur);
    const roues = Object.assign({}, v.roues);
    const fin = i === undefined ? v.essais.length - 1 : i;
    for (let k = 0; k <= fin && k < v.essais.length; k++) {
      const c = v.essais[k].changement;
      if (c && c.type === 'roues') roues[c.cote === 'arriere' ? 'arriere' : 'avant'] = c.choix;
    }
    return roues;
  }

  function mediane(nombres) {
    const t = nombres.slice().sort((a, b) => a - b);
    if (!t.length) return null;
    const m = Math.floor(t.length / 2);
    return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
  }

  // Mesure « 10 fois plus grande (ou plus petite) » que les autres essais : on propose de mesurer encore, sans juger.
  // → 'plus' · 'moins' · null
  function mesureSuspecte(valeur, distance, r) {
    const R = regles(r);
    const autres = essaisFaits(valeur).map((e) => e.distance).filter((d) => d > 0);
    const m = mediane(autres);
    if (!m || !(distance > 0)) return null;
    if (distance >= m * R.ecart) return 'plus';
    if (distance <= m / R.ecart) return 'moins';
    return null;
  }

  // L'essai qui est allé le plus loin (le premier en cas d'égalité), ou -1.
  function meilleur(valeur) {
    const faits = copie(valeur).essais;
    let i = -1;
    faits.forEach((e, k) => {
      if (complet(e) && (i < 0 || e.distance > faits[i].distance)) i = k;
    });
    return i;
  }

  // Résumé pour l'outil professeur : nombre d'essais, meilleure distance, changements, un seul changement à la fois.
  function resumeEssais(valeur) {
    const v = copie(valeur);
    const faits = v.essais.filter(complet);
    const b = meilleur(v);
    return {
      nombre: faits.length,
      meilleure: b >= 0 ? v.essais[b].distance : null,
      changements: v.essais.filter((e) => e.changement).map((e) => e.changement.type),
      directions: faits.map((e) => e.direction),
      fini: !!v.graphique || faits.length >= REGLES.max,
    };
  }

  const API = { REGLES_ESSAIS: REGLES, essaisVides: vide, ecranEssai, noterEssai: noter, reculerEssai: reculer, rouesDe, essaisFaits, mesureSuspecte, meilleurEssai: meilleur, resumeEssais, mediane };
  Object.assign(S, API);
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
