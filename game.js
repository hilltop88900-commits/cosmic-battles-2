// ============================================================
// COSMIC BATTLES — полный код
// ЧАСТЬ 1: Звуковая система
// ============================================================

let audioCtx = null;
let musicGain = null;
let sfxGain = null;
let musicEnabled = true;
let sfxEnabled = true;

let currentMusic = null;
let musicNodes = [];
let musicTimer = null;
let musicStep = 0;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        musicGain = audioCtx.createGain();
        sfxGain = audioCtx.createGain();
        musicGain.gain.value = musicEnabled ? 0.18 : 0;
        sfxGain.gain.value = sfxEnabled ? 0.35 : 0;
        musicGain.connect(audioCtx.destination);
        sfxGain.connect(audioCtx.destination);
    } catch (e) { console.warn('Audio not supported', e); }
}

function unlockAudio() {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(name) {
    if (!audioCtx || !sfxEnabled) return;
    const t = audioCtx.currentTime;
    let osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(sfxGain);

    if (name === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t); osc.stop(t + 0.09);
    }
    else if (name === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.13);
    }
    else if (name === 'explode') {
        const bufferSize = audioCtx.sampleRate * 0.25;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.3, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        const nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(1200, t);
        nFilter.frequency.exponentialRampToValueAtTime(200, t + 0.25);
        noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(sfxGain);
        noise.start(t); noise.stop(t + 0.25);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.31);
    }
    else if (name === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.31);
    }
    else if (name === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t); osc.stop(t + 0.11);
    }
    else if (name === 'gem') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, t);
        osc.frequency.setValueAtTime(2200, t + 0.06);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.19);
    }
    else if (name === 'booster') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.setValueAtTime(900, t + 0.05);
        osc.frequency.setValueAtTime(1300, t + 0.1);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.19);
    }
    else if (name === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t); osc.stop(t + 0.05);
    }
    else if (name === 'buy') {
        osc.disconnect();
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'triangle';
            o.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.07);
            g.gain.linearRampToValueAtTime(0.18, t + i * 0.07 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.15);
            o.connect(g); g.connect(sfxGain);
            o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.16);
        });
    }
    else if (name === 'win') {
        osc.disconnect();
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((f, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'triangle';
            o.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.1);
            g.gain.linearRampToValueAtTime(0.2, t + i * 0.1 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
            o.connect(g); g.connect(sfxGain);
            o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.32);
        });
    }
    else if (name === 'lose') {
        osc.disconnect();
        const notes = [440, 349, 262, 196];
        notes.forEach((f, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sawtooth';
            o.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.15);
            g.gain.linearRampToValueAtTime(0.15, t + i * 0.15 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.35);
            o.connect(g); g.connect(sfxGain);
            o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.37);
        });
    }
    else if (name === 'boss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.41);
    }
    else {
        osc.disconnect();
    }
}

const MENU_CHORDS = [
    [130.81, 196.00, 261.63],
    [110.00, 164.81, 220.00],
    [146.83, 220.00, 293.66],
    [98.00,  146.83, 196.00],
];
const GAME_CHORDS = [
    [220.00, 277.18, 329.63],
    [246.94, 311.13, 369.99],
    [261.63, 329.63, 392.00],
    [196.00, 246.94, 293.66],
];

function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
    musicNodes = [];
    currentMusic = null;
}

function playNote(freq, duration, type, volume, delay) {
    if (!audioCtx || !musicEnabled) return;
    const t = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume || 0.15, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(musicGain);
    osc.start(t);
    osc.stop(t + duration + 0.1);
    musicNodes.push(osc);
}

function startMenuMusic() {
    if (currentMusic === 'menu') return;
    stopMusic();
    currentMusic = 'menu';
    musicStep = 0;
    if (!audioCtx || !musicEnabled) return;
    function loop() {
        if (!musicEnabled || currentMusic !== 'menu') return;
        const chord = MENU_CHORDS[musicStep % MENU_CHORDS.length];
        chord.forEach((f, i) => {
            playNote(f, 2.5, 'sine', 0.10, i * 0.1);
            playNote(f * 2, 2.5, 'sine', 0.04, i * 0.1 + 0.05);
        });
        for (let i = 0; i < 4; i++) {
            playNote(chord[i % 3] * 4, 0.6, 'triangle', 0.05, i * 0.4);
        }
        musicStep++;
    }
    loop();
    musicTimer = setInterval(loop, 3000);
}

function startGameMusic() {
    if (currentMusic === 'game') return;
    stopMusic();
    currentMusic = 'game';
    musicStep = 0;
    if (!audioCtx || !musicEnabled) return;
    function loop() {
        if (!musicEnabled || currentMusic !== 'game') return;
        const chord = GAME_CHORDS[musicStep % GAME_CHORDS.length];
        playNote(chord[0] / 2, 0.6, 'sawtooth', 0.10, 0);
        playNote(chord[0] / 2, 0.3, 'sawtooth', 0.10, 0.6);
        chord.forEach((f, i) => playNote(f, 1.0, 'square', 0.05, i * 0.05));
        playNote(chord[2] * 2, 0.25, 'triangle', 0.06, 0.2);
        playNote(chord[1] * 2, 0.25, 'triangle', 0.06, 0.5);
        playNote(chord[2] * 2, 0.25, 'triangle', 0.06, 0.8);
        musicStep++;
    }
    loop();
    musicTimer = setInterval(loop, 1200);
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicGain) musicGain.gain.value = musicEnabled ? 0.18 : 0;
    if (!musicEnabled) stopMusic();
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    if (sfxGain) sfxGain.gain.value = sfxEnabled ? 0.35 : 0;
    if (sfxEnabled) playSound('click');
}

document.addEventListener('touchstart', unlockAudio, { once: true });
document.addEventListener('mousedown', unlockAudio, { once: true });// ============================================================
// ЧАСТЬ 2: Константы игры
// ============================================================

function hexToRgba(hex, alpha) {
    if (!hex) hex = '#0ff';
    let h = hex.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const size = Math.min(window.innerWidth - 20, window.innerHeight - 20, 600);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = 600;
    canvas.height = 600;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const GAME_STATE = {
    LOADING: 'loading', MENU: 'menu', SKINS: 'skins',
    UPGRADES: 'upgrades', EQUIPMENT: 'equipment', SHOP: 'shop',
    LOCATIONS: 'locations', LEVELS: 'levels', PLAYING: 'playing',
    PAUSED: 'paused', GAMEOVER: 'gameover', WIN: 'win'
};
let gameState = GAME_STATE.LOADING;
let loadingProgress = 0;

const SKINS = {
    standard: { name: 'Стандарт', color: '#0ff', glow: '#0ff', dark: '#044455', price: 0, currency: 'coins', abilityDesc: 'Обычный корабль' },
    healer: { name: 'Лекарь', color: '#00ff44', glow: '#44ff66', dark: '#004411', price: 500, currency: 'coins', abilityDesc: '+1 жизнь / 25 сек' },
    rapid: { name: 'Скорострел', color: '#ffff00', glow: '#ffff44', dark: '#666600', price: 800, currency: 'coins', abilityDesc: 'x2 скорость' },
    shield: { name: 'Щит', color: '#aa44ff', glow: '#cc66ff', dark: '#440088', price: 1200, currency: 'coins', abilityDesc: 'Щит / 15 сек' },
    berserk: { name: 'Берсерк', color: '#ff0000', glow: '#ff3333', dark: '#660000', price: 1500, currency: 'coins', abilityDesc: 'x2 урон' },
    sniper: { name: 'Снайпер', color: '#ffffff', glow: '#ffffff', dark: '#666666', price: 2000, currency: 'coins', abilityDesc: 'Быстрые пули' },
    bomber: { name: 'Взрывник', color: '#ff8800', glow: '#ffaa33', dark: '#663300', price: 3000, currency: 'coins', abilityDesc: 'Взрыв пуль' },
    rainbow: { name: 'Радужный', color: '#ff00ff', glow: '#ff88ff', dark: '#440044', price: 5000, currency: 'coins', abilityDesc: 'Всё по чуть-чуть' },
    ice: { name: 'Ледяной', color: '#66ddff', glow: '#aaffff', dark: '#003344', price: 6000, currency: 'coins', abilityDesc: 'Замедляет' },
    fire: { name: 'Огненный', color: '#ff4400', glow: '#ff8800', dark: '#661100', price: 7000, currency: 'coins', abilityDesc: 'Поджигает' },
    laser: { name: 'Лазер', color: '#cc44ff', glow: '#ff88ff', dark: '#440066', price: 8000, currency: 'coins', abilityDesc: 'Пробивает насквозь' },
    magnet: { name: 'Магнит', color: '#44ffcc', glow: '#88ffee', dark: '#006655', price: 9000, currency: 'coins', abilityDesc: 'Магнит' },
    twin: { name: 'Двойник', color: '#ffaa00', glow: '#ffdd44', dark: '#664400', price: 10000, currency: 'coins', abilityDesc: 'Двойные пули' },
    ghost: { name: 'Призрак', color: '#aaaaaa', glow: '#dddddd', dark: '#333333', price: 12000, currency: 'coins', abilityDesc: 'Невидимость' },
    titan: { name: '🔱 Титан', color: '#ffcc00', glow: '#ffee88', dark: '#664400', price: 100, currency: 'gems', abilityDesc: 'x3 урон, +2 жизни' },
    deity: { name: '🌟 Божество', color: '#ff00ff', glow: '#ff88ff', dark: '#440044', price: 200, currency: 'gems', abilityDesc: 'Бессмертие 3с / 20с' },
    crystal: { name: '💠 Кристалл', color: '#88ffff', glow: '#ccffff', dark: '#004466', price: 300, currency: 'gems', abilityDesc: 'Пули отскакивают' }
};
const SKIN_KEYS = Object.keys(SKINS);

let coins = parseInt(localStorage.getItem('cb_coins')) || 0;
let gems = parseInt(localStorage.getItem('cb_gems')) || 0;
let ownedSkins = JSON.parse(localStorage.getItem('cb_ownedSkins')) || ['standard'];
let selectedSkin = localStorage.getItem('cb_selectedSkin') || 'standard';

ownedSkins = ownedSkins.filter(s => SKINS[s]);
if (ownedSkins.length === 0) ownedSkins = ['standard'];
if (!SKINS[selectedSkin]) selectedSkin = 'standard';
if (!ownedSkins.includes(selectedSkin)) ownedSkins.push(selectedSkin);

let upgradePoints = parseInt(localStorage.getItem('cb_upgradePoints')) || 0;
let upgrades = JSON.parse(localStorage.getItem('cb_upgrades')) || {
    fireRate: 0, damage: 0, health: 0, speed: 0, coins: 0, bulletSize: 0
};
const UPGRADE_MAX = 5;

let equipment = JSON.parse(localStorage.getItem('cb_equipment')) || {
    drone: 0, doubleShot: 0, shieldRegen: 0, cooldown: 0, crit: 0
};
const EQUIPMENT_MAX = 5;
const EQUIPMENT_INFO = {
    drone: { name: '🚁 Дрон', desc: 'Стреляет сам', price: 3000 },
    doubleShot: { name: '🔫 Двойной', desc: '+1 пуля', price: 4000 },
    shieldRegen: { name: '🛡 Щит-реген', desc: '+1 щит / 10с', price: 5000 },
    cooldown: { name: '⚡ Перезарядка', desc: '-10% КД', price: 4000 },
    crit: { name: '💎 Крит', desc: '+10% x2 урон', price: 6000 }
};

const UPGRADE_INFO = {
    fireRate: { name: '⚡ Скорострельность', desc: '+5% скорость' },
    damage: { name: '💥 Урон', desc: '+10% урон' },
    health: { name: '❤️ Здоровье', desc: '+1 жизнь' },
    speed: { name: '💨 Скорость', desc: '+3% скорость' },
    coins: { name: '💰 Монеты', desc: '+10% монет' },
    bulletSize: { name: '🎯 Размер пуль', desc: '+10% пуль' }
};

let unlockedLocations = parseInt(localStorage.getItem('cb_unlockedLocations')) || 1;
let currentLocation = parseInt(localStorage.getItem('cb_currentLocation')) || 1;
let maxLevelReached = parseInt(localStorage.getItem('cb_maxLevel')) || 1;
let currentLevel = 1;
let highScore = parseInt(localStorage.getItem('cb_highScore')) || 0;

const SHOP_ITEMS = {
    coins_small: { name: '💰 200 монет', reward: 'coins', amount: 200, ads: 1, cooldown: 3600, icon: '💰' },
    coins_medium: { name: '💰 800 монет', reward: 'coins', amount: 800, ads: 3, cooldown: 10800, icon: '💰' },
    coins_large: { name: '💰 3000 монет', reward: 'coins', amount: 3000, ads: 7, cooldown: 43200, icon: '💰' },
    gems_small: { name: '💎 3 алмаза', reward: 'gems', amount: 3, ads: 2, cooldown: 7200, icon: '💎' },
    gems_medium: { name: '💎 10 алмазов', reward: 'gems', amount: 10, ads: 5, cooldown: 21600, icon: '💎' },
    gems_large: { name: '💎 25 алмазов', reward: 'gems', amount: 25, ads: 10, cooldown: 172800, icon: '💎' }
};

let shopCooldowns = JSON.parse(localStorage.getItem('cb_shopCooldowns')) || {};

let adPlaying = false;
let adTimer = 0;
let adReward = null;
let adTotalTime = 180;

const LOCATIONS = [
    { name: 'Орбита Земли', bg: '#0a0a1a', accent: '#0ff', difficulty: 1, theme: 'earth' },
    { name: 'Луна', bg: '#1a1a2a', accent: '#aaaaff', difficulty: 1.05, theme: 'moon' },
    { name: 'Марс', bg: '#2a0a0a', accent: '#ff6600', difficulty: 1.1, theme: 'mars' },
    { name: 'Пояс Астероидов', bg: '#1a150a', accent: '#aa8844', difficulty: 1.15, theme: 'asteroid' },
    { name: 'Юпитер', bg: '#2a1a0a', accent: '#ffaa44', difficulty: 1.2, theme: 'jupiter' },
    { name: 'Сатурн', bg: '#1a1a0a', accent: '#ffcc66', difficulty: 1.25, theme: 'saturn' },
    { name: 'Уран', bg: '#0a1a1a', accent: '#66ffcc', difficulty: 1.3, theme: 'uranus' },
    { name: 'Нептун', bg: '#0a0a2a', accent: '#4466ff', difficulty: 1.35, theme: 'neptune' },
    { name: 'Плутон', bg: '#1a0a1a', accent: '#aa66ff', difficulty: 1.4, theme: 'pluto' },
    { name: 'Пояс Койпера', bg: '#0a0a0a', accent: '#666666', difficulty: 1.45, theme: 'kuiper' },
    { name: 'Туманность Ориона', bg: '#2a0a2a', accent: '#ff66ff', difficulty: 1.5, theme: 'nebula' },
    { name: 'Крабовидная', bg: '#2a0a0a', accent: '#ff4466', difficulty: 1.55, theme: 'crab' },
    { name: 'Сириус', bg: '#0a0a1a', accent: '#aaffff', difficulty: 1.6, theme: 'sirius' },
    { name: 'Бетельгейзе', bg: '#2a0a0a', accent: '#ff2222', difficulty: 1.65, theme: 'betelgeuse' },
    { name: 'Альфа Центавра', bg: '#0a1a0a', accent: '#aaffaa', difficulty: 1.7, theme: 'alpha' },
    { name: 'Млечный Путь', bg: '#1a1a2a', accent: '#ffffff', difficulty: 1.8, theme: 'milky' },
    { name: 'Андромеда', bg: '#0a0a2a', accent: '#8888ff', difficulty: 1.9, theme: 'andromeda' },
    { name: 'Тёмная Материя', bg: '#0a0a0a', accent: '#440044', difficulty: 2.0, theme: 'dark' },
    { name: 'Квазар', bg: '#1a0a1a', accent: '#ff00ff', difficulty: 2.1, theme: 'quasar' },
    { name: 'Чёрная Дыра', bg: '#000000', accent: '#ff0000', difficulty: 2.2, theme: 'blackhole' },
    { name: 'Галактика Водоворот', bg: '#1a0a2a', accent: '#8888ff', difficulty: 2.3, theme: 'milky' },
    { name: 'Сомбреро', bg: '#2a1a0a', accent: '#ffaa44', difficulty: 2.4, theme: 'jupiter' },
    { name: 'Магеллановы Облака', bg: '#1a1a2a', accent: '#aaffff', difficulty: 2.5, theme: 'nebula' },
    { name: 'Туманность Конская', bg: '#2a0a1a', accent: '#ff6688', difficulty: 2.6, theme: 'crab' },
    { name: 'Туманность Кошачий Глаз', bg: '#0a2a1a', accent: '#66ffaa', difficulty: 2.7, theme: 'nebula' },
    { name: 'Туманность Бабочка', bg: '#2a0a2a', accent: '#ff66ff', difficulty: 2.8, theme: 'nebula' },
    { name: 'Туманность Кольцо', bg: '#0a1a2a', accent: '#66aaff', difficulty: 2.9, theme: 'nebula' },
    { name: 'Туманность Гантель', bg: '#2a1a0a', accent: '#ffaa66', difficulty: 3.0, theme: 'nebula' },
    { name: 'Крабовидная-2', bg: '#2a0a0a', accent: '#ff4466', difficulty: 3.1, theme: 'crab' },
    { name: 'Скопление Плеяды', bg: '#0a0a2a', accent: '#88aaff', difficulty: 3.2, theme: 'milky' },
    { name: 'Гиады', bg: '#1a1a2a', accent: '#ffffff', difficulty: 3.3, theme: 'milky' },
    { name: 'Стрелец A*', bg: '#000000', accent: '#ffaa00', difficulty: 3.4, theme: 'blackhole' },
    { name: 'Центавр A', bg: '#1a0a0a', accent: '#ff6666', difficulty: 3.5, theme: 'quasar' },
    { name: 'Сейферт', bg: '#2a0a2a', accent: '#ff00ff', difficulty: 3.6, theme: 'quasar' },
    { name: 'Блазар', bg: '#1a0a1a', accent: '#ff88ff', difficulty: 3.7, theme: 'quasar' },
    { name: 'Пульсар', bg: '#0a0a0a', accent: '#aaffff', difficulty: 3.8, theme: 'sirius' },
    { name: 'Магнитар', bg: '#0a0a2a', accent: '#6666ff', difficulty: 3.9, theme: 'sirius' },
    { name: 'Радиогалактика', bg: '#0a1a1a', accent: '#66ffaa', difficulty: 4.0, theme: 'quasar' },
    { name: 'Космическая Струна', bg: '#000000', accent: '#ffffff', difficulty: 4.2, theme: 'dark' },
    { name: 'Тёмная Энергия', bg: '#0a0a0a', accent: '#440044', difficulty: 4.4, theme: 'dark' },
    { name: 'Мультивселенная', bg: '#2a0a2a', accent: '#ff00ff', difficulty: 4.5, theme: 'quasar' },
    { name: 'Антиматерия', bg: '#000000', accent: '#ff0000', difficulty: 4.7, theme: 'blackhole' },
    { name: 'Обратное Время', bg: '#1a0a2a', accent: '#cc44ff', difficulty: 4.8, theme: 'quasar' },
    { name: 'Сингулярность', bg: '#000000', accent: '#ffffff', difficulty: 5.0, theme: 'blackhole' },
    { name: 'Сверхновая', bg: '#2a0a00', accent: '#ffaa00', difficulty: 5.2, theme: 'sirius' },
    { name: 'Гамма-Всплеск', bg: '#1a0000', accent: '#ffff00', difficulty: 5.5, theme: 'sirius' },
    { name: 'Тёмный Поток', bg: '#000000', accent: '#440044', difficulty: 5.7, theme: 'dark' },
    { name: 'Великий Аттрактор', bg: '#0a0000', accent: '#ff4400', difficulty: 6.0, theme: 'blackhole' },
    { name: 'Конец Времени', bg: '#000000', accent: '#ffffff', difficulty: 6.5, theme: 'blackhole' },
    { name: 'Начало Всего', bg: '#0a0a1a', accent: '#ffffff', difficulty: 7.0, theme: 'milky' }
];

const LEVELS_PER_LOCATION = 120;
const WAVES_PER_LEVEL = 5;

const ENEMY_TYPES = {
    STANDARD: { color: '#ff0000', glow: '#ff3333', dark: '#660000', hp: 12, shootChance: 0.002, speed: 1.2, score: 10, bulletSpeed: 1.2, coinReward: 5 },
    SNIPER: { color: '#ff8800', glow: '#ffaa33', dark: '#663300', hp: 8, shootChance: 0.003, speed: 0.8, score: 20, bulletSpeed: 1.3, coinReward: 10 },
    TANK: { color: '#aa44ff', glow: '#cc66ff', dark: '#440088', hp: 24, shootChance: 0.001, speed: 0.5, score: 30, bulletSpeed: 1.0, coinReward: 15 },
    FAST: { color: '#00ff44', glow: '#44ff66', dark: '#004411', hp: 8, shootChance: 0.002, speed: 2.0, score: 15, bulletSpeed: 1.1, coinReward: 8 }
};

const BOSS_TYPES = {
    giant: { name: 'Гигант', color: '#ff0000', glow: '#ff6666', hp: 500, size: 100, speed: 0.5, score: 500, coinReward: 100, mechanic: 'slow_big' },
    dragon: { name: 'Дракон', color: '#ff6600', glow: '#ffaa33', hp: 400, size: 90, speed: 1.0, score: 600, coinReward: 120, mechanic: 'fan_shots' },
    phoenix: { name: 'Феникс', color: '#ff4400', glow: '#ffaa00', hp: 350, size: 80, speed: 1.2, score: 700, coinReward: 150, mechanic: 'revive' },
    robot: { name: 'Робот', color: '#44ff88', glow: '#88ffcc', hp: 450, size: 85, speed: 0.8, score: 650, coinReward: 130, mechanic: 'laser' },
    death: { name: 'Смерть', color: '#aa44ff', glow: '#cc88ff', hp: 380, size: 75, speed: 1.5, score: 800, coinReward: 180, mechanic: 'three_phase' },
    scorpion: { name: 'Скорпион', color: '#88ff00', glow: '#aaff44', hp: 420, size: 90, speed: 0.9, score: 700, coinReward: 140, mechanic: 'tail_sting' },
    bat: { name: 'Летучая мышь', color: '#6666ff', glow: '#aaaaff', hp: 300, size: 70, speed: 2.0, score: 550, coinReward: 110, mechanic: 'zigzag' },
    octopus: { name: 'Осьминог', color: '#ff00aa', glow: '#ff66cc', hp: 480, size: 95, speed: 0.7, score: 750, coinReward: 160, mechanic: 'eight_bullets' },
    shark: { name: 'Акула', color: '#00aaff', glow: '#66ccff', hp: 400, size: 100, speed: 1.8, score: 720, coinReward: 155, mechanic: 'dash' },
    wolf: { name: 'Волк', color: '#cccccc', glow: '#eeeeee', hp: 360, size: 80, speed: 1.4, score: 680, coinReward: 145, mechanic: 'twin_wolf' },
    king: { name: 'Король', color: '#ffcc00', glow: '#ffee88', hp: 600, size: 110, speed: 0.6, score: 1000, coinReward: 250, mechanic: 'all_attacks' },
    final: { name: 'Финальный', color: '#ff00ff', glow: '#ff88ff', hp: 800, size: 120, speed: 1.0, score: 2000, coinReward: 500, mechanic: 'ultimate' }
};
const BOSS_KEYS = Object.keys(BOSS_TYPES);

const BOOSTERS = {
    damage: { name: 'x2 Урон', icon: '⚡', color: '#ff0', duration: 480 },
    invincible: { name: 'Бессмертие', icon: '🛡', color: '#0ff', duration: 300 },
    rapid: { name: 'Скорострел', icon: '🔥', color: '#f80', duration: 600 },
    heal: { name: 'Лечение', icon: '💚', color: '#0f0', duration: 1 },
    coins: { name: 'x2 Монеты', icon: '💰', color: '#ff0', duration: 720 }
};

const BOOSTER_DROP_CHANCE = 0.16;
const GEM_DROP_CHANCE = 0.03;
let boosterActivateCooldown = 1200;

let boosterInventory = [];
let activeBoosters = {};
let boosterCooldown = 0;
let boosterBtn = { x: 200, y: 540, w: 200, h: 50 };

const player = { x: 280, y: 520, w: 40, h: 40, targetX: 280, targetY: 520, lives: 5, maxLives: 5 };

let bullets = [], enemies = [], enemyBullets = [], particles = [], stars = [], explosions = [], coinPopups = [], boosterDrops = [], drones = [], gemPopups = [], bossBullets = [];

let score = 0, frame = 0, shootTimer = 0;
let waveNumber = 1, enemiesInWave = 0, enemiesSpawned = 0, waveDelay = 0, waveActive = false, waveTransition = 0;
let abilityTimers = { healer: 0, shield: 0, ghost: 0, deity: 0 };
let shieldActive = false, shieldTimer = 0;
let ghostActive = false, ghostTimer = 0;
let deityActive = false, deityTimer = 0;
let regenShieldTimer = 0;
let permanentShields = 0;

let activeBoss = null;
let isBossLevel = false;

// Экранные эффекты
let screenShake = { active: false, intensity: 0, duration: 0 };
let screenFlash = { active: false, color: '#fff', alpha: 0, duration: 0, maxDuration: 0 };
let bossWarningActive = false;
let bossWarningTimer = 0;

let themeObjects = [];

const LANES = 5, LANE_HEIGHT = 350 / LANES, MAX_PER_LANE = 6;
function getLaneY(lane) { return 80 + lane * LANE_HEIGHT; }

let laneSlots = [];
function resetLaneSlots() {
    laneSlots = [];
    for (let i = 0; i < LANES; i++) laneSlots.push(new Array(MAX_PER_LANE).fill(false));
}
function getSlotX(lane, slot) {
    const spacing = canvas.width / MAX_PER_LANE;
    return slot * spacing + spacing / 2 - 17;
}
function findFreeSlot() {
    const freeSlots = [];
    for (let lane = 0; lane < LANES; lane++) {
        for (let slot = 0; slot < MAX_PER_LANE; slot++) {
            if (!laneSlots[lane][slot]) freeSlots.push({ lane, slot });
        }
    }
    if (freeSlots.length === 0) return null;
    return freeSlots[Math.floor(Math.random() * freeSlots.length)];
}

function initStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        const layer = Math.floor(Math.random() * 3);
        stars.push({
            x: Math.random() * 600, y: Math.random() * 600,
            size: layer === 0 ? Math.random() * 1 + 0.3 : layer === 1 ? Math.random() * 1.5 + 0.7 : Math.random() * 2 + 1,
            speed: layer === 0 ? 0.3 : layer === 1 ? 0.8 : 1.8,
            brightness: layer === 0 ? 0.3 : layer === 1 ? 0.6 : 1,
            layer: layer,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}
initStars();

function initThemeObjects(theme) {
    themeObjects = [];
    for (let i = 0; i < 5; i++) {
        themeObjects.push({
            x: Math.random() * 600, y: Math.random() * 600,
            size: 50 + Math.random() * 100,
            speed: 0.1 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2
        });
    }
}

function initDrones() {
    drones = [];
    for (let i = 0; i < equipment.drone; i++) {
        drones.push({ angle: (i / Math.max(1, equipment.drone)) * Math.PI * 2, shootTimer: 0, size: 15 });
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 35, maxLife: 35, color, size: Math.random() * 4 + 1 });
    }
}

