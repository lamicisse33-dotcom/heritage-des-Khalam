import { state, checkSave, saveGame, recordLifeEnd, resetForNewLife, clearSave } from './state.js';
import { STORY_DATA, ACHIEVEMENTS, getCurrentEvent, advanceStory, calculateBalance,
         checkAchievements, getReputationTags, evaluateLifePath,
         appliquerUsure, USURE_PAR_CHAPITRE } from './story.js';
import { toggleMusic, toggleSFX } from './audio.js';
import { PILIERS, NIVEAUX, libelleDe, largeurJauge, niveauDe, nomDuPilier,
         CHIFFRES_VISIBLES } from './pillars.js';
import { JEU, VISUELS } from './config.js';

/**
 * UI Constants & State
 */
const screenContainer = document.getElementById('screen-container');
const domCache = new Map();

/** Minuterie de l'animation de frappe en cours (une seule à la fois). */
let typingTimer = null;

/**
 * Helper: Get or Cache DOM Element
 */
function getEl(id) {
    const cached = domCache.get(id);

    // Un nœud mis en cache puis retiré du document (innerHTML remplacé,
    // écran reconstruit…) doit être oublié, sinon on écrit dans le vide.
    if (cached && cached.isConnected) return cached;

    const el = document.getElementById(id);
    if (el) domCache.set(id, el);
    else domCache.delete(id);
    return el;
}

/**
 * Vide le cache DOM. À appeler avant toute reconstruction complète d'écrans.
 */
function resetDomCache() {
    domCache.clear();
}

/**
 * Portrait en buste du protagoniste choisi.
 * Destiné aux conteneurs rectangulaires : carte de sélection, illustration de
 * dilemme lorsque la scène n'en fournit pas.
 * @returns {string}
 */
function portraitJoueur() {
    return state.user.protagonist === 'Mila' ? VISUELS.MILA : VISUELS.DIDI;
}

/**
 * Vignette carrée centrée sur le visage.
 * Destinée aux affichages circulaires : un `object-fit: cover` appliqué au
 * portrait en buste y recadrerait le torse et non le visage.
 * @returns {string}
 */
function avatarJoueur() {
    return state.user.protagonist === 'Mila' ? VISUELS.MILA_AVATAR : VISUELS.DIDI_AVATAR;
}

/**
 * Helper: Format Text for Gender
 */
function formatText(text) {
    if (!text) return '';
    const isMale = state.user.protagonist === 'Mila';
    return text.replace(/\[([^/]+)\/([^\]]+)\]/g, (_, m, f) => isMale ? m : f);
}

/**
 * Helper: Play SFX via Event
 */
function playSFX(key) {
    window.dispatchEvent(new CustomEvent('play-sfx', { detail: { key } }));
}

export const screens = {
    HOME: 'home',
    SETTINGS: 'settings',
    TUTORIAL: 'tutorial',
    PROTO_SELECT: 'proto-select',
    PROFILE: 'profile',
    TRANSITION: 'transition',
    GAME: 'game',
    HALL: 'hall',
    CHAPTER_INTRO: 'chapter-intro',
    ENCYCLOPEDIA: 'encyclopedia',
    GALLERY: 'gallery',
    JOURNAL: 'journal',
    ACHIEVEMENTS: 'achievements'
};

/**
 * UI Initialization
 */
export function initUI(onStartGame, onContinueGame, onProfileComplete, onProtagonistSelected) {
    // Clear container to prevent duplicates on hot-reload/restart
    screenContainer.innerHTML = '';
    resetDomCache();
    
    // Render all screen templates
    const templates = [
        getHomeTemplate(onStartGame, onContinueGame),
        getSettingsTemplate(),
        getTutorialTemplate(),
        getProtoSelectTemplate(onProtagonistSelected),
        getProfileTemplate(onProfileComplete),
        getTransitionTemplate(),
        getGameTemplate(),
        getHallTemplate(),
        getChapterIntroTemplate(),
        getEncyclopediaTemplate(),
        getJournalTemplate(),
        getAchievementsTemplate()
    ];
    
    screenContainer.insertAdjacentHTML('beforeend', templates.join(''));
    
    // Setup Global Event Listeners
    setupGlobalListeners();
    
    // Initial UI state setup
    bindScreenActions(onStartGame, onContinueGame, onProfileComplete, onProtagonistSelected);
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
            playSFX('click');
        }
    }, { capture: true });
}

