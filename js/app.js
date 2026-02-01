// Cohérence Cardiaque - App
//
// Objectifs clés iOS/Safari :
// - Les sons d'inspiration/expiration fonctionnent pendant toute la séance
// - Les sons continuent écran verrouillé
// - Les volumes sont réglables à tout moment
//
// Stratégie :
// - Générer 2 sons WAV en mémoire (Blob URLs)
// - Utiliser 2 instances HTMLAudio persistantes (inhale/exhale)
// - Déverrouiller (play/pause muet) AU CLIC sur "Commencer"
// - Musique : HTMLAudio (iOS) avec loop + volume live + fondu 5s fin de séance

// -----------------------
// Stockage local
// -----------------------
const STORAGE_KEYS = {
  SESSION_DURATION: 'cc_session_duration',
  INHALE_TIME: 'cc_inhale_time',
  EXHALE_TIME: 'cc_exhale_time',
  INHALE_VOLUME: 'cc_inhale_volume',
  EXHALE_VOLUME: 'cc_exhale_volume',
  MUSIC_VOLUME: 'cc_music_volume'
};
const HISTORY_STORAGE_KEY = 'cc_sessions_v1';

function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}
function loadPreference(key, defaultValue) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : defaultValue;
  } catch (_) {
    return defaultValue;
  }
}

// -----------------------
// Historique
// -----------------------
function loadSessionHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}
function saveSessionHistory(list) {
  try { localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
}
function addCompletedSessionToHistory(record) {
  const list = loadSessionHistory();
  list.push(record);
  const MAX = 5000;
  if (list.length > MAX) list.splice(0, list.length - MAX);
  saveSessionHistory(list);
}
function clearSessionHistory() {
  try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch (_) {}
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeekMonday(d) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}
function startOfYear(d) {
  const x = startOfDay(d);
  x.setMonth(0, 1);
  return x;
}
function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function isBetween(date, start, endExclusive) {
  return date >= start && date < endExclusive;
}
function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins <= 0) return `${rem}s`;
  if (rem === 0) return `${mins} min`;
  return `${mins} min ${rem}s`;
}
function computeStatsForRange(sessions, start, endExclusive, periodDays) {
  let totalSec = 0;
  let count = 0;
  let totalBreaths = 0;
  let totalCycles = 0;

  for (const s of sessions) {
    const t = new Date(s.endedAt);
    if (!isFinite(t)) continue;
    if (!isBetween(t, start, endExclusive)) continue;
    totalSec += Number(s.durationSec) || 0;
    count += 1;
    totalBreaths += Number(s.breaths) || 0;
    totalCycles += Number(s.cycles) || 0;
  }

  return {
    totalSec,
    count,
    avgPerSessionSec: count ? totalSec / count : 0,
    avgPerDaySec: periodDays ? totalSec / periodDays : 0,
    totalBreaths,
    totalCycles
  };
}

// -----------------------
// Synthèse WAV (Blob URL)
// -----------------------
function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);
  return new Blob([view], { type: 'audio/wav' });
}

// Cloche aiguë : attaque très courte + décroissance rapide + harmoniques
function synthBellWav({ freq = 880, durationSec = 0.45, sampleRate = 44100 } = {}) {
  const n = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.004);
    const decay = Math.exp(-t * 10.0);
    const env = attack * decay;

    const s =
      0.80 * Math.sin(2 * Math.PI * freq * t) +
      0.25 * Math.sin(2 * Math.PI * (freq * 2.01) * t) +
      0.18 * Math.sin(2 * Math.PI * (freq * 3.98) * t);

    out[i] = 0.9 * env * s;
  }
  return URL.createObjectURL(encodeWAV(out, sampleRate));
}

// Bol tibétain grave : décroissance plus lente, timbre rond
function synthBowlWav({ freq = 220, durationSec = 0.70, sampleRate = 44100 } = {}) {
  const n = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.010);
    const decay = Math.exp(-t * 4.2);
    const env = attack * decay;

    const s =
      0.85 * Math.sin(2 * Math.PI * freq * t) +
      0.30 * Math.sin(2 * Math.PI * (freq * 2.005) * t) +
      0.18 * Math.sin(2 * Math.PI * (freq * 3.01) * t);

    out[i] = 0.95 * env * s;
  }
  return URL.createObjectURL(encodeWAV(out, sampleRate));
}

// -----------------------
// Musique de fond
// -----------------------
let audioContext = null;
let backgroundSourceNode = null;
let backgroundGainNode = null;

function initAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function setupBackgroundMusicAudioGraph(backgroundAudio, musicVolumeSlider) {
  if (!backgroundAudio) return;

  if (isIOS()) {
    try { if (backgroundSourceNode) backgroundSourceNode.disconnect(); } catch (_) {}
    try { if (backgroundGainNode) backgroundGainNode.disconnect(); } catch (_) {}
    backgroundSourceNode = null;
    backgroundGainNode = null;
    try { backgroundAudio.volume = (parseInt(musicVolumeSlider.value, 10) / 100); } catch (_) {}
    return;
  }

  const ctx = initAudioContext();

  try {
    if (backgroundGainNode && backgroundSourceNode && backgroundSourceNode.mediaElement === backgroundAudio) return;
  } catch (_) {}

  try { if (backgroundSourceNode) backgroundSourceNode.disconnect(); } catch (_) {}
  try { if (backgroundGainNode) backgroundGainNode.disconnect(); } catch (_) {}
  backgroundSourceNode = null;
  backgroundGainNode = null;

  try {
    backgroundSourceNode = ctx.createMediaElementSource(backgroundAudio);
    backgroundGainNode = ctx.createGain();
    backgroundGainNode.gain.value = parseInt(musicVolumeSlider.value, 10) / 100;
    backgroundSourceNode.connect(backgroundGainNode);
    backgroundGainNode.connect(ctx.destination);
  } catch (e) {
    console.warn('WebAudio musique indisponible, fallback HTMLAudio', e);
    backgroundSourceNode = null;
    backgroundGainNode = null;
  }
}

function setMusicVolumeFromUI(backgroundAudio, musicVolumeSlider) {
  const v = parseInt(musicVolumeSlider.value, 10) / 100;
  if (backgroundGainNode) {
    try { backgroundGainNode.gain.value = v; } catch (_) {}
  }
  if (backgroundAudio) {
    try { backgroundAudio.volume = v; } catch (_) {}
  }
}

function fadeOutMusicAndStop(backgroundAudio, musicVolumeSlider, durationMs = 5000) {
  return new Promise((resolve) => {
    if (!backgroundAudio) return resolve();

    const targetVol = parseInt(musicVolumeSlider?.value || '30', 10) / 100;

    const finish = () => {
      try { backgroundAudio.pause(); } catch (_) {}
      try { backgroundAudio.currentTime = 0; } catch (_) {}
      try { backgroundAudio.volume = targetVol; } catch (_) {}
      if (backgroundGainNode && audioContext) {
        try { backgroundGainNode.gain.value = targetVol; } catch (_) {}
      }
      resolve();
    };

    if (backgroundGainNode && audioContext) {
      const now = audioContext.currentTime;
      const dur = Math.max(0.3, durationMs / 1000);
      try {
        const current = backgroundGainNode.gain.value;
        backgroundGainNode.gain.cancelScheduledValues(now);
        backgroundGainNode.gain.setValueAtTime(current, now);
        backgroundGainNode.gain.linearRampToValueAtTime(0.0001, now + dur);
        setTimeout(finish, durationMs + 50);
        return;
      } catch (_) {}
    }

    const startVol = typeof backgroundAudio.volume === 'number' ? backgroundAudio.volume : targetVol;
    const steps = 12;
    let step = 0;
    const interval = Math.max(30, Math.floor(durationMs / steps));
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const vol = Math.max(0, startVol * (1 - t));
      try { backgroundAudio.volume = vol; } catch (_) {}
      if (step >= steps) {
        clearInterval(timer);
        finish();
      }
    }, interval);
  });
}

// -----------------------
// App state
// -----------------------
let isRunning = false;
let currentPhase = null;
let sessionTimer = null;
let phaseTimer = null;
let totalTime = 0;
let elapsedTime = 0;
let cycleCount = 0;
let breathCount = 0;

let backgroundAudio = null;
let musicLibrary = [];
let currentMusicIndex = -1;

let wakeLock = null;
let silentAudio = null;

let inhaleSrc = null;
let exhaleSrc = null;
let inhaleAudio = null;
let exhaleAudio = null;

// -----------------------
// DOM
// -----------------------
const breathingCircle = document.getElementById('breathingCircle');
const breathText = document.getElementById('breathText');
const timerDisplay = document.getElementById('timerDisplay');
const progressFill = document.getElementById('progressFill');
const cycleCountDisplay = document.getElementById('cycleCount');
const breathCountDisplay = document.getElementById('breathCount');
const breathingZone = document.getElementById('breathingZone');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const historyBtn = document.getElementById('historyBtn');
const historyPanel = document.getElementById('historyPanel');
const historyGrid = document.getElementById('historyGrid');
const historyCloseBtn = document.getElementById('historyCloseBtn');
const historyResetBtn = document.getElementById('historyResetBtn');