function createExplosion(x, y, color) {
    playSound('explode');
    explosions.push({ x, y, radius: 5, maxRadius: 55, life: 25, maxLife: 25, color, ring: 0 });
    createParticles(x, y, color, 20);
}

function createCoinPopup(x, y, amount) {
    playSound('coin');
    coinPopups.push({ x, y, text: '+' + amount, life: 70, maxLife: 70 });
}

function createGemPopup(x, y, amount) {
    playSound('gem');
    gemPopups.push({ x, y, text: '💎+' + amount, life: 80, maxLife: 80 });
}

function saveProgress() {
    localStorage.setItem('cb_coins', coins);
    localStorage.setItem('cb_gems', gems);
    localStorage.setItem('cb_ownedSkins', JSON.stringify(ownedSkins));
    localStorage.setItem('cb_selectedSkin', selectedSkin);
    localStorage.setItem('cb_upgradePoints', upgradePoints);
    localStorage.setItem('cb_upgrades', JSON.stringify(upgrades));
    localStorage.setItem('cb_equipment', JSON.stringify(equipment));
    localStorage.setItem('cb_unlockedLocations', unlockedLocations);
    localStorage.setItem('cb_currentLocation', currentLocation);
    localStorage.setItem('cb_maxLevel', maxLevelReached);
    localStorage.setItem('cb_highScore', highScore);
    localStorage.setItem('cb_shopCooldowns', JSON.stringify(shopCooldowns));
}

function getUpgradeBonus(type) { return upgrades[type] || 0; }
function getEquipCount(type) { return equipment[type] || 0; }

function updateLoading() {
    loadingProgress += 1.5;
    if (loadingProgress >= 100) {
        loadingProgress = 100;
        setupMenu();
    }
}

function isShopItemReady(itemKey) {
    const lastTime = shopCooldowns[itemKey] || 0;
    const now = Date.now();
    const item = SHOP_ITEMS[itemKey];
    return (now - lastTime) >= item.cooldown * 1000;
}

function getShopCooldownRemaining(itemKey) {
    const lastTime = shopCooldowns[itemKey] || 0;
    const now = Date.now();
    const item = SHOP_ITEMS[itemKey];
    return Math.max(0, item.cooldown * 1000 - (now - lastTime));
}

function formatCooldown(ms) {
    if (ms <= 0) return 'ГОТОВО';
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    if (day > 0) return day + 'д ' + (hour % 24) + 'ч';
    if (hour > 0) return hour + 'ч ' + (min % 60) + 'м';
    if (min > 0) return min + 'м ' + (sec % 60) + 'с';
    return sec + 'с';
}

function isInsideBtn(x, y, btn) { return x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h; }

// Экранные эффекты — функции
function triggerScreenShake(intensity, duration) {
    screenShake.active = true;
    screenShake.intensity = intensity;
    screenShake.duration = duration;
}
function triggerScreenFlash(color, alpha, duration) {
    screenFlash.active = true;
    screenFlash.color = color;
    screenFlash.alpha = alpha;
    screenFlash.duration = duration;
    screenFlash.maxDuration = duration;
}
function updateScreenEffects() {
    if (screenShake.active) {
        screenShake.duration--;
        if (screenShake.duration <= 0) screenShake.active = false;
    }
    if (screenFlash.active) {
        screenFlash.duration--;
        if (screenFlash.duration <= 0) screenFlash.active = false;
    }
}// ============================================================
// ЧАСТЬ 3: Меню, кнопки, setup, старт игры
// ============================================================

let menuButtons = [], skinButtons = [], locationButtons = [], levelButtons = [];
let pauseButtons = [], gameOverButtons = [], winButtons = [];
let upgradeButtons = [], equipmentButtons = [], shopButtons = [];
let pauseBtn = { x: 540, y: 10, w: 50, h: 50 };

let skinPreviewKey = 'standard';
let skinPreviewFrame = 0;
let skinChangeAnimation = 0;
let skinPreviewRotation = 0;
let skinPage = 0;
const SKINS_PER_PAGE = 7;

let levelPage = 0;
const LEVELS_PER_PAGE = 25;

let locationPage = 0;
const LOCATIONS_PER_PAGE = 12;

function setupMenu() {
    gameState = GAME_STATE.MENU;
    menuButtons = [
        { x: 150, y: 240, w: 300, h: 48, text: '▶ ИГРАТЬ', action: () => { playSound('click'); setupLocations(); } },
        { x: 150, y: 296, w: 300, h: 48, text: '🛒 МАГАЗИН', action: () => { playSound('click'); setupShop(); } },
        { x: 150, y: 352, w: 300, h: 48, text: '🎨 СКИНЫ', action: () => { playSound('click'); setupSkins(); } },
        { x: 150, y: 408, w: 300, h: 48, text: '⚡ УЛУЧШЕНИЯ', action: () => { playSound('click'); setupUpgrades(); } },
        { x: 150, y: 464, w: 300, h: 48, text: '🎁 ОБОРУДОВАНИЕ', action: () => { playSound('click'); setupEquipment(); } },
        { x: 100, y: 524, w: 180, h: 42, text: (musicEnabled ? '🎵 МУЗЫКА: ВКЛ' : '🎵 МУЗЫКА: ВЫКЛ'), action: () => { unlockAudio(); toggleMusic(); setupMenu(); } },
        { x: 320, y: 524, w: 180, h: 42, text: (sfxEnabled ? '🔊 ЗВУКИ: ВКЛ' : '🔇 ЗВУКИ: ВЫКЛ'), action: () => { unlockAudio(); toggleSfx(); setupMenu(); } }
    ];
    if (audioCtx) startMenuMusic();
}

function setupShop() {
    gameState = GAME_STATE.SHOP;
    shopButtons = [];
    const keys = Object.keys(SHOP_ITEMS);
    const cols = 2, startX = 40, startY = 130, btnW = 250, btnH = 130, gapX = 20, gapY = 15;
    keys.forEach((key, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        shopButtons.push({ x: startX + col * (btnW + gapX), y: startY + row * (btnH + gapY), w: btnW, h: btnH, shopKey: key });
    });
    shopButtons.push({ x: 200, y: 545, w: 200, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupMenu(); } });
}

function setupUpgrades() {
    gameState = GAME_STATE.UPGRADES;
    upgradeButtons = [];
    const keys = Object.keys(UPGRADE_INFO);
    const cols = 2, startX = 40, startY = 110, btnW = 250, btnH = 130, gapX = 20, gapY = 15;
    keys.forEach((key, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        upgradeButtons.push({ x: startX + col * (btnW + gapX), y: startY + row * (btnH + gapY), w: btnW, h: btnH, upgradeKey: key });
    });
    upgradeButtons.push({ x: 200, y: 545, w: 200, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupMenu(); } });
}

function setupEquipment() {
    gameState = GAME_STATE.EQUIPMENT;
    equipmentButtons = [];
    const keys = Object.keys(EQUIPMENT_INFO);
    const cols = 2, startX = 40, startY = 130, btnW = 250, btnH = 130, gapX = 20, gapY = 15;
    keys.forEach((key, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        equipmentButtons.push({ x: startX + col * (btnW + gapX), y: startY + row * (btnH + gapY), w: btnW, h: btnH, equipKey: key });
    });
    equipmentButtons.push({ x: 200, y: 545, w: 200, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupMenu(); } });
}

function setupSkins() {
    gameState = GAME_STATE.SKINS;
    skinButtons = [];
    skinPreviewFrame = 0;
    skinPreviewRotation = 0;
    skinChangeAnimation = 0;
    skinPage = 0;
    skinPreviewKey = SKINS[selectedSkin] ? selectedSkin : 'standard';
    buildSkinButtons();
}

function buildSkinButtons() {
    skinButtons = [];
    const btnW = 60, btnH = 60, gap = 8;
    const total = SKIN_KEYS.length;
    const startIdx = skinPage * SKINS_PER_PAGE;
    const endIdx = Math.min(startIdx + SKINS_PER_PAGE, total);
    const count = endIdx - startIdx;
    const totalW = count * btnW + (count - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const btnY = 510;

    for (let i = startIdx; i < endIdx; i++) {
        skinButtons.push({ x: startX + (i - startIdx) * (btnW + gap), y: btnY, w: btnW, h: btnH, skinKey: SKIN_KEYS[i] });
    }

    skinButtons.push({ x: 50, y: 485, w: 100, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupMenu(); } });
    skinButtons.push({ x: 450, y: 485, w: 100, h: 45, text: 'ВЫБРАТЬ', action: () => {
        if (!SKINS[skinPreviewKey]) return;
        const skin = SKINS[skinPreviewKey];
        if (ownedSkins.includes(skinPreviewKey)) {
            selectedSkin = skinPreviewKey;
            saveProgress();
            skinChangeAnimation = 1;
        } else {
            const currency = skin.currency === 'gems' ? gems : coins;
            if (currency >= skin.price) {
                if (skin.currency === 'gems') gems -= skin.price;
                else coins -= skin.price;
                ownedSkins.push(skinPreviewKey);
                selectedSkin = skinPreviewKey;
                playSound('buy');
                saveProgress();
                skinChangeAnimation = 1;
            }
        }
    }});

    const maxPages = Math.ceil(total / SKINS_PER_PAGE);
    if (skinPage > 0) skinButtons.push({ x: 270, y: 485, w: 50, h: 45, text: '◀', action: () => { playSound('click'); skinPage--; buildSkinButtons(); } });
    if (skinPage < maxPages - 1) skinButtons.push({ x: 330, y: 485, w: 50, h: 45, text: '▶', action: () => { playSound('click'); skinPage++; buildSkinButtons(); } });
}

function setupLocations() {
    gameState = GAME_STATE.LOCATIONS;
    locationButtons = [];
    locationPage = 0;
    buildLocationButtons();
}