function bindScreenActions(onStart, onContinue, onProfileComplete, onProtagonistSelected) {
    // Home
    getEl('start-btn').addEventListener('click', onStart);
    getEl('continue-btn').addEventListener('click', onContinue);
    getEl('tutorial-btn').addEventListener('click', () => showScreen(screens.TUTORIAL));
    getEl('achievements-btn').addEventListener('click', () => showScreen(screens.ACHIEVEMENTS));
    getEl('journal-btn').addEventListener('click', () => showScreen(screens.JOURNAL));
    getEl('hall-btn').addEventListener('click', () => showScreen(screens.HALL));
    getEl('encyclopedia-btn').addEventListener('click', () => showScreen(screens.ENCYCLOPEDIA));
    getEl('settings-btn').addEventListener('click', () => showScreen(screens.SETTINGS));

    // Settings
    getEl('settings-screen').querySelector('.back-btn').addEventListener('click', () => showScreen(screens.HOME));
    getEl('set-music').addEventListener('click', () => { toggleMusic(); saveGame(); updateSettingsUI(); });
    getEl('set-sfx').addEventListener('click', () => { toggleSFX(); saveGame(); updateSettingsUI(); });

    document.querySelectorAll('#set-speed button').forEach(b => b.addEventListener('click', () => {
        state.settings.textSpeed = Number(b.dataset.v);
        saveGame();
        updateSettingsUI();
    }));
    document.querySelectorAll('#set-font button').forEach(b => b.addEventListener('click', () => {
        state.settings.fontSize = b.dataset.v;
        document.body.className = `text-${b.dataset.v}`;
        saveGame();
        updateSettingsUI();
    }));

    getEl('clear-save-btn').addEventListener('click', () => {
        if (!confirm("Effacer définitivement votre destin ?")) return;
        // clearSave() ne touche qu'à la clé du jeu, contrairement à
        // localStorage.clear() qui effaçait aussi les données voisines.
        clearSave();
        window.location.reload();
    });

    // Tutorial
    getEl('tutorial-screen').querySelector('.back-btn').addEventListener('click', () => showScreen(screens.HOME));

    // Proto Select
    const protoScreen = getEl('proto-select-screen');
    protoScreen.querySelector('.back-btn').addEventListener('click', () => showScreen(screens.HOME));
    protoScreen.querySelectorAll('.choose-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.user.protagonist = e.currentTarget.dataset.proto;
            saveGame();
            onProtagonistSelected();
        });
    });

    // Profile
    const profileScreen = getEl('profile-screen');
    profileScreen.querySelector('.back-btn').addEventListener('click', () => showScreen(screens.PROTO_SELECT));
    getEl('start-destiny-btn').addEventListener('click', () => {
        const champ = getEl('profile-name');
        const name = champ.value.trim();
        if (!name) {
            // Signal visuel en place plutôt qu'une alerte système.
            champ.focus();
            champ.classList.add('champ-erreur');
            setTimeout(() => champ.classList.remove('champ-erreur'), 1200);
            return;
        }
        onProfileComplete({ name, dob: getEl('profile-dob').value });
    });

    // Game
    getEl('game-menu-btn').addEventListener('click', () => {
        if (!confirm("Retourner au menu principal ? Votre progression est sauvegardée.")) return;
        saveGame();
        showScreen(screens.HOME);
    });
    // Un `alert()` bloquait le fil et cassait la fluidité : retour en place.
    getEl('game-save-btn').addEventListener('click', (e) => {
        saveGame();
        const b = e.currentTarget;
        const ancien = b.textContent;
        b.textContent = 'OK ✓';
        setTimeout(() => { b.textContent = ancien; }, 1200);
    });
    getEl('continue-path-btn').addEventListener('click', handleContinuePathClick);

    // Other screens back buttons
    [screens.HALL, screens.ENCYCLOPEDIA, screens.JOURNAL, screens.ACHIEVEMENTS].forEach(s => {
        getEl(`${s}-screen`).querySelector('.back-btn').addEventListener('click', () => showScreen(screens.HOME));
    });
}

/**
 * Screen Navigation
 */
export function showScreen(screenId) {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => s.classList.remove('active'));
    
    const target = getEl(`${screenId}-screen`);
    if (target) {
        target.classList.add('active');
        updateScreenState(screenId);
    }
}

function updateScreenState(screenId) {
    switch(screenId) {
        case screens.HOME: updateHomeButtons(); break;
        case screens.GAME: updateHUD(); updateCurrentEventUI(); break;
        case screens.JOURNAL: updateJournalUI(); break;
        case screens.ACHIEVEMENTS: updateAchievementsUI(); break;
        case screens.HALL: updateHallUI(); break;
        case screens.ENCYCLOPEDIA: updateEncyclopediaUI(); break;
        case screens.SETTINGS: updateSettingsUI(); break;
    }
}

/**
 * UI Update Functions
 */
function updateHUD() {
    const nameEl = getEl('hud-player-name');
    const portraitEl = getEl('hud-player-portrait');
    
    if (nameEl) nameEl.textContent = state.user.name || state.user.protagonist;
    if (portraitEl) portraitEl.src = avatarJoueur();
    
    updatePillarGauges();
}

export function updatePillarGauges() {
    const stats = state.progress.stats;

    PILIERS.forEach(p => {
        const fill = getEl(`gauge-fill-${p.id}`);
        const lbl = getEl(`gauge-lbl-${p.id}`);
        if (fill) fill.style.width = largeurJauge(stats[p.id]);
        if (lbl) lbl.textContent = libelleDe(stats[p.id]);
    });

    const repEl = getEl('hud-reputation');
    if (repEl) {
        const tags = getReputationTags();
        repEl.textContent = tags.length > 0 ? tags.join(' • ') : 'En quête d\'équilibre';
    }

    const eqEl = getEl('hud-balance');
    if (eqEl) eqEl.textContent = calculateBalance().level;
}

