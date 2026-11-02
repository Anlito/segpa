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
    let limiteBas = bas ? bas.getBoundingClientRect().top + 1 : h;
    let limiteHaut = haut ? haut.getBoundingClientRect().bottom - 1 : 0;
    // Milieu en panneau bordé (univers d'un projet, ex. la bande de piste de la voiture) : rien ne passe sous la bordure
    // ni ne sort du panneau.
    const milieu = document.querySelector('#app .milieu');
    const bordure = milieu && getComputedStyle(milieu, '::after');
    if (bordure && bordure.content !== 'none' && parseFloat(bordure.height) > 0) {
      const r = milieu.getBoundingClientRect();
      limiteBas = Math.min(limiteBas, r.bottom - parseFloat(bordure.height) + 1);
      limiteHaut = Math.max(limiteHaut, r.top - 1);
    }
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
  } else if (await visible(page, '[data-action="choisir-piece"]')) {
    // Atelier « Je dessine ma carrosserie » : une pièce décorée, puis toute la voiture.
    if (await visible(page, '.carte-piece-dessin.decoree')) await cliquer(page, '[data-action="voir-voiture"]');
    else await cliquer(page, '[data-action="choisir-piece"]');
  } else if (await visible(page, '.palette-tampons')) {
    await cliquer(page, '[data-action="stylo"][data-id="rouge"]');
    await cliquer(page, '[data-action="outil"][data-id="etoile"]');
    const b = await page.locator('.plan-de-travail svg').boundingBox();
    await page.mouse.click(b.x + b.width * 0.98, b.y + b.height * 0.5);
    await page.locator('.plan-de-travail .element').first().waitFor();
    // On fait glisser l'étoile (prise par le milieu) : elle reste dans la pièce.
    const e = await page.locator('.plan-de-travail .element').first().boundingBox();
    await page.mouse.move(e.x + e.width / 2, e.y + e.height / 2);
    await page.mouse.down();
    await page.mouse.move(e.x + e.width / 2 - 120, e.y + e.height / 2, { steps: 6 });
    await page.mouse.up();
    await page.locator('.plan-de-travail .element.choisi').waitFor();
    await cliquer(page, '[data-action="agrandir"]');
    // Le nom de la voiture (police à un trait), un trait au crayon, puis « Pareil à droite ».
    await cliquer(page, '[data-action="outil-nom"]');
    await page.mouse.click(b.x + b.width * 0.55, b.y + b.height * 0.5);
    await cliquer(page, '[data-action="outil-crayon"]');
    const c = await page.locator('.plan-de-travail svg').boundingBox();
    await page.mouse.move(c.x + c.width * 0.3, c.y + c.height * 0.75);
    await page.mouse.down();
    for (let i = 0; i <= 20; i++) await page.mouse.move(c.x + c.width * (0.3 + i * 0.02), c.y + c.height * (0.75 + 0.05 * Math.sin(i / 2)));
    await page.mouse.up();
    await page.waitForTimeout(150);
    if (await visible(page, '[data-action="miroir"]:not([disabled])')) await cliquer(page, '[data-action="miroir"]');
    await sansDefilement(page, nom + '-atelier');
    if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '-atelier.png') });
    await cliquer(page, '[data-action="piece-finie"]');
  } else if (await visible(page, '[data-action="choisir-roues"]')) {
    // Essais de la voiture (séance 4) : un écran par geste.
    await cliquer(page, '[data-action="choisir-roues"]');
    await cliquer(page, '[data-action="roues-choisies"]');
  } else if (await visible(page, '[data-action="pompe-plus"]')) {
    for (let i = 0; i < 3; i++) await cliquer(page, '[data-action="pompe-plus"]');
    await cliquer(page, '[data-action="essai-pompe"]');
  } else if (await visible(page, '[data-action="choisir-direction"]')) {
    await cliquer(page, '[data-action="choisir-direction"]');
    await cliquer(page, '[data-action="direction-choisie"]');
  } else if (await visible(page, '[data-action="voir-graphique"]')) {
    await cliquer(page, '[data-action="voir-graphique"]');
  } else if (await visible(page, '[data-action="choisir-changement"]')) {
    // Deux cartes : message ambre « Choisis un seul changement », puis le détail du premier.
    const cartes = page.locator('[data-action="choisir-changement"]');
    await cartes.nth(0).click();
    await cartes.nth(1).click();
    await page.locator('.msg-ambre').waitFor();
    await sansDefilement(page, nom + '-deux');
    if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '-deux.png') });
    if (await visible(page, '[data-action="choisir-cote"]')) await page.locator('[data-action="choisir-cote"]').nth(1).click();
    await cliquer(page, '[data-action="choisir-detail"]');
    await cliquer(page, '[data-action="change-fait"]');
  } else if (await visible(page, '.pave')) {
    // Démonstration : une première mesure hors de la plage (message ambre), puis la bonne.
    const premiere = demo && !(await visible(page, '.msg-ambre'));
    // Sans démonstration : le modèle de Thomas (corps : hauteur, largeur, longueur ; manivelle) → une mesure dans la plage.
    const ligne = await page.locator('.ligne-mesure').textContent();
    const manivelle = /manivelle/.test(await page.locator('.pastille').first().textContent());
    const juste = demo ? '7,5' : /Hauteur/.test(ligne) ? '9' : /Largeur/.test(ligne) ? '4,5' : manivelle ? '5' : '5,5';
    for (const c of premiere ? ['9', ',', '5'] : juste.split('')) await cliquer(page, `[data-c="${c}"]`);
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
    const suite = ['suivant-page', 'devissee', 'rangee', 'sortie', 'mesure-suivant', 'dessinee', 'fleche-faite', 'remise', 'fait', 'essai-place', 'essai-parti', 'essais-finis', 'resultat-suivant', 'dessin-fini'];
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

// Voiture à ballon (jalons V1 et V2) : séances 1 à 4, Ma mission à 5 séances, dépannage « Ma voiture ne roule pas »,
// essais (un changement à la fois, message ambre si deux cartes, graphique).
async function scenarioVoiture(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'voiture-ballon/index.html?enseignant=1');
  await sansDefilement(page, 'voiture-accueil');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'voiture-accueil.png') });
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  await cliquer(page, '[data-action="valider"]');
  assert.equal(await page.locator('.carte-seance').count(), 6);
  await sansDefilement(page, 'voiture-mission');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'voiture-mission.png') });
  const ecrans = [];
  for (const s of ['s1', 's2', 'sd', 's3']) {
    await cliquer(page, '[data-action="continuer"]');
    ecrans.push(await faireSeance(page, 'voiture-' + s, captures));
    if (s === 's1') {
      // Une équipe allée trop vite : « Retour » depuis Bravo ramène à la dernière étape, déjà cochée.
      await cliquer(page, '[data-action="derniere-etape"]');
      assert.match(await page.locator('.consigne-texte').first().textContent(), /Je range/);
      await cliquer(page, '[data-action="fait"]');
      await page.locator('[data-action="fini"]').waitFor();
    }
    await cliquer(page, '[data-action="fini"]');
    await page.locator('.carte-seance').first().waitFor();
  }
  assert.equal(await page.locator('.carte-seance.fait').count(), 4);
  const dessin = await page.evaluate(() => Segpa.dessin.nombreElements(Segpa.valeurEtape(Segpa.app.etat.session.donnees, 'sd', 'dessin')));
  assert.ok(dessin >= 4, `étoile, nom, crayon et leur copie de l'autre côté (${dessin})`);
  assert.ok(await page.evaluate(() => Segpa.valeurEtape(Segpa.app.etat.session.donnees, 'sd', 'dessin').pieces['cote-gauche'].every((e) => e.couleur === 'rouge')), 'tout est au stylo rouge');
  assert.ok(await page.evaluate(() => (Segpa.valeurEtape(Segpa.app.etat.session.donnees, 'sd', 'dessin').pieces['cote-droit'] || []).some((e) => e.type === 'texte')), 'le nom copié sur le côté droit');
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
  // Séance 4 : les essais (3 essais, un changement à la fois, graphique).
  await cliquer(page, '[data-action="mission"]');
  await page.locator('.carte-seance').first().waitFor();
  await cliquer(page, '[data-action="continuer"]');
  ecrans.push(await faireSeance(page, 'voiture-s4', captures));
  await cliquer(page, '[data-action="fini"]');
  await page.locator('.carte-seance').first().waitFor();
  assert.equal(await page.locator('.carte-seance.fait').count(), 5);
  const r = await page.evaluate(() => Segpa.resumeEssais(Segpa.valeurEtape(Segpa.app.etat.session.donnees, 's4', 'essais')));
  assert.equal(r.nombre, 2, '2 essais, puis « Ma voiture est prête »');
  assert.equal(r.changements.length, 1);
  // Séance 5 : prête, règles, attente, mon résultat (démonstration), réponse écrite, bilan, photo finale.
  await cliquer(page, '[data-action="continuer"]');
  ecrans.push(await faireSeance(page, 'voiture-s5', captures));
  await cliquer(page, '[data-action="fini"]');
  await page.locator('.carte-seance').first().waitFor();
  assert.equal(await page.locator('.carte-seance.fait').count(), 6);
  const s5 = await page.evaluate(() => ({ r: Segpa.valeurEtape(Segpa.app.etat.session.donnees, 's5', 'resultat'), q: Segpa.valeurEtape(Segpa.app.etat.session.donnees, 's5', 'pourquoi') }));
  assert.equal(s5.r.resultat.course, 'Finale secondaire');
  assert.ok(s5.q.texte.length > 0, 'réponse écrite gardée');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
  return ecrans;
}

