// Recette automatique : npm run recette
// Parcours complet d'une équipe fictive dans le navigateur (Chromium de Playwright, ou Chrome / Edge du poste :
// NAVIGATEUR=chrome ou NAVIGATEUR=msedge), en file:// et par le serveur local, à 1366 × 768 et 1920 × 1080.
//   A. mode enseignant : tous les écrans de toutes les séances, sans défilement, sans erreur, caméra simulée ;
//   B. vrai dossier (dossier privé du navigateur à la place du dossier réseau) : classe.json → boutons-prénoms,
//      dossier de l'équipe créé, sauvegarde et photo JPEG écrites, page rechargée, « Je continue » retrouve l'équipe.
// Aucune requête hors du site. Résultat : RECETTE-AUTO.md, captures dans .cache/recette/.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, '.cache', 'recette');
fs.rmSync(SORTIE, { recursive: true, force: true });
fs.mkdirSync(SORTIE, { recursive: true });
const PORT = 8137;
const lignes = [];
const noter = (t) => {
  console.log(t);
  lignes.push(t);
};

async function nouvellePage(navigateur, taille) {
  const contexte = await navigateur.newContext({ viewport: taille, permissions: ['camera'] });
  const page = await contexte.newPage();
  const erreurs = [];
  const horsSite = [];
  page.on('pageerror', (e) => {
    erreurs.push(e.message);
    if (process.env.TRACE) console.log('ERREUR PAGE', e.message);
  });
  page.on('dialog', (d) => {
    // Seule fenêtre attendue : le message d'information après l'export Carnet de classe.
    if (!(d.type() === 'alert' && /Carnet de classe/.test(d.message()))) erreurs.push('fenêtre inattendue : ' + d.type());
    d.accept();
  });
  // Les photos du professeur (img/…) sont facultatives : un fichier absent n'est pas une erreur (le pictogramme s'affiche).
  // Tout autre fichier manquant en est une.
  const facultatif = (u) => /\/(?!commun\/)[a-z-]+\/img\/.+\.(jpe?g|png)$/.test(u);
  page.on('console', (m) => m.type() === 'error' && !/^Failed to load resource/.test(m.text()) && erreurs.push(m.text()));
  page.on('requestfailed', (r) => !facultatif(r.url()) && erreurs.push('fichier introuvable : ' + r.url()));
  page.on('response', (r) => r.status() >= 400 && !facultatif(r.url()) && erreurs.push(`fichier introuvable (${r.status()}) : ${r.url()}`));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('file://') && !u.startsWith(`http://localhost:${PORT}/`) && !u.startsWith('blob:') && !u.startsWith('data:')) horsSite.push(u);
  });
  return { contexte, page, erreurs, horsSite };
}

// Rien ne dépasse de l'écran (pas de défilement, rien de coupé).
async function sansDefilement(page, nom) {
  const r = await page.evaluate(() => {
    const h = innerHeight;
    const w = innerWidth;
    const depasse = [...document.querySelectorAll('#app *')]
      .filter((el) => el.offsetParent !== null || el.tagName === 'svg')
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width && r.height && (r.bottom > h + 1 || r.right > w + 1 || r.top < -1 || r.left < -1))
      .map(({ el, r }) => `${el.tagName.toLowerCase()}.${el.className && el.className.baseVal === undefined ? el.className : ''} (${Math.round(r.bottom)}×${Math.round(r.right)})`);
    // Rien du milieu ne passe sous la barre du bas (boutons) ni au-dessus de celle du haut.
    const bas = document.querySelector('#app .bas');
    const haut = document.querySelector('#app .haut');
    const limiteBas = bas ? bas.getBoundingClientRect().top + 1 : h;
    const limiteHaut = haut ? haut.getBoundingClientRect().bottom - 1 : 0;
    const chevauche = [...document.querySelectorAll('#app .milieu *')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ el, r }) => r.width && r.height && (r.bottom > limiteBas || r.top < limiteHaut) && !el.closest('.msg-flottant'))
      .map(({ el, r }) => `${el.tagName.toLowerCase()}.${typeof el.className === 'string' ? el.className : ''} chevauche (${Math.round(r.top)}-${Math.round(r.bottom)})`);
    return { defile: document.documentElement.scrollHeight > h + 1 || document.documentElement.scrollWidth > w + 1, depasse: depasse.concat(chevauche).slice(0, 5) };
  });
  assert.ok(!r.defile && !r.depasse.length, `${nom} : ça dépasse de l'écran ${JSON.stringify(r.depasse)}`);
}

