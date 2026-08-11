# Outils de mesure et de validation

Ces scripts ne font pas partie du jeu : ils servent à vérifier qu'il fonctionne.
Ne pas les déposer sur GitHub.

## Avant chaque livraison

```
python3 verifier_imports.py      # détecte tout appel à une fonction non importée
```
C'est le contrôle le plus important. Un banc d'essai qui concatène les modules
ne peut structurellement pas voir un import manquant ; celui-ci le voit.

## Équilibrage

```
python3 valider_equilibrage.py   # rejoue 12 000 parties sur la logique réelle
python3 optimiser.py             # recherche de paramètres par simulation
```
`valider_equilibrage.py` affiche la distribution des verdicts par stratégie,
les fins atteintes, l'état des relations et les anomalies de données.
À relancer après toute modification du scénario ou des effets.

## Exécution

Les scripts `.js` demandent `npm install jsdom` et un assemblage préalable :

```
npx esbuild main.js --bundle --format=esm --outfile=/tmp/bundle.js
```
puis une page de test où le script module est remplacé par ce bundle.

- `clic.js` — le jeu démarre-t-il ? (le cas le plus fréquent)
- `smoke_v.js` — partie complète, tous les écrans
- `partie_reelle.js` — partie complète sur les vrais modules, avec hauts faits
- `prologue.js` — la cinématique de La Demande

**Toujours tester sur le bundle à modules réels**, jamais sur une
concaténation : c'est ainsi qu'un bogue d'import est resté invisible pendant
plusieurs jours.