// Film en stop motion (jalon M1) : Ma mission à 5 séances, séance 3 jusqu'au tournage, 5 images (bouton et barre
// d'espace), « Enlever la dernière » (Non puis Oui), « Voir », calque et grille, pause café, « J'arrête pour
// aujourd'hui » ; la séance 4 reprend le même film.
async function tourner(page, nom, captures, n) {
  await page.waitForFunction(() => document.querySelector('.ecran-cinema video') && document.querySelector('.ecran-cinema video').videoWidth > 0, null, { timeout: 10000 });
  await sansDefilement(page, nom);
  for (let i = 0; i < n; i++) {
    const avant = await page.evaluate(() => Segpa.filmDe(Segpa.app.etat.session.donnees).images.length);
    if (i % 2) await page.keyboard.press('Space');
    else await cliquer(page, '[data-action="prendre"]');
    await page.waitForFunction((a) => Segpa.filmDe(Segpa.app.etat.session.donnees).images.length === a + 1 && !document.querySelector('[data-action="prendre"]').disabled, avant);
  }
  await page.waitForTimeout(200);
  await sansDefilement(page, nom + '-images');
  if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '.png') });
}

async function scenarioStopMotion(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'stop-motion/index.html?enseignant=1');
  await sansDefilement(page, 'sm-accueil');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm-accueil.png') });
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  await cliquer(page, '[data-action="valider"]');
  assert.equal(await page.locator('.carte-seance').count(), 5);
  await sansDefilement(page, 'sm-mission');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm-mission.png') });
  await cliquer(page, '[data-action="seance"][data-id="s3"]');
  await page.locator('.trois-temps').waitFor();
  await sansDefilement(page, 'sm-s3-relire');
  await cliquer(page, '[data-action="fait"]');
  for (let i = 0; i < 3; i++) {
    await sansDefilement(page, 'sm-s3-rappel-' + (i + 1));
    if (captures && !i) await page.screenshot({ path: path.join(SORTIE, 'sm-s3-rappel.png') });
    await cliquer(page, '[data-action="fait"]');
  }
  assert.equal(await page.locator('[data-action="enlever"]').isDisabled(), true, 'pas d’image : rien à enlever');
  assert.equal(await page.locator('[data-action="voir"]').isDisabled(), true);
  assert.equal(await page.locator('.calque-image').isHidden(), true);
  await tourner(page, 'sm-tournage', captures, 5);
  assert.equal(await page.locator('.compteur-film strong').textContent(), 'Image 5 / 30');
  assert.equal(await page.locator('.pellicule img').count(), 5);
  assert.equal(await page.locator('.calque-image').isVisible(), true, 'le calque montre la dernière image');
  // Enlever la dernière : « Non » garde l'image, « Oui » l'enlève.
  await cliquer(page, '[data-action="enlever"]');
  await page.locator('.question-image img').waitFor();
  await sansDefilement(page, 'sm-enlever');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm-enlever.png') });
  // Pendant la question, la barre d'espace touche « Non, je la garde » (le bouton qui a la main) : rien n'est perdu.
  await page.keyboard.press('Space');
  await page.locator('.question-image').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.compteur-film strong').textContent(), 'Image 5 / 30', 'ni photo ni image enlevée');
  await cliquer(page, '[data-action="enlever"]');
  await cliquer(page, '[data-action="oui-enlever"]');
  await page.waitForFunction(() => document.querySelector('.compteur-film strong').textContent === 'Image 4 / 30');
  // Voir : les dernières images en boucle, puis Stop.
  await cliquer(page, '[data-action="voir"]');
  await page.locator('.lecture-film img[src]').waitFor();
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm-voir.png') });
  await cliquer(page, '[data-action="voir"]');
  assert.equal(await page.locator('.lecture-film').count(), 0);
  // Calque et grille se coupent et se remettent.
  await cliquer(page, '[data-action="calque"]');
  assert.equal(await page.locator('.calque-image').isHidden(), true);
  await cliquer(page, '[data-action="calque"]');
  await cliquer(page, '[data-action="grille"]');
  assert.equal(await page.locator('.grille-tiers').isHidden(), true);
  await cliquer(page, '[data-action="grille"]');
  // Pause café : écran noir ; la barre d'espace touche « Je reviens » (elle ne prend pas de photo).
  await cliquer(page, '[data-action="pause"]');
  await sansDefilement(page, 'sm-pause');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm-pause.png') });
  await page.keyboard.press('Space');
  await page.locator('.pause-cafe').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.compteur-film strong').textContent(), 'Image 4 / 30');
  await cliquer(page, '[data-action="fin"]');
  await faireSeance(page, 'sm-s3-fin', false);
  await cliquer(page, '[data-action="fini"]');
  // Séance 4 : le même film continue.
  await cliquer(page, '[data-action="seance"][data-id="s4"]');
  for (let i = 0; i < 4; i++) await cliquer(page, '[data-action="fait"]');
  await page.locator('.compteur-film strong', { hasText: 'Image 4 / 30' }).waitFor();
  await tourner(page, 'sm-s4-tournage', false, 2);
  const film = await page.evaluate(() => Segpa.filmDe(Segpa.app.etat.session.donnees).images.map((i) => i.fichier));
  assert.deepEqual(film, ['0001', '0002', '0003', '0004', '0006', '0007'].map((n) => `photos/film/${n}.jpg`), 'l’image enlevée garde son numéro (rien n’est écrasé)');
  assert.equal(await page.evaluate(() => Segpa.app.etat.session.donnees.photos.length), 0, 'les images du film ne vont pas dans l’album');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Stop motion avec un dossier de classe (simulé en mémoire) : les images sont des fichiers JPEG dans
