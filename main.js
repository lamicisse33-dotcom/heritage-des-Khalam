/**
 * main.js — Amorçage du jeu.
 * Rôle : initialiser l'état, construire l'interface, débloquer l'audio après
 * un geste utilisateur, puis passer la main à ui.js.
 */
import { initAudio, playMusic, playSFX } from './audio.js';
import { debloquerVoix } from './voice.js';
import { initUI, showScreen, screens, showChapterIntro, updateProfileAvatar,
         jouerPrologue } from './ui.js';
import { state, checkSave, saveGame, resetForNewLife } from './state.js';
import { JEU } from './config.js';

/** Version du build, définie dans config.js. */
const BUILD_TAG = JEU.BUILD_TAG;

async function bootstrap() {
    // Initialize state
    checkSave();

    // Setup UI
    initUI(handleStartNewGame, handleContinueGame, handleProfileComplete, handleProtagonistSelected);

    // Initial font size
    document.body.className = `text-${state.settings.fontSize || 'md'}`;

    // SFX Listener to bridge UI and Audio modules
    window.addEventListener('play-sfx', (e) => playSFX(e.detail.key));

    // Audio unlock prompt
    const audioPrompt = document.getElementById('audio-prompt');
    const promptBox = audioPrompt.querySelector('.prompt-box');
    const startAudioBtn = document.getElementById('start-audio-btn');

    const handleStart = async (e) => {
        e.stopPropagation();
        if (audioPrompt.classList.contains('hidden') || audioPrompt.classList.contains('fade-out')) return;
        
        audioPrompt.classList.add('fade-out');
        
        try {
            await initAudio();
            playMusic();
            // iOS refuse la synthèse vocale tant qu'aucun geste utilisateur
            // n'a eu lieu : ce bouton est le moment idoine pour l'autoriser.
            debloquerVoix();
        } catch (error) {
            // Silently fail if audio context cannot start
        }
        
        setTimeout(() => {
            audioPrompt.classList.add('hidden');
            showScreen(screens.HOME);
        }, 600);
    };

    // Make button, text, and box clickable
    startAudioBtn.addEventListener('click', handleStart);
    promptBox.addEventListener('click', handleStart);
    audioPrompt.addEventListener('click', handleStart);

    // Handle orientation changes or resizing
    window.addEventListener('resize', handleResize);
    handleResize();

    // Signale au filet de diagnostic que tout s'est bien chargé.
    window.__JEU_PRET__ = true;
    console.log(`${JEU.TITRE_COMPLET} — build ${BUILD_TAG}`);
}

function handleStartNewGame() {
    resetForNewLife();
    showScreen(screens.PROTO_SELECT);
}

function handleProtagonistSelected() {
    updateProfileAvatar();
    showScreen(screens.PROFILE);
}

async function handleProfileComplete(profileData) {
    state.user.name = profileData.name;
    state.user.dob = profileData.dob;
    
    // Final save before start
    saveGame();
    
    // Transition effect
    const transitionScreen = document.getElementById('transition-screen');
    transitionScreen.classList.add('active');
    
    setTimeout(async () => {
        transitionScreen.classList.remove('active');

        // Le prologue ouvre la partie : la demande, un samedi soir. Il ne se
        // joue qu'à la première vie — le revoir à chaque fois deviendrait une
        // corvée. Les vies suivantes commencent au chapitre 1.
        if (state.meta.livesCount === 0) {
            jouerPrologue(async () => {
                await showChapterIntro(0);
                showScreen(screens.GAME);
            });
            return;
        }

        await showChapterIntro(0);
        showScreen(screens.GAME);
    }, 1000);
}

function handleContinueGame() {
    showScreen(screens.GAME);
}

function handleResize() {
    // Mobile scaling adjustments if needed
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Détection d'une nouvelle version.
 * ---------------------------------------------------------------------------
 * Le service worker sert les ressources depuis son cache : une fois le jeu
 * ouvert, rien ne signale au joueur qu'une version plus récente a été déposée.
 * Il continue de jouer l'ancienne sans le savoir.
 *
 * On ne se fie pas à `registration.waiting` : `skipWaiting()` est appelé dès
 * l'installation, si bien qu'aucun worker ne reste en attente. On compare donc
 * directement le `BUILD_TAG` du fichier en ligne à celui qui tourne.
 */
const DELAI_VERIFICATION = 60 * 1000;

/**
 * Va chercher le BUILD_TAG publié, en contournant tous les caches.
 * @returns {Promise<string|null>}
 */
async function tagPublie() {
    try {
        const r = await fetch(`config.js?_=${Date.now()}`, { cache: 'no-store' });
        if (!r.ok) return null;
        const texte = await r.text();
        const m = texte.match(/BUILD_TAG:\s*'([^']+)'/);
        return m ? m[1] : null;
    } catch (e) {
        return null;   // hors ligne : ce n'est pas une erreur, juste rien à dire
    }
}

/** Affiche le bandeau de mise à jour. Une seule fois par session. */
function annoncerMiseAJour(tag) {
    if (document.getElementById('maj-bandeau')) return;

    const bandeau = document.createElement('div');
    bandeau.id = 'maj-bandeau';
    bandeau.setAttribute('role', 'status');
    bandeau.innerHTML = `
        <div class="maj-texte">
            <strong>Une nouvelle version est disponible</strong>
            <span>${BUILD_TAG} → ${tag}</span>
        </div>
        <button id="maj-btn" class="choice-btn"><span>Mettre à jour</span></button>
        <button id="maj-plus-tard" class="maj-fermer" aria-label="Plus tard">×</button>
    `;
    document.body.appendChild(bandeau);
    requestAnimationFrame(() => bandeau.classList.add('visible'));

    document.getElementById('maj-btn').addEventListener('click', async () => {
        bandeau.querySelector('.maj-texte strong').textContent = 'Mise à jour…';
        // La partie en cours est sauvée avant tout : un rechargement ne doit
        // jamais coûter une progression.
        try { saveGame(); } catch (e) { /* rien à sauver */ }
        try {
            const cles = await caches.keys();
            await Promise.all(cles.map((k) => caches.delete(k)));
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.unregister();
        } catch (e) {
            // Sans cache à purger, le rechargement suffit.
        }
        location.reload();
    });

    document.getElementById('maj-plus-tard').addEventListener('click', () => {
        bandeau.classList.remove('visible');
        setTimeout(() => bandeau.remove(), 400);
    });
}

/** Compare la version publiée à celle qui tourne, et prévient si elles diffèrent. */
async function verifierMiseAJour() {
    const tag = await tagPublie();
    if (tag && tag !== BUILD_TAG) annoncerMiseAJour(tag);
}

/**
 * Service worker : mise en cache de la coquille et des ressources, pour un
 * démarrage rapide et un fonctionnement hors ligne. Enregistré après `load`
 * afin de ne pas concurrencer le premier rendu.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
            // Absence de service worker : le jeu fonctionne normalement, sans cache.
        });
    });
}

// Une vérification au démarrage, puis à chaque retour sur l'onglet : c'est là
// que le joueur revient après avoir laissé le jeu ouvert des heures.
setTimeout(verifierMiseAJour, 3000);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        clearTimeout(window.__majMinuterie);
        window.__majMinuterie = setTimeout(verifierMiseAJour, DELAI_VERIFICATION);
    }
});

// Start the app
bootstrap();
createParticles();

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 2 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 15}s`;
        p.style.animationDuration = `${10 + Math.random() * 10}s`;
        fragment.appendChild(p);
    }
    container.appendChild(fragment);
}

