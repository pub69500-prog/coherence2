        // Audio Context for sound synthesis - with iOS compatibility
        let audioContext = null;
        
        // LocalStorage keys
        const STORAGE_KEYS = {
            SESSION_DURATION: 'cc_session_duration',
            INHALE_TIME: 'cc_inhale_time',
            EXHALE_TIME: 'cc_exhale_time',
            INHALE_SOUND: 'cc_inhale_sound',
            EXHALE_SOUND: 'cc_exhale_sound',
            INHALE_VOLUME: 'cc_inhale_volume',
            EXHALE_VOLUME: 'cc_exhale_volume',
            MUSIC_VOLUME: 'cc_music_volume'
        };
        const HISTORY_STORAGE_KEY = 'cc_sessions_v1';

        function loadSessionHistory() {
            try {
                const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
                const arr = raw ? JSON.parse(raw) : [];
                return Array.isArray(arr) ? arr : [];
            } catch (e) {
                console.warn('Impossible de charger l\'historique:', e);
                return [];
            }
        }

        function saveSessionHistory(list) {
            try {
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
            } catch (e) {
                console.warn('Impossible de sauvegarder l\'historique:', e);
            }
        }

        function addCompletedSessionToHistory(record) {
            const list = loadSessionHistory();
            list.push(record);
            // Garde une taille raisonnable (au cas où)
            const MAX = 5000;
            if (list.length > MAX) list.splice(0, list.length - MAX);
            saveSessionHistory(list);
        }

        function clearSessionHistory() {
            try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch (e) {}
        }

        function startOfDay(d) {
            const x = new Date(d);
            x.setHours(0,0,0,0);
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
            x.setMonth(0,1);
            return x;
        }

        function daysInMonth(d) {
            const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            return x.getDate();
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

            const avgPerSessionSec = count ? totalSec / count : 0;
            const avgPerDaySec = periodDays ? totalSec / periodDays : 0;

            return {
                totalSec,
                count,
                avgPerSessionSec,
                avgPerDaySec,
                totalBreaths,
                totalCycles
            };
        }


        // Fonction pour sauvegarder une préférence
        function savePreference(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('Impossible de sauvegarder la préférence:', e);
            }
        }

        // Fonction pour charger une préférence
        function loadPreference(key, defaultValue) {
            try {
                const value = localStorage.getItem(key);
                return value !== null ? value : defaultValue;
            } catch (e) {
                console.warn('Impossible de charger la préférence:', e);
                return defaultValue;
            }
        }
        
        // Initialize audio context on first user interaction (required for iOS)
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            // iOS requires resuming context on user interaction
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return audioContext;
        }


// 🎵 WebAudio routing for background music (reliable volume control + fade out)
function setupBackgroundMusicAudioGraph() {
    if (!backgroundAudio) return;

    // IMPORTANT iOS/Safari: quand l'ecran se verrouille, AudioContext peut etre suspendu
    // et couper la musique routée via WebAudio.
    // Pour garantir que la musique continue en veille (comme les sons inhale/exhale),
    // on utilise le <audio> natif sur iOS et on désactive le routage WebAudio.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        // Nettoyage des éventuels noeuds précédents
        try { if (backgroundSourceNode) backgroundSourceNode.disconnect(); } catch(e) {}
        try { if (backgroundGainNode) backgroundGainNode.disconnect(); } catch(e) {}
        backgroundSourceNode = null;
        backgroundGainNode = null;
        // Assure un volume cohérent via HTMLAudio
        setMusicVolumeFromUI();
        return;
    }

    const ctx = initAudioContext();

    // Some browsers only allow one MediaElementSource per <audio> element
    try {
        // If we already wired this element, keep existing nodes
        if (backgroundGainNode && backgroundSourceNode && backgroundSourceNode.mediaElement === backgroundAudio) {
            return;
        }
    } catch (e) {
        // ignore
    }

    // Cleanup previous nodes
    try { if (backgroundSourceNode) backgroundSourceNode.disconnect(); } catch(e) {}
    try { if (backgroundGainNode) backgroundGainNode.disconnect(); } catch(e) {}
    backgroundSourceNode = null;
    backgroundGainNode = null;

    try {
        backgroundSourceNode = ctx.createMediaElementSource(backgroundAudio);
        backgroundGainNode = ctx.createGain();
        backgroundGainNode.gain.value = parseInt(musicVolumeSlider.value) / 100;
        backgroundSourceNode.connect(backgroundGainNode);
        backgroundGainNode.connect(ctx.destination);
    } catch (e) {
        console.warn('Impossible de router la musique via WebAudio (fallback volume HTMLAudio):', e);
        backgroundSourceNode = null;
        backgroundGainNode = null;
    }
}