// Prénom_Prénom/photos/film/, jamais dans le .json.
async function scenarioStopMotionDossier(navigateur, base) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  const classe = Buffer.from(JSON.stringify({ classe: '6A', eleves: ['Léa', 'Tom', 'Ines', 'Noah'] })).toString('base64');
  await injecterDossier(page, { kind: 'directory', name: 'Stop-motion', children: [{ kind: 'file', name: 'classe.json', data: classe }] });
  await page.addInitScript(() =>
    document.addEventListener('DOMContentLoaded', () => {
      window.Segpa.fichiers.memoriser = async () => {};
      window.Segpa.fichiers.memorise = async () => null;
    })
  );
  await page.goto(base + 'stop-motion/index.html');
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-action="ouvrir"]');
  await cliquer(page, '[data-prenom="Ines"]');
  await cliquer(page, '[data-prenom="Noah"]');
  await cliquer(page, '[data-action="valider"]');
  await cliquer(page, '[data-action="seance"][data-id="s3"]');
  for (let i = 0; i < 4; i++) await cliquer(page, '[data-action="fait"]');
  await tourner(page, 'sm-dossier', false, 3);
  await cliquer(page, '[data-action="enlever"]');
  await cliquer(page, '[data-action="oui-enlever"]');
  await cliquer(page, '[data-action="fin"]');
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const eq = window.__arbre.children.find((c) => c.name === 'Ines_Noah');
    const json = eq.children.find((c) => c.name === 'Ines_Noah.json');
    const film = eq.children.find((c) => c.name === 'photos').children.find((c) => c.name === 'film');
    return { json: new TextDecoder().decode(Uint8Array.from(atob(json.data), (c) => c.charCodeAt(0))), images: film.children.map((c) => [c.name, atob(c.data).slice(0, 3).split('').map((x) => x.charCodeAt(0))]) };
  });
  assert.deepEqual(r.images.map((i) => i[0]), ['0001.jpg', '0002.jpg', '0003.jpg'], 'les 3 fichiers restent (l’image enlevée n’est pas effacée)');
  for (const [, debut] of r.images) assert.deepEqual(debut, [0xff, 0xd8, 0xff], 'JPEG');
  const d = JSON.parse(r.json);
  assert.deepEqual(d.film.images.map((i) => i.fichier), ['photos/film/0001.jpg', 'photos/film/0002.jpg']);
  assert.ok(!r.json.includes('data:image'), 'aucune image dans le .json');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Stop motion, séance 5 (jalon M2) : un film de 16 images tourné en séance 3, puis titre écrit au clavier, vitesse,
