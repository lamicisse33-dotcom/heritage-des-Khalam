/**
 * voice.js — Lecture à voix haute des textes du jeu.
 * ---------------------------------------------------------------------------
 * S'appuie sur la synthèse vocale du navigateur (Web Speech API). Aucun
 * fichier audio n'est téléchargé : la voix est produite par l'appareil, ce qui
 * ne coûte rien en poids et fonctionne hors ligne.
 *
 * Trois précautions, apprises des pièges habituels de cette API :
 *
 *  1. La liste des voix arrive de façon asynchrone sur Chrome et Android :
 *     un premier appel à getVoices() renvoie souvent un tableau vide. On
 *     s'abonne donc à `voiceschanged` et on retente.
 *
 *  2. iOS refuse de parler tant que l'utilisateur n'a pas fait un geste. Le
 *     jeu ayant déjà son écran « Touchez pour commencer », on en profite pour
 *     débloquer la synthèse au même moment.
 *
 *  3. La musique et la voix se recouvrent. On abaisse le volume de la musique
 *     pendant la lecture, puis on le rétablit — plutôt que de couper, ce qui
 *     produirait un silence brutal à chaque scène.
 * ---------------------------------------------------------------------------
 */

import { state } from './state.js';
import { audio } from './audio.js';

/** Volume de la musique pendant une lecture, en proportion du volume normal. */
const ATTENUATION = 0.3;

/** Volume nominal de la musique, mémorisé avant atténuation. */
let volumeMusique = 0.3;

/** Voix française retenue, choisie une fois pour toutes. */
let voixFr = null;

/** Vrai une fois qu'un geste utilisateur a débloqué la synthèse. */
let debloquee = false;

const supportee = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function';

/**
 * La synthèse vocale est-elle utilisable sur cet appareil ?
 * @returns {boolean}
 */
export function voixDisponible() {
    return supportee;
}

/**
 * Choisit la meilleure voix française disponible.
 * Les voix locales sont préférées aux voix distantes : elles démarrent plus
 * vite et fonctionnent sans réseau.
 */
function choisirVoix() {
    if (!supportee) return;
    const voix = window.speechSynthesis.getVoices();
    if (!voix.length) return;               // pas encore chargées, on retentera

    const fr = voix.filter(v => (v.lang || '').toLowerCase().startsWith('fr'));
    if (!fr.length) return;

    voixFr = fr.find(v => v.localService) || fr[0];
}

if (supportee) {
    choisirVoix();
    window.speechSynthesis.addEventListener('voiceschanged', choisirVoix);
}

/**
 * Débloque la synthèse vocale. À appeler depuis un geste de l'utilisateur,
 * sans quoi iOS restera muet toute la session.
 */
export function debloquerVoix() {
    if (!supportee || debloquee) return;
    try {
        // Un énoncé vide et silencieux suffit à obtenir l'autorisation.
        const amorce = new SpeechSynthesisUtterance('');
        amorce.volume = 0;
        window.speechSynthesis.speak(amorce);
        debloquee = true;
        choisirVoix();
    } catch (e) {
        // Synthèse indisponible : le jeu reste jouable en silence.
    }
}

/**
 * Prépare un texte pour la lecture.
 * Retire les guillemets typographiques qui font trébucher certaines voix et
 * marque les fins de phrase pour obtenir un débit plus naturel.
 * @param {string} texte
 * @returns {string}
 */
function preparer(texte) {
    return String(texte || '')
        .replace(/[«»""]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Rétablit le volume de la musique après une lecture. */
function rendreLeSon() {
    if (audio.bgm) audio.bgm.volume = volumeMusique;
}

/**
 * Lit un texte à voix haute.
 * Toute lecture en cours est interrompue : deux voix simultanées seraient
 * inintelligibles, et le joueur qui avance vite ne veut pas entendre la scène
 * précédente.
 * @param {string} texte
 * @param {{taux?: number, hauteur?: number}} [options]
 */
export function lire(texte, options = {}) {
    if (!supportee || !state.settings.voiceEnabled) return;

    const contenu = preparer(texte);
    if (!contenu) return;

    stopper();

    const e = new SpeechSynthesisUtterance(contenu);
    e.lang = 'fr-FR';
    if (voixFr) e.voice = voixFr;
    e.rate = options.taux ?? state.settings.voiceRate ?? 0.95;
    e.pitch = options.hauteur ?? 1.0;
    e.volume = 1.0;

    // Atténuation de la musique pendant la lecture.
    if (audio.bgm) {
        volumeMusique = audio.bgm.volume > 0 ? audio.bgm.volume : volumeMusique;
        audio.bgm.volume = volumeMusique * ATTENUATION;
    }

    e.onend = rendreLeSon;
    e.onerror = rendreLeSon;

    try {
        window.speechSynthesis.speak(e);
    } catch (err) {
        rendreLeSon();
    }
}

/**
 * Interrompt la lecture en cours et rend son volume à la musique.
 * À appeler à chaque changement d'écran ou de scène.
 */
export function stopper() {
    if (!supportee) return;
    try {
        window.speechSynthesis.cancel();
    } catch (e) {
        // sans conséquence
    }
    rendreLeSon();
}

/**
 * Active ou coupe la lecture à voix haute.
 * @returns {boolean} le nouvel état
 */
export function basculerVoix() {
    state.settings.voiceEnabled = !state.settings.voiceEnabled;
    if (!state.settings.voiceEnabled) stopper();
    else debloquerVoix();
    return state.settings.voiceEnabled;
}
