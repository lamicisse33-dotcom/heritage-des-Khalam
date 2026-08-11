# ÉQUILIBRE — L'Héritage des Khalam
## Document de reprise · v3.11.0

Ce fichier permet de reprendre le développement dans une nouvelle conversation sans rien perdre. **À lire en premier.**

---

## 1. Ce qu'est le projet

Un simulateur de vie narratif, jeu web installable (PWA), en français, développé par Lamine pour la marque **KHALAM**.

Le joueur incarne **Mila** (homme) ou **Didi** (femme) — ils forment le couple du récit : celui qu'on ne joue pas est le conjoint. Dix chapitres, 35 scènes, 73 choix, 5 fins.

Quatre piliers : **Spiritualité, Amour, Santé, Argent**. Le jeu ne se gagne pas en maximisant un score — le verdict porte sur l'**écart entre le pilier le plus haut et le plus bas**.

ÉQUILIBRE est le nom de la **licence**, partagé avec un jeu de cartes du même univers. *L'Héritage des Khalam* est le titre propre à ce jeu.

**En ligne :** `https://lamicisse33-dotcom.github.io/heritage-des-Khalam/`

---

## 2. Contraintes de travail — importantes

**Tous les fichiers sont à plat**, sans aucun dossier. Ce n'est pas un choix esthétique : Lamine déploie à la main depuis l'interface web de GitHub, et le glisser-déposer de dossiers échoue sur son navigateur. Ne jamais réintroduire d'arborescence.

**Bandeau de mise à jour** (v3.11.0) — le jeu interroge le `BUILD_TAG` publié et prévient le joueur quand une version plus récente existe, avec un bouton qui purge les caches et recharge. On ne se fie pas à `registration.waiting` : `skipWaiting()` est appelé dès l'installation, donc aucun worker ne reste en attente. `config.js` est le seul fichier servi **toujours** depuis le réseau — en cache, il annoncerait éternellement l'ancienne version.

**À chaque livraison, incrémenter ensemble** `BUILD_TAG` (dans `config.js`) et `VERSION` (dans `sw.js`). Sans cela le service worker resert l'ancienne version depuis son cache, et Lamine croit que le dépôt a échoué.

**Livrer un ZIP** de l'ensemble plutôt que des fichiers isolés — c'est plus sûr pour lui.

Lamine communique en français, par dictée vocale : messages courts, parfois avec des coquilles de transcription. Il teste sur iPhone.

---

## 3. Architecture

Dix modules ES, tous à la racine :

| Fichier | Rôle |
|---|---|
| `main.js` | amorçage, déblocage audio, service worker |
| `config.js` | identité du jeu, chemins des visuels, paliers de tenue, `BUILD_TAG` |
| `pillars.js` | les quatre piliers, source unique de vérité |
| `state.js` | état, sauvegarde versionnée (`SCHEMA_VERSION`) |
| `story.js` | scénario, équilibrage, relations, hauts faits |
| `ui.js` | tous les écrans |
| `audio.js` | musique et effets |
| `voice.js` | lecture à voix haute, voix genrée |
| `anim.js` | animation des personnages |
| `cinematique.js` | séquences narratives en plans |

Plus `index.html`, `site.css`, `sw.js`, `manifest.webmanifest`.

**Ne jamais tester en concaténant les modules dans une seule portée.** Ce type de banc d'essai masque les imports manquants — un bogue réel (`saveGame` non importée dans `story.js`) est passé au travers de tous les tests pendant des jours. Utiliser `esbuild --bundle` et lancer `verifier_imports.py`.

---

## 4. Ce qui a été fait

### Corrections majeures

Le prototype Rosebud d'origine était **injouable au-delà du chapitre 1** : un cache DOM jamais invalidé, et les cinq fins qui s'enchaînaient au lieu de se choisir. Une vingtaine d'autres défauts corrigés — voir `RAPPORT.md`.

### Équilibrage — mesuré, pas deviné

Cumul des effets sur les 73 choix ramené à un écart de **18 points entre piliers** (contre 435 avant). **Usure du temps** : chaque pilier perd 3 points par chapitre. Sur 4 000 parties par stratégie :

| Stratégie | Harmonie | Rupture | Saturation |
|---|---|---|---|
| joueur attentif | 23 % | 0 % | 0 % |
| au hasard | 5 % | 16 % | 0 % |
| monomaniaque | 0 % | **100 %** | 0 % |

Les paramètres ont été trouvés par **recherche sur simulation**, avec un modèle de joueur qui ne perçoit que les cinq états — pas les valeurs. Outils livrés dans `outils/`.

### Interface

Chiffres des piliers **masqués** — cinq états (*En péril → Rayonnant*). Réversible par `CHIFFRES_VISIBLES` dans `pillars.js`. Motif : avec « +10 » affiché, le joueur optimise une addition au lieu d'arbitrer un dilemme.

Lecture à voix haute avec voix genrée. Personnages en pied dans la scène, tenue changeant par palier de chapitre. Décors pour les 35 scènes. Relations branchées sur 44 choix. Prologue cinématique « La Demande ».

---

## 5. Ce qui reste à faire — par ordre d'importance

### 5.1 Les choix sont moralement lisibles — le vrai chantier

Dans presque chaque scène, on reconnaît en une seconde l'option sage, l'option ambitieuse, l'option aimante. Un dilemme suppose qu'on ne sache pas lequel on regrettera.

Trois leviers, aucun ne demande d'images :