function buildLocationButtons() {
    locationButtons = [];
    const cols = 4, startX = 40, startY = 115, btnW = 120, btnH = 70, gapX = 15, gapY = 15;
    const total = LOCATIONS.length;
    const startIdx = locationPage * LOCATIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + LOCATIONS_PER_PAGE, total);

    for (let i = startIdx; i < endIdx; i++) {
        const idx = i - startIdx;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        locationButtons.push({ x: startX + col * (btnW + gapX), y: startY + row * (btnH + gapY), w: btnW, h: btnH, index: i + 1 });
    }

    locationButtons.push({ x: 50, y: 540, w: 100, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupMenu(); } });
    if (locationPage > 0) locationButtons.push({ x: 200, y: 540, w: 80, h: 45, text: '◀', action: () => { playSound('click'); locationPage--; buildLocationButtons(); } });
    const maxPages = Math.ceil(total / LOCATIONS_PER_PAGE);
    if (locationPage < maxPages - 1) locationButtons.push({ x: 320, y: 540, w: 80, h: 45, text: '▶', action: () => { playSound('click'); locationPage++; buildLocationButtons(); } });
}

function setupLevels(location) {
    gameState = GAME_STATE.LEVELS;
    levelButtons = [];
    currentLocation = location;
    levelPage = 0;
    initThemeObjects(LOCATIONS[location - 1].theme);
    buildLevelButtons();
}

function buildLevelButtons() {
    levelButtons = [];
    const cols = 5, startX = 40, startY = 115, btnW = 90, btnH = 55, gapX = 15, gapY = 12;
    const totalLevels = LEVELS_PER_LOCATION;
    const startLevel = levelPage * LEVELS_PER_PAGE;
    const endLevel = Math.min(startLevel + LEVELS_PER_PAGE, totalLevels);

    for (let i = startLevel; i < endLevel; i++) {
        const idx = i - startLevel;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        levelButtons.push({ x: startX + col * (btnW + gapX), y: startY + row * (btnH + gapY), w: btnW, h: btnH, level: i + 1 });
    }

    levelButtons.push({ x: 50, y: 540, w: 100, h: 45, text: '← НАЗАД', action: () => { playSound('click'); setupLocations(); } });
    if (levelPage > 0) levelButtons.push({ x: 200, y: 540, w: 80, h: 45, text: '◀', action: () => { playSound('click'); levelPage--; buildLevelButtons(); } });
    const maxPages = Math.ceil(totalLevels / LEVELS_PER_PAGE);
    if (levelPage < maxPages - 1) levelButtons.push({ x: 320, y: 540, w: 80, h: 45, text: '▶', action: () => { playSound('click'); levelPage++; buildLevelButtons(); } });
}

function setupGameOver() {
    playSound('lose');
    stopMusic();
    gameState = GAME_STATE.GAMEOVER;
    gameOverButtons = [
        { x: 150, y: 400, w: 300, h: 55, text: '🔄 ЗАНОВО', action: () => { playSound('click'); startGame(currentLocation, currentLevel); } },
        { x: 150, y: 465, w: 300, h: 55, text: '🏠 МЕНЮ', action: () => { playSound('click'); setupMenu(); } }
    ];
}

function setupWin() {
    playSound('win');
    stopMusic();
    gameState = GAME_STATE.WIN;
    winButtons = [
        { x: 150, y: 400, w: 300, h: 55, text: '➡ СЛЕДУЮЩИЙ', action: () => {
            playSound('click');
            let nextLevel = currentLevel + 1;
            if (nextLevel > LEVELS_PER_LOCATION) {
                if (currentLocation < LOCATIONS.length) { currentLocation++; currentLevel = 1; }
                else { setupMenu(); return; }
            } else currentLevel = nextLevel;
            startGame(currentLocation, currentLevel);
        }},
        { x: 150, y: 465, w: 300, h: 55, text: '🏠 МЕНЮ', action: () => { playSound('click'); setupMenu(); } }
    ];
}

function setupPause() {
    gameState = GAME_STATE.PAUSED;
    pauseButtons = [
        { x: 150, y: 240, w: 300, h: 55, text: '▶ ПРОДОЛЖИТЬ', action: () => { playSound('click'); gameState = GAME_STATE.PLAYING; } },
        { x: 150, y: 305, w: 300, h: 55, text: '🔄 ЗАНОВО', action: () => { playSound('click'); startGame(currentLocation, currentLevel); } },
        { x: 150, y: 370, w: 300, h: 55, text: '🏠 ГЛАВНОЕ МЕНЮ', action: () => { playSound('click'); setupMenu(); } }
    ];
}

function startAd(itemKey) {
    if (adPlaying) return;
    const item = SHOP_ITEMS[itemKey];
    adPlaying = true;
    adTimer = adTotalTime;
    adReward = { type: item.reward, amount: item.amount };
}

function updateAd() {
    if (!adPlaying) return;
    adTimer--;
    if (adTimer <= 0) {
        adPlaying = false;
        if (adReward) {
            if (adReward.type === 'coins') { coins += adReward.amount; createCoinPopup(300, 300, adReward.amount); }
            else if (adReward.type === 'gems') { gems += adReward.amount; createGemPopup(300, 300, adReward.amount); }
            adReward = null;
            saveProgress();
        }
    }
}

function startGame(location, level) {
    unlockAudio();
    startGameMusic();
    gameState = GAME_STATE.PLAYING;
    currentLocation = location;
    currentLevel = level;
    player.x = 280; player.y = 520;
    player.targetX = 280; player.targetY = 520;
    player.maxLives = 5 + getUpgradeBonus('health');
    if (selectedSkin === 'titan') player.maxLives += 2;
    player.lives = player.maxLives;
    bullets = []; enemies = []; enemyBullets = [];
    particles = []; explosions = []; coinPopups = []; gemPopups = []; boosterDrops = []; bossBullets = [];
    score = 0; frame = 0; shootTimer = 0;
    waveNumber = 1; enemiesSpawned = 0; enemiesInWave = 0;
    waveActive = false; waveDelay = 0; waveTransition = 0;
    abilityTimers = { healer: 0, shield: 0, ghost: 0, deity: 0 };
    shieldActive = false; shieldTimer = 0;
    ghostActive = false; ghostTimer = 0;
    deityActive = false; deityTimer = 0;
    regenShieldTimer = 0; permanentShields = 0;
    boosterInventory = []; activeBoosters = {}; boosterCooldown = 0;
    resetLaneSlots();
    initStars();
    initDrones();
    initThemeObjects(LOCATIONS[location - 1].theme);
    screenShake.active = false;
    screenFlash.active = false;

    isBossLevel = (level % 10 === 0);
    activeBoss = null;
    if (isBossLevel) {
        spawnBoss();
    }
}

function spawnBoss() {
    let bossKey = BOSS_KEYS[0];
    const bossIndex = Math.floor(currentLevel / 10) - 1;
    bossKey = BOSS_KEYS[bossIndex % BOSS_KEYS.length];

    const bossType = BOSS_TYPES[bossKey];
    const loc = LOCATIONS[currentLocation - 1];
    const diff = loc.difficulty * (1 + currentLevel / 50);

    activeBoss = {
        x: 300, y: 150,
        w: bossType.size, h: bossType.size,
        type: bossKey,
        hp: Math.ceil(bossType.hp * diff),
        maxHp: Math.ceil(bossType.hp * diff),
        speed: bossType.speed,
        score: bossType.score,
        coinReward: bossType.coinReward,
        color: bossType.color,
        glow: bossType.glow,
        mechanic: bossType.mechanic,
        phase: 1,
        shootTimer: 0,
        moveTimer: 0,
        direction: 1,
        revived: false
    };
}// ============================================================
// ЧАСТЬ 4: Игровая логика (updateGame, стрельба, столкновения, боссы)
// ============================================================

function updateGame() {
    player.x = player.targetX;
    player.y = player.targetY;
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    updateAbilities();
    updateScreenEffects();

    for (let key in activeBoosters) if (activeBoosters[key] > 0) activeBoosters[key]--;
    if (boosterCooldown > 0) boosterCooldown--;

    if (frame % 2 === 0 && !ghostActive) {
        particles.push({
            x: player.x + player.w/2 + (Math.random() - 0.5) * 12,
            y: player.y + player.h,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + 1,
            life: 25, maxLife: 25,
            color: SKINS[selectedSkin] ? SKINS[selectedSkin].color : '#0ff',
            size: Math.random() * 4 + 1
        });
    }

    shootTimer++;
    if (shootTimer % getShootInterval() === 0) shoot();

    for (let d of drones) {
        d.angle += 0.02;
        d.shootTimer++;
        if (d.shootTimer % 40 === 0) shootFromDrone(d);
    }

    // БОСС
    if (activeBoss) {
        updateBoss();
    } else {
        if (waveTransition > 0) {
            waveTransition--;
            if (waveTransition === 0) {
                if (waveNumber >= WAVES_PER_LEVEL) { levelComplete(); return; }
                else { waveNumber++; startWave(); }
            }
        } else if (waveActive) {
            if (enemiesSpawned < enemiesInWave) {
                if (frame % Math.max(15, 30 - waveNumber) === 0) spawnEnemy();
            }
            if (enemiesSpawned >= enemiesInWave && enemies.length === 0) {
                waveActive = false;
                waveTransition = 90;
            }
        } else if (enemiesInWave === 0 && frame > 30) {
            startWave();
        }
    }

    // ВРАГИ
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        if (e.iceTimer > 0) { e.iceTimer--; e.speed = e.baseSpeed * 0.3; }
        else { e.speed = e.baseSpeed; }

        if (e.fireTimer > 0) {
            e.fireTimer--;
            if (e.fireTimer % 30 === 0) {
                e.hp -= 2;
                createParticles(e.x + e.w/2, e.y + e.h/2, '#ff4400', 4);
                if (e.hp <= 0) {
                    const mult = activeBoosters.coins > 0 ? 2 : 1;
                    const coinBonus = 1 + getUpgradeBonus('coins') * 0.1;
                    score += e.score;
                    coins += Math.floor(e.coinReward * mult * coinBonus);
                    createCoinPopup(e.x + e.w/2, e.y, Math.floor(e.coinReward * mult * coinBonus));
                    createExplosion(e.x + e.w/2, e.y + e.h/2, e.color);
                    tryDropBooster(e.x + e.w/2, e.y + e.h/2);
                    tryDropGems(e.x + e.w/2, e.y + e.h/2);
                    laneSlots[e.lane][e.slot] = false;
                    enemies.splice(i, 1);
                    saveProgress();
                    continue;
                }
            }
        }

        if (!e.stopped) {
            e.y += e.speed;
            if (e.y >= e.targetY) { e.stopped = true; e.y = e.targetY; }
        } else {
            e.x = e.targetX;
            if (Math.random() < e.shootChance && player.lives > 0) {
                if (e.type === 'SNIPER') {
                    const dx = player.x + player.w/2 - (e.x + e.w/2);
                    const dy = player.y + player.h/2 - (e.y + e.h/2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 0) enemyBullets.push({ x: e.x + e.w/2 - 4, y: e.y + e.h, w: 8, h: 12, speed: e.bulletSpeed, vx: (dx / dist) * 0.8, vy: (dy / dist) * e.bulletSpeed });
                } else if (e.type === 'TANK') {
                    for (let angle = -0.3; angle <= 0.3; angle += 0.3)
                        enemyBullets.push({ x: e.x + e.w/2 - 4, y: e.y + e.h, w: 8, h: 12, speed: e.bulletSpeed, vx: Math.sin(angle) * 1.0, vy: e.bulletSpeed });
                } else {
                    enemyBullets.push({ x: e.x + e.w/2 - 4, y: e.y + e.h, w: 8, h: 12, speed: e.bulletSpeed, vx: 0, vy: e.bulletSpeed });
                }
            }
        }
    }

    // ПУЛИ ИГРОКА
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.crystal) {
            b.x += b.vx; b.y += b.vy;
            if (b.x < 0 || b.x > canvas.width - b.w) { b.vx *= -1; b.bounceLeft--; }
            if (b.y < 0 || b.y > canvas.height - b.h) { b.vy *= -1; b.bounceLeft--; }
            if (b.bounceLeft <= 0) bullets.splice(i, 1);
        } else {
            b.y -= b.speed;
            if (b.y < -60) bullets.splice(i, 1);
        }
    }

    // ПУЛИ ВРАГОВ
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.x += eb.vx || 0;
        eb.y += eb.vy || eb.speed || 0;
        if (eb.x < player.x + player.w && eb.x + eb.w > player.x && eb.y < player.y + player.h && eb.y + eb.h > player.y) {
            enemyBullets.splice(i, 1);
            if (ghostActive || deityActive) continue;
            if (permanentShields > 0) { permanentShields--; createExplosion(player.x + player.w/2, player.y + player.h/2, '#0ff'); continue; }
            if (shieldActive) { shieldActive = false; abilityTimers.shield = 0; createExplosion(player.x + player.w/2, player.y + player.h/2, '#aa44ff'); continue; }
            if (activeBoosters.invincible > 0) continue;
            createExplosion(player.x + player.w/2, player.y + player.h/2, '#0ff');
            playSound('hit');
            if (player.lives > 0) { player.lives--; if (player.lives <= 0) { gameOver(); return; } }
            continue;
        }
        if (eb.y > canvas.height + 20 || eb.x < -20 || eb.x > canvas.width + 20) enemyBullets.splice(i, 1);
    }

    // ПУЛИ БОССА
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const bb = bossBullets[i];
        // Лазерные столбы стоят на месте
        if (bb.laserPillar) {
            bb.life = (bb.life || 60) - 1;
            if (bb.life <= 0) { bossBullets.splice(i, 1); continue; }
        } else {
            bb.x += bb.vx || 0;
            bb.y += bb.vy || 0;
        }
        if (bb.x < player.x + player.w && bb.x + bb.w > player.x && bb.y < player.y + player.h && bb.y + bb.h > player.y) {
            if (!bb.laserPillar) bossBullets.splice(i, 1);
            if (ghostActive || deityActive) continue;
            if (permanentShields > 0) { permanentShields--; createExplosion(player.x + player.w/2, player.y + player.h/2, '#0ff'); continue; }
            if (shieldActive) { shieldActive = false; abilityTimers.shield = 0; createExplosion(player.x + player.w/2, player.y + player.h/2, '#aa44ff'); continue; }
            if (activeBoosters.invincible > 0) continue;
            createExplosion(player.x + player.w/2, player.y + player.h/2, '#f0f');
            playSound('hit');
            if (player.lives > 0) { player.lives--; if (player.lives <= 0) { gameOver(); return; } }
            continue;
        }
        if (!bb.laserPillar && (bb.y > canvas.height + 30 || bb.y < -30 || bb.x < -30 || bb.x > canvas.width + 30)) bossBullets.splice(i, 1);
    }

    // СТОЛКНОВЕНИЯ
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let bulletHit = false;

        if (activeBoss) {
            const e = activeBoss;
            if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                e.hp -= b.damage;
                createParticles(b.x, b.y, b.crit ? '#ff0' : e.color, b.crit ? 12 : 6);
                if (b.crystal) {
                    const dx = b.x - (e.x + e.w/2);
                    const dy = b.y - (e.y + e.h/2);
                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy) || 4;
                    b.vx = (dx / dist) * speed;
                    b.vy = (dy / dist) * speed;
                    b.bounceLeft--;
                }
                if (e.hp <= 0) {
                    if (e.mechanic === 'revive' && !e.revived) {
                        e.revived = true;
                        e.hp = e.maxHp;
                        e.color = '#ff8800';
                        e.glow = '#ffcc44';
                        createExplosion(e.x + e.w/2, e.y + e.h/2, '#ff0');
                    } else {
                        const mult = activeBoosters.coins > 0 ? 2 : 1;
                        const coinBonus = 1 + getUpgradeBonus('coins') * 0.1;
                        score += e.score;
                        coins += Math.floor(e.coinReward * mult * coinBonus);
                        gems += 50;
                        createCoinPopup(e.x + e.w/2, e.y, Math.floor(e.coinReward * mult * coinBonus));
                        createGemPopup(e.x + e.w/2, e.y + 30, 50);
                        createExplosion(e.x + e.w/2, e.y + e.h/2, e.color);
                        createExplosion(e.x + e.w/2, e.y + e.h/2, '#fff');
                        triggerScreenFlash('#fff', 0.5, 30);
                        triggerScreenShake(15, 40);
                        activeBoss = null;
                        saveProgress();
                        setTimeout(() => {
                            if (gameState === GAME_STATE.PLAYING) levelComplete();
                        }, 1000);
                        return;
                    }
                }
                if (!b.laser && !b.crystal) { bulletHit = true; break; }
            }
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                e.hp -= b.damage;
                if (b.ice) e.iceTimer = 180;
                if (b.fire) e.fireTimer = 180;
                createParticles(b.x, b.y, b.crit ? '#ff0' : e.color, b.crit ? 12 : 6);

                if (b.crystal) {
                    const dx = b.x - (e.x + e.w/2);
                    const dy = b.y - (e.y + e.h/2);
                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy) || 4;
                    b.vx = (dx / dist) * speed;
                    b.vy = (dy / dist) * speed;
                    b.bounceLeft--;
                }

                if (e.hp <= 0) {
                    const mult = activeBoosters.coins > 0 ? 2 : 1;
                    const coinBonus = 1 + getUpgradeBonus('coins') * 0.1;
                    score += e.score;
                    coins += Math.floor(e.coinReward * mult * coinBonus);
                    createCoinPopup(e.x + e.w/2, e.y, Math.floor(e.coinReward * mult * coinBonus));
                    createExplosion(e.x + e.w/2, e.y + e.h/2, e.color);
                    tryDropBooster(e.x + e.w/2, e.y + e.h/2);
                    tryDropGems(e.x + e.w/2, e.y + e.h/2);
                    laneSlots[e.lane][e.slot] = false;
                    enemies.splice(j, 1);
                    saveProgress();
                }

                if (!b.laser && !b.crystal) { bulletHit = true; break; }
                if (b.crystal && b.bounceLeft <= 0) { bulletHit = true; break; }
            }
        }
        if (bulletHit && !b.crystal) bullets.splice(i, 1);
    }

    // БУСТЕРЫ, ЧАСТИЦЫ
    for (let i = boosterDrops.length - 1; i >= 0; i--) {
        const bd = boosterDrops[i];
        bd.y += bd.vy; bd.wobble += 0.1;
        bd.x += Math.sin(bd.wobble) * 1;
        if (bd.x < player.x + player.w && bd.x + bd.w > player.x && bd.y < player.y + player.h && bd.y + bd.h > player.y) {
            boosterInventory.push(bd.type);
            playSound('booster');
            createCoinPopup(bd.x + bd.w/2, bd.y, BOOSTERS[bd.type].icon);
            boosterDrops.splice(i, 1);
            continue;
        }
        if (bd.y > canvas.height + 30) boosterDrops.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        ex.radius += (ex.maxRadius - ex.radius) * 0.12;
        ex.ring += 2; ex.life--;
        if (ex.life <= 0) explosions.splice(i, 1);
    }

    for (let i = coinPopups.length - 1; i >= 0; i--) {
        coinPopups[i].y -= 1.2; coinPopups[i].life--;
        if (coinPopups[i].life <= 0) coinPopups.splice(i, 1);
    }

    for (let i = gemPopups.length - 1; i >= 0; i--) {
        gemPopups[i].y -= 0.8; gemPopups[i].life--;
        if (gemPopups[i].life <= 0) gemPopups.splice(i, 1);
    }

    for (let s of stars) {
        s.y += s.speed;
        if (s.y > 600) { s.y = 0; s.x = Math.random() * 600; }
        s.twinklePhase += 0.05;
    }

    for (let t of themeObjects) {
        t.y += t.speed; t.phase += 0.01; t.rot += 0.002;
        if (t.y > 650) { t.y = -50; t.x = Math.random() * 600; }
    }

    frame++;
}

