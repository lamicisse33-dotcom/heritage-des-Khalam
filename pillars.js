/**
 * modules/pillars.js
 * ---------------------------------------------------------------------------
 * Source unique de vérité pour les quatre piliers d'ÉQUILIBRE.
 *
 * Avant ce module, la liste des piliers était réécrite à quatre endroits
 * différents (HUD, jauges, bilan de chapitre, instructions), chacun avec ses
 * propres couleurs et libellés en dur. Renommer ou recolorer un pilier
 * demandait quatre modifications cohérentes ; désormais une seule.
 *
 * Ce module ne dépend d'aucun autre : il peut être importé partout sans
 * risque de dépendance circulaire.
 * ---------------------------------------------------------------------------
 */

/**
 * Les quatre piliers, dans l'ordre d'affichage.
 *  - id    : clé utilisée dans state.progress.stats et dans les effets du scénario
 *  - nom   : libellé affiché au joueur
 *  - icone : pictogramme du HUD
 *  - cls   : suffixe de classe CSS (.gauge-fill.spirit, .argent-txt, …)
 *  - color : variable CSS portant la couleur du pilier
 */
export const PILIERS = [
    { id: 'spirituality', nom: 'Spiritualité', icone: '🟣', cls: 'spirit', color: 'var(--spirit-glow)' },
    { id: 'love',         nom: 'Amour',        icone: '❤️', cls: 'love',   color: 'var(--love-glow)' },
    { id: 'health',       nom: 'Santé',        icone: '💚', cls: 'health', color: 'var(--health-glow)' },
    { id: 'argent',       nom: 'Argent',       icone: '🪙', cls: 'argent', color: 'var(--argent-glow)' }
];

/** Raccourci : les seules clés valides pour state.progress.stats. */
export const CLES_PILIERS = PILIERS.map(p => p.id);

/**
 * Affichage des valeurs de piliers.
 *
 * `false` (défaut) : le joueur voit un état et une tendance, jamais un nombre.
 * `true`           : les valeurs brutes réapparaissent partout, ce qui reste
 *                    utile au débogage et pour comparer les deux ressentis.
 *
 * Motif du défaut : avec « +10 » affiché à chaque choix, le joueur apprend le
 * barème en deux parties et se met à optimiser une addition au lieu d'arbitrer
 * un dilemme. Les mécaniques sont strictement identiques dans les deux modes ;
 * seule la lisibilité change.
 */
export const CHIFFRES_VISIBLES = false;

/** Les cinq états d'un pilier, du plus bas au plus haut. */
export const NIVEAUX = ['En péril', 'Fragile', 'Stable', 'Fort', 'Rayonnant'];

/**
 * Convertit une valeur 0–100 en indice de niveau 0–4.
 * @param {number} v
 * @returns {number} indice dans NIVEAUX
 */
export function niveauDe(v) {
    const n = Number(v) || 0;
    return Math.min(4, Math.max(0, Math.floor(n / 20)));
}

/**
 * Libellé à afficher pour une valeur de pilier.
 * @param {number} v
 * @returns {string} « Fort », ou « 72 » si CHIFFRES_VISIBLES vaut true.
 */
export function libelleDe(v) {
    return CHIFFRES_VISIBLES ? String(Math.round(Number(v) || 0)) : NIVEAUX[niveauDe(v)];
}

/**
 * Largeur de jauge en pourcentage.
 * Quantifiée en cinq crans quand les chiffres sont masqués : la tendance reste
 * lisible d'un coup d'œil sans que la valeur exacte soit déductible au pixel.
 * @param {number} v
 * @returns {string} ex. « 60% »
 */
export function largeurJauge(v) {
    if (CHIFFRES_VISIBLES) return `${Math.max(0, Math.min(100, Number(v) || 0))}%`;
    return `${(niveauDe(v) + 1) * 20}%`;
}

/**
 * Retrouve un pilier par sa clé.
 * @param {string} id
 * @returns {object|undefined}
 */
export function pilierParId(id) {
    return PILIERS.find(p => p.id === id);
}

/**
 * Nom affichable d'un pilier, avec repli sur la clé brute.
 * @param {string} id
 * @returns {string}
 */
export function nomDuPilier(id) {
    const p = pilierParId(id);
    return p ? p.nom : String(id);
}