const endScreenEl = document.getElementById('endScreen');
const endScreenTitleEl = document.getElementById('endScreenTitle');
const endScreenMsgEl = document.getElementById('endScreenMsg');
const endScreenCloseBtn = document.getElementById('endScreenCloseBtn');

const sessionDurationInput = document.getElementById('sessionDuration');
const inhaleTimeInput = document.getElementById('inhaleTime');
const exhaleTimeInput = document.getElementById('exhaleTime');
const backgroundMusicInput = document.getElementById('backgroundMusic');

const inhaleVolumeSlider = document.getElementById('inhaleVolume');
const exhaleVolumeSlider = document.getElementById('exhaleVolume');
const musicVolumeSlider = document.getElementById('musicVolume');
const inhaleVolumeValue = document.getElementById('inhaleVolumeValue');
const exhaleVolumeValue = document.getElementById('exhaleVolumeValue');
const musicVolumeValue = document.getElementById('musicVolumeValue');
const musicVolumeControl = document.getElementById('musicVolumeControl');

const encouragementPhrases = [
  'Quelques minutes suffisent : ta régularité fait la différence.',
  'Bravo. À force de répéter, ton corps apprend à se calmer plus vite.',
  'Tu viens d’offrir une vraie pause à ton système nerveux. Continue comme ça.',
  'Belle séance. Refaire ce rituel régulièrement change beaucoup de choses.',
  'Chaque séance est un petit entraînement vers plus de sérénité.',
  'Tu progresses. Même une courte séance compte.'
];

function randomEncouragement() {
  return encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
}

function updateSliderBackground(slider, value) {
  const percentage = parseFloat(value);
  slider.style.background = `linear-gradient(to right,
      var(--secondary) 0%,
      var(--secondary) ${percentage}%,
      rgba(255, 255, 255, 0.2) ${percentage}%,
      rgba(255, 255, 255, 0.2) 100%)`;
}

function handleVolumeChange(slider, valueDisplay, type) {
  const value = slider.value;
  valueDisplay.textContent = `${value}%`;
  updateSliderBackground(slider, value);

  const v = parseInt(value, 10) / 100;

  if (type === 'music') {
    setMusicVolumeFromUI(backgroundAudio, musicVolumeSlider);
    setupBackgroundMusicAudioGraph(backgroundAudio, musicVolumeSlider);
    return;
  }

  if (type === 'inhale') {
    if (inhaleAudio && !inhaleAudio.paused) inhaleAudio.volume = v;
  } else if (type === 'exhale') {
    if (exhaleAudio && !exhaleAudio.paused) exhaleAudio.volume = v;
  }
}

inhaleVolumeSlider.addEventListener('input', () => handleVolumeChange(inhaleVolumeSlider, inhaleVolumeValue, 'inhale'));
exhaleVolumeSlider.addEventListener('input', () => handleVolumeChange(exhaleVolumeSlider, exhaleVolumeValue, 'exhale'));
musicVolumeSlider.addEventListener('input', () => handleVolumeChange(musicVolumeSlider, musicVolumeValue, 'music'));

inhaleVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.INHALE_VOLUME, e.target.value));
exhaleVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.EXHALE_VOLUME, e.target.value));
musicVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.MUSIC_VOLUME, e.target.value));

function updateBreathingDurations() {
  const inhale = parseInt(inhaleTimeInput.value, 10);
  const exhale = parseInt(exhaleTimeInput.value, 10);
  document.documentElement.style.setProperty('--inhale-duration', `${inhale}s`);
  document.documentElement.style.setProperty('--exhale-duration', `${exhale}s`);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
  const progress = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;
  progressFill.style.width = `${progress}%`;
  timerDisplay.textContent = formatTime(totalTime - elapsedTime);
}

function toggleHistory() {
  if (!historyPanel) return;
  const open = historyPanel.getAttribute('aria-hidden') === 'false';
  if (open) closeHistory();
  else openHistory();
}

function openHistory() {
  if (!historyPanel) return;
  historyPanel.setAttribute('aria-hidden', 'false');
  historyBtn?.setAttribute('aria-expanded', 'true');
  historyPanel.classList.add('open');
  renderHistory();
}