// 2 images ratées enlevées (une remise), le film avec son titre et son générique, cinéma, bilan.
async function scenarioStopMotionMontage(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'stop-motion/index.html?enseignant=1');
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  await cliquer(page, '[data-action="valider"]');
  await cliquer(page, '[data-action="seance"][data-id="s3"]');
  for (let i = 0; i < 4; i++) await cliquer(page, '[data-action="fait"]');
  await tourner(page, 'sm5-tournage', false, 16);
  await cliquer(page, '[data-action="mission"]');
  await cliquer(page, '[data-action="seance"][data-id="s5"]');
  // Le titre : une carte-idée, puis « J'écris un titre ».
  await sansDefilement(page, 'sm5-titre');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm5-titre.png') });
  assert.equal(await page.locator('[data-action="garder"]').isDisabled(), true);
  await cliquer(page, '[data-action="choisir"]');
  assert.equal(await page.locator('[data-action="garder"]').isDisabled(), false);
  await cliquer(page, '[data-action="ecrire"]');
  await page.keyboard.type('Le dragon perdu dans la forêt');
  await sansDefilement(page, 'sm5-titre-ecrit');
  assert.equal(await page.locator('.carte-titre-apercu strong').textContent(), 'Le dragon perdu dans la forêt');
  await cliquer(page, '[data-action="garder"]');
  // La vitesse : le film tourne en boucle, « Lent » est gardé.
  await page.locator('.lecteur[data-plan="image"]').waitFor();
  await sansDefilement(page, 'sm5-vitesse');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm5-vitesse.png') });
  await cliquer(page, '[data-action="vitesse"][data-v="lent"]');
  assert.match(await page.locator('.infos-film').textContent(), /16 images · 10 secondes/);
  await cliquer(page, '[data-action="fait"]');
  // Les images ratées : 2 enlevées, une remise ; 2 pages.
  await page.locator('.vignette-tri img[src]').first().waitFor();
  await cliquer(page, '[data-action="basculer"][data-i="2"]');
  await cliquer(page, '[data-action="basculer"][data-i="5"]');
  await cliquer(page, '[data-action="basculer"][data-i="7"]');
  await cliquer(page, '[data-action="basculer"][data-i="7"]');
  assert.equal(await page.locator('.compte-tri').textContent(), '14 images gardées');
  await sansDefilement(page, 'sm5-tri');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm5-tri.png') });
  await cliquer(page, '[data-action="page"]');
  assert.equal(await page.locator('.vignette-tri').count(), 1);
  await cliquer(page, '[data-action="fait"]');
  // Le film fini : carte-titre, images, générique.
  await page.locator('.lecteur[data-plan="titre"] .lecteur-texte', { hasText: 'Le dragon perdu dans la forêt' }).waitFor();
  await sansDefilement(page, 'sm5-film');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm5-film.png') });
  await page.locator('.lecteur[data-plan="generique"] .lecteur-texte', { hasText: 'Un film de Léa et Tom' }).waitFor({ timeout: 15000 });
  await page.locator('[data-action="lecture"]', { hasText: 'Revoir' }).waitFor({ timeout: 6000 });
  await cliquer(page, '[data-action="fait"]');
  await cliquer(page, '[data-action="fait"]'); // séance cinéma
  for (const q of await page.locator('.question-bilan').all()) await q.locator('.visage').first().click();
  await sansDefilement(page, 'sm5-bilan');
  await cliquer(page, '[data-action="fait"]');
  await page.locator('[data-action="fini"]').waitFor();
  const f = await page.evaluate(() => Segpa.filmDe(Segpa.app.etat.session.donnees));
  assert.equal(f.titre, 'Le dragon perdu dans la forêt');
  assert.equal(f.vitesse, 'lent');
  assert.deepEqual(f.images.map((im, i) => (im.enlevee ? i : -1)).filter((i) => i >= 0), [2, 5]);
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Séance cinéma (cinema.html) : le dossier Stop-motion (simulé) avec 2 films et une équipe sans image ; le programme,
// la projection (titre, images, générique, applaudissements), Pause, vitesse, film suivant, « Bravo à tous ».
async function scenarioCinema(navigateur, base, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  const jpeg = require('./photo-fictive.js').toString('base64');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
  const equipe = (eleves, film) => {
    const nom = eleves.join('_');
    const d = { application: 'segpa', projet: 'stop-motion', formatVersion: 1, equipe: { eleves, classe: '6A' }, seances: {}, photos: [], aides: [], modifieLe: '2026-11-20T10:00:00.000Z' };
    if (film) d.film = film;
    const images = film ? film.images.map((im) => ({ kind: 'file', name: im.fichier.split('/').pop(), data: jpeg })) : [];
    return { kind: 'directory', name: nom, children: [{ kind: 'file', name: nom + '.json', data: b64(d) }].concat(images.length ? [{ kind: 'directory', name: 'photos', children: [{ kind: 'directory', name: 'film', children: images }] }] : []) };
  };
  const images = (n) => Array.from({ length: n }, (_, i) => ({ fichier: `photos/film/${String(i + 1).padStart(4, '0')}.jpg`, date: '2026-11-20T10:00:00.000Z' }));
  await injecterDossier(page, {
    kind: 'directory',
    name: 'Stop-motion',
    children: [
      { kind: 'file', name: 'classe.json', data: b64({ classe: '6A', eleves: ['Léa', 'Tom', 'Inès', 'Noah', 'Jade', 'Sami'] }) },
      equipe(['Léa', 'Tom'], { images: images(12), vitesse: 'rapide', titre: 'La course folle' }),
      equipe(['Inès', 'Noah'], { images: images(8), vitesse: 'normal' }),
      equipe(['Jade', 'Sami'], null),
    ],
  });
  await page.goto(base + 'stop-motion/cinema.html');
  await sansDefilement(page, 'cinema-accueil');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.carte-programme').first().waitFor();
  assert.equal(await page.locator('.carte-programme').count(), 3);
  assert.equal(await page.locator('.carte-programme[aria-pressed="true"]').count(), 2, 'l’équipe sans image n’est pas au programme');
  assert.match(await page.locator('.carte-programme', { hasText: 'Inès et Noah' }).textContent(), /Mon film[\s\S]*8 images/, 'sans titre : « Mon film »');
  await sansDefilement(page, 'cinema-programme');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'cinema-programme.png') });
  await cliquer(page, '[data-action="lancer"]');
  // Film 1 (Inès et Noah, sans titre) : pause à la barre d'espace, film suivant.
  await page.locator('.lecteur[data-plan="titre"] .lecteur-texte', { hasText: 'Mon film' }).waitFor();
  await page.keyboard.press('Space');
  await page.locator('[data-action="lecture"]', { hasText: 'Lecture' }).waitFor();
  await page.keyboard.press('Space');
  await page.locator('[data-action="lecture"]', { hasText: 'Pause' }).waitFor();
  await cliquer(page, '[data-action="suivant"]');
  // Film 2 (Léa et Tom) : sa vitesse, ses images, son générique, les applaudissements.
  assert.equal(await page.locator('.numero-film').textContent(), 'Film 2 sur 2');
  await page.locator('.lecteur[data-plan="titre"] .lecteur-texte', { hasText: 'La course folle' }).waitFor();
  assert.equal(await page.locator('[data-action="vitesse"][data-v="rapide"]').getAttribute('aria-pressed'), 'true', 'la vitesse choisie par l’équipe');
  await page.locator('.lecteur[data-plan="image"] .lecteur-image[src^="blob:"]').waitFor({ timeout: 6000 });
  await sansDefilement(page, 'cinema-projection');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'cinema-projection.png') });
  await page.locator('.lecteur[data-plan="generique"] .lecteur-texte', { hasText: 'Un film de Léa et Tom' }).waitFor({ timeout: 8000 });
  await page.locator('.entracte:not([hidden])').waitFor({ timeout: 6000 });
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'cinema-entracte.png') });
  await page.keyboard.press('ArrowRight');
  await page.locator('.palmares li').first().waitFor();
  assert.equal(await page.locator('.palmares li').count(), 2);
  await sansDefilement(page, 'cinema-fin');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Stop motion, séances 1 et 2 (jalon M3) : règles, héros (carte), lieu (carte), problème écrit au clavier, fin (carte),
