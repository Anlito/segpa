// Outil professeur : ce qui est propre à la voiture à ballon (plan §4).
//   tuile   : nom et couleur de la voiture, matériel pris, essais (nombre, meilleure distance, changements), course ;
//   alertes : matériel pris différent du kit, voiture qui n'avance pas (2 essais à 0 cm) ;
//   bandeau : longueur de piste proposée d'après les essais de la séance 4, lien vers la course ;
//   onglets : « Essais » (tableau et graphique) · « Voiture et course » (matériel, carrosserie, résultat, réponse écrite).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};
  const ech = S.echapper;
  const cm = (n) => (typeof n === 'number' ? `${S.ecrireNombre(n)} cm` : '—');

  const voiture = (d) => {
    const n = S.valeurEtape(d, 's1', 'nom');
    const c = S.valeurEtape(d, 's1', 'couleur');
    return { nom: (n && n.nom) || '', couleur: (c && c.hex) || '', nomCouleur: (c && c.nom) || '' };
  };
  const essais = (d) => S.valeurEtape(d, 's4', 'essais') || null;
  const resultat = (d) => (S.valeurEtape(d, 's5', 'resultat') || {}).resultat || null;

  // Matériel : [{ nom, pris, prevu }] et les écarts avec le kit.
  function materiel(d) {
    const v = S.valeurEtape(d, 's1', 'materiel');
    if (!v || !v.pris) return null;
    const lignes = (P().materiel || []).map((m) => ({ nom: m.nom, pris: v.pris[m.id] || 0, prevu: m.prevu }));
    return { lignes, ecarts: lignes.filter((l) => l.pris !== l.prevu) };
  }

  function nomChangement(c) {
    if (!c) return 'Départ';
    if (c.type === 'roues') return `Roues ${c.cote === 'arriere' ? 'arrière' : 'avant'} ${c.choix} mm`;
    const def = (P().changements || []).find((x) => x.id === c.type);
    const choix = def && Array.isArray(def.choix) ? def.choix.find((x) => x.id === c.choix) : null;
    return choix ? choix.nom : c.type;
  }
  const nomDirection = (id) => ((P().directions || []).find((x) => x.id === id) || { nom: id || '—' }).nom;

  function lignes(d) {
    const l = [];
    const v = voiture(d);
    if (v.nom) l.push(`${v.nom}${v.nomCouleur ? ' · ' + v.nomCouleur : ''}`);
    const m = materiel(d);
    if (m) l.push(m.ecarts.length ? `Matériel : ${m.ecarts.map((x) => `${x.nom} ${x.pris}/${x.prevu}`).join(', ')}` : 'Matériel : kit complet ✓');
    const e = essais(d);
    if (e) {
      const r = S.resumeEssais(e);
      if (r.nombre) l.push(`Essais : ${r.nombre} · meilleur ${cm(r.meilleure)} · ${r.changements.length} changement${r.changements.length > 1 ? 's' : ''}`);
    }
    const c = resultat(d);
    if (c) l.push(`Course : ${c.arrivee ? S.ordinal(c.rang) : cm(c.distance)} · ${c.course}`);
    else if (S.etapeFaite(d, 's5', 'prete')) l.push('Prête pour la course ✓');
    return l;
  }

  function alertes(d) {
    const a = [];
    const m = materiel(d);
    if (m && m.ecarts.length) a.push({ sorte: 'materiel', texte: 'Matériel pris différent du kit' });
    const e = essais(d);
    if (e && S.essaisFaits(e).filter((x) => x.distance === 0).length >= 2) a.push({ sorte: 'essais', texte: 'Voiture qui n’avance pas : à vérifier' });
    return a;
  }

  // Bandeau de la classe : longueur de piste proposée (le professeur la garde ou la change sur la piste).
  function bandeauClasse(equipes) {
    const meilleures = equipes.map((eq) => (essais(eq.donnees) ? S.resumeEssais(essais(eq.donnees)).meilleure : null));
    const lp = S.longueurPiste(meilleures);
    return `<div class="pc-exports pc-piste"><span>Piste :</span>${
      lp
        ? `<span>longueur proposée <b>${S.ecrireNombre(lp.longueur / 100)} m</b> (${lp.depassent} voiture${lp.depassent > 1 ? 's' : ''} sur ${lp.sur} l’ont dépassée à leur meilleur essai)</span>`
        : '<span>longueur proposée après les essais de la séance 4 (2 équipes mesurées au moins)</span>'
    }<a class="pb-btn" href="course.html" target="_blank" rel="noopener">La course (vidéoprojecteur)</a></div>`;
  }

  // Onglet « Essais » : tableau et graphique de la séance 4.
  function ongletEssais(d) {
    const e = essais(d);
    if (!e) return '<section class="pp-bloc"><h3>Séance 4 · essais</h3><p class="pp-vide">Pas encore d’essai.</p></section>';
    const faits = S.essaisFaits(e);
    const r = S.resumeEssais(e);
    const plus = Math.max(1, ...faits.map((x) => x.distance));
    const best = S.meilleurEssai(e);
    const rouesDepart = S.rouesDe(e, -1);
    const lignesHtml = faits
      .map((x, i) => {
        const rr = S.rouesDe(e, i);
        return `<tr${i === best ? ' class="pp-meilleur"' : ''}><th scope="row">Essai ${i + 1}</th><td>${ech(nomChangement(x.changement))}</td><td>${ech(rr.avant)} / ${ech(rr.arriere)} mm</td><td>${x.pompe}</td><td>${cm(x.distance)}${i === best ? ' (le plus loin)' : ''}</td><td>${ech(nomDirection(x.direction))}</td></tr>`;
      })
      .join('');
    return `<section class="pp-bloc"><h3>Séance 4 · essais (${r.nombre})</h3>
        <p>Roues au départ : avant ${ech(rouesDepart.avant || '—')} mm, arrière ${ech(rouesDepart.arriere || '—')} mm · un seul changement à la fois (imposé par l’écran) · ${r.fini ? 'graphique vu ✓' : 'essais en cours'}</p>
        <table class="pp-table"><thead><tr><th>Essai</th><th>Changement</th><th>Roues av. / arr.</th><th>Coups de pompe</th><th>Distance</th><th>Direction</th></tr></thead><tbody>${lignesHtml || '<tr><td colspan="6">Aucun essai fini.</td></tr>'}</tbody></table>
        <div class="pp-barres" role="img" aria-label="Distances des essais">${faits
          .map((x, i) => `<div class="pp-barre"><span>${cm(x.distance)}</span><i style="height:${Math.max(3, (x.distance / plus) * 100)}%${i === best ? ';background:repeating-linear-gradient(45deg,var(--accent) 0 6px,var(--accent-fonce) 6px 12px)' : ''}"></i><b>Essai ${i + 1}</b></div>`)
          .join('')}</div>
      </section>`;
  }

  // Onglet « Voiture et course ».
  function ongletVoiture(d) {
    const v = voiture(d);
    const m = materiel(d);
    const verif = S.valeurEtape(d, 's3', 'verification') || [];
    const lignesVerif = ((S.etapes.seances.find((s) => s.id === 's3').etapes.find((e) => e.id === 'verification') || {}).lignes || []).map((l, i) => `${verif[i] ? '✓' : '○'} ${ech(l.texte)}`);
    const c = resultat(d);
    const m2 = c ? S.messageResultat(c) : null;
    const pourquoi = (S.valeurEtape(d, 's5', 'pourquoi') || {}).texte;
    return `<section class="pp-bloc"><h3>La voiture</h3>
        <p>${v.couleur ? `<span class="pp-pastille" style="background:${ech(v.couleur)}"></span>` : ''}<b>${ech(v.nom || 'sans nom')}</b>${v.nomCouleur ? ' · ' + ech(v.nomCouleur) : ''}</p>
        ${m ? `<table class="pp-table"><thead><tr><th>Matériel (séance 1)</th><th>Pris</th><th>Kit</th></tr></thead><tbody>${m.lignes.map((l) => `<tr><th scope="row">${ech(l.nom)}</th><td>${l.pris}</td><td>${l.prevu}${l.pris !== l.prevu ? ' ~' : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="pp-vide">Matériel pas encore compté.</p>'}
      </section>
      <section class="pp-bloc"><h3>Séance 3 · carrosserie</h3><p>${lignesVerif.join(' · ') || '<span class="pp-vide">pas encore vérifiée</span>'}</p></section>
      <section class="pp-bloc"><h3>Séance 5 · course</h3><p>${c ? `${ech(m2.titre)} (${ech(c.course)}${c.temps ? ', ' + S.ecrireNombre(c.temps) + ' s' : ''})` : '<span class="pp-vide">pas encore de résultat</span>'}</p>
        <div class="pp-reponse"><p class="pp-question">Pourquoi ma voiture avance ?</p><p>${pourquoi ? ech(pourquoi) : '<span class="pp-vide">pas encore de réponse</span>'}</p></div>
      </section>`;
  }

  S.profProjet = {
    lignes,
    alertes,
    bandeauClasse,
    onglets: [
      { id: 'essais', titre: 'Essais', html: (d) => ongletEssais(d) },
      { id: 'voiture', titre: 'Voiture et course', html: (d) => ongletVoiture(d) },
    ],
    // Drapeaux de différenciation (proposition à valider) : notes du professeur, visibles sur la tuile.
    drapeaux: [
      { id: 'montage-guide', texte: 'Montage guidé avec l’adulte' },
      { id: 'gabarit-trace', texte: 'Gabarit déjà tracé sur le carton' },
      { id: 'roles', texte: 'Rôles : pilote / mesureur' },
      { id: 'tuteur', texte: 'Élève rapide : aide un autre binôme' },
    ],
  };

  // Repères automatiques à côté de chaque critère d'évaluation : des observations, jamais un niveau.
  const fait = (d, s, e) => S.etapeFaite(d, s, e);
  const coche = (b) => (b ? '✓' : '○');
  S.profProjet.repere = (id, d) => {
    const aides = (s) => d.aides.filter((a) => !s || a.seance === s).length;
    const seance = (sid) => S.etapes.seances.find((s) => s.id === sid);
    switch (id) {
      case 'fabrication': {
        const etapes = seance('s2').etapes.filter((e) => e.type === 'consigne');
        const n = etapes.filter((e) => fait(d, 's2', e.id)).length;
        return `Étapes de fabrication faites : ${n} sur ${etapes.length} · photos séance 2 : ${S.photosDe(d, 's2').length} · « Ma voiture ne roule pas » : voir l’historique`;
      }
      case 'regles': {
        const m = materiel(d);
        const ranges = ['s1', 's2', 's3', 's4'].map((s, i) => `S${i + 1} ${coche(fait(d, s, 'rangement'))}`).join(' ');
        return `Rangement : ${ranges} · matériel ${m ? (m.ecarts.length ? 'différent du kit' : 'conforme au kit') : 'pas compté'} · demandes d’aide : ${aides()}`;
      }
      case 'fonctionne': {
        const e = essais(d);
        const premier = e ? S.essaisFaits(e)[0] : null;
        return `Roule en séance 2 ${coche(fait(d, 's2', 'pousser'))} · roues libres avec la carrosserie ${coche(fait(d, 's3', 'essai-carrosserie'))} · photo officielle ${coche(fait(d, 's3', 'officielle'))} · premier essai : ${premier ? cm(premier.distance) : '—'}`;
      }
      case 'essais': {
        const e = essais(d);
        if (!e) return 'Pas encore d’essai';
        const r = S.resumeEssais(e);
        return `${r.nombre} essai${r.nombre > 1 ? 's' : ''} · changements : ${S.essaisFaits(e).filter((x) => x.changement).map((x) => nomChangement(x.changement)).join(', ') || 'aucun'} · ${r.fini ? 'graphique vu' : 'en cours'} (onglet Essais)`;
      }
      case 'mesure': {
        const e = essais(d);
        const dist = e ? S.essaisFaits(e).map((x) => cm(x.distance)) : [];
        return dist.length ? `Distances saisies (pavé en cm) : ${dist.join(' · ')}` : 'Pas encore de mesure';
      }
      case 'explique': {
        const t = (S.valeurEtape(d, 's5', 'pourquoi') || {}).texte;
        return t ? `Réponse écrite : « ${t.length > 90 ? t.slice(0, 90) + '…' : t} »` : 'Pas encore de réponse écrite';
      }
      case 'autonomie':
        return `Demandes d’aide : ${aides()} (${S.etapes.seances.map((s, i) => `S${i + 1} ${aides(s.id)}`).join(' · ')})`;
      default:
        return '';
    }
  };
})(window);
