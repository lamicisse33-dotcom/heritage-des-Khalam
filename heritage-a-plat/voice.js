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

/**
 * Voix retenues, une par genre.
 * Didi est une femme, Mila un homme : leur faire partager la même voix de
 * synthèse casse l'incarnation dès la première phrase.
 */
let voixFeminine = null;
let voixMasculine = null;
let voixNeutre = null;

/**
 * Noms de voix françaises connus, par genre.
 * L'API n'expose aucune information de genre : il faut donc reconnaître les
 * voix par leur nom. La liste couvre iOS, macOS, Android et les principaux
 * navigateurs de bureau ; tout ce qui n'y figure pas passe par une heuristique
 * puis, en dernier recours, par la première voix française disponible.
 */
const VOIX_FEMININES = ['amélie','amelie','audrey','aurelie','aurélie','marie','virginie',
    'chantal','céline','celine','julie','léa','lea','flore','sandy',
    'microsoft hortense','hortense','microsoft julie','siri female','female'];
const VOIX_MASCULINES = ['thomas','nicolas','daniel','paul','henri','mathieu','rémy','remy',
    'microsoft paul','siri male','male'];

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

    // Les voix installées localement démarrent plus vite et fonctionnent hors
    // ligne : on les préfère à qualité de genre égale.
    const parPreference = fr.slice().sort((a, b) =>
        (b.localService ? 1 : 0) - (a.localService ? 1 : 0));

    const correspond = (v, liste) => {
        const n = (v.name || '').toLowerCase();
        return liste.some(m => n.includes(m));
    };

    voixFeminine  = parPreference.find(v => correspond(v, VOIX_FEMININES)) || null;
    voixMasculine = parPreference.find(v => correspond(v, VOIX_MASCULINES)) || null;
    voixNeutre    = parPreference[0] || null;

    // Certains systèmes ne nomment pas leurs voix de façon reconnaissable —
    // « français (France) » ne dit rien du genre. On ne devine pas : les deux
    // personnages partagent alors la même voix, et c'est la hauteur qui les
    // distingue au moment de l'énoncé.
    if (!voixFeminine) voixFeminine = voixNeutre;
    if (!voixMasculine) voixMasculine = voixNeutre;
}

/**
 * Voix correspondant au protagoniste joué.
 * @returns {{voix: SpeechSynthesisVoice|null, hauteur: number}}
 */
function voixDuPersonnage() {
    // Mila est le personnage masculin, Didi le personnage féminin.
    const estHomme = state.user.protagonist === 'Mila';
    const voix = estHomme ? voixMasculine : voixFeminine;

    // Si l'appareil n'offre qu'une seule voix française, on écarte les deux
    // personnages par la hauteur : imparfait, mais préférable à deux voix
    // rigoureusement identiques.
    const unique = voixFeminine === voixMasculine;
    let hauteur = 1.0;
    if (unique) hauteur = estHomme ? 0.82 : 1.16;

    return { voix, hauteur };
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

    const perso = voixDuPersonnage();

    const e = new SpeechSynthesisUtterance(contenu);
    e.lang = 'fr-FR';
    if (perso.voix) e.voice = perso.voix;
    e.rate = options.taux ?? state.settings.voiceRate ?? 0.95;
    e.pitch = options.hauteur ?? perso.hauteur;
    e.volume = 1.0;

    // Atténuation de la musique pendant la lecture.
    if (audio.bgm) {
        volumeMusique = audio.bgm.volume > 0 ? audio.bgm.volume : volumeMusique;
        audio.bgm.volume = volumeMusique * ATTENUATION;
    }

    // Rythme réel : un battement par mot prononcé.
    let boundaryVu = false;
    e.onboundary = (ev) => {
        if (ev.name === 'word' || ev.charLength) {
            boundaryVu = true;
            arreterSecours();
            battre();
        }
    };

    const finir = () => { arreterSecours(); rendreLeSon(); signaler(false); };
    e.onend = finir;
    e.onerror = finir;

    try {
        window.speechSynthesis.speak(e);
        signaler(true);
        battre();

        // Rythme de secours si le moteur n'émet pas `boundary` : cadence
        // moyenne d'un lecteur français, ajustée au débit choisi.
        arreterSecours();
        const intervalle = Math.round(340 / (e.rate || 1));
        rythmeSecours = setInterval(() => {
            if (boundaryVu || !window.speechSynthesis.speaking) { arreterSecours(); return; }
            battre();
        }, intervalle);
    } catch (err) {
        finir();
    }
}

/**
 * Une lecture est-elle en cours ?
 * @returns {boolean}
 */
export function enLecture() {
    return supportee && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
}

/**
 * Enregistre une fonction appelée à chaque début et fin de lecture, pour que
 * l'interface puisse refléter l'état du bouton de lecture.
 * @param {(actif:boolean)=>void} f
 */
/**
 * Abonnés aux changements d'état de la lecture.
 * Une liste, et non un unique abonné : le bouton de lecture et l'animation des
 * personnages écoutent tous deux, et le second ne doit pas chasser le premier.
 */
const auxChangements = [];

/**
 * Enregistre une fonction appelée au début et à la fin de chaque lecture.
 * @param {(actif:boolean)=>void} f
 */
export function auChangement(f) {
    if (typeof f === 'function' && !auxChangements.includes(f)) auxChangements.push(f);
}

/** Notifie tous les abonnés d'un changement d'état. */
function signaler(actif) {
    auxChangements.forEach(f => {
        try { f(actif); } catch (e) { /* un abonné défaillant n'arrête pas les autres */ }
    });
}

/* --------------------------------------------------------------------------
   Rythme de la parole
   --------------------------------------------------------------------------
   Pour animer un personnage qui parle, il faut savoir *quand* il parle, pas
   seulement qu'il parle. L'API émet un événement `boundary` à chaque mot, ce
   qui donne le rythme exact de la voix.

   Tous les moteurs ne l'émettent pas — c'est notamment inégal sur Android. On
   prévoit donc un rythme de secours, calculé à partir du débit choisi, pour
   que l'animation existe partout.
   -------------------------------------------------------------------------- */

/** Abonnés au rythme de la parole. */
const auxMots = [];

/**
 * Enregistre une fonction appelée à chaque mot prononcé.
 * @param {() => void} f
 */
export function auMot(f) { auxMots.push(f); }

function battre() { auxMots.forEach(f => f()); }

/** Minuterie du rythme de secours. */
let rythmeSecours = null;

function arreterSecours() {
    if (rythmeSecours) { clearInterval(rythmeSecours); rythmeSecours = null; }
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
    arreterSecours();
    rendreLeSon();
    signaler(false);
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