async function cliquer(page, selecteur) {
  await page.locator(selecteur).first().click();
}

const visible = async (page, selecteur) => (await page.locator(selecteur).count()) > 0;

// Fait l'écran affiché, quel que soit son type. Renvoie false sur l'écran « Bravo ».
// demo : modèle de démonstration chargé (cartes de noms, plage de mesure).
async function faireEcran(page, nom, captures, demo) {
  await page.waitForTimeout(120);
  if (await visible(page, '[data-action="fini"]')) return false;
  await sansDefilement(page, nom);
  if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '.png') });
  if (process.env.TRACE) console.log(nom, await page.locator('.consigne-texte').first().textContent().catch(() => '-'));
  if (await visible(page, '.ligne')) {
    for (const l of await page.locator('.ligne').all()) await l.click();
    await cliquer(page, '[data-action="fait"]');
  } else if (await visible(page, '.visage')) {
    for (const q of await page.locator('.question-bilan').all()) await q.locator('.visage').first().click();
    await cliquer(page, '[data-action="fait"]');
  } else if (await visible(page, '.zone-camera:not(.photo-piece)')) {
    await page.locator('[data-action="prendre"]').waitFor({ timeout: 10000 });
    await page.waitForFunction(() => document.querySelector('.zone-camera video') && document.querySelector('.zone-camera video').videoWidth > 0);
    await sansDefilement(page, nom + '-camera');
    if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '-camera.png') });
    await cliquer(page, '[data-action="prendre"]');
    await page.locator('[data-action="garder"]').waitFor();
    await sansDefilement(page, nom + '-apercu');
    await cliquer(page, '[data-action="garder"]');
  } else if (await visible(page, '[data-action="choisir-nom"]')) {
    await cliquer(page, '[data-action="choisir-nom"]');
    await cliquer(page, '[data-action="nom-choisi"]');
  } else if (await visible(page, '[data-action="choisir-couleur"]')) {
    await cliquer(page, '[data-action="choisir-couleur"]');
    await page.locator('.apercu-voiture').waitFor();
    await sansDefilement(page, nom + '-apercu');
    await cliquer(page, '[data-action="couleur-choisie"]');
  } else if (await visible(page, '.ligne-materiel')) {
    for (const b of await page.locator('[data-action="plus"]').all()) await b.click();
    await cliquer(page, '[data-action="compte"]');
  } else if (await visible(page, '[data-action="decouvrir"]')) {
    await cliquer(page, '[data-action="decouvrir"]');
  } else if (await visible(page, '[data-action="piece"]')) {
    // Tableau des pièces : deux pièces, puis « J'ai fini de démonter ».
    if ((await page.locator('.case-piece.faite').count()) >= 2) await cliquer(page, '[data-action="fin-demontage"]');
    else await cliquer(page, '[data-action="piece"]');
  } else if (await visible(page, '.cartes-noms')) {
    await cliquer(page, '.carte-nom');
  } else if (await visible(page, 'input.champ-libre')) {
    await page.locator('input.champ-libre').fill('Ressort');
    await cliquer(page, '[data-action="nomme"]');
  } else if (await visible(page, '.pave')) {
    // Démonstration : une première mesure hors de la plage (message ambre), puis la bonne.
    const premiere = demo && !(await visible(page, '.msg-ambre'));
    for (const c of premiere ? ['9', ',', '5'] : ['7', ',', '5']) await cliquer(page, `[data-c="${c}"]`);
    await cliquer(page, '[data-action="mesure"]');
    if (premiere) {
      await page.locator('.msg-ambre').waitFor();
      await sansDefilement(page, nom + '-ecart');
      if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '-ecart.png') });
    }
  } else if (await visible(page, 'textarea.champ-libre')) {
    // Questions : réponse toujours écrite.
    assert.ok(await page.locator('[data-action="question-suivante"]').isDisabled(), 'pas de suite sans réponse écrite');
    await page.locator('textarea.champ-libre').fill('Elle fait tourner la lame.');
    await cliquer(page, '[data-action="question-suivante"]');
  } else {
    const suite = ['suivant-page', 'devissee', 'rangee', 'sortie', 'mesure-suivant', 'dessinee', 'fleche-faite', 'remise', 'fait'];
    for (const a of suite)
      if (await visible(page, `[data-action="${a}"]`)) {
        await cliquer(page, `[data-action="${a}"]`);
        return true;
      }
    throw new Error(`${nom} : écran inconnu`);
  }
  return true;
}

