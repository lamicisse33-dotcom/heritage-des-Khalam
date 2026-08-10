import { JEU } from './config.js';

/** Clé de stockage local, définie dans config.js (voir la note sur la licence). */
const SAVE_KEY = JEU.CLE_SAUVEGARDE;

/**
 * Version du schéma de sauvegarde.
 * À incrémenter dès que la forme de `state.progress` change de façon
 * incompatible (renommage d'un pilier, suppression d'un champ...).
 * Une sauvegarde d'un autre schéma est écartée proprement au lieu d'être
 * fusionnée à moitié, ce qui produisait un état incohérent silencieux.
 */
const SCHEMA_VERSION = 2;

export const state = {
    hasSave: false,
    settings: {
        musicEnabled: true,
        sfxEnabled: true,
        textSpeed: 30, // ms per char
        fontSize: 'md', // sm, md, lg
        voiceEnabled: true,   // lecture à voix haute des textes
        voiceRate: 0.95,      // débit de la voix (0.7 lent … 1.3 rapide)
        animationsEnabled: true
    },
    user: {
        name: '',
        age: '',
        family: '',
        work: '',
        goal: '',
        protagonist: 'Mila' // 'Mila' (M) or 'Didi' (F) according to characters.md
    },
    progress: {
        chapterIndex: 0,
        eventIndex: 0,
        stats: {
            spirituality: 50,
            love: 50,
            health: 50,
            argent: 50
        },
        traits: {
            ambition: 0,
            compassion: 0,
            prudence: 0,
            courage: 0,
            generosity: 0,
            patience: 0,
            resilience: 0,
            honesty: 0
        },
        decisions: [], // Array of strings/IDs of choices made
        completedEvents: [], // Array of event IDs
        memories: {}, // Key-value store for specific flags
        reputation: [], // Derived tags based on traits and decisions
        balance: {
            score: 100,
            level: 'Harmonie profonde',
            status: 'stable'
        },
        chronology: [], // Each item: { chapterIndex, eventId, choiceId, title, result, timestamp }
        unlockedIllustrations: [], // Paths to images seen
        unlockedLore: [], // IDs of lore entries discovered
        characters: {
            partner: {
                id: 'partner',
                name: '', // renseigné au choix du protagoniste : c'est l'autre personnage
                role: 'Le Partenaire',
                bio: 'Votre pilier émotionnel, représentant le foyer et la vérité du cœur.',
                relationship: 50,
                trust: 50,
                complicity: 50,
                respect: 50,
                influence: 50,
                disagreements: 0,
                communication: 50,
                commitment: 50,
                memories: [],
                unlocked: true
            },
            child: {
                id: 'child',
                role: 'L\'Enfant',
                bio: 'L\'espoir d\'une nouvelle génération et votre plus grande responsabilité.',
                relationship: 50,
                age: 0,
                active: false, // Becomes true if a child is born/adopted
                memories: [],
                unlocked: false
            },
            friend: {
                id: 'friend',
                name: 'Kofi', // Default generic name for the close friend
                role: 'L\'Ami Proche',
                bio: 'Le témoin de votre jeunesse, toujours prêt à vous ramener à l\'essentiel.',
                relationship: 60,
                age: 26,
                memories: [],
                unlocked: true
            },
            manager: {
                id: 'manager',
                name: 'Mr. Mensah', // Based on characters.md
                role: 'Le Manager',
                bio: 'Sophistiqué et autoritaire, il évalue votre impact professionnel.',
                relationship: 40,
                age: 48,
                memories: [],
                unlocked: true
            },
            doctor: {
                id: 'doctor',
                name: 'Dr. Sow', // Based on characters.md
                role: 'Le Spécialiste',
                bio: 'Calme et rassurant, il veille sur votre équilibre physique.',
                relationship: 50,
                active: false,
                memories: [],
                unlocked: true
            },
            mentor: {
                id: 'mentor',
                name: 'Baba', // Based on characters.md
                role: 'Le Mentor',
                bio: 'Le gardien de la sagesse ancestrale et votre guide spirituel.',
                relationship: 80,
                age: 68,
                active: false, // Appears in times of doubt
                memories: [],
                unlocked: true
            }
        }
    },
    meta: {
        livesCount: 0,
        unlockedEnds: [], // IDs of ends seen (e.g., 'game_complete_sage')
        unlockedAchievements: [], // IDs of milestones reached
        hallOfBalance: {
            trophies: [],
            globalStats: {
                totalSpir: 0,
                totalLove: 0,
                totalHealth: 0,
                totalArgent: 0
            }
        },
        lifeHistory: [] // Array of summary objects for each completed life
    }
};

