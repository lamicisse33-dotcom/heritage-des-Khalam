/**
 * cinematique.js — Séquences narratives en plans.
 * ---------------------------------------------------------------------------
 * Un dilemme ordinaire montre une image fixe et un texte. Une cinématique
 * enchaîne plusieurs plans, chacun avec son mouvement de caméra, son texte et
 * sa durée, séparés par des fondus. C'est la grammaire du roman visuel : pas
 * de la vidéo, du montage.
 *
 * Un plan peut porter :
 *   - un décor et, par-dessus, un ou deux personnages en pied ;
 *   - un mouvement de caméra ('avance', 'recule', 'gauche', 'droite', 'fixe') ;
 *   - une marche, qui fait traverser l'écran au personnage ;
 *   - une décision, qui suspend la séquence jusqu'au choix du joueur.
 *
 * La séquence est pilotée par le temps mais reste interruptible : un appui
 * passe au plan suivant. Personne ne doit être prisonnier d'une cinématique.
 * ---------------------------------------------------------------------------
 */

import { state, saveGame } from './state.js';
import { lire, stopper } from './voice.js';
import { PALIERS } from './config.js';

/** Durée d'un fondu entre deux plans, en millisecondes. */
const FONDU = 900;

/** Séquence en cours, ou null. */
let sequence = null;
let indexPlan = 0;
let minuterie = null;
let surFin = null;

/**
 * Portrait en pied du joueur, en tenue de soirée.
 * @returns {string}
 */
function tenueDuJoueur() {
    return state.user.protagonist === 'Mila' ? 'mila-soiree.webp' : 'didi-soiree.webp';
}

/**
 * Portrait en pied du conjoint, en tenue de soirée.
 * @returns {string}
 */
function tenueDuConjoint() {
    return state.user.protagonist === 'Mila' ? 'didi-soiree.webp' : 'mila-soiree.webp';
}

/**
 * Les deux poses de marche du joueur, en tenue de soirée.
 *
 * Non employées par le prologue, qui utilise l'image du couple enlacé. Gardées
 * pour toute scène où l'un des deux marche seul : les visuels existent, sont
 * recadrés au gabarit du projet et alignés au pixel.
 * @returns {string[]} [pose 1, pose 2]
 */
// eslint-disable-next-line no-unused-vars
function marcheDuJoueur() {
    return state.user.protagonist === 'Mila'
        ? ['mila-marche-1.webp', 'mila-marche-2.webp']
        : ['didi-marche-1.webp', 'didi-marche-2.webp'];
}

/**
 * Les deux poses de marche du conjoint, en tenue de soirée. En réserve, comme
 * `marcheDuJoueur`.
 * @returns {string[]} [pose 1, pose 2]
 */
// eslint-disable-next-line no-unused-vars
function marcheDuConjoint() {
    return state.user.protagonist === 'Mila'
        ? ['didi-marche-1.webp', 'didi-marche-2.webp']
        : ['mila-marche-1.webp', 'mila-marche-2.webp'];
}

/**
 * Construit le balisage d'un plan.
 *
 * Un personnage se déclare de deux façons :
 *   - `src` : une image fixe ;
 *   - `poses` : deux images alternées, ce qui donne la marche. Les deux sont
 *     empilées au même endroit et c'est leur opacité que le CSS commute —
 *     aucune boucle JavaScript, le navigateur compose sur le GPU.
 *
 * @param {object} plan
 * @returns {string}
 */
function baliserPlan(plan) {
    const perso = plan.personnages || [];
    return `
        <div class="cine-plan" data-camera="${plan.camera || 'fixe'}">
            <img class="cine-decor" src="${plan.decor}" alt="">
            ${perso.map(p => p.poses ? `
                <span class="cine-perso cine-marche ${p.place}">
                    <img src="${p.poses[0]}" alt="">
                    <img src="${p.poses[1]}" alt="">
                </span>
            ` : `
                <img class="cine-perso ${p.place}${p.avant ? ' cine-avant' : ''}" src="${p.src}" alt="">
            `).join('')}
            <div class="cine-voile"></div>
        </div>
        <p class="cine-texte">${plan.texte || ''}</p>
        ${plan.decision ? `
        <div class="cine-choix">
            ${plan.decision.options.map((o, i) =>
                `<button class="choice-btn" data-cine-choix="${i}"><span>${o.texte}</span></button>`
            ).join('')}
        </div>` : ''}
    `;
}