async function faireSeance(page, prefixe, captures, demo) {
  let n = 0;
  while (await faireEcran(page, `${prefixe}-${String(++n).padStart(2, '0')}`, captures, demo)) assert.ok(n < 90, 'séance sans fin');
  await sansDefilement(page, prefixe + '-bravo');
  if (captures) await page.screenshot({ path: path.join(SORTIE, prefixe + '-bravo.png') });
  return n - 1;
}

// Modèle de démonstration (fictif) : pour essayer les cartes de noms et la vérification de mesure.
const MODELE_DEMO = {
  pieces: [{ nom: 'Pièce A' }, { nom: 'Pièce B' }, { nom: 'Pièce C' }, { nom: 'Pièce D' }],
  nombrePieces: 8,
  maxPieces: 10,
  mesures: {
    corps: { titre: 'Pièce 1 : le corps', nom: 'le corps du taille-crayon', reference: { longueur: 7.5 } },
    manivelle: { titre: 'Pièce 2 : la manivelle', nom: 'la manivelle', reference: { min: 7, max: 8 } },
  },
  tolerance: 0.5,
  essaisMesure: 2,
  };

async function scenarioEnseignant(navigateur, base, taille, captures, demo) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  // Portail des élèves : aucun lien professeur ; page du professeur : ses liens mènent aux bonnes pages.
  await page.goto(base + 'index.html');
  assert.equal(await page.locator('a[href*="prof"], a[href*="enseignant"]').count(), 0, 'aucun lien professeur sur le portail');
  await page.goto(base + 'professeur.html');
  assert.equal(await page.locator('a[href="taille-crayon/prof.html"]').count(), 1);
  assert.equal(await page.locator('a[href="taille-crayon/index.html?enseignant=1"]').count(), 1);
  if (demo) await page.addInitScript((m) => document.addEventListener('DOMContentLoaded', () => (window.Segpa.modele = m)), MODELE_DEMO);
  await page.goto(base + 'taille-crayon/index.html?enseignant=1');
  await sansDefilement(page, 'accueil');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'accueil.png') });
  await cliquer(page, '[data-action="commencer"]');
  await sansDefilement(page, 'prenoms');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'prenoms.png') });
  await cliquer(page, '[data-action="valider"]');
  await sansDefilement(page, 'mission');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'mission.png') });
  // Aide : demandée puis résolue.
  await cliquer(page, '[data-action="aide"]');
  assert.equal(await page.locator('.btn-aide.demandee').count(), 1);
  await cliquer(page, '[data-action="aide"]');
  assert.equal(await page.locator('.btn-aide.demandee').count(), 0);
  const ecrans = [];
  for (const s of ['s1', 's2', 's3']) {
    await cliquer(page, '[data-action="continuer"]');
    ecrans.push(await faireSeance(page, s, captures, demo));
    // Fin de séance : « Ma mission » ramène à la mission ; l'album est ouvert une fois en passant.
    if (s === 's3') {
      await cliquer(page, '[data-action="album"]');
      await sansDefilement(page, s + '-album');
      if (captures) await page.screenshot({ path: path.join(SORTIE, 'album.png') });
      await cliquer(page, '[data-action="mission"]');
    } else {
      await cliquer(page, '[data-action="fini"]');
      await page.locator('.carte-seance').first().waitFor();
    }
  }
  assert.equal(await page.locator('.carte-seance.fait').count(), 3);
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'mission-fin.png') });
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
  return ecrans;
}