function updateHomeButtons() {
    // Une sauvegarde existe dès la sélection du personnage ; proposer
    // « Continuer » avant le premier dilemme n'a pourtant aucun sens.
    const btn = getEl('continue-btn');
    const reprenable = checkSave() && (state.progress.chronology || []).length > 0;
    btn.disabled = !reprenable;
    btn.classList.toggle('disabled', !reprenable);
}

/**
 * Game Logic Bridge
 */
async function handleContinuePathClick() {
    const oldCh = state.progress.chapterIndex;
    const next = advanceStory();
    saveGame();

    // Plus d'événement : la vie est terminée, on dresse son bilan.
    if (!next) {
        showFinDeVie();
        return;
    }

    if (state.progress.chapterIndex !== oldCh) {
        // Le temps passe entre deux chapitres : chaque pilier perd du terrain.
        // Appliqué avant le bilan, pour que le joueur en voie le coût.
        appliquerUsure();
        calculateBalance();
        saveGame();
        showChapterSummary(oldCh);
        return;
    }
    updateCurrentEventUI();
}

/**
 * Balisage de la vue dilemme/résultat.
 * Extrait en fonction car il est reconstruit après chaque bilan de chapitre.
 * @returns {string}
 */
function getDilemmaViewMarkup() {
    return `
        <div id="dilemma-container" class="dilemma-card"></div>
        <div id="result-container" class="result-card hidden">
            <p id="result-text"></p>
            <button id="continue-path-btn" class="primary-btn">Continuer</button>
        </div>
    `;
}

/**
 * Reconstruit la vue dilemme et rebranche son bouton Continuer.
 */
function restoreDilemmaView() {
    const container = getEl('game-scroll-container');
    container.innerHTML = getDilemmaViewMarkup();
    getEl('continue-path-btn').addEventListener('click', handleContinuePathClick);
}

/**
 * Grille des quatre piliers, en états plutôt qu'en valeurs.
 * @returns {string}
 */
function getPillarGridMarkup() {
    const stats = state.progress.stats;
    return `<div class="summary-stats">${PILIERS.map(p => `
        <div class="stat-box">
            <div class="stat-box-nom">${p.nom.toUpperCase()}</div>
            <div class="stat-box-val ${p.cls}-txt">${libelleDe(stats[p.id])}</div>
            <div class="stat-box-jauge"><span class="${p.cls}" style="width:${largeurJauge(stats[p.id])}"></span></div>
        </div>`).join('')}</div>`;
}

/**
 * Écran de fin de vie : verdict de la balance, lecture du parcours,
 * archivage dans le Hall, puis choix de revivre ou de revenir au menu.
 */
function showFinDeVie() {
    const bilan = evaluateLifePath();
    const chrono = state.progress.chronology || [];
    const derniere = chrono[chrono.length - 1];

    recordLifeEnd(derniere ? derniere.eventId : 'fin_inconnue', bilan.titre);
    checkAchievements().forEach(showAchievementToast);

    getEl('game-scroll-container').innerHTML = `
        <div class="summary-card fin-card">
            <p class="summary-kicker">LA BALANCE A PARLÉ</p>
            <h2 class="cinzel fin-titre">${bilan.titre}</h2>
            <p class="fin-niveau">${bilan.balanceLevel}</p>

            ${getPillarGridMarkup()}

            <div class="fin-lecture">
                <p><span>Pilier dominant</span><strong>${nomDuPilier(bilan.dominantStat)}</strong></p>
                <p><span>Pilier négligé</span><strong>${nomDuPilier(bilan.weakestStat)}</strong></p>
                <p><span>Ce qu'on retient de vous</span><strong>${bilan.primaryReputation}</strong></p>
                <p><span>Votre foyer</span><strong>${bilan.familyStatus}</strong></p>
                <p><span>Vie n°</span><strong>${state.meta.livesCount}</strong></p>
            </div>

            <p class="fin-mot">${bilan.isBalanced
                ? "Aucun pilier n'a écrasé les autres. C'est là tout l'art."
                : "Une vie penchée n'est pas une vie ratée — mais la balance s'en souvient."}</p>

            <div class="summary-actions">
                <button id="fin-new-btn" class="primary-btn">Vivre une autre vie</button>
                <button id="fin-hall-btn" class="sm-btn">Hall de l'Équilibre</button>
                <button id="fin-menu-btn" class="sm-btn">Menu principal</button>
            </div>
        </div>
    `;

    getEl('fin-new-btn').addEventListener('click', () => {
        resetForNewLife();
        restoreDilemmaView();
        showScreen(screens.PROTO_SELECT);
    });
    getEl('fin-hall-btn').addEventListener('click', () => showScreen(screens.HALL));
    getEl('fin-menu-btn').addEventListener('click', () => showScreen(screens.HOME));
}