// БОСС — движение и фазы
function updateBoss() {
    const b = activeBoss;
    b.moveTimer++;
    b.shootTimer++;

    if (b.mechanic === 'dash') {
        b.x += Math.sin(b.moveTimer * 0.05) * b.speed * 3 * b.direction;
        b.y = 130 + Math.sin(b.moveTimer * 0.04) * 50;
    } else if (b.mechanic === 'zigzag') {
        b.x += Math.cos(b.moveTimer * 0.08) * b.speed * 4 * b.direction;
        b.y = 120 + Math.sin(b.moveTimer * 0.06) * 60;
    } else {
        b.x += Math.sin(b.moveTimer * 0.02) * b.speed * 2 * b.direction;
        b.y = 150 + Math.sin(b.moveTimer * 0.03) * 30;
    }
    if (b.x < 50) { b.x = 50; b.direction *= -1; }
    if (b.x > canvas.width - b.w - 50) { b.x = canvas.width - b.w - 50; b.direction *= -1; }

    const hpPercent = b.hp / b.maxHp;
    let newPhase = 1;
    if (hpPercent < 0.3) newPhase = 3;
    else if (hpPercent < 0.6) newPhase = 2;

    if (newPhase !== b.phase) {
        b.phase = newPhase;
        triggerScreenFlash(b.glow, 0.4, 20);
        playSound('boss');
        createParticles(b.x + b.w/2, b.y + b.h/2, b.glow, 40);
    }

    let shootRate;
    if (b.phase === 3) shootRate = 30;
    else if (b.phase === 2) shootRate = 50;
    else shootRate = 70;

    if (b.shootTimer > shootRate - 15 && !bossWarningActive) {
        bossWarningActive = true;
        bossWarningTimer = 15;
    }
    if (bossWarningTimer > 0) {
        bossWarningTimer--;
        if (bossWarningTimer === 0) bossWarningActive = false;
    }

    if (b.shootTimer > shootRate) {
        b.shootTimer = 0;
        bossShoot();
    }
}

// Роутер атак боссов
function bossShoot() {
    playSound('boss');
    const b = activeBoss;
    const cx = b.x + b.w/2;
    const cy = b.y + b.h/2;
    const m = b.mechanic;

    if (m === 'slow_big') bossAttackGiant(b, cx, cy);
    else if (m === 'fan_shots') bossAttackDragon(b, cx, cy);
    else if (m === 'revive') bossAttackPhoenix(b, cx, cy);
    else if (m === 'laser') bossAttackRobot(b, cx, cy);
    else if (m === 'three_phase') bossAttackDeath(b, cx, cy);
    else if (m === 'tail_sting') bossAttackScorpion(b, cx, cy);
    else if (m === 'zigzag') bossAttackBat(b, cx, cy);
    else if (m === 'eight_bullets') bossAttackOctopus(b, cx, cy);
    else if (m === 'dash') bossAttackShark(b, cx, cy);
    else if (m === 'twin_wolf') bossAttackWolf(b, cx, cy);
    else if (m === 'all_attacks') bossAttackKing(b, cx, cy);
    else if (m === 'ultimate') bossAttackFinal(b, cx, cy);
    else bossAttackGiant(b, cx, cy);
}

// СПОСОБНОСТИ
function updateAbilities() {
    if (selectedSkin === 'healer') {
        abilityTimers.healer++;
        if (abilityTimers.healer >= 1500) {
            abilityTimers.healer = 0;
            if (player.lives < player.maxLives) { player.lives++; createCoinPopup(player.x + player.w/2, player.y - 20, '+❤️'); }
        }
    }
    if (selectedSkin === 'shield') {
        if (!shieldActive) {
            abilityTimers.shield++;
            if (abilityTimers.shield >= 900) { abilityTimers.shield = 0; shieldActive = true; shieldTimer = 300; }
        } else {
            shieldTimer--;
            if (shieldTimer <= 0) { shieldActive = false; abilityTimers.shield = 0; }
        }
    }
    if (selectedSkin === 'ghost') {
        if (!ghostActive) {
            abilityTimers.ghost++;
            if (abilityTimers.ghost >= 1200) { abilityTimers.ghost = 0; ghostActive = true; ghostTimer = 180; }
        } else {
            ghostTimer--;
            if (ghostTimer <= 0) { ghostActive = false; abilityTimers.ghost = 0; }
        }
    }
    if (selectedSkin === 'deity') {
        if (!deityActive) {
            abilityTimers.deity++;
            if (abilityTimers.deity >= 1200) { abilityTimers.deity = 0; deityActive = true; deityTimer = 180; }
        } else {
            deityTimer--;
            if (deityTimer <= 0) { deityActive = false; abilityTimers.deity = 0; }
        }
    }
    const shieldRegenCount = getEquipCount('shieldRegen');
    if (shieldRegenCount > 0) {
        regenShieldTimer++;
        if (regenShieldTimer >= 600) {
            regenShieldTimer = 0;
            if (permanentShields < shieldRegenCount) { permanentShields++; createCoinPopup(player.x + player.w/2, player.y - 30, '🛡 +1'); }
        }
    }
}

function getShootInterval() {
    let base = 25;
    if (selectedSkin === 'rapid') base = 12;
    if (selectedSkin === 'berserk') base = 40;
    if (selectedSkin === 'rainbow') base = 18;
    if (selectedSkin === 'laser') base = 14;
    if (selectedSkin === 'titan') base = 12;
    if (selectedSkin === 'deity') base = 15;
    if (selectedSkin === 'crystal') base = 18;
    if (activeBoosters.rapid > 0) base = Math.floor(base / 2);
    const fireBonus = 1 - getUpgradeBonus('fireRate') * 0.05;
    base = Math.floor(base * fireBonus);
    return Math.max(3, base);
}

function getBulletDamage() {
    let dmg = 4;
    if (selectedSkin === 'berserk') dmg = 8;
    if (selectedSkin === 'rainbow') dmg = 8;
    if (selectedSkin === 'titan') dmg = 12;
    if (selectedSkin === 'deity') dmg = 20;
    if (selectedSkin === 'crystal') dmg = 16;
    if (activeBoosters.damage > 0) dmg *= 2;
    dmg = dmg * (1 + getUpgradeBonus('damage') * 0.1);
    return Math.ceil(dmg);
}

function rollCrit() {
    const critChance = getEquipCount('crit') * 0.1;
    return Math.random() < critChance;
}

function shoot() {
    const skin = SKINS[selectedSkin] || SKINS.standard;
    let bulletSpeed = 3;
    if (selectedSkin === 'sniper') bulletSpeed = 6;
    if (selectedSkin === 'rainbow') bulletSpeed = 4;
    const sizeBonus = 1 + getUpgradeBonus('bulletSize') * 0.1;

    if (selectedSkin === 'laser') {
        playSound('laser');
        bullets.push({
            x: player.x + player.w/2 - 2, y: player.y,
            w: 4 * sizeBonus, h: 40, speed: 5,
            damage: 0.2, laser: true, color: skin.color
        });
        return;
    }

    if (selectedSkin === 'crystal') {
        playSound('shoot');
        bullets.push({
            x: player.x + player.w/2 - 3, y: player.y,
            w: 8, h: 16, speed: 4,
            damage: getBulletDamage(), crystal: true, bounceLeft: 3,
            vx: 0, vy: -4, color: skin.color
        });
        return;
    }

    playSound('shoot');
    const shotCount = 1 + getEquipCount('doubleShot');
    for (let s = 0; s < shotCount; s++) {
        const offset = (s - (shotCount - 1) / 2) * 12;
        const isCrit = rollCrit();
        bullets.push({
            x: player.x + player.w/2 - 3 + offset, y: player.y,
            w: 6 * sizeBonus, h: 18 * sizeBonus,
            speed: bulletSpeed,
            damage: getBulletDamage() * (isCrit ? 2 : 1),
            crit: isCrit,
            explosive: selectedSkin === 'bomber',
            ice: selectedSkin === 'ice',
            fire: selectedSkin === 'fire',
            color: isCrit ? '#ff0' : skin.color
        });
    }
}

function shootFromDrone(d) {
    const px = player.x + player.w/2 + Math.cos(d.angle) * 50;
    const py = player.y + player.h/2 + Math.sin(d.angle) * 50;
    bullets.push({ x: px, y: py, w: 5, h: 12, speed: 4, damage: 3, color: '#0ff' });
}

function tryDropBooster(x, y) {
    if (Math.random() < BOOSTER_DROP_CHANCE) {
        const types = ['damage', 'invincible', 'rapid', 'heal', 'coins'];
        const weights = [0.25, 0.1, 0.25, 0.2, 0.2];
        let r = Math.random(), type = 'damage', cum = 0;
        for (let i = 0; i < types.length; i++) { cum += weights[i]; if (r <= cum) { type = types[i]; break; } }
        boosterDrops.push({ x: x, y: y, w: 30, h: 30, type: type, vy: 2, wobble: 0 });
    }
}

function tryDropGems(x, y) {
    if (Math.random() < GEM_DROP_CHANCE) {
        const amount = Math.floor(Math.random() * 5) + 1;
        gems += amount;
        createGemPopup(x, y, amount);
        createParticles(x, y, '#88ffff', 15);
    }
}

function activateBooster() {
    if (boosterCooldown > 0) return;
    if (boosterInventory.length === 0) return;
    playSound('booster');
    const type = boosterInventory.shift();
    const booster = BOOSTERS[type];
    if (type === 'heal') {
        player.lives = Math.min(player.lives + 2, player.maxLives);
        createCoinPopup(player.x + player.w/2, player.y - 30, '+2❤️');
    } else {
        if (activeBoosters[type]) activeBoosters[type] += booster.duration;
        else activeBoosters[type] = booster.duration;
        createCoinPopup(player.x + player.w/2, player.y - 30, booster.icon + ' ВКЛ');
    }
    const cdReduction = 1 - getEquipCount('cooldown') * 0.1;
    boosterCooldown = Math.floor(boosterActivateCooldown * cdReduction);
}

function getWaveEnemyCount(wave) {
    const base = 8 + Math.floor(wave * 2) + Math.floor(currentLevel / 5);
    return Math.min(base, LANES * MAX_PER_LANE);
}

function startWave() {
    enemiesInWave = getWaveEnemyCount(waveNumber);
    enemiesSpawned = 0;
    waveActive = true;
    waveDelay = 0;
    resetLaneSlots();
}

function spawnEnemy() {
    if (!waveActive || enemiesSpawned >= enemiesInWave) return;
    const freeSlot = findFreeSlot();
    if (!freeSlot) return;
    const { lane, slot } = freeSlot;
    laneSlots[lane][slot] = true;

    const loc = LOCATIONS[currentLocation - 1];
    const diff = loc.difficulty * (1 + currentLevel / 100);

    let typeKey = 'STANDARD';
    const r = Math.random();
    if (waveNumber <= 2) typeKey = 'STANDARD';
    else if (waveNumber <= 4) typeKey = r < 0.7 ? 'STANDARD' : 'SNIPER';
    else {
        if (r < 0.4) typeKey = 'STANDARD';
        else if (r < 0.6) typeKey = 'SNIPER';
        else if (r < 0.8) typeKey = 'FAST';
        else typeKey = 'TANK';
    }

    const type = ENEMY_TYPES[typeKey];
    const x = getSlotX(lane, slot);
    const laneY = getLaneY(lane);

    enemies.push({
        x, y: -40, w: 35, h: 35, lane, slot,
        targetX: x, targetY: laneY, type: typeKey,
        hp: Math.ceil(type.hp * diff), maxHp: Math.ceil(type.hp * diff),
        speed: type.speed, baseSpeed: type.speed,
        shootChance: type.shootChance,
        stopped: false, score: type.score,
        color: type.color, glow: type.glow, dark: type.dark,
        bulletSpeed: type.bulletSpeed, coinReward: type.coinReward,
        iceTimer: 0, fireTimer: 0
    });
    enemiesSpawned++;
}

function gameOver() {
    if (score > highScore) highScore = score;
    saveProgress();
    setupGameOver();
}

function levelComplete() {
    const coinBonus = 1 + getUpgradeBonus('coins') * 0.1;
    coins += Math.floor((50 + currentLevel * 5) * coinBonus);
    gems += 10;
    if (currentLevel >= maxLevelReached && maxLevelReached < LEVELS_PER_LOCATION) {
        maxLevelReached++;
        if (maxLevelReached % 15 === 0) upgradePoints++;
    }
    saveProgress();
    setupWin();
}

function handleTouch(x, y) {
    unlockAudio();
    if (adPlaying) return;

    if (gameState === GAME_STATE.PLAYING) {
        if (isInsideBtn(x, y, pauseBtn)) { playSound('click'); setupPause(); return; }
        if (isInsideBtn(x, y, boosterBtn)) { activateBooster(); return; }
        player.targetX = x - player.w/2;
        player.targetY = y - player.h/2;
    } else if (gameState === GAME_STATE.PAUSED) {
        for (let btn of pauseButtons) if (isInsideBtn(x, y, btn)) { btn.action(); return; }
    } else if (gameState === GAME_STATE.MENU) {
        for (let btn of menuButtons) if (isInsideBtn(x, y, btn)) { btn.action(); return; }
    } else if (gameState === GAME_STATE.SHOP) {
        for (let btn of shopButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.shopKey) {
                    if (isShopItemReady(btn.shopKey)) {
                        playSound('click');
                        startAd(btn.shopKey);
                        shopCooldowns[btn.shopKey] = Date.now();
                        saveProgress();
                    }
                    return;
                }
            }
        }
    } else if (gameState === GAME_STATE.SKINS) {
        for (let btn of skinButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.skinKey && SKINS[btn.skinKey]) { playSound('click'); skinPreviewKey = btn.skinKey; skinChangeAnimation = 1; return; }
            }
        }
    } else if (gameState === GAME_STATE.UPGRADES) {
        for (let btn of upgradeButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.upgradeKey && upgradePoints > 0 && upgrades[btn.upgradeKey] < UPGRADE_MAX) {
                    upgrades[btn.upgradeKey]++; upgradePoints--; playSound('buy'); saveProgress(); return;
                }
            }
        }
    } else if (gameState === GAME_STATE.EQUIPMENT) {
        for (let btn of equipmentButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.equipKey && equipment[btn.equipKey] < EQUIPMENT_MAX) {
                    const price = EQUIPMENT_INFO[btn.equipKey].price * (equipment[btn.equipKey] + 1);
                    if (coins >= price) { coins -= price; equipment[btn.equipKey]++; playSound('buy'); saveProgress(); return; }
                }
            }
        }
    } else if (gameState === GAME_STATE.LOCATIONS) {
        for (let btn of locationButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.index && btn.index <= unlockedLocations) { playSound('click'); setupLevels(btn.index); return; }
                return;
            }
        }
    } else if (gameState === GAME_STATE.LEVELS) {
        for (let btn of levelButtons) {
            if (isInsideBtn(x, y, btn)) {
                if (btn.action) { btn.action(); return; }
                if (btn.level && btn.level <= maxLevelReached) { playSound('click'); startGame(currentLocation, btn.level); return; }
                return;
            }
        }
    } else if (gameState === GAME_STATE.GAMEOVER) {
        for (let btn of gameOverButtons) if (isInsideBtn(x, y, btn)) { btn.action(); return; }
    } else if (gameState === GAME_STATE.WIN) {
        for (let btn of winButtons) if (isInsideBtn(x, y, btn)) { btn.action(); return; }
    }
}
// ============================================================
// ЧАСТЬ 5: Формы кораблей, враги, drawShipByKey
// ============================================================