// le scénario en 7 questions (héros, lieu, action, problème, solution, fin, objets), le titre, le récap ; puis la plaque, le décor, le héros et les objets (avec le
// rappel de l'histoire et une photo chacun), « Je secoue la table », le rangement. Le titre est repris en séance 5.
async function scenarioStopMotionHistoire(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'stop-motion/index.html?enseignant=1');
  await cliquer(page, '[data-action="commencer"]');
  await cliquer(page, '[data-prenom="Léa"]');
  await cliquer(page, '[data-prenom="Tom"]');
  await cliquer(page, '[data-action="valider"]');
  await cliquer(page, '[data-action="continuer"]');
  for (let i = 0; i < 3; i++) {
    await sansDefilement(page, 'sm1-regle-' + (i + 1));
    await cliquer(page, '[data-action="fait"]');
  }
  const carte = async (nom, n) => {
    await page.locator('[data-action="choisir"]').first().waitFor();
    await sansDefilement(page, nom);
    if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '.png') });
    await page.locator('[data-action="choisir"]').nth(n).click();
    await cliquer(page, '[data-action="garder"]');
  };
  await carte('sm1-heros', 0);
  await carte('sm1-lieu', 1);
  await carte('sm1-action', 0);
  await page.locator('[data-action="choisir"]').first().waitFor();
  await cliquer(page, '[data-action="ecrire"]');
  await page.keyboard.type('Un volcan se réveille');
  await sansDefilement(page, 'sm1-probleme-ecrit');
  await page.keyboard.press('Enter');
  await carte('sm1-solution', 0);
  await carte('sm1-fin', 0);
  // Les objets : plusieurs cartes (3 au plus), une touchée deux fois est enlevée.
  await page.locator('[data-action="choisir"]').first().waitFor();
  await sansDefilement(page, 'sm1-objets');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm1-objets.png') });
  for (const n of [0, 1, 2, 1, 3]) await page.locator('[data-action="choisir"]').nth(n).click();
  assert.equal(await page.locator('[data-action="choisir"][aria-pressed="true"]').count(), 3);
  await page.locator('[data-action="choisir"]').nth(4).click();
  assert.equal(await page.locator('[data-action="choisir"][aria-pressed="true"]').count(), 3, '3 cartes au plus');
  await cliquer(page, '[data-action="garder"]');
  await carte('sm1-titre', 0);
  // Le récap : le titre, les 3 temps, les objets.
  await page.locator('.trois-temps').waitFor();
  assert.equal(await page.locator('.titre-recap').textContent(), 'Le dragon perdu');
  assert.deepEqual(await page.locator('.temps p').allTextContents(), ['Un dragon, sur la Lune, dort tranquillement.', 'Un volcan se réveille. Un ami vient aider.', 'C\'est la fête !']);
  assert.equal(await page.locator('.objets-recap').textContent(), 'Mes objets : une maison, une voiture, une fusée');
  await sansDefilement(page, 'sm1-recap');
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'sm1-recap.png') });
  await cliquer(page, '[data-action="fait"]');
  await page.locator('[data-action="fini"]').waitFor();
  await cliquer(page, '[data-action="fini"]');
  // Séance 2.
  await cliquer(page, '[data-action="continuer"]');
  const rappels = [];
  for (let n = 0; n < 30 && !(await visible(page, '[data-action="fini"]')); n++) {
    await page.waitForTimeout(100);
    if (await visible(page, '.ligne')) {
      await sansDefilement(page, 'sm2-rangement');
      for (const l of await page.locator('.ligne').all()) await l.click();
      await cliquer(page, '[data-action="fait"]');
    } else if (await visible(page, '.zone-camera')) {
      await page.locator('[data-action="prendre"]').waitFor({ timeout: 10000 });
      await page.waitForFunction(() => document.querySelector('.zone-camera video') && document.querySelector('.zone-camera video').videoWidth > 0);
      await cliquer(page, '[data-action="prendre"]');
      await cliquer(page, '[data-action="garder"]');
    } else {
      const p = page.locator('.consigne .pastille');
      if (await p.count()) rappels.push(await p.textContent());
      await sansDefilement(page, 'sm2-' + n);
      if (captures && n === 3) await page.screenshot({ path: path.join(SORTIE, 'sm2-construire.png') });
      await cliquer(page, '[data-action="fait"]');
    }
  }
  assert.ok(rappels.includes('Mon lieu : sur la Lune') && rappels.includes('Mon héros : Un dragon') && rappels.includes('Mes objets : une maison, une voiture, une fusée'), JSON.stringify(rappels));
  const d = await page.evaluate(() => Segpa.app.etat.session.donnees);
  assert.equal(d.film.titre, 'Le dragon perdu');
  assert.deepEqual(d.photos.map((p) => p.legende), ['Mon décor', 'Mon héros', 'Mes objets']);
  assert.ok(d.seances.s2.etapes.plaque.fait, 'plaque prise');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Outil professeur de la voiture : 4 équipes fictives (essais, course, matériel), piste proposée, onglets Essais et