export function updateCurrentEventUI() {
    const event = getCurrentEvent();
    if (!event) { showFinDeVie(); return; }

    // Le conteneur de jeu peut avoir été remplacé par un bilan de chapitre ou
    // par l'écran de fin de vie : on le reconstruit avant d'écrire dedans.
    let container = getEl('dilemma-container');
    if (!container) {
        restoreDilemmaView();
        container = getEl('dilemma-container');
        if (!container) return;
    }
    const resultCard = getEl('result-container');

    resultCard.classList.add('hidden');
    container.classList.remove('hidden');

    let eventText = event.text;
    if (event.variants) {
        const variant = event.variants.find(v => v.conditions(state));
        if (variant) eventText = variant.text;
    }
    
    eventText = formatText(eventText);

    container.innerHTML = `
        <div class="dilemma-image-container">
            <img src="${event.image || portraitJoueur()}" class="dilemma-image" alt="">
        </div>
        <div class="dilemma-content">
            <h2 class="dilemma-title">${formatText(event.title)}</h2>
            <div id="typing-text" class="dilemma-text"></div>
            <div class="choices-list">${event.choices
                .filter(c => !c.conditions || c.conditions(state))
                .map((c, i) => `<button class="choice-btn" data-index="${i}"><span>${formatText(c.text)}</span></button>`).join('')}</div>
        </div>
    `;

    const txt = getEl('typing-text');
    const liste = container.querySelector('.choices-list');
    const reveler = () => { if (liste) liste.classList.add('visible'); };

    // BUG corrigé : clearInterval recevait `txt.dataset.timer`, une chaîne.
    // L'intervalle n'était jamais arrêté et il en restait un par événement,
    // soit une trentaine de minuteries actives en fin de partie.
    if (typingTimer) clearInterval(typingTimer);

    const vitesse = Number(state.settings.textSpeed) || 0;
    if (!vitesse) {
        txt.textContent = eventText;
        reveler();
    } else {
        let idx = 0;
        typingTimer = setInterval(() => {
            if (idx < eventText.length) {
                // textContent plutôt qu'innerHTML : plus rapide et le texte du
                // scénario n'est jamais interprété comme du balisage.
                txt.textContent += eventText.charAt(idx++);
            } else {
                clearInterval(typingTimer);
                typingTimer = null;
                reveler();
            }
        }, vitesse);

        // Un appui sur le texte saute l'animation : évite d'attendre inutilement.
        txt.addEventListener('click', () => {
            if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
            txt.textContent = eventText;
            reveler();
        }, { once: true });
    }

    container.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const visibleChoices = event.choices.filter(c => !c.conditions || c.conditions(state));
            handleChoice(visibleChoices[e.currentTarget.dataset.index], event.id);
        });
    });
}

function handleChoice(choice, eventId) {
    const event = getCurrentEvent();
    state.progress.decisions.push(choice.id);
    state.progress.completedEvents.push(eventId);
    state.progress.chronology.push({ 
        chapterIndex: state.progress.chapterIndex, 
        eventId, choiceId: choice.id, 
        title: event.title, 
        result: choice.result, 
        timestamp: Date.now() 
    });

    // Apply stats
    if (choice.effects) {
        Object.entries(choice.effects).forEach(([s, delta]) => {
            if (state.progress.stats[s] !== undefined) {
                state.progress.stats[s] = Math.max(0, Math.min(100, state.progress.stats[s] + delta));
                showStatFeedback(s, delta);
            }
        });
    }

    // Apply traits
    if (choice.traits) {
        Object.entries(choice.traits).forEach(([t, delta]) => {
            state.progress.traits[t] = (state.progress.traits[t] || 0) + delta;
        });
    }

    // Apply relationships
    if (choice.relationships) {
        Object.entries(choice.relationships).forEach(([charId, delta]) => {
            if (state.progress.characters[charId]) {
                const char = state.progress.characters[charId];
                char.relationship = Math.max(0, Math.min(100, char.relationship + delta));
            }
        });
    }

    // Ces sous-scores de couple sont posés à la racine du choix par le
    // scénario (trust, communication, commitment, disagreements…) et étaient
    // purement ignorés : ils n'avaient aucun effet sur la partie.
    const partenaire = state.progress.characters.partner;
    ['trust', 'complicity', 'respect', 'communication', 'commitment', 'influence']
        .forEach(k => {
            if (typeof choice[k] === 'number' && typeof partenaire[k] === 'number') {
                partenaire[k] = Math.max(0, Math.min(100, partenaire[k] + choice[k]));
            }
        });
    if (typeof choice.disagreements === 'number') {
        partenaire.disagreements = Math.max(0, (partenaire.disagreements || 0) + choice.disagreements);
    }

    if (choice.memories) {
        Object.entries(choice.memories).forEach(([k, v]) => { state.progress.memories[k] = v; });
    }

    // Mémorise les illustrations vues, pour une future galerie.
    if (event.image && !state.progress.unlockedIllustrations.includes(event.image)) {
        state.progress.unlockedIllustrations.push(event.image);
    }

    calculateBalance();
    saveGame();
    updateHUD();

    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) newAchievements.forEach(showAchievementToast);
    
    getEl('dilemma-container').classList.add('hidden');
    getEl('result-container').classList.remove('hidden');
    getEl('result-text').textContent = formatText(choice.result);
    
    playSFX('success');
}