function drawFormStandard(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(-size * 0.4, size * 0.35);
    ctx.lineTo(0, size * 0.25);
    ctx.lineTo(size * 0.4, size * 0.35);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(0, -size * 0.1, size * 0.1, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    drawEngineFlame(size);
}

function drawFormHealer(size, color, glow, dark) {
    const grad = ctx.createRadialGradient(-size * 0.1, -size * 0.1, size * 0.05, 0, 0, size * 0.5);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 15;
    ctx.fillRect(-size * 0.05, -size * 0.25, size * 0.1, size * 0.5);
    ctx.fillRect(-size * 0.25, -size * 0.05, size * 0.5, size * 0.1);
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormRapid(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(-size * 0.25, -size * 0.2);
    ctx.lineTo(-size * 0.35, size * 0.3);
    ctx.lineTo(-size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.35, size * 0.3);
    ctx.lineTo(size * 0.25, -size * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(-size * 0.15, -size * 0.5, size * 0.08, size * 0.4);
    ctx.fillRect(size * 0.07, -size * 0.5, size * 0.08, size * 0.4);
    drawEngineFlame(size);
}

function drawFormShield(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.35);
    ctx.lineTo(size * 0.35, -size * 0.35);
    ctx.lineTo(size * 0.4, size * 0.2);
    ctx.lineTo(size * 0.2, size * 0.4);
    ctx.lineTo(-size * 0.2, size * 0.4);
    ctx.lineTo(-size * 0.4, size * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.shadowColor = glow; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormBerserk(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(-size * 0.15, -size * 0.3);
    ctx.lineTo(-size * 0.5, -size * 0.4);
    ctx.lineTo(-size * 0.25, 0);
    ctx.lineTo(-size * 0.55, size * 0.3);
    ctx.lineTo(-size * 0.15, size * 0.3);
    ctx.lineTo(0, size * 0.45);
    ctx.lineTo(size * 0.15, size * 0.3);
    ctx.lineTo(size * 0.55, size * 0.3);
    ctx.lineTo(size * 0.25, 0);
    ctx.lineTo(size * 0.5, -size * 0.4);
    ctx.lineTo(size * 0.15, -size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    const coreGrad = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.15);
    coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.5, '#ff0'); coreGrad.addColorStop(1, '#f00');
    ctx.fillStyle = coreGrad; ctx.shadowColor = '#f00'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormSniper(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.lineTo(-size * 0.15, -size * 0.3);
    ctx.lineTo(-size * 0.3, size * 0.2);
    ctx.lineTo(-size * 0.2, size * 0.4);
    ctx.lineTo(size * 0.2, size * 0.4);
    ctx.lineTo(size * 0.3, size * 0.2);
    ctx.lineTo(size * 0.15, -size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(-size * 0.04, -size * 0.65, size * 0.08, size * 0.7);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -size * 0.15, size * 0.08, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f00'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, -size * 0.15, size * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormBomber(size, color, glow, dark) {
    const grad = ctx.createRadialGradient(-size * 0.1, -size * 0.1, size * 0.05, 0, 0, size * 0.5);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    const bombs = [[-size * 0.45, size * 0.1], [size * 0.45, size * 0.1]];
    for (let b of bombs) {
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(b[0], b[1], size * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(b[0] + size * 0.05, b[1] - size * 0.15, size * 0.02, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }
    drawEngineFlame(size);
}

function drawFormRainbow(size, color, glow, dark) {
    const grad = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, size * 0.5);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, glow); grad.addColorStop(1, dark);
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 30;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? size * 0.5 : size * 0.25;
        const px = Math.cos(angle) * r, py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.fillStyle = 'hsl(' + (i / 8 * 360) + ', 100%, 60%)';
        ctx.beginPath(); ctx.arc(Math.cos(angle) * size * 0.15, Math.sin(angle) * size * 0.15, size * 0.06, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormIce(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(-size * 0.15, -size * 0.35);
    ctx.lineTo(-size * 0.4, -size * 0.4);
    ctx.lineTo(-size * 0.3, 0);
    ctx.lineTo(-size * 0.45, size * 0.3);
    ctx.lineTo(-size * 0.15, size * 0.35);
    ctx.lineTo(0, size * 0.25);
    ctx.lineTo(size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.45, size * 0.3);
    ctx.lineTo(size * 0.3, 0);
    ctx.lineTo(size * 0.4, -size * 0.4);
    ctx.lineTo(size * 0.15, -size * 0.35);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4); ctx.lineTo(0, size * 0.2);
    ctx.moveTo(-size * 0.25, 0); ctx.lineTo(size * 0.25, 0);
    ctx.stroke();
    drawEngineFlame(size);
}

function drawFormFire(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.4);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.2, '#ff0'); grad.addColorStop(0.5, color); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(-size * 0.1, -size * 0.3);
    ctx.lineTo(-size * 0.4, -size * 0.45);
    ctx.lineTo(-size * 0.3, -size * 0.1);
    ctx.lineTo(-size * 0.45, size * 0.3);
    ctx.lineTo(-size * 0.15, size * 0.35);
    ctx.lineTo(0, size * 0.45);
    ctx.lineTo(size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.45, size * 0.3);
    ctx.lineTo(size * 0.3, -size * 0.1);
    ctx.lineTo(size * 0.4, -size * 0.45);
    ctx.lineTo(size * 0.1, -size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    const coreGrad = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.2);
    coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.5, '#ff0'); coreGrad.addColorStop(1, '#f00');
    ctx.fillStyle = coreGrad; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormLaser(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.4);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.lineTo(-size * 0.15, -size * 0.3);
    ctx.lineTo(-size * 0.2, size * 0.3);
    ctx.lineTo(-size * 0.1, size * 0.4);
    ctx.lineTo(size * 0.1, size * 0.4);
    ctx.lineTo(size * 0.2, size * 0.3);
    ctx.lineTo(size * 0.15, -size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.shadowColor = glow; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(0, -size * 0.65); ctx.lineTo(0, -size * 0.85); ctx.stroke();
    ctx.shadowBlur = 0;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
    coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.5, color); coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = dark; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.15); ctx.lineTo(-size * 0.4, 0); ctx.lineTo(-size * 0.2, size * 0.15);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.15); ctx.lineTo(size * 0.4, 0); ctx.lineTo(size * 0.2, size * 0.15);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    drawEngineFlame(size);
}

function drawFormMagnet(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(-size * 0.45, -size * 0.1);
    ctx.lineTo(-size * 0.4, size * 0.3);
    ctx.lineTo(-size * 0.15, size * 0.35);
    ctx.lineTo(0, size * 0.25);
    ctx.lineTo(size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.4, size * 0.3);
    ctx.lineTo(size * 0.45, -size * 0.1);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.25, 0, Math.PI, false); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, size * 0.25, Math.PI, Math.PI * 2, false); ctx.stroke();
    drawEngineFlame(size);
}

function drawFormTwin(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.4);
    grad.addColorStop(0, color); grad.addColorStop(0.5, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(-size * 0.15, -size * 0.3);
    ctx.lineTo(-size * 0.5, -size * 0.15);
    ctx.lineTo(-size * 0.4, size * 0.3);
    ctx.lineTo(-size * 0.1, size * 0.35);
    ctx.lineTo(0, size * 0.25);
    ctx.lineTo(size * 0.1, size * 0.35);
    ctx.lineTo(size * 0.4, size * 0.3);
    ctx.lineTo(size * 0.5, -size * 0.15);
    ctx.lineTo(size * 0.15, -size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(-size * 0.2, -size * 0.55, size * 0.08, size * 0.5);
    ctx.fillRect(size * 0.12, -size * 0.55, size * 0.08, size * 0.5);
    drawEngineFlame(size);
}

function drawFormGhost(size, color, glow, dark) {
    const grad = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, size * 0.5);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, hexToRgba('#000000', 0));
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 30;
    ctx.globalAlpha = 0.6 + Math.sin(frame * 0.1) * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(-size * 0.4, 0);
    ctx.lineTo(-size * 0.3, size * 0.2);
    ctx.lineTo(-size * 0.35, size * 0.4);
    ctx.lineTo(-size * 0.15, size * 0.3);
    ctx.lineTo(0, size * 0.45);
    ctx.lineTo(size * 0.15, size * 0.3);
    ctx.lineTo(size * 0.35, size * 0.4);
    ctx.lineTo(size * 0.3, size * 0.2);
    ctx.lineTo(size * 0.4, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(-size * 0.08, -size * 0.1, size * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(size * 0.08, -size * 0.1, size * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormTitan(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.5);
    grad.addColorStop(0, '#ffee88'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, dark); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(-size * 0.2, -size * 0.4);
    ctx.lineTo(-size * 0.55, -size * 0.3);
    ctx.lineTo(-size * 0.5, 0);
    ctx.lineTo(-size * 0.6, size * 0.35);
    ctx.lineTo(-size * 0.2, size * 0.4);
    ctx.lineTo(0, size * 0.5);
    ctx.lineTo(size * 0.2, size * 0.4);
    ctx.lineTo(size * 0.6, size * 0.35);
    ctx.lineTo(size * 0.5, 0);
    ctx.lineTo(size * 0.55, -size * 0.3);
    ctx.lineTo(size * 0.2, -size * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(-size * 0.25, -size * 0.25, size * 0.5, size * 0.5);
    ctx.fillStyle = '#333';
    ctx.fillRect(-size * 0.25, -size * 0.65, size * 0.1, size * 0.4);
    ctx.fillRect(-size * 0.05, -size * 0.75, size * 0.1, size * 0.5);
    ctx.fillRect(size * 0.15, -size * 0.65, size * 0.1, size * 0.4);
    const coreGrad = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.2);
    coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.5, '#ff0'); coreGrad.addColorStop(1, '#f80');
    ctx.fillStyle = coreGrad; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormDeity(size, color, glow, dark) {
    const grad = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, size * 0.6);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, color); grad.addColorStop(0.7, glow); grad.addColorStop(1, dark);
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 50;
    for (let r = 0; r < 3; r++) {
        ctx.globalAlpha = 0.3 - r * 0.08;
        ctx.strokeStyle = glow; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, size * (0.6 + r * 0.15), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const r = size * 0.55;
        const px = Math.cos(angle) * r, py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        const r2 = size * 0.2;
        const a2 = angle + Math.PI / 6;
        ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 40;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawEngineFlame(size);
}

function drawFormCrystal(size, color, glow, dark) {
    const grad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.5);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#ccffff'); grad.addColorStop(0.6, color); grad.addColorStop(1, dark);
    ctx.fillStyle = grad; ctx.shadowColor = glow; ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(-size * 0.35, -size * 0.15);
    ctx.lineTo(-size * 0.5, size * 0.3);
    ctx.lineTo(0, size * 0.5);
    ctx.lineTo(size * 0.5, size * 0.3);
    ctx.lineTo(size * 0.35, -size * 0.15);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7); ctx.lineTo(0, size * 0.5);
    ctx.moveTo(-size * 0.35, -size * 0.15); ctx.lineTo(size * 0.5, size * 0.3);
    ctx.moveTo(size * 0.35, -size * 0.15); ctx.lineTo(-size * 0.5, size * 0.3);
    ctx.stroke();
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
    coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.5, '#88ffff'); coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 35;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 6; i++) {
        const a = frame * 0.05 + i * Math.PI / 3;
        const r = size * 0.35;
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }
    drawEngineFlame(size);
}

function drawShipByKey(key, size, color, glow, dark) {
    if (!SKINS[key]) key = 'standard';
    if (key === 'standard') drawFormStandard(size, color, glow, dark);
    else if (key === 'healer') drawFormHealer(size, color, glow, dark);
    else if (key === 'rapid') drawFormRapid(size, color, glow, dark);
    else if (key === 'shield') drawFormShield(size, color, glow, dark);
    else if (key === 'berserk') drawFormBerserk(size, color, glow, dark);
    else if (key === 'sniper') drawFormSniper(size, color, glow, dark);
    else if (key === 'bomber') drawFormBomber(size, color, glow, dark);
    else if (key === 'rainbow') drawFormRainbow(size, color, glow, dark);
    else if (key === 'ice') drawFormIce(size, color, glow, dark);
    else if (key === 'fire') drawFormFire(size, color, glow, dark);
    else if (key === 'laser') drawFormLaser(size, color, glow, dark);
    else if (key === 'magnet') drawFormMagnet(size, color, glow, dark);
    else if (key === 'twin') drawFormTwin(size, color, glow, dark);
    else if (key === 'ghost') drawFormGhost(size, color, glow, dark);
    else if (key === 'titan') drawFormTitan(size, color, glow, dark);
    else if (key === 'deity') drawFormDeity(size, color, glow, dark);
    else if (key === 'crystal') drawFormCrystal(size, color, glow, dark);
    else drawFormStandard(size, color, glow, dark);
}

