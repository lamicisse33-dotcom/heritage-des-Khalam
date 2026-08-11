import { state } from './state.js';

export const audio = {
    bgm: null,
    sfx: {},
    isInitialized: false
};

const ASSETS = {
    music: 'ambient-theme.mp3',
    click: 'ui-click.mp3',
    success: 'ui-click.mp3', // Placeholder
    transition: 'ui-click.mp3' // Placeholder
};

export async function initAudio() {
    if (audio.isInitialized) return;

    // Background Music
    audio.bgm = new Audio(ASSETS.music);
    audio.bgm.loop = true;
    audio.bgm.volume = 0.3;

    // SFX
    audio.sfx.click = createAudio(ASSETS.click, 0.4);
    audio.sfx.success = createAudio(ASSETS.success, 0.5);
    audio.sfx.transition = createAudio(ASSETS.transition, 0.6);

    audio.isInitialized = true;
}

function createAudio(src, volume) {
    const a = new Audio(src);
    a.volume = volume;
    return a;
}

export function playMusic(fadeTime = 1000) {
    if (!audio.isInitialized || !state.settings.musicEnabled) return;
    
    audio.bgm.play().catch(e => { /* Silently catch play errors */ });
}

export function toggleMusic() {
    state.settings.musicEnabled = !state.settings.musicEnabled;
    if (state.settings.musicEnabled) {
        playMusic();
    } else {
        if (audio.bgm) audio.bgm.pause();
    }
}

export function toggleSFX() {
    state.settings.sfxEnabled = !state.settings.sfxEnabled;
}

export function playSFX(name) {
    if (!audio.isInitialized || !audio.sfx[name] || !state.settings.sfxEnabled) return;
    
    // Clone and play to allow rapid clicks
    const sound = audio.sfx[name].cloneNode();
    sound.volume = Math.max(0, Math.min(1, audio.sfx[name].volume));
    sound.play().catch(e => { /* Silently catch play errors */ });
}

export function setMusicVolume(val) {
    if (audio.bgm) audio.bgm.volume = val;
}
