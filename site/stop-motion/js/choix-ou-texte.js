// Un écran « je choisis une carte-idée, ou j'écris mon idée » (titre du film, héros, lieu, problème, fin).
// Segpa.vueChoixOuTexte(O, o) → la vue d'un écran d'étape. o :
//   texte          la consigne (« Je choisis le titre de mon film. »)    texteEcrire  la consigne au clavier
//   pastille       petit repère au-dessus (« Début »), facultatif         idees        les cartes (6 au plus)
//   valeur         ce qui est déjà choisi                                  longueur     caractères au plus
//   libelleEcrire  « J'écris un titre »   libelleGarder « C'est mon titre »   nomChamp  pour le lecteur d'écran
//   apercu(t)      HTML montré sous le champ (la carte-titre…), facultatif
//   plusieurs      on peut toucher plusieurs cartes (3 au plus) : « une maison, un arbre »
//   garder(t)      l'élève a choisi : on enregistre et on passe à la suite
// L'état de l'écran (choix en cours, mode clavier) est dans O.sous() : il ne se perd pas si l'écran se redessine.
(function (global) {
  'use strict';

  const S = global.Segpa;

  function vueChoixOuTexte(O, o) {
    const { ech, pic, racine } = O;
    const sous = O.sous();
    const idees = (o.idees || []).slice(0, 6);
    const MAX = 3;
    const morceaux = (t) => String(t || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (sous.choix === undefined) sous.choix = o.valeur || '';
    const choisies = () => (o.plusieurs ? morceaux(sous.choix) : [sous.choix]);
    const clavier = sous.ecrire || (sous.choix && !choisies().every((t) => idees.includes(t)));
    const pastille = o.pastille ? `<span class="pastille">${ech(o.pastille)}</span>` : '';
    const consigne = (t) => `<div class="consigne-ligne" style="align-items:center"><p class="consigne-texte montage-titre">${ech(t)}</p>${O.boutonVoix(t)}</div>`;
    const garder = () => {
      const t = String(sous.choix || '').trim();
      if (t) o.garder(t);
    };
    if (clavier) {
      return {
        milieu: `<div class="colonne montage-colonne">
            ${pastille}${consigne(o.texteEcrire || o.texte)}
            <input class="champ-titre" type="text" maxlength="${o.longueur || 40}" autocomplete="off" spellcheck="false" aria-label="${ech(o.nomChamp || o.texte)}" value="${ech(sous.choix)}">
            ${o.apercu ? o.apercu(sous.choix) : ''}
          </div>`,
        gauche: O.boutonRetour('idees'),
        principal: O.boutonPrincipal('garder', o.libelleGarder || 'C’est mon idée', 'coche', !String(sous.choix).trim()),
        actions: {
          idees: () => {
            sous.ecrire = false;
            if (!idees.includes(sous.choix)) sous.choix = '';
            O.rafraichir();
          },
          garder,
        },
        apres: () => {
          const champ = racine.querySelector('.champ-titre');
          champ.focus();
          champ.setSelectionRange(champ.value.length, champ.value.length);
          champ.addEventListener('input', () => {
            sous.choix = champ.value;
            const a = racine.querySelector('[data-apercu]');
            if (a && o.apercu) a.outerHTML = o.apercu(champ.value);
            racine.querySelector('[data-action="garder"]').disabled = !champ.value.trim();
          });
          champ.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && champ.value.trim()) garder();
          });
        },
      };
    }
    return {
      milieu: `<div class="colonne montage-colonne">
          ${pastille}${consigne(o.texte)}
          ${o.plusieurs ? `<p class="consigne-detail">${ech(`Je peux en toucher ${MAX}.`)}</p>` : ''}
          <div class="cartes-titres">${idees
            .map((t) => `<button type="button" class="carte-titre" data-action="choisir" data-titre="${ech(t)}" aria-pressed="${choisies().includes(t)}">${ech(t)}</button>`)
            .join('')}
            <button type="button" class="carte-titre ecrire" data-action="ecrire">${pic('crayon')}${ech(o.libelleEcrire || 'J’écris mon idée')}</button>
          </div>
        </div>`,
      principal: O.boutonPrincipal('garder', o.libelleGarder || 'C’est mon idée', 'coche', !sous.choix),
      actions: {
        choisir: (b) => {
          const t = b.dataset.titre;
          if (o.plusieurs) {
            let liste = morceaux(sous.choix);
            if (liste.includes(t)) liste = liste.filter((x) => x !== t);
            else if (liste.length < MAX) liste.push(t);
            else return O.message(`${MAX} cartes au plus : j’en enlève une d’abord.`);
            sous.choix = liste.join(', ');
          } else sous.choix = t;
          for (const x of racine.querySelectorAll('[data-action="choisir"]')) x.setAttribute('aria-pressed', String(choisies().includes(x.dataset.titre)));
          racine.querySelector('[data-action="garder"]').disabled = !sous.choix;
        },
        ecrire: () => {
          sous.ecrire = true;
          sous.choix = '';
          O.rafraichir();
        },
        garder,
      },
    };
  }

  S.vueChoixOuTexte = vueChoixOuTexte;
})(window);