function drawPlayerShip(x, y, w, h) {
    const skin = SKINS[selectedSkin] || SKINS.standard;
    let color = skin.color;
    if (selectedSkin === 'rainbow') color = 'hsl(' + (frame * 3 % 360) + ', 100%, 60%)';
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    if (ghostActive) ctx.globalAlpha = 0.4;
    const size = Math.max(w, h) * 0.9;
    ctx.save();
    ctx.globalAlpha = 0.4; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, size * 0.6, size * 0.5, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.3;
    const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.2);
    aura.addColorStop(0, skin.glow);
    aura.addColorStop(1, hexToRgba(skin.glow, 0));
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, size * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawShipByKey(selectedSkin, size, color, skin.glow, skin.dark);
    for (let i = 0; i < permanentShields; i++) {
        const r = size * (0.85 + i * 0.1);
        const pulse = 1 + Math.sin(frame * 0.1 + i) * 0.05;
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(0, 0, r * pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    if (shieldActive) {
        const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
        ctx.strokeStyle = '#aa44ff'; ctx.lineWidth = 3;
        ctx.shadowColor = '#aa44ff'; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(0, 0, size * 0.7 + 12 * pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    if (activeBoosters.invincible > 0 || deityActive) {
        const pulse = 1 + Math.sin(frame * 0.15) * 0.15;
        ctx.strokeStyle = deityActive ? '#ff00ff' : '#0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = deityActive ? '#ff00ff' : '#0ff';
        ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(0, 0, size * 0.9 + 20 * pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawDrone(d) {
    const px = player.x + player.w/2 + Math.cos(d.angle) * 50;
    const py = player.y + player.h/2 + Math.sin(d.angle) * 50;
    ctx.save();
    ctx.translate(px, py);
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#0ff';
    ctx.beginPath(); ctx.arc(0, 0, d.size, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, d.size * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-2, -d.size - 5, 4, 8);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawEnemyShip(e) {
    ctx.save();
    ctx.translate(e.x + e.w/2, e.y + e.h/2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, e.h/2 - 2, e.w/2, 4, 0, 0, Math.PI * 2); ctx.fill();

    if (e.iceTimer > 0) { ctx.shadowColor = '#66ddff'; ctx.shadowBlur = 30; }
    else if (e.fireTimer > 0) { ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 30; }
    else { ctx.shadowColor = e.glow; ctx.shadowBlur = 22; }

    if (e.type === 'STANDARD') {
        const grad = ctx.createLinearGradient(0, -e.h/2, 0, e.h/2);
        grad.addColorStop(0, e.color); grad.addColorStop(0.5, e.dark); grad.addColorStop(1, '#330000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, e.h/2); ctx.lineTo(-e.w/2, 0); ctx.lineTo(0, -e.h/2); ctx.lineTo(e.w/2, 0);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.shadowBlur = 0;
        const cg = ctx.createRadialGradient(-2, -2, 1, 0, 0, 6);
        cg.addColorStop(0, '#fff'); cg.addColorStop(0.5, '#ff8888'); cg.addColorStop(1, '#660000');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'SNIPER') {
        const grad = ctx.createLinearGradient(0, -e.h/2, 0, e.h/2);
        grad.addColorStop(0, e.color); grad.addColorStop(0.5, e.dark); grad.addColorStop(1, '#331a00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, e.h/2);
        ctx.lineTo(-e.w/2, -e.h/2 + 5);
        ctx.lineTo(-e.w/4, -e.h/2);
        ctx.lineTo(0, -e.h/2 + 4);
        ctx.lineTo(e.w/4, -e.h/2);
        ctx.lineTo(e.w/2, -e.h/2 + 5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#333';
        ctx.fillRect(-3, e.h/4, 6, e.h/2);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ff0';
        ctx.beginPath(); ctx.arc(0, -2, 2, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'TANK') {
        const grad = ctx.createLinearGradient(0, -e.h/2, 0, e.h/2);
        grad.addColorStop(0, e.color); grad.addColorStop(0.5, e.dark); grad.addColorStop(1, '#220044');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-e.w/2, -e.h/3); ctx.lineTo(-e.w/3, -e.h/2); ctx.lineTo(e.w/3, -e.h/2);
        ctx.lineTo(e.w/2, -e.h/3); ctx.lineTo(e.w/2 + 3, 0); ctx.lineTo(e.w/2, e.h/3);
        ctx.lineTo(e.w/3, e.h/2); ctx.lineTo(-e.w/3, e.h/2); ctx.lineTo(-e.w/2, e.h/3);
        ctx.lineTo(-e.w/2 - 3, 0);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.shadowBlur = 0;
        const cg = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
        cg.addColorStop(0, '#fff'); cg.addColorStop(0.5, '#cc66ff'); cg.addColorStop(1, '#440088');
        ctx.fillStyle = cg; ctx.shadowColor = e.glow; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (e.type === 'FAST') {
        const grad = ctx.createLinearGradient(0, -e.h/2, 0, e.h/2);
        grad.addColorStop(0, e.color); grad.addColorStop(0.5, e.dark); grad.addColorStop(1, '#002200');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, e.h/2); ctx.lineTo(-e.w/3, 0); ctx.lineTo(-e.w/3, -e.h/2);
        ctx.lineTo(0, -e.h/3); ctx.lineTo(e.w/3, -e.h/2); ctx.lineTo(e.w/3, 0);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0'; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-3, -6); ctx.lineTo(0, -2); ctx.lineTo(-3, 2); ctx.lineTo(0, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    if (e.iceTimer > 0) {
        ctx.fillStyle = 'rgba(102, 221, 255, 0.3)';
        ctx.beginPath(); ctx.arc(0, 0, e.w * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    if (e.fireTimer > 0) {
        ctx.fillStyle = 'rgba(255, 68, 0, 0.3)';
        ctx.beginPath(); ctx.arc(0, 0, e.w * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function drawEngineFlame(size) {
    const flameSize = size * 0.35 + Math.random() * size * 0.15;
    const grad = ctx.createLinearGradient(0, size * 0.3, 0, size * 0.3 + flameSize);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.2, '#ff0');
    grad.addColorStop(0.5, '#ff6600'); grad.addColorStop(1, hexToRgba('#ff0000', 0));
    ctx.fillStyle = grad;
    ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, size * 0.3);
    ctx.lineTo(0, size * 0.3 + flameSize * 1.3);
    ctx.lineTo(size * 0.05, size * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
}
// ============================================================
// ЧАСТЬ 6: 12 боссов (рисование) + drawGame
// ============================================================

function drawBoss(b) {
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    const size = b.w;
    const pulse = 1 + Math.sin(frame * 0.05) * 0.05;
    ctx.scale(pulse, pulse);
    ctx.shadowColor = b.glow;
    ctx.shadowBlur = 40;

    if (b.type === 'giant') {
        const grad = ctx.createRadialGradient(0, 0, size*0.1, 0, 0, size*0.6);
        grad.addColorStop(0, b.color); grad.addColorStop(0.7, '#660000'); grad.addColorStop(1, '#220000');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(-size*0.15, -size*0.1, size*0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.15, -size*0.1, size*0.08, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, size*0.15, size*0.2, 0.2, Math.PI - 0.2); ctx.stroke();
    } else if (b.type === 'dragon') {
        const grad = ctx.createLinearGradient(0, -size*0.5, 0, size*0.5);
        grad.addColorStop(0, b.color); grad.addColorStop(0.5, '#cc4400'); grad.addColorStop(1, '#331100');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-size*0.6, -size*0.2); ctx.lineTo(-size*0.3, -size*0.1);
        ctx.lineTo(-size*0.5, size*0.3); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size*0.6, -size*0.2); ctx.lineTo(size*0.3, -size*0.1);
        ctx.lineTo(size*0.5, size*0.3); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 0, size*0.35, size*0.4, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(-size*0.12, -size*0.15, size*0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.12, -size*0.15, size*0.05, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (b.type === 'phoenix') {
        const grad = ctx.createRadialGradient(0, 0, size*0.1, 0, 0, size*0.6);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, b.glow); grad.addColorStop(0.7, b.color); grad.addColorStop(1, '#330000');
        ctx.fillStyle = grad;
        for (let side = -1; side <= 1; side += 2) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(side*size*0.7, -size*0.3);
            ctx.lineTo(side*size*0.5, size*0.1);
            ctx.lineTo(side*size*0.3, size*0.3);
            ctx.closePath(); ctx.fill();
        }
        ctx.beginPath(); ctx.ellipse(0, 0, size*0.2, size*0.35, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = 0.6 - i * 0.1;
            ctx.fillStyle = b.glow;
            ctx.beginPath(); ctx.arc(0, size*0.4 + i*8, size*0.15 - i*2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else if (b.type === 'robot') {
        const grad = ctx.createLinearGradient(0, -size*0.5, 0, size*0.5);
        grad.addColorStop(0, b.glow); grad.addColorStop(0.5, b.color); grad.addColorStop(1, '#003322');
        ctx.fillStyle = grad;
        ctx.fillRect(-size*0.3, -size*0.5, size*0.6, size*0.4);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(-size*0.3, -size*0.5, size*0.6, size*0.4);
        ctx.fillRect(-size*0.35, -size*0.1, size*0.7, size*0.5);
        ctx.strokeRect(-size*0.35, -size*0.1, size*0.7, size*0.5);
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(-size*0.12, -size*0.3, size*0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.12, -size*0.3, size*0.06, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (b.type === 'death') {
        ctx.fillStyle = b.color; ctx.shadowColor = b.glow; ctx.shadowBlur = 40;
        ctx.beginPath(); ctx.arc(0, -size*0.1, size*0.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-size*0.12, -size*0.15, size*0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.12, -size*0.15, size*0.08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(i * size*0.07 - size*0.03, size*0.05, size*0.05, size*0.08);
        }
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(size*0.35, -size*0.5); ctx.lineTo(size*0.35, size*0.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(size*0.15, -size*0.5, size*0.25, 0, Math.PI*1.5); ctx.stroke();
    } else if (b.type === 'scorpion') {
        const grad = ctx.createLinearGradient(0, -size*0.5, 0, size*0.5);
        grad.addColorStop(0, b.glow); grad.addColorStop(0.5, b.color); grad.addColorStop(1, '#113300');
        ctx.fillStyle = grad;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath(); ctx.ellipse(0, -size*0.2 + i * size*0.15, size*0.2 - i*size*0.02, size*0.1, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(0, size*0.3); ctx.lineTo(size*0.3, size*0.5); ctx.lineTo(size*0.4, size*0.2);
        ctx.strokeStyle = b.color; ctx.lineWidth = size*0.1; ctx.stroke();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(size*0.4, size*0.15, size*0.08, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(-size*0.3, -size*0.3, size*0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.3, -size*0.3, size*0.12, 0, Math.PI * 2); ctx.fill();
    } else if (b.type === 'bat') {
        ctx.fillStyle = b.color; ctx.shadowColor = b.glow; ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-size*0.7, -size*0.3);
        ctx.lineTo(-size*0.5, size*0.2); ctx.lineTo(-size*0.2, size*0.1);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(size*0.7, -size*0.3);
        ctx.lineTo(size*0.5, size*0.2); ctx.lineTo(size*0.2, size*0.1);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 0, size*0.15, size*0.25, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size*0.1, -size*0.2); ctx.lineTo(-size*0.15, -size*0.4); ctx.lineTo(0, -size*0.25);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size*0.1, -size*0.2); ctx.lineTo(size*0.15, -size*0.4); ctx.lineTo(0, -size*0.25);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f00'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(-size*0.06, -size*0.05, size*0.04, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.06, -size*0.05, size*0.04, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (b.type === 'octopus') {
        const grad = ctx.createRadialGradient(0, 0, size*0.05, 0, 0, size*0.5);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.4, b.glow); grad.addColorStop(1, b.color);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, -size*0.1, size*0.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const wave = Math.sin(frame * 0.1 + i) * size * 0.1;
            ctx.beginPath();
            ctx.moveTo(0, size*0.2);
            ctx.quadraticCurveTo(
                Math.cos(a) * size*0.3, size*0.4 + wave,
                Math.cos(a) * size*0.4, size*0.55 + wave
            );
            ctx.strokeStyle = b.color; ctx.lineWidth = size*0.06; ctx.stroke();
        }
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.ellipse(-size*0.15, -size*0.15, size*0.08, size*0.05, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size*0.15, -size*0.15, size*0.08, size*0.05, 0, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (b.type === 'shark') {
        const grad = ctx.createLinearGradient(0, -size*0.5, 0, size*0.5);
        grad.addColorStop(0, '#888'); grad.addColorStop(0.5, b.color); grad.addColorStop(1, '#003366');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -size*0.5);
        ctx.lineTo(-size*0.3, 0);
        ctx.lineTo(-size*0.5, size*0.2);
        ctx.lineTo(-size*0.2, size*0.3);
        ctx.lineTo(size*0.2, size*0.3);
        ctx.lineTo(size*0.5, size*0.2);
        ctx.lineTo(size*0.3, 0);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -size*0.5); ctx.lineTo(0, -size*0.75); ctx.lineTo(size*0.1, -size*0.5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f00'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(-size*0.15, -size*0.1, size*0.05, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.15, -size*0.1, size*0.05, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size*0.08 - size*0.02, size*0.2);
            ctx.lineTo(i * size*0.08, size*0.3);
            ctx.lineTo(i * size*0.08 + size*0.02, size*0.2);
            ctx.closePath(); ctx.fill();
        }
    } else if (b.type === 'wolf') {
        ctx.fillStyle = b.color; ctx.shadowColor = b.glow; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(0, -size*0.15, size*0.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size*0.2, -size*0.35); ctx.lineTo(-size*0.15, -size*0.6); ctx.lineTo(-size*0.05, -size*0.35);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size*0.2, -size*0.35); ctx.lineTo(size*0.15, -size*0.6); ctx.lineTo(size*0.05, -size*0.35);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(-size*0.1, -size*0.15, size*0.05, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.1, -size*0.15, size*0.05, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.ellipse(0, size*0.1, size*0.12, size*0.08, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-size*0.05, size*0.15); ctx.lineTo(-size*0.02, size*0.3); ctx.lineTo(0, size*0.15);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size*0.05, size*0.15); ctx.lineTo(size*0.02, size*0.3); ctx.lineTo(0, size*0.15);
        ctx.closePath(); ctx.fill();
    } else if (b.type === 'king') {
        const grad = ctx.createLinearGradient(0, -size*0.5, 0, size*0.5);
        grad.addColorStop(0, b.glow); grad.addColorStop(0.5, b.color); grad.addColorStop(1, '#664400');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, size*0.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(-size*0.3, -size*0.3);
        ctx.lineTo(-size*0.35, -size*0.55);
        ctx.lineTo(-size*0.2, -size*0.4);
        ctx.lineTo(-size*0.05, -size*0.6);
        ctx.lineTo(0, -size*0.4);
        ctx.lineTo(size*0.05, -size*0.6);
        ctx.lineTo(size*0.2, -size*0.4);
        ctx.lineTo(size*0.35, -size*0.55);
        ctx.lineTo(size*0.3, -size*0.3);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f00'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(-size*0.12, 0, size*0.06, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.12, 0, size*0.06, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (b.type === 'final') {
        for (let r = 0; r < 4; r++) {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size*(0.5 + r*0.15));
            grad.addColorStop(0, hexToRgba(b.glow, 0.3 - r*0.05));
            grad.addColorStop(1, hexToRgba(b.color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, 0, size*(0.5 + r*0.15), 0, Math.PI * 2); ctx.fill();
        }
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size*0.4);
        coreGrad.addColorStop(0, '#fff'); coreGrad.addColorStop(0.4, b.glow); coreGrad.addColorStop(1, b.color);
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(0, 0, size*0.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = b.glow; ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + frame * 0.02;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * size*0.4, Math.sin(a) * size*0.4);
            ctx.lineTo(Math.cos(a) * size*0.7, Math.sin(a) * size*0.7);
            ctx.stroke();
        }
        ctx.fillStyle = '#000'; ctx.shadowColor = '#000'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(-size*0.12, -size*0.05, size*0.07, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(size*0.12, -size*0.05, size*0.07, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();

    // HP-бар босса
    const barW = 500, barH = 25;
    const barX = 50, barY = 20;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#f00'; ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barW, barH);
    const hpPercent = b.hp / b.maxHp;
    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    hpGrad.addColorStop(0, '#f00'); hpGrad.addColorStop(1, '#ff8800');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpPercent, barH - 4);

    ctx.fillStyle = '#fff';
    ctx.shadowColor = b.glow; ctx.shadowBlur = 15;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('👹 ' + BOSS_TYPES[b.type].name + ' (Фаза ' + b.phase + ')', canvas.width/2, barY + barH + 22);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

function drawBossWarning() {
    if (!bossWarningActive || !activeBoss) return;
    const b = activeBoss;
    const alpha = 0.5 + Math.sin(frame * 0.5) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 30;
    ctx.fillText('⚠', b.x + b.w/2, b.y - 20);
    ctx.restore();
}

function drawBossBullets() {
    for (let bb of bossBullets) {
        ctx.shadowColor = bb.color || '#f0f';
        ctx.shadowBlur = 25;
        ctx.fillStyle = bb.color || '#f0f';
        // Лазерные столбы — просто прямоугольник
        if (bb.laserPillar) {
            ctx.globalAlpha = 0.7;
            ctx.fillRect(bb.x, bb.y, bb.w, bb.h);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff';
            ctx.fillRect(bb.x + 2, bb.y, bb.w - 4, bb.h);
        } else {
            ctx.fillRect(bb.x, bb.y, bb.w, bb.h);
            ctx.fillStyle = '#fff';
            ctx.fillRect(bb.x + 2, bb.y + 2, bb.w - 4, bb.h - 4);
        }
        ctx.shadowBlur = 0;
    }
}

function drawBoosterDrop(bd) {
    const booster = BOOSTERS[bd.type];
    const pulse = 1 + Math.sin(frame * 0.2) * 0.15;
    ctx.save();
    ctx.translate(bd.x + bd.w/2, bd.y + bd.h/2);
    ctx.shadowColor = booster.color; ctx.shadowBlur = 25;
    ctx.fillStyle = hexToRgba(booster.color, 0.4);
    ctx.beginPath(); ctx.arc(0, 0, 18 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = booster.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 15;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(booster.icon, 0, 2);
    ctx.textBaseline = 'alphabetic';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.restore();
}

function drawBoosterButton() {
    const hasBoosters = boosterInventory.length > 0;
    const isReady = boosterCooldown <= 0;
    const canUse = hasBoosters && isReady;
    let btnColor = '#444';
    if (canUse) btnColor = '#ff0';
    else if (hasBoosters) btnColor = '#666';
    ctx.shadowColor = canUse ? '#ff0' : 'transparent';
    ctx.shadowBlur = canUse ? 25 : 0;
    ctx.fillStyle = canUse ? 'rgba(255,255,0,0.2)' : 'rgba(80,80,80,0.2)';
    ctx.fillRect(boosterBtn.x, boosterBtn.y, boosterBtn.w, boosterBtn.h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = btnColor; ctx.lineWidth = 2;
    ctx.strokeRect(boosterBtn.x, boosterBtn.y, boosterBtn.w, boosterBtn.h);
    ctx.fillStyle = btnColor;
    ctx.shadowColor = canUse ? '#ff0' : 'transparent';
    ctx.shadowBlur = canUse ? 10 : 0;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    let text = '🎁 БУСТЕР';
    if (boosterInventory.length > 0) text += ' (' + boosterInventory.length + ')';
    if (!isReady) text = '⏱ ' + Math.ceil(boosterCooldown / 60) + 'с';
    ctx.fillText(text, boosterBtn.x + boosterBtn.w/2, boosterBtn.y + 32);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

function drawGame() {
    const shakeOffset = screenShake.active ? {
        x: (Math.random() - 0.5) * screenShake.intensity,
        y: (Math.random() - 0.5) * screenShake.intensity
    } : { x: 0, y: 0 };

    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    ctx.strokeStyle = 'rgba(0,255,255,0.06)';
    ctx.lineWidth = 1;
    if (!isBossLevel) {
        for (let i = 0; i < LANES; i++) {
            const y = getLaneY(i) + 17;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0,255,255,0.03)';
        for (let i = 1; i < MAX_PER_LANE; i++) {
            const x = i * (canvas.width / MAX_PER_LANE);
            ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, 430); ctx.stroke();
        }
    }

    for (let d of drones) drawDrone(d);
    drawPlayerShip(player.x, player.y, player.w, player.h);

    for (let b of bullets) {
        if (b.laser) {
            const laserGrad = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
            laserGrad.addColorStop(0, 'rgba(204,68,255,0)');
            laserGrad.addColorStop(0.3, '#cc44ff');
            laserGrad.addColorStop(0.5, '#ffffff');
            laserGrad.addColorStop(0.7, '#cc44ff');
            laserGrad.addColorStop(1, 'rgba(204,68,255,0)');
            ctx.fillStyle = laserGrad;
            ctx.fillRect(b.x - 4, b.y, b.w + 8, b.h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(b.x + b.w/2 - 1, b.y, 2, b.h);
        } else if (b.crystal) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 35;
            ctx.fillStyle = '#88ffff';
            ctx.beginPath();
            ctx.moveTo(b.x + b.w/2, b.y);
            ctx.lineTo(b.x + b.w, b.y + b.h/2);
            ctx.lineTo(b.x + b.w/2, b.y + b.h);
            ctx.lineTo(b.x, b.y + b.h/2);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            ctx.shadowColor = b.color || '#ff0';
            ctx.shadowBlur = b.crit ? 40 : 30;
            ctx.fillStyle = b.color || '#ff0';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fff';
            ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
            if (b.crit) {
                ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
                ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
            }
            ctx.shadowBlur = 0;
        }
    }

    for (let e of enemies) {
        drawEnemyShip(e);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(e.x, e.y - 8, e.w, 5);
        ctx.fillStyle = '#0f0';
        ctx.shadowColor = '#0f0'; ctx.shadowBlur = 5;
        ctx.fillRect(e.x, e.y - 8, e.w * (e.hp / e.maxHp), 5);
        ctx.shadowBlur = 0;
    }

    if (activeBoss) drawBoss(activeBoss);

    for (let eb of enemyBullets) {
        ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(eb.x, eb.y, eb.w, eb.h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(eb.x + 2, eb.y + 2, eb.w - 4, eb.h - 4);
        ctx.shadowBlur = 0;
    }

    drawBossBullets();

    for (let bd of boosterDrops) drawBoosterDrop(bd);

    for (let p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    for (let ex of explosions) {
        const alpha = ex.life / ex.maxLife;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ex.color; ctx.lineWidth = 4;
        ctx.shadowColor = ex.color; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.radius * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    for (let cp of coinPopups) {
        const alpha = cp.life / cp.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 12;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cp.text, cp.x, cp.y);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.textAlign = 'left';

    for (let gp of gemPopups) {
        const alpha = gp.life / gp.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#88ffff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(gp.text, gp.x, gp.y);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.textAlign = 'left';

    // UI
    ctx.font = '24px monospace';
    let livesText = '';
    for (let i = 0; i < player.lives; i++) livesText += '❤️';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#f00'; ctx.shadowBlur = 12;
    ctx.fillText(livesText, 10, 35);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 12;
    ctx.font = '18px monospace';
    ctx.fillText('Счёт: ' + score, 10, 60);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 12;
    ctx.fillText('🪙 ' + coins, 10, 82);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#88ffff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 12;
    ctx.fillText('💎 ' + gems, 10, 102);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f0f'; ctx.shadowColor = '#f0f'; ctx.shadowBlur = 12;
    ctx.font = '14px monospace';
    if (isBossLevel) {
        ctx.fillText('👹 БОСС | Ур.' + currentLevel, 10, 122);
    } else {
        ctx.fillText('Волна ' + waveNumber + '/' + WAVES_PER_LEVEL + ' | Ур.' + currentLevel, 10, 122);
    }
    ctx.shadowBlur = 0;
    const loc = LOCATIONS[currentLocation - 1];
    ctx.fillStyle = loc.accent;
    ctx.shadowColor = loc.accent; ctx.shadowBlur = 12;
    ctx.font = '12px monospace';
    ctx.fillText('📍 ' + loc.name, 10, 140);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('🏆 ' + highScore, canvas.width - 80, 60);
    ctx.textAlign = 'left';

    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(0,255,255,0.15)';
    ctx.fillRect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
    ctx.strokeRect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h);
    ctx.fillStyle = '#0ff';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
    ctx.fillRect(pauseBtn.x + 15, pauseBtn.y + 12, 6, 26);
    ctx.fillRect(pauseBtn.x + 29, pauseBtn.y + 12, 6, 26);
    ctx.shadowBlur = 0;

    if (!isBossLevel) drawBoosterButton();
    if (isBossLevel) drawBossWarning();

    ctx.restore();

    // Экранная вспышка (поверх всего, без сдвига)
    if (screenFlash.active) {
        const alpha = screenFlash.alpha * (screenFlash.duration / screenFlash.maxDuration);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = screenFlash.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}
// ============================================================
// ЧАСТЬ 7: Экраны UI
// ============================================================

function drawThemeBackground(theme, accent, bg) {
    ctx.save();
    for (let t of themeObjects) {
        const alpha = 0.2 + Math.sin(t.phase) * 0.1;
        if (theme === 'earth') {
            const grad = ctx.createRadialGradient(t.x - t.size*0.3, t.y - t.size*0.3, 0, t.x, t.y, t.size);
            grad.addColorStop(0, '#4af'); grad.addColorStop(0.5, '#06a'); grad.addColorStop(1, '#023');
            ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = alpha * 0.3; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size * 0.65, 0, Math.PI * 2); ctx.stroke();
        } else if (theme === 'nebula' || theme === 'crab') {
            for (let layer = 0; layer < 3; layer++) {
                const size = t.size * (0.6 + layer * 0.3);
                const layerAlpha = alpha * (0.3 - layer * 0.08);
                const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size);
                grad.addColorStop(0, hexToRgba(accent, layerAlpha));
                grad.addColorStop(0.7, hexToRgba(accent, layerAlpha * 0.3));
                grad.addColorStop(1, hexToRgba(accent, 0));
                ctx.globalAlpha = 1; ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(t.x, t.y, size, 0, Math.PI * 2); ctx.fill();
            }
        } else if (theme === 'blackhole' || theme === 'dark') {
            const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
            grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.4, 'rgba(0,0,0,1)');
            grad.addColorStop(0.5, hexToRgba(accent, alpha * 2));
            grad.addColorStop(0.7, hexToRgba(accent, alpha));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = 1; ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2); ctx.fill();
        } else if (theme === 'quasar' || theme === 'sirius' || theme === 'betelgeuse') {
            ctx.globalAlpha = alpha * 0.7; ctx.fillStyle = accent;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size * 0.15, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = accent; ctx.lineWidth = 3;
            ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rot);
            for (let i = 0; i < 12; i++) {
                ctx.rotate(Math.PI / 6);
                const len = t.size * (0.4 + Math.sin(t.phase + i) * 0.15);
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
            }
            ctx.restore();
        } else {
            const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
            grad.addColorStop(0, hexToRgba(accent, alpha * 0.5));
            grad.addColorStop(1, hexToRgba(accent, 0));
            ctx.globalAlpha = 1; ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
}

function drawShop() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff0'; ctx.font = 'bold 28px monospace';
    ctx.fillText('🛒 МАГАЗИН', canvas.width/2, 45);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 15;
    ctx.font = '16px monospace';
    ctx.fillText('🪙 ' + coins + '   💎 ' + gems, canvas.width/2, 75);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888'; ctx.font = '12px monospace';
    ctx.fillText('Смотри рекламу — получай награды', canvas.width/2, 100);

    for (let btn of shopButtons) {
        if (btn.action) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,255,255,0.15)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = '#0ff';
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = '18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 30);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            continue;
        }
        if (!btn.shopKey) continue;
        const item = SHOP_ITEMS[btn.shopKey];
        const ready = isShopItemReady(btn.shopKey);
        const remaining = getShopCooldownRemaining(btn.shopKey);
        const isGems = item.reward === 'gems';

        ctx.shadowColor = ready ? (isGems ? '#0ff' : '#ff0') : 'transparent';
        ctx.shadowBlur = ready ? 20 : 0;
        ctx.fillStyle = ready ? (isGems ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,0,0.15)') : 'rgba(50,50,50,0.3)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ready ? (isGems ? '#0ff' : '#ff0') : '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = ready ? '#fff' : '#666';
        ctx.fillText(item.icon, btn.x + 10, btn.y + 40);

        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = ready ? (isGems ? '#0ff' : '#ff0') : '#666';
        ctx.fillText(item.name, btn.x + 50, btn.y + 30);

        ctx.font = '11px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Реклама x' + item.ads, btn.x + 50, btn.y + 50);

        if (!ready) {
            ctx.fillStyle = '#888';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⏱ ' + formatCooldown(remaining), btn.x + btn.w/2, btn.y + 80);
        } else {
            ctx.fillStyle = '#0f0';
            ctx.shadowColor = '#0f0'; ctx.shadowBlur = 10;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('▶ ПОЛУЧИТЬ', btn.x + btn.w/2, btn.y + 80);
            ctx.shadowBlur = 0;
        }
        ctx.fillStyle = '#666';
        ctx.font = '9px monospace';
        ctx.fillText('КД: ' + formatCooldown(item.cooldown * 1000), btn.x + btn.w/2, btn.y + 105);
        ctx.textAlign = 'left';
    }
}

function drawUpgrades() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff0'; ctx.font = 'bold 32px monospace';
    ctx.fillText('⚡ УЛУЧШЕНИЯ', canvas.width/2, 50);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 15;
    ctx.font = 'bold 22px monospace';
    ctx.fillText('Очки: ' + upgradePoints, canvas.width/2, 85);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888'; ctx.font = '12px monospace';
    ctx.fillText('+1 очко за каждые 15 уровней', canvas.width/2, 105);

    for (let btn of upgradeButtons) {
        if (btn.action) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,255,255,0.15)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = '18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 30);
            ctx.shadowBlur = 0; ctx.textAlign = 'left';
            continue;
        }
        if (!btn.upgradeKey) continue;
        const info = UPGRADE_INFO[btn.upgradeKey];
        const lvl = upgrades[btn.upgradeKey];
        const maxed = lvl >= UPGRADE_MAX;
        const canBuy = upgradePoints > 0 && !maxed;

        ctx.shadowColor = canBuy ? '#ff0' : 'transparent';
        ctx.shadowBlur = canBuy ? 20 : 0;
        ctx.fillStyle = canBuy ? 'rgba(255,255,0,0.15)' : 'rgba(50,50,50,0.3)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = canBuy ? '#ff0' : (maxed ? '#0f0' : '#555');
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = canBuy ? '#ff0' : (maxed ? '#0f0' : '#888');
        ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left';
        ctx.fillText(info.name, btn.x + 10, btn.y + 25);
        ctx.fillStyle = '#aaa'; ctx.font = '11px monospace';
        ctx.fillText(info.desc, btn.x + 10, btn.y + 45);
        for (let i = 0; i < UPGRADE_MAX; i++) {
            ctx.fillStyle = i < lvl ? '#0f0' : '#333';
            ctx.fillRect(btn.x + 10 + i * 25, btn.y + 60, 20, 15);
        }
        ctx.fillStyle = maxed ? '#0f0' : '#ff0';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(maxed ? 'MAX' : (lvl + '/' + UPGRADE_MAX), btn.x + 150, btn.y + 72);
        if (canBuy) {
            ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right';
            ctx.fillText('НАЖМИ!', btn.x + btn.w - 10, btn.y + 72);
            ctx.shadowBlur = 0; ctx.textAlign = 'left';
        }
    }
}

function drawEquipment() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0f0'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#0f0'; ctx.font = 'bold 30px monospace';
    ctx.fillText('🎁 ОБОРУДОВАНИЕ', canvas.width/2, 50);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0'; ctx.shadowColor = '#ff0'; ctx.shadowBlur = 15;
    ctx.font = 'bold 22px monospace';
    ctx.fillText('🪙 ' + coins, canvas.width/2, 85);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888'; ctx.font = '12px monospace';
    ctx.fillText('Максимум 5 уровня', canvas.width/2, 105);

    for (let btn of equipmentButtons) {
        if (btn.action) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,255,255,0.15)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = '18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 30);
            ctx.shadowBlur = 0; ctx.textAlign = 'left';
            continue;
        }
        if (!btn.equipKey) continue;
        const info = EQUIPMENT_INFO[btn.equipKey];
        const lvl = equipment[btn.equipKey];
        const maxed = lvl >= EQUIPMENT_MAX;
        const nextPrice = info.price * (lvl + 1);
        const canBuy = !maxed && coins >= nextPrice;

        ctx.shadowColor = canBuy ? '#0f0' : 'transparent';
        ctx.shadowBlur = canBuy ? 20 : 0;
        ctx.fillStyle = canBuy ? 'rgba(0,255,0,0.15)' : 'rgba(50,50,50,0.3)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = canBuy ? '#0f0' : (maxed ? '#ff0' : '#555');
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = canBuy ? '#0f0' : (maxed ? '#ff0' : '#888');
        ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left';
        ctx.fillText(info.name, btn.x + 10, btn.y + 25);
        ctx.fillStyle = '#aaa'; ctx.font = '11px monospace';
        ctx.fillText(info.desc, btn.x + 10, btn.y + 45);
        for (let i = 0; i < EQUIPMENT_MAX; i++) {
            ctx.fillStyle = i < lvl ? '#0f0' : '#333';
            ctx.fillRect(btn.x + 10 + i * 25, btn.y + 60, 20, 15);
        }
        if (maxed) {
            ctx.fillStyle = '#ff0'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right';
            ctx.fillText('MAX', btn.x + btn.w - 10, btn.y + 72);
        } else {
            ctx.fillStyle = canBuy ? '#0f0' : '#888';
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right';
            ctx.fillText('🪙 ' + nextPrice, btn.x + btn.w - 10, btn.y + 72);
        }
        ctx.textAlign = 'left';
    }
}

function drawLocations() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 28px monospace';
    ctx.fillText('🗺️ ЛОКАЦИИ', canvas.width/2, 50);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f0'; ctx.font = '14px monospace';
    ctx.fillText('Открыто: ' + unlockedLocations + '/' + LOCATIONS.length, canvas.width/2, 75);
    ctx.textAlign = 'left';

    const maxPages = Math.ceil(LOCATIONS.length / LOCATIONS_PER_PAGE);
    ctx.fillStyle = '#888'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Страница ' + (locationPage + 1) + ' / ' + maxPages, canvas.width/2, 95);
    ctx.textAlign = 'left';

    for (let btn of locationButtons) {
        if (btn.action) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,255,255,0.15)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = '18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 30);
            ctx.shadowBlur = 0; ctx.textAlign = 'left';
            continue;
        }
        if (!btn.index) continue;
        const loc = LOCATIONS[btn.index - 1];
        if (!loc) continue;
        const unlocked = btn.index <= unlockedLocations;

        if (unlocked) {
            const bgGrad = ctx.createRadialGradient(btn.x + btn.w/2, btn.y + btn.h/2, 5, btn.x + btn.w/2, btn.y + btn.h/2, btn.w * 0.8);
            bgGrad.addColorStop(0, loc.bg); bgGrad.addColorStop(0.5, loc.bg); bgGrad.addColorStop(1, '#000');
            ctx.fillStyle = bgGrad;
        } else {
            ctx.fillStyle = '#111';
        }
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = unlocked ? loc.accent : '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = unlocked ? loc.accent : '#555';
        ctx.shadowColor = unlocked ? loc.accent : 'transparent';
        ctx.shadowBlur = unlocked ? 12 : 0;
        ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
        ctx.fillText((unlocked ? '' : '🔒 ') + btn.index, btn.x + btn.w/2, btn.y + 28);
        ctx.shadowBlur = 0;
        ctx.font = '9px monospace';
        ctx.fillStyle = unlocked ? '#ddd' : '#555';
        ctx.fillText(loc.name, btn.x + btn.w/2, btn.y + 46);
        ctx.fillStyle = unlocked ? '#888' : '#444';
        ctx.font = '8px monospace';
        ctx.fillText('x' + loc.difficulty.toFixed(1), btn.x + btn.w/2, btn.y + 60);
        ctx.textAlign = 'left';
    }
}

function drawLevels() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 26px monospace';
    ctx.fillText('📍 ' + LOCATIONS[currentLocation - 1].name, canvas.width/2, 50);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0'; ctx.font = '14px monospace';
    ctx.fillText('Открыто: ' + maxLevelReached + '/' + LEVELS_PER_LOCATION, canvas.width/2, 75);
    ctx.textAlign = 'left';

    const maxPages = Math.ceil(LEVELS_PER_LOCATION / LEVELS_PER_PAGE);
    ctx.fillStyle = '#888'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Страница ' + (levelPage + 1) + ' / ' + maxPages, canvas.width/2, 95);
    ctx.textAlign = 'left';

    for (let btn of levelButtons) {
        if (btn.action) {
            ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(0,255,255,0.15)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
            ctx.font = '18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 30);
            ctx.shadowBlur = 0; ctx.textAlign = 'left';
            continue;
        }
        if (!btn.level) continue;
        const unlocked = btn.level <= maxLevelReached;
        const isBoss = btn.level % 10 === 0;
        ctx.fillStyle = unlocked ? (isBoss ? 'rgba(255,0,0,0.15)' : 'rgba(0,255,255,0.15)') : 'rgba(50,50,50,0.3)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = isBoss ? '#f00' : (unlocked ? '#0ff' : '#333');
        ctx.lineWidth = isBoss ? 3 : 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = unlocked ? (isBoss ? '#f00' : '#0ff') : '#555';
        ctx.shadowColor = unlocked ? (isBoss ? '#f00' : '#0ff') : 'transparent';
        ctx.shadowBlur = unlocked ? 10 : 0;
        ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
        ctx.fillText((unlocked ? (isBoss ? '👹' : '') : '🔒') + btn.level, btn.x + btn.w/2, btn.y + 38);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 55px monospace';
    ctx.fillText('ПАУЗА', canvas.width/2, 180);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
    ctx.fillText('Счёт: ' + score + ' | 🪙 ' + coins + ' | 💎 ' + gems, canvas.width/2, 215);
    ctx.textAlign = 'left';
    for (let btn of pauseButtons) {
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0,255,255,0.15)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.font = '20px monospace'; ctx.textAlign = 'center';
        ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 35);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
}

function drawMenu() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 42px monospace';
    ctx.fillText('COSMIC', canvas.width/2, 100);
    ctx.shadowColor = '#f0f'; ctx.fillStyle = '#f0f';
    ctx.fillText('BATTLES', canvas.width/2, 148);
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff0'; ctx.font = '14px monospace';
    ctx.fillText('by ZOROZONET & DEEPSEEK', canvas.width/2, 180);
    ctx.shadowColor = '#ff0'; ctx.fillStyle = '#ff0';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('🪙 ' + coins + '   💎 ' + gems, canvas.width/2, 215);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#666'; ctx.font = '12px monospace';
    ctx.fillText('🏆 Рекорд: ' + highScore + ' | 📍 Локация: ' + currentLocation, canvas.width/2, 240);
    ctx.textAlign = 'left';

    for (let btn of menuButtons) {
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(0,255,255,0.15)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.font = (btn.h < 45 ? '13px' : '20px') + ' monospace'; ctx.textAlign = 'center';
        ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + (btn.h < 45 ? 27 : 33));
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f00'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#f00'; ctx.font = 'bold 44px monospace';
    ctx.fillText('ПОРАЖЕНИЕ', canvas.width/2, 200);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = '24px monospace';
    ctx.fillText('Счёт: ' + score, canvas.width/2, 260);
    ctx.fillStyle = '#ff0'; ctx.font = '20px monospace';
    ctx.fillText('🪙 ' + coins, canvas.width/2, 295);
    ctx.fillStyle = '#88ffff'; ctx.font = '20px monospace';
    ctx.fillText('💎 ' + gems, canvas.width/2, 325);
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 15;
    ctx.font = '18px monospace';
    if (score >= highScore && score > 0) ctx.fillText('🎉 НОВЫЙ РЕКОРД!', canvas.width/2, 360);
    ctx.shadowBlur = 0; ctx.textAlign = 'left';
    for (let btn of gameOverButtons) {
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0,255,255,0.15)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.font = '20px monospace'; ctx.textAlign = 'center';
        ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 35);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
}

function drawWin() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0f0'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#0f0'; ctx.font = 'bold 36px monospace';
    ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', canvas.width/2, 190);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = '22px monospace';
    ctx.fillText('Счёт: ' + score, canvas.width/2, 245);
    ctx.fillStyle = '#ff0'; ctx.font = '22px monospace';
    ctx.fillText('🪙 +' + Math.floor((50 + currentLevel * 5) * (1 + getUpgradeBonus('coins') * 0.1)), canvas.width/2, 280);
    ctx.fillStyle = '#88ffff'; ctx.font = '22px monospace';
    ctx.fillText('💎 +10', canvas.width/2, 310);
    if (upgradePoints > 0) {
        ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 15;
        ctx.font = 'bold 18px monospace';
        ctx.fillText('⚡ Очков улучшений: ' + upgradePoints, canvas.width/2, 345);
        ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'left';
    for (let btn of winButtons) {
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0,255,255,0.15)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.font = '20px monospace'; ctx.textAlign = 'center';
        ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + 35);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
}

function drawAdOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff0'; ctx.font = 'bold 32px monospace';
    ctx.fillText('📺 РЕКЛАМА', canvas.width/2, 200);
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#0ff'; ctx.font = '20px monospace';
    ctx.fillText('Реклама показывается...', canvas.width/2, 260);
    const barW = 400, barH = 30;
    const barX = (canvas.width - barW) / 2;
    const barY = 320;
    const progress = 1 - adTimer / adTotalTime;
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#0ff';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px monospace';
    ctx.fillText(Math.ceil(adTimer / 60) + 'с', canvas.width/2, barY + 50);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888'; ctx.font = '14px monospace';
    ctx.fillText('Награда будет выдана после окончания', canvas.width/2, 420);
    ctx.textAlign = 'left';
}