// Voiture à ballon (jalon V1) : séances 1 à 3, Ma mission à 5 séances, dépannage « Ma voiture ne roule pas ».
async function scenarioVoiture(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'voiture-ballon/index.html?enseignant=1');
  await sansDefilement(page, 'voiture-accueil');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'voiture-accueil.png') });
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  await cliquer(page, '[data-action="valider"]');
  assert.equal(await page.locator('.carte-seance').count(), 5);
  await sansDefilement(page, 'voiture-mission');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'voiture-mission.png') });
  const ecrans = [];
  for (const s of ['s1', 's2', 's3']) {
    await cliquer(page, '[data-action="continuer"]');
    ecrans.push(await faireSeance(page, 'voiture-' + s, captures));
    await cliquer(page, '[data-action="fini"]');
    await page.locator('.carte-seance').first().waitFor();
  }
  assert.equal(await page.locator('.carte-seance.fait').count(), 3);
  const d = await page.evaluate(() => Segpa.voitureDe(Segpa.app.etat.session.donnees));
  assert.equal(d.nom, 'Turbo Ballon');
  assert.equal(d.nomCouleur, 'Bleu');
  assert.ok(await page.evaluate(() => Segpa.app.etat.session.donnees.photos.some((p) => p.legende === 'Photo officielle')));
  // Séance 4 : « Ma voiture ne roule pas » → « Une roue frotte » ramène à l'étape de la séance 2.
  await cliquer(page, '[data-action="continuer"]');
  await cliquer(page, '[data-action="depannage"]');
  await page.locator('.cause').first().waitFor();
  await sansDefilement(page, 'voiture-depannage');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'voiture-depannage.png') });
  await cliquer(page, '.cause');
  assert.match(await page.locator('.consigne-texte').first().textContent(), /Je vérifie : les roues tournent/);
  assert.match(await page.locator('.etiquette-seance').textContent(), /Séance 2/);
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
  return ecrans;
}

// Dossier « réseau » simulé par le dossier privé du navigateur (même interface que le vrai dossier).
// Ce dossier privé refuse les noms de fichiers accentués (limite de Chromium, pas des dossiers Windows) :
// l'équipe s'appelle donc « Ines » ici ; les accents sont vérifiés à la main sur un poste du collège (RECETTE.md).
// Relire un dossier privé rangé dans IndexedDB fait planter Chromium sans écran : la mémoire du poste
// (dernière équipe) est remplacée ici par une mémoire le temps de la page ; elle est vérifiée à la main.
async function preparerDossier(page) {
  await page.addInitScript(() => {
    window.showDirectoryPicker = async () => {
      const racine = await navigator.storage.getDirectory();
      return racine.getDirectoryHandle('Taille-crayon', { create: true });
    };
    document.addEventListener('DOMContentLoaded', () => {
      const memoire = new Map();
      window.Segpa.fichiers.memoriser = async (cle, h) => memoire.set(cle, h);
      window.Segpa.fichiers.memorise = async (cle) => memoire.get(cle) || null;
    });
  });
}

