# Fichiers à déposer sur GitHub

Les 53 fichiers de ce dossier, **à plat, sans aucun dossier**.

1. Décompresser
2. Sur GitHub : Add file → Upload files
3. Sélectionner les 53 fichiers et les glisser
4. Commit

Ne pas déposer ce LISEZ-MOI.

## À chaque nouvelle livraison

Incrémenter **ensemble** :
- `BUILD_TAG` dans `config.js`
- `VERSION` dans `sw.js`

Sans cela, le service worker ressert l'ancienne version depuis son cache et
rien ne semble avoir changé.

## Après le dépôt

Recharger en vidant le cache : Cmd + Maj + R sur ordinateur ; sur téléphone,
fermer complètement l'onglet et rouvrir.

Si le jeu ne démarre pas, un panneau doré affiche le fichier fautif.
