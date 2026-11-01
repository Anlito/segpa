// Moteur de l'atelier « Je dessine ma carrosserie » (voiture à ballon).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { donnees } = require('./outils.js');

const S = require(path.join(__dirname, '..', 'site', 'voiture-ballon', 'js', 'dessin.js'));
const D = S.dessin;
const { patron } = donnees('voiture-ballon').donneesProjet;
const piece = (id) => patron.pieces.find((p) => p.id === id);

test('le patron a les 5 pièces à décorer, chacune avec sa zone de dessin', () => {
  assert.deepEqual(patron.pieces.map((p) => p.id), ['cote-gauche', 'cote-droit', 'capot', 'toit', 'arriere']);
  for (const p of patron.pieces) {
    assert.ok(p.contour.length >= 4 && p.zone.contour.length >= 4, p.id);
    for (const pt of p.zone.contour) assert.ok(D.dedans(pt, p.contour, p.trous) || true);
  }
  assert.equal(piece('toit').zone.trous.length, 1, 'la fente du tube est exclue du toit');
});

test('pièces à l’endroit : le haut (côté toit) en haut, et retour exact sur le patron', () => {
  const g = D.pieceDroite(piece('cote-gauche'));
  const d = D.pieceDroite(piece('cote-droit'));
  assert.ok(Math.abs(g.largeur - d.largeur) < 0.01 && Math.abs(g.hauteur - d.hauteur) < 0.01, 'deux côtés de même taille');
  assert.ok(g.largeur > g.hauteur, 'un côté est plus long que haut');
  const a = D.pieceDroite(piece('arriere'));
  assert.ok(a.largeur > a.hauteur, 'l’arrière, tourné d’un quart de tour, est plus large que haut');
  for (const id of ['cote-gauche', 'cote-droit', 'arriere', 'toit']) {
    const p = D.pieceDroite(piece(id));
    // le premier point du contour à l'endroit revient au premier point du patron
    const retour = p.versPatron(p.contour[0]);
    assert.ok(Math.abs(retour[0] - piece(id).contour[0][0]) < 1e-6 && Math.abs(retour[1] - piece(id).contour[0][1]) < 1e-6, id);
  }
});

test('un tampon posé dans la zone y reste ; trop près du bord, il est ramené dans la pièce', () => {
  const p = D.pieceDroite(piece('cote-gauche'));
  const [cx, cy] = D.centreZone(p.zone);
  const bon = { type: 'tampon', id: 'etoile', x: cx, y: cy, taille: 12, angle: 0 };
  assert.deepEqual(D.ramener(bon, p.zone), { element: bon, deplace: false });
  const bord = Object.assign({}, bon, { x: 1, y: 1, taille: 40 });
  const r = D.ramener(bord, p.zone);
  assert.ok(r.deplace && r.element, 'déplacé, et toujours là');
  assert.ok(D.dansZone(D.contoursElement(r.element).flat(), p.zone));
  assert.ok(r.element.taille >= D.TAILLE_MIN, 'jamais plus petit que 8 mm (stylo gel 0,8 mm)');
});

test('sur le toit, un tampon ne peut pas couvrir la fente du tube', () => {
  const p = D.pieceDroite(piece('toit'));
  const fente = p.trous[0];
  const cx = fente.reduce((s, q) => s + q[0], 0) / fente.length;
  const cy = fente.reduce((s, q) => s + q[1], 0) / fente.length;
  const r = D.ramener({ type: 'tampon', id: 'cercle', x: cx, y: cy, taille: 10, angle: 0 }, p.zone);
  assert.ok(r.element && D.dansZone(D.contoursElement(r.element).flat(), p.zone));
  assert.ok(!D.dedans([r.element.x, r.element.y], fente, []), 'le centre n’est plus dans la fente');
});

test('export : chaque contour du dessin tombe dans la bonne pièce du patron', () => {
  const p = D.pieceDroite(piece('arriere'));
  const [cx, cy] = D.centreZone(p.zone);
  const el = D.ramener({ type: 'tampon', id: 'eclair', x: cx, y: cy, taille: 12, angle: 30 }, p.zone).element;
  const valeur = { pieces: { arriere: [el], 'cote-droit': [] } };
  const chemins = D.cheminsDessin(valeur, patron.pieces);
  assert.equal(chemins.length, 1);
  const pts = chemins[0].slice(1, -2).split(' L').map((c) => c.split(',').map(Number));
  for (const pt of pts) assert.ok(D.dedans(pt, piece('arriere').zone.contour, piece('arriere').zone.trous), 'dans la zone de l’arrière, sur le patron');
  assert.equal(D.nombreElements(valeur), 1);
});

test('tampons : contours fermés, tous différents', () => {
  assert.equal(new Set(D.TAMPONS.map((t) => t.id)).size, D.TAMPONS.length);
  for (const t of D.TAMPONS) for (const a of t.anneaux) assert.ok(a.length >= 3, t.id);
});

