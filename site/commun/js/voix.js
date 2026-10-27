// Lecture à voix haute (voix française du poste) et petits sons de confirmation.
// Sans voix française, les boutons 🔊 sont masqués (classe « sans-voix » sur <body>) : mieux vaut pas de voix
// qu'une lecture avec un accent anglais. Les sons se coupent avec le bouton « Son » (mémorisé par poste).
(function (global) {
  'use strict';

  const S = global.Segpa;
  let voix = null;

  function choisirVoix() {
    if (!global.speechSynthesis) return null;
    const toutes = speechSynthesis.getVoices();
    const fr = toutes.filter((v) => /^fr/i.test(v.lang));
    voix = fr.find((v) => /fr[-_]FR/i.test(v.lang) && v.localService) || fr.find((v) => /fr[-_]FR/i.test(v.lang)) || fr[0] || null;
    document.body.classList.toggle('sans-voix', !voix);
    return voix;
  }

  function lire(texte) {
    if (!voix || !texte) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.voice = voix;
    u.lang = voix.lang;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  const taire = () => global.speechSynthesis && speechSynthesis.cancel();

  // ---------- Sons (fabriqués par le navigateur : aucun fichier) ----------

  const cleSon = () => S.projet.id + '-son';
  function sonActif() {
    try {
      return localStorage.getItem(cleSon()) !== 'non';
    } catch {
      return true;
    }
  }
  function basculerSon() {
    const actif = !sonActif();
    try {
      localStorage.setItem(cleSon(), actif ? 'oui' : 'non');
    } catch {
      /* rien */
    }
    return actif;
  }

  let contexte = null;
  // sorte : 'ok' (deux notes montantes), 'photo' (déclic), 'aide' (note douce)
  function son(sorte) {
    if (!sonActif()) return;
    try {
      contexte = contexte || new (global.AudioContext || global.webkitAudioContext)();
      const notes = sorte === 'photo' ? [[1200, 0, 0.04]] : sorte === 'aide' ? [[520, 0, 0.18]] : [[660, 0, 0.09], [880, 0.1, 0.12]];
      for (const [freq, debut, duree] of notes) {
        const o = contexte.createOscillator();
        const g = contexte.createGain();
        o.frequency.value = freq;
        o.type = sorte === 'photo' ? 'square' : 'sine';
        const t = contexte.currentTime + debut;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
        o.connect(g).connect(contexte.destination);
        o.start(t);
        o.stop(t + duree + 0.02);
      }
    } catch {
      /* pas de son sur ce poste */
    }
  }

  function demarrer() {
    choisirVoix();
    if (global.speechSynthesis) speechSynthesis.addEventListener('voiceschanged', choisirVoix);
  }

  S.voix = { demarrer, lire, taire, disponible: () => !!voix, son, sonActif, basculerSon };
})(window);
