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

// Repères automatiques à côté de chaque critère d'évaluation (cahier des charges §7.3) : des observations,
// jamais un niveau. Le professeur décide.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const fait = (d, s, e) => S.etapeFaite(d, s, e);
  const coche = (b) => (b ? '✓' : '○');

  function repere(id, d) {
    const pieces = ((S.valeurEtape(d, 's1', 'pieces') || {}).pieces || []);
    const mesures = ['mesure-corps', 'mesure-manivelle'].map((e) => ({ e, v: S.valeurEtape(d, 's2', e) }));
    const aides = (s) => d.aides.filter((a) => !s || a.seance === s).length;
    switch (id) {
      case 'procedure':
        return `${pieces.length} pièce${pieces.length > 1 ? 's' : ''} démontée${pieces.length > 1 ? 's' : ''} une à une, ${pieces.filter((p) => p.photo).length} photographiée${pieces.filter((p) => p.photo).length > 1 ? 's' : ''} · rangement séance 1 ${coche(fait(d, 's1', 'rangement'))}`;
      case 'securite':
        return `Règles comprises : ${['s1', 's2', 's3'].map((s, i) => `S${i + 1} ${coche(['regle-force', 'regle-vis', 'regle-lames'].every((r) => fait(d, s, r)))}`).join(' ')} · demandes d’aide : ${aides()}${mesures.some((m) => m.v && m.v.tropDehors) ? ' · a sorti plus de 2 pièces en séance 2' : ''}`;
      case 'mesure':
        return mesures
          .map(({ e, v }) => `${e === 'mesure-corps' ? 'corps' : 'manivelle'} : ${v && v.longueur !== null && v.longueur !== undefined ? `${S.ecrireNombre(v.longueur)} cm (${v.essais.length} essai${v.essais.length > 1 ? 's' : ''}${v.verdict === 'dedans' ? ', dans la plage' : v.verdict === 'dehors' ? ', hors de la plage' : ''})` : '—'}`)
          .join(' · ');
      case 'dessin': {
        const n = mesures.filter((m) => m.v && m.v.photo).length;
        return `Photos du dessin : ${n} sur 2 (onglet Album)`;
      }
      case 'remontage': {
        const v = S.valeurEtape(d, 's3', 'verification') || [];
        return `Manivelle tourne ${coche(v[0])} · boîte vide ${coche(v[1])} · fonctionne ${coche(v[2])} · photo du taille-crayon remonté ${coche(fait(d, 's3', 'remonte'))}`;
      }
      case 'questions': {
        const r = (S.valeurEtape(d, 's3', 'questions') || {}).reponses || {};
        return `Réponses écrites : ${Object.values(r).filter((x) => x && x.valeur).length} sur 3 (onglet Pièces et réponses)`;
      }
      case 'autonomie':
        return `Demandes d’aide : ${aides()} (S1 ${aides('s1')} · S2 ${aides('s2')} · S3 ${aides('s3')})`;
      default:
        return '';
    }
  }

  S.profProjet.repere = repere;
})(window);