/**
 * Affiche le plan courant.
 * @param {HTMLElement} hote
 */
function jouerPlan(hote) {
    const plan = sequence[indexPlan];
    if (!plan) { terminer(); return; }

    hote.innerHTML = `<div class="cine-scene">${baliserPlan(plan)}</div>`;
    const scene = hote.querySelector('.cine-scene');

    // Lecture du texte du plan, s'il y en a un.
    if (plan.texte) lire(plan.texte.replace(/<[^>]+>/g, ' '));

    if (plan.decision) {
        // La séquence s'arrête : c'est au joueur de trancher.
        hote.querySelectorAll('[data-cine-choix]').forEach(b => {
            b.addEventListener('click', () => {
                const opt = plan.decision.options[Number(b.dataset.cineChoix)];
                appliquerChoix(opt);
                indexPlan++;
                enchainer(hote);
            }, { once: true });
        });
        return;
    }

    // Un appui n'importe où passe au plan suivant : la durée est un plancher,
    // pas une contrainte.
    const avancer = () => { if (minuterie) clearTimeout(minuterie); indexPlan++; enchainer(hote); };
    scene.addEventListener('click', avancer, { once: true });

    minuterie = setTimeout(avancer, plan.duree || 5000);
}

/**
 * Applique les conséquences d'un choix de cinématique.
 * @param {object} opt
 */
function appliquerChoix(opt) {
    if (opt.effects) {
        Object.entries(opt.effects).forEach(([k, v]) => {
            if (state.progress.stats[k] === undefined) return;
            state.progress.stats[k] = Math.max(0, Math.min(100, state.progress.stats[k] + v));
        });
    }
    if (opt.relationships) {
        Object.entries(opt.relationships).forEach(([k, v]) => {
            const c = state.progress.characters[k];
            if (c) c.relationship = Math.max(0, Math.min(100, c.relationship + v));
        });
    }
    if (opt.memories) {
        Object.entries(opt.memories).forEach(([k, v]) => { state.progress.memories[k] = v; });
    }
    saveGame();
}

/**
 * Enchaîne sur le plan suivant, avec un fondu.
 * @param {HTMLElement} hote
 */
function enchainer(hote) {
    stopper();
    const scene = hote.querySelector('.cine-scene');
    if (!scene) { jouerPlan(hote); return; }
    scene.classList.add('sortie');
    setTimeout(() => jouerPlan(hote), FONDU * 0.55);
}

function terminer() {
    if (minuterie) { clearTimeout(minuterie); minuterie = null; }
    stopper();
    sequence = null;
    const f = surFin;
    surFin = null;
    if (f) f();
}

/**
 * Lance une séquence de plans.
 * @param {HTMLElement} hote élément qui reçoit la cinématique
 * @param {object[]} plans
 * @param {() => void} [fin] appelé à la fin de la séquence
 */
export function jouerCinematique(hote, plans, fin) {
    sequence = plans;
    indexPlan = 0;
    surFin = fin || null;
    jouerPlan(hote);
}

/**
 * Interrompt la séquence en cours, s'il y en a une.
 */
export function arreterCinematique() {
    if (sequence) terminer();
}

/**
 * LA DEMANDE — prologue.
 * ---------------------------------------------------------------------------
 * Un samedi soir. Le couple quitte l'appartement, marche sur la corniche des
 * Almadies, dîne face à l'océan. Et le joueur décide s'il pose la question.
 *
 * La scène est écrite du point de vue du joueur, qui est toujours celui qui
 * demande : un seul texte, aucun embranchement selon le personnage choisi.
 * @returns {object[]}
 */