/**
 * Robustly merges saved data into the default state.
 */
function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return source;
    
    Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        } else if (sourceValue && typeof sourceValue === 'object') {
            target[key] = deepMerge(targetValue || {}, sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });
    
    return target;
}

export function checkSave() {
    const saved = localStorage.getItem(SAVE_KEY);
    state.hasSave = !!saved;
    if (saved) {
        try {
            const data = JSON.parse(saved);

            // Sauvegarde d'un schéma antérieur : on préfère repartir propre
            // plutôt que de fusionner des champs qui n'existent plus.
            if (data.schema !== SCHEMA_VERSION) {
                localStorage.removeItem(SAVE_KEY);
                state.hasSave = false;
                return false;
            }

            delete data.schema;
            deepMerge(state, data);
        } catch (e) {
            // Sauvegarde illisible : on la retire pour ne pas bloquer le joueur
            // sur un « Continuer » qui échouerait à chaque tentative.
            localStorage.removeItem(SAVE_KEY);
            state.hasSave = false;
            return false;
        }
    }
    return state.hasSave;
}

export function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
        schema: SCHEMA_VERSION,
        progress: state.progress,
        settings: state.settings,
        user: state.user,
        meta: state.meta
    }));
    state.hasSave = true;
}

export function recordLifeEnd(endId, endTitle) {
    state.meta.livesCount++;
    if (!state.meta.unlockedEnds.includes(endId)) {
        state.meta.unlockedEnds.push(endId);
    }
    
    const lifeSummary = {
        lifeNumber: state.meta.livesCount,
        protagonist: state.user.protagonist,
        endTitle: endTitle,
        finalStats: { ...state.progress.stats },
        finalBalance: state.progress.balance.score,
        majorDecisions: [...state.progress.decisions.slice(-5)], // Last 5 big ones
        date: new Date().toLocaleDateString()
    };
    
    state.meta.lifeHistory.push(lifeSummary);
    
    // Update global cumulative stats
    state.meta.hallOfBalance.globalStats.totalSpir += state.progress.stats.spirituality;
    state.meta.hallOfBalance.globalStats.totalLove += state.progress.stats.love;
    state.meta.hallOfBalance.globalStats.totalHealth += state.progress.stats.health;
    state.meta.hallOfBalance.globalStats.totalArgent += state.progress.stats.argent;
    
    saveGame();
}

export function resetForNewLife() {
    // Keep meta, reset progress
    const freshProgress = {
        chapterIndex: 0,
        eventIndex: 0,
        stats: { spirituality: 50, love: 50, health: 50, argent: 50 },
        traits: { ambition: 0, compassion: 0, prudence: 0, courage: 0, generosity: 0, patience: 0, resilience: 0, honesty: 0 },
        decisions: [],
        completedEvents: [],
        memories: {},
        reputation: [],
        balance: { score: 100, level: 'Harmonie profonde', status: 'stable' },
        chronology: [],
        unlockedIllustrations: [],
        unlockedLore: [],
        characters: {
            partner: { id: 'partner', name: '', role: 'Le Partenaire', relationship: 50, trust: 50, complicity: 50, respect: 50, influence: 50, disagreements: 0, communication: 50, commitment: 50, memories: [] },
            child: { id: 'child', role: 'L\'Enfant', relationship: 50, age: 0, active: false, memories: [] },
            friend: { id: 'friend', name: 'Kofi', role: 'L\'Ami Proche', relationship: 60, age: 26, memories: [] },
            manager: { id: 'manager', name: 'Mr. Mensah', role: 'Le Manager', relationship: 40, age: 48, memories: [] },
            doctor: { id: 'doctor', name: 'Dr. Sow', role: 'Le Spécialiste', relationship: 50, active: false, memories: [] },
            mentor: { id: 'mentor', name: 'Baba', role: 'Le Mentor', relationship: 80, age: 68, active: false, memories: [] }
        }
    };
    state.progress = freshProgress;
    saveGame();
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
    state.hasSave = false;
}
