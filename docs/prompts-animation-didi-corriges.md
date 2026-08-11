# Prompts corrigés — animation de Didi

Fichier à joindre : **`perso-palier-1.webp`** (667 × 1400) — celui que tu m'as renvoyé, pas la version réduite que j'ai livrée dans le jeu.

Deux corrections par rapport à ma première version :

- « corps centré horizontalement » était faux. Le personnage est décalé de 42 px vers la gauche à cause de ses tresses. Demander un centrage aurait poussé l'outil à « corriger » le cadrage et à tout décaler.
- Pour la marche, c'est le **sol** qui doit rester fixe, pas la tête. Le corps monte et descend naturellement pendant un cycle de marche : figer la tête aurait produit une marche raide, glissée.

---

## SÉRIE A — La parole · 3 images

> À partir de l'image jointe, génère 3 images de ce même personnage.
>
> Tout doit rester rigoureusement identique d'une image à l'autre : même personnage, même tenue (jean bleu, t-shirt jaune, sandales), même coiffure et même position exacte de chaque tresse, même pose du corps, mêmes bras, mêmes mains, même position et même inclinaison de la tête, même direction du regard, même éclairage, même style de dessin, même cadrage, même échelle.
>
> Le personnage doit occuper exactement la même place dans le cadre que sur l'image jointe : sommet du crâne à 24 pixels du bord haut, pieds à 29 pixels du bord bas, et corps positionné exactement comme sur l'image de référence.
>
> **La seule différence entre les trois images est la bouche :**
>
> - Image 1 — bouche fermée, expression neutre, exactement comme sur l'image de référence
> - Image 2 — bouche légèrement entrouverte, comme au milieu d'un mot, dents à peine visibles
> - Image 3 — bouche ouverte, comme sur une voyelle ouverte (le son « a »), mâchoire abaissée
>
> Ne change rien d'autre : ni les yeux, ni les sourcils, ni les joues, ni l'inclinaison de la tête, ni le corps, ni les cheveux.
>
> Format de sortie : PNG à fond transparent, 667 × 1400 pixels, pour les trois images.

---

## SÉRIE B — La marche · 8 images

À ne lancer que si la série A a donné un bon résultat.

> À partir de l'image jointe, génère 8 images formant un cycle de marche complet de ce personnage, vu **de profil, tourné vers la droite**.
>
> Contraintes identiques sur les 8 images : même personnage, même tenue (jean bleu, t-shirt jaune, sandales), même coiffure, même style de dessin, même éclairage, même taille du personnage — sa hauteur totale ne doit jamais varier d'une image à l'autre.
>
> **Le sol est à la même hauteur sur les 8 images** : le pied qui touche le sol se trouve toujours à environ 29 pixels du bord bas du cadre. Le corps peut monter et descendre légèrement pendant le cycle, c'est normal — mais la ligne du sol, elle, ne bouge jamais.
>
> **Le personnage marche sur place** : il reste à la même position horizontale dans le cadre, il ne traverse pas l'image. Seuls les bras et les jambes bougent.
>
> Les 8 poses du cycle, dans cet ordre :
>
> 1. Contact — jambe droite tendue en avant, talon au sol ; jambe gauche tendue en arrière, orteils au sol ; bras gauche en avant, bras droit en arrière ; corps au plus bas
> 2. Amorti — jambe droite fléchie supportant tout le poids ; jambe gauche qui quitte le sol
> 3. Passage — jambe gauche passe près de la jambe droite tendue ; corps au point le plus haut ; bras presque à la verticale le long du corps
> 4. Élan — jambe gauche part en avant ; jambe droite pousse sur les orteils
> 5. Contact inversé — miroir de la pose 1 : jambe gauche en avant, bras droit en avant
> 6. Amorti inversé — miroir de la pose 2
> 7. Passage inversé — miroir de la pose 3
> 8. Élan inversé — miroir de la pose 4
>
> Le mouvement doit être fluide et régulier, et la pose 8 doit enchaîner naturellement sur la pose 1 pour former une boucle sans rupture.
>
> Format de sortie : PNG à fond transparent, 667 × 1400 pixels, pour les 8 images.

### Si le résultat est décevant

**Repli 1 — 4 images.** Ne demande que les poses 1, 3, 5 et 7. Moins fluide, mais l'outil tient bien mieux la constance sur 4 images que sur 8.

**Repli 2 — marche de face.** 4 images du personnage vu de face qui avance, jambes alternées. Moins juste anatomiquement, mais beaucoup plus stable à générer — et ton jeu montre déjà les personnages de face.

---

## Ce qui compte vraiment

Envoie-moi la **série A seule** d'abord. Trois images suffisent à savoir si l'outil tient la contrainte. Je mesure l'écart du sommet du crâne, l'échelle, la stabilité du visage et la qualité de la transparence, et je te dis franchement si c'est exploitable avant que tu investisses dans les huit autres.
