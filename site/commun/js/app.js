// Les écrans élèves communs à tous les projets SEGPA (cahier des charges §3, maquette docs/MAQUETTE.md) :
// accueil · dossier du projet · prénoms · équipes · ma mission · une étape (règle, consigne, photo, cases, bilan) ·
// bravo · mon album. Partout : 🏠 en haut à gauche, 🔊 à côté de la consigne, Aide en bas à droite.
// Le contenu vient des données du projet (donnees/projet.js, donnees/etapes.js) : rien de propre à un projet ici.
// Mode enseignant (?enseignant=1) : tous les écrans, équipe fictive, rien n'est enregistré.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const F = () => S.fichiers;
  const ech = S.echapper;
  const pic = (nom, taille, classe) => S.picto(nom, taille, classe);
  const enseignant = /[?&]enseignant=1\b/.test(location.search);

  const racine = document.getElementById('app');
  const etat = {
    session: null,
    seance: null,
    index: 0,
    dossierProjet: null,
    debuts: {}, // début de chaque bloc minuté (le temps de la page)
    actions: {},
  };
  let minuteurAffichage = null;
  let nettoyage = null;

  const seances = () => S.etapes.seances;
  const typesConnus = () => Object.keys(TYPES);
  const etapes = () => S.etapesSeance(etat.seance, typesConnus());
  const D = () => etat.session.donnees;
  const prenoms = (d) => d.equipe.eleves.join(' · ');
  const lisible = (...textes) => textes.filter(Boolean).join(' ');

  // ---------- Affichage ----------

  function afficher(html, actions, apres) {
    S.camera.arreter();
    S.voix.taire();
    clearInterval(minuteurAffichage);
    if (nettoyage) nettoyage();
    nettoyage = null;
    etat.actions = actions || {};
    racine.innerHTML = html;
    if (apres) apres();
    majMinuteur();
    const premier = racine.querySelector('.btn-principal:not(:disabled), .choix');
    if (premier && !('ontouchstart' in global)) premier.focus({ preventScroll: true });
  }

  racine.addEventListener('click', (e) => {
    const lire = e.target.closest('[data-lire]');
    if (lire) return S.voix.lire(lire.dataset.lire);
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const f = etat.actions[b.dataset.action] || ACTIONS_COMMUNES[b.dataset.action];
    if (f) f(b, e);
  });

  let minuteurMessage = null;
  function message(texte, duree) {
    let m = document.querySelector('.message-bref');
    if (!m) {
      m = document.createElement('div');
      m.className = 'message-bref';
      m.setAttribute('role', 'status');
      document.body.appendChild(m);
    }
    m.textContent = texte;
    m.hidden = false;
    clearTimeout(minuteurMessage);
    minuteurMessage = setTimeout(() => (m.hidden = true), duree || 3000);
  }

  // ---------- Morceaux communs ----------

  const boutonVoix = (texte, classe) =>
    `<button type="button" class="btn btn-voix${classe ? ' ' + classe : ''}" data-lire="${ech(texte)}" aria-label="Lire à voix haute">${pic('voix')}</button>`;

  const boutonMaison = () => `<button type="button" class="btn btn-maison" data-action="mission">${pic('maison')}Ma mission</button>`;

  function boutonAide() {
    const demandee = etat.session && S.aideEnCours(D());
    return demandee
      ? `<button type="button" class="btn btn-aide demandee" data-action="aide" aria-pressed="true">${pic('aide')}Aide demandée</button>`
      : `<button type="button" class="btn btn-aide" data-action="aide" aria-pressed="false">${pic('aide')}Aide</button>`;
  }

  const etiquetteEquipe = () => (etat.session ? `<div class="equipe">${ech(prenoms(D()))}</div>` : '');

  function etatEnregistrement() {
    if (!etat.session) return '';
    const s = etat.session;
    const aFaire = s.lecture || !s.dossier || s.erreur || s.attenteAutorisation;
    return `<div class="etat-enregistrement${aFaire ? ' a-faire' : ''}" role="status">${pic(aFaire ? 'dossier' : 'dossier-ok')}<span>${ech(s.etatTexte())}</span></div>`;
  }

  function majEtatEnregistrement() {
    const el = racine.querySelector('.etat-enregistrement');
    if (el) el.outerHTML = etatEnregistrement();
  }

  function minuteurHtml(etape) {
    if (!etape || !etape.minuteur) return '';
    const cle = etat.seance.id + '/' + etape.id;
    if (!etat.debuts[cle]) etat.debuts[cle] = Date.now();
    return `<div class="minuteur" data-debut="${etat.debuts[cle]}" data-duree="${etape.minuteur}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="fond" cx="18" cy="18" r="15"/><circle class="reste" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="100 100"/></svg><span></span></div>`;
  }

  // Le cercle se vide pendant le bloc (sans sonnerie : c'est un repère, pas une alarme).
  function majMinuteur() {
    const m = racine.querySelector('.minuteur');
    if (!m) return;
    const maj = () => {
      const duree = Number(m.dataset.duree) * 60000;
      const reste = Math.max(0, duree - (Date.now() - Number(m.dataset.debut)));
      const minutes = Math.ceil(reste / 60000);
      m.querySelector('.reste').setAttribute('stroke-dasharray', `${(reste / duree) * 100} 100`);
      m.querySelector('span').textContent = String(minutes);
      m.setAttribute('aria-label', `Minuteur : ${minutes} minute${minutes > 1 ? 's' : ''}`);
    };
    maj();
    minuteurAffichage = setInterval(maj, 10000);
  }

  function bas(o) {
    return (
      '<div class="bas">' +
      (o.gauche || '') +
      (o.principal || '') +
      boutonAide() +
      '</div>'
    );
  }

  const boutonPrincipal = (action, texte, picto, desactive) =>
    `<button type="button" class="btn btn-principal" data-action="${action}"${desactive ? ' disabled' : ''}>${pic(picto || 'coche')}${ech(texte)}</button>`;

  const boutonRetour = (action) => `<button type="button" class="btn btn-second gauche" data-action="${action}">${pic('retour')}Retour</button>`;

  const ACTIONS_COMMUNES = {
    mission: () => ecranMission(),
    aide: () => {
      if (!etat.session) return message('Lève la main : le professeur arrive.');
      const d = D();
      if (S.aideEnCours(d)) {
        S.finirAide(d);
        message('Merci ! Tu continues.');
      } else {
        S.demanderAide(d, etat.seance && etat.seance.id, etat.seance && etapes()[etat.index] && etapes()[etat.index].id);
        S.voix.son('aide');
        message('Le professeur a ton message. Il arrive.');
      }
      etat.session.aEnregistrer(true);
      const b = racine.querySelector('.btn-aide');
      if (b) b.outerHTML = boutonAide();
    },
  };

  // ---------- 1. Accueil ----------

  function ecranAccueil() {
    const p = S.projet;
    afficher(
      `<div class="ecran">
        <div class="accueil-titre">
          <div class="logo-projet">${pic(p.picto)}</div>
          <div><div class="sur-titre">${ech(p.niveau)}</div><h1 class="grand-titre">${ech(p.titre)}</h1></div>
          ${boutonVoix(p.titre)}
        </div>
        <div class="milieu" style="gap:4rem">
          <button type="button" class="choix" data-action="commencer"><span class="rond plein">${pic('lecture')}</span>Je commence</button>
          <button type="button" class="choix" data-action="continuer"><span class="rond">${pic('continuer')}</span>Je continue</button>
        </div>
        ${bas({})}
      </div>`,
      {
        commencer: () => (enseignant ? ecranPrenoms(classeFictive()) : F().accesDossiers ? ecranDossier('commencer') : ecranPrenoms(null)),
        continuer: () => (enseignant ? ecranEquipes([]) : F().accesDossiers ? ecranDossier('continuer') : ouvrirSansDossier()),
      }
    );
  }

  const classeFictive = () => ({ classe: (S.reglages.classes || [''])[0], eleves: ['Adam', 'Chloé', 'Emma', 'Ilyes', 'Inès', 'Jade', 'Léa', 'Lina', 'Manon', 'Noah', 'Nolan', 'Rayan', 'Sami', 'Tom', 'Yanis', 'Zoé'] });

  // ---------- 2. Le dossier du projet ----------

  function cheminProjet() {
    const debut = (S.college && S.college.cheminClasse) || ['{classe}'];
    const classes = S.reglages.classes || [];
    return S.remplirChemin(debut, classes.length === 1 ? classes[0] : '…').concat(S.reglages.cheminProjet || []);
  }

  function ecranDossier(mode, avertissement) {
    const chemin = cheminProjet();
    const cible = chemin[chemin.length - 1];
    afficher(
      `<div class="ecran">
        <div class="haut">
          <button type="button" class="btn btn-second" data-action="accueil">${pic('retour')}Retour</button>
          <h1 class="titre-ecran">Ouvre le dossier ${ech(cible)}</h1>
          ${boutonVoix('Ouvre le dossier ' + cible + '.')}
        </div>
        <div class="milieu" style="flex-direction:column;gap:2.5rem">
          <div class="chemin">${chemin.map((d, i) => `<span class="${i === chemin.length - 1 ? 'cible' : ''}">${ech(d)}</span>`).join('<span class="sep">›</span>')}</div>
          <div class="picto-grand seul" style="width:15rem;height:15rem">${pic('dossier')}</div>
          ${avertissement ? `<div class="msg msg-ambre" role="alert">${pic('remonter')}${ech(avertissement)}</div>` : ''}
        </div>
        ${bas({ principal: boutonPrincipal('ouvrir', 'Ouvrir le dossier', 'dossier') })}
      </div>`,
      {
        accueil: () => ecranAccueil(),
        ouvrir: () => ouvrirDossierProjet(mode),
      }
    );
  }

  async function ouvrirDossierProjet(mode) {
    let dossier;
    try {
      dossier = await F().choisirDossier();
    } catch {
      return ecranDossier(mode, 'Le dossier ne s’ouvre pas. Touche Aide.');
    }
    if (!dossier) return;
    const sorte = await F().analyserDossier(dossier);
    const cible = cheminProjet().slice(-1)[0];
    if (sorte === 'equipe' && mode === 'continuer') return ouvrirEquipe(dossier);
    if (sorte === 'equipe') return ecranDossier(mode, `C’est le dossier d’une équipe. Ouvre le dossier ${cible}.`);
    if (sorte !== 'projet') return ecranDossier(mode, `Ce n’est pas le dossier ${cible}. Regarde le chemin, puis réessaie.`);
    etat.dossierProjet = dossier;
    F().memoriser('projet', dossier);
    if (mode === 'commencer') return ecranPrenoms(await F().lireClasse(dossier));
    ecranEquipes(await F().equipesDans(dossier));
  }

  // ---------- 3. Les prénoms ----------

  function ecranPrenoms(classe, choisis) {
    const pris = choisis || [];
    const avecBoutons = classe && classe.eleves.length;
    const cases = Math.max(2, pris.length);
    let milieu;
    if (avecBoutons) {
      const n = classe.eleves.length;
      milieu = `<div class="grille-prenoms${n > 20 ? ' cinq' : ''}">${classe.eleves
        .map((p) => {
          const c = pris.includes(p);
          return `<button type="button" class="prenom${c ? ' choisi' : ''}" data-action="prenom" data-prenom="${ech(p)}" aria-pressed="${c}"${!c && pris.length >= 3 ? ' disabled' : ''}>${c ? pic('coche') : ''}${ech(p)}</button>`;
        })
        .join('')}</div>`;
    } else {
      milieu = `<div class="milieu" style="flex-direction:column;gap:2rem">
        <div class="champs-prenoms">
          <label class="champ">Prénom 1<input class="saisie-prenom" autocomplete="off" maxlength="30" value="${ech(pris[0] || '')}"></label>
          <label class="champ">Prénom 2<input class="saisie-prenom" autocomplete="off" maxlength="30" value="${ech(pris[1] || '')}"></label>
        </div></div>`;
    }
    afficher(
      `<div class="ecran">
        <div class="haut">
          <button type="button" class="btn btn-second" data-action="retour">${pic('retour')}Retour</button>
          <h1 class="titre-ecran">${avecBoutons ? 'Touche vos deux prénoms' : 'Écris vos deux prénoms'}</h1>
          ${boutonVoix(avecBoutons ? 'Touche vos deux prénoms.' : 'Écris vos deux prénoms.')}
        </div>
        ${avecBoutons ? `<div class="binome">${Array.from({ length: cases }, (_, i) => `<div class="case-prenom${pris[i] ? ' rempli' : ''}">${ech(pris[i] || '?')}</div>`).join('<div class="plus-binome">+</div>')}</div>` : ''}
        ${milieu}
        ${bas({
          gauche: avecBoutons ? '<span class="compte gauche">Ton prénom n’est pas là ? Touche Aide.</span>' : '',
          principal: boutonPrincipal('valider', 'C’est nous !', 'coche', avecBoutons && !pris.length),
        })}
      </div>`,
      {
        retour: () => (enseignant ? ecranAccueil() : F().accesDossiers ? ecranDossier('commencer') : ecranAccueil()),
        prenom: (b) => {
          const p = b.dataset.prenom;
          ecranPrenoms(classe, pris.includes(p) ? pris.filter((x) => x !== p) : [...pris, p]);
        },
        valider: () => {
          const eleves = avecBoutons
            ? pris
            : [...racine.querySelectorAll('.saisie-prenom')].map((i) => S.majuscule(i.value)).filter(Boolean);
          if (!eleves.length) return message('Écris au moins un prénom.');
          const classes = S.reglages.classes || [];
          creerEquipe({ eleves, classe: (classe && classe.classe) || (classes.length === 1 ? classes[0] : '') });
        },
      },
      () => {
        const champ = racine.querySelector('.saisie-prenom');
        if (!champ) return;
        champ.focus();
        const entree = (e) => e.key === 'Enter' && etat.actions.valider();
        racine.addEventListener('keydown', entree);
        nettoyage = () => racine.removeEventListener('keydown', entree);
      }
    );
  }

  async function creerEquipe(equipe) {
    let donnees = S.creerSauvegarde(S.projet.id, equipe);
    if (enseignant) return demarrer(S.creerSession({ donnees, lecture: true }));
    if (!etat.dossierProjet) {
      message('Ton travail est gardé sur ce poste. À la fin, range le fichier dans ton dossier.', 6000);
      return demarrer(S.creerSession({ donnees }));
    }
    try {
      if (!(await F().autorise(etat.dossierProjet, true))) return ecranDossier('commencer', 'Touche « Autoriser » quand le navigateur le demande.');
      const { dossier, deja } = await F().dossierEquipe(etat.dossierProjet, donnees);
      let handle = null;
      if (deja) {
        donnees = deja.lecture.donnees;
        handle = deja.handle;
        message('Votre dossier existe déjà : vous reprenez votre travail.', 4000);
      }
      F().memoriser('equipe', dossier);
      const session = S.creerSession({ donnees, dossier, handle });
      if (!deja) await session.enregistrer(true);
      demarrer(session);
    } catch {
      ecranDossier('commencer', 'Le dossier de l’équipe ne se crée pas. Touche Aide.');
    }
  }

  // ---------- 4. Je continue : les équipes du dossier ----------

  async function ecranEquipes(liste, page) {
    const derniere = await F().memorise('equipe');
    const p = page || 0;
    const parPage = 9;
    const visibles = liste.slice(p * parPage, (p + 1) * parPage);
    const pages = Math.ceil(liste.length / parPage);
    afficher(
      `<div class="ecran">
        <div class="haut">
          <button type="button" class="btn btn-second" data-action="retour">${pic('retour')}Retour</button>
          <h1 class="titre-ecran">Touche votre équipe</h1>
          ${boutonVoix('Touche votre équipe.')}
        </div>
        <div class="milieu" style="flex-direction:column;gap:1.5rem">
          ${
            liste.length
              ? `<div class="grille-equipes">${visibles
                  .map((e, i) => `<button type="button" class="equipe-bouton${derniere && derniere.name === e.dossier.name ? ' derniere' : ''}" data-action="equipe" data-i="${p * parPage + i}">${pic('dossier')}${ech(prenoms(e.donnees))}</button>`)
                  .join('')}</div>`
              : `<div class="msg msg-ambre">${pic('dossier')}Aucune équipe dans ce dossier pour l’instant.</div>`
          }
          ${pages > 1 ? `<div class="pages"><button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + pages - 1) % pages}">${pic('retour')}</button>${p + 1} sur ${pages}<button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + 1) % pages}">${pic('suivant')}</button></div>` : ''}
        </div>
        ${bas({ gauche: '<button type="button" class="btn btn-second gauche" data-action="nouvelle">Notre équipe n’est pas là</button>' })}
      </div>`,
      {
        retour: () => (enseignant ? ecranAccueil() : ecranDossier('continuer')),
        page: (b) => ecranEquipes(liste, Number(b.dataset.p)),
        equipe: (b) => ouvrirEquipe(liste[Number(b.dataset.i)].dossier),
        nouvelle: async () => (enseignant ? ecranPrenoms(classeFictive()) : etat.dossierProjet ? ecranPrenoms(await F().lireClasse(etat.dossierProjet)) : ecranDossier('commencer')),
      }
    );
  }

  async function ouvrirEquipe(dossier) {
    try {
      if (!(await F().autorise(dossier, true))) return ecranDossier('continuer', 'Touche « Autoriser » quand le navigateur le demande.');
      const s = await F().sauvegardeDans(dossier, dossier.name + '.json');
      if (!s) return ecranDossier('continuer', 'Ce dossier n’a pas de sauvegarde. Touche Aide.');
      let donnees = s.lecture.donnees;
      // Copie de secours plus récente (page fermée avant l'enregistrement) : on la garde.
      const secours = F().lireSecours();
      if (secours && S.nomEquipe(secours.equipe.eleves) === S.nomEquipe(donnees.equipe.eleves) && String(secours.modifieLe) > String(donnees.modifieLe)) donnees = secours;
      F().memoriser('equipe', dossier);
      const session = S.creerSession({ donnees, dossier, handle: s.handle });
      if (donnees === secours) session.aEnregistrer(true);
      demarrer(session);
    } catch {
      ecranDossier('continuer', 'Le dossier ne s’ouvre pas. Touche Aide.');
    }
  }

  // Firefox : pas d'accès aux dossiers, on ouvre le fichier de l'équipe.
  function ouvrirSansDossier() {
    const entree = document.createElement('input');
    entree.type = 'file';
    entree.accept = '.json,application/json';
    entree.addEventListener('change', async () => {
      const f = entree.files && entree.files[0];
      if (!f) return;
      const r = S.lireSauvegarde(await f.text(), S.projet.id);
      if (!r.ok) return message(r.raison, 5000);
      demarrer(S.creerSession({ donnees: r.donnees }));
    });
    entree.click();
  }

  function demarrer(session) {
    etat.session = session;
    session.ecouter(majEtatEnregistrement);
    ecranMission();
  }

  // ---------- 5. Ma mission ----------

  function ecranMission() {
    const d = D();
    const types = typesConnus();
    const courante = S.seanceCourante(d, seances(), types);
    const cartes = seances()
      .map((s, i) => {
        const e = S.etatSeance(d, s, types);
        const ici = s === courante;
        const texteEtat = { fait: 'Fait', en_cours: 'En cours', a_faire: 'À faire' }[e];
        const pictoEtat = { fait: 'coche', en_cours: 'point', a_faire: 'rond' }[e];
        const lien = i < seances().length - 1 ? `<div class="lien-frise${e === 'fait' ? ' fait' : ''}"></div>` : '';
        return `<button type="button" class="carte-seance ${e}${ici ? ' courante' : ''}" data-action="seance" data-id="${ech(s.id)}" aria-label="Séance ${i + 1} : ${ech(s.titre)}, ${texteEtat}">
            <span class="numero">Séance ${i + 1}</span>
            <span class="grand">${pic(s.picto)}</span>
            <span class="nom">${ech(s.titre)}</span>
            <span class="etat ${e}">${pic(pictoEtat)}${texteEtat}</span>
          </button>${lien}`;
      })
      .join('');
    afficher(
      `<div class="ecran">
        <div class="haut">
          <h1 class="titre-ecran">Ma mission</h1>
          ${boutonVoix('Ma mission. ' + seances().map((s, i) => `Séance ${i + 1} : ${s.titre} ${s.sousTitre || ''}.`).join(' '))}
          <div class="espace"></div>
          <button type="button" class="btn btn-second" data-action="album">${pic('album')}Mon album</button>
          <button type="button" class="btn btn-maison btn-petit" data-action="son" aria-pressed="${S.voix.sonActif()}">${pic(S.voix.sonActif() ? 'son' : 'sans-son')}Son</button>
          ${etiquetteEquipe()}
        </div>
        <div class="milieu"><div class="frise">${cartes}</div></div>
        ${bas({ gauche: `<div class="gauche">${etatEnregistrement()}</div>`, principal: boutonPrincipal('continuer', 'Je continue', 'lecture') })}
      </div>`,
      {
        seance: (b) => ouvrirSeance(b.dataset.id),
        continuer: () => ouvrirSeance(courante.id),
        album: () => ecranAlbum(courante.id),
        son: () => {
          S.voix.basculerSon();
          ecranMission();
        },
      }
    );
  }

  function ouvrirSeance(id) {
    etat.seance = seances().find((s) => s.id === id);
    etat.index = S.indexAReprendre(D(), etat.seance, typesConnus());
    if (etat.index >= etapes().length) return ecranBravo();
    ecranEtape();
  }

  // ---------- 6. Une étape ----------

  function hautEtape(etape) {
    const liste = etapes();
    const n = liste.length;
    const numero = seances().indexOf(etat.seance) + 1;
    const points = liste
      .map((e, i) => `<span class="point${i < etat.index ? ' fait' : ''}${i === etat.index ? ' ici' : ''}"></span>`)
      .join('');
    return `<div class="haut">
      ${boutonMaison()}
      <div class="progression"><span class="etiquette-seance">Séance ${numero}</span>${n <= 14 ? points : ''}<span class="texte">${etat.index + 1} sur ${n}</span></div>
      ${etiquetteEquipe()}
      ${minuteurHtml(etape)}
    </div>`;
  }

  function ecranEtape() {
    const etape = etapes()[etat.index];
    // État d'un écran à plusieurs temps (pièce par pièce…) : remis à zéro quand on change d'étape.
    const cle = etat.seance.id + '/' + etape.id;
    if (!etat.sous || etat.sous.cle !== cle) etat.sous = { cle };
    const vue = TYPES[etape.type](etape);
    afficher(
      `<div class="ecran">
        ${hautEtape(etape)}
        <div class="milieu">${vue.milieu}</div>
        ${bas({ gauche: vue.gauche || boutonRetour('precedent'), principal: vue.principal })}
      </div>`,
      Object.assign({ precedent }, vue.actions),
      vue.apres
    );
  }

  function precedent() {
    if (etat.index === 0) return ecranMission();
    etat.index--;
    ecranEtape();
  }

  // L'étape est faite : on la note, on enregistre, on passe à la suivante (ou à « Bravo »).
  function suivant(valeur) {
    const etape = etapes()[etat.index];
    S.noterEtape(D(), etat.seance.id, etape.id, valeur);
    etat.session.aEnregistrer(true);
    S.voix.son('ok');
    etat.index++;
    if (etat.index >= etapes().length) return ecranBravo();
    ecranEtape();
  }

  function blocConsigne(etape, pastille) {
    const pictos = etape.picto2 ? S.pictoDouble(etape.picto, etape.picto2, 120) : pic(etape.picto);
    return `<div class="picto-grand${etape.picto2 ? '' : ' seul'}">${pictos}</div>
      <div class="consigne">
        ${pastille ? `<span class="pastille">${ech(pastille)}</span>` : ''}
        <div class="consigne-ligne"><p class="consigne-texte">${ech(etape.texte)}</p>${boutonVoix(lisible(etape.texte, etape.detail))}</div>
        ${etape.detail ? `<p class="consigne-detail">${ech(etape.detail)}</p>` : ''}
      </div>`;
  }

  const TYPES = {
    // Une règle du matériel : « J'ai compris ».
    regle: (etape) => ({
      milieu: blocConsigne(etape, etape.pastille || 'Règle'),
      principal: boutonPrincipal('fait', 'J’ai compris'),
      actions: { fait: () => suivant() },
    }),

    // Une chose à faire : « C'est fait ».
    consigne: (etape) => ({
      milieu: blocConsigne(etape),
      principal: boutonPrincipal('fait', etape.bouton || 'C’est fait'),
      actions: { fait: () => suivant() },
    }),

    // Lignes à cocher (rangement, vérification) : chaque ligne entière se touche.
    cases: (etape) => {
      const valeur = S.valeurEtape(D(), etat.seance.id, etape.id);
      const coches = etape.lignes.map((_, i) => !!(Array.isArray(valeur) && valeur[i]));
      const toutes = coches.every(Boolean);
      return {
        milieu: `<div class="colonne" style="max-width:66rem;gap:1.25rem">
            <div class="consigne-ligne" style="align-items:center"><p class="consigne-texte" style="font-size:2.75rem">${ech(etape.texte)}</p>${boutonVoix(lisible(etape.texte, ...etape.lignes.map((l) => l.texte)))}</div>
            <div class="lignes">${etape.lignes
              .map(
                (l, i) => `<button type="button" class="ligne" data-action="cocher" data-i="${i}" aria-pressed="${coches[i]}">
                  <span class="boite-coche">${pic('coche')}</span><span class="tuile">${pic(l.picto)}</span>${ech(l.texte)}</button>`
              )
              .join('')}</div>
          </div>`,
        gauche: `<div class="gauche" style="display:flex;align-items:center;gap:1.5rem">${boutonRetour('precedent').replace(' gauche', '')}<span class="compte">${coches.filter(Boolean).length} sur ${coches.length}</span></div>`,
        principal: boutonPrincipal('fait', etape.bouton || 'C’est fait', 'coche', !toutes),
        actions: {
          cocher: (b) => {
            coches[Number(b.dataset.i)] = !coches[Number(b.dataset.i)];
            S.noterBrouillon(D(), etat.seance.id, etape.id, coches.slice());
            etat.session.aEnregistrer(false);
            b.setAttribute('aria-pressed', String(coches[Number(b.dataset.i)]));
            racine.querySelector('.compte').textContent = `${coches.filter(Boolean).length} sur ${coches.length}`;
            racine.querySelector('[data-action="fait"]').disabled = !coches.every(Boolean);
          },
          fait: () => suivant(coches.slice()),
        },
      };
    },

    // Trois visages par phrase (Oui · Un peu · Pas encore).
    bilan: (etape) => {
      const valeur = S.valeurEtape(D(), etat.seance.id, etape.id);
      const reponses = etape.phrases.map((_, i) => (Array.isArray(valeur) && Number.isInteger(valeur[i]) ? valeur[i] : null));
      const VISAGES = [
        { picto: 'visage-oui', mot: 'Oui' },
        { picto: 'visage-moyen', mot: 'Un peu' },
        { picto: 'visage-pas-encore', mot: 'Pas encore' },
      ];
      return {
        milieu: `<div class="questions-bilan">${etape.phrases
          .map(
            (ph, i) => `<div class="question-bilan" role="group" aria-label="${ech(ph)}"><p>${ech(ph)}</p>${boutonVoix(ph)}${VISAGES.map(
              (v, j) => `<button type="button" class="visage" data-action="visage" data-i="${i}" data-j="${j}" aria-pressed="${reponses[i] === j}">${pic(v.picto)}${v.mot}</button>`
            ).join('')}</div>`
          )
          .join('')}</div>`,
        principal: boutonPrincipal('fait', 'C’est fait', 'coche', reponses.includes(null)),
        actions: {
          visage: (b) => {
            const i = Number(b.dataset.i);
            reponses[i] = Number(b.dataset.j);
            S.noterBrouillon(D(), etat.seance.id, etape.id, reponses.slice());
            etat.session.aEnregistrer(false);
            for (const x of racine.querySelectorAll(`[data-action="visage"][data-i="${i}"]`)) x.setAttribute('aria-pressed', String(Number(x.dataset.j) === reponses[i]));
            racine.querySelector('[data-action="fait"]').disabled = reponses.includes(null);
          },
          fait: () => suivant(reponses.slice()),
        },
      };
    },

    // Photo : aperçu de la caméra, gros bouton, puis « Je garde » / « Je recommence ».
    photo: (etape) =>
      vuePhoto({
        texte: etape.texte,
        detail: etape.detail,
        legende: etape.legende,
        etapeId: etape.id,
        garder: (p) => suivant({ fichier: p.fichier }),
        plusTard: () => {
          S.passerEtape(D(), etat.seance.id, etape.id);
          etat.session.aEnregistrer(true);
          etat.index++;
          if (etat.index >= etapes().length) return ecranBravo();
          ecranEtape();
        },
      }),
  };

  // Écran photo réutilisable (étape « photo », photo d'une pièce, photo d'un dessin…).
  // o : { texte, detail, legende, etapeId (nom des fichiers), garder(photo), plusTard() facultatif, retour (action) }
  function vuePhoto(o) {
    const vue = { capture: null, cameras: [], choisie: '' };
    const zone = () => racine.querySelector('.zone-camera');
    const colonne = () => racine.querySelector('.colonne');
    const consigne = `<div class="consigne-ligne"><p class="consigne-texte" style="font-size:2.875rem">${ech(o.texte)}</p>${boutonVoix(lisible(o.texte, 'Les mains, oui. Les visages, non.'))}</div>`;

    function direct(erreur) {
      vue.capture = null;
      colonne().innerHTML = `${consigne}
        <p class="consigne-detail">${ech(o.detail || 'Les mains, oui. Les visages, non.')}</p>
        ${erreur ? `<div class="msg msg-ambre" role="alert">${pic('camera')}${ech(erreur)}</div>
          <button type="button" class="btn btn-principal" data-action="allumer" style="align-self:flex-start">${pic('remonter')}Réessayer</button>`
          : `<button type="button" class="declencheur" data-action="prendre" aria-label="Prendre la photo">${pic('photo')}</button>`}`;
      const basGauche = racine.querySelector('.bas .gauche');
      basGauche.innerHTML =
        boutonRetour(o.retour || 'precedent').replace(' gauche', '') +
        (vue.cameras.length > 1 ? `<button type="button" class="btn btn-second" data-action="autre-camera">${pic('camera')}Autre caméra</button>` : '') +
        (erreur && o.plusTard ? '<button type="button" class="btn btn-second" data-action="plus-tard">Plus tard</button>' : '');
    }

    async function allumer(id) {
      zone().innerHTML = `<div class="vide">${pic('camera')}La caméra s’allume…</div>`;
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('aria-label', 'Image de la caméra');
      const r = await S.camera.allumer(video, id);
      if (!racine.contains(zone())) return S.camera.arreter();
      if (!r.ok) {
        zone().innerHTML = `<div class="vide">${pic('camera')}Pas d’image</div>`;
        return direct(r.message);
      }
      vue.cameras = r.cameras;
      vue.choisie = r.choisie;
      zone().innerHTML = '';
      zone().append(video);
      zone().insertAdjacentHTML('beforeend', '<span class="coin hg"></span><span class="coin hd"></span><span class="coin bg"></span><span class="coin bd"></span><span class="flash"></span>');
      direct();
    }

    async function prendre() {
      const video = zone().querySelector('video');
      if (!video) return;
      let r;
      try {
        r = await S.camera.prendre(video);
      } catch {
        return message('La caméra démarre… Réessaie dans une seconde.');
      }
      S.voix.son('photo');
      const flash = zone().querySelector('.flash');
      flash.classList.add('on');
      setTimeout(() => flash.classList.remove('on'), 30);
      vue.capture = r.blob;
      S.camera.arreter();
      const img = document.createElement('img');
      img.alt = 'Ta photo';
      img.src = URL.createObjectURL(r.blob);
      zone().innerHTML = '';
      zone().append(img);
      colonne().innerHTML = `<div class="consigne-ligne"><p class="consigne-texte" style="font-size:2.875rem">Ta photo est bien ?</p>${boutonVoix('Ta photo est bien ?')}</div>
        <button type="button" class="btn btn-principal" data-action="garder" style="align-self:flex-start">${pic('coche')}Je garde</button>
        <button type="button" class="btn btn-second" data-action="recommencer" style="align-self:flex-start">${pic('photo')}Je recommence</button>`;
      racine.querySelector('.bas .gauche').innerHTML = '';
    }

    async function garder(b) {
      b.disabled = true;
      try {
        const p = await etat.session.ajouterPhoto(vue.capture, etat.seance.id, o.etapeId, o.legende || o.texte);
        o.garder(p);
      } catch {
        b.disabled = false;
        message('La photo ne s’enregistre pas. Touche « Autoriser », ou touche Aide.', 5000);
      }
    }

    function touche(e) {
      if (e.code === 'Space' && !vue.capture && racine.querySelector('[data-action="prendre"]')) {
        e.preventDefault();
        prendre();
      }
    }

    return {
      milieu: `<div class="zone-camera"><div class="vide">${pic('camera')}La caméra s’allume…</div></div><div class="colonne">${consigne}</div>`,
      gauche: `<div class="gauche" style="display:flex;gap:1rem">${boutonRetour(o.retour || 'precedent').replace(' gauche', '')}</div>`,
      principal: '',
      actions: {
        prendre,
        allumer: () => allumer(),
        garder,
        recommencer: () => allumer(vue.choisie),
        'autre-camera': () => {
          const i = vue.cameras.findIndex((c) => c.deviceId === vue.choisie);
          allumer(vue.cameras[(i + 1) % vue.cameras.length].deviceId);
        },
        'plus-tard': () => o.plusTard && o.plusTard(),
      },
      apres: () => {
        allumer();
        document.addEventListener('keydown', touche);
        nettoyage = () => document.removeEventListener('keydown', touche);
      },
    };
  }

  // Les projets ajoutent leurs propres écrans (pieces, mesure…) : Segpa.ajouterEcran('mesure', (etape, outils) => vue).
  S.ajouterEcran = (type, fabrique) => {
    TYPES[type] = (etape) => fabrique(etape, OUTILS);
  };

  // ---------- 7. Bravo ----------

  function ecranBravo() {
    const d = D();
    const s = etat.seance;
    const photos = S.photosDe(d, s.id).slice(-4);
    const suivante = seances()[seances().indexOf(s) + 1];
    const lignes = [];
    if (photos.length || S.photosDe(d, s.id).length) {
      const n = S.photosDe(d, s.id).length;
      lignes.push(`${n} photo${n > 1 ? 's' : ''} prise${n > 1 ? 's' : ''}`);
    }
    for (const e of s.etapes) if (e.bravo && S.etapeFaite(d, s.id, e.id)) lignes.push(e.bravo);
    if (!lignes.length) lignes.push('Séance terminée');
    const noms = d.equipe.eleves.length > 1 ? d.equipe.eleves.slice(0, -1).join(', ') + ' et ' + d.equipe.eleves.slice(-1) : d.equipe.eleves[0];
    afficher(
      `<div class="ecran">
        <div class="haut">${boutonMaison()}<div class="espace"></div>${etatEnregistrement()}</div>
        <div class="milieu" style="gap:3.5rem">
          <div class="collage">${photos.length ? photos.map(() => '<img class="photo" alt="">').join('') : `<div class="sans-photo">${pic(s.picto)}</div>`}</div>
          <div class="colonne" style="gap:1.375rem">
            <div class="consigne-ligne" style="align-items:center"><h1 class="grand-titre" style="font-size:3.75rem">Bravo ${ech(noms)} !</h1>${boutonVoix('Bravo ' + noms + ' ! ' + lignes.join('. ') + '.')}</div>
            <div class="fait-liste">${lignes.map((l) => `<div class="fait-ligne">${pic('coche')}${ech(l)}</div>`).join('')}</div>
            ${
              suivante
                ? `<div class="prochaine"><span class="tuile">${pic(suivante.picto)}</span><span><small>La prochaine fois</small><strong>${ech(suivante.titre + ' ' + (suivante.sousTitre || ''))}</strong></span></div>`
                : `<div class="prochaine"><span class="tuile">${pic(S.projet.picto)}</span><span><small>Le projet</small><strong>Mission terminée !</strong></span></div>`
            }
          </div>
        </div>
        ${bas({ gauche: '<button type="button" class="btn btn-second gauche" data-action="album">' + pic('album') + 'Mon album</button>', principal: boutonPrincipal('fini', 'J’ai fini', 'coche') })}
      </div>`,
      {
        album: () => ecranAlbum(s.id),
        fini: async () => {
          const se = etat.session;
          if (!se.lecture && se.dossier) {
            const ok = await se.enregistrer(true);
            if (!ok) return message('L’enregistrement n’a pas marché. Touche Aide.', 5000);
          } else if (!se.lecture) {
            F().telecharger(d);
            message('Ton fichier est dans Téléchargements : range-le dans le dossier de ton équipe.', 7000);
          }
          etat.session = null;
          etat.seance = null;
          ecranAccueil();
          message('À la prochaine fois !');
        },
      },
      async () => {
        const imgs = racine.querySelectorAll('.collage img');
        for (let i = 0; i < photos.length; i++) {
          const u = await etat.session.urlPhoto(photos[i].fichier);
          if (u && imgs[i]) {
            imgs[i].src = u;
            imgs[i].alt = photos[i].legende;
          }
        }
      }
    );
  }

  // ---------- 8. Mon album ----------

  function ecranAlbum(idSeance, page) {
    const d = D();
    const p = page || 0;
    const parPage = 8;
    const toutes = S.photosDe(d, idSeance);
    const visibles = toutes.slice(p * parPage, (p + 1) * parPage);
    const pages = Math.max(1, Math.ceil(toutes.length / parPage));
    afficher(
      `<div class="ecran">
        <div class="haut">
          ${boutonMaison()}
          <h1 class="titre-ecran">Mon album</h1>
          ${boutonVoix('Mon album : toutes vos photos.')}
          <div class="espace"></div>
          ${etiquetteEquipe()}
        </div>
        <div class="album">
          <div class="album-onglets">${seances()
            .map((s, i) => `<button type="button" class="btn btn-second btn-petit" data-action="onglet" data-id="${ech(s.id)}" aria-pressed="${s.id === idSeance}">Séance ${i + 1}</button>`)
            .join('')}</div>
          ${
            toutes.length
              ? `<div class="album-grille">${visibles.map((ph, i) => `<button type="button" class="album-photo" data-action="loupe" data-i="${p * parPage + i}"><img alt="${ech(ph.legende)}"><span>${ech(ph.legende)}</span></button>`).join('')}</div>`
              : `<div class="album-vide">${pic('photo')}Pas encore de photo pour cette séance.</div>`
          }
        </div>
        ${bas({
          gauche: `<div class="gauche pages">${pages > 1 ? `<button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + pages - 1) % pages}" aria-label="Page précédente">${pic('retour')}</button>${p + 1} sur ${pages}<button type="button" class="btn btn-second btn-petit" data-action="page" data-p="${(p + 1) % pages}" aria-label="Page suivante">${pic('suivant')}</button>` : ''}</div>`,
        })}
      </div>`,
      {
        onglet: (b) => ecranAlbum(b.dataset.id),
        page: (b) => ecranAlbum(idSeance, Number(b.dataset.p)),
        loupe: async (b) => {
          const ph = toutes[Number(b.dataset.i)];
          const u = await etat.session.urlPhoto(ph.fichier);
          const l = document.createElement('div');
          l.className = 'loupe';
          l.innerHTML = `${u ? `<img src="${u}" alt="${ech(ph.legende)}">` : ''}<p>${ech(ph.legende)}</p><button type="button" class="btn btn-maison">${pic('retour')}Fermer</button>`;
          l.addEventListener('click', () => l.remove());
          document.body.appendChild(l);
          l.querySelector('button').focus();
        },
      },
      async () => {
        const imgs = racine.querySelectorAll('.album-photo img');
        for (let i = 0; i < visibles.length; i++) {
          const u = await etat.session.urlPhoto(visibles[i].fichier);
          if (u && imgs[i]) imgs[i].src = u;
        }
      }
    );
  }

  // Outils prêtés aux écrans propres d'un projet.
  // ---------- Pavé numérique à l'écran (aucun clavier) ----------
  // Une décimale au plus, 4 caractères au plus (« 12,5 »).
  const TOUCHES = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', 'effacer'];
  const paveHtml = () =>
    `<div class="pave">${TOUCHES.map((c) =>
      c === 'effacer'
        ? `<button type="button" class="touche" data-action="touche" data-c="effacer" aria-label="Effacer">${pic('effacer')}</button>`
        : `<button type="button" class="touche" data-action="touche" data-c="${c}" aria-label="${c === ',' ? 'Virgule' : c}">${c}</button>`
    ).join('')}</div>`;
  function paveAppui(valeur, c) {
    const v = String(valeur || '');
    if (c === 'effacer') return v.slice(0, -1);
    if (c === ',') return v && !v.includes(',') ? v + ',' : v;
    if (v.includes(',') && v.split(',')[1].length >= 1) return v;
    if (v.length >= 4 || (v === '0' && c !== ',')) return v === '0' ? c : v;
    return v + c;
  }

  const OUTILS = {
    etat,
    D,
    suivant,
    message,
    pic,
    ech,
    lisible,
    boutonVoix,
    boutonPrincipal,
    boutonRetour,
    blocConsigne,
    vuePhoto,
    racine,
    seance: () => etat.seance,
    sous: () => etat.sous,
    rafraichir: () => ecranEtape(),
    enregistrer: (geste) => etat.session.aEnregistrer(geste),
    urlPhoto: (fichier) => etat.session.urlPhoto(fichier),
    pave: { html: paveHtml, appui: paveAppui },
  };

  // ---------- Démarrage ----------

  function demarrerSite() {
    const p = S.projet;
    const r = document.documentElement.style;
    if (p.accent) r.setProperty('--accent', p.accent);
    if (p.accentFonce) r.setProperty('--accent-fonce', p.accentFonce);
    if (p.accentClair) r.setProperty('--accent-clair', p.accentClair);
    S.voix.demarrer();
    if (enseignant) {
      const b = document.createElement('div');
      b.className = 'bandeau-enseignant';
      b.textContent = 'Mode enseignant : rien n’est enregistré';
      document.body.appendChild(b);
    }
    ecranAccueil();
  }

  S.app = { demarrer: demarrerSite, etat, ecranMission, ecranAccueil };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrerSite);
  else demarrerSite();
})(window);