async function scenarioDossier(navigateur, base, taille) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await preparerDossier(page);
  await page.goto(base + 'taille-crayon/index.html');
  await page.evaluate(async () => {
    const racine = await navigator.storage.getDirectory();
    for await (const [nom] of racine.entries()) await racine.removeEntry(nom, { recursive: true });
    const d = await racine.getDirectoryHandle('Taille-crayon', { create: true });
    const f = await (await d.getFileHandle('classe.json', { create: true })).createWritable();
    await f.write(JSON.stringify({ classe: '6A', eleves: ['Léa', 'Tom', 'Ines', 'Noah'] }));
    await f.close();
  });
  await cliquer(page, '[data-action="commencer"]');
  await sansDefilement(page, 'dossier');
  await page.screenshot({ path: path.join(SORTIE, 'dossier.png') });
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('[data-prenom="Ines"]').waitFor();
  assert.equal(await page.locator('.prenom').count(), 4, 'boutons-prénoms lus dans classe.json');
  await cliquer(page, '[data-prenom="Ines"]');
  await cliquer(page, '[data-prenom="Noah"]');
  await cliquer(page, '[data-action="valider"]');
  await page.locator('.carte-seance').first().waitFor();
  await cliquer(page, '[data-action="continuer"]');
  await faireSeance(page, 'dossier-s1', false);
  await cliquer(page, '[data-action="fini"]');
  await page.waitForTimeout(800);
  if (!(await page.locator('.carte-seance').count())) throw new Error('après « J’ai fini » : ' + (await page.locator('.message-bref').textContent().catch(() => '?')) + ' / ' + (await page.evaluate(() => Segpa.app.etat.session && Segpa.app.etat.session.derniereErreur)));
  const fichiers = await page.evaluate(async () => {
    const racine = await navigator.storage.getDirectory();
    const equipe = await (await racine.getDirectoryHandle('Taille-crayon')).getDirectoryHandle('Ines_Noah');
    const json = await (await (await equipe.getFileHandle('Ines_Noah.json')).getFile()).text();
    const photo = await (await (await equipe.getDirectoryHandle('photos')).getFileHandle('s1-boite-01.jpg')).getFile();
    const debut = new Uint8Array(await photo.slice(0, 3).arrayBuffer());
    return { json, taille: photo.size, debut: [...debut] };
  });
  const d = JSON.parse(fichiers.json);
  assert.equal(d.application, 'segpa');
  assert.equal(d.projet, 'taille-crayon');
  assert.deepEqual(d.equipe, { eleves: ['Ines', 'Noah'], classe: '6A' });
  assert.ok(d.photos.some((p) => p.fichier === 'photos/s1-boite-01.jpg'), 'photo de la boîte notée');
  assert.ok(d.photos.some((p) => p.fichier === 'photos/s1-piece-01-01.jpg' && p.legende === 'Pièce 1 : Ressort'), 'photo de la pièce 1 notée avec son nom');
  assert.equal(d.seances.s1.etapes.pieces.valeur.pieces.length, 2, 'deux pièces dans le tableau');
  assert.deepEqual(fichiers.debut, [0xff, 0xd8, 0xff], 'la photo est un JPEG');
  assert.ok(fichiers.taille > 5000);
  assert.ok(!fichiers.json.includes('data:image'), 'aucune image dans le .json');
  // Page rechargée : « Je continue » retrouve l'équipe et la séance 2.
  await page.reload();
  await cliquer(page, '[data-action="continuer"]');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.equipe-bouton').first().waitFor();
  await sansDefilement(page, 'equipes');
  await page.screenshot({ path: path.join(SORTIE, 'equipes.png') });
  await cliquer(page, '.equipe-bouton');
  await page.locator('.carte-seance').first().waitFor();
  assert.equal(await page.locator('.carte-seance.fait').count(), 1);
  assert.equal(await page.locator('.carte-seance.courante .nom').textContent(), 'Je mesure');
  // Jamais d'écrasement : « Je commence » avec les mêmes prénoms reprend la sauvegarde existante.
  await page.reload();
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-action="ouvrir"]');
  await cliquer(page, '[data-prenom="Ines"]');
  await cliquer(page, '[data-prenom="Noah"]');
  await cliquer(page, '[data-action="valider"]');
  await page.locator('.carte-seance').first().waitFor();
  assert.equal(await page.locator('.carte-seance.fait').count(), 1, 'la sauvegarde existante est reprise');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// ---------- Outil professeur ----------
// Le dossier d'une classe (équipes fictives de « npm run exemples ») est donné au navigateur tel quel, par un petit
// dossier simulé en mémoire (même interface que le vrai dossier) : noms accentués compris.
function arbre(chemin) {
  const nom = path.basename(chemin);
  if (fs.statSync(chemin).isDirectory()) return { kind: 'directory', name: nom, children: fs.readdirSync(chemin).map((n) => arbre(path.join(chemin, n))) };
  return { kind: 'file', name: nom, data: fs.readFileSync(chemin).toString('base64') };
}

