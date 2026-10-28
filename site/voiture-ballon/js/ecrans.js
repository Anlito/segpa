// Écrans propres à la voiture à ballon (plan : docs/PLAN-voiture-ballon.md) :
//   nom-voiture : cartes de noms amusants, ou « J'écris un nom » ;
//   couleur     : la couleur d'équipe (toujours avec son nom), aperçu de la voiture ;
//   materiel    : « J'ai pris … » pour chaque pièce du kit, avec de gros boutons − et +.
// Les essais (séance 4) et la course (séance 5) viendront aux jalons suivants.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.donneesProjet || {};

  function brouillon(O, etape, defaut) {
    const v = S.valeurEtape(O.D(), O.seance().id, etape.id);
    return v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : defaut;
  }
  function garder(O, etape, valeur, geste) {
    S.noterBrouillon(O.D(), O.seance().id, etape.id, valeur);
    O.enregistrer(geste !== false);
  }

  // Le nom et la couleur choisis en séance 1 (pour les autres écrans, l'outil professeur et la course).
  S.voitureDe = (d) => {
    const n = S.valeurEtape(d, 's1', 'nom');
    const c = S.valeurEtape(d, 's1', 'couleur');
    return { nom: (n && n.nom) || '', couleur: (c && c.hex) || '', nomCouleur: (c && c.nom) || '' };
  };

  // ---------- Le nom de la voiture ----------

  S.ajouterEcran('nom-voiture', (etape, O) => {
    const sous = O.sous();
    const valeur = brouillon(O, etape, { nom: '', ecrit: false });
    const titre = `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.5rem">${O.ech(etape.texte)}</p>${O.boutonVoix(etape.texte)}</div>`;
    if (sous.ecrire)
      return {
        milieu: `<div class="colonne" style="gap:2rem;max-width:56rem">${titre}<input class="champ-libre" maxlength="24" autocomplete="off" aria-label="Nom de la voiture" value="${O.ech(valeur.ecrit ? valeur.nom : '')}"></div>`,
        gauche: O.boutonRetour('retour-nom'),
        principal: O.boutonPrincipal('nom-ecrit', 'C’est notre nom', 'coche', !(valeur.ecrit && valeur.nom)),
        actions: {
          'retour-nom': () => {
            sous.ecrire = false;
            O.rafraichir();
          },
          'nom-ecrit': () => O.suivant({ nom: S.majuscule(O.racine.querySelector('.champ-libre').value), ecrit: true }),
        },
        apres: () => {
          const c = O.racine.querySelector('.champ-libre');
          c.focus();
          c.addEventListener('input', () => (O.racine.querySelector('[data-action="nom-ecrit"]').disabled = !c.value.trim()));
          c.addEventListener('keydown', (e) => e.key === 'Enter' && c.value.trim() && O.etat.actions['nom-ecrit']());
        },
      };
    return {
      milieu: `<div class="colonne" style="gap:1.25rem;align-self:stretch;justify-content:center">${titre}
          <div class="cartes-noms">${(P().noms || [])
            .map((n, i) => `<button type="button" class="carte-nom" data-action="choisir-nom" data-i="${i}" aria-pressed="${!valeur.ecrit && valeur.nom === n}">${S.picto('voiture')}<span>${O.ech(n)}</span></button>`)
            .join('')}<button type="button" class="carte-nom autre" data-action="ecrire-nom" aria-pressed="${!!valeur.ecrit}">${S.picto('crayon')}<span>${valeur.ecrit && valeur.nom ? O.ech(valeur.nom) : 'J’écris un nom'}</span></button></div>
        </div>`,
      principal: O.boutonPrincipal('nom-choisi', 'C’est notre nom', 'coche', !valeur.nom),
      actions: {
        'choisir-nom': (b) => {
          garder(O, etape, { nom: P().noms[Number(b.dataset.i)], ecrit: false });
          O.rafraichir();
        },
        'ecrire-nom': () => {
          sous.ecrire = true;
          O.rafraichir();
        },
        'nom-choisi': () => O.suivant(valeur),
      },
    };
  });

  // ---------- La couleur d'équipe ----------

  S.ajouterEcran('couleur', (etape, O) => {
    const valeur = brouillon(O, etape, { nom: '', hex: '' });
    const voiture = S.voitureDe(O.D());
    return {
      milieu: `<div class="colonne" style="gap:1.75rem;align-items:center">
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.5rem">${O.ech(etape.texte)}</p>${O.boutonVoix(etape.texte)}</div>
          <div class="pastilles">${(P().couleurs || [])
            .map((c, i) => `<button type="button" class="pastille-couleur" data-action="choisir-couleur" data-i="${i}" aria-pressed="${valeur.nom === c.nom}"><span class="rond-couleur" style="background:${O.ech(c.hex)}">${valeur.nom === c.nom ? S.picto('coche') : ''}</span>${O.ech(c.nom)}</button>`)
            .join('')}</div>
          ${valeur.hex ? `<div class="apercu-voiture" style="color:${O.ech(valeur.hex)}">${S.picto('voiture')}<strong>${O.ech(voiture.nom || 'Ma voiture')}</strong><span>${O.ech(valeur.nom)}</span></div>` : ''}
        </div>`,
      principal: O.boutonPrincipal('couleur-choisie', 'C’est notre couleur', 'coche', !valeur.hex),
      actions: {
        'choisir-couleur': (b) => {
          const c = P().couleurs[Number(b.dataset.i)];
          garder(O, etape, { nom: c.nom, hex: c.hex });
          O.rafraichir();
        },
        'couleur-choisie': () => O.suivant(valeur),
      },
    };
  });

  // ---------- Mon matériel : « J'ai pris … » ----------

  S.ajouterEcran('materiel', (etape, O) => {
    const kit = P().materiel || [];
    const valeur = brouillon(O, etape, { pris: {} });
    const n = (id) => valeur.pris[id] || 0;
    const ligne = (m) => `<div class="ligne-materiel" data-id="${O.ech(m.id)}">
        <span class="tuile">${S.picto(m.picto)}</span><span class="nom-materiel">${O.ech(m.nom)}</span>
        <button type="button" class="compteur" data-action="moins" data-id="${O.ech(m.id)}" aria-label="Un ${O.ech(m.nom)} de moins"${n(m.id) ? '' : ' disabled'}>−</button>
        <output class="nombre" aria-live="polite">${n(m.id)}</output>
        <button type="button" class="compteur" data-action="plus" data-id="${O.ech(m.id)}" aria-label="Un ${O.ech(m.nom)} de plus">+</button>
      </div>`;
    const changer = (id, delta) => {
      valeur.pris[id] = Math.max(0, Math.min(20, n(id) + delta));
      garder(O, etape, valeur, false);
      const l = O.racine.querySelector(`.ligne-materiel[data-id="${id}"]`);
      l.querySelector('.nombre').textContent = String(valeur.pris[id]);
      l.querySelector('[data-action="moins"]').disabled = !valeur.pris[id];
      O.racine.querySelector('[data-action="compte"]').disabled = !kit.some((m) => n(m.id));
    };
    return {
      milieu: `<div class="colonne" style="gap:1rem;max-width:64rem">
          <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.5rem">J’ai pris…</p>${O.boutonVoix('Je compte mon matériel. J’ai pris : ' + kit.map((m) => m.nom).join(', ') + '.')}</div>
          <div class="liste-materiel${kit.length > 4 ? ' deux' : ''}">${kit.map(ligne).join('')}</div>
        </div>`,
      principal: O.boutonPrincipal('compte', 'C’est compté', 'coche', !kit.some((m) => n(m.id))),
      actions: {
        plus: (b) => changer(b.dataset.id, 1),
        moins: (b) => changer(b.dataset.id, -1),
        compte: () => O.suivant(valeur),
      },
    };
  });
})(window);