function drawSkins() {
    skinPreviewFrame++;
    if (skinChangeAnimation > 0) {
        skinChangeAnimation += 0.05;
        if (skinChangeAnimation >= 2) skinChangeAnimation = 0;
    }
    skinPreviewRotation = Math.sin(skinPreviewFrame * 0.03) * 0.3;

    if (!SKINS[skinPreviewKey]) skinPreviewKey = 'standard';
    const skin = SKINS[skinPreviewKey];

    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 26px monospace';
    ctx.fillText('🎨 СКИНЫ', canvas.width/2, 40);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0'; ctx.font = 'bold 16px monospace';
    ctx.fillText('🪙 ' + coins + '   💎 ' + gems, canvas.width/2, 68);

    const maxPages = Math.ceil(SKIN_KEYS.length / SKINS_PER_PAGE);
    ctx.fillStyle = '#888'; ctx.font = '12px monospace';
    ctx.fillText('Страница ' + (skinPage + 1) + ' / ' + maxPages, canvas.width/2, 88);

    const previewX = 300, previewY = 240, previewSize = 130;

    ctx.save();
    ctx.globalAlpha = 0.4;
    const bgGrad = ctx.createRadialGradient(previewX, previewY, 20, previewX, previewY, 130);
    bgGrad.addColorStop(0, hexToRgba(skin.glow, 0.4));
    bgGrad.addColorStop(1, hexToRgba(skin.glow, 0));
    ctx.fillStyle = bgGrad;
    ctx.beginPath(); ctx.arc(previewX, previewY, 130, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(previewX, previewY);
    ctx.rotate(skinPreviewRotation);
    let previewColor = skin.color;
    if (skinPreviewKey === 'rainbow') previewColor = 'hsl(' + (frame * 3 % 360) + ', 100%, 60%)';
    drawShipByKey(skinPreviewKey, previewSize, previewColor, skin.glow, skin.dark);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.shadowColor = skin.glow; ctx.shadowBlur = 20;
    ctx.fillStyle = skin.color; ctx.font = 'bold 20px monospace';
    ctx.fillText(skin.name, canvas.width/2, 380);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aaa'; ctx.font = '12px monospace';
    ctx.fillText(skin.abilityDesc, canvas.width/2, 402);

    const owned = ownedSkins.includes(skinPreviewKey);
    const selected = selectedSkin === skinPreviewKey;

    if (!owned) {
        const priceColor = skin.currency === 'gems' ? '#88ffff' : '#ff0';
        ctx.fillStyle = priceColor;
        ctx.shadowColor = priceColor; ctx.shadowBlur = 15;
        ctx.font = 'bold 15px monospace';
        ctx.fillText((skin.currency === 'gems' ? '💎 ' : '💰 ') + skin.price, canvas.width/2, 428);
        ctx.shadowBlur = 0;
    } else if (selected) {
        ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 15;
        ctx.font = 'bold 15px monospace';
        ctx.fillText('✓ ВЫБРАН', canvas.width/2, 428);
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.font = 'bold 13px monospace';
        ctx.fillText('КУПЛЕН', canvas.width/2, 428);
        ctx.shadowBlur = 0;
    }

    for (let btn of skinButtons) {
        if (btn.action) {
            const isSelectBtn = btn.text === 'ВЫБРАТЬ';
            const skinP = SKINS[skinPreviewKey];
            const currency = skinP.currency === 'gems' ? gems : coins;
            const canBuy = !ownedSkins.includes(skinPreviewKey) && currency >= skinP.price;
            const canSelect = ownedSkins.includes(skinPreviewKey);
            let btnColor = '#0ff';
            if (isSelectBtn) {
                if (selected) btnColor = '#0f0';
                else if (canBuy || canSelect) btnColor = skinP.currency === 'gems' ? '#88ffff' : '#ff0';
                else btnColor = '#555';
            }
            ctx.shadowColor = btnColor; ctx.shadowBlur = 20;
            ctx.fillStyle = hexToRgba(btnColor, 0.15);
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = btnColor; ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = btnColor;
            ctx.shadowColor = btnColor; ctx.shadowBlur = 10;
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            let btnText = btn.text;
            if (isSelectBtn) {
                if (selected) btnText = '✓ ВЫБРАН';
                else if (canBuy) btnText = 'КУПИТЬ';
                else if (canSelect) btnText = 'ВЫБРАТЬ';
                else btnText = '🔒 ЗАКРЫТ';
            }
            ctx.fillText(btnText, btn.x + btn.w/2, btn.y + 28);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            continue;
        }

        const s = SKINS[btn.skinKey];
        if (!s) continue;
        const isOwned = ownedSkins.includes(btn.skinKey);
        const isSelected = selectedSkin === btn.skinKey;
        const isPreview = skinPreviewKey === btn.skinKey;
        const isPremium = s.currency === 'gems';

        ctx.shadowColor = s.glow;
        ctx.shadowBlur = isPreview ? 25 : 12;
        ctx.fillStyle = isPreview ? hexToRgba(s.glow, 0.3) : (isPremium ? 'rgba(20,40,60,0.6)' : 'rgba(0,0,0,0.5)');
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isPreview ? '#fff' : (isSelected ? '#0f0' : (isOwned ? s.color : (isPremium ? '#88ffff' : '#555')));
        ctx.lineWidth = isPreview ? 3 : (isPremium ? 2.5 : 2);
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.save();
        ctx.translate(btn.x + btn.w/2, btn.y + btn.h/2);
        let miniColor = s.color;
        if (btn.skinKey === 'rainbow') miniColor = 'hsl(' + (frame * 3 % 360) + ', 100%, 60%)';
        ctx.shadowColor = s.glow; ctx.shadowBlur = 8;
        drawShipByKey(btn.skinKey, 18, miniColor, s.glow, s.dark);
        ctx.restore();

        if (!isOwned) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = isPremium ? '#88ffff' : '#ff0';
            ctx.shadowColor = isPremium ? '#0ff' : '#ff0';
            ctx.shadowBlur = 8;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(isPremium ? '💎' : '🔒', btn.x + btn.w/2, btn.y + btn.h/2 + 6);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
        }
    }
}