/**
 * Feedback & Visual Effects
 */
function showAchievementToast(ach) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <span class="toast-icon">${ach.icon}</span>
        <div class="toast-content">
            <div class="toast-title">HAUT FAIT DÉBLOQUÉ</div>
            <div class="toast-name">${ach.title}</div>
        </div>
    `;
    document.body.appendChild(toast);
    playSFX('success');
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 1000);
    }, 4000);
}

function showStatFeedback(stat, delta) {
    if (delta === 0) return;
    const gauge = getEl(`gauge-fill-${stat}`);
    if (!gauge) return;
    
    const positif = delta > 0;
    const color = positif ? '#2ecc71' : '#ff4444';
    const originalShadow = gauge.style.boxShadow;

    gauge.style.boxShadow = `0 0 15px ${color}`;

    // Direction et amplitude approximative, sans révéler le barème exact.
    const amp = Math.abs(delta);
    const crans = amp >= 20 ? 3 : (amp >= 10 ? 2 : 1);

    const rect = gauge.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'stat-feedback-popup';
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
    popup.style.color = color;
    popup.textContent = CHIFFRES_VISIBLES
        ? (positif ? `+${delta}` : String(delta))
        : (positif ? '▲' : '▼').repeat(crans);
    document.body.appendChild(popup);
    
    setTimeout(() => {
        gauge.style.boxShadow = originalShadow;
        popup.remove();
    }, 1500);
}

export async function showChapterIntro(idx) {
    const overlay = getEl('chapter-intro-screen');
    const chapter = STORY_DATA.chapters[idx];
    
    getEl('chapter-intro-number').innerText = `CHAPITRE ${idx + 1}`;
    getEl('chapter-intro-title').innerText = chapter ? chapter.title : "COMMENCEMENT";
    
    // Cinematic addition: show protagonist portrait in the intro
    const portrait = avatarJoueur();

    const portraitContainer = overlay.querySelector('.chapter-intro-portrait-container');
    if (portraitContainer) {
        portraitContainer.innerHTML = `<img src="${portrait}" class="chapter-intro-portrait">`;
    }
    
    overlay.classList.add('active');
    return new Promise(r => setTimeout(() => { 
        overlay.classList.remove('active'); 
        setTimeout(r, 1000); 
    }, 3000));
}

function showChapterSummary(chapterIdx) {
    const chapitre = STORY_DATA.chapters[chapterIdx];
    const suivant = STORY_DATA.chapters[state.progress.chapterIndex];
    const decisions = (state.progress.chronology || []).filter(c => c.chapterIndex === chapterIdx);

    getEl('game-scroll-container').innerHTML = `
        <div class="summary-card">
            <p class="summary-kicker">FIN DU CHAPITRE ${chapterIdx + 1}</p>
            <h2 class="cinzel summary-titre">${chapitre ? formatText(chapitre.title) : ''}</h2>
            <p class="summary-eq">Votre équilibre : <strong>${calculateBalance().level}</strong></p>

            <p class="summary-usure">Le temps a passé : chaque pilier a perdu
                ${USURE_PAR_CHAPITRE} points. Rien ne reste acquis.</p>

            ${getPillarGridMarkup()}

            <h3 class="cinzel summary-sous">CE QUE VOUS AVEZ CHOISI</h3>
            <div class="summary-decisions">
                ${decisions.map(d => `<div class="summary-dec"><span>${formatText(d.title)} :</span> ${formatText(d.result)}</div>`).join('')}
            </div>

            <div class="summary-actions">
                ${suivant ? '<button id="next-chapter-btn" class="primary-btn">Continuer</button>' : ''}
                <button id="summary-menu-btn" class="sm-btn">Menu principal</button>
            </div>
        </div>
    `;

    const suite = getEl('next-chapter-btn');
    if (suite) {
        suite.addEventListener('click', async () => {
            restoreDilemmaView();
            await showChapterIntro(state.progress.chapterIndex);
            updateCurrentEventUI();
        });
    }
    getEl('summary-menu-btn').addEventListener('click', () => {
        saveGame();
        showScreen(screens.HOME);
    });
}

/**
 * Templates (HTML Strings)
 */
function getHomeTemplate(onStart, onContinue) {
    return `
        <div id="home-screen" class="screen">
            <div class="screen-bg home-bg"></div>
            <div class="intro-overlay"></div>
            <div class="logo-container">
                <img src="${VISUELS.EMBLEME}" class="logo-image main-logo" alt="Emblème ÉQUILIBRE">
                <div class="title-container">
                    <h1 class="main-title">${JEU.LICENCE}</h1>
                    <p class="main-subtitle">${JEU.TITRE}</p>
                </div>
            </div>
            <div class="menu-container home-menu-card">
                <button id="continue-btn" class="sm-btn">▶ Continuer</button>
                <button id="start-btn" class="primary-btn">▶ Nouvelle Partie</button>
                <button id="tutorial-btn" class="sm-btn">▶ Instructions</button>
                <button id="achievements-btn" class="sm-btn">▶ Hauts Faits</button>
                <button id="journal-btn" class="sm-btn">▶ Journal du Destin</button>
                <button id="hall-btn" class="sm-btn">▶ Hall de l'Équilibre</button>
                <button id="encyclopedia-btn" class="sm-btn">▶ Bibliothèque Vivante</button>
                <button id="settings-btn" class="sm-btn">▶ Paramètres</button>
            </div>
        </div>
    `;
}

function getSettingsTemplate() {
    return `
        <div id="settings-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content panneau">
                <h2 class="cinzel ecran-titre">Paramètres</h2>

                <div class="reglage">
                    <span>Musique</span>
                    <button id="set-music" class="bascule"></button>
                </div>
                <div class="reglage">
                    <span>Effets sonores</span>
                    <button id="set-sfx" class="bascule"></button>
                </div>
                <div class="reglage colonne">
                    <span>Vitesse du texte</span>
                    <div class="segments" id="set-speed">
                        <button data-v="45">Lente</button>
                        <button data-v="30">Normale</button>
                        <button data-v="12">Rapide</button>
                        <button data-v="0">Instantanée</button>
                    </div>
                </div>
                <div class="reglage colonne">
                    <span>Taille du texte</span>
                    <div class="segments" id="set-font">
                        <button data-v="sm">Petite</button>
                        <button data-v="md">Moyenne</button>
                        <button data-v="lg">Grande</button>
                    </div>
                </div>

                <button id="clear-save-btn" class="danger-btn">Effacer la sauvegarde</button>
            </div>
        </div>
    `;
}

/**
 * Reflète l'état courant des réglages sur les boutons.
 * Les préférences existaient déjà dans `state.settings` mais aucune interface
 * ne permettait de les modifier.
 */
function updateSettingsUI() {
    const m = getEl('set-music');
    const sx = getEl('set-sfx');
    if (!m || !sx) return;

    m.textContent = state.settings.musicEnabled ? 'Activée' : 'Coupée';
    m.classList.toggle('on', !!state.settings.musicEnabled);
    sx.textContent = state.settings.sfxEnabled ? 'Activés' : 'Coupés';
    sx.classList.toggle('on', !!state.settings.sfxEnabled);

    document.querySelectorAll('#set-speed button').forEach(b =>
        b.classList.toggle('on', Number(b.dataset.v) === Number(state.settings.textSpeed)));
    document.querySelectorAll('#set-font button').forEach(b =>
        b.classList.toggle('on', b.dataset.v === state.settings.fontSize));
}

function getTutorialTemplate() {
    return `
        <div id="tutorial-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content" style="margin-top: 60px; padding: 20px; overflow-y: auto; text-align: center;">
                <h2 class="cinzel" style="color: var(--gold); margin-bottom: 25px;">Instructions</h2>
                <div class="tutorial-card home-menu-card" style="text-align: left;">
                    <h3 style="color: var(--gold); font-size: 0.9rem; margin-bottom: 15px;">Le Concept</h3>
                    <p style="font-size: 0.8rem; line-height: 1.6; margin-bottom: 20px;">Dans ÉQUILIBRE, chaque choix influence votre destin. Votre but n'est pas la richesse, mais l'harmonie entre les quatre piliers de la vie.</p>
                    <div class="aide-piliers">
                        ${PILIERS.map(p => `<div style="color:${p.color}">${p.icone} ${p.nom}</div>`).join('')}
                    </div>
                    <h3 style="color: var(--gold); font-size: 0.9rem; margin-bottom: 10px;">Comment Jouer</h3>
                    <ul class="aide-liste">
                        <li>Lisez attentivement les dilemmes : aucun choix n'est gratuit.</li>
                        <li>Ce qui nourrit un pilier en affaiblit souvent un autre.</li>
                        <li>Vos piliers n'affichent aucun chiffre, seulement un état
                            — ${NIVEAUX.join(', ')} — pour que vous décidiez avec votre
                            jugement plutôt qu'avec une calculatrice.</li>
                        <li>Entre deux chapitres, le temps passe : chaque pilier
                            perd du terrain. Rien ne reste acquis, tout demande
                            à être entretenu.</li>
                        <li>À la fin de chaque chapitre, un bilan vous est présenté.</li>
                        <li>Au terme des dix chapitres, la balance rend son verdict :
                            ce n'est pas le pilier le plus haut qui compte, mais l'écart
                            entre le plus haut et le plus bas.</li>
                    </ul>
                </div>
                <button class="primary-btn" style="margin-top: 20px; width: 100%;" onclick="this.closest('.screen').querySelector('.back-btn').click()">Compris</button>
            </div>
        </div>
    `;
}

function getProtoSelectTemplate() {
    return `
        <div id="proto-select-screen" class="screen">
            <button class="back-btn">← MENU</button>
            <div class="selection-screen-content">
                <h2 class="cinzel" style="color: var(--gold); margin-bottom: 20px;">Choisissez votre personnage</h2>
                <div class="selection-cards-container">
                    <div class="proto-card">
                        <img src="${VISUELS.MILA}" alt="Mila">
                        <div class="proto-card-body">
                            <h3 class="proto-card-title">Mila</h3>
                            <p class="proto-card-text">Charismatique et déterminé, il forge son chemin entre tradition et modernité.</p>
                            <button class="choose-btn primary-btn" data-proto="Mila">Choisir Mila</button>
                        </div>
                    </div>
                    <div class="proto-card">
                        <img src="${VISUELS.DIDI}" alt="Didi">
                        <div class="proto-card-body">
                            <h3 class="proto-card-title">Didi</h3>
                            <p class="proto-card-text">Élégante et inspirante, elle incarne la grâce et la force du renouveau.</p>
                            <button class="choose-btn primary-btn" data-proto="Didi">Choisir Didi</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getProfileTemplate() {
    return `
        <div id="profile-screen" class="screen">
            <button class="back-btn">← PERSONNAGE</button>
            <div class="profile-screen-content">
                <h2 class="cinzel" style="color: var(--gold); margin-bottom: 20px; text-align: center;">VOTRE PROFIL</h2>
                <div class="profile-form">
                    <div class="form-group">
                        <label>Comment vous appelez-vous ?</label>
                        <input type="text" id="profile-name" placeholder="Votre prénom..." style="margin-bottom: 15px;">
                    </div>
                    <div class="form-group">
                        <label>Date de naissance</label>
                        <input type="date" id="profile-dob" style="margin-bottom: 20px;">
                    </div>
                    <div class="form-group" style="text-align: center; margin-bottom: 20px;">
                        <label>Avatar</label>
                        <div class="profile-avatar-preview">
                            <img id="profile-avatar-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Avatar">
                        </div>
                    </div>
                    <button id="start-destiny-btn" class="primary-btn" style="margin-top: 10px; width: 100%; max-width: none;">Commencer mon destin</button>
                </div>
            </div>
        </div>
    `;
}

