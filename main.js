/**
 * main.js — Amorçage du jeu.
 * Rôle : initialiser l'état, construire l'interface, débloquer l'audio après
 * un geste utilisateur, puis passer la main à ui.js.
 */
import { initAudio, playMusic, playSFX } from './audio.js';
import { debloquerVoix } from './voice.js';
import { initUI, showScreen, screens, showChapterIntro, updateProfileAvatar } from './ui.js';
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

