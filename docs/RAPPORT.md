# ÉQUILIBRE — L'Héritage des Khalam
## Rapport d'intervention · Version 2.4.0

Base de départ : export Rosebud **v1.3.1** du 29/07/2026 à 23h39.
`BUILD_TAG = v2.4.0` (`modules/config.js`) · `VERSION = heritage-khalam-v2.4.0` (`sw.js`).
Les deux se bumpent **ensemble** à chaque livraison : c'est le changement de `VERSION` qui purge l'ancien cache.

> **Nommage.** ÉQUILIBRE est désormais le nom de la **licence**, partagé avec le jeu
> de cartes du même univers. *L'Héritage des Khalam* est le titre propre à ce jeu.
> Partout où le système n'affiche qu'un seul nom — sous l'icône, dans un résultat
> de recherche, dans un onglet — c'est **L'Héritage** qui apparaît : sans cela, les
> deux jeux resteraient indiscernables. Détail au §3.

---

## 1. Ce qui a été conservé

Conformément au point 3 du cahier des charges, rien n'a été reconstruit :

- **Architecture modulaire ESM** intacte : `index.html`, `main.js`, `modules/`, `styles/`, `assets/`.
- **Organisation des fichiers** identique, à une addition près (`modules/pillars.js`, justifiée au §3).
- **Système de sauvegarde** conservé dans son principe (`localStorage`, `deepMerge`), renforcé sans changer sa forme.
- **Logique narrative** : les 34 événements, 70 choix et 10 chapitres sont inchangés dans leur texte comme dans leurs effets.
- **Les quatre piliers** et la philosophie du jeu : inchangés.
- **Identités officielles** : Mila (M), Didi (F), Nia, Kofi, Mr. Mensah, Dr. Sow, Baba — noms, rôles et biographies conservés tels que définis dans `characters.md`.
- **Identité visuelle** Noir & Or, Cinzel/Montserrat, effets de brume et de particules : conservés.
- Le système de hauts faits introduit en v1.3.1, ainsi que `formatText()` et son accord masculin/féminin, ont été conservés et étendus.

---

## 2. Bugs corrigés

### 2.1 Bloquant — le jeu s'arrêtait au chapitre 2

`modules/ui.js` · `getEl()`

Le cache DOM ajouté en v1.3.1 ne s'invalidait jamais. `showChapterSummary()` remplace le contenu de `#game-scroll-container` ; `getEl()` continuait ensuite à renvoyer les anciens nœuds, détachés du document. Conséquences en chaîne :

- le dilemme du chapitre 2 était écrit dans un `div` hors du document — écran vide ;
- l'écouteur du bouton « Continuer » était posé sur un nœud mort — plus aucune interaction.

**Mesuré sur v1.3.1 telle que livrée** : 3 événements jouables, 1 transition de chapitre, puis blocage définitif. Le jeu s'arrêtait au dixième de son contenu.

Correction : `getEl()` vérifie `isConnected` et re-interroge le document si le nœud a été retiré ; ajout de `resetDomCache()` avant toute reconstruction d'écrans. L'optimisation est conservée, sa correction assurée.

### 2.2 Bloquant — les cinq fins s'enchaînaient

`modules/story.js` · `advanceStory()`

Les 5 fins étaient 5 événements frères du chapitre 10. `advanceStory()` passait de l'une à l'autre comme entre deux scènes ordinaires : le joueur voyait 2 ou 3 épilogues à la suite et terminait systématiquement sur `ch10_legacy_incomplete`, dont la condition est `true`.

Correction : le chapitre 10 porte `unique: true` et `advanceStory()` arrête le récit après un unique événement.

**Avant** : 100 % des parties terminaient sur la fin par défaut ; les 4 autres étaient du code mort.
**Après**, sur 4 000 parties : Guide 56 %, Incomplète 16 %, Bâtisseur 12 %, Visionnaire 11 %, Sage 6 %.

### 2.3 Aucune vie n'était archivée

`recordLifeEnd()` existait dans `state.js` mais n'était appelée nulle part, et `evaluateLifePath()` avait disparu de `story.js`. Rien ne dressait le bilan d'une vie : `livesCount`, `unlockedEnds`, `lifeHistory` et les cumuls du Hall restaient vides à jamais.