function setMusicVolumeFromUI() {
    const v = parseInt(musicVolumeSlider.value) / 100;
    if (backgroundGainNode) {
        try { backgroundGainNode.gain.value = v; } catch(e) {}
    }
    if (backgroundAudio) {
        // Sur iOS (HTMLAudio), c'est la voie principale ; sur desktop, c'est un fallback.
        try { backgroundAudio.volume = v; } catch(e) {}
    }
}

function fadeOutMusicAndStop(durationMs = 5000) {
    return new Promise((resolve) => {
        if (!backgroundAudio) return resolve();
        if (isFadingOut) return resolve();
        isFadingOut = true;

        // On mémorise le volume "normal" (celui du slider) pour le restaurer après le fondu.
        const targetVol = (parseInt(musicVolumeSlider?.value || '30', 10) / 100);

        const finish = () => {
            try { backgroundAudio.pause(); } catch(e) {}
            try { backgroundAudio.currentTime = 0; } catch(e) {}

            // Restaure le volume pour la prochaine lecture (sinon il reste à ~0 après le fondu)
            try { backgroundAudio.volume = targetVol; } catch(e) {}
            if (backgroundGainNode && audioContext) {
                try { backgroundGainNode.gain.value = targetVol; } catch(e) {}
            }

            isFadingOut = false;
            resolve();
        };

        if (backgroundGainNode && audioContext) {
            const now = audioContext.currentTime;
            const dur = Math.max(0.3, durationMs / 1000);
            try {
                // Start from current gain to avoid jumps
                const current = backgroundGainNode.gain.value;
                backgroundGainNode.gain.cancelScheduledValues(now);
                backgroundGainNode.gain.setValueAtTime(current, now);
                backgroundGainNode.gain.linearRampToValueAtTime(0.0001, now + dur);
                setTimeout(finish, durationMs + 50);
                return;
            } catch (e) {
                console.warn('Fade WebAudio impossible, fallback:', e);
            }
        }

        // Fallback: CSS-like fade using HTML volume
        const startVol = backgroundAudio.volume ?? (parseInt(musicVolumeSlider.value) / 100);
        const steps = 12;
        let step = 0;
        const interval = Math.max(30, Math.floor(durationMs / steps));
        const timer = setInterval(() => {
            step++;
            const t = step / steps;
            const vol = Math.max(0, startVol * (1 - t));
            try { backgroundAudio.volume = vol; } catch(e) {}
            if (step >= steps) {
                clearInterval(timer);
                finish();
            }
        }, interval);
    });
}
        
        