function closeHistory() {
  if (!historyPanel) return;
  historyPanel.setAttribute('aria-hidden', 'true');
  historyBtn?.setAttribute('aria-expanded', 'false');
  historyPanel.classList.remove('open');
}

function renderHistory() {
  if (!historyGrid) return;
  const sessions = loadSessionHistory();
  const now = new Date();

  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const weekStart = startOfWeekMonday(now);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);

  const monthStart = startOfMonth(now);
  const monthEnd = new Date(monthStart); monthEnd.setMonth(monthEnd.getMonth() + 1);

  const yearStart = startOfYear(now);
  const yearEnd = new Date(yearStart); yearEnd.setFullYear(yearEnd.getFullYear() + 1);

  const dayStats = computeStatsForRange(sessions, dayStart, dayEnd, 1);
  const weekStats = computeStatsForRange(sessions, weekStart, weekEnd, 7);
  const monthStats = computeStatsForRange(sessions, monthStart, monthEnd, daysInMonth(now));
  const yearStats = computeStatsForRange(sessions, yearStart, yearEnd, 365);

  const cards = [
    { title: 'Aujourd’hui', s: dayStats },
    { title: 'Semaine', s: weekStats },
    { title: 'Mois', s: monthStats },
    { title: 'Année', s: yearStats }
  ];

  historyGrid.innerHTML = cards.map(({ title, s }) => {
    return `
      <div class="history-card">
        <div class="history-card-title">${title}</div>
        <div class="history-metric"><span>Total</span><strong>${formatDuration(s.totalSec)}</strong></div>
        <div class="history-metric"><span>Séances</span><strong>${s.count}</strong></div>
        <div class="history-metric"><span>Moyenne / séance</span><strong>${formatDuration(s.avgPerSessionSec)}</strong></div>
        <div class="history-metric"><span>Moyenne / jour</span><strong>${formatDuration(s.avgPerDaySec)}</strong></div>
      </div>
    `;
  }).join('');
}

function ensureBreathingSources() {
  if (!inhaleSrc) inhaleSrc = synthBellWav();
  if (!exhaleSrc) exhaleSrc = synthBowlWav();
}

function unlockBreathingAudio() {
  ensureBreathingSources();

  inhaleAudio = new Audio(inhaleSrc);
  exhaleAudio = new Audio(exhaleSrc);

  inhaleAudio.preload = 'auto';
  exhaleAudio.preload = 'auto';

  inhaleAudio.volume = 0;
  exhaleAudio.volume = 0;

  inhaleAudio.play().then(() => inhaleAudio.pause()).catch(() => {});
  exhaleAudio.play().then(() => exhaleAudio.pause()).catch(() => {});

  inhaleAudio.currentTime = 0;
  exhaleAudio.currentTime = 0;

  inhaleAudio.volume = parseInt(inhaleVolumeSlider.value, 10) / 100;
  exhaleAudio.volume = parseInt(exhaleVolumeSlider.value, 10) / 100;
}

function playBreathSound(phase) {
  if (phase === 'inhale') {
    if (!inhaleAudio) return;
    const v = parseInt(inhaleVolumeSlider.value, 10) / 100;
    try {
      inhaleAudio.pause();
      inhaleAudio.currentTime = 0;
      inhaleAudio.volume = v;
    } catch (_) {}
    inhaleAudio.play().catch(() => {});
  } else {
    if (!exhaleAudio) return;
    const v = parseInt(exhaleVolumeSlider.value, 10) / 100;
    try {
      exhaleAudio.pause();
      exhaleAudio.currentTime = 0;
      exhaleAudio.volume = v;
    } catch (_) {}
    exhaleAudio.play().catch(() => {});
  }
}

function renderMusicLibrary() {
  const musicListEl = document.getElementById('musicList');
  const musicLibraryEl = document.getElementById('musicLibrary');
  if (!musicListEl || !musicLibraryEl) return;

  if (musicLibrary.length === 0) {
    musicLibraryEl.style.display = 'none';
    musicListEl.innerHTML = '';
    return;
  }

  musicLibraryEl.style.display = 'block';

  musicListEl.innerHTML = musicLibrary.map((m, idx) => {
    const active = idx === currentMusicIndex ? 'active' : '';
    return `
      <div class="music-item ${active}">
        <button class="music-select" data-idx="${idx}" type="button">${m.name}</button>
        <button class="music-remove" data-rm="${idx}" type="button" aria-label="Supprimer">✕</button>
      </div>
    `;
  }).join('');

  musicListEl.querySelectorAll('button.music-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      selectMusic(idx);
    });
  });

  musicListEl.querySelectorAll('button.music-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-rm'), 10);
      removeMusic(idx);
    });
  });
}

