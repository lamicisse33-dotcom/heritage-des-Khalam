/* Charge le mono-fichier dans un vrai DOM et joue une partie entiere en cliquant. */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('/home/claude/plat/_t.html', 'utf8');

const erreurs = [];
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://exemple.test/',
    beforeParse(w) {
        w.HTMLMediaElement.prototype.play = () => Promise.resolve();
        w.HTMLMediaElement.prototype.pause = () => {};
        w.confirm = () => true;
        w.alert = () => {};
        w.scrollTo = () => {};
        w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    }
});

const w = dom.window;
const d = w.document;

w.addEventListener('error', e => erreurs.push('window.error: ' + (e.error ? e.error.stack : e.message)));
const vraiErr = w.console.error;
w.console.error = (...a) => { erreurs.push('console.error: ' + a.join(' ')); vraiErr(...a); };
process.on('uncaughtException', e => erreurs.push('uncaught: ' + e.stack));

const attendre = ms => new Promise(r => setTimeout(r, ms));
const clic = sel => {
    const el = typeof sel === 'string' ? d.querySelector(sel) : sel;
    if (!el) throw new Error('introuvable : ' + sel);
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    return el;
};
const actif = () => {
    const s = d.querySelector('.screen.active');
    return s ? s.id : '(aucun)';
};

(async () => {
    await attendre(300);

    // Instantane : pas d'animation de frappe pendant le test
    if (w.state) w.state.settings.textSpeed = 0;

    console.log('1. demarrage        ->', (clic('#start-audio-btn'), await attendre(900), actif()));

    clic('#start-btn');
    await attendre(200);
    console.log('2. nouvelle partie  ->', actif());

    clic('.choose-btn[data-proto="Mila"]');
    await attendre(200);
    console.log('3. personnage       ->', actif());

    d.querySelector('#profile-name').value = 'Khadi';
    clic('#start-destiny-btn');
    await attendre(6200);
    console.log('4. profil valide    ->', actif());

    // ---- partie complete
    let evenements = 0, chapitres = 0, garde = 0;
    const titresVus = [];

    while (garde++ < 400) {
        const choix = [...d.querySelectorAll('#dilemma-container .choice-btn')];
        if (choix.length) {
            const t = d.querySelector('.dilemma-title');
            if (t) titresVus.push(t.textContent);
            clic(choix[Math.floor(Math.random() * choix.length)]);
            evenements++;
            await attendre(30);
            const cont = d.querySelector('#continue-path-btn');
            if (!cont) { erreurs.push('bouton Continuer absent apres un choix'); break; }
            clic(cont);
            await attendre(30);
            continue;
        }
        const suivant = d.querySelector('#next-chapter-btn');
        if (suivant) { chapitres++; clic(suivant); await attendre(5200); continue; }
        if (d.querySelector('#fin-new-btn')) break;
        const menu = d.querySelector('#summary-menu-btn');
        if (menu) { erreurs.push('bilan sans bouton Continuer alors que le recit n\'est pas fini'); break; }
        erreurs.push('etat bloque : ni choix, ni bilan, ni fin');
        break;
    }

    console.log('5. partie jouee     -> ' + evenements + ' evenements, '
                + chapitres + ' transitions de chapitre');

    const fin = d.querySelector('.fin-card');
    if (!fin) {
        erreurs.push('ECRAN DE FIN JAMAIS ATTEINT');
    } else {
        console.log('6. fin de vie       -> "' + d.querySelector('.fin-titre').textContent
                    + '" / ' + d.querySelector('.fin-niveau').textContent);
        console.log('   piliers affiches  -> '
            + [...d.querySelectorAll('.stat-box')].map(b =>
                b.querySelector('.stat-box-nom').textContent + ' : '
                + b.querySelector('.stat-box-val').textContent).join(' | '));
    }

    // ---- verification : aucun chiffre de pilier visible
    const hud = [...d.querySelectorAll('.stat-label')].map(e => e.textContent);
    if (hud.some(t => /\d/.test(t))) erreurs.push('un chiffre de pilier fuit dans le HUD : ' + hud.join(','));

    // ---- ecrans annexes
    clic('#fin-hall-btn'); await attendre(900);
    console.log('7. hall             ->', actif(), '|', d.querySelectorAll('.hall-vie').length, 'vie(s) enregistree(s)');
    clic('#hall-screen .back-btn'); await attendre(900);

    clic('#journal-btn'); await attendre(900);
    console.log('8. journal          ->', actif(), '|', d.querySelectorAll('.journal-entree').length, 'entrees');
    clic('#journal-screen .back-btn'); await attendre(900);

    clic('#tutorial-btn'); await attendre(900);
    console.log('9. mode d\'emploi    ->', actif());
    clic('#tutorial-screen .back-btn'); await attendre(900);

    clic('#settings-btn'); await attendre(900);
    clic('#set-music'); clic('#set-sfx');
    clic('#set-speed button[data-v="12"]'); clic('#set-font button[data-v="lg"]');
    console.log('10. parametres      ->', actif(), '| musique:', d.querySelector('#set-music').textContent,
                '| police:', d.body.className);
    clic('#settings-screen .back-btn'); await attendre(900);

    // ---- deuxieme vie : c'est la que l'ancien resetForNewLife plantait
    clic('#start-btn'); await attendre(300);
    clic('.choose-btn[data-proto="Didi"]'); await attendre(200);
    d.querySelector('#profile-name').value = 'Lamine';
    clic('#start-destiny-btn'); await attendre(6200);
    const ok2 = d.querySelectorAll('#dilemma-container .choice-btn').length > 0;
    console.log('11. deuxieme vie    ->', actif(), ok2 ? '| dilemme affiche' : '| AUCUN DILEMME');
    if (!ok2) erreurs.push('la deuxieme vie ne demarre pas');

    console.log('\n' + '='.repeat(52));
    if (erreurs.length) {
        console.log('ERREURS (' + erreurs.length + ') :');
        erreurs.forEach(e => console.log('  ! ' + e));
        process.exit(1);
    }
    console.log('AUCUNE ERREUR D\'EXECUTION. Le jeu se joue de bout en bout.');
})();
