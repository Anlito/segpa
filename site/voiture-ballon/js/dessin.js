// Moteur de l'atelier « Je dessine ma carrosserie » : utilisable dans le navigateur et dans Node (tests).
// Les pièces viennent de donnees/patron.js (produit par tools/gabarits/patron-a-plier.py), en mm, dans le repère du SVG
// pour la Cricut. L'élève dessine sur une pièce montrée à l'endroit ; ses éléments sont gardés en mm dans ce repère
// « à l'endroit », puis ramenés sur le patron pour l'export (calque « dessin », tracé au stylo par la Cricut).
// Un élément : { type: 'tampon', id: 'flamme', x, y (centre), taille (largeur en mm), angle (degrés), miroir }.
// Tracé au stylo gel de 0,8 mm : les éléments ne descendent pas sous 8 mm, pour rester nets et laisser de quoi colorier.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/outils.js') : global.Segpa;

  const TAILLE_MIN = 8;
  const TAILLE_MAX = 90;
  const TAILLE_DEPART = 22;

  // ---------- Tampons : des contours fermés, dans une boîte [largeur, hauteur] ----------

  const cercle = (cx, cy, r, n, rx) => Array.from({ length: n || 48 }, (_, i) => {
    const t = (i / (n || 48)) * 2 * Math.PI;
    return [cx + (rx || r) * Math.cos(t), cy + r * Math.sin(t)];
  });
  // Lissage de Chaikin d'un contour fermé (pour des formes douces à partir de quelques points).
  function lisser(points, tours) {
    let p = points;
    for (let k = 0; k < (tours || 3); k++) {
      const q = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i];
        const b = p[(i + 1) % p.length];
        q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      p = q;
    }
    return p;
  }
  function etoile(n, r1, r2) {
    return Array.from({ length: 2 * n }, (_, i) => {
      const t = -Math.PI / 2 + (i * Math.PI) / n;
      const r = i % 2 ? r2 : r1;
      return [50 + r * Math.cos(t), 50 + r * Math.sin(t)];
    });
  }
  function coeur() {
    return Array.from({ length: 64 }, (_, i) => {
      const t = (i / 64) * 2 * Math.PI;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [50 + x * 2.9, 47 - y * 2.9];
    });
  }
  function nuage() {
    return Array.from({ length: 90 }, (_, i) => {
      const t = (i / 90) * 2 * Math.PI;
      const r = 1 + 0.16 * Math.abs(Math.sin(3.5 * t));
      return [70 + 52 * r * Math.cos(t), 32 + 24 * r * Math.sin(t)];
    });
  }
  function goutte() {
    return Array.from({ length: 64 }, (_, i) => {
      const t = (i / 64) * 2 * Math.PI;
      return [50 + 34 * Math.sin(t) * Math.sin(t / 2), 52 - 46 * Math.cos(t)];
    });
  }
  const carre = (x, y, c) => [[x, y], [x + c, y], [x + c, y + c], [x, y + c]];

  const TAMPONS = [
    { id: 'flamme', nom: 'Flamme', boite: [80, 100], anneaux: [lisser([[40, 0], [52, 20], [66, 34], [74, 56], [68, 80], [52, 98], [28, 98], [12, 82], [6, 60], [14, 42], [24, 50], [28, 28]], 2)] },
    { id: 'eclair', nom: 'Éclair', boite: [60, 100], anneaux: [[[34, 0], [6, 56], [28, 56], [18, 100], [56, 38], [33, 38], [48, 0]]] },
    { id: 'etoile', nom: 'Étoile', boite: [100, 100], anneaux: [etoile(5, 50, 21).map(([x, y]) => [x, y + 5])] },
    { id: 'bande', nom: 'Bande de course', boite: [100, 30], anneaux: [[[0, 0], [100, 0], [100, 11], [0, 11]], [[0, 19], [100, 19], [100, 30], [0, 30]]] },
    { id: 'damier', nom: 'Damier', boite: [100, 50], anneaux: [0, 1, 2, 3].flatMap((i) => [0, 1].map((j) => carre(i * 25, j * 25, 25))) },
    { id: 'cercle', nom: 'Cercle', boite: [100, 100], anneaux: [cercle(50, 50, 50, 64)] },
    { id: 'coeur', nom: 'Cœur', boite: [100, 90], anneaux: [coeur()] },
    { id: 'fleche', nom: 'Flèche', boite: [100, 50], anneaux: [[[0, 16], [62, 16], [62, 0], [100, 25], [62, 50], [62, 34], [0, 34]]] },
    { id: 'nuage', nom: 'Nuage', boite: [140, 64], anneaux: [nuage()] },
    { id: 'goutte', nom: 'Goutte', boite: [70, 100], anneaux: [goutte().map(([x, y]) => [x - 15, y])] },
  ];
  const tampon = (id) => TAMPONS.find((t) => t.id === id);

  // ---------- Pièces à l'endroit ----------

  // Rotation dans le sens des aiguilles d'une montre, repère de l'écran (y vers le bas).
  const tourner = ([x, y], r) => (r === 90 ? [-y, x] : r === 180 ? [-x, -y] : r === 270 ? [y, -x] : [x, y]);

  // → { id, nom, largeur, hauteur, contour, trous, zone: { contour, trous }, versPatron([x, y]) }
  function pieceDroite(piece) {
    const r = piece.rotation || 0;
    const tous = piece.contour.map((p) => tourner(p, r));
    const minX = Math.min(...tous.map((p) => p[0]));
    const minY = Math.min(...tous.map((p) => p[1]));
    const loc = (p) => {
      const q = tourner(p, r);
      return [q[0] - minX, q[1] - minY];
    };
    const anneau = (a) => a.map(loc);
    return {
      id: piece.id,
      nom: piece.nom,
      largeur: Math.max(...tous.map((p) => p[0])) - minX,
      hauteur: Math.max(...tous.map((p) => p[1])) - minY,
      contour: anneau(piece.contour),
      trous: (piece.trous || []).map(anneau),
      zone: { contour: anneau(piece.zone.contour), trous: (piece.zone.trous || []).map(anneau) },
      versPatron: ([x, y]) => tourner([x + minX, y + minY], (360 - r) % 360),
    };
  }

  // Point dans un polygone à trous (règle pair-impair).
  function dedans(p, contour, trous) {
    const dans = (a) => {
      let c = false;
      for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        const [xi, yi] = a[i];
        const [xj, yj] = a[j];
        if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    return dans(contour) && !(trous || []).some(dans);
  }
  const dansZone = (points, zone) => points.every((p) => dedans(p, zone.contour, zone.trous));

  // Les contours d'un élément dans le repère de la pièce (mm).
  function contoursElement(el) {
    const t = tampon(el.id);
    if (!t) return [];
    const [w, h] = t.boite;
    const k = el.taille / w;
    const a = ((el.angle || 0) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return t.anneaux.map((anneau) =>
      anneau.map(([x, y]) => {
        let u = (x - w / 2) * k;
        const v = (y - h / 2) * k;
        if (el.miroir) u = -u;
        return [el.x + u * c - v * s, el.y + u * s + v * c];
      })
    );
  }
  const pointsElement = (el) => contoursElement(el).flat();

  // Centre de la zone (moyenne des points du contour) : on y ramène un élément qui dépasse.
  function centreZone(zone) {
    let x = 0;
    let y = 0;
    for (const p of zone.contour) {
      x += p[0];
      y += p[1];
    }
    return [x / zone.contour.length, y / zone.contour.length];
  }

  // Garde un élément dans la zone de dessin : on cherche la place libre la plus proche de l'endroit voulu (en spirale),
  // puis, s'il n'y en a pas, on le rapetisse. → { element, deplace } ; element null s'il ne tient nulle part.
  function ramener(el, zone) {
    const e = Object.assign({}, el, { taille: Math.min(TAILLE_MAX, Math.max(TAILLE_MIN, el.taille)) });
    if (dansZone(pointsElement(e), zone)) return { element: e, deplace: e.taille !== el.taille };
    const xs = zone.contour.map((p) => p[0]);
    const ys = zone.contour.map((p) => p[1]);
    const rayonMax = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    for (let essai = 0; essai < 12; essai++) {
      for (let r = 1; r <= rayonMax; r += 1) {
        const n = Math.max(8, Math.round(r * 1.5));
        for (let i = 0; i < n; i++) {
          const t = (i / n) * 2 * Math.PI;
          const f = Object.assign({}, e, { x: el.x + r * Math.cos(t), y: el.y + r * Math.sin(t) });
          if (dansZone(pointsElement(f), zone)) return { element: f, deplace: true };
        }
      }
      if (e.taille <= TAILLE_MIN) break;
      e.taille = Math.max(TAILLE_MIN, e.taille / 1.25);
      if (dansZone(pointsElement(e), zone)) return { element: e, deplace: true };
    }
    return { element: null, deplace: true };
  }

  // ---------- Export vers le patron (calque « dessin ») ----------

  const chemin = (anneau) => 'M' + anneau.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L') + ' Z';

  // Les chemins SVG du dessin d'une équipe, dans le repère du patron. pieces : les pièces de donnees/patron.js.
  function cheminsDessin(valeur, pieces) {
    const d = [];
    for (const piece of pieces) {
      const p = pieceDroite(piece);
      for (const el of ((valeur && valeur.pieces) || {})[piece.id] || []) for (const a of contoursElement(el)) d.push(chemin(a.map(p.versPatron)));
    }
    return d;
  }

  const nombreElements = (valeur) => Object.values((valeur && valeur.pieces) || {}).reduce((n, l) => n + l.length, 0);

  const API = { TAMPONS, TAILLE_MIN, TAILLE_MAX, TAILLE_DEPART, tampon, pieceDroite, dedans, dansZone, contoursElement, ramener, cheminsDessin, cheminSvg: chemin, nombreElements, centreZone };
  Object.assign(S, { dessin: API });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