function selectMusic(index) {
  if (index < 0 || index >= musicLibrary.length) return;

  currentMusicIndex = index;
  const selected = musicLibrary[index];

  if (backgroundAudio) {
    try { backgroundAudio.pause(); } catch (_) {}
  }

  if (!selected.audio) {
    selected.audio = new Audio(selected.url);
    selected.audio.preload = 'auto';
    selected.audio.loop = true;
  }

  backgroundAudio = selected.audio;

  setupBackgroundMusicAudioGraph(backgroundAudio, musicVolumeSlider);
  setMusicVolumeFromUI(backgroundAudio, musicVolumeSlider);

  const musicFileName = document.getElementById('musicFileName');
  if (musicFileName) musicFileName.textContent = `Sélectionnée: ${selected.name}`;
  if (musicVolumeControl) musicVolumeControl.style.display = 'flex';

  renderMusicLibrary();

  if (isRunning) {
    backgroundAudio.play().catch(() => {});
  }
}

function removeMusic(index) {
  if (index < 0 || index >= musicLibrary.length) return;

  if (index === currentMusicIndex) {
    if (backgroundAudio) {
      try { backgroundAudio.pause(); } catch (_) {}
    }
    backgroundAudio = null;
    currentMusicIndex = -1;
    const musicFileName = document.getElementById('musicFileName');
    if (musicFileName) musicFileName.textContent = '';
    if (musicVolumeControl) musicVolumeControl.style.display = 'none';
  }

  try { URL.revokeObjectURL(musicLibrary[index].url); } catch (_) {}
  musicLibrary.splice(index, 1);

  if (currentMusicIndex > index) currentMusicIndex--;

  renderMusicLibrary();
}

async function loadBundledAudioManifest() {
  try {
    const res = await fetch('./assets/audio-manifest.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data.music) && data.music.length > 0) {
      data.music.forEach((fileName) => {
        if (!/\.(mp3|wav)$/i.test(fileName)) return;
        const url = `./music/${encodeURIComponent(fileName)}`;
        if (musicLibrary.some(m => m.name === fileName)) return;
        musicLibrary.push({ name: fileName, url, audio: null });
      });
      renderMusicLibrary();
      if (currentMusicIndex === -1 && musicLibrary.length > 0) {
        selectMusic(0);
      }
    }
  } catch (_) {
    // optionnel
  }
}

backgroundMusicInput?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    musicLibrary.push({ name: file.name, url, audio: null });
  });

  renderMusicLibrary();
  if (currentMusicIndex === -1 && musicLibrary.length > 0) selectMusic(0);
});

function startInhale() {
  currentPhase = 'inhale';
  breathingCircle.className = 'breathing-circle inhale';
  breathText.textContent = 'Inspirez';
  breathText.classList.add('visible');

  playBreathSound('inhale');
  breathCount++;
  breathCountDisplay.textContent = String(breathCount);

  const inhaleTimeMs = parseInt(inhaleTimeInput.value, 10) * 1000;
  phaseTimer = setTimeout(startExhale, inhaleTimeMs);
}

function startExhale() {
  currentPhase = 'exhale';
  breathingCircle.className = 'breathing-circle exhale';
  breathText.textContent = 'Expirez';

  playBreathSound('exhale');
  cycleCount++;
  cycleCountDisplay.textContent = String(cycleCount);

  const exhaleTimeMs = parseInt(exhaleTimeInput.value, 10) * 1000;
  phaseTimer = setTimeout(() => {
    if (isRunning) startInhale();
  }, exhaleTimeMs);
}

