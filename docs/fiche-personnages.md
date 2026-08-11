# Fiche personnages — à coller en tête de toute conversation ChatGPT

Ce texte suffit à retrouver Mila et Didi tels qu'ils sont dans le jeu, sans avoir
à repartir d'un ancien fil. Les couleurs ne sont pas estimées : elles ont été
mesurées sur les visuels existants.

Coller le **bloc commun**, puis le bloc du personnage voulu, puis décrire la pose.

**Les cinq tenues existent déjà** — `didi-palier-1` à `5`, `mila-palier-1` à `5`.
Il n'y a aucune raison de les regénérer. Les tableaux ci-dessous ne servent qu'à
**décrire la tenue** quand on demande le personnage dans une nouvelle **posture** :
assis, penché, couché, au téléphone. C'est la posture qu'on génère, jamais la
tenue.

---

## Bloc commun — toujours en premier

> Style : illustration numérique, traits nets et encrés, aplats de couleur avec
> ombres douces. Personnages en pied, proportions réalistes, sans stylisation
> cartoon. Univers : Dakar contemporain.
>
> Contraintes techniques, valables pour toutes les images :
> - **Fond entièrement transparent** (PNG avec canal alpha), aucun décor, aucun mur,
>   aucun sol
> - **Aucune ombre portée** au sol — elle serait fausse une fois l'image posée
> - Personnage **entier**, aucun membre coupé par le bord
> - Format portrait, 1024 × 1536

---

## MILA

> **Mila.** Homme sénégalais d'une trentaine d'années. Crâne rasé, barbe courte et
> nette, moustache. Visage ouvert, pommettes hautes, regard calme. Carrure solide,
> épaules larges, taille moyenne — un peu plus grand que Didi.
> Carnation brun chaud (#A95B2A en pleine lumière).

### Ses cinq tenues, selon le moment du récit

| Palier | Chapitres | Tenue |
|---|---|---|
| 1 | 1–2 | T-shirt jaune moutarde (#E19834), jean bleu (#193E5F), baskets blanches |
| 2 | 3–4 | Chemise blanche, sacoche en cuir |
| 3 | 5–6 | Costume gris (#5C5955), pantalon assorti |
| 4 | 7–8 | Tenue traditionnelle brodée |
| 5 | 9–10 | Smoking noir (#2A2A2A), nœud papillon, chemise blanche |

Tenue de soirée du prologue : smoking noir, nœud papillon, pochette, chaussures
noires vernies.

---

## DIDI

> **Didi.** Femme sénégalaise d'une trentaine d'années. Longues tresses fines
> descendant jusqu'aux hanches, brun châtain (#61331B). Visage fin, pommettes
> marquées, grands yeux, sourcils nets. Petites créoles dorées, fine chaîne au cou.
> Silhouette élancée, un peu plus petite que Mila.
> Carnation brun chaud légèrement plus clair que Mila (#B86837).

### Ses cinq tenues

| Palier | Chapitres | Tenue |
|---|---|---|
| 1 | 1–2 | Haut ocre (#926531), jean bleu (#29598E) |
| 2 | 3–4 | Chemisier blanc à fines fleurs, manches longues, rentré dans un jean brut taille haute ; petite sacoche noire en bandoulière ; ballerines noires |
| 3 | 5–6 | Tailleur-pantalon gris anthracite, veste cintrée ouverte sur un chemisier blanc, escarpins ; fine chaîne dorée |
| 4 | 7–8 | Robe longue en wax, une seule bretelle, grands motifs floraux fuchsia, bleu, ocre et turquoise ; fente sur la jambe droite ; sandales dorées |
| 5 | 9–10 | Robe longue drapée croisée bleu nuit, fente sur la jambe droite, sandales à brides assorties — la même que la tenue de soirée |

Robe de soirée du prologue : robe longue drapée croisée, **bleu nuit foncé**, fente
sur la jambe droite, sandales à brides assorties, petit sac à main rigide.

**Attention au bleu.** Les générations sortent systématiquement trop clair — un
bleu roi au lieu du bleu nuit. La référence mesurée est **B = 64** ; les rendus
arrivent entre 89 et 106. Préciser « bleu nuit très sombre, presque marine, pas
un bleu roi » et vérifier au retour.

---

## Charte du jeu

Fond noir profond, or lumineux `#D4AF37`, typographie Cinzel. Les personnages sont
toujours détourés et posés par-dessus un décor séparé, jamais intégrés au décor.

---

## Ce qui rate le plus souvent

1. **La transparence** — un fond blanc ou en damier revient souvent. Redemander,
   ou renvoyer le fichier tel quel pour détourage.
2. **Le bleu de Didi**, trop clair (voir ci-dessus).
3. **Les accessoires qui changent de dessin** entre deux poses d'une même série :
   un nœud de robe qui devient un bouton, un fermoir de sac qui change de forme.
   Générer les poses d'une même série **dans la même demande**, jamais séparément.
4. **L'ombre portée au sol**, à interdire explicitement à chaque fois.
5. **Le format** — ChatGPT rend parfois du 1672 × 941 au lieu du format demandé.