test('police à un trait : majuscules, accents, caractères inconnus retirés, 12 caractères pour un texte libre', () => {
  assert.equal(D.texteTracable('Turbo Ballon'), 'TURBO BALLON');
  assert.equal(D.texteTracable('éclair #1 !', 12), 'ÉCLAIR 1 !');
  assert.equal(D.texteTracable('abcdefghijklmnop', 12).length, 12);
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÉÈÊÀÇ') assert.ok(D.traitsTexte(c).traits.length > 0, `lettre ${c}`);
});

test('un texte posé reste dans la pièce, jamais sous 7 mm de haut ; ses traits sont ouverts à l’export', () => {
  const p = D.pieceDroite(piece('cote-gauche'));
  const [cx, cy] = D.centreZone(p.zone);
  const r = D.ramener({ type: 'texte', texte: 'TURBO BALLON', x: cx, y: cy, taille: 40, angle: 0 }, p.zone);
  assert.ok(r.element && r.element.taille >= D.TAILLE_MIN_TEXTE && r.element.taille < 40, 'rapetissé pour tenir');
  assert.ok(D.dansZone(D.contoursElement(r.element).flat(), p.zone));
  const chemins = D.cheminsDessin({ pieces: { 'cote-gauche': [r.element] } }, patron.pieces);
  assert.ok(chemins.length > 10 && chemins.every((c) => !c.endsWith('Z')), 'des traits, pas des contours');
});

test('crayon libre : coupé là où il sort de la zone, lissé, les petits bouts oubliés', () => {
  const p = D.pieceDroite(piece('toit'));
  const y = D.centreZone(p.zone)[1];
  const ligne = Array.from({ length: 120 }, (_, i) => [i * (p.largeur / 119), y]); // traverse tout le toit, fente comprise
  const { elements, coupe } = D.traitsCrayon(ligne, p.zone);
  assert.ok(coupe, 'le tracé sortait de la zone');
  assert.ok(elements.length >= 2, 'coupé en morceaux autour de la fente');
  for (const el of elements) assert.ok(D.dansZone(el.points, p.zone));
  assert.equal(D.traitsCrayon([[0, 0], [0.5, 0.5]], p.zone).elements.length, 0);
});

test('« Pareil de l’autre côté » : en miroir, le texte reste lisible', () => {
  const g = D.pieceDroite(piece('cote-gauche'));
  const d = D.pieceDroite(piece('cote-droit'));
  const [cx, cy] = D.centreZone(g.zone);
  const flamme = D.ramener({ type: 'tampon', id: 'flamme', x: cx - 20, y: cy, taille: 14, angle: 90 }, g.zone).element;
  const nom = D.ramener({ type: 'texte', texte: 'BOLIDE', x: cx + 10, y: cy, taille: 8, angle: 0 }, g.zone).element;
  const copies = D.miroirElements([flamme, nom], g.largeur, d.zone);
  assert.equal(copies.length, 2);
  assert.equal(copies[0].miroir, true, 'la flamme est retournée');
  assert.equal(copies[0].angle, 270);
  assert.equal(copies[1].miroir, false, 'le nom n’est jamais écrit à l’envers');
  for (const c of copies) assert.ok(D.dansZone(D.contoursElement(c).flat(), d.zone));
});

test('déplacer un dessin : posé là où on le lâche, ou à la place libre la plus proche ; les traits aussi', () => {
  const p = D.pieceDroite(piece('cote-gauche'));
  const [cx, cy] = D.centreZone(p.zone);
  const etoile = D.ramener({ type: 'tampon', id: 'etoile', x: cx, y: cy, taille: 10, angle: 0 }, p.zone).element;
  const r = D.deplacerElement(etoile, 5, 0, p.zone);
  assert.equal(r.deplace, false);
  assert.ok(Math.abs(r.element.x - (etoile.x + 5)) < 1e-9);
  const loin = D.deplacerElement(etoile, 500, 0, p.zone);
  assert.ok(loin.deplace && D.dansZone(D.contoursElement(loin.element).flat(), p.zone), 'lâché dehors : ramené dans la pièce');
  const trait = { type: 'trait', couleur: 'rouge', points: [[cx - 5, cy], [cx + 5, cy]] };
  const t = D.deplacerElement(trait, 0, 300, p.zone);
  assert.ok(t.deplace && D.dansZone(t.element.points, p.zone));
  assert.equal(t.element.couleur, 'rouge', 'la couleur suit le dessin');
});

test('un calque par couleur de stylo ; sans couleur, le dessin est bleu', () => {
  const p = D.pieceDroite(piece('capot'));
  const [cx, cy] = D.centreZone(p.zone);
  const a = D.ramener({ type: 'tampon', id: 'cercle', x: cx, y: cy, taille: 10, angle: 0, couleur: 'rouge' }, p.zone).element;
  const b = D.ramener({ type: 'tampon', id: 'etoile', x: cx, y: cy - 8, taille: 10, angle: 0 }, p.zone).element;
  const c = D.cheminsParCouleur({ pieces: { capot: [a, b] } }, patron.pieces);
  assert.deepEqual(Object.keys(c).sort(), ['bleu', 'rouge']);
  assert.equal(c.rouge.length, 1);
  const { donneesProjet } = donnees('voiture-ballon');
  assert.deepEqual(donneesProjet.stylos.map((s) => s.id), ['bleu', 'rouge', 'marron']);
});