function drawLoading() {
    ctx.textAlign = 'center';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 42px monospace';
    ctx.fillText('COSMIC', canvas.width/2, 150);
    ctx.shadowColor = '#f0f'; ctx.fillStyle = '#f0f';
    ctx.fillText('BATTLES', canvas.width/2, 205);
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff0'; ctx.font = '20px monospace';
    ctx.fillText('Created by', canvas.width/2, 270);
    ctx.shadowColor = '#0f0'; ctx.fillStyle = '#0f0';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('ZOROZONET', canvas.width/2, 305);
    ctx.shadowColor = '#0ff'; ctx.fillStyle = '#0ff';
    ctx.font = '18px monospace';
    ctx.fillText('&', canvas.width/2, 335);
    ctx.shadowColor = '#f0f'; ctx.fillStyle = '#f0f';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('DEEPSEEK', canvas.width/2, 370);
    ctx.shadowBlur = 0;
    const barW = 400, barH = 30;
    const barX = (canvas.width - barW) / 2;
    const barY = 440;
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 15;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#0ff'; ctx.shadowBlur = 25;
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * (loadingProgress / 100), barH - 4);
    ctx.shadowBlur = 10; ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(Math.floor(loadingProgress) + '%', canvas.width/2, barY + barH/2 + 7);
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#0ff'; ctx.font = '16px monospace';
    ctx.fillText('Загрузка...', canvas.width/2, 520);
    ctx.textAlign = 'left'; ctx.shadowBlur = 0;
}

function draw() {
    const loc = LOCATIONS[currentLocation - 1];
    ctx.fillStyle = loc ? loc.bg : '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (loc && gameState === GAME_STATE.PLAYING) {
        const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 500);
        grad.addColorStop(0, hexToRgba(loc.accent, 0.2));
        grad.addColorStop(0.5, hexToRgba(loc.accent, 0.05));
        grad.addColorStop(1, hexToRgba(loc.accent, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);
        drawThemeBackground(loc.theme, loc.accent, loc.bg);
    }

    for (let s of stars) {
        const twinkle = 0.5 + Math.sin(s.twinklePhase) * 0.5;
        const alpha = s.brightness * (0.5 + twinkle * 0.5);
        if (s.layer === 2) {
            ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
    }

    if (adPlaying) { drawAdOverlay(); return; }

    if (gameState === GAME_STATE.LOADING) drawLoading();
    else if (gameState === GAME_STATE.MENU) drawMenu();
    else if (gameState === GAME_STATE.SHOP) drawShop();
    else if (gameState === GAME_STATE.SKINS) drawSkins();
    else if (gameState === GAME_STATE.UPGRADES) drawUpgrades();
    else if (gameState === GAME_STATE.EQUIPMENT) drawEquipment();
    else if (gameState === GAME_STATE.LOCATIONS) drawLocations();
    else if (gameState === GAME_STATE.LEVELS) drawLevels();
    else if (gameState === GAME_STATE.PLAYING) drawGame();
    else if (gameState === GAME_STATE.PAUSED) { drawGame(); drawPauseOverlay(); }
    else if (gameState === GAME_STATE.GAMEOVER) { drawGame(); drawGameOver(); }
    else if (gameState === GAME_STATE.WIN) { drawGame(); drawWin(); }
}
// ============================================================
// ЧАСТЬ 8: 12 УНИКАЛЬНЫХ АТАК БОССОВ (НОВОЕ)
// ============================================================

// 1. ГИГАНТ — волны пуль с задержкой
function bossAttackGiant(b, cx, cy) {
    for (let wave = 0; wave < 3; wave++) {
        for (let i = -2; i <= 2; i++) {
            const delay = wave * 15;
            setTimeout(() => {
                if (!activeBoss || activeBoss !== b) return;
                bossBullets.push({
                    x: cx - 10 + i * 30, y: cy,
                    w: 22, h: 22,
                    vx: i * 0.4, vy: 4 + wave * 0.5,
                    color: b.color
                });
            }, delay * 16);
        }
    }
    triggerScreenShake(8, 20);
}

// 2. ДРАКОН — огненный шлейф + веер
function bossAttackDragon(b, cx, cy) {
    for (let a = -1.4; a <= 1.4; a += 0.35) {
        bossBullets.push({
            x: cx - 6, y: cy,
            w: 14, h: 14,
            vx: Math.sin(a) * 4.5,
            vy: Math.cos(a) * 4.5,
            color: b.glow,
            fire: true
        });
    }
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (!activeBoss || activeBoss !== b) return;
            bossBullets.push({
                x: Math.random() * (canvas.width - 20) + 10, y: cy,
                w: 12, h: 12, vx: 0, vy: 5,
                color: '#ff4400', fire: true
            });
        }, i * 100);
    }
    triggerScreenFlash('#ff4400', 0.15, 10);
}

// 3. ФЕНИКС — круговой огонь по спирали
function bossAttackPhoenix(b, cx, cy) {
    const spiralCount = b.phase === 3 ? 24 : (b.phase === 2 ? 18 : 12);
    for (let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 2 + b.moveTimer * 0.05;
        const speed = 2.5 + (i % 3) * 0.6;
        bossBullets.push({
            x: cx, y: cy,
            w: 12, h: 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: i % 2 === 0 ? '#ff4400' : '#ffaa00'
        });
    }
    triggerScreenShake(6, 15);
}

// 4. РОБОТ — лазерная сетка (3 столба)
function bossAttackRobot(b, cx, cy) {
    const positions = [80, 300, 520];
    positions.forEach((px, i) => {
        setTimeout(() => {
            if (!activeBoss || activeBoss !== b) return;
            for (let y = cy; y < canvas.height; y += 40) {
                bossBullets.push({
                    x: px - 4, y: y,
                    w: 8, h: 40,
                    vx: 0, vy: 0,
                    color: '#44ff88',
                    laserPillar: true,
                    life: 60
                });
            }
            triggerScreenFlash('#44ff88', 0.2, 8);
        }, i * 200);
    });
    bossBullets.push({
        x: cx - 8, y: cy,
        w: 16, h: 40, vx: 0, vy: 6,
        color: '#fff'
    });
    triggerScreenShake(10, 25);
}

// 5. СМЕРТЬ — круговая бомбардировка + призыв скелетов
function bossAttackDeath(b, cx, cy) {
    if (b.phase === 3) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (!activeBoss || activeBoss !== b) return;
                const freeSlot = findFreeSlot();
                if (freeSlot) {
                    laneSlots[freeSlot.lane][freeSlot.slot] = true;
                    const type = ENEMY_TYPES.STANDARD;
                    const loc = LOCATIONS[currentLocation - 1];
                    const diff = loc.difficulty * (1 + currentLevel / 100);
                    enemies.push({
                        x: getSlotX(freeSlot.lane, freeSlot.slot), y: -40,
                        w: 35, h: 35, lane: freeSlot.lane, slot: freeSlot.slot,
                        targetX: getSlotX(freeSlot.lane, freeSlot.slot),
                        targetY: getLaneY(freeSlot.lane),
                        type: 'STANDARD',
                        hp: Math.ceil(type.hp * diff), maxHp: Math.ceil(type.hp * diff),
                        speed: type.speed, baseSpeed: type.speed,
                        shootChance: type.shootChance, stopped: false,
                        score: type.score, color: type.color, glow: type.glow,
                        dark: type.dark, bulletSpeed: type.bulletSpeed,
                        coinReward: type.coinReward, iceTimer: 0, fireTimer: 0
                    });
                }
            }, i * 300);
        }
    }
    const count = b.phase === 3 ? 16 : (b.phase === 2 ? 12 : 8);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        bossBullets.push({
            x: cx, y: cy,
            w: 14, h: 14,
            vx: Math.cos(angle) * 3.5,
            vy: Math.sin(angle) * 3.5,
            color: '#aa44ff'
        });
    }
    triggerScreenFlash('#aa44ff', 0.25, 15);
}

// 6. СКОРПИОН — прицельные стрелы + жало
function bossAttackScorpion(b, cx, cy) {
    const dx = player.x + player.w/2 - cx;
    const dy = player.y + player.h/2 - cy;
    const baseAngle = Math.atan2(dy, dx);
    const spread = b.phase === 3 ? 0.6 : 0.4;
    for (let i = -2; i <= 2; i++) {
        const a = baseAngle + (i / 2) * spread;
        bossBullets.push({
            x: cx, y: cy,
            w: 10, h: 24,
            vx: Math.cos(a) * 5.5,
            vy: Math.sin(a) * 5.5,
            color: b.color
        });
    }
    for (let i = 0; i < 4; i++) {
        bossBullets.push({
            x: cx + (Math.random() - 0.5) * 60,
            y: cy + 30,
            w: 16, h: 16,
            vx: (Math.random() - 0.5) * 2,
            vy: 2.5,
            color: '#88ff00'
        });
    }
    triggerScreenShake(7, 18);
}

// 7. ЛЕТУЧАЯ МЫШЬ — зигзаг-пули + рывки
function bossAttackBat(b, cx, cy) {
    const count = b.phase === 3 ? 7 : (b.phase === 2 ? 5 : 3);
    for (let i = 0; i < count; i++) {
        bossBullets.push({
            x: cx + (Math.random() - 0.5) * 40,
            y: cy,
            w: 10, h: 10,
            vx: (Math.random() - 0.5) * 4,
            vy: 3.5,
            color: b.color,
            zigzag: true,
            zigzagPhase: Math.random() * Math.PI * 2
        });
    }
    triggerScreenShake(5, 12);
}

// 8. ОСЬМИНОГ — 8 пуль по кругу + волны
function bossAttackOctopus(b, cx, cy) {
    const count = b.phase === 3 ? 16 : 8;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + b.moveTimer * 0.03;
        bossBullets.push({
            x: cx, y: cy,
            w: 12, h: 12,
            vx: Math.cos(angle) * 3.5,
            vy: Math.sin(angle) * 3.5,
            color: i % 2 === 0 ? b.glow : b.color
        });
    }
    if (b.phase >= 2) {
        setTimeout(() => {
            if (!activeBoss || activeBoss !== b) return;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + 0.4;
                bossBullets.push({
                    x: cx, y: cy,
                    w: 10, h: 10,
                    vx: Math.cos(angle) * 4.5,
                    vy: Math.sin(angle) * 4.5,
                    color: b.glow
                });
            }
        }, 300);
    }
    triggerScreenShake(6, 15);
}

// 9. АКУЛА — быстрые пули + рывок
function bossAttackShark(b, cx, cy) {
    for (let i = -1; i <= 1; i++) {
        bossBullets.push({
            x: cx + i * 20, y: cy,
            w: 8, h: 30,
            vx: i * 0.8, vy: 7,
            color: '#0ff'
        });
    }
    if (b.phase >= 2) {
        b.direction *= -1;
        triggerScreenShake(12, 20);
    }
    if (b.phase === 3) {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            bossBullets.push({
                x: cx, y: cy,
                w: 10, h: 10,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                color: b.color
            });
        }
    }
}

// 10. ВОЛК — двойные пули + крест
function bossAttackWolf(b, cx, cy) {
    bossBullets.push({ x: cx - 25, y: cy, w: 12, h: 18, vx: -1.5, vy: 4, color: b.color });
    bossBullets.push({ x: cx + 25, y: cy, w: 12, h: 18, vx: 1.5, vy: 4, color: b.color });
    if (b.phase >= 2) {
        bossBullets.push({ x: cx, y: cy, w: 14, h: 14, vx: 0, vy: 5, color: b.glow });
        bossBullets.push({ x: cx, y: cy, w: 14, h: 14, vx: -4, vy: 3, color: b.glow });
        bossBullets.push({ x: cx, y: cy, w: 14, h: 14, vx: 4, vy: 3, color: b.glow });
    }
    if (b.phase === 3) {
        for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2;
            bossBullets.push({
                x: cx, y: cy,
                w: 10, h: 10,
                vx: Math.cos(angle) * 3.5,
                vy: Math.sin(angle) * 3.5,
                color: '#fff'
            });
        }
    }
    triggerScreenShake(6, 15);
}

// 11. КОРОЛЬ — все атаки вместе
function bossAttackKing(b, cx, cy) {
    // Веер
    for (let a = -1.2; a <= 1.2; a += 0.3) {
        bossBullets.push({
            x: cx - 5, y: cy,
            w: 12, h: 12,
            vx: Math.sin(a) * 4, vy: Math.cos(a) * 4,
            color: b.glow
        });
    }
    // Медленные большие
    bossBullets.push({ x: cx - 12, y: cy, w: 24, h: 24, vx: 0, vy: 3, color: b.color });
    // Прицельная
    const dx = player.x + player.w/2 - cx;
    const dy = player.y + player.h/2 - cy;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    bossBullets.push({ x: cx, y: cy, w: 10, h: 20, vx: (dx/dist)*5, vy: (dy/dist)*5, color: '#fff' });
    // Круг в 3-й фазе
    if (b.phase === 3) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            bossBullets.push({
                x: cx, y: cy,
                w: 10, h: 10,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                color: b.glow
            });
        }
    }
    triggerScreenShake(10, 25);
    triggerScreenFlash(b.glow, 0.15, 12);
}

// 12. ФИНАЛЬНЫЙ — ультимативная атака (12 пуль + спираль)
function bossAttackFinal(b, cx, cy) {
    // Круг из 12
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        bossBullets.push({
            x: cx, y: cy,
            w: 14, h: 14,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            color: '#ff00ff'
        });
    }
    // Спираль поверх
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + b.moveTimer * 0.08;
        bossBullets.push({
            x: cx, y: cy,
            w: 10, h: 10,
            vx: Math.cos(angle) * 5.5,
            vy: Math.sin(angle) * 5.5,
            color: '#ff88ff'
        });
    }
    // Прицельные лучи
    const dx = player.x + player.w/2 - cx;
    const dy = player.y + player.h/2 - cy;
    const baseAngle = Math.atan2(dy, dx);
    for (let i = -1; i <= 1; i++) {
        const a = baseAngle + i * 0.3;
        bossBullets.push({
            x: cx, y: cy,
            w: 8, h: 30,
            vx: Math.cos(a) * 6,
            vy: Math.sin(a) * 6,
            color: '#fff'
        });
    }
    triggerScreenShake(15, 35);
    triggerScreenFlash('#ff00ff', 0.3, 20);
}
// ============================================================
// ЧАСТЬ 9: Слушатели кликов + gameLoop + запуск
// ============================================================

function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const coords = getCanvasCoords(t.clientX, t.clientY);
    handleTouch(coords.x, coords.y);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState === GAME_STATE.PLAYING && !adPlaying) {
        const t = e.touches[0];
        const coords = getCanvasCoords(t.clientX, t.clientY);
        player.targetX = coords.x - player.w/2;
        player.targetY = coords.y - player.h/2;
    }
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    handleTouch(coords.x, coords.y);
});

canvas.addEventListener('mousemove', (e) => {
    if (gameState === GAME_STATE.PLAYING && e.buttons === 1 && !adPlaying) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        player.targetX = coords.x - player.w/2;
        player.targetY = coords.y - player.h/2;
    }
});

// ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
function gameLoop() {
    updateAd();
    if (gameState === GAME_STATE.LOADING) updateLoading();
    else if (gameState === GAME_STATE.PLAYING) updateGame();
    draw();
    requestAnimationFrame(gameLoop);
}

// ЗАПУСК!
gameLoop();// ============================================================
// ЧАСТЬ 10: Финальные проверки и защита от ошибок
// ============================================================

// Защита от отсутствующих функций (на случай если что-то пропущено)
window.addEventListener('error', (e) => {
    console.warn('Игровая ошибка:', e.message, 'на строке', e.lineno);
});

// Форсированный ресайз при старте
window.addEventListener('load', () => {
    setTimeout(() => {
        resizeCanvas();
    }, 100);
});

// Защита от потери фокуса (когда игрок свернул вкладку — не спамим музыкой)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Свернули вкладку — пауза музыки
        if (musicGain) musicGain.gain.value = 0;
    } else {
        // Вернулись — восстанавливаем громкость
        if (musicGain) musicGain.gain.value = musicEnabled ? 0.18 : 0;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }
});

// Вывод версии в консоль (для отладки)
console.log('%c🚀 COSMIC BATTLES v1.0', 'color: #0ff; font-size: 16px; font-weight: bold;');
console.log('%cФинал: 120 уровней, 12 боссов, 12 уникальных атак, звук, 17 скинов', 'color: #f0f; font-size: 12px;');
console.log('%cУдачной игры!', 'color: #ff0; font-size: 12px;');