// Moteur de la course (séance 5) : utilisable dans le navigateur (course.html, écran « Mon résultat ») et dans Node (tests).
// Décisions de Thomas (plan §1) : des poules selon le nombre de couloirs du jour, puis des finales par niveau (principale,
// secondaire, tertiaire…) ; personne n'est éliminé, chaque voiture court au moins deux fois ; le classement n'entre pas
// dans l'évaluation.
//
// Une course : { id, nom, voitures: [idEquipe, …] (une par couloir), arrivees: { idEquipe: { place, temps } | { distance } } }
//   place : ordre d'arrivée (1, 2…) ; temps : en secondes, indicatif ; distance : en cm, pour une voiture qui n'arrive pas.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/outils.js') : global.Segpa;

  const NOMS_FINALES = ['Finale principale', 'Finale secondaire', 'Finale tertiaire'];
  const nomFinale = (i) => NOMS_FINALES[i] || `Finale ${i + 1}`;

  // Découpe une liste en n groupes dans l'ordre, les premiers un peu plus grands (8 en 3 → 3, 3, 2).
  function decouper(liste, n) {
    const groupes = [];
    let debut = 0;
    for (let i = 0; i < n; i++) {
      const taille = Math.floor(liste.length / n) + (i < liste.length % n ? 1 : 0);
      groupes.push(liste.slice(debut, debut + taille));
      debut += taille;
    }
    return groupes.filter((g) => g.length);
  }

  // Poules : autant que nécessaire pour que chacune tienne dans les couloirs, de tailles voisines ; les voitures sont
  // distribuées une à une (1re dans la poule 1, 2e dans la poule 2…) pour mélanger.
  function repartirPoules(voitures, couloirs) {
    const c = Math.max(1, couloirs | 0);
    const n = Math.max(1, Math.ceil(voitures.length / c));
    const poules = Array.from({ length: n }, () => []);
    voitures.forEach((v, i) => poules[i % n].push(v));
    return poules
      .filter((p) => p.length)
      .map((p, i) => ({ id: 'p' + (i + 1), nom: `Poule ${i + 1}`, voitures: p, arrivees: {} }));
  }

  // Une course est finie quand chaque voiture a une arrivée (place) ou une distance.
  const finie = (course) => course.voitures.length > 0 && course.voitures.every((v) => course.arrivees[v]);

  // Ordre de la course : les arrivées par place, puis les voitures qui ne sont pas arrivées, de la plus loin à la moins loin.
  function classerCourse(course) {
    const a = course.arrivees || {};
    return course.voitures
      .filter((v) => a[v])
      .slice()
      .sort((x, y) => {
        const ax = a[x];
        const ay = a[y];
        const arriveX = typeof ax.place === 'number';
        const arriveY = typeof ay.place === 'number';
        if (arriveX !== arriveY) return arriveX ? -1 : 1;
        if (arriveX) return ax.place - ay.place;
        return (ay.distance || 0) - (ax.distance || 0);
      })
      .map((v, i) => Object.assign({ equipe: v, rang: i + 1 }, a[v]));
  }

  // Après les poules : toutes les voitures dans l'ordre, pour composer les finales. D'abord le rang dans sa poule, puis
  // à rang égal : arrivée avant non-arrivée, puis le temps (le plus court), puis la distance (la plus longue).
  function ordreApresPoules(poules) {
    const tous = poules.flatMap((p) => classerCourse(p));
    return tous
      .sort((x, y) => {
        if (x.rang !== y.rang) return x.rang - y.rang;
        const ax = typeof x.place === 'number';
        const ay = typeof y.place === 'number';
        if (ax !== ay) return ax ? -1 : 1;
        if (ax) return (x.temps || Infinity) - (y.temps || Infinity);
        return (y.distance || 0) - (x.distance || 0);
      })
      .map((r) => r.equipe);
  }

  // Finales par niveau : groupes de « couloirs » voitures au plus, de tailles voisines, dans l'ordre (les meilleures en
  // finale principale). Elles se courent de la dernière à la principale.
  function composerFinales(ordre, couloirs) {
    const c = Math.max(1, couloirs | 0);
    return decouper(ordre, Math.max(1, Math.ceil(ordre.length / c))).map((g, i) => ({ id: 'f' + (i + 1), nom: nomFinale(i), voitures: g, arrivees: {} }));
  }

  // Le meilleur temps de toutes les courses : { equipe, temps, course } ou null.
  function record(courses) {
    let r = null;
    for (const c of courses)
      for (const v of c.voitures) {
        const a = c.arrivees[v];
        if (a && typeof a.place === 'number' && a.temps > 0 && (!r || a.temps < r.temps)) r = { equipe: v, temps: a.temps, course: c.nom };
      }
    return r;
  }

  // Le résultat d'une équipe, pour son écran « Mon résultat » : la finale qu'elle a courue (sinon sa poule).
  function resultatEquipe(etat, equipe) {
    const dans = (c) => c.voitures.includes(equipe);
    const finale = (etat.finales || []).find(dans);
    const course = finale && finie(finale) ? finale : (etat.poules || []).find(dans);
    if (!course) return null;
    const r = classerCourse(course).find((x) => x.equipe === equipe);
    if (!r) return null;
    const rec = record([...(etat.poules || []), ...(etat.finales || [])]);
    return {
      course: course.nom,
      finale: course === finale,
      rang: r.rang,
      nombre: course.voitures.length,
      arrivee: typeof r.place === 'number',
      temps: r.temps || null,
      distance: r.distance || null,
      record: !!(rec && rec.equipe === equipe),
    };
  }

  // 1 → « 1re », 2 → « 2e »
  const ordinal = (n) => (n === 1 ? '1re' : n + 'e');

  // Message pour l'élève : encourageant quel que soit le rang (jamais « tu as perdu »).
  function messageResultat(r) {
    if (!r) return null;
    const ou = r.finale ? r.course.replace(/^Finale/, 'de la finale') : 'de ta poule';
    const titre = r.arrivee ? `${ordinal(r.rang)} place ${ou} !` : `Ta voiture a roulé ${String(r.distance).replace('.', ',')} cm.`;
    const sousTitre = r.record ? 'Record de la classe ! Bravo !' : r.arrivee ? (r.rang <= 3 ? 'Sur le podium ! Bravo !' : 'Ta voiture a fini la course. Bravo !') : 'Elle a couru jusqu’au bout de son souffle. Bravo !';
    return { titre, sousTitre };
  }

  // Lignes du fichier CSV de la course (séparateur « ; », pour le tableur).
  function lignesCsv(etat, nomDe) {
    const lignes = [['Course', 'Couloir', 'Équipe', 'Voiture', 'Rang', 'Arrivée', 'Temps (s)', 'Distance (cm)']];
    for (const c of [...(etat.poules || []), ...(etat.finales || [])]) {
      const rangs = classerCourse(c);
      c.voitures.forEach((v, i) => {
        const r = rangs.find((x) => x.equipe === v) || {};
        const nom = nomDe ? nomDe(v) : { equipe: v, voiture: '' };
        lignes.push([c.nom, i + 1, nom.equipe, nom.voiture, r.rang || '', typeof r.place === 'number' ? 'oui' : 'non', r.temps ? String(r.temps).replace('.', ',') : '', r.distance || '']);
      });
    }
    return lignes;
  }

  const API = { repartirPoules, classerCourse, courseFinie: finie, ordreApresPoules, composerFinales, nomFinale, recordCourse: record, resultatEquipe, messageResultat, ordinal, lignesCsvCourse: lignesCsv, decouperGroupes: decouper };
  Object.assign(S, API);
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
