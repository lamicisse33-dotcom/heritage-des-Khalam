# Le dîner — personnages assis à générer

Plan 4 du prologue (`scene-demande-4-table.webp`). Le décor existe déjà : une table ronde
sur la terrasse, face à l'océan, deux chaises en rotin vides, une bougie allumée.

Il manque le couple attablé.

---

## Le piège à éviter

Le décor **contient déjà les deux chaises**, dossier tourné vers nous. Un personnage
seul, collé par-dessus, recouvrirait le dossier : on verrait quelqu'un assis *devant*
sa chaise, pas dedans.

**Il faut donc générer le personnage AVEC sa chaise.** La nouvelle image recouvre
l'ancienne chaise entièrement. C'est la même règle que pour les portraits en pied :
une pièce rapportée se voit toujours.

---

## Exigences communes

1. **Fond entièrement transparent** — PNG, pas de sol, pas de table, pas de mur
2. **Un fichier par personnage**, nom distinct
3. **La chaise en rotin est comprise dans l'image**, vue de trois quarts arrière,
   dossier tourné vers le spectateur
4. Personnage vu **de trois quarts dos**, assis, buste tourné vers la table
5. **Tenue de soirée identique aux images de marche** : Didi en robe longue drapée
   bleu nuit avec fente, tresses longues ; Mila en smoking noir, nœud papillon,
   chemise blanche
6. Lumière **venant du bas et de face** — la bougie est la source principale :
   le visage et les mains sont éclairés par en dessous, le dos reste sombre
7. Même style que les portraits en pied : illustration numérique, traits nets

---

## Les deux images

### Mila assis — `mila-assis`

> Un homme noir en smoking noir avec nœud papillon, assis de trois quarts dos dans
> un fauteuil en rotin tressé, buste légèrement penché vers l'avant, une main posée
> sur la table hors champ. Crâne rasé, barbe courte. Vu depuis l'arrière-gauche,
> on devine son profil. Éclairé par une bougie placée devant lui, en contre-plongée
> douce. Le fauteuil en rotin est inclus, avec un coussin clair à motif géométrique
> sombre. Fond entièrement transparent, aucun décor, aucune table.

### Didi assise — `didi-assise`

> Une femme noire en robe longue drapée bleu nuit, longues tresses tombant dans le
> dos, assise de trois quarts dos dans un fauteuil en rotin tressé, buste tourné vers
> la table, épaules détendues. Vue depuis l'arrière-droite, on devine son profil.
> Éclairée par une bougie placée devant elle, en contre-plongée douce. Le fauteuil
> en rotin est inclus, avec un coussin clair à motif géométrique sombre.
> Fond entièrement transparent, aucun décor, aucune table.

---

## Placement dans le décor

Mesuré sur `scene-demande-4-table.webp` (1536 × 864) :

| | Chaise gauche | Chaise droite |
|---|---|---|
| Horizontal | 0 → 320 px (0 → 21 %) | 1180 → 1456 px (77 → 95 %) |
| Vertical | 540 → 864 px (62 → 100 %) | idem |

La chaise seule fait donc environ **320 × 324 px**. Avec la tête et les épaules qui
dépassent du dossier, compter **320 × 430 px**, soit un cadre légèrement plus haut
que large.

**Mila à gauche, Didi à droite** — comme sur l'image du couple qui marche, où il est
déjà à gauche. Deux plans consécutifs qui inverseraient les places donneraient
l'impression qu'ils ont changé de côté.

---

## Ce qu'on en fera

Le plan 4 dure 8 secondes avec un mouvement de caméra `recule`. Une seule pose
suffit par personnage — personne ne marche, assis on ne bouge presque pas.

Si tu veux plus tard un peu de vie : une seconde pose où l'un des deux lève son
verre, alternée lentement (2 à 3 secondes), suffirait. Mais ce n'est pas nécessaire
pour que le plan fonctionne.
