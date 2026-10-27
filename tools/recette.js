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
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('dialog', (d) => {
    erreurs.push('fenêtre inattendue : ' + d.type());
    d.accept();
  });
  page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
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
    return { defile: document.documentElement.scrollHeight > h + 1 || document.documentElement.scrollWidth > w + 1, depasse: depasse.slice(0, 5) };
  });
  assert.ok(!r.defile && !r.depasse.length, `${nom} : ça dépasse de l'écran ${JSON.stringify(r.depasse)}`);
}

async function cliquer(page, selecteur) {
  await page.locator(selecteur).first().click();
}

// Fait l'écran affiché, quel que soit son type. Renvoie false sur l'écran « Bravo ».
async function faireEcran(page, nom, captures) {
  await page.waitForTimeout(150);
  if (await page.locator('[data-action="fini"]').count()) return false;
  await sansDefilement(page, nom);
  if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '.png') });
  if (await page.locator('.ligne').count()) {
    for (const l of await page.locator('.ligne').all()) await l.click();
    await cliquer(page, '[data-action="fait"]');
  } else if (await page.locator('.visage').count()) {
    for (const q of await page.locator('.question-bilan').all()) await q.locator('.visage').first().click();
    await cliquer(page, '[data-action="fait"]');
  } else if (await page.locator('.zone-camera').count()) {
    await page.locator('[data-action="prendre"]').waitFor({ timeout: 10000 });
    await page.waitForFunction(() => document.querySelector('.zone-camera video') && document.querySelector('.zone-camera video').videoWidth > 0);
    await sansDefilement(page, nom + '-camera');
    if (captures) await page.screenshot({ path: path.join(SORTIE, nom + '-camera.png') });
    await cliquer(page, '[data-action="prendre"]');
    await page.locator('[data-action="garder"]').waitFor();
    await sansDefilement(page, nom + '-apercu');
    await cliquer(page, '[data-action="garder"]');
  } else {
    await cliquer(page, '[data-action="fait"]');
  }
  return true;
}

async function faireSeance(page, prefixe, captures) {
  let n = 0;
  while (await faireEcran(page, `${prefixe}-${String(++n).padStart(2, '0')}`, captures)) assert.ok(n < 40, 'séance sans fin');
  await sansDefilement(page, prefixe + '-bravo');
  if (captures) await page.screenshot({ path: path.join(SORTIE, prefixe + '-bravo.png') });
  return n - 1;
}

async function scenarioEnseignant(navigateur, base, taille, captures) {
  const { contexte, page, erreurs, horsSite } = await nouvellePage(navigateur, taille);
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
    ecrans.push(await faireSeance(page, s, captures));
    await cliquer(page, '[data-action="album"]');
    await sansDefilement(page, s + '-album');
    if (captures && s === 's3') await page.screenshot({ path: path.join(SORTIE, 'album.png') });
    await cliquer(page, '[data-action="mission"]');
  }
  assert.equal(await page.locator('.carte-seance.fait').count(), 3);
  if (captures) await page.screenshot({ path: path.join(SORTIE, 'mission-fin.png') });
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
  if (!(await page.locator('[data-action="commencer"]').count())) throw new Error('après « J’ai fini » : ' + (await page.locator('.message-bref').textContent().catch(() => '?')) + ' / ' + (await page.evaluate(() => Segpa.app.etat.session && Segpa.app.etat.session.derniereErreur)));
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
  assert.equal(d.photos[0].fichier, 'photos/s1-boite-01.jpg');
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
        try {
          const ecrans = await scenarioEnseignant(navigateur, base, taille, nomBase === 'file://' && taille.width === 1366);
          noter(`- OK ${nomBase} ${t} · mode enseignant : séances de ${ecrans.join(', ')} écrans faites jusqu’à « Bravo », album, aide demandée puis résolue, rien ne dépasse, aucune erreur, aucune requête hors du site.`);
        } catch (e) {
          ok = false;
          noter(`- ÉCHEC ${nomBase} ${t} · mode enseignant : ${e.message}`);
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
  } finally {
    await navigateur.close();
    serveur.kill();
  }
  noter('');
  noter('À faire à la main sur un poste du collège (voir RECETTE.md) : vraie webcam, voix française, dossier réseau.');
  fs.writeFileSync(path.join(RACINE, 'RECETTE-AUTO.md'), lignes.join('\n') + '\n');
  if (!ok) process.exitCode = 1;
})();