function getTransitionTemplate() { return `<div id="transition-screen" class="screen"></div>`; }

function getGameTemplate() {
    return `
        <div id="game-screen" class="screen">
            <div id="game-hud" class="persistent-hud">
                <div class="hud-left">
                    <img id="hud-player-portrait" class="hud-portrait" alt="">
                    <div class="hud-info">
                        <span id="hud-player-name" class="hud-name"></span>
                        <div id="hud-reputation" class="hud-rep"></div>
                        <div id="hud-balance" class="hud-eq"></div>
                        <div class="hud-actions">
                            <button id="game-menu-btn" class="hud-btn">MENU</button>
                            <button id="game-save-btn" class="hud-btn">SAUVER</button>
                        </div>
                    </div>
                </div>
                <div class="hud-right">
                    ${PILIERS.map(p => `
                        <div class="hud-stat-item" title="${p.nom}">
                            <span class="stat-icon">${p.icone}</span>
                            <div class="gauge-bg"><div id="gauge-fill-${p.id}" class="gauge-fill ${p.cls}"></div></div>
                            <span id="gauge-lbl-${p.id}" class="stat-label"></span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="game-scroll-container">${getDilemmaViewMarkup()}</div>
        </div>
    `;
}

function getHallTemplate() {
    return `
        <div id="hall-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content panneau">
                <h2 class="cinzel ecran-titre">Hall de l'Équilibre</h2>
                <div id="hall-content"></div>
            </div>
        </div>
    `;
}

/**
 * Affiche les vies achevées, la tendance cumulée et les lignées.
 * Les données étaient déjà collectées par `recordLifeEnd()` dans `state.meta`
 * mais rien ne les restituait.
 */
function updateHallUI() {
    const c = getEl('hall-content');
    if (!c) return;

    const vies = state.meta.lifeHistory || [];
    if (!vies.length) {
        c.innerHTML = `<p class="vide">Aucune vie achevée pour l'instant.<br>
            Le Hall se remplit à chaque destin mené jusqu'à son terme.</p>`;
        return;
    }

    const g = state.meta.hallOfBalance.globalStats;
    const moyennes = {
        spirituality: g.totalSpir, love: g.totalLove,
        health: g.totalHealth, argent: g.totalArgent
    };

    c.innerHTML = `
        <div class="hall-resume">
            <p><span>Vies achevées</span><strong>${vies.length}</strong></p>
            <p><span>Fins découvertes</span><strong>${state.meta.unlockedEnds.length}</strong></p>
        </div>

        <h3 class="cinzel summary-sous">TENDANCE SUR TOUTES VOS VIES</h3>
        <div class="summary-stats">
            ${PILIERS.map(p => `
                <div class="stat-box">
                    <div class="stat-box-nom">${p.nom.toUpperCase()}</div>
                    <div class="stat-box-val ${p.cls}-txt">${libelleDe((moyennes[p.id] || 0) / vies.length)}</div>
                </div>`).join('')}
        </div>

        <h3 class="cinzel summary-sous">VOS LIGNÉES</h3>
        ${vies.slice().reverse().map(v => `
            <div class="hall-vie">
                <div class="hall-vie-tete">
                    <span>Vie n°${v.lifeNumber} — ${v.protagonist}</span>
                    <span class="hall-date">${v.date}</span>
                </div>
                <div class="hall-vie-titre">${v.endTitle}</div>
            </div>`).join('')}
    `;
}

