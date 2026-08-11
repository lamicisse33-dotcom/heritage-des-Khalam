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
    BUILD_TAG: 'v3.10.0'
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

/**
 * Paliers de vie : le personnage en pied, dans une tenue qui suit sa
 * trajectoire à travers les dix chapitres.
 * ---------------------------------------------------------------------------
 * Ces illustrations partagent la même pose, le même cadrage et le même
 * alignement (sommet de la tête à 1 px près) : elles peuvent donc se
 * remplacer sans que le personnage saute à l'écran.
 *
 * Un tableau vide signifie « pas encore d'illustrations en pied pour ce
 * personnage » : le jeu retombe alors silencieusement sur son portrait.
 * Pour ajouter Mila, déposer ses cinq fichiers et compléter sa liste.
 * ---------------------------------------------------------------------------
 */
export const PALIERS = {
    Didi: [
        'didi-palier-1.webp',   // chapitres 1–2   : les débuts
        'didi-palier-2.webp',   // chapitres 3–4   : la vie active
        'didi-palier-3.webp',   // chapitres 5–6   : la réussite
        'didi-palier-4.webp',   // chapitres 7–8   : l'ancrage, les racines
        'didi-palier-5.webp'    // chapitres 9–10  : l'accomplissement
    ],
    Mila: [
        'mila-palier-1.webp',   // t-shirt, jean, baskets
        'mila-palier-2.webp',   // chemise blanche, sacoche
        'mila-palier-3.webp',   // costume gris
        'mila-palier-4.webp',   // tenue traditionnelle brodée
        'mila-palier-5.webp'    // smoking
    ]
};

/**
 * Tenues d'état : elles ne dépendent pas du chapitre mais de la vie du
 * personnage à cet instant. Elles prennent le pas sur le palier social.
 *
 * `sport` s'affiche quand la Santé est le pilier le plus haut : le joueur voit
 * que son personnage prend soin de lui, sans qu'aucun texte le lui dise. C'est
 * la première tenue qui traduit une valeur plutôt qu'un statut.
 *
 * Un personnage sans tenue d'état garde simplement son palier.
 */
export const TENUES_ETAT = {
    Mila: { sport: 'mila-sport.webp' },
    Didi: {}
};

/**
 * Illustration en pied correspondant à l'avancement du récit.
 * @param {string} protagoniste 'Mila' ou 'Didi'
 * @param {number} chapitreIndex index du chapitre en cours, à partir de 0
 * @returns {string|null} le fichier, ou null si ce personnage n'en a pas
 */
export function paliterDe(protagoniste, chapitreIndex, stats) {
    const liste = PALIERS[protagoniste];
    if (!liste || !liste.length) return null;

    // Une tenue d'état l'emporte sur le palier social : elle dit où en est la
    // personne, pas où elle en est arrivée.
    const etats = TENUES_ETAT[protagoniste] || {};
    if (etats.sport && stats) {
        const valeurs = Object.entries(stats);
        if (valeurs.length) {
            const [meilleur] = valeurs.reduce((a, b) => (a[1] >= b[1] ? a : b));
            const max = Math.max(...valeurs.map(v => v[1]));
            const second = Math.max(...valeurs.filter(v => v[0] !== meilleur).map(v => v[1]));
            // Il faut que la Santé domine nettement, sinon la tenue changerait
            // à chaque scène et perdrait tout sens.
            if (meilleur === 'health' && max - second >= 10) return etats.sport;
        }
    }

    const palier = Math.min(liste.length - 1, Math.floor((chapitreIndex || 0) / 2));
    return liste[palier];
}