async function scenarioProfesseur(navigateur, base) {
  require('./exemples-equipes.js');
  const tree = arbre(path.join(RACINE, 'exemples', 'Taille-crayon'));
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  await page.addInitScript((tree) => {
    const octets = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const fichier = (n) => ({
      kind: 'file',
      name: n.name,
      getFile: async () => new File([octets(n.data)], n.name),
      createWritable: async () => {
        const parts = [];
        return { write: async (x) => parts.push(x), close: async () => (n.data = btoa(String.fromCharCode(...new Uint8Array(await new Blob(parts).arrayBuffer())))) };
      },
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
    });
    const dossier = (n) => ({
      kind: 'directory',
      name: n.name,
      async *values() {
        for (const c of n.children) yield c.kind === 'directory' ? dossier(c) : fichier(c);
      },
      async getDirectoryHandle(nom, o) {
        let c = n.children.find((x) => x.name === nom && x.kind === 'directory');
        if (!c && o && o.create) n.children.push((c = { kind: 'directory', name: nom, children: [] }));
        if (!c) throw new DOMException('absent', 'NotFoundError');
        return dossier(c);
      },
      async getFileHandle(nom, o) {
        let c = n.children.find((x) => x.name === nom && x.kind === 'file');
        if (!c && o && o.create) n.children.push((c = { kind: 'file', name: nom, data: '' }));
        if (!c) throw new DOMException('absent', 'NotFoundError');
        return fichier(c);
      },
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
    });
    window.__arbre = tree;
    window.__lireJson = (nom) => {
      const c = tree.children.find((x) => x.name === nom);
      return c && c.data ? JSON.parse(new TextDecoder().decode(octets(c.data))) : null;
    };
    window.showDirectoryPicker = async () => dossier(tree);
  }, tree);
  await page.goto(base + 'taille-crayon/prof.html');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.pt').first().waitFor();
  assert.equal(await page.locator('.pt').count(), 5, 'une tuile par équipe');
  assert.match(await page.locator('.pt').first().textContent(), /Léa · Tom/, 'l’équipe qui demande de l’aide est en premier');
  assert.equal(await page.locator('.pt-aide').count(), 1);
  assert.match(await page.locator('.pc-aides').textContent(), /Léa · Tom.*Je mesure/);
  const tuile = (noms) => page.locator('.pt', { hasText: noms }).textContent();
  assert.match(await tuile('Inès · Noah'), /Rien depuis 15 min/);
  assert.match(await tuile('Adam · Jade'), /Plus de 2 pièces dehors/);
  assert.match(await tuile('Adam · Jade'), /Mesure hors de la plage/);
  assert.match(await tuile('Léa · Tom'), /Pièces démontées : 6 sur 8/);
  await page.waitForFunction(() => [...document.querySelectorAll('.pt-photo img')].some((i) => i.src.startsWith('blob:')));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'pas de défilement horizontal');
  await page.screenshot({ path: path.join(SORTIE, 'prof-classe.png'), fullPage: true });
  // « J'y vais » : l'aide est notée vue dans professeur.json, l'alerte disparaît.
  await cliquer(page, '.pc-aide [data-action="vu"]');
  await page.waitForFunction(() => !document.querySelector('.pc-aides'));
  const prof = await page.evaluate(() => window.__lireJson('professeur.json'));
  assert.ok(prof.aidesVues['Léa_Tom'], 'aide vue enregistrée');
  // Fiche d'une équipe : onglets.
  await page.locator('.pt', { hasText: 'Léa · Tom' }).click();
  await page.locator('.pe-onglets').waitFor();
  assert.match(await page.locator('.pe-contenu').textContent(), /Séance 1 · Je démonte/);
  await cliquer(page, '[data-action="onglet"][data-id="album"]');
  await page.waitForFunction(() => document.querySelectorAll('.pp-photo img').length >= 7);
  await page.screenshot({ path: path.join(SORTIE, 'prof-album.png'), fullPage: true });
  await cliquer(page, '[data-action="onglet"][data-id="pieces"]');
  await page.waitForFunction(() => document.querySelectorAll('.pp-piece').length === 6);
  await cliquer(page, '[data-action="onglet"][data-id="seance2"]');
  assert.match(await page.locator('.pp-table').textContent(), /7,5 cm/);
  await cliquer(page, '[data-action="onglet"][data-id="historique"]');
  assert.ok((await page.locator('.pp-table tbody tr').count()) > 10);
  await cliquer(page, '[data-action="onglet"][data-id="differenciation"]');
  await page.locator('input[value="roles"]').check();
  await page.waitForFunction(() => (window.__lireJson('professeur.json') || { drapeaux: {} }).drapeaux['Léa_Tom']);
  await page.keyboard.press('Escape');
  await page.locator('.pt').first().waitFor();
  assert.match(await tuile('Léa · Tom'), /Rôles observateur \/ manipulateur/);
  // Évaluation de Léa et Tom (binôme lié) : 7 niveaux, note et ceinture, enregistrés dans professeur.json.
  await page.locator('.pt', { hasText: 'Léa · Tom' }).click();
  await cliquer(page, '[data-action="onglet"][data-id="evaluation"]');
  assert.match(await page.locator('.ev-table').textContent(), /6 pièces démontées/, 'repères automatiques');
  const niveaux = { procedure: 1, securite: 1, mesure: 2, dessin: 2, remontage: 2, questions: 2, autonomie: 3 };
  for (const [c, n] of Object.entries(niveaux)) {
    const bouton = `.niv-btn[data-eleve="Léa"][data-critere="${c}"][data-n="${n}"]`;
    await cliquer(page, bouton);
    await page.locator(`${bouton}[aria-pressed="true"]`).waitFor();
  }
  await page.waitForFunction(() => /12,4/.test(document.querySelector('.ev-bilans').textContent));
  assert.equal((await page.locator('.ev-bilans').textContent()).match(/12,4/g).length, 2, 'même note pour les deux élèves du binôme');
  assert.match(await page.locator('.ev-bilans').textContent(), /Ceinture verte/);
  await page.locator('textarea[data-eleve="Tom"]').fill('Bon travail d’équipe.');
  await page.locator('textarea[data-eleve="Tom"]').blur();
  await page.waitForFunction(() => ((window.__lireJson('professeur.json').evaluations || {})['Léa_Tom'] || { eleves: {} }).eleves.Léa?.commentaire === 'Bon travail d’équipe.');
  const ev = await page.evaluate(() => window.__lireJson('professeur.json').evaluations['Léa_Tom']);
  assert.deepEqual(ev.eleves.Tom.niveaux, niveaux);
  await page.screenshot({ path: path.join(SORTIE, 'prof-evaluation.png'), fullPage: true });
  // Exports.
  await page.keyboard.press('Escape');
  const telecharge = async (action) => {
    const [d] = await Promise.all([page.waitForEvent('download'), cliquer(page, `[data-action="${action}"]`)]);
    const f = path.join(SORTIE, d.suggestedFilename());
    await d.saveAs(f);
    return f;
  };
  const xlsx = await telecharge('excel');
  assert.match(path.basename(xlsx), /^taille-crayon-6A-\d{4}-\d{2}-\d{2}-evaluation\.xlsx$/);
  assert.equal(fs.readFileSync(xlsx).slice(0, 2).toString(), 'PK');
  const csv = fs.readFileSync(await telecharge('csv'), 'utf8');
  assert.match(csv, /;Léa;Tom;Jaune;Jaune;Vert clair;Vert clair;Vert clair;Vert clair;Vert foncé;13;12,4;Satisfaisant;Ceinture verte;Bon travail d’équipe\./);
  const carnet = JSON.parse(fs.readFileSync(await telecharge('carnet'), 'utf8'));
  assert.equal(carnet.format, 'labo-blocs/resultats');
  assert.deepEqual(carnet.equipes.find((e) => e.eleves.includes('Léa')).eleves, ['Léa', 'Tom']);
  // Feuilles ceinture : une par élève, sans note sauf si on la demande.
  await cliquer(page, '[data-action="ceintures"]');
  assert.equal(await page.locator('.feuille-ceinture').count(), 10);
  assert.ok(!(await page.locator('.feuilles').textContent()).includes('/ 20'), 'pas de note par défaut');
  await page.locator('[data-change="avec-note"]').check();
  assert.match(await page.locator('.feuilles').textContent(), /12,4 \/ 20/);
  await page.screenshot({ path: path.join(SORTIE, 'prof-ceintures.png'), fullPage: true });
  await cliquer(page, '[data-action="classe"]');
  // Équipe qui a fini : réponses écrites visibles.
  await page.locator('.pt', { hasText: 'Chloé · Sami' }).click();
  await cliquer(page, '[data-action="onglet"][data-id="pieces"]');
  assert.match(await page.locator('.pe-contenu').textContent(), /Elle fait tourner les lames\./);
  await page.screenshot({ path: path.join(SORTIE, 'prof-reponses.png'), fullPage: true });
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

