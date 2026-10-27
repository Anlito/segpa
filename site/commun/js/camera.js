// Webcam : allumer, choisir la caméra (mémorisée par poste et par projet), prendre une photo JPEG 1280 × 720.
// Messages en français simple, avec la prochaine action (cahier des charges §5).
(function (global) {
  'use strict';

  const S = global.Segpa;
  const cle = () => S.projet.id + '-camera';
  let flux = null;

  const disponible = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  function memoire() {
    try {
      return localStorage.getItem(cle()) || '';
    } catch {
      return '';
    }
  }

  function arreter() {
    if (flux) for (const p of flux.getTracks()) p.stop();
    flux = null;
  }

  function messageErreur(e) {
    const n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Autorise la caméra en haut de l’écran, puis appuie sur Réessayer.';
    if (n === 'NotReadableError' || n === 'TrackStartError' || n === 'AbortError') return 'Une autre page utilise la caméra. Ferme-la, puis réessaie.';
    if (n === 'NotFoundError' || n === 'DevicesNotFoundError' || n === 'OverconstrainedError') return 'Je ne vois pas la caméra. Branche-la, puis appuie sur Réessayer.';
    return 'La caméra ne démarre pas. Appuie sur Réessayer.';
  }

  // Branche la caméra sur l'élément <video>. → { ok: true, cameras } ou { ok: false, message }
  async function allumer(video, idVoulu) {
    if (!disponible()) return { ok: false, message: 'Ce navigateur ne donne pas la caméra. Ouvre le site avec Chrome ou Edge.' };
    arreter();
    const id = idVoulu === undefined ? memoire() : idVoulu;
    const reglage = { width: { ideal: 1280 }, height: { ideal: 720 } };
    try {
      flux = await navigator.mediaDevices.getUserMedia({ audio: false, video: id ? { ...reglage, deviceId: { exact: id } } : reglage });
    } catch (e) {
      // Caméra mémorisée débranchée : on prend celle par défaut.
      if (id && e && (e.name === 'OverconstrainedError' || e.name === 'NotFoundError')) return allumer(video, '');
      return { ok: false, message: messageErreur(e) };
    }
    const piste = flux.getVideoTracks()[0];
    const choisie = (piste && piste.getSettings && piste.getSettings().deviceId) || '';
    try {
      localStorage.setItem(cle(), choisie);
    } catch {
      /* rien */
    }
    video.srcObject = flux;
    try {
      await video.play();
    } catch {
      /* lecture automatique : la vidéo démarre seule (muted) */
    }
    let cameras = [];
    try {
      cameras = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
    } catch {
      /* rien */
    }
    return { ok: true, cameras, choisie };
  }

  // Photo au format 16/9, recadrée au centre, 1280 × 720, JPEG qualité 0,8 (≈ 150 Ko).
  function prendre(video) {
    return new Promise((ok, ko) => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return ko(new Error('pas-pret'));
      const c = document.createElement('canvas');
      c.width = 1280;
      c.height = 720;
      const ratio = 16 / 9;
      let sw = w;
      let sh = w / ratio;
      if (sh > h) {
        sh = h;
        sw = h * ratio;
      }
      c.getContext('2d').drawImage(video, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 1280, 720);
      c.toBlob((b) => (b ? ok({ blob: b, canvas: c }) : ko(new Error('jpeg'))), 'image/jpeg', 0.8);
    });
  }

  S.camera = { disponible, allumer, arreter, prendre, messageErreur };
})(window);
