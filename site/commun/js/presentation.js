// Présentation du début de projet, à projeter : le moteur commun aux projets (avec css/presentation.css).
// Segpa.lancerPresentation(diapos) ; chaque diapo : { html, notes, classe, style }.
// ← → (ou Espace, ou clic) pour avancer, Début / Fin, F plein écran, N les notes du professeur. Le numéro est dans l'adresse (#3).
// Marche en file:// ; rien n'est chargé ni envoyé.
(function (global) {
  'use strict';

  var S = global.Segpa || (global.Segpa = {});

  // Les dessins d'une diapo cachée ne peuvent pas servir à une autre : chaque diapo a ses propres identifiants.
  function identifiantsPropres(html, n) {
    return html.replace(/\bid="([^"]+)"/g, 'id="p' + n + '-$1"').replace(/url\(#([^)]+)\)/g, 'url(#p' + n + '-$1)').replace(/href="#([^"]+)"/g, 'href="#p' + n + '-$1"');
  }

  function lancerPresentation(DIAPOS) {
    var corps = document.body;
    corps.insertAdjacentHTML('afterbegin',
      '<main class="scene" id="scene" aria-live="polite"></main>' +
      '<div class="notes" id="notes" hidden><strong>Notes du professeur</strong><span></span></div>' +
      '<nav class="commandes" aria-label="Commandes de la présentation">' +
      '<button type="button" data-cmd="precedent" aria-label="Diapositive précédente">←</button>' +
      '<span class="numero" id="numero"></span>' +
      '<button type="button" data-cmd="suivant" aria-label="Diapositive suivante">→</button>' +
      '<button type="button" data-cmd="notes" title="Touche N">Notes</button>' +
      '<button type="button" data-cmd="plein" title="Touche F">Plein écran</button></nav>');
    var scene = document.getElementById('scene');
    scene.innerHTML = DIAPOS.map(function (d, k) {
      return '<section class="diapo ' + (d.classe || '') + '" style="' + (d.style || '') + '" aria-label="Diapositive ' + (k + 1) + ' sur ' + DIAPOS.length + '">' +
        identifiantsPropres(d.html, k + 1) + '</section>';
    }).join('');
    var diapos = scene.querySelectorAll('.diapo');
    var notes = document.getElementById('notes');
    var i = 0;

    function ajuster() {
      var e = Math.min(innerWidth / 1920, innerHeight / 1080);
      for (var k = 0; k < diapos.length; k++) diapos[k].style.transform = 'scale(' + e + ') translate(-50%, -50%)';
    }
    function montrer(n) {
      i = Math.min(Math.max(0, n), DIAPOS.length - 1);
      for (var k = 0; k < diapos.length; k++) diapos[k].classList.toggle('active', k === i);
      document.getElementById('numero').textContent = (i + 1) + ' / ' + DIAPOS.length;
      notes.querySelector('span').textContent = DIAPOS[i].notes || '';
      history.replaceState(null, '', '#' + (i + 1));
    }
    function plein() {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
    }
    var actions = { precedent: function () { montrer(i - 1); }, suivant: function () { montrer(i + 1); }, notes: function () { notes.hidden = !notes.hidden; }, plein: plein };
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cmd]');
      if (b) return actions[b.dataset.cmd]();
      if (e.target.closest('.notes')) return;
      montrer(e.clientX < innerWidth / 3 ? i - 1 : i + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].indexOf(e.key) >= 0) { e.preventDefault(); montrer(i + 1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(e.key) >= 0) { e.preventDefault(); montrer(i - 1); }
      else if (e.key === 'Home') montrer(0);
      else if (e.key === 'End') montrer(DIAPOS.length - 1);
      else if (e.key === 'f' || e.key === 'F') plein();
      else if (e.key === 'n' || e.key === 'N') actions.notes();
    });
    var minuteur = null;
    document.addEventListener('mousemove', function () {
      corps.classList.remove('calme');
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { corps.classList.add('calme'); }, 2500);
    });
    addEventListener('resize', ajuster);
    ajuster();
    montrer((parseInt((location.hash || '').replace('#', ''), 10) || 1) - 1);
  }

  S.lancerPresentation = lancerPresentation;
})(window);
