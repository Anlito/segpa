# Consignes pour Claude Code — 6e SEGPA

## À lire avant de travailler
1. `docs/CAHIER-DES-CHARGES-outils-6e-segpa.md` — socle commun ; son §0 (décisions de Thomas) prime sur le reste.
2. Le brief du projet en cours (`docs/BRIEF-CLAUDE-CODE-<projet>.md`).
3. `docs/PLAN.md` — plan validé : arborescence, formats, jalons.
4. Le modèle `Anlito/atelier-cereales` (`docs/BRIEF-NOUVEAU-PROJET.md`) pour les fichiers repris.

## Règles
- Un seul dépôt pour tous les projets SEGPA (décision de Thomas, 27/10/2026) : le socle est dans `site/commun/`, écrit
  une seule fois ; chaque projet dans `site/<projet>/` (données, charte, écrans propres).
- Tout en **français** : interface, messages, commentaires, noms de fichiers et de fonctions, messages de commit.
- Le site marche en **`file://`** : scripts classiques, données en `definirXxx({...})`, aucune ressource en ligne.
- Aucun compte, rien d'envoyé. Dépôt public : **aucune vraie donnée d'élève**. Photos : objets et mains, pas de visages.
- Sauvegarde : un `.json` par équipe, versionné, jamais d'écrasement, anciennes sauvegardes lisibles ; photos à part.
- Lisibilité : une action par écran, 8 mots au plus, pictogramme, 🔊, texte ≥ 22 px, boutons ≥ 72 px, pas de défilement à
  1366×768. Écarts en **ambre**, jamais en rouge ; jamais la couleur seule ; une vérification ne donne jamais la réponse.
- Les élèves ne voient jamais de note : photos, smileys, ceinture. La note /20 est réservée à l'outil professeur.
- Ne rien supposer sur le matériel ni sur les libellés de compétences : demander à Thomas.
- Tests `node:test` à chaque jalon ; s'arrêter après chaque jalon pour une recette avec Thomas.