function getEncyclopediaTemplate() {
    return `
        <div id="encyclopedia-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content panneau">
                <h2 class="cinzel ecran-titre">Bibliothèque Vivante</h2>
                <p class="aide-intro">Celles et ceux qui traversent votre vie, et l'état de votre lien avec eux.</p>
                <div id="encyclopedia-content"></div>
            </div>
        </div>
    `;
}

/**
 * Fiches des personnages rencontrés, avec l'état du lien.
 * Les noms, rôles et biographies proviennent de `state.progress.characters`
 * (identités officielles définies dans characters.md) : rien n'est inventé ici,
 * et remplacer une illustration ou une biographie ne touche que state.js.
 */
function updateEncyclopediaUI() {
    const c = getEl('encyclopedia-content');
    if (!c) return;

    const lien = (v) => {
        if (v >= 80) return 'Indéfectible';
        if (v >= 60) return 'Solide';
        if (v >= 40) return 'Correct';
        if (v >= 20) return 'Distant';
        return 'Rompu';
    };

    const fiches = Object.values(state.progress.characters)
        .filter(p => p.active !== false && p.name);

    if (!fiches.length) {
        c.innerHTML = '<p class="vide">Commencez une vie pour rencontrer ses personnages.</p>';
        return;
    }

    c.innerHTML = fiches.map(p => `
        <div class="fiche">
            <div class="fiche-tete">
                <span class="fiche-nom">${p.name}</span>
                <span class="fiche-role">${p.role || ''}</span>
            </div>
            ${p.bio ? `<p class="fiche-bio">${p.bio}</p>` : ''}
            <div class="fiche-lien">Lien : <strong>${lien(p.relationship)}</strong></div>
        </div>
    `).join('');
}

