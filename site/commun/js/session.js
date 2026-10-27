// Session de l'équipe : la sauvegarde en mémoire, réécrite toute seule dans le dossier de l'équipe.
// Copie de secours dans le navigateur à chaque changement. Le droit d'écrire est demandé au premier vrai geste
// de l'élève (jamais à l'ouverture de la page). En mode enseignant (« lecture »), rien n'est enregistré :
// les photos restent en mémoire le temps de la page.
(function (global) {
  'use strict';

  const S = global.Segpa;

  // options : { donnees, dossier (dossier de l'équipe), handle (fichier .json), lecture }
  function creerSession(options) {
    const s = {
      donnees: options.donnees,
      dossier: options.dossier || null,
      handle: options.handle || null,
      lecture: !!options.lecture,
      nonEnregistre: false,
      attenteAutorisation: false,
      erreur: false,
      dernierEnregistrement: null,
    };
    const abonnes = [];
    const photosMemoire = new Map(); // mode enseignant : fichier → Blob
    const urls = new Map(); // fichier → adresse blob: affichable
    let minuteur = null;
    let enCours = null;

    const prevenir = () => abonnes.forEach((f) => f(s));

    // Un changement a eu lieu. geste : l'élève vient de toucher un bouton (on peut demander le droit d'écrire).
    function aEnregistrer(geste) {
      if (s.lecture) return;
      S.fichiers.sauverSecours(s.donnees);
      s.nonEnregistre = true;
      prevenir();
      if (!s.dossier) return;
      clearTimeout(minuteur);
      if (geste) enregistrer(true);
      else minuteur = setTimeout(() => enregistrer(false), 4000);
    }

    async function enregistrer(geste) {
      if (s.lecture || !s.dossier) return false;
      if (enCours) return enCours;
      enCours = (async () => {
        try {
          if (!(await S.fichiers.autorise(s.dossier, !!geste))) {
            s.attenteAutorisation = true;
            return false;
          }
          s.handle = await S.fichiers.ecrireJson(s.dossier, s.donnees, s.handle);
          s.nonEnregistre = false;
          s.attenteAutorisation = false;
          s.erreur = false;
          s.dernierEnregistrement = new Date();
          return true;
        } catch (e) {
          s.erreur = true;
          s.derniereErreur = e && `${e.name} : ${e.message}`; // pour le professeur (console) et la recette
          return false;
        } finally {
          enCours = null;
          prevenir();
        }
      })();
      return enCours;
    }

    // Texte court pour l'élève, à côté du nom de l'équipe.
    function etatTexte() {
      if (s.lecture) return 'Mode enseignant : rien n’est enregistré';
      if (!s.dossier) return 'Pas de dossier : travail gardé sur ce poste';
      if (s.erreur) return 'Enregistrement impossible : touche Aide';
      if (s.nonEnregistre) return 'Enregistrement…';
      return 'Enregistré dans votre dossier';
    }

    // Photo prise : écrite dans « photos/ » du dossier de l'équipe, puis notée dans la sauvegarde.
    async function ajouterPhoto(blob, seance, etape, legende) {
      if (s.lecture || !s.dossier) {
        const fichier = S.nomPhoto(s.donnees, seance, etape);
        photosMemoire.set(fichier, blob);
        const p = S.ajouterPhoto(s.donnees, { fichier, seance, etape, legende });
        aEnregistrer(true);
        return p;
      }
      if (!(await S.fichiers.autorise(s.dossier, true))) throw new Error('permission');
      const fichier = await S.fichiers.ecrirePhoto(s.dossier, (pris) => S.nomPhoto(s.donnees, seance, etape, pris), blob);
      const p = S.ajouterPhoto(s.donnees, { fichier, seance, etape, legende });
      urls.set(fichier, URL.createObjectURL(blob));
      aEnregistrer(true);
      return p;
    }

    // Adresse affichable d'une photo (ou null si le fichier n'est plus dans le dossier).
    async function urlPhoto(fichier) {
      if (urls.has(fichier)) return urls.get(fichier);
      let blob = photosMemoire.get(fichier) || null;
      if (!blob && s.dossier) blob = await S.fichiers.lirePhoto(s.dossier, fichier);
      if (!blob) return null;
      const u = URL.createObjectURL(blob);
      urls.set(fichier, u);
      return u;
    }

    addEventListener('beforeunload', (e) => {
      if (s.lecture) return;
      S.fichiers.sauverSecours(s.donnees);
      if (s.nonEnregistre && s.dossier) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    Object.assign(s, {
      aEnregistrer,
      enregistrer,
      etatTexte,
      ajouterPhoto,
      urlPhoto,
      ecouter: (f) => abonnes.push(f),
    });
    return s;
  }

  S.creerSession = creerSession;
})(window);
