// Dossiers et fichiers de l'équipe, sur le réseau du collège.
//   … › 6A › COMMUN › TECHNOLOGIE › Taille-crayon               dossier du projet (ouvert par les élèves, classe.json du professeur)
//   … › Taille-crayon › Léa_Tom › Léa_Tom.json                  sauvegarde de l'équipe
//   … › Taille-crayon › Léa_Tom › photos › s1-boite-01.jpg       photos
// Chrome et Edge seulement (accès aux dossiers). Jamais d'écrasement : un fichier déjà là est relu, jamais remplacé
// par un vide ; une photo prend toujours un nouveau nom.
(function (global) {
  'use strict';

  const S = global.Segpa;
  const P = () => S.projet.id;
  const accesDossiers = typeof global.showDirectoryPicker === 'function';

  async function autorise(handle, demander) {
    const options = { mode: 'readwrite' };
    if (!handle.queryPermission) return true;
    if ((await handle.queryPermission(options)) === 'granted') return true;
    if (demander === false) return false;
    return (await handle.requestPermission(options)) === 'granted';
  }

  // Renvoie le dossier choisi, ou null si l'élève a fermé la fenêtre.
  async function choisirDossier() {
    try {
      return await global.showDirectoryPicker({ id: P() + '-projet', mode: 'readwrite' });
    } catch (e) {
      if (e && e.name === 'AbortError') return null;
      throw e;
    }
  }

  async function lireTexte(dossier, nom) {
    try {
      const h = await dossier.getFileHandle(nom);
      return await (await h.getFile()).text();
    } catch {
      return null;
    }
  }

  // Une sauvegarde de ce projet dans ce dossier ? → { handle, lecture } ; sinon null.
  // On regarde tous les .json, pour ne pas créer un deuxième fichier si l'équipe a écrit son prénom autrement.
  async function sauvegardeDans(dossier, nomVoulu) {
    const cible = nomVoulu ? S.simplifierNom(nomVoulu.replace(/\.json$/i, '')) : null;
    let premiere = null;
    try {
      for await (const h of dossier.values()) {
        if (h.kind !== 'file' || !/\.json$/i.test(h.name) || /^classe\.json$/i.test(h.name)) continue;
        let lecture;
        try {
          lecture = S.lireSauvegarde(await (await h.getFile()).text(), P());
        } catch {
          continue;
        }
        if (!lecture.ok) continue;
        if (cible && S.simplifierNom(h.name.replace(/\.json$/i, '')) === cible) return { handle: h, lecture };
        if (!premiere) premiere = { handle: h, lecture };
      }
    } catch {
      return null;
    }
    return premiere;
  }

  // Le dossier choisi : 'projet' (Taille-crayon), 'equipe' (contient une sauvegarde du projet) ou 'autre'.
  async function analyserDossier(dossier) {
    const attendu = S.simplifierNom((S.reglages && S.reglages.cheminProjet && S.reglages.cheminProjet.slice(-1)[0]) || '');
    if (attendu && S.simplifierNom(dossier.name) === attendu) return 'projet';
    if (await lireTexte(dossier, 'classe.json')) return 'projet';
    if (await sauvegardeDans(dossier)) return 'equipe';
    return 'autre';
  }

  // classe.json du professeur : { classe: '6A', eleves: [...] } ou simplement [...]. null si absent ou illisible.
  async function lireClasse(dossierProjet) {
    const t = await lireTexte(dossierProjet, 'classe.json');
    if (!t) return null;
    try {
      const c = JSON.parse(t);
      const eleves = (Array.isArray(c) ? c : c.eleves || []).map((p) => S.majuscule(typeof p === 'string' ? p : p && p.prenom)).filter(Boolean);
      if (!eleves.length) return null;
      return { classe: (!Array.isArray(c) && c.classe) || '', eleves };
    } catch {
      return null;
    }
  }

  // Les équipes déjà commencées dans le dossier du projet : [{ dossier, handle, donnees }], les plus récentes d'abord.
  async function equipesDans(dossierProjet) {
    const liste = [];
    for await (const h of dossierProjet.values()) {
      if (h.kind !== 'directory') continue;
      const s = await sauvegardeDans(h, h.name + '.json');
      if (s) liste.push({ dossier: h, handle: s.handle, donnees: s.lecture.donnees });
    }
    liste.sort((a, b) => String(b.donnees.modifieLe).localeCompare(String(a.donnees.modifieLe)));
    return liste;
  }

  // Dossier de l'équipe (créé s'il manque). Si une sauvegarde y est déjà, elle est rendue (jamais écrasée).
  async function dossierEquipe(dossierProjet, donnees) {
    const nom = S.nomEquipe(donnees.equipe.eleves);
    const dossier = await dossierProjet.getDirectoryHandle(nom, { create: true });
    const deja = await sauvegardeDans(dossier, nom + '.json');
    return { dossier, deja };
  }

  async function ecrireJson(dossier, donnees, handle) {
    const h = handle || (await dossier.getFileHandle(S.nomEquipe(donnees.equipe.eleves) + '.json', { create: true }));
    const flux = await h.createWritable();
    await flux.write(JSON.stringify(donnees, null, 1));
    await flux.close();
    return h;
  }

  async function sousDossier(dossier, chemin, creer) {
    let d = dossier;
    const parties = chemin.split('/');
    for (const p of parties.slice(0, -1)) d = await d.getDirectoryHandle(p, { create: !!creer });
    return { dossier: d, nom: parties[parties.length - 1] };
  }

  // Écrit une photo (Blob). prochainNom(dejaPris) donne le chemin (« photos/s1-boite-01.jpg ») ; si ce fichier existe
  // déjà dans le dossier (photo prise sur un autre poste), on demande le nom suivant : rien n'est jamais remplacé.
  async function ecrirePhoto(dossier, prochainNom, blob) {
    const pris = [];
    for (let essai = 0; essai < 50; essai++) {
      const chemin = prochainNom(pris);
      const { dossier: d, nom } = await sousDossier(dossier, chemin, true);
      let existe = true;
      try {
        await d.getFileHandle(nom);
      } catch {
        existe = false;
      }
      if (existe) {
        pris.push(chemin);
        continue;
      }
      const h = await d.getFileHandle(nom, { create: true });
      const flux = await h.createWritable();
      await flux.write(blob);
      await flux.close();
      return chemin;
    }
    throw new Error('photo');
  }

  async function lirePhoto(dossier, chemin) {
    try {
      const { dossier: d, nom } = await sousDossier(dossier, chemin, false);
      return await (await d.getFileHandle(nom)).getFile();
    } catch {
      return null;
    }
  }

  // ---------- Mémoire du poste : dernier dossier du projet et dernière équipe (IndexedDB, une base par projet) ----------

  function base() {
    return new Promise((ok, ko) => {
      const r = indexedDB.open(P() + '-segpa', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('dossiers');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    });
  }
  async function memoriser(cle, handle) {
    try {
      const db = await base();
      await new Promise((ok, ko) => {
        const t = db.transaction('dossiers', 'readwrite');
        if (handle) t.objectStore('dossiers').put(handle, cle);
        else t.objectStore('dossiers').delete(cle);
        t.oncomplete = ok;
        t.onerror = () => ko(t.error);
      });
    } catch {
      /* stockage indisponible : on redemandera le dossier */
    }
  }
  async function memorise(cle) {
    try {
      const db = await base();
      return await new Promise((ok) => {
        const r = db.transaction('dossiers').objectStore('dossiers').get(cle);
        r.onsuccess = () => ok(r.result || null);
        r.onerror = () => ok(null);
      });
    } catch {
      return null;
    }
  }

  // ---------- Copie de secours dans le navigateur ----------

  const cleSecours = () => P() + '-secours';
  function sauverSecours(donnees) {
    try {
      localStorage.setItem(cleSecours(), JSON.stringify(donnees));
    } catch {
      /* navigation privée ou stockage plein */
    }
  }
  function lireSecours() {
    try {
      const t = localStorage.getItem(cleSecours());
      if (!t) return null;
      const r = S.lireSauvegarde(t, P());
      return r.ok ? r.donnees : null;
    } catch {
      return null;
    }
  }

  // Sans accès aux dossiers (Firefox) : la sauvegarde est téléchargée, à ranger ensuite.
  function telecharger(donnees) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = S.nomEquipe(donnees.equipe.eleves) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  S.fichiers = {
    accesDossiers,
    autorise,
    choisirDossier,
    analyserDossier,
    lireClasse,
    equipesDans,
    sauvegardeDans,
    dossierEquipe,
    ecrireJson,
    ecrirePhoto,
    lirePhoto,
    memoriser,
    memorise,
    sauverSecours,
    lireSecours,
    telecharger,
  };
})(window);
