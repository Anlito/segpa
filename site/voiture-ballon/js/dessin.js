// Moteur de l'atelier « Je dessine ma carrosserie » : utilisable dans le navigateur et dans Node (tests).
// Les pièces viennent de donnees/patron.js (produit par tools/gabarits/patron-a-plier.py), en mm, dans le repère du SVG
// pour la Cricut. L'élève dessine sur une pièce montrée à l'endroit ; ses éléments sont gardés en mm dans ce repère
// « à l'endroit », puis ramenés sur le patron pour l'export (calque « dessin », tracé au stylo par la Cricut).
// Chaque élément a aussi une couleur de stylo (couleur : 'bleu' | 'rouge' | 'marron', donnees/voiture.js).
// Un élément : { type: 'tampon', id: 'flamme', x, y (centre), taille (largeur en mm), angle (degrés), miroir }
//            { type: 'texte', texte: 'TURBO', x, y, taille (hauteur des lettres en mm), angle } · { type: 'trait', points }.
// Tracé au stylo gel de 0,8 mm : les éléments ne descendent pas sous 8 mm, pour rester nets et laisser de quoi colorier.
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('../../commun/js/outils.js') : global.Segpa;

  const TAILLE_MIN = 8;
  const TAILLE_MIN_TEXTE = 7;   // hauteur des lettres
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

  // ---------- Police à un trait (majuscules, chiffres, accents) ----------
  // Chaque lettre : des traits ouverts dans une case de 4 × 6 (y vers le bas, ligne de base à 6). Le stylo de la Cricut
  // trace chaque trait d'un seul passage : lettres nettes, faciles à lire, sans contour à remplir.
  const O_ = [[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]];
  const P_ = [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]];
  const POINT = [[1.8, 5.6], [2.2, 5.6], [2.2, 6], [1.8, 6], [1.8, 5.6]];
  const LETTRES = {
    A: [[[0, 6], [2, 0], [4, 6]], [[0.7, 4], [3.3, 4]]],
    B: [[[0, 6], [0, 0], [2.8, 0], [3.6, 0.8], [3.6, 2.2], [2.8, 3], [0, 3]], [[2.8, 3], [3.8, 3.8], [3.8, 5.2], [3, 6], [0, 6]]],
    C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
    D: [[[0, 0], [0, 6], [2.5, 6], [4, 4.5], [4, 1.5], [2.5, 0], [0, 0]]],
    E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
    F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
    G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.5], [2.2, 3.5]]],
    H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
    I: [[[2, 0], [2, 6]], [[1, 0], [3, 0]], [[1, 6], [3, 6]]],
    J: [[[4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
    K: [[[0, 0], [0, 6]], [[4, 0], [0, 3.6]], [[1.4, 2.4], [4, 6]]],
    L: [[[0, 0], [0, 6], [4, 6]]],
    M: [[[0, 6], [0, 0], [2, 3], [4, 0], [4, 6]]],
    N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
    O: [O_],
    P: [P_],
    Q: [O_, [[2.6, 4.6], [4, 6.2]]],
    R: [P_, [[2, 3], [4, 6]]],
    S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
    T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
    U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
    V: [[[0, 0], [2, 6], [4, 0]]],
    W: [[[0, 0], [1, 6], [2, 2.5], [3, 6], [4, 0]]],
    X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
    Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
    Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
    0: [O_, [[3.5, 0.7], [0.5, 5.3]]],
    1: [[[1, 1], [2, 0], [2, 6]], [[1, 6], [3, 6]]],
    2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [0, 6], [4, 6]]],
    3: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1.5, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
    4: [[[3, 6], [3, 0], [0, 4], [4, 4]]],
    5: [[[4, 0], [0.5, 0], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
    6: [[[3.5, 0], [1, 0], [0, 1.5], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]]],
    7: [[[0, 0], [4, 0], [1.5, 6]]],
    8: [[[1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0]], [[1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
    9: [[[4, 3], [1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 4.5], [2.5, 6], [0.5, 6]]],
    '-': [[[0.5, 3], [3.5, 3]]],
    '+': [[[2, 1.5], [2, 4.5]], [[0.5, 3], [3.5, 3]]],
    '.': [POINT],
    '!': [[[2, 0], [2, 4.2]], POINT],
    '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.4], [2, 4.4]], POINT],
    "'": [[[2, 0], [1.6, 1.6]]],
    ' ': [],
  };
  const ACCENTS = {
    aigu: [[[1.6, -0.6], [2.6, -1.8]]],
    grave: [[[1.4, -1.8], [2.4, -0.6]]],
    circ: [[[1, -0.6], [2, -1.8], [3, -0.6]]],
    trema: [[[1, -1.3], [1.4, -1.3]], [[2.6, -1.3], [3, -1.3]]],
    cedille: [[[2, 6], [2, 6.8], [1.2, 7.4]]],
  };
  const ACCENTUEES = { É: 'E aigu', È: 'E grave', Ê: 'E circ', Ë: 'E trema', À: 'A grave', Â: 'A circ', Î: 'I circ', Ï: 'I trema', Ô: 'O circ', Ù: 'U grave', Û: 'U circ', Ü: 'U trema', Ç: 'C cedille' };
  const AVANCE = 5.6;
  const ESPACE = 3.5;

  // Le texte tel qu'il sera tracé : majuscules, seulement les caractères de la police (12 au plus pour un texte libre).
  function texteTracable(texte, max) {
    const t = String(texte || '').toLocaleUpperCase('fr-FR').replace(/Œ/g, 'OE').replace(/Æ/g, 'AE').replace(/[’`]/g, "'");
    return [...t].filter((c) => c in LETTRES || c in ACCENTUEES).join('').replace(/\s+/g, ' ').trim().slice(0, max || 16);
  }
  function glyphe(c) {
    if (ACCENTUEES[c]) {
      const [base, accent] = ACCENTUEES[c].split(' ');
      return LETTRES[base].concat(ACCENTS[accent]);
    }
    return LETTRES[c] || [];
  }
  // Traits du texte, hauteur des lettres 6, avec la largeur totale.
  function traitsTexte(texte) {
    const traits = [];
    let x = 0;
    for (const c of texte) {
      if (c === ' ') {
        x += ESPACE;
        continue;
      }
      for (const t of glyphe(c)) traits.push(t.map(([a, b]) => [a + x, b]));
      x += AVANCE;
    }
    return { traits, largeur: Math.max(4, x - (AVANCE - 4)) };
  }

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

  // Place des points (dans une boîte w × h, d'échelle k) au centre, à l'angle et dans le sens de l'élément.
  function placer(points, el, w, h, k) {
    const a = ((el.angle || 0) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return points.map(([x, y]) => {
      let u = (x - w / 2) * k;
      const v = (y - h / 2) * k;
      if (el.miroir) u = -u;
      return [el.x + u * c - v * s, el.y + u * s + v * c];
    });
  }

  // Les formes d'un élément dans le repère de la pièce (mm) : [{ points, ferme }].
  //   tampon : contours fermés (à colorier) · texte : traits de la police · trait : le tracé du crayon.
  function formesElement(el) {
    if (el.type === 'trait') return [{ points: el.points, ferme: false }];
    if (el.type === 'texte') {
      const { traits, largeur } = traitsTexte(el.texte);
      return traits.map((t) => ({ points: placer(t, el, largeur, 6, el.taille / 6), ferme: false }));
    }
    const t = tampon(el.id);
    if (!t) return [];
    return t.anneaux.map((a) => ({ points: placer(a, el, t.boite[0], t.boite[1], el.taille / t.boite[0]), ferme: true }));
  }
  const contoursElement = (el) => formesElement(el).map((f) => f.points);
  const pointsElement = (el) => contoursElement(el).flat();
  const tailleMin = (el) => (el.type === 'texte' ? TAILLE_MIN_TEXTE : TAILLE_MIN);

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
    const e = Object.assign({}, el, { taille: Math.min(TAILLE_MAX, Math.max(tailleMin(el), el.taille)) });
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
      if (e.taille <= tailleMin(el)) break;
      e.taille = Math.max(tailleMin(el), e.taille / 1.25);
      if (dansZone(pointsElement(e), zone)) return { element: e, deplace: true };
    }
    return { element: null, deplace: true };
  }

  // ---------- Crayon libre ----------

  // Simplification (Ramer-Douglas-Peucker) puis lissage (Chaikin, extrémités gardées) d'un tracé à la souris.
  function simplifier(pts, eps) {
    if (pts.length < 3) return pts.slice();
    const [a, b] = [pts[0], pts[pts.length - 1]];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-9;
    let iMax = 0;
    let dMax = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / L;
      if (d > dMax) [dMax, iMax] = [d, i];
    }
    if (dMax <= eps) return [a, b];
    return simplifier(pts.slice(0, iMax + 1), eps).slice(0, -1).concat(simplifier(pts.slice(iMax), eps));
  }
  function lisserOuvert(pts, tours) {
    let p = pts;
    for (let k = 0; k < tours && p.length > 2; k++) {
      const q = [p[0]];
      for (let i = 0; i < p.length - 1; i++) {
        const [a, b] = [p[i], p[i + 1]];
        q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      q.push(p[p.length - 1]);
      p = q;
    }
    return p;
  }
  const longueur = (pts) => pts.slice(1).reduce((l, p, i) => l + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

  // Un tracé du crayon → des éléments « trait » : coupé là où il sort de la zone, lissé ; les bouts de moins de 3 mm
  // sont oubliés. → { elements, coupe } (coupe : une partie était hors de la zone).
  function traitsCrayon(points, zone) {
    const morceaux = [];
    let courant = [];
    let coupe = false;
    for (const p of points) {
      if (dedans(p, zone.contour, zone.trous)) courant.push(p);
      else {
        coupe = true;
        if (courant.length) morceaux.push(courant);
        courant = [];
      }
    }
    if (courant.length) morceaux.push(courant);
    const elements = morceaux
      .map((m) => lisserOuvert(simplifier(m, 0.4), 2).map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]))
      .filter((m) => m.length >= 2 && longueur(m) >= 3 && dansZone(m, zone))
      .map((m) => ({ type: 'trait', points: m }));
    return { elements, coupe };
  }

  // ---------- « Pareil de l'autre côté » ----------
  // Les deux côtés sont symétriques : ce qui est dessiné sur l'un est reproduit en miroir sur l'autre, pour que les
  // flammes partent vers l'arrière des deux côtés. Le texte reste lisible (il n'est pas retourné, seulement déplacé).
  function miroirElements(elements, largeur, zone) {
    const copies = [];
    for (const el of elements) {
      let c;
      if (el.type === 'trait') c = Object.assign({}, el, { points: el.points.map(([x, y]) => [largeur - x, y]) });
      else c = Object.assign({}, el, { x: largeur - el.x, angle: (360 - (el.angle || 0)) % 360, miroir: el.type === 'texte' ? false : !el.miroir });
      if (c.type === 'trait') {
        if (dansZone(c.points, zone)) copies.push(c);
      } else {
        const r = ramener(c, zone);
        if (r.element) copies.push(r.element);
      }
    }
    return copies;
  }

  // ---------- Déplacer un dessin ----------
  // Un dessin glissé à la souris : posé là où on le lâche s'il tient dans la zone, sinon à la place libre la plus proche.
  function decaler(el, dx, dy) {
    if (el.type === 'trait') return Object.assign({}, el, { points: el.points.map(([x, y]) => [x + dx, y + dy]) });
    return Object.assign({}, el, { x: el.x + dx, y: el.y + dy });
  }
  function deplacerElement(el, dx, dy, zone) {
    if (el.type !== 'trait') {
      // lâché hors du cadre de la pièce : on part du bord le plus proche, puis on cherche une place libre
      const xs = zone.contour.map((p) => p[0]);
      const ys = zone.contour.map((p) => p[1]);
      const e = decaler(el, dx, dy);
      e.x = Math.min(Math.max(...xs), Math.max(Math.min(...xs), e.x));
      e.y = Math.min(Math.max(...ys), Math.max(Math.min(...ys), e.y));
      const r = ramener(e, zone);
      return r.element ? { element: r.element, deplace: r.deplace || e.x !== el.x + dx || e.y !== el.y + dy } : { element: el, deplace: true };
    }
    const ok = (e) => dansZone(e.points, zone);
    const voulu = decaler(el, dx, dy);
    if (ok(voulu)) return { element: voulu, deplace: false };
    for (let r = 1; r <= 60; r += 1) {
      const n = Math.max(8, Math.round(r * 1.5));
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 2 * Math.PI;
        const e = decaler(el, dx + r * Math.cos(t), dy + r * Math.sin(t));
        if (ok(e)) return { element: e, deplace: true };
      }
    }
    return { element: el, deplace: true };
  }

  // ---------- Export vers le patron (calque « dessin ») ----------

  const chemin = (points, ouvert) => 'M' + points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L') + (ouvert ? '' : ' Z');

  // Les chemins SVG du dessin d'une équipe, dans le repère du patron. pieces : les pièces de donnees/patron.js.
  function cheminsDessin(valeur, pieces) {
    const d = [];
    for (const piece of pieces) {
      const p = pieceDroite(piece);
      for (const el of ((valeur && valeur.pieces) || {})[piece.id] || []) for (const f of formesElement(el)) d.push(chemin(f.points.map(p.versPatron), !f.ferme));
    }
    return d;
  }

  // Les chemins du dessin rangés par couleur de stylo (un calque par couleur dans le SVG, la Cricut demande de changer
  // de stylo entre deux) : { bleu: [...], rouge: [...] } ; un dessin sans couleur est bleu (ancienne sauvegarde).
  const COULEUR_PAR_DEFAUT = 'bleu';
  function cheminsParCouleur(valeur, pieces) {
    const parCouleur = {};
    for (const piece of pieces) {
      const p = pieceDroite(piece);
      for (const el of ((valeur && valeur.pieces) || {})[piece.id] || []) {
        const c = el.couleur || COULEUR_PAR_DEFAUT;
        for (const f of formesElement(el)) (parCouleur[c] = parCouleur[c] || []).push(chemin(f.points.map(p.versPatron), !f.ferme));
      }
    }
    return parCouleur;
  }

  // Le patron décoré d'une équipe, pour la Cricut : même taille et même repère que le patron (mm), un calque « decoupe »
  // (noir), un calque « plis » (vert) et un calque « dessin-<couleur> » par stylo utilisé, dans l'ordre des stylos
  // (donnees/voiture.js). Dans Design Space : dessin (stylo par stylo), puis rainurage, puis découpe.
  function svgCricut(valeur, patron, stylos, titre) {
    const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const [L, H] = patron.taille;
    const parCouleur = cheminsParCouleur(valeur, patron.pieces);
    const ordre = (stylos || []).map((x) => x.id).concat(Object.keys(parCouleur)).filter((c, i, t) => parCouleur[c] && t.indexOf(c) === i);
    const hex = (c) => ((stylos || []).find((x) => x.id === c) || { hex: '#1D4ED8' }).hex;
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${L}mm" height="${H}mm" viewBox="0 0 ${L} ${H}">`,
      `<title>${echapper(titre || 'Patron de carrosserie décoré')}</title>`,
      '<g id="decoupe" fill="none" stroke="#000000" stroke-width="0.25">',
      ...patron.decoupe.map((d) => `<path d="${d}"/>`),
      '</g>',
      '<g id="plis" fill="none" stroke="#16A34A" stroke-width="0.25">',
      ...patron.plis.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`),
      '</g>',
      ...ordre.flatMap((c) => [`<g id="dessin-${c}" fill="none" stroke="${hex(c)}" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round">`, ...parCouleur[c].map((d) => `<path d="${d}"/>`), '</g>']),
      '</svg>',
      '',
    ].join('\n');
  }

  const nombreElements = (valeur) => Object.values((valeur && valeur.pieces) || {}).reduce((n, l) => n + l.length, 0);

  const API = { TAMPONS, TAILLE_MIN, TAILLE_MIN_TEXTE, TAILLE_MAX, TAILLE_DEPART, tampon, texteTracable, traitsTexte, formesElement, traitsCrayon, miroirElements, pieceDroite, dedans, dansZone, contoursElement, ramener, cheminsDessin, cheminsParCouleur, svgCricut, COULEUR_PAR_DEFAUT, deplacerElement, cheminSvg: chemin, nombreElements, centreZone };
  Object.assign(S, { dessin: API });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
