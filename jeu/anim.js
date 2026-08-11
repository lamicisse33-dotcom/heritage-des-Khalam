/**
 * anim.js — Animation des personnages.
 * ---------------------------------------------------------------------------
 * Les protagonistes sont des photographies. Une photographie ne se déplace pas
 * et n'ouvre pas la bouche : toute tentative de l'y forcer produit une image
 * caoutchouteuse, pire que l'immobilité. Ce module vise donc autre chose — la
 * *présence*, obtenue par trois moyens qui fonctionnent sur une photo :
 *
 *   1. RESPIRATION — une oscillation lente et très faible, en permanence.
 *      C'est ce qui distingue un portrait vivant d'une vignette collée.
 *
 *   2. PAROLE — la synthèse vocale émet un événement à chaque mot prononcé.
 *      On s'y branche pour faire vibrer le portrait au rythme exact de la
 *      voix : le personnage n'articule pas, mais il parle visiblement.
 *
 *   3. ÉMOTION — après un choix, le portrait s'incline et son halo change de
 *      couleur selon la nature de la décision.
 *
 * Tout passe par des classes CSS et une variable d'intensité. Aucune boucle
 * d'animation en JavaScript : le navigateur compose sur le processeur
 * graphique, ce qui reste fluide sur un téléphone d'entrée de gamme.
 *
 * Le déplacement d'un personnage — la marche — demande une autre matière :
 * une planche de sprites ou une figure articulée en SVG. Voir `marcheur.js`.
 * ---------------------------------------------------------------------------
 */

import { auMot, auChangement } from './voice.js';
import { state } from './state.js';

/** Éléments à animer pendant la parole. */
const CIBLES = ['hud-player-portrait', 'chapter-intro-portrait-img', 'perso-scene'];

/** Décroissance de l'impulsion de parole, en millisecondes. */
const RETOMBEE = 170;

let minuterieRetombee = null;

/**
 * Les animations sont-elles souhaitées ?
 * Respecte le réglage du jeu et la préférence système « réduire les animations ».
 * @returns {boolean}
 */
function animationsActives() {
    if (state.settings.animationsEnabled === false) return false;
    try {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
        return true;
    }
}

/** @returns {HTMLElement[]} les portraits présents à l'écran */
function portraits() {
    return CIBLES.map(id => document.getElementById(id)).filter(Boolean);
}

/**
 * Marque le début ou la fin de la parole.
 * @param {boolean} actif
 */
function parle(actif) {
    portraits().forEach(el => el.classList.toggle('parle', actif && animationsActives()));
    if (!actif) {
        portraits().forEach(el => el.style.removeProperty('--voix'));
        if (minuterieRetombee) { clearTimeout(minuterieRetombee); minuterieRetombee = null; }
    }
}


/**
 * Impulsion sur un mot prononcé.
 * L'intensité varie légèrement d'un mot à l'autre : une pulsation parfaitement
 * régulière ressemble à une machine, pas à quelqu'un qui parle.
 */
function surUnMot() {
    if (!animationsActives()) return;
    const intensite = (0.7 + Math.random() * 0.5).toFixed(2);
    portraits().forEach(el => el.style.setProperty('--voix', intensite));

    if (minuterieRetombee) clearTimeout(minuterieRetombee);
    minuterieRetombee = setTimeout(() => {
        portraits().forEach(el => el.style.setProperty('--voix', '0'));
    }, RETOMBEE);
}

/**
 * Réaction du portrait à une décision.
 * @param {'positif'|'negatif'|'neutre'} teinte
 */
export function reagir(teinte) {
    if (!animationsActives()) return;
    portraits().forEach(el => {
        el.classList.remove('reagit-positif', 'reagit-negatif', 'reagit-neutre');
        // Forcer un reflux du style relance l'animation même si la classe
        // précédente était identique.
        void el.offsetWidth;
        el.classList.add(`reagit-${teinte}`);
        setTimeout(() => el.classList.remove(`reagit-${teinte}`), 900);
    });
}

/**
 * Détermine la teinte d'une réaction d'après les effets d'un choix.
 * @param {object} effects
 * @returns {'positif'|'negatif'|'neutre'}
 */
export function teinteDuChoix(effects) {
    if (!effects) return 'neutre';
    const somme = Object.values(effects).reduce((a, b) => a + (Number(b) || 0), 0);
    if (somme > 4) return 'positif';
    if (somme < -4) return 'negatif';
    return 'neutre';
}

/**
 * Branche l'animation sur la voix. À appeler une fois au démarrage.
 */
export function initAnimation() {
    auChangement(parle);
    auMot(surUnMot);
}