export function sequenceDeLaDemande() {
    return [
        {
            decor: 'scene-demande-1-hall.webp',
            camera: 'avance',
            duree: 7000,
            personnages: [
                { src: tenueDuJoueur(), place: 'gauche' },
                { src: tenueDuConjoint(), place: 'droite' }
            ],
            texte: `Samedi soir. Le hall de l'immeuble sent encore la chaleur du jour. ` +
                   `{partenaire} t'attend près de la porte, prêt[/e] depuis dix minutes, ` +
                   `et fait semblant de ne pas l'être. Dans ta poche, quelque chose pèse ` +
                   `plus lourd que son poids.`
        },
        {
            decor: 'scene-demande-2-corniche.webp',
            // Travelling avant marqué. La corniche est un décor en profondeur :
            // un panoramique latéral ferait glisser la caméra de côté, alors
            // qu'un travelling avant fait défiler les bornes et les lampadaires
            // sur les côtés — c'est ce qu'on voit en marchant.
            camera: 'marche',
            duree: 8000,
            // Le couple est dessiné sur une seule image, bras dessus bras
            // dessous. Deux personnages animés séparément auraient demandé
            // d'accorder leurs phases ; ici le dessin s'en charge.
            personnages: [
                { poses: ['couple-marche-1.webp', 'couple-marche-2.webp'], place: 'couple' }
            ],
            texte: `La corniche des Almadies. L'océan cogne en contrebas, régulier, ` +
                   `patient. Vous marchez sans parler — pas par gêne, par confort. ` +
                   `Il y a des silences qui valent des conversations entières.`
        },
        {
            decor: 'scene-demande-3-entree.webp',
            camera: 'avance',
            duree: 6500,
            personnages: [
                { src: tenueDuConjoint(), place: 'droite' }
            ],
            texte: `L'Océane. Tu as réservé il y a trois semaines, sans rien dire. ` +
                   `{partenaire} lève les yeux vers l'enseigne, puis vers toi. ` +
                   `« Tout ça pour un samedi ordinaire ? »`
        },
        {
            decor: 'scene-demande-4-table.webp',
            camera: 'recule',
            duree: 8000,
            // Mila à gauche, Didi à droite — les mêmes places que sur l'image
            // du couple qui marche. Deux plans consécutifs qui les inverseraient
            // donneraient l'impression qu'ils ont changé de côté.
            // `avant: true` fait repasser la nappe par-dessus : ils sont assis
            // derrière la table, pas posés devant.
            personnages: [
                { src: 'mila-assis.webp', place: 'assis-gauche' },
                { src: 'didi-assise.webp', place: 'assis-droite' },
                { src: 'decor-table-nappe.webp', place: 'nappe', avant: true }
            ],
            texte: `Le dîner passe trop vite. Vous parlez de tout — du travail, de la ` +
                   `famille, de cette maison qu'on visitera peut-être un jour. ` +
                   `Puis les assiettes s'en vont, et il ne reste que la bougie, ` +
                   `la mer, et cette chose dans ta poche.`
        },
        {
            decor: 'scene-demande-5-ecrin.webp',
            camera: 'avance',
            duree: 0,
            personnages: [],
            texte: `Le moment est là. Personne ne t'y oblige. ` +
                   `Il y a mille bonnes raisons d'attendre encore un peu.`,
            decision: {
                options: [
                    {
                        texte: 'Poser la question, maintenant.',
                        effects: { love: 14, spirituality: 6, argent: -5 },
                        relationships: { partner: 18 },
                        memories: { demande_faite: true },
                        suite: 5
                    },
                    {
                        texte: 'Refermer la poche. Ce n\'est pas le bon soir.',
                        effects: { love: -4, health: 3 },
                        relationships: { partner: -3 },
                        memories: { demande_faite: false },
                        suite: 6
                    }
                ]
            }
        },
        {
            decor: 'scene-demande-6-aube.webp',
            camera: 'gauche',
            duree: 9000,
            personnages: [
                { src: tenueDuConjoint(), place: 'centre' }
            ],
            texte: `Vous êtes restés jusqu'à ce que le ciel pâlisse. ` +
                   `Rien n'est réglé — ni le travail, ni l'argent, ni les silences ` +
                   `de ta famille. Mais quelque chose a été dit qui ne se reprend pas. ` +
                   `<br><br>Ce que vous en ferez, c'est l'histoire qui commence.`
        }
    ];
}