- **Décaler les conséquences** : qu'un choix du chapitre 3 ne produise son effet qu'au chapitre 5. Le joueur ne peut plus calculer, il doit parier.
- **Rendre le temps rare** : qu'on ne puisse pas répondre à tout. Ne rien faire devient un choix.
- **Réécrire des choix** pour qu'ils cachent leur coût.

### 5.2 Le parcours est quasi linéaire

35 événements pour une poignée de conditions. Deux parties se ressemblent beaucoup. Il manque des scènes qui n'apparaissent que selon un choix antérieur.

### 5.3 L'Argent reste le pilier négligé

Dans 96 % des parties du joueur attentif. Il finit à 65 quand les autres atteignent 83-87. Défendable thématiquement, mais ce n'est pas une symétrie.

### 5.4 Détails

- La réputation affiche jusqu'à neuf étiquettes qui débordent sur quatre lignes. En garder deux ou trois.
- `formatText()` gère l'accord `[masculin/féminin]` mais la notation n'est presque pas utilisée dans le scénario : les dialogues restent au masculin. Levier peu coûteux pour rendre les personnages vivants.
- `unlockedIllustrations` est alimentée mais aucune galerie ne l'exploite.
- Le chapitre 5 ne contient qu'un seul événement, contre 3 à 5 ailleurs.

---

## 6. Ressources visuelles

Toutes générées par Lamine avec ChatGPT, puis alignées et harmonisées.

**Personnages** — 5 paliers de tenue par protagoniste, plus `mila-sport` (s'affiche quand la Santé domine nettement) et deux tenues de soirée. Portraits et vignettes rondes séparés : un `object-fit: cover` sur un portrait en pied recadre le torse et non le visage.

**Décors** — 9 pour le jeu, 6 pour le prologue. Format 1536×864, aucun personnage, centre-bas dégagé, luminosité harmonisée autour de 38.

**Ce qui n'a pas marché** : l'animation de bouche par pastille superposée. Le raccord se voyait comme un rectangle flou. Supprimée en v3.6.0. Si on la reprend un jour, il faudra des **images entières** du personnage bouche ouverte, dans la même génération que le corps au repos — pas une pièce rapportée.

**Ce qui existe mais n'est pas utilisé** : un cycle de marche de Didi en 3 poses (tenue jean), aligné au pixel. Non intégré faute de scène où la tenue convienne.

**Marche en tenue de soirée** (v3.9.0) — deux poses par protagoniste, `didi-marche-1/2.webp` et `mila-marche-1/2.webp`, employées au plan 2 du prologue. Recadrées avec une **boîte commune** aux deux poses : même échelle, même position, aucune dérive. Hauteurs 992 (Didi) et 1029 (Mila), soit le rapport exact des visuels de soirée existants. Cadence **750 ms par pose**, bascule franche — le fondu enchaîné a été essayé et écarté.

**Le couple enlacé** (v3.10.0) — `couple-marche-1/2.webp`, les deux protagonistes sur une seule image, bras dessus bras dessous. Recalage mesuré à 1 px : la meilleure paire des trois. Employée au plan 2 du prologue, elle remplace les deux marches solo, qui restent en réserve. Le bleu de la robe sortait à 106 contre 64 pour `didi-soiree.webp` — réaligné, sinon la robe changeait de teinte entre deux plans consécutifs.

**La sensation d'avancer.** Deux poses alternées sur place donnent un tapis roulant. Ce qui fait marcher, c'est le décor qui défile : caméra `marche`, travelling avant de 1,06 à 1,42 (au-delà, 1536 px affichés à 2180 commencent à manquer de définition), plus un rebond vertical du corps calé sur les 750 ms d'une pose. La corniche est un décor **en profondeur** — un panoramique latéral ne marcherait pas, il ferait glisser la caméra de côté.

**Les convives attablés** (v3.10.0) — `mila-assis.webp` et `didi-assise.webp`, générés **avec leur fauteuil** : le décor en contenait déjà, et un personnage collé par-dessus se serait assis devant sa chaise. Le rotin sortait trois fois trop clair (R=149 contre 65) pour une scène à la bougie — assombri de 45 %.
Le décor de la table a été regénéré : la première version occupait 62 % de la largeur du cadre, une table de banquet qui séparait le couple. La nappe est **détourée à part** (`decor-table-nappe.webp`) et reposée par-dessus les convives, avec `avant: true` : ils sont assis derrière la table et non posés devant.

Deux générations avaient été proposées pour Didi : la première avait 11 px de décalage et le nœud de la robe se changeait en bouton d'une pose à l'autre. Écartée. Toujours mesurer le recalage et les zones qui changent avant d'intégrer une paire de poses.

---

## 7. Méthode qui a fonctionné

Mesurer avant d'affirmer. Chaque diagnostic de ce projet est venu d'un script qui rejoue des milliers de parties ou qui compare des images pixel à pixel — jamais d'une intuition.

Dire ce qui ne va pas, même quand ce n'est pas demandé. Les défauts les plus graves — jeu injouable, fins inatteignables, économie déséquilibrée — n'ont jamais été signalés par Lamine : il ne pouvait pas les voir.

Ne pas empiler du contenu sur une fondation fragile. Écrire des chapitres supplémentaires avant de corriger l'économie aurait été du travail perdu.

---

## 8. Contenu du paquet

```
jeu/          les 53 fichiers à déposer sur GitHub, à plat
outils/       scripts de mesure et de validation
docs/         ce fichier et le rapport d'intervention
```

Pour reprendre : ouvrir une nouvelle conversation, joindre ce ZIP, et dire ce qu'on veut faire.
