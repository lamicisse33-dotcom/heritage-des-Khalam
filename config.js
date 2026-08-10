/**
 * config.js
 * ---------------------------------------------------------------------------
 * Identité du jeu, en un seul endroit.
 *
 * Le titre, le sous-titre et la clé de sauvegarde étaient auparavant écrits en
 * dur dans index.html, ui.js, state.js, main.js, manifest.webmanifest et sw.js.
 * Renommer le jeu demandait six modifications cohérentes, avec le risque d'en
 * oublier une — typiquement la clé de sauvegarde, dont l'oubli est silencieux.
 *
 * ÉQUILIBRE est le nom de la licence, partagé avec le jeu de cartes du même
 * univers. TITRE est ce qui distingue *ce* jeu : c'est lui qui doit apparaître
 * partout où le système n'affiche qu'un seul nom (icône, recherche, onglet).
 *
 * Ce module ne dépend d'aucun autre.
 *
 * NOTE : sw.js ne peut pas importer ce fichier (un service worker s'exécute
 * hors du graphe de modules de la page). Sa constante VERSION doit être
 * maintenue à la même valeur que BUILD_TAG ci-dessous, à chaque livraison.
 * ---------------------------------------------------------------------------
 */

export const JEU = {
    /** Nom de la licence, commun à tous les jeux de l'univers. */
    LICENCE: 'ÉQUILIBRE',

    /** Titre propre à ce jeu. C'est lui qui le distingue des autres. */
    TITRE: "L'Héritage des Khalam",

    /** Forme courte : sous une icône, Android tronque au-delà de ~12 signes. */
    TITRE_COURT: "L'Héritage",

    /** Lockup complet, pour l'onglet du navigateur et les fiches de store. */
    get TITRE_COMPLET() {
        return `${this.LICENCE} — ${this.TITRE}`;
    },

    /**
     * Clé de stockage local.
     * Distincte de celle du jeu de cartes ÉQUILIBRE : deux jeux servis depuis
     * des sous-domaines du même domaine ne doivent jamais se marcher dessus.
     */
    CLE_SAUVEGARDE: 'khalam_heritage_save',

    /** Version du build. À reporter dans VERSION (sw.js) à chaque livraison. */
    BUILD_TAG: 'v2.6.0'
};

/**
 * Visuels référencés depuis le code.
 * ---------------------------------------------------------------------------
 * Remplacer une illustration ne demande aucune modification ailleurs :
 *
 *  1. Le plus simple — écraser le fichier dans `` en gardant son nom.
 *     Aucune ligne de code ne bouge. Pensez alors à incrémenter BUILD_TAG et
 *     VERSION (sw.js), sinon le service worker resservira l'ancienne image
 *     depuis son cache.
 *
 *  2. Si le nouveau fichier porte un autre nom — changer le chemin ici, et
 *     nulle part ailleurs.
 *
 * Les illustrations de scènes, elles, sont déclarées au cas par cas dans le
 * champ `image` des événements de story.js : elles appartiennent au scénario
 * et restent lisibles pour qui écrit l'histoire sans toucher au code.
 * ---------------------------------------------------------------------------
 */
export const VISUELS = {
    /**
     * Chaque protagoniste a deux fichiers, et c'est volontaire.
     *
     *  - PORTRAIT : cadrage buste, pour les conteneurs rectangulaires
     *    (carte de sélection, illustration de dilemme par défaut).
     *  - AVATAR : carré centré sur le visage, pour les affichages circulaires
     *    (HUD 50 px, intro de chapitre 96 px, aperçu du profil 80 px).
     *
     * Sans ce second fichier, `object-fit: cover` recadre au centre du portrait
     * et la pastille du HUD montre le torse au lieu du visage.
     * Pour remplacer un personnage, fournir les deux cadrages.
     *
     * Les fichiers actuels proviennent des photos officielles fournies par
     * l'auteur : recadrage seul, sans retouche ni agrandissement, afin que
     * les traits des visages restent strictement inchangés.
     *
     * Les deux portraits proviennent des cartes PNG officielles fournies par
     * l'auteur, extraites à l'intérieur du cadre doré et au-dessus du bloc
     * titre : le nom et la description restent hors du fichier, puisque le jeu
     * les redessine lui-même (nécessaire pour une future traduction).
     */
    MILA: 'character-mila.webp',
    MILA_AVATAR: 'character-mila-avatar.webp',

    DIDI: 'character-didi.webp',
    DIDI_AVATAR: 'character-didi-avatar.webp',

    /** Emblème de la licence. Sert aussi de base aux icônes de l'application :
     *  s'il change, régénérer icon-192.png, icon-512.png et le maskable. */
    EMBLEME: 'official-game-emblem.webp',

    /** Fond de l'écran d'accueil (référencé aussi par .home-bg dans site.css). */
    FOND_ACCUEIL: 'home-background.webp'
};