(async () => {
  const serveur = spawn(process.execPath, [path.join(__dirname, 'serve.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise((ok) => setTimeout(ok, 600));
  const canal = process.env.NAVIGATEUR;
  const navigateur = await chromium.launch({
    channel: canal || undefined,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
  });
  let ok = true;
  noter(`# Recette automatique — ${new Date().toLocaleString('fr-FR')}`);
  noter('');
  noter(`Navigateur : ${canal || 'Chromium (Playwright)'} ${navigateur.version()} · caméra simulée`);
  noter('');
  const bases = [
    ['file://', 'file://' + path.join(RACINE, 'site').replaceAll('\\', '/') + '/'],
    ['serveur', `http://localhost:${PORT}/`],
  ];
  try {
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        for (const demo of [false, true]) {
          const quoi = demo ? 'modèle de démonstration' : 'modele.js vide';
          try {
            const ecrans = await scenarioEnseignant(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366 && demo, demo);
            noter(`- OK ${nomBase} ${t} · mode enseignant, ${quoi} : séances de ${ecrans.join(', ')} écrans faites jusqu’à « Bravo » puis retour à « Ma mission » (présentation, 2 pièces démontées, 2 mesures${demo ? ' dont une hors plage' : ''}, remontage, questions écrites), album, aide, rien ne dépasse, aucune erreur, aucune requête hors du site.`);
          } catch (e) {
            ok = false;
            noter(`- ÉCHEC ${nomBase} ${t} · mode enseignant, ${quoi} : ${e.message.split('\n')[0]}`);
          }
        }
      }
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        try {
          const ecrans = await scenarioVoiture(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · voiture à ballon : séances 1 à 3 de ${ecrans.join(', ')} écrans (nom, couleur, matériel, fabrication, décoration, photo officielle), Ma mission à 5 séances, dépannage vers la séance 2, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · voiture à ballon : ${e.message.split('\n')[0]}`);
        }
      }
    // Le dossier privé du navigateur n'existe pas en file:// : ce scénario passe par le serveur local.
    for (const [nomBase, base] of bases.filter(([n]) => n === 'serveur')) {
      try {
        await scenarioDossier(navigateur, base, { width: 1366, height: 768 });
        noter(`- OK ${nomBase} 1366×768 · dossier : prénoms lus dans classe.json, dossier Ines_Noah créé, sauvegarde et photo JPEG écrites (pas d’image dans le .json), page rechargée et équipe retrouvée en séance 2, « Je commence » avec les mêmes prénoms reprend la sauvegarde.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · dossier : ${e.message.split('\n')[0]}`);
        console.error(e.stack);
      }
    }
    for (const [nomBase, base] of bases) {
      try {
        await scenarioProfesseur(navigateur, base);
        noter(`- OK ${nomBase} 1366×768 · professeur : 5 équipes fictives, aide en premier avec son étape, alertes (inactivité, pièces dehors, mesure), dernière photo, « J’y vais » écrit dans professeur.json, onglets Bilan, Évaluation (niveaux, note, ceinture), Album, Pièces et réponses, Séance 2, Historique, Différenciation ; exports Excel, CSV, Carnet de classe ; feuilles ceinture.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · professeur : ${e.message.split('\n')[0]}`);
      }
    }
  } finally {
    await navigateur.close();
    serveur.kill();
  }
  noter('');
  noter('À faire à la main sur un poste du collège (voir RECETTE.md) : vraie webcam, voix française, dossier réseau.');
  fs.writeFileSync(path.join(RACINE, 'RECETTE-AUTO.md'), lignes.join('\n') + '\n');
  if (!ok) process.exitCode = 1;
})();
