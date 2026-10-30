// Gabarit de carrosserie (châssis v8) — cotes en mm, échelle 1
const fs = require('fs');
const TAB = 3, LT = 19.5;           // languette : profondeur = épaisseur de la plaque, largeur = fente 20 - 0,5
function chemin(x0, y0, pts) { return 'M' + pts.map(([u, h]) => `${(x0 + u).toFixed(2)},${(y0 - h).toFixed(2)}`).join(' L') + ' Z'; }
function languettes(x0, y0, centres) {
  return centres.map(c => `<rect x="${(x0 + c - LT / 2).toFixed(2)}" y="${y0}" width="${LT}" height="${TAB}" class="lang"/>`).join('');
}
function bas(points, centres, encoches) {
  // bord bas de gauche à droite, avec languettes (vers le bas) et encoches (vers le haut)
  const evts = [...centres.map(c => ['t', c - LT / 2, c + LT / 2]), ...encoches.map(([a, b, h]) => ['e', a, b, h])].sort((p, q) => p[1] - q[1]);
  const out = [];
  for (const e of evts) {
    if (e[0] === 't') out.push([e[1], 0], [e[1], -TAB], [e[2], -TAB], [e[2], 0]);
    else out.push([e[1], 0], [e[1], e[3]], [e[2], e[3]], [e[2], 0]);
  }
  return out;
}
// FLANC : départ x = -47 (châssis), fin x = 78,1 ; fentes x -25,5 / 33,5 ; supports d'axes -44..-31 et 55..68 (11 de haut)
const L = 125.1, H = 35, R = 23, HR = 20;
const cF = [-25.5 + 10 + 47, 33.5 + 10 + 47];
const eF = [[3, 16, 9], [102, 115, 9]];
function flanc(x0, y0, titre) {
  const pts = [[-R, 0], [0, 0], ...bas(null, cF, eF), [L, 0], [L, H], [0, H], [0, HR], [-R, HR]];
  return languettes(x0, y0, cF) + `<path d="${chemin(x0, y0, pts)}" class="coupe"/>` +
    `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - HR}" class="pli"/>` +
    `<text x="${x0 - R / 2}" y="${y0 - HR / 2 + 1.5}" class="petit" text-anchor="middle">nez</text>` +
    `<text x="${x0 + 2}" y="${y0 - HR - 2}" class="petit">← plier</text>` +
    eF.map(([a, b]) => `<text x="${x0 + (a + b) / 2}" y="${y0 - 11}" class="mini" text-anchor="middle">axe</text>`).join('') +
    `<text x="${x0 + L / 2}" y="${y0 - 20}" class="titre" text-anchor="middle">${titre}</text>` +
    `<text x="${x0 + L / 2}" y="${y0 - 13}" class="petit" text-anchor="middle">côté de la voiture</text>`;
}
// AVANT : 40 × 20, fente centrée
function avant(x0, y0) {
  const W = 40, h = 20;
  const pts = [[0, 0], ...bas(null, [20], []), [W, 0], [W, h], [0, h]];
  return languettes(x0, y0, [20]) + `<path d="${chemin(x0, y0, pts)}" class="coupe"/><text x="${x0 + 20}" y="${y0 - 9}" class="titre" text-anchor="middle">AVANT</text>`;
}
// ARRIÈRE : 75,6 de large, fentes y -3,7..16,3 et 48,8..68,8 ; arche pour la sortie d'air (y 20..45, 18 de haut)
function arriere(x0, y0) {
  const W = 75.6, h = 35, a = 25.5, b = 50.5, ha = 20, r = (b - a) / 2;
  const c1 = 1.8 + 10, c2 = 54.3 + 10;
  const p = [[0, 0], [c1 - LT / 2, 0], [c1 - LT / 2, -TAB], [c1 + LT / 2, -TAB], [c1 + LT / 2, 0], [a, 0], [a, ha - r]];
  let d = chemin(x0, y0, p).replace(' Z', '');
  d += ` A${r},${r} 0 0 1 ${(x0 + b).toFixed(2)},${(y0 - ha + r).toFixed(2)}`;
  const q = [[b, 0], [c2 - LT / 2, 0], [c2 - LT / 2, -TAB], [c2 + LT / 2, -TAB], [c2 + LT / 2, 0], [W, 0], [W, h], [0, h]];
  d += ' L' + q.map(([u, v]) => `${(x0 + u).toFixed(2)},${(y0 - v).toFixed(2)}`).join(' L') + ' Z';
  return languettes(x0, y0, [c1, c2]) + `<path d="${d}" class="coupe"/><text x="${x0 + W / 2}" y="${y0 - 27}" class="titre" text-anchor="middle">ARRIÈRE</text>` +
    `<text x="${x0 + (a + b) / 2}" y="${y0 - 3}" class="mini" text-anchor="middle">air</text>`;
}
// Schéma de montage vu de dessus (échelle 0,55)
function schema(x0, y0) {
  const k = 0.55, P = (x, y) => `${(x0 + (x + 68.3) * k).toFixed(2)},${(y0 + (y + 7.6) * k).toFixed(2)}`;
  const contour = [[-68.3, 13], [-44, -7.6], [81.7, -7.6], [81.7, 72.4], [-44, 72.4], [-68.3, 51.8]];
  const ligne = (pts, cl) => `<polyline points="${pts.map(p => P(...p)).join(' ')}" class="${cl}"/>`;
  return `<polygon points="${contour.map(p => P(...p)).join(' ')}" class="chassis"/>` +
    [[-38, -13.6, -7.6], [-38, 72.4, 78.4], [62, -13.6, -7.6], [62, 72.4, 78.4]].map(([x, a, b]) => `<rect x="${P(x - 10, a).split(',')[0]}" y="${P(0, a).split(',')[1]}" width="${20 * k}" height="${(b - a) * k}" class="roue"/>`).join('') +
    ligne([[-62.4, 12.4], [-47, -4.7], [78.1, -4.7]], 'mur') + ligne([[-62.4, 52.4], [-47, 69.3], [78.1, 69.3]], 'mur') +
    ligne([[-62.4, 12.4], [-62.4, 52.4]], 'mur') + ligne([[78.9, -5.5], [78.9, 70.1]], 'mur') +
    `<circle cx="${P(28.3, 32.4).split(',')[0]}" cy="${P(28.3, 32.4).split(',')[1]}" r="${7.5 * k}" class="tube"/>` +
    `<text x="${P(-20, 32.4).split(',')[0]}" y="${P(0, 34).split(',')[1]}" class="mini" text-anchor="middle">AVANT</text>` +
    `<text x="${P(60, 32.4).split(',')[0]}" y="${P(0, 34).split(',')[1]}" class="mini" text-anchor="middle">ARRIÈRE</text>`;
}
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">
<style>
 text{font-family:Lexend,Arial,sans-serif;fill:#000}
 .coupe{fill:none;stroke:#000;stroke-width:0.5}
 .lang{fill:url(#hach);stroke:none}
 .pli{stroke:#000;stroke-width:0.4;stroke-dasharray:2 1.5}
 .titre{font-size:5.2px;font-weight:700}
 .petit{font-size:3.4px}
 .mini{font-size:2.8px}
 .chassis{fill:#eee;stroke:#000;stroke-width:0.3}
 .roue{fill:#999}
 .mur{fill:none;stroke:#000;stroke-width:1.2;stroke-linejoin:round}
 .tube{fill:#fff;stroke:#000;stroke-width:0.4}
</style>
<defs><pattern id="hach" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.2" stroke="#000" stroke-width="0.35"/></pattern></defs>
<text x="15" y="18" style="font-size:7px;font-weight:700">Gabarit de carrosserie — voiture à ballon</text>
<text x="15" y="25" class="petit">Imprimer à taille réelle (100 %, sans « ajuster à la page »). Vérifier : le trait ci-dessous mesure 50 mm.</text>
<line x1="15" y1="29" x2="65" y2="29" stroke="#000" stroke-width="0.6"/><line x1="15" y1="27.5" x2="15" y2="30.5" stroke="#000" stroke-width="0.4"/><line x1="65" y1="27.5" x2="65" y2="30.5" stroke="#000" stroke-width="0.4"/><text x="68" y="30.2" class="petit">50 mm</text>
${flanc(48, 80, 'FLANC 1')}
${flanc(48, 130, 'FLANC 2')}
${arriere(25, 182)}
${avant(125, 182)}
<g transform="translate(0,0)">
<text x="15" y="200" class="petit" style="font-weight:700">Comment faire</text>
<text x="15" y="206" class="petit">1. Je pose le gabarit sur le carton.  2. Je trace autour au crayon.  3. Je découpe.</text>
<text x="15" y="211" class="petit">4. Je plie le nez de chaque flanc.  5. J'enfonce les languettes dans les fentes du châssis.</text>
<text x="15" y="218" class="petit"><tspan style="font-weight:700">Je peux couper plus bas, jamais plus haut.</tspan> Je ne bouche ni la sortie d'air, ni les roues, ni le tube du ballon.</text>
<rect x="15" y="222" width="8" height="3" fill="url(#hach)"/><text x="25" y="224.8" class="mini">languette (entre dans la fente)</text>
<line x1="75" y1="223.5" x2="85" y2="223.5" class="pli"/><text x="87" y="224.8" class="mini">pli</text>
<line x1="100" y1="223.5" x2="110" y2="223.5" class="coupe"/><text x="112" y="224.8" class="mini">je découpe</text>
<text x="15" y="234" class="petit" style="font-weight:700">Vu de dessus : où va chaque pièce</text>
${schema(30, 238)}
<text x="15" y="290" class="mini">Châssis v8 : fentes 20 × 2 mm, carton 1,6 mm. Hauteur maximale 35 mm ; le tube incliné du ballon sort sous l'arche arrière.</text>
</g>
</svg>`;
fs.writeFileSync('gabarit.svg', svg);
fs.writeFileSync('gabarit.html', `<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0}</style>${svg}`);
