// Outil professeur : ce qui est propre au taille-crayon (brief §5).
//   tuile   : pièces démontées (n sur N), mesures de la séance 2 ;
//   alertes : « Plus de 2 pièces dehors » (séance 2), mesure encore hors de la plage après les essais ;
//   onglets : « Pièces et réponses » (tableau de la séance 1, réponses écrites de la séance 3),
//             « Séance 2 » (longueurs saisies, essais, plage de référence).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const M = () => S.modele || {};
  const ech = S.echapper;

  const pieces = (d) => {
    const v = S.valeurEtape(d, 's1', 'pieces');
    return (v && Array.isArray(v.pieces) && v.pieces) || [];
  };
  const mesure = (d, id) => S.valeurEtape(d, 's2', id) || null;
  const MESURES = () =>
    S.etapes.seances
      .find((s) => s.id === 's2')
      .etapes.filter((e) => e.type === 'mesure')
      .map((e) => ({ id: e.id, piece: e.piece, info: (M().mesures || {})[e.piece] || { titre: e.piece, nom: e.piece } }));
  const plage = (info) => S.plageDe(info.reference, M().tolerance);
  const cm = (n) => (n === null || n === undefined ? '—' : `${S.ecrireNombre(n)} cm`);
  const VERDICT = { dedans: '✓ dans la plage', dehors: '~ hors de la plage', 'sans-reference': 'pas de référence' };

  function lignes(d) {
    const l = [`Pièces démontées : ${pieces(d).length} sur ${M().nombrePieces || 8}`];
    const m = MESURES()
      .map(({ id, piece }) => {
        const v = mesure(d, id);
        return v && v.longueur !== null && v.longueur !== undefined ? `${piece} ${cm(v.longueur)}${v.verdict === 'dedans' ? ' ✓' : v.verdict === 'dehors' ? ' ~' : ''}` : null;
      })
      .filter(Boolean);
    if (m.length) l.push('Mesures : ' + m.join(' · '));
    return l;
  }

  function alertes(d) {
    const a = [];
    if (MESURES().some(({ id }) => (mesure(d, id) || {}).tropDehors)) a.push({ sorte: 'dehors', texte: 'Plus de 2 pièces dehors (séance 2)' });
    const essais = M().essaisMesure || 2;
    if (MESURES().some(({ id }) => {
      const v = mesure(d, id);
      return v && v.verdict === 'dehors' && v.essais.length >= essais;
    }))
      a.push({ sorte: 'mesure', texte: 'Mesure hors de la plage : à revoir au réglet' });
    return a;
  }

  // Onglet « Pièces et réponses ».
  async function ongletPieces(d, photo) {
    const p = pieces(d);
    const q = S.etapes.seances.find((s) => s.id === 's3').etapes.find((e) => e.type === 'questions');
    const rep = (S.valeurEtape(d, 's3', 'questions') || {}).reponses || {};
    const cartes = await Promise.all(
      p.map(async (x) => {
        const u = x.photo ? await photo(x.photo) : null;
        return `<figure class="pp-piece">${u ? `<img src="${u}" alt="">` : '<span class="pp-sans">pas de photo</span>'}<figcaption><b>${x.numero}</b> ${ech(x.nom || 'sans nom')}${x.autreNom ? ' <small>(écrit par l’élève)</small>' : ''}</figcaption></figure>`;
      })
    );
    return `<section class="pp-bloc"><h3>Séance 1 · tableau des pièces (${p.length})</h3>
        ${p.length ? `<div class="pp-pieces">${cartes.join('')}</div>` : '<p class="pp-vide">Aucune pièce pour l’instant.</p>'}</section>
      <section class="pp-bloc"><h3>Séance 3 · réponses écrites</h3>
        ${(q ? q.questions : [])
          .map((x) => `<div class="pp-reponse"><p class="pp-question">${ech(x.texte)}</p><p>${rep[x.id] && rep[x.id].valeur ? ech(rep[x.id].valeur) : '<span class="pp-vide">pas encore de réponse</span>'}</p></div>`)
          .join('')}
      </section>`;
  }

  // Onglet « Séance 2 » : pour repérer ceux qui ne savent pas encore lire un réglet.
  function ongletMesures(d) {
    const lignesHtml = MESURES()
      .map(({ id, info }) => {
        const v = mesure(d, id);
        const pl = plage(info);
        return `<tr><th scope="row">${ech(info.titre)}</th><td>${v && v.essais.length ? v.essais.map(cm).join(' puis ') : '—'}</td><td>${v ? v.essais.length : 0}</td>
          <td>${v && v.verdict ? VERDICT[v.verdict] || '' : '—'}</td><td>${pl ? `${cm(pl[0])} à ${cm(pl[1])}` : 'à renseigner (modele.js)'}</td><td>${v && v.tropDehors ? '⚠ a sorti plus de 2 pièces' : ''}</td></tr>`;
      })
      .join('');
    return `<section class="pp-bloc"><h3>Séance 2 · longueurs saisies</h3>
      <table class="pp-table"><thead><tr><th>Pièce</th><th>Longueurs saisies</th><th>Essais</th><th>Vérification</th><th>Plage de référence</th><th>Remarque</th></tr></thead><tbody>${lignesHtml}</tbody></table></section>`;
  }

  S.profProjet = {
    lignes,
    alertes,
    onglets: [
      { id: 'pieces', titre: 'Pièces et réponses', html: ongletPieces },
      { id: 'seance2', titre: 'Séance 2', html: (d) => ongletMesures(d) },
    ],
    // Drapeaux de différenciation (préparation enseignant §8) : notes du professeur, visibles sur la tuile.
    drapeaux: [
      { id: 'tournevis-large', texte: 'Tournevis à manche large' },
      { id: 'roles', texte: 'Rôles observateur / manipulateur' },
      { id: 'pieces-reduites', texte: 'Réduire à 4-5 pièces' },
      { id: 'tuteur', texte: 'Élève rapide : explique à un autre binôme' },
    ],
  };
})(window);
