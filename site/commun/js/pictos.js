// Pictogrammes dessinés pour les outils SEGPA (traits, 24 × 24). Le même pictogramme veut dire la même chose dans
// tous les projets : photo = photographier, règle = mesurer, balai = ranger, main = aide, coche = fait.
(function (global) {
  'use strict';

  const S = global.Segpa;

  const TRACES = {
    maison: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    voix: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 010 6"/><path d="M19.5 6a8 8 0 010 12"/>',
    aide: '<path d="M8 13V6a1.5 1.5 0 013 0v5"/><path d="M11 11V4a1.5 1.5 0 013 0v7"/><path d="M14 11V5.5a1.5 1.5 0 013 0V12"/><path d="M17 10a1.5 1.5 0 013 0v5a7 7 0 01-7 7h-1a7 7 0 01-5.6-2.8L3 15.5a1.6 1.6 0 012.4-2L8 16"/>',
    coche: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    retour: '<path d="M15 5l-7 7 7 7"/>',
    suivant: '<path d="M9 5l7 7-7 7"/>',
    lecture: '<path d="M8 5l11 7-11 7z"/>',
    continuer: '<path d="M3 6h7l2 2h9v11H3z"/><path d="M10 13h7"/><path d="M14 10l3 3-3 3"/>',
    dossier: '<path d="M3 6h7l2 2h9v11H3z"/>',
    'dossier-ok': '<path d="M3 6h7l2 2h9v11H3z"/><path d="M9 13.5l2 2 4-4"/>',
    photo: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="4"/>',
    album: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>',
    tournevis: '<path d="M20 4l-6 6"/><path d="M13 9l2 2-7.5 7.5a2.1 2.1 0 01-3-3z"/>',
    regle: '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
    remonter: '<path d="M4 12a8 8 0 0114-5.3"/><path d="M18 3v4h-4"/><path d="M20 12a8 8 0 01-14 5.3"/><path d="M6 21v-4h4"/>',
    boite: '<path d="M3 9l9-4 9 4v9l-9 4-9-4z"/><path d="M3 9l9 4 9-4"/><path d="M12 13v9"/>',
    etiquette: '<path d="M3 12V4h8l10 10-8 8z"/><path d="M7.5 8.5h.01"/>',
    balai: '<path d="M15 3l-4 9"/><path d="M6 12h9l2 9H4z"/><path d="M8.5 16v5M12.5 16v5"/>',
    vis: '<path d="M9 3h6"/><path d="M12 3v3"/><path d="M10 6h4l-.5 12-1.5 2-1.5-2z"/><path d="M10.2 9l3.6 1.5M10.2 12l3.6 1.5M10.3 15l3.4 1.4"/>',
    'main-stop': '<path d="M8 13V6a1.5 1.5 0 013 0v5"/><path d="M11 11V4a1.5 1.5 0 013 0v7"/><path d="M14 11V5.5a1.5 1.5 0 013 0V12"/><path d="M17 10a1.5 1.5 0 013 0v5a7 7 0 01-7 7h-1a7 7 0 01-5.6-2.8L3 15.5a1.6 1.6 0 012.4-2L8 16"/>',
    lame: '<path d="M4 20L16 8l4-4"/><path d="M14 6l4 4"/><path d="M6 14l4 4"/><circle cx="18.5" cy="18.5" r="3"/><path d="M17 17l3 3"/>',
    crayon: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/>',
    'taille-crayon': '<rect x="3" y="8" width="12" height="11" rx="2"/><circle cx="9" cy="13.5" r="2"/><path d="M15 12h3l2-4"/><circle cx="20.5" cy="7" r="1.5"/><path d="M6 8V6h6v2"/>',
    velo: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h6l2 7"/><path d="M10 9l3 7h-2"/><path d="M15 6h3"/>',
    jouet: '<rect x="2.5" y="8" width="19" height="10" rx="5"/><path d="M7 11v4M5 13h4"/><circle cx="16" cy="12" r=".8" fill="currentColor"/><circle cx="18" cy="14.5" r=".8" fill="currentColor"/>',
    stylo: '<path d="M15 4l5 5-10 10H5v-5z"/><path d="M13 6l5 5"/>',
    texte: '<path d="M4 6h16M4 11h16M4 16h10"/>',
    oral: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>',
    question: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4"/><path d="M12 17h.01"/>',
    voiture: '<path d="M3 15V11l3-4h9l3 4h2a1 1 0 011 1v3"/><path d="M3 15h18"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/><path d="M8 7v4h9"/>',
    roue: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6"/>',
    ballon: '<path d="M12 3c3.6 0 6 2.9 6 6.5 0 3.8-3 7-6 7s-6-3.2-6-7C6 5.9 8.4 3 12 3z"/><path d="M11 16.5l-.8 2h3.6l-.8-2"/><path d="M12 18.5c0 1.5-1.5 2-1.5 3"/>',
    pompe: '<path d="M9 3h6"/><path d="M12 3v4"/><rect x="8" y="7" width="8" height="12" rx="1.5"/><path d="M6 21h12"/><path d="M16 11h3v-3"/>',
    ciseaux: '<circle cx="6" cy="17" r="3"/><circle cx="6" cy="7" r="3"/><path d="M8.5 15.5L20 5"/><path d="M8.5 8.5L20 19"/>',
    colle: '<path d="M4 9h11l3 3-3 3H4z"/><path d="M18 12h3"/><path d="M8 15v5"/><path d="M11 9V6h-4v3"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.2 0 1.8-.9 1.4-2-.4-1.2.4-2.3 1.6-2.3H17a4 4 0 004-4c0-5.4-4-9.7-9-9.7z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>',
    drapeau: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    elastique: '<ellipse cx="12" cy="12" rx="8" ry="5"/><ellipse cx="12" cy="12" rx="5.5" ry="2.8"/>',
    pique: '<path d="M3 21L21 3"/><path d="M17 3h4v4"/>',
    chassis: '<rect x="3" y="9" width="18" height="6" rx="1"/><path d="M6 15v3M18 15v3M6 9V7M18 9V7"/><circle cx="14" cy="6" r="2"/>',
    oeil: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    table: '<path d="M3 9h18"/><path d="M5 9v10M19 9v10"/><path d="M3 9l2-4h14l2 4"/>',
    son: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 010 6"/>',
    'sans-son': '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    camera: '<path d="M3 7h12v10H3z"/><path d="M15 10l6-3v10l-6-3"/>',
    fleche: '<path d="M4 12h14"/><path d="M13 7l5 5-5 5"/>',
    effacer: '<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>',
    point: '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
    rond: '<circle cx="12" cy="12" r="6"/>',
    'visage-oui': '<circle cx="12" cy="12" r="9.5"/><circle cx="8.8" cy="10" r=".7" fill="currentColor"/><circle cx="15.2" cy="10" r=".7" fill="currentColor"/><path d="M7.5 14.5c1.2 2 2.7 3 4.5 3s3.3-1 4.5-3"/>',
    'visage-moyen': '<circle cx="12" cy="12" r="9.5"/><circle cx="8.8" cy="10" r=".7" fill="currentColor"/><circle cx="15.2" cy="10" r=".7" fill="currentColor"/><path d="M8 15.5h8"/>',
    'visage-pas-encore': '<circle cx="12" cy="12" r="9.5"/><circle cx="8.8" cy="10" r=".7" fill="currentColor"/><circle cx="15.2" cy="10" r=".7" fill="currentColor"/><path d="M7.5 17c1.2-2 2.7-3 4.5-3s3.3 1 4.5 3"/>',
  };

  // picto('photo', 48) → <svg> à mettre dans le HTML (décoratif : le texte à côté dit la même chose).
  function picto(nom, taille, classe) {
    const t = TRACES[nom] || TRACES.point;
    const dim = taille ? ` width="${taille}" height="${taille}"` : '';
    return `<svg class="picto${classe ? ' ' + classe : ''}" viewBox="0 0 24 24"${dim} aria-hidden="true" focusable="false">${t}</svg>`;
  }

  // Deux pictogrammes reliés par une flèche (« la vis va dans la boîte »).
  function pictoDouble(a, b, taille) {
    return picto(a, taille) + picto('fleche', Math.round(taille / 2.2), 'picto-fleche') + picto(b, taille);
  }

  // Photo du professeur si elle existe, sinon le pictogramme : <img data-repli="nom du picto">. Si le fichier manque
  // (photo pas encore prise), l'image est remplacée par le pictogramme (voir l'écouteur plus bas).
  function photoOuPicto(src, nom, taille) {
    return src ? `<img class="photo-objet" src="${src}" alt="" data-repli="${nom}" data-taille="${taille || ''}">` : picto(nom, taille);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener(
      'error',
      (e) => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement)) return;
        if (img.dataset.repli) img.outerHTML = picto(img.dataset.repli, Number(img.dataset.taille) || undefined);
        else if (img.closest('.carte-nom')) img.remove();
      },
      true
    );
  }

  S.picto = picto;
  S.photoOuPicto = photoOuPicto;
  S.pictoDouble = pictoDouble;
  S.PICTOS = Object.keys(TRACES);
})(window);