// Voiture et course, évaluation à 7 critères avec repères, exports.
async function scenarioProfesseurVoiture(navigateur, base) {
  require('./exemples-voiture.js');
  const tree = arbre(path.join(RACINE, 'exemples', 'Voiture-ballon'));
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  await injecterDossier(page, tree);
  await page.goto(base + 'voiture-ballon/prof.html');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.pt').first().waitFor();
  assert.equal(await page.locator('.pt').count(), 4);
  assert.match(await page.locator('.pt').first().textContent(), /Léa · Tom/, 'aide en premier');
  const tuile = (noms) => page.locator('.pt', { hasText: noms }).textContent();
  assert.match(await tuile('Léa · Tom'), /Turbo Ballon · Bleu/);
  assert.match(await tuile('Léa · Tom'), /Essais : 2 · meilleur 280 cm · 1 changement/);
  assert.match(await tuile('Inès · Noah'), /Matériel : Piques 1\/2/);
  assert.match(await tuile('Inès · Noah'), /Matériel pris différent du kit/);
  assert.match(await tuile('Inès · Noah'), /Course : 2e · Finale principale/);
  assert.match(await tuile('Adam · Jade'), /Voiture qui n’avance pas/);
  assert.match(await page.locator('.pc-piste').textContent(), /Tous les patrons \(\.zip, 2 équipes\)/);
  assert.match(await tuile('Inès · Noah'), /Carrosserie : 3 dessins ✓/);
  const [zipDl] = await Promise.all([page.waitForEvent('download'), cliquer(page, '.pc-piste [data-telecharger]')]);
  assert.equal(zipDl.suggestedFilename(), 'carrosseries-6A.zip');
  assert.equal(fs.readFileSync(await zipDl.path()).slice(0, 2).toString(), 'PK');
  assert.match(await page.locator('.pc-piste').textContent(), /longueur proposée 1,5 m \(3 voitures sur 3/);
  await page.screenshot({ path: path.join(SORTIE, 'prof-voiture-classe.png'), fullPage: true });
  await page.locator('.pt', { hasText: 'Inès · Noah' }).click();
  await page.locator('.pe-onglets').waitFor();
  await cliquer(page, '[data-action="onglet"][data-id="essais"]');
  assert.match(await page.locator('.pe-contenu').textContent(), /Essai 3.*420 cm \(le plus loin\)/s);
  assert.equal(await page.locator('.pp-barre').count(), 3);
  await page.screenshot({ path: path.join(SORTIE, 'prof-voiture-essais.png'), fullPage: true });
  await cliquer(page, '[data-action="onglet"][data-id="voiture"]');
  assert.match(await page.locator('.pe-contenu').textContent(), /L’air sort du ballon/);
  // Carrosserie décorée : aperçu, stylos, SVG à télécharger (calques découpe, plis, un par stylo).
  await cliquer(page, '[data-action="onglet"][data-id="carrosserie"]');
  assert.match(await page.locator('.pe-contenu').textContent(), /3 dessins · finie/);
  const [svgDl] = await Promise.all([page.waitForEvent('download'), cliquer(page, '.pe-contenu [data-telecharger]')]);
  assert.equal(svgDl.suggestedFilename(), 'carrosserie-Ines_Noah.svg');
  const svgTexte = fs.readFileSync(await svgDl.path(), 'utf8');
  assert.deepEqual([...svgTexte.matchAll(/<g id="([^"]+)"/g)].map((m) => m[1]), ['decoupe', 'plis', 'dessin-bleu', 'dessin-rouge']);
  await page.screenshot({ path: path.join(SORTIE, 'prof-voiture-carrosserie.png'), fullPage: true });
  await cliquer(page, '[data-action="onglet"][data-id="evaluation"]');
  assert.match(await page.locator('.ev-table').textContent(), /Distances saisies \(pavé en cm\) : 310 cm · 390 cm · 420 cm/);
  for (const c of ['fabrication', 'regles', 'fonctionne', 'essais', 'mesure', 'explique', 'autonomie']) {
    const bouton = `.niv-btn[data-eleve="Inès"][data-critere="${c}"][data-n="3"]`;
    await cliquer(page, bouton);
    await page.locator(`${bouton}[aria-pressed="true"]`).waitFor();
  }
  await page.waitForFunction(() => /20 \/ 20|20,0|\b20\b/.test(document.querySelector('.ev-bilans').textContent));
  assert.match(await page.locator('.ev-bilans').textContent(), /Ceinture vert foncé/);
  await page.screenshot({ path: path.join(SORTIE, 'prof-voiture-evaluation.png'), fullPage: true });
  await page.keyboard.press('Escape');
  const [d] = await Promise.all([page.waitForEvent('download'), cliquer(page, '[data-action="excel"]')]);
  assert.match(d.suggestedFilename(), /^voiture-ballon-6A-\d{4}-\d{2}-\d{2}-evaluation\.xlsx$/);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'pas de défilement horizontal');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Outil professeur du stop motion (jalon M4) : 4 équipes fictives (npm run exemples), aide en premier, tuiles (titre,
// scénario, plaque, film), alertes (pas d'image à mi-séance, plaque pas rangée), bandeau des films et lien cinéma,
// onglets Scénario et Film (lecteur, toutes les images), évaluation à 7 critères avec repères et ceinture, Excel.
async function scenarioProfesseurStopMotion(navigateur, base) {
  require('./exemples-stop-motion.js');
  const tree = arbre(path.join(RACINE, 'exemples', 'Stop-motion'));
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  await injecterDossier(page, tree);
  await page.goto(base + 'stop-motion/prof.html');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.pt').first().waitFor();
  assert.equal(await page.locator('.pt').count(), 4);
  assert.match(await page.locator('.pt').first().textContent(), /Léa · Tom/, 'aide en premier');
  const tuile = (noms) => page.locator('.pt', { hasText: noms }).textContent();
  assert.match(await tuile('Léa · Tom'), /« Le dragon perdu »[\s\S]*Scénario : 7 \/ 7 ✓/);
  assert.match(await tuile('Léa · Tom'), /Pas encore d’image dans cette séance/);
  assert.match(await tuile('Emma · Sami'), /Plaque prise, rangement pas fait/);
  assert.match(await tuile('Adam · Jade'), /Film : 18 \/ 30 images · normal/);
  assert.match(await tuile('Adam · Jade'), /Histoire : Un chat, à la plage…/);
  assert.match(await tuile('Adam · Jade'), /Scénario : 7 \/ 7 ✓ · avis à donner/);
  assert.match(await tuile('Inès · Noah'), /Film : 35 \/ 30 images ✓ \(1 enlevée\) · lent[\s\S]*Film monté ✓/);
  assert.match(await page.locator('.pc-piste').textContent(), /1 avec 30 images ou plus · 2 commencés sur 4/);
  assert.equal(await page.locator('.pc-piste a[href="cinema.html"]').count(), 1);
  await page.screenshot({ path: path.join(SORTIE, 'prof-sm-classe.png'), fullPage: true });
  await page.locator('.pt', { hasText: 'Inès · Noah' }).click();
  await page.locator('.pe-onglets').waitFor();
  await cliquer(page, '[data-action="onglet"][data-id="scenario"]');
  assert.match(await page.locator('.pe-contenu').textContent(), /Un robot, en ville, joue au ballon\.[\s\S]*C'est la panne ! Une machine répare tout\./);
  // Avis du professeur : « À revoir » avec un mot, écrit dans professeur.json et dans le dossier de l'équipe.
  assert.match(await page.locator('.pp-avis').textContent(), /Scénario fini : à toi de donner ton avis/);
  assert.equal(await page.locator('[data-action="avis-envoyer"]').isDisabled(), true, 'il faut choisir un avis');
  await cliquer(page, '[data-action="avis-choisir"][data-avis="revoir"]');
  await page.locator('[data-avis-mot]').fill('Bonne idée ! Ajoute un ami pour aider le robot.');
  await cliquer(page, '[data-action="avis-envoyer"]');
  await page.locator('.pp-avis', { hasText: 'pas encore vu par l’équipe' }).waitFor();
  const ecrit = await page.evaluate(() => {
    const lire = (c) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(c.data), (x) => x.charCodeAt(0))));
    const prof = lire(window.__arbre.children.find((c) => c.name === 'professeur.json'));
    const eq = window.__arbre.children.find((c) => c.name === 'Inès_Noah');
    return { prof: prof.notes['Inès_Noah'].scenario, equipe: lire(eq.children.find((c) => c.name === 'avis-professeur.json')) };
  });
  assert.equal(ecrit.prof.avis, 'revoir');
  assert.equal(ecrit.equipe.type, 'avis');
  assert.equal(ecrit.equipe.scenario.mot, 'Bonne idée ! Ajoute un ami pour aider le robot.');
  await page.screenshot({ path: path.join(SORTIE, 'prof-sm-avis.png'), fullPage: true });
  assert.equal(await page.locator('.pe-resume', { hasText: 'Scénario : 7 / 7 ✓ · à revoir' }).count(), 1, 'le résumé de l’équipe montre l’avis');
  await cliquer(page, '[data-action="onglet"][data-id="film"]');
  await page.locator('.pp-lecteur[data-plan="titre"] .lecteur-texte', { hasText: 'Le robot qui danse' }).waitFor();
  assert.match(await page.locator('.pe-contenu h3').textContent(), /35 images gardées sur 36 · 9 s · vitesse lent/);
  assert.equal(await page.locator('.pp-pellicule figure').count(), 36);
  assert.equal(await page.locator('.pp-pellicule figure.enlevee').count(), 1);
  await page.waitForFunction(() => document.querySelectorAll('.pp-pellicule img[src^="blob:"]').length === 36);
  await cliquer(page, '[data-pp-lecture]');
  await page.locator('.pp-lecteur.joue').waitFor();
  await page.screenshot({ path: path.join(SORTIE, 'prof-sm-film.png'), fullPage: true });
  await cliquer(page, '[data-action="onglet"][data-id="evaluation"]');
  assert.match(await page.locator('.ev-table').textContent(), /Images prises : S3 20 · S4 16 · enlevées au montage : 1/);
  for (const c of ['scenario', 'regles', 'construction', 'methode', 'film', 'montage', 'autonomie']) {
    const bouton = `.niv-btn[data-eleve="Inès"][data-critere="${c}"][data-n="3"]`;
    await cliquer(page, bouton);
    await page.locator(`${bouton}[aria-pressed="true"]`).waitFor();
  }
  await page.waitForFunction(() => /Ceinture vert foncé/.test(document.querySelector('.ev-bilans').textContent));
  await page.screenshot({ path: path.join(SORTIE, 'prof-sm-evaluation.png'), fullPage: true });
  await page.keyboard.press('Escape');
  const [d] = await Promise.all([page.waitForEvent('download'), cliquer(page, '[data-action="excel"]')]);
  assert.match(d.suggestedFilename(), /^stop-motion-6A-\d{4}-\d{2}-\d{2}-evaluation\.xlsx$/);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'pas de défilement horizontal');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// Stop motion, avis du professeur vu par l'élève : l'équipe Adam et Jade reprend en séance 4 ; « Je relis mon histoire »
// montre l'avis « À revoir » et son mot, l'équipe change la fin, puis relit son histoire. Avis noté comme vu.
async function scenarioStopMotionAvis(navigateur, base) {
  require('./exemples-stop-motion.js');
  const tree = arbre(path.join(RACINE, 'exemples', 'Stop-motion'));
  const avis = { application: 'segpa', projet: 'stop-motion', type: 'avis', equipe: 'Adam_Jade', scenario: { avis: 'revoir', mot: 'Super ! Change la fin pour retrouver le trésor ensemble.', date: new Date(Date.now() - 60000).toISOString() } };
  tree.children.find((c) => c.name === 'Adam_Jade').children.push({ kind: 'file', name: 'avis-professeur.json', data: Buffer.from(JSON.stringify(avis)).toString('base64') });
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  await injecterDossier(page, tree);
  await page.addInitScript(() =>
    document.addEventListener('DOMContentLoaded', () => {
      window.Segpa.fichiers.memoriser = async () => {};
      window.Segpa.fichiers.memorise = async () => null;
    })
  );
  await page.goto(base + 'stop-motion/index.html');
  await cliquer(page, '[data-action="continuer"]');
  await cliquer(page, '[data-action="ouvrir"]');
  await page.locator('.equipe-bouton', { hasText: 'Adam · Jade' }).click();
  await cliquer(page, '[data-action="continuer"]');
  await page.locator('.avis-colonne.revoir').waitFor();
  assert.match(await page.locator('.avis-mot').textContent(), /Change la fin pour retrouver le trésor ensemble/);
  await sansDefilement(page, 'sm-avis');
  await page.screenshot({ path: path.join(SORTIE, 'sm-avis.png') });
  await cliquer(page, '[data-action="changer"]');
  await page.locator('.cartes-parties').waitFor();
  await sansDefilement(page, 'sm-avis-parties');
  await page.screenshot({ path: path.join(SORTIE, 'sm-avis-parties.png') });
  await cliquer(page, '[data-action="partie"][data-p="fin"]');
  await page.locator('[data-action="choisir"]', { hasText: 'Un nouvel ami arrive.' }).click();
  await cliquer(page, '[data-action="garder"]');
  await page.locator('.carte-partie[data-p="fin"]', { hasText: 'Un nouvel ami arrive.' }).waitFor();
  await cliquer(page, '[data-action="fini-parties"]');
  await page.locator('.trois-temps').waitFor();
  assert.equal(await page.locator('.temps p').nth(2).textContent(), 'Un nouvel ami arrive.');
  await cliquer(page, '[data-action="fait"]');
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => Segpa.app.etat.session.donnees);
  assert.equal(d.avisVu, avis.scenario.date, 'avis noté comme vu');
  assert.equal(d.histoire.fin, 'Un nouvel ami arrive.');
  assert.ok(d.histoireModifieeLe > avis.scenario.date, 'histoire changée après l’avis');
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
}