`evaluateLifePath()` est réintroduite et opérationnelle ; un écran de fin de vie l'exploite et archive la partie.

### 2.4 Deux hauts faits inatteignables

`legacy_sage` et `legacy_builder` figuraient dans `ACHIEVEMENTS` mais aucune vérification ne les décernait. `perfect_balance` exigeait un score de 100, mathématiquement hors d'atteinte. Les trois sont désormais accessibles.

### 2.5 Fuite de minuteries

`clearInterval(txt.dataset.timer)` recevait une chaîne de caractères : l'intervalle n'était jamais arrêté. Une trentaine de minuteries restaient actives en fin de partie, chacune réévaluant la condition à chaque tick. Remplacé par une variable de module unique.

### 2.6 Moyenne des relations faussée

`calculateBalance()` divisait la somme des relations par 4 en dur, alors que trois personnages seulement sont actifs au départ (l'enfant, le médecin et le mentor entrent en jeu plus tard). La moyenne était sous-évaluée d'un tiers et le malus de −10 se déclenchait à tort dès la première scène.

### 2.7 Sous-scores de couple ignorés

Le scénario pose `trust`, `communication`, `commitment`, `respect`, `disagreements` à la racine de nombreux choix. `handleChoice()` ne lisait que `effects`, `traits` et `relationships` : ces valeurs étaient purement jetées. Elles sont maintenant appliquées au personnage Nia. `choice.memories` était également ignoré.

### 2.8 Collections manquantes à la seconde vie

`resetForNewLife()` omettait `unlockedIllustrations` et `unlockedLore` : ces clés passaient à `undefined` et toute écriture levait une erreur.

### 2.9 Nouvelle partie après un bilan

`updateCurrentEventUI()` abandonnait silencieusement si `#dilemma-container` était absent — ce qui est le cas juste après un bilan de chapitre ou un écran de fin. Démarrer une nouvelle vie aboutissait à un écran de jeu vide. La vue est désormais reconstruite au besoin.

### 2.10 Feuille de style incomplète

Huit classes étaient référencées par le code sans exister nulle part : `.result-card`, `.choices-list`, `.dilemma-content`, `.stat-box`, `.summary-stats`, `.chapter-transition`, `.chapter-title-card`, `.chapter-intro-portrait`.

Conséquence la plus visible : `.chapter-transition` n'ayant aucun positionnement, l'intro de chapitre ne s'affichait pas en plein écran — son titre s'insérait dans le flux de la page. Et le portrait cinématique ajouté en v1.3.1 n'avait aucun style. Par ailleurs, `.choices-list` n'étant pas masquée, le `style.opacity = '1'` de fin d'animation était sans effet : les choix étaient lisibles avant le texte.

### 2.11 Dépendance à la plateforme Rosebud

`main.js` appelait `window.ProgressLogger.logProgress()`, fourni par un script hébergé chez Rosebud. Le jeu cassait dès le retrait de `rosebud-game-defaults.js`. Retiré, ainsi que le splash Rosebud, l'`importmap` inutile et les quatre scripts externes.

### 2.12 Divers

- `localStorage.clear()` effaçait tout le domaine, y compris des données étrangères au jeu → `clearSave()`, ciblé.
- `<html lang="en">` sur un jeu entièrement français.
- `advanceStory()` retombait sur l'événement 0 en ignorant ses conditions si aucun événement du chapitre suivant n'était éligible ; le chapitre est désormais traversé.
- « Continuer » était proposé dès la sélection du personnage, avant le premier dilemme.

---

## 3. Architecture et maintenabilité

**`modules/config.js` (nouveau)** — identité du jeu en un seul endroit : licence, titre, titre court, clé de sauvegarde, `BUILD_TAG`. Ces valeurs étaient écrites en dur dans six fichiers ; renommer le jeu demandait six modifications cohérentes, avec le risque d'en oublier une — typiquement la clé de sauvegarde, dont l'oubli est silencieux et fait perdre les parties en cours.

**Portraits.** Les visuels de Mila et Didi proviennent des photos officielles fournies par l'auteur, extraites par simple recadrage : aucune retouche, aucun agrandissement, aucune altération des traits. Chaque protagoniste dispose de deux fichiers : un cadrage buste pour les conteneurs rectangulaires, et une vignette carrée centrée sur le visage pour les affichages circulaires (HUD 50 px, intro de chapitre 96 px, aperçu du profil). Sans ce second cadrage, `object-fit: cover` recadrait au centre du portrait et la pastille du HUD montrait le torse. `.proto-card img` et `.dilemma-image` reçoivent en complément un `object-position` haut.

Le même module porte `VISUELS`, qui regroupe les chemins des portraits, de l'emblème et du fond d'accueil. Ils étaient écrits en dur à quatre endroits de `ui.js` : remplacer un portrait demandait quatre modifications. Le §5 du cahier des charges demandait explicitement de rendre ce remplacement possible sans toucher au reste du code — c'est désormais le cas.

Points de nommage mis à jour : titre du document, écran d'entrée, écran d'accueil, `name` et `short_name` du manifest, nom court iOS, clé de stockage (`khalam_heritage_save`, distincte de celle du jeu de cartes), nom du cache du service worker.

`sw.js` ne peut pas importer ce module — un service worker s'exécute hors du graphe de modules de la page. Sa constante `VERSION` doit donc rester synchronisée manuellement avec `BUILD_TAG` ; le fichier le rappelle en commentaire.

**`modules/pillars.js` (nouveau)** — source unique de vérité pour les quatre piliers. La liste était réécrite à quatre endroits (HUD, jauges, bilan, instructions), chacun avec ses couleurs et libellés en dur ; renommer ou recolorer un pilier demandait quatre modifications cohérentes. Ce module ne dépend d'aucun autre : il s'importe partout sans risque de cycle.

C'est le point qui sert le plus la vision « licence » du §8 : un futur jeu de l'univers réutilise `pillars.js` tel quel.

**Quatrième pilier renommé `work` → `argent`** — 63 effets et 3 conditions. Le cahier des charges nomme le pilier « Argent » ; le code disait « Travail ». Le libellé, la couleur cuivre `#A9602E` de la charte et le haut fait associé suivent.

**Doublons supprimés** — l'expression choisissant le portrait du protagoniste était recopiée à quatre endroits ; changer une illustration demandait quatre modifications identiques. Elle devient `portraitJoueur()`. Le balisage de la vue dilemme, dupliqué à trois endroits, devient `getDilemmaViewMarkup()`.

**Styles en ligne supprimés** des bilans, du HUD, du journal, des paramètres et des écrans annexes, au profit de classes. Le code de rendu redevient lisible et le style modifiable en un seul endroit.

**Commentaires** — chaque correction porte l'explication du problème d'origine, pour qu'une future modification ne le réintroduise pas. Les fonctions publiques sont documentées en JSDoc.

**`window.dispatchEvent` dans un `onclick=` inline** remplacé par un écouteur normal.

---

## 4. Performance

- **Une seule feuille de style** : les compléments sont fusionnés dans `site.css`, une requête de moins au démarrage.
- **Service worker** : coquille, modules et ressources préchargés. Le code passe par « réseau d'abord » — un déploiement est donc pris en compte à la connexion suivante sans intervention du joueur ; les images et sons par « cache d'abord », pour un démarrage quasi instantané et un fonctionnement hors ligne.
- **Préchargement** de l'image de fond et de l'emblème du premier écran.
- **`textContent` au lieu d'`innerHTML`** dans l'animation de frappe : le texte n'est plus reparsé comme du balisage à chaque caractère, et le scénario ne peut plus être interprété comme du HTML.
- **Minuteries** : une seule active au lieu d'une par événement (cf. 2.5).
- **`prefers-reduced-motion`** respecté : sur un mobile d'entrée de gamme, cela allège nettement le rendu des brumes et particules.
- **Poids total** : 1,1 Mo dont 900 Ko d'images et de sons ; 4 225 lignes de code et de style.

---

## 5. Interface et expérience

**Écrans vides comblés** — le cahier des charges demandait explicitement de les éviter :

- **Paramètres** ne proposait que « Effacer la sauvegarde ». Les préférences existaient déjà dans `state.settings` (musique, effets, vitesse et taille du texte) sans aucune interface pour les régler. Les quatre sont maintenant pilotables.
- **Hall de l'Équilibre** affichait « Contenu en cours de sagesse... ». Il présente les vies achevées, les fins découvertes, la tendance cumulée sur toutes les vies et la liste des lignées — à partir de données que `recordLifeEnd()` collectait déjà sans que rien ne les restitue.
- **Bibliothèque Vivante** affichait « Les scribes préparent les parchemins... ». Elle présente les fiches des personnages rencontrés avec l'état du lien, à partir des identités officielles de `state.js`. Rien n'y est inventé : remplacer une biographie ne touche que `state.js`.
- Les deux entrées de menu étaient marquées « (Bientôt) » tout en restant cliquables.

**Blocages et clics inutiles supprimés** — deux `alert()` bloquaient le fil d'exécution (sauvegarde, prénom manquant) ; remplacés par un retour en place. « Continuer » n'est plus proposé avant qu'une partie soit réellement entamée. Un appui sur le texte saute l'animation de frappe.

**Instructions** complétées : elles décrivaient des jauges chiffrées et omettaient la règle décisive — c'est l'écart entre le pilier le plus haut et le plus bas qui détermine le verdict, non le pilier le plus haut.

**Écran de fin de vie** : verdict de la balance, titre honorifique, pilier dominant, pilier négligé, réputation retenue, état du foyer, puis « Vivre une autre vie ». La partie se terminait auparavant sur un bilan de chapitre proposant « Continuer vers le Chapitre 12 ».

---

## 6. Recalibrage

Deux jeux de seuils étaient hors d'atteinte. Mesures obtenues en rejouant 12 000 parties sur la logique réelle.

**Paliers d'équilibre** — « Harmonie profonde » exigeait un écart inférieur à 15 points entre le pilier le plus haut et le plus bas, alors que le meilleur jeu possible plafonne à un écart de 30 compte tenu des effets du scénario. Ce palier était inaccessible. Paliers recalés sur la distribution réelle.

**Conditions des fins** — la fin du Sage exigeait un score de 75 jamais atteint. Les seuils sont désormais calés sur ce qu'un joueur attentif peut réellement obtenir (§2.2 pour la distribution).

Aucun texte, aucun effet de choix n'a été modifié : seuls les seuils de lecture l'ont été.

---

## 7. Décision de conception à valider

**Les valeurs des piliers ne sont plus affichées.** Ni dans le HUD, ni dans les bilans, ni dans le retour d'un choix. À la place : cinq états — *En péril, Fragile, Stable, Fort, Rayonnant* —, une jauge quantifiée en cinq crans, et des flèches ▲/▼ d'amplitude approximative.

Motif : avec « +10 » affiché à chaque décision, le joueur apprend le barème en deux parties et se met à optimiser une addition. Le dilemme moral cesse d'exister à l'instant où le chiffre apparaît.

**Les mécaniques sont strictement identiques** dans les deux modes : rien n'est changé aux règles, seule la lisibilité l'est. Réversible en une ligne :

```js
// modules/pillars.js
export const CHIFFRES_VISIBLES = true;
```

C'est le seul choix de cette intervention qui relève de ton jugement d'auteur plutôt que de la correction. Joue une partie dans chaque mode avant de trancher.

---

## 8. Validation

| Contrôle | Résultat |
|---|---|
| `node --check` sur `main.js`, `sw.js` et les 6 modules | 8/8 OK |
| Résolution des imports ESM (chaque nom importé est bien exporté) | 100 % résolus |
| Partie complète dans un DOM réel (jsdom) | 28 événements, 9 transitions, fin atteinte, 2ᵉ vie démarrée, **0 erreur** |
| Simulation de 12 000 parties sur la logique réelle | aucune anomalie, aucune clé d'effet inconnue, aucune boucle |
| Robustesse des sauvegardes | 18/18 vérifications |
| Références d'assets | 10 référencées, 10 présentes, 0 manquante, 0 inutilisée |
| Traces Rosebud résiduelles | aucune |
| Cycles de dépendance entre modules | aucun (`config.js` et `pillars.js` sont des feuilles) |
| Anciens identifiants (`equilibre_save_data`, `equilibre-destin`) | aucun résiduel |

Les sauvegardes sont désormais versionnées (`SCHEMA_VERSION = 2`). Une sauvegarde d'un schéma antérieur ou illisible est écartée **et retirée du stockage**, au lieu d'être fusionnée à moitié — ce qui produisait un état incohérent silencieux, ou un « Continuer » qui échouait indéfiniment.

---

## 9. Déploiement

À déposer à la racine du dépôt :

```
index.html            main.js               sw.js
manifest.webmanifest  modules/ (6 fichiers) styles/site.css
assets/ (10 fichiers) icons/ (3 fichiers)   CNAME  ← ex. heritage.khalam.app
```

Le sous-domaine doit lui aussi porter le titre propre au jeu, pas celui de la
licence : `heritage.khalam.app` plutôt qu'`equilibre.khalam.app`, déjà pris par
le jeu de cartes.

Le jeu **ne fonctionne pas en ouvrant `index.html` en local** : les modules ESM et le service worker exigent HTTPS ou `localhost`. Pour tester : `npx serve .` puis `http://localhost:3000`.

Les déploiements suivants ne touchent en général que `modules/`, `main.js`, `styles/site.css` et `sw.js`.

---

## 10. Rééquilibrage de l'économie (v2.4.0)

C'était le défaut de fond, et il est corrigé.

### 10.1 Le diagnostic

Mesuré sur 12 000 parties de la logique réelle :

- **100 % des parties saturaient au moins un pilier à 100.** Ce n'était pas le jugement du joueur qui décidait de l'issue, mais la collision avec le plafond.
- **Le joueur attentif n'atteignait jamais l'Harmonie profonde** (0 %) là où le hasard y parvenait 6 % du temps. Jouer bien était puni.
- Cumul des effets sur les 70 choix : Spiritualité **+435**, Amour +280, Argent +103, Santé **+30**. La Spiritualité montait quoi qu'on fasse, la Santé s'effondrait.

### 10.2 Les deux corrections

**L'économie.** Chaque pilier reçoit désormais le même budget net. Les gains de chaque pilier sont multipliés par un facteur propre, les pertes par un facteur commun, l'ensemble ramené par une échelle globale qui remet les amplitudes à la portée du barème 0–100. Le signe et la hiérarchie interne de chaque choix sont préservés : un choix qui favorisait la Spiritualité la favorise toujours, et davantage que les autres piliers de ce même choix. Aucun texte n'a changé.

| Pilier | Solde avant | Solde après |
|---|---|---|
| Spiritualité | +435 | +57 |
| Amour | +280 | +69 |
| Santé | +30 | +63 |
| Argent | +103 | +75 |

Écart entre les soldes : **435 avant, 18 après.**

Un défaut plus subtil est apparu en cours de route : monter l'Argent coûtait −12,3 points ailleurs contre −7,2 pour la Santé, soit un rendement de 0,81 contre 1,27. Un joueur attentif l'abandonnait donc rationnellement, et l'Argent devenait le pilier sacrifié dans 100 % des parties. Les pertes collatérales des choix qui rapportent de l'argent ont été adoucies de 30 %.

**L'usure du temps.** Chaque pilier perd 3 points au passage d'un chapitre (`USURE_PAR_CHAPITRE` dans `story.js`). Sans elle, le jeu récompensait la simple accumulation : un pilier monté au chapitre 2 restait acquis jusqu'à la fin. Avec elle, il faut entretenir — ce qui est le sujet même d'ÉQUILIBRE. La valeur est calée par simulation : à 2 la pression ne pèse pas sur les décisions, à 4 ou plus tous les piliers s'effondrent et l'équilibre devient une égalité par le bas. L'usure est annoncée au joueur dans chaque bilan de chapitre et expliquée dans le mode d'emploi.

### 10.3 Comment les paramètres ont été trouvés

Pas à la main. La simulation a servi de fonction objectif : 48 jeux de paramètres évalués en recherche large, puis une descente de coordonnées sur les quatre multiplicateurs de gains, avec pour cible la convergence des piliers chez un joueur attentif, l'absence de saturation, une Harmonie profonde rare mais atteignable, et l'échec du monomaniaque.

Le joueur attentif est modélisé comme le joueur **réel** : il ne perçoit que les cinq états des piliers, jamais leurs valeurs, ne connaît des effets que le signe et l'intensité approximative, et hésite. C'est cette version prudente qui sert de référence — un modèle qui verrait les nombres exacts donnerait une mesure flatteuse et fausse.

### 10.4 Le résultat, mesuré sur 4 000 parties par stratégie

| Stratégie | Harmonie | Stable | Fragile | Déséquilibre | Rupture |
|---|---|---|---|---|---|
| joueur attentif | **23 %** | 74 % | 3 % | 0 % | 0 % |
| au hasard | 5 % | 18 % | 35 % | 26 % | **16 %** |
| monomaniaque (tout pour l'Argent) | 0 % | 0 % | 0 % | 0 % | **100 %** |

Saturation : **0 %** dans les trois cas. Le talent est désormais récompensé, le hasard est puni, et la stratégie monomaniaque échoue systématiquement — c'est la définition minimale d'un jeu de stratégie.

Les cinq fins sont réparties : Bâtisseur 25 %, Inachevée 25 %, Sage 23 %, Guide 22 %, Visionnaire 5 %. Les seuils des fins et des hauts faits ont été recalés sur les traits réellement accumulés.

Les outils de mesure sont livrés dans `outils/` : `patch_eco.py` (la transformation, reproductible), `optimiser.py` (la recherche de paramètres), `valider_equilibrage.py` (le banc de validation). Toute modification future du scénario peut ainsi être vérifiée d'un coup.

### 10.5 Ce qui reste imparfait

L'Argent demeure le pilier négligé dans 96 % des parties du joueur attentif — il finit à 65 quand les autres atteignent 83 à 87. Le rendement est corrigé mais l'Argent reste le pilier le plus coûteux à tenir. C'est défendable thématiquement, et cela crée une tension réelle, mais ce n'est pas une symétrie parfaite.

---

## 11. Points restant à améliorer

### 11.1 Le parcours est quasi linéaire

34 événements pour 11 conditions seulement. Deux parties se ressemblent beaucoup : l'ordre des scènes est presque toujours le même, seules les réponses changent. Des embranchements réels — des scènes qui n'apparaissent que selon un choix antérieur — manquent pour donner envie de revivre une vie.

### 11.3 Contenu et illustrations

- Le chapitre 5 ne contient qu'un seul événement, contre 3 à 5 pour les autres.
- 17 des 34 événements n'ont aucune illustration et affichent le portrait du protagoniste ; les chapitres 7 à 10 réutilisent une seule image chacun. L'export v1.3.1 ne contient plus les illustrations de scènes que la version précédente avait générées.
- `formatText()` gère l'accord masculin/féminin via `[il/elle]`, mais la syntaxe n'est utilisée dans presque aucun texte du scénario : les dialogues restent écrits au masculin. C'est le levier le moins coûteux pour « rendre les personnages plus vivants » (§4 du cahier des charges) — le mécanisme est là, il ne demande qu'une passe d'écriture.
- Dr. Sow et l'enfant existent dans l'état du jeu mais aucun événement ne les active : ils n'apparaissent jamais.

### 11.4 Galerie

`unlockedIllustrations` est désormais alimentée à chaque scène vue, mais aucun écran ne l'exploite. `screens.GALLERY` a été retiré de l'énumération faute de contenu. La donnée est prête si tu veux une galerie.

### 11.5 Hauts faits

Neuf hauts faits pour dix chapitres, c'est peu, et aucun ne récompense un parcours plutôt qu'un seuil atteint (par exemple : terminer une vie sans jamais laisser un pilier passer « En péril »).