function showEndScreen(title, message) {
  if (!endScreenEl) return;
  endScreenTitleEl.textContent = title;
  endScreenMsgEl.textContent = message;
  endScreenEl.classList.add('show');
  endScreenEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

async function startSession() {
  if (isRunning) return;

  if (endScreenEl) {
    endScreenEl.classList.remove('show');
    endScreenEl.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('modal-open');

  unlockBreathingAudio();

  isRunning = true;
  breathingZone.classList.add('active');
  startBtn.style.display = 'none';
  stopBtn.style.display = 'block';

  cycleCount = 0;
  breathCount = 0;
  elapsedTime = 0;
  cycleCountDisplay.textContent = '0';
  breathCountDisplay.textContent = '0';

  totalTime = parseInt(sessionDurationInput.value, 10) * 60;
  updateBreathingDurations();
  timerDisplay.textContent = formatTime(totalTime);
  updateProgress();

  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (_) {}
  }

  if (!silentAudio) {
    const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
    silentAudio = new Audio(silentWav);
    silentAudio.loop = true;
    silentAudio.volume = 0;
  }
  silentAudio.play().catch(() => {});

  if (backgroundAudio) {
    backgroundAudio.loop = true;
    setMusicVolumeFromUI(backgroundAudio, musicVolumeSlider);
    setupBackgroundMusicAudioGraph(backgroundAudio, musicVolumeSlider);
    backgroundAudio.play().catch(() => {});
    if (musicVolumeControl) musicVolumeControl.style.display = 'flex';
  }

  sessionTimer = setInterval(() => {
    elapsedTime++;
    updateProgress();
    if (elapsedTime >= totalTime) {
      stopSession(true);
    }
  }, 1000);

  startInhale();
}

async function stopSession(completed = false) {
  if (!isRunning) return;

  isRunning = false;

  if (sessionTimer) clearInterval(sessionTimer);
  if (phaseTimer) clearTimeout(phaseTimer);
  sessionTimer = null;
  phaseTimer = null;

  breathingZone.classList.remove('active');
  startBtn.style.display = 'block';
  stopBtn.style.display = 'none';

  try { inhaleAudio?.pause(); } catch (_) {}
  try { exhaleAudio?.pause(); } catch (_) {}

  if (completed) {
    await fadeOutMusicAndStop(backgroundAudio, musicVolumeSlider, 5000);
  } else {
    if (backgroundAudio) {
      try { backgroundAudio.pause(); } catch (_) {}
    }
  }

  if (silentAudio) {
    try { silentAudio.pause(); } catch (_) {}
  }

  if (wakeLock) {
    try { await wakeLock.release(); } catch (_) {}
    wakeLock = null;
  }

  if (completed) {
    addCompletedSessionToHistory({
      endedAt: new Date().toISOString(),
      durationSec: totalTime,
      breaths: breathCount,
      cycles: cycleCount
    });

    showEndScreen('Te voilà détendu(e)', randomEncouragement());
  }

  timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value, 10) * 60);
  progressFill.style.width = '0%';
  breathText.classList.remove('visible');
}

startBtn.addEventListener('click', startSession);
stopBtn.addEventListener('click', () => stopSession(false));

endScreenCloseBtn?.addEventListener('click', () => {
  if (endScreenEl) {
    endScreenEl.classList.remove('show');
    endScreenEl.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('modal-open');
});

historyBtn?.addEventListener('click', toggleHistory);
historyCloseBtn?.addEventListener('click', closeHistory);
historyResetBtn?.addEventListener('click', () => {
  const ok = confirm('Effacer tout l’historique ?

Cette action est irréversible.');
  if (!ok) return;
  clearSessionHistory();
  renderHistory();
});

sessionDurationInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.SESSION_DURATION, e.target.value));
inhaleTimeInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.INHALE_TIME, e.target.value));
exhaleTimeInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.EXHALE_TIME, e.target.value));

sessionDurationInput.addEventListener('input', () => {
  if (!isRunning) timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value, 10) * 60);
});

function loadSavedPreferences() {
  sessionDurationInput.value = loadPreference(STORAGE_KEYS.SESSION_DURATION, '5');
  inhaleTimeInput.value = loadPreference(STORAGE_KEYS.INHALE_TIME, '5');
  exhaleTimeInput.value = loadPreference(STORAGE_KEYS.EXHALE_TIME, '5');

  inhaleVolumeSlider.value = loadPreference(STORAGE_KEYS.INHALE_VOLUME, '70');
  exhaleVolumeSlider.value = loadPreference(STORAGE_KEYS.EXHALE_VOLUME, '70');
  musicVolumeSlider.value = loadPreference(STORAGE_KEYS.MUSIC_VOLUME, '30');

  inhaleVolumeValue.textContent = `${inhaleVolumeSlider.value}%`;
  exhaleVolumeValue.textContent = `${exhaleVolumeSlider.value}%`;
  musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;

  updateSliderBackground(inhaleVolumeSlider, inhaleVolumeSlider.value);
  updateSliderBackground(exhaleVolumeSlider, exhaleVolumeSlider.value);
  updateSliderBackground(musicVolumeSlider, musicVolumeSlider.value);
}

loadSavedPreferences();
loadBundledAudioManifest();
updateBreathingDurations();
timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value, 10) * 60);
