// Outil professeur : lecture des sauvegardes d'une classe, résumé de chaque équipe, alertes.
// Rien n'est envoyé ni stocké ailleurs : tout est calculé dans le navigateur du professeur.
// Ce que le professeur écrit lui-même (aides vues, drapeaux de différenciation) va dans « professeur.json »,
// dans le dossier du projet, jamais dans le fichier d'une équipe (les élèves l'écrivent au même moment).
(function (global) {
  'use strict';

  const enNode = typeof module === 'object' && module.exports;
  const S = enNode ? require('./etapes.js') : global.Segpa;

  const MINUTES_INACTIF = 10; // « Rien depuis 12 min » (seulement pendant l'heure qui suit la dernière activité)

  // fichiers : [{ nom, texte, dossier? }] → { equipes: [{ cle, nom, donnees, dossier, autres }], invalides: [{ nom, raison }] }
  // Une équipe qui a plusieurs fichiers : le plus récent est gardé, les autres sont signalés.
  function fusionner(fichiers, projet) {
    const parCle = new Map();
    const invalides = [];
    for (const f of fichiers) {
      const r = S.lireSauvegarde(f.texte, projet);
      if (!r.ok) {
        invalides.push({ nom: f.nom, raison: r.raison });
        continue;
      }
      const d = r.donnees;
      const cle = (d.equipe.classe || '') + '|' + S.simplifierNom(S.nomEquipe(d.equipe.eleves));
      const deja = parCle.get(cle);
      if (!deja) parCle.set(cle, { cle, nom: S.nomEquipe(d.equipe.eleves), donnees: d, dossier: f.dossier || null, fichier: f.nom, autres: [] });
      else if (String(d.modifieLe) > String(deja.donnees.modifieLe)) {
        deja.autres.push(deja.fichier);
        Object.assign(deja, { donnees: d, dossier: f.dossier || deja.dossier, fichier: f.nom });
      } else deja.autres.push(f.nom);
    }
    return { equipes: [...parCle.values()], invalides };
  }

  const minutesDepuis = (date, maintenant) => (date ? Math.floor((maintenant - new Date(date).getTime()) / 60000) : null);

  // Résumé d'une équipe pour sa tuile. seances : définition des séances du projet.
  function resumer(d, seances, maintenant) {
    const t = maintenant || Date.now();
    const etats = seances.map((s) => ({ id: s.id, titre: s.titre, etat: S.etatSeance(d, s), avancement: S.avancement(d, s) }));
    const courante = S.seanceCourante(d, seances);
    const aide = S.aideEnCours(d);
    const photos = d.photos || [];
    return {
      noms: d.equipe.eleves.join(' · '),
      classe: d.equipe.classe,
      seances: etats,
      courante: courante && courante.id,
      derniere: d.modifieLe,
      minutes: minutesDepuis(d.modifieLe, t),
      aide,
      minutesAide: aide ? minutesDepuis(aide.date, t) : null,
      nbAides: d.aides.length,
      nbPhotos: photos.length,
      dernierePhoto: photos.length ? photos[photos.length - 1] : null,
      passees: seances.flatMap((s) => s.etapes.filter((e) => (S.etatEtape(d, s.id, e.id) || {}).passe).map((e) => ({ seance: s.id, etape: e.id }))),
    };
  }

  // Alertes d'une équipe : [{ sorte, texte }]. aideVue : date de la dernière aide que le professeur a marquée « vue ».
  // alertesProjet : alertes propres au projet (ex. « Plus de 2 pièces dehors »).
  function alertes(r, aideVue, alertesProjet) {
    const liste = [];
    if (r.aide && (!aideVue || aideVue < r.aide.date))
      liste.push({ sorte: 'aide', texte: `Aide demandée${r.minutesAide !== null ? ` · ${r.minutesAide < 1 ? 'à l’instant' : `depuis ${r.minutesAide} min`}` : ''}` });
    if (r.minutes !== null && r.minutes >= MINUTES_INACTIF && r.minutes < 60 && !r.seances.every((s) => s.etat === 'fait'))
      liste.push({ sorte: 'inactif', texte: `Rien depuis ${r.minutes} min` });
    if (r.passees.length) liste.push({ sorte: 'passee', texte: `${r.passees.length} photo${r.passees.length > 1 ? 's' : ''} laissée${r.passees.length > 1 ? 's' : ''} pour plus tard` });
    return liste.concat(alertesProjet || []);
  }

  // Ordre des tuiles : aide demandée d'abord (la plus ancienne en premier), puis autres alertes, puis par prénoms.
  function trier(liste) {
    const rang = (x) => (x.alertes.some((a) => a.sorte === 'aide') ? 0 : x.alertes.length ? 1 : 2);
    return liste.slice().sort((a, b) => rang(a) - rang(b) || String(a.resume.aide && a.resume.aide.date).localeCompare(String(b.resume.aide && b.resume.aide.date)) || a.resume.noms.localeCompare(b.resume.noms, 'fr'));
  }

  const nomEtape = (e) => e.titre || e.texte || e.type;

  // Historique d'une équipe : étapes faites, demandes d'aide, photos, du plus récent au plus ancien.
  function historique(d, seances) {
    const lignes = [];
    for (const s of seances)
      for (const e of s.etapes) {
        const x = S.etatEtape(d, s.id, e.id);
        if (x && x.fait) lignes.push({ date: x.fait, seance: s.id, texte: `${s.titre} · ${nomEtape(e)}` });
        if (x && x.passe) lignes.push({ date: x.passe, seance: s.id, texte: `${s.titre} · ${nomEtape(e)} (laissée pour plus tard)` });
      }
    for (const a of d.aides) {
      lignes.push({ date: a.date, seance: a.seance, texte: 'Aide demandée', sorte: 'aide' });
      if (a.resolue) lignes.push({ date: a.resolue, seance: a.seance, texte: 'Aide terminée (l’élève a touché « Aide demandée »)', sorte: 'aide' });
    }
    return lignes.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  // ---------- professeur.json (dans le dossier du projet) ----------

  function professeurVide(projet) {
    return { application: S.APPLICATION, projet, type: 'professeur', formatVersion: 1, aidesVues: {}, drapeaux: {}, modifieLe: null };
  }

  function lireProfesseur(texte, projet) {
    try {
      const p = JSON.parse(texte);
      if (!p || p.application !== S.APPLICATION || p.type !== 'professeur' || p.projet !== projet) return professeurVide(projet);
      return Object.assign(professeurVide(projet), p, { aidesVues: p.aidesVues || {}, drapeaux: p.drapeaux || {} });
    } catch {
      return professeurVide(projet);
    }
  }

  Object.assign(S, { MINUTES_INACTIF, nomEtape, fusionner, resumer, alertes, trier, historique, professeurVide, lireProfesseur });
  if (enNode) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