// La course au vidéoprojecteur (démonstration) : voitures (une absente), 3 couloirs, poules, chaque course au chrono
// (touches 1 à 3, une voiture qui n'arrive pas), finales par niveau, podiums, « Bravo à tous ».
async function scenarioCourse(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
  await page.goto(base + 'voiture-ballon/course.html');
  const ecran = async (nom) => {
    await page.waitForTimeout(120);
    await sansDefilement(page, 'course-' + nom);
    if (captures) await page.screenshot({ path: path.join(SORTIE, 'course-' + nom + '.png') });
  };
  await ecran('accueil');
  await cliquer(page, '[data-action="demo"]');
  await cliquer(page, '[data-action="absente"]');
  await cliquer(page, '[data-action="couloirs"][data-n="3"]');
  await ecran('voitures');
  await cliquer(page, '[data-action="poules"]');
  await ecran('poules');
  await cliquer(page, '[data-action="lancer-poules"]');
  let courses = 0;
  for (let tour = 0; tour < 30; tour++) {
    const etape = await page.evaluate(() => Segpa.course.etat().etape);
    if (etape === 'course') {
      courses++;
      await cliquer(page, '[data-action="top-depart"]');
      await page.waitForTimeout(250);
      const n = await page.locator('[data-action="arrivee"]').count();
      for (let i = 0; i < n - 1; i++) {
        await page.keyboard.press(String(i + 1));
        await page.waitForTimeout(150);
      }
      await page.locator('.distance input').first().fill('320');
      await cliquer(page, '[data-action="distance"]');
      await ecran('course-' + courses);
      await cliquer(page, '[data-action="course-suivante"]');
    } else if (etape === 'classement') {
      await ecran('finales');
      await cliquer(page, '[data-action="lancer-finales"]');
    } else if (etape === 'podium') {
      await ecran('podium-' + courses);
      await cliquer(page, '[data-action="apres-podium"]');
    } else if (etape === 'fin') break;
  }
  await ecran('fin');
  const e = await page.evaluate(() => Segpa.course.etat());
  assert.deepEqual(e.poules.map((p) => p.voitures.length), [3, 2, 2]);
  assert.deepEqual(e.finales.map((f) => f.nom), ['Finale principale', 'Finale secondaire', 'Finale tertiaire']);
  assert.equal(courses, 6, '3 poules + 3 finales');
  assert.ok(await page.locator('.record').count());
  assert.deepEqual(erreurs, []);
  assert.deepEqual(horsSite, []);
  await contexte.close();
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
  assert.ok(d.photos.some((p) => p.fichier === 'photos/s1-piece-01-01.jpg' && p.legende === 'Pièce 1 : Réceptacle à copeaux'), 'photo de la pièce 1 notée avec son nom');
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

// Faux dossier réseau (en mémoire) donné au navigateur à la place de la fenêtre « choisir un dossier ».
async function injecterDossier(page, tree) {
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
}

async function scenarioProfesseur(navigateur, base) {
  require('./exemples-equipes.js');
  const tree = arbre(path.join(RACINE, 'exemples', 'Taille-crayon'));
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, { width: 1366, height: 768 });
  await injecterDossier(page, tree);
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
  assert.match(await tuile('Léa · Tom'), /Pièces démontées : 6 sur 7/);
  assert.match(await tuile('Léa · Tom'), /Mesures : corps H 9 cm ✓, l 4,5 cm ✓, L 5,5 cm ✓/);
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
  assert.match(await page.locator('.pe-contenu').textContent(), /S1\s*Je démonte[\s\S]*écrans/);
  await cliquer(page, '[data-action="onglet"][data-id="album"]');
  await page.waitForFunction(() => document.querySelectorAll('.pp-photo img').length >= 7);
  await page.screenshot({ path: path.join(SORTIE, 'prof-album.png'), fullPage: true });
  await cliquer(page, '[data-action="onglet"][data-id="pieces"]');
  await page.waitForFunction(() => document.querySelectorAll('.pp-piece').length === 6);
  await cliquer(page, '[data-action="onglet"][data-id="seance2"]');
  assert.match(await page.locator('.pp-table').textContent(), /Hauteur9 cm1\s*✓ dans la plage8,5 cm à 9,5 cm/);
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
          const quoi = demo ? 'modèle de démonstration' : 'modèle de Thomas (Cat NO.722A)';
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
          noter(`- OK ${nomBase} ${t} · voiture à ballon : 6 séances de ${ecrans.join(', ')} écrans (nom, couleur, matériel, fabrication, atelier de dessin de la carrosserie, carrosserie, photo officielle, 2 essais avec un changement, « Ma voiture est prête » et graphique, résultat de la course, réponse écrite), Ma mission à 6 séances, dépannage vers la séance 2, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · voiture à ballon : ${e.message.split('\n')[0]}`);
        }
      }
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        try {
          await scenarioCourse(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · course au vidéoprojecteur (démonstration) : 7 voitures dont une absente retirée, 3 couloirs, poules de 3, 2 et 2, 6 courses au chrono (touches du clavier, une voiture qui n’arrive pas), finales principale, secondaire et tertiaire, podiums, record, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · course : ${e.message.split('\n')[0]}`);
        }
      }
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        try {
          await scenarioStopMotion(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · stop motion (jalon M1) : Ma mission à 5 séances, « Je relis mon histoire », 3 rappels, écran de tournage (5 images au bouton et à la barre d’espace, pellicule, compteur, calque, grille, « Enlever la dernière » avec confirmation, « Voir », pause café), séance 4 qui reprend le même film, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · stop motion : ${e.message.split('\n').slice(0, 4).join(' ')}`);
        }
      }
    for (const [nomBase, base] of bases) {
      try {
        await scenarioStopMotionDossier(navigateur, base);
        noter(`- OK ${nomBase} 1366×768 · stop motion avec dossier : images JPEG écrites dans Ines_Noah/photos/film/ (0001.jpg…), l’image enlevée reste dans le dossier, aucune image dans le .json.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · stop motion avec dossier : ${e.message.split('\n')[0]}`);
      }
    }
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        try {
          await scenarioStopMotionHistoire(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · stop motion, séances 1 et 2 (jalon M3) : 3 règles, le scénario en 7 questions (cartes-idées, problème écrit au clavier, 3 objets au plus), le titre, le récap (titre, 3 temps, objets) ; la plaque, décor, héros et objets avec le rappel de l’histoire et une photo chacun, la table secouée, le rangement, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · stop motion, séances 1 et 2 : ${e.message.split('\n').slice(0, 4).join(' ')}`);
        }
      }
    for (const [nomBase, base] of bases)
      for (const taille of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
        const t = `${taille.width}×${taille.height}`;
        try {
          await scenarioStopMotionMontage(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · stop motion, séance 5 (jalon M2) : titre (carte-idée puis écrit au clavier), vitesse « Lent » gardée, 2 images ratées enlevées (une autre enlevée puis remise), le film avec sa carte-titre et « Un film de Léa et Tom », cinéma, bilan, rien ne dépasse, aucune erreur.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · stop motion, séance 5 : ${e.message.split('\n').slice(0, 4).join(' ')}`);
        }
      }
    for (const [nomBase, base] of bases) {
      try {
        await scenarioCinema(navigateur, base, nomBase === 'file://');
        noter(`- OK ${nomBase} 1366×768 · séance cinéma : dossier Stop-motion avec 2 films et une équipe sans image (pas au programme), projection en grand (carte-titre, images lues dans les dossiers, générique, applaudissements), vitesse de l’équipe, pause à la barre d’espace, film suivant, « Bravo à tous les réalisateurs », aucune erreur.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · séance cinéma : ${e.message.split('\n').slice(0, 4).join(' ')}`);
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
    for (const [nomBase, base] of bases) {
      try {
        await scenarioProfesseurVoiture(navigateur, base);
        noter(`- OK ${nomBase} 1366×768 · professeur de la voiture : 4 équipes fictives, aide en premier, tuiles (voiture, matériel, essais, course), alertes (matériel, voiture qui n’avance pas), longueur de piste proposée, onglets Essais (tableau et graphique), Voiture et course (réponse écrite) et Carrosserie (aperçu, SVG à 4 calques), « Tous les patrons (.zip) », évaluation à 7 critères avec repères et ceinture, export Excel.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · professeur de la voiture : ${e.message.split('\n').slice(0, 6).join(' ')}`);
      }
    }
    for (const [nomBase, base] of bases) {
      try {
        await scenarioProfesseurStopMotion(navigateur, base);
        noter(`- OK ${nomBase} 1366×768 · professeur du stop motion : 4 équipes fictives, aide en premier, tuiles (titre, scénario, plaque, film), alertes (pas d’image à mi-séance, plaque pas rangée), films prêts et lien vers la séance cinéma, histoire et avis sur les tuiles, avis « À revoir » envoyé (professeur.json et dossier de l’équipe), onglets Scénario et Film (lecteur, 36 images dont une enlevée), évaluation à 7 critères avec repères et ceinture, export Excel.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · professeur du stop motion : ${e.message.split('\n').slice(0, 6).join(' ')}`);
      }
    }
    for (const [nomBase, base] of bases) {
      try {
        await scenarioStopMotionAvis(navigateur, base);
        noter(`- OK ${nomBase} 1366×768 · stop motion, avis du professeur vu par l’élève : « Je relis mon histoire » montre l’avis « À revoir » et son mot, l’équipe change la fin, relit son histoire ; avis noté comme vu.`);
      } catch (e) {
        ok = false;
        noter(`- ÉCHEC ${nomBase} 1366×768 · stop motion, avis du professeur : ${e.message.split('\n').slice(0, 6).join(' ')}`);
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