// 📦 Chargement optionnel des sons/musiques présents dans les dossiers du projet
// Nécessite un fichier ./assets/audio-manifest.json (généré automatiquement par un script)
async function loadBundledAudioManifest() {
    try {
        const res = await fetch('./assets/audio-manifest.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        // Ajout des sons inhale/exhale (uniquement wav + mp3)
        const isAllowedSfx = (name) => /\.(wav|mp3)$/i.test(name || '');

        const resetSelectToFirstOption = (selectEl) => {
            if (!selectEl) return;
            // Garde uniquement la première option (ex: "Aucun")
            while (selectEl.options.length > 1) {
                selectEl.remove(1);
            }
        };

        const addFileOptions = (selectEl, list, prefixLabel) => {
            if (!selectEl || !Array.isArray(list)) return;
            list
              .filter(isAllowedSfx)
              .forEach((fileName) => {
                const value = `${prefixLabel}:${fileName}`;
                if (selectEl.querySelector(`option[value="${value}"]`)) return;
                const opt = document.createElement('option');
                opt.value = value;
                opt.textContent = `${fileName}`;
                selectEl.appendChild(opt);
              });
        };

        // On remplace la liste par uniquement les fichiers présents dans les dossiers
        resetSelectToFirstOption(inhaleSoundSelect);
        resetSelectToFirstOption(exhaleSoundSelect);

        addFileOptions(inhaleSoundSelect, data.inhale, 'file-inhale');
        addFileOptions(exhaleSoundSelect, data.exhale, 'file-exhale');

        // Ajout des musiques (prêtes à sélectionner sans upload)
        if (Array.isArray(data.music) && data.music.length > 0) {
            data.music.forEach((fileName) => {
                const url = `./music/${encodeURIComponent(fileName)}`;
                // évite doublons par nom
                if (musicLibrary.some(m => m.name === fileName)) return;
                musicLibrary.push({ name: fileName, file: null, url, audio: null });
            });
            renderMusicLibrary();
            document.getElementById('musicLibrary').style.display = 'block';
            if (currentMusicIndex === -1 && musicLibrary.length > 0) {
                selectMusic(0);
            }
        }
    } catch (e) {
        // Silencieux: le manifest est optionnel
        console.log('Manifest audio non chargé (optionnel):', e.message);
    }
}

        // Sound synthesis functions
        function createBellSound(type = 'bell1', volumePercent = 70) {
            console.log(`🔔 createBellSound appelée: type=${type}, volume=${volumePercent}%`);
            
            if (!audioContext) {
                console.error('❌ Audio Context non initialisé');
                return;
            }
            
            console.log(`✅ Audio Context state: ${audioContext.state}`);
            
            const now = audioContext.currentTime;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different bell timbres
            const bellConfigs = {
                bell1: { freq: 432, q: 30, type: 'sine' }, // Tibetan
                bell2: { freq: 528, q: 40, type: 'sine' }, // Crystal
                bell3: { freq: 396, q: 25, type: 'triangle' }, // Singing bowl
                chime: { freq: 660, q: 35, type: 'sine' } // Soft chime
            };

            const config = bellConfigs[type] || bellConfigs.bell1;

            oscillator.type = config.type;
            oscillator.frequency.setValueAtTime(config.freq, now);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(config.freq, now);
            filter.Q.setValueAtTime(config.q, now);

            // Apply volume (convert percentage to amplitude)
            const amplitude = (volumePercent / 100) * 0.3;
            console.log(`🔊 Volume calculé: ${volumePercent}% → amplitude=${amplitude.toFixed(3)}`);
            
            gainNode.gain.setValueAtTime(amplitude, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);

            oscillator.start(now);
            oscillator.stop(now + 2);
            
            console.log(`✅ Son joué: freq=${config.freq}Hz, type=${config.type}`);
        }

        // State management
        let isRunning = false;
        let currentPhase = null;
        let sessionTimer = null;
        let phaseTimer = null;
        let totalTime = 0;
        let elapsedTime = 0;
        let cycleCount = 0;
        let breathCount = 0;
        let backgroundAudio = null;
        // WebAudio nodes for background music (volume + fade).
        let backgroundSourceNode = null;
        let backgroundGainNode = null;
        let isFadingOut = false;
        let customInhaleAudio = null;
        // Track currently playing SFX so volume sliders can act immediately
        const currentSfxAudio = { inhale: null, exhale: null };
        // Cached bundled sounds from /sounds folders (loaded via manifest)
        const bundledSoundCache = { inhale: new Map(), exhale: new Map() };
        let customExhaleAudio = null;
        let musicLibrary = []; // Array to store music files
        let currentMusicIndex = -1;
        let wakeLock = null; // Pour empêcher la mise en veille iOS
        let silentAudio = null; // Audio silencieux pour garder le contexte actif sur iOS

        // DOM elements
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

        // Fin de séance (message plein écran)
        const endScreenEl = document.getElementById('endScreen');
        const endScreenTitleEl = document.getElementById('endScreenTitle');
        const endScreenMsgEl = document.getElementById('endScreenMsg');

        // Phrases d'encouragement (affichées aléatoirement en fin de séance)
        const encouragementPhrases = [
            "Quelques minutes suffisent : ta régularité fait la différence.",
            "Bravo. À force de répéter, ton corps apprend à se calmer plus vite.",
            "Tu viens d’offrir une vraie pause à ton système nerveux. Continue comme ça.",
            "Belle séance. Respire comme ça régulièrement, et tu en ressentiras les effets au quotidien.",
            "Chaque séance est un petit entraînement vers plus de sérénité.",
            "Tu progresses. Reviens quand tu veux : même une courte séance compte."
        ];

        // Inputs
        const sessionDurationInput = document.getElementById('sessionDuration');
        const inhaleTimeInput = document.getElementById('inhaleTime');
        const exhaleTimeInput = document.getElementById('exhaleTime');
        const inhaleSoundSelect = document.getElementById('inhaleSound');
        const exhaleSoundSelect = document.getElementById('exhaleSound');
        const backgroundMusicInput = document.getElementById('backgroundMusic');
        const customInhaleFile = document.getElementById('customInhaleFile');
        const customExhaleFile = document.getElementById('customExhaleFile');
        
        // Volume controls
        const inhaleVolumeSlider = document.getElementById('inhaleVolume');
        const exhaleVolumeSlider = document.getElementById('exhaleVolume');
        const musicVolumeSlider = document.getElementById('musicVolume');
        const inhaleVolumeValue = document.getElementById('inhaleVolumeValue');
        const exhaleVolumeValue = document.getElementById('exhaleVolumeValue');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        const musicVolumeControl = document.getElementById('musicVolumeControl');

        // Update CSS variables
        function updateBreathingDurations() {
            const inhale = parseInt(inhaleTimeInput.value);
            const exhale = parseInt(exhaleTimeInput.value);
            document.documentElement.style.setProperty('--inhale-duration', `${inhale}s`);
            document.documentElement.style.setProperty('--exhale-duration', `${exhale}s`);
        }

        // Volume slider updates
        function handleVolumeChange(slider, valueDisplay, isMusic = false) {
            const value = slider.value;
            valueDisplay.textContent = `${value}%`;
            updateSliderBackground(slider, value);

            if (isMusic) {
                // Musique: applique immédiatement (HTMLAudio sur iOS, WebAudio ailleurs)
                if (backgroundAudio) {
                    try { backgroundAudio.volume = parseInt(value, 10) / 100; } catch (e) {}
                }
                setupBackgroundMusicAudioGraph();
                setMusicVolumeFromUI();
                return;
            }

            // SFX inhale/exhale: si un son est en cours, applique tout de suite
            const v = parseInt(value, 10) / 100;
            if (slider === inhaleVolumeSlider) {
                if (currentSfxAudio.inhale && !currentSfxAudio.inhale.paused) {
                    try { currentSfxAudio.inhale.volume = v; } catch (e) {}
                }
                if (customInhaleAudio && !customInhaleAudio.paused) {
                    try { customInhaleAudio.volume = v; } catch (e) {}
                }
            }
            if (slider === exhaleVolumeSlider) {
                if (currentSfxAudio.exhale && !currentSfxAudio.exhale.paused) {
                    try { currentSfxAudio.exhale.volume = v; } catch (e) {}
                }
                if (customExhaleAudio && !customExhaleAudio.paused) {
                    try { customExhaleAudio.volume = v; } catch (e) {}
                }
            }
        }

        // Add both 'input' and 'change' event listeners for better compatibility
        inhaleVolumeSlider.addEventListener('input', () => handleVolumeChange(inhaleVolumeSlider, inhaleVolumeValue));
        inhaleVolumeSlider.addEventListener('change', () => handleVolumeChange(inhaleVolumeSlider, inhaleVolumeValue));

        exhaleVolumeSlider.addEventListener('input', () => handleVolumeChange(exhaleVolumeSlider, exhaleVolumeValue));
        exhaleVolumeSlider.addEventListener('change', () => handleVolumeChange(exhaleVolumeSlider, exhaleVolumeValue));

        musicVolumeSlider.addEventListener('input', () => handleVolumeChange(musicVolumeSlider, musicVolumeValue, true));
        musicVolumeSlider.addEventListener('change', () => handleVolumeChange(musicVolumeSlider, musicVolumeValue, true));

        function updateSliderBackground(slider, value) {
            const percentage = parseFloat(value);
            slider.style.background = `linear-gradient(to right, 
                var(--secondary) 0%, 
                var(--secondary) ${percentage}%, 
                rgba(127, 169, 155, 0.2) ${percentage}%, 
                rgba(127, 169, 155, 0.2) 100%)`;
        }

        // Initialize slider backgrounds on page load
        function initSliders() {
            updateSliderBackground(inhaleVolumeSlider, inhaleVolumeSlider.value);
            updateSliderBackground(exhaleVolumeSlider, exhaleVolumeSlider.value);
            updateSliderBackground(musicVolumeSlider, musicVolumeSlider.value);
        }
        
        // Call init after DOM is ready
        setTimeout(initSliders, 100);

        // Custom sound handling
        inhaleSoundSelect.addEventListener('change', (e) => {
            document.getElementById('customInhaleUpload').style.display = 
                e.target.value === 'custom-inhale' ? 'block' : 'none';
        });

        exhaleSoundSelect.addEventListener('change', (e) => {
            document.getElementById('customExhaleUpload').style.display = 
                e.target.value === 'custom-exhale' ? 'block' : 'none';
        });

        customInhaleFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                if (customInhaleAudio) {
                    URL.revokeObjectURL(customInhaleAudio.src);
                }
                customInhaleAudio = new Audio(URL.createObjectURL(e.target.files[0]));
                customInhaleAudio.preload = 'auto';
                customInhaleAudio.load();
                document.getElementById('customInhaleName').textContent = e.target.files[0].name;
            }
        });

        customExhaleFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                if (customExhaleAudio) {
                    URL.revokeObjectURL(customExhaleAudio.src);
                }
                customExhaleAudio = new Audio(URL.createObjectURL(e.target.files[0]));
                customExhaleAudio.preload = 'auto';
                customExhaleAudio.load();
                document.getElementById('customExhaleName').textContent = e.target.files[0].name;
            }
        });

        backgroundMusicInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                // Add all selected files to the library
                Array.from(e.target.files).forEach(file => {
                    const musicObj = {
                        name: file.name,
                        file: file,
                        url: URL.createObjectURL(file),
                        audio: null
                    };
                    musicLibrary.push(musicObj);
                });
                
                renderMusicLibrary();
                document.getElementById('musicLibrary').style.display = 'block';
                
                // Auto-select first music if none selected
                if (currentMusicIndex === -1 && musicLibrary.length > 0) {
                    selectMusic(0);
                }
            }
        });

        function renderMusicLibrary() {
            const musicList = document.getElementById('musicList');
            musicList.innerHTML = '';
            
            musicLibrary.forEach((music, index) => {
                const musicItem = document.createElement('div');
                musicItem.className = 'music-item';
                if (index === currentMusicIndex) {
                    musicItem.classList.add('active');
                    if (backgroundAudio && !backgroundAudio.paused) {
                        musicItem.classList.add('playing');
                    }
                }
                
                musicItem.innerHTML = `
                    <span class="music-name" title="${music.name}">${music.name}</span>
                    <div class="music-controls">
                        <button class="music-btn" onclick="selectMusic(${index})" title="Sélectionner">▶</button>
                        <button class="music-btn" onclick="removeMusic(${index})" title="Supprimer">✕</button>
                    </div>
                `;
                
                musicList.appendChild(musicItem);
            });
        }

        window.selectMusic = function(index) {
            if (index < 0 || index >= musicLibrary.length) return;
            
            // Stop current music
            if (backgroundAudio) {
                // On ne fait pas de fondu ici : juste arrêt immédiat lors du changement de morceau.
                // (Le fondu est géré à la fin de la séance.)
                try {
                    backgroundAudio.pause();
                    backgroundAudio.currentTime = 0;
                } catch (e) {
                    console.warn('Impossible d\'arrêter la musique courante:', e);
                }
            }
            
            currentMusicIndex = index;
            const selectedMusic = musicLibrary[index];
            
            // Create or reuse audio element
            if (!selectedMusic.audio) {
                selectedMusic.audio = new Audio(selectedMusic.url);
                selectedMusic.audio.loop = true;
                selectedMusic.audio.volume = parseInt(musicVolumeSlider.value) / 100;
                selectedMusic.audio.preload = 'auto';
                selectedMusic.audio.load();
            }
            
            backgroundAudio = selectedMusic.audio;
            setupBackgroundMusicAudioGraph();
            setMusicVolumeFromUI();
            
            document.getElementById('musicFileName').textContent = `Sélectionnée: ${selectedMusic.name}`;
            musicVolumeControl.style.display = 'flex';
            
            renderMusicLibrary();
            
            // Auto-play if session is running
            if (isRunning) {
                const playPromise = backgroundAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.log('Music play prevented:', e));
                }
            }
        };

        window.removeMusic = function(index) {
            if (index < 0 || index >= musicLibrary.length) return;
            
            // Stop and cleanup if this is the current music
            if (index === currentMusicIndex) {
                if (backgroundAudio) {
                    backgroundAudio.pause();
                }
                backgroundAudio = null;
                currentMusicIndex = -1;
                document.getElementById('musicFileName').textContent = '';
                musicVolumeControl.style.display = 'none';
            }
            
            // Revoke URL to free memory
            URL.revokeObjectURL(musicLibrary[index].url);
            
            // Remove from library
            musicLibrary.splice(index, 1);
            
            // Adjust current index if needed
            if (currentMusicIndex > index) {
                currentMusicIndex--;
            }
            
            // Hide library if empty
            if (musicLibrary.length === 0) {
                document.getElementById('musicLibrary').style.display = 'none';
            }
            
            renderMusicLibrary();
        };

        // Lecture des sons inhale/exhale
        // Objectif: éviter les "sauts" (iOS/Safari) et permettre inhale/exhale simultanés.
        // Pour cela, on joue un *nouvel* élément Audio à chaque déclenchement.
        function playSound(phase) {
            const soundType = (phase === 'inhale') ? inhaleSoundSelect.value : exhaleSoundSelect.value;
            const volume = (phase === 'inhale') ? parseInt(inhaleVolumeSlider.value, 10) : parseInt(exhaleVolumeSlider.value, 10);

            // Aucun son
            if (!soundType || soundType === 'none') return;

            const vol = Math.max(0, Math.min(1, volume / 100));

            // Construit l'URL source du son
            let src = null;

            if (soundType.startsWith('custom-')) {
                // Son importé localement (file input)
                const base = (phase === 'inhale') ? customInhaleAudio : customExhaleAudio;
                if (base && base.src) src = base.src;
            } else if (soundType.startsWith('file-inhale:') || soundType.startsWith('file-exhale:')) {
                // Son depuis le dossier /sounds/{inhale|exhale}
                const fileName = soundType.split(':').slice(1).join(':');
                const folder = (phase === 'inhale') ? 'inhale' : 'exhale';
                src = `./sounds/${folder}/${encodeURIComponent(fileName)}`;
            }

            if (!src) {
                console.log(`⚠️ Pas de source audio pour ${phase}`);
                return;
            }

            // 🔧 SOLUTION iOS : Réutiliser le même Audio() au lieu d'en créer un nouveau
            let audio = currentSfxAudio[phase];
            
            // Vérifier si on doit créer un nouveau Audio
            // Normaliser les URLs pour la comparaison (iOS renvoie URL absolue)
            const needNewAudio = !audio || !audio.src || !audio.src.includes(src.split('/').pop());
            
            if (needNewAudio) {
                console.log(`📦 Création nouvel Audio pour ${phase} (src: ${src})`);
                audio = new Audio();
                audio.preload = 'auto';
                audio.src = src;
                
                // Événement important pour iOS
                audio.addEventListener('loadeddata', () => {
                    console.log(`✅ Audio ${phase} chargé et prêt`);
                });
                
                audio.addEventListener('error', (e) => {
                    console.log(`❌ Erreur chargement ${phase}:`, e);
                });
                
                currentSfxAudio[phase] = audio;
            }

            // 🛑 ARRÊTER et RESET le son avant de le rejouer
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = vol;
                console.log(`🔄 Reset son ${phase} (volume: ${vol}, src: ${audio.src})`);
            } catch (e) {
                console.log(`⚠️ Erreur reset ${phase}:`, e);
            }

            // ▶️ JOUER le son - CRITIQUE pour iOS
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`✅ Son ${phase} JOUE maintenant (volume: ${vol})`);
                }).catch(e => {
                    console.error(`❌ BLOQUÉ ${phase}:`, e.name, e.message);
                    // iOS peut bloquer - essayer de débloquer l'audio context
                    if (audioContext && audioContext.state === 'suspended') {
                        audioContext.resume().then(() => {
                            console.log('🔓 Audio Context repris, réessai...');
                            audio.play().catch(err => console.error('Réessai échoué:', err));
                        });
                    }
                });
            }
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function updateProgress() {
            const progress = (elapsedTime / totalTime) * 100;
            progressFill.style.width = `${progress}%`;
            timerDisplay.textContent = formatTime(totalTime - elapsedTime);
        }

        function startInhale() {
            currentPhase = 'inhale';
            breathingCircle.className = 'breathing-circle inhale';
            breathText.textContent = 'Inspirez';
            breathText.classList.add('visible');
            playSound('inhale');
            breathCount++;
            breathCountDisplay.textContent = breathCount;

            const inhaleTime = parseInt(inhaleTimeInput.value) * 1000;
            phaseTimer = setTimeout(startExhale, inhaleTime);
        }

        function startExhale() {
            currentPhase = 'exhale';
            breathingCircle.className = 'breathing-circle exhale';
            breathText.textContent = 'Expirez';
            playSound('exhale');
            cycleCount++;
            cycleCountDisplay.textContent = cycleCount;

            const exhaleTime = parseInt(exhaleTimeInput.value) * 1000;
            phaseTimer = setTimeout(() => {
                if (isRunning) {
                    startInhale();
                }
            }, exhaleTime);
        }

        function startSession() {
            if (isRunning) return;

            // Cacher l'écran de fin de séance
            const endScreenEl = document.getElementById('endScreen');
            if (endScreenEl) {
                endScreenEl.classList.remove('show');
                endScreenEl.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.remove('modal-open');

            // Initialize and resume audio context (critical for iOS Safari)
            initAudioContext();

            isRunning = true;
            breathingZone.classList.add('active');
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';

            // Reset counters
            cycleCount = 0;
            breathCount = 0;
            elapsedTime = 0;
            cycleCountDisplay.textContent = '0';
            breathCountDisplay.textContent = '0';

            // Calculate total time
            totalTime = parseInt(sessionDurationInput.value) * 60;
            updateBreathingDurations();

            // ⚡ EMPÊCHER LA MISE EN VEILLE (Wake Lock API)
            if ('wakeLock' in navigator) {
                navigator.wakeLock.request('screen')
                    .then(lock => {
                        wakeLock = lock;
                        console.log('✅ Wake Lock activé - écran restera allumé');
                        
                        // Gérer la réactivation si l'écran se rallume
                        wakeLock.addEventListener('release', () => {
                            console.log('⚠️ Wake Lock libéré');
                        });
                    })
                    .catch(err => {
                        console.log('⚠️ Wake Lock non disponible:', err.message);
                    });
            } else {
                console.log('⚠️ Wake Lock API non supportée sur ce navigateur');
            }

            // 🔊 SOLUTION iOS : Jouer un son silencieux en boucle pour garder l'audio actif
            // Ceci empêche iOS de suspendre l'Audio Context
            if (!silentAudio) {
                // Créer un fichier audio silencieux (1 seconde de silence en WAV base64)
                const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
                silentAudio = new Audio(silentWav);
                silentAudio.loop = true;
                silentAudio.volume = 0; // Volume à 0 pour qu'on ne l'entende pas
            }
            
            // Jouer le son silencieux
            const silentPromise = silentAudio.play();
            if (silentPromise !== undefined) {
                silentPromise
                    .then(() => {
                        console.log('✅ Audio silencieux en boucle - garde iOS actif');
                    })
                    .catch(e => {
                        console.log('⚠️ Audio silencieux bloqué:', e.message);
                    });
            }

            // 🔊 S'ASSURER QUE L'AUDIO CONTEXT RESTE ACTIF
            if (audioContext) {
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        console.log('✅ Audio Context repris');
                    });
                }
                console.log(`🎵 Audio Context state: ${audioContext.state}`);
            }

            // Start background music with iOS compatibility
            if (backgroundAudio) {
                setupBackgroundMusicAudioGraph();
                setMusicVolumeFromUI();
                backgroundAudio.currentTime = 0;
                const playPromise = backgroundAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.log('Background music prevented:', e);
                    });
                }
                // Update UI to show playing state
                renderMusicLibrary();
            }

            // Start breathing
            startInhale();

            // Session timer
            sessionTimer = setInterval(() => {
                elapsedTime++;
                updateProgress();

                if (elapsedTime >= totalTime) {
                    stopSession(true);
                }
            }, 1000);
        }

        async function stopSession(completed = false) {
            isRunning = false;
            breathingZone.classList.remove('active');
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';

            clearTimeout(phaseTimer);
            clearInterval(sessionTimer);

            breathingCircle.className = 'breathing-circle';
            breathText.classList.remove('visible');
            breathText.textContent = '';

            // 🎵 Fin de séance: fondu + arrêt (uniquement si la séance se termine normalement)
            if (completed) {
                // Sauvegarde dans l'historique uniquement si la séance est terminée
                try {
                    addCompletedSessionToHistory({
                        endedAt: new Date().toISOString(),
                        durationSec: totalTime,
                        breaths: breathCount,
                        cycles: cycleCount
                    });
                } catch (e) {
                    console.warn('Impossible d\'enregistrer la séance:', e);
                }

                // Fondu musique sur 5 secondes
                await fadeOutMusicAndStop(5000);
            } else if (backgroundAudio) {
                try { backgroundAudio.pause(); } catch(e) {}
                try { backgroundAudio.currentTime = 0; } catch(e) {}
            }
            
            // Arrêter le son silencieux
            if (silentAudio) {
                silentAudio.pause();
                silentAudio.currentTime = 0;
                console.log('🔇 Audio silencieux arrêté');
            }

            progressFill.style.width = '0%';
            timerDisplay.textContent = '00:00';

            // Écran de fin de séance (si la séance est allée au bout)
            if (endScreenEl) {
                if (completed) {
                    // Titre + message aléatoire
                    if (endScreenTitleEl) endScreenTitleEl.textContent = "Te voilà détendu(e)";
                    if (endScreenMsgEl) {
                        const msg = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
                        endScreenMsgEl.textContent = msg;
                    }

                    endScreenEl.classList.add('show');
                    endScreenEl.setAttribute('aria-hidden', 'false');
                    document.body.classList.add('modal-open');
                } else {
                    endScreenEl.classList.remove('show');
                    endScreenEl.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                }
            }
            
            // 🔓 LIBÉRER LE WAKE LOCK
            if (wakeLock) {
                wakeLock.release()
                    .then(() => {
                        console.log('✅ Wake Lock libéré - écran peut se mettre en veille');
                        wakeLock = null;
                    })
                    .catch(err => {
                        console.log('⚠️ Erreur libération Wake Lock:', err.message);
                    });
            }
            
            // Update music library display
            renderMusicLibrary();
        }



        function buildHistoryTile(title, stats) {
            const div = document.createElement('div');
            div.className = 'history-tile';
            div.innerHTML = `
              <h3>${title}</h3>
              <div class="history-metrics">
                <div class="history-metric"><span class="k">Total</span><span class="v">${formatDuration(stats.totalSec)}</span></div>
                <div class="history-metric"><span class="k">Séances</span><span class="v">${stats.count}</span></div>
                <div class="history-metric"><span class="k">Moyenne / jour</span><span class="v">${formatDuration(stats.avgPerDaySec)}</span></div>
                <div class="history-metric"><span class="k">Moyenne / séance</span><span class="v">${formatDuration(stats.avgPerSessionSec)}</span></div>
              </div>
            `;
            return div;
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
            const yearDays = ((new Date(now.getFullYear()+1,0,1) - new Date(now.getFullYear(),0,1)) / (1000*60*60*24)) || 365;
            const yearStats = computeStatsForRange(sessions, yearStart, yearEnd, yearDays);

            historyGrid.innerHTML = '';
            historyGrid.appendChild(buildHistoryTile("Aujourd’hui", dayStats));
            historyGrid.appendChild(buildHistoryTile("Cette semaine", weekStats));
            historyGrid.appendChild(buildHistoryTile("Ce mois", monthStats));
            historyGrid.appendChild(buildHistoryTile("Cette année", yearStats));
        }

        function openHistory() {
            if (!historyPanel) return;
            renderHistory();
            historyPanel.classList.add('show');
            historyPanel.setAttribute('aria-hidden', 'false');
            if (historyBtn) historyBtn.setAttribute('aria-expanded', 'true');
        }

        function closeHistory() {
            if (!historyPanel) return;
            historyPanel.classList.remove('show');
            historyPanel.setAttribute('aria-hidden', 'true');
            if (historyBtn) historyBtn.setAttribute('aria-expanded', 'false');
        }

        function toggleHistory() {
            if (!historyPanel) return;
            const isOpen = historyPanel.classList.contains('show');
            if (isOpen) closeHistory();
            else openHistory();
        }

        startBtn.addEventListener('click', startSession);
        stopBtn.addEventListener('click', stopSession);

        // Bouton "Nouvelle séance" sur l'écran de fin
        const endScreenCloseBtn = document.getElementById('endScreenCloseBtn');
        if (endScreenCloseBtn) {
            endScreenCloseBtn.addEventListener('click', () => {
                const endScreenEl = document.getElementById('endScreen');
                if (endScreenEl) {
                    endScreenEl.classList.remove('show');
                    endScreenEl.setAttribute('aria-hidden', 'true');
                }
                document.body.classList.remove('modal-open');
                // Réaffiche le bon temps (au cas où)
                if (!isRunning) {
                    timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value) * 60);
                }
            });
        }

        // Historique
        if (historyBtn) {
            historyBtn.addEventListener('click', () => toggleHistory());
        }
        if (historyCloseBtn) {
            historyCloseBtn.addEventListener('click', () => closeHistory());
        }
        // plus de clic "hors fenêtre" : l'historique est un panneau inline
        if (historyResetBtn) {
            historyResetBtn.addEventListener('click', () => {
                const ok = confirm("Effacer tout l’historique ?\n\nCette action est irréversible.");
                if (!ok) return;
                clearSessionHistory();
                renderHistory();
            });
        }

        // Initialize audio on first touch/click (required for iOS)
        document.addEventListener('touchstart', function initTouch() {
            initAudioContext();
            document.removeEventListener('touchstart', initTouch);
        }, { once: true });

        document.addEventListener('click', function initClick() {
            initAudioContext();
            document.removeEventListener('click', initClick);
        }, { once: true });

        // Charger les préférences sauvegardées
        function loadSavedPreferences() {
            sessionDurationInput.value = loadPreference(STORAGE_KEYS.SESSION_DURATION, '5');
            inhaleTimeInput.value = loadPreference(STORAGE_KEYS.INHALE_TIME, '5');
            exhaleTimeInput.value = loadPreference(STORAGE_KEYS.EXHALE_TIME, '5');
            inhaleSoundSelect.value = loadPreference(STORAGE_KEYS.INHALE_SOUND, 'bell1');
            exhaleSoundSelect.value = loadPreference(STORAGE_KEYS.EXHALE_SOUND, 'bell1');
            inhaleVolumeSlider.value = loadPreference(STORAGE_KEYS.INHALE_VOLUME, '70');
            exhaleVolumeSlider.value = loadPreference(STORAGE_KEYS.EXHALE_VOLUME, '70');
            musicVolumeSlider.value = loadPreference(STORAGE_KEYS.MUSIC_VOLUME, '30');
            inhaleVolumeValue.textContent = inhaleVolumeSlider.value + '%';
            exhaleVolumeValue.textContent = exhaleVolumeSlider.value + '%';
            musicVolumeValue.textContent = musicVolumeSlider.value + '%';
            updateSliderBackground(inhaleVolumeSlider, inhaleVolumeSlider.value);
            updateSliderBackground(exhaleVolumeSlider, exhaleVolumeSlider.value);
            updateSliderBackground(musicVolumeSlider, musicVolumeSlider.value);
        }

        // Sauvegarder automatiquement les préférences
        sessionDurationInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.SESSION_DURATION, e.target.value));
        inhaleTimeInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.INHALE_TIME, e.target.value));
        exhaleTimeInput.addEventListener('change', (e) => savePreference(STORAGE_KEYS.EXHALE_TIME, e.target.value));
        inhaleSoundSelect.addEventListener('change', (e) => {
            savePreference(STORAGE_KEYS.INHALE_SOUND, e.target.value);
            // Aperçu immédiat du son sélectionné (sans attendre le prochain cycle)
            try {
                const v = e.target.value;
                if (v !== 'custom-inhale' || customInhaleAudio) {
                    playSound('inhale');
                }
            } catch (_) {}
        });
        exhaleSoundSelect.addEventListener('change', (e) => {
            savePreference(STORAGE_KEYS.EXHALE_SOUND, e.target.value);
            // Aperçu immédiat du son sélectionné (sans attendre le prochain cycle)
            try {
                const v = e.target.value;
                if (v !== 'custom-exhale' || customExhaleAudio) {
                    playSound('exhale');
                }
            } catch (_) {}
        });
        inhaleVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.INHALE_VOLUME, e.target.value));
        exhaleVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.EXHALE_VOLUME, e.target.value));
        musicVolumeSlider.addEventListener('change', (e) => savePreference(STORAGE_KEYS.MUSIC_VOLUME, e.target.value));

        // Initialize - Charger les préférences sauvegardées
        loadSavedPreferences();
        loadBundledAudioManifest();
        updateBreathingDurations();
        timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value) * 60);

        sessionDurationInput.addEventListener('input', () => {
            if (!isRunning) {
                timerDisplay.textContent = formatTime(parseInt(sessionDurationInput.value) * 60);
            }
        });