function getJournalTemplate() {
    return `
        <div id="journal-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content" style="margin-top: 60px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; height: 100%;">
                <h2 class="cinzel" style="color: var(--gold); text-align: center; margin-bottom: 25px;">JOURNAL DU DESTIN</h2>
                <div id="destiny-journal-content" class="menu-container" style="align-items: stretch; gap: 15px; flex: 1;"></div>
            </div>
        </div>
    `;
}

function getAchievementsTemplate() {
    return `
        <div id="achievements-screen" class="screen">
            <button class="back-btn">← RETOUR</button>
            <div class="screen-content" style="margin-top: 60px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; height: 100%;">
                <h2 class="cinzel" style="color: var(--gold); text-align: center; margin-bottom: 25px;">HAUTS FAITS</h2>
                <div id="achievements-list-content" class="menu-container" style="align-items: stretch; gap: 12px; flex: 1;"></div>
            </div>
        </div>
    `;
}

function getChapterIntroTemplate() {
    return `
        <div id="chapter-intro-screen" class="chapter-transition">
            <div class="chapter-title-card">
                <p id="chapter-intro-number" style="color: var(--gold); letter-spacing: 0.5em; font-size: 0.8rem; margin-bottom: 20px;"></p>
                <div class="chapter-intro-portrait-container" style="margin-bottom: 20px;"></div>
                <h2 id="chapter-intro-title" class="cinzel" style="font-size: 2rem; color: var(--white);">COMMENCEMENT</h2>
            </div>
        </div>
    `;
}

function updateJournalUI() {
    const container = getEl('destiny-journal-content');
    if (!container) return;
    const chrono = state.progress.chronology || [];
    if (!chrono.length) {
        container.innerHTML = '<p class="vide">Votre histoire n\'a pas encore commencé...</p>';
        return;
    }
    container.innerHTML = chrono.slice().reverse().map(entry => `
        <div class="journal-entree">
            <div class="journal-chap">CHAPITRE ${entry.chapterIndex + 1}</div>
            <div class="journal-titre">${formatText(entry.title)}</div>
            <div class="journal-res">${formatText(entry.result)}</div>
        </div>
    `).join('');
}

function updateAchievementsUI() {
    const container = getEl('achievements-list-content');
    if (!container) return;
    container.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = state.meta.unlockedAchievements.includes(ach.id);
        return `
            <div class="sm-btn ${isUnlocked ? '' : 'locked'}" style="text-align: left; height: auto; padding: 12px; border-color: ${isUnlocked ? 'var(--gold)' : 'var(--glass-border)'}; cursor: default; width: 100%; max-width: none; opacity: ${isUnlocked ? 1 : 0.4};">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem; filter: ${isUnlocked ? 'none' : 'grayscale(1)'}">${ach.icon}</span>
                    <div>
                        <div style="font-weight: 600; font-size: 0.85rem; color: ${isUnlocked ? 'var(--gold)' : 'var(--white)'}">${ach.title}</div>
                        <div style="font-size: 0.7rem; opacity: 0.8;">${ach.desc}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function updateProfileAvatar() {
    const preview = getEl('profile-avatar-img');
    if (preview) preview.src = avatarJoueur();
}

