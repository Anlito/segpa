// Petits outils communs à tous les projets SEGPA (navigateur et Node pour les tests).
// Les données des projets s'écrivent dans des fichiers « donnees/*.js » qui appellent definirXxx({...}) :
// c'est ce qui permet au site de marcher en file:// (pas de lecture de fichier JSON au chargement).
(function (global) {
  'use strict';

  const S = (global.Segpa = global.Segpa || {});

  // « Léa » et « lea », « Inès » et « ines » désignent le même élève.
  function simplifierNom(texte) {
    return String(texte || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  // Nom de fichier et de dossier d'une équipe : « Léa_Tom » (accents gardés, caractères interdits retirés).
  function nomEquipe(eleves) {
    return (eleves || [])
      .map((p) => String(p).trim().replace(/[\\/:*?"<>|_\s]+/g, '-'))
      .filter(Boolean)
      .join('_');
  }

  // « léa » → « Léa » (saisie au clavier).
  function majuscule(prenom) {
    const t = String(prenom || '').trim().replace(/\s+/g, ' ');
    return t ? t.charAt(0).toLocaleUpperCase('fr-FR') + t.slice(1) : '';
  }

  // Chemin affiché à l'élève : ['Bureau', 'Classe', '{classe}', …] avec la classe remplie.
  function remplirChemin(chemin, classe, equipe) {
    return (chemin || []).map((d) => d.replace('{classe}', classe || '…').replace('{equipe}', equipe || 'Prénom_Prénom'));
  }

  function echapper(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  const maintenant = () => new Date().toISOString();

  // Les fichiers de données du projet appellent ces fonctions.
  S.projet = null;
  S.etapes = null;
  S.reglages = null;
  S.college = null;
  S.modele = null;
  S.criteres = null;
  S.donneesProjet = {};
  global.definirProjet = (p) => (S.projet = p);
  global.definirEtapes = (e) => (S.etapes = e);
  global.definirReglagesAtelier = (r) => (S.reglages = r);
  global.definirCollege = (c) => (S.college = c);
  global.definirModele = (m) => (S.modele = m);
  global.definirCriteres = (c) => (S.criteres = c);
  // Données propres à un projet (kit, noms, couleurs…) : plusieurs fichiers peuvent en ajouter.
  global.definirDonneesProjet = (d) => Object.assign(S.donneesProjet, d);

  Object.assign(S, { simplifierNom, nomEquipe, majuscule, remplirChemin, echapper, maintenant });

  if (typeof module === 'object' && module.exports) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
