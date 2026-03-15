/* =========================================
   NEET Peace Study Companion - SPA Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Setup ---
    const SUPABASE_URL = 'https://zdljjubgmstlzhcguwfb.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_UTejG46XvWjTsjzZAo6UmQ_LaXm3YSr';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- State & Constants ---
    const TARGET_DATE = new Date("May 4, 2026 00:00:00").getTime();

    const MOTIVATIONS = [
        "Just one page at a time.",
        "Consistency beats pressure.",
        "You are closer than you think.",
        "Breathe. Focus. Execute.",
        "Small steps every day.",
        "Your future self will thank you.",
        "Calm mind, sharp focus."
    ];

    const FLASHCARDS = {
        physics: [
            { f: "Newton's Second Law", b: "F = dp/dt (or F = ma for constant mass)" },
            { f: "Work-Energy Theorem", b: "W_net = ΔK (Change in Kinetic Energy)" },
            { f: "Ohm's Law", b: "V = IR" },
            { f: "De Broglie Wavelength", b: "λ = h / p" },
            { f: "Capacitance", b: "C = Q / V" }
        ],
        organic: [
            { f: "Markovnikov's Rule", b: "In addition reactions, the H atom adds to the carbon with more hydrogen atoms." },
            { f: "Friedel-Crafts Alkylation", b: "Benzene + R-X + AlCl3 → Alkylbenzene" },
            { f: "Aldol Condensation", b: "Requires aldehydes/ketones with α-hydrogen." },
            { f: "Cannizzaro Reaction", b: "No α-hydrogens. Disproportionation into acid & alcohol." },
            { f: "Ozonolysis of Alkenes", b: "Cleaves C=C bond to form carbonyl compounds." }
        ],
        biology: [
            { f: "Mitochondria", b: "Site of aerobic respiration, produces ATP." },
            { f: "Meiosis Prophase I", b: "Crossing over occurs during pachytene stage." },
            { f: "Ribosomes", b: "Site of protein synthesis." },
            { f: "Blood Types", b: "AB is universal recipient. O is universal donor." },
            { f: "Photosynthesis Light Reaction", b: "Occurs in thylakoid membrane. Produces ATP and NADPH." }
        ],
        inorganic: [
            { f: "Atomic Radius Trend", b: "Decreases across a period, increases down a group." },
            { f: "Electronegativity Trend", b: "Increases across a period, decreases down a group." },
            { f: "Coordination Number", b: "Number of ligand donor atoms attached to central metal ion." },
            { f: "Haber Process Catalyst", b: "Finely divided Iron (Fe) with Molybdenum promoter." },
            { f: "Oxidation State of Oxygen", b: "Usually -2. In peroxides -1." }
        ]
    };

    let state = {
        theme: localStorage.getItem('neet_theme') || 'light',
        missions: JSON.parse(localStorage.getItem('neet_missions')) || [],
        stats: JSON.parse(localStorage.getItem('neet_stats')) || { focusSessions: 0, tasksCompleted: 0, lastDate: new Date().toDateString() },

        timerInterval: null,
        timeLeft: 25 * 60,
        totalTime: 25 * 60,
        isFocusing: false,

        currentTopic: null,
        currentCardIndex: 0,

        user: null, // Track Supabase logged-in user

        audioCtx: null,
        noiseNode: null,
        filterNode: null,
        isNoisePlaying: false
    };

    // --- DOM Elements ---
    const el = {
        themeToggle: document.getElementById('themeToggle'),
        countdownDaysSmall: document.getElementById('countdownDaysSmall'),
        motivationText: document.getElementById('motivationText'),

        navBtns: document.querySelectorAll('.nav-btn'),
        views: document.querySelectorAll('.view-section'),

        timerDisplay: document.getElementById('timerDisplay'),
        timerMode: document.getElementById('timerMode'),
        startStudyBtn: document.getElementById('startStudyBtn'),
        stopStudyBtn: document.getElementById('stopStudyBtn'),
        timerProgressRing: document.getElementById('timerProgressRing'),

        distractionOverlay: document.getElementById('distractionLockOverlay'),
        distractionTimer: document.getElementById('distractionTimer'),
        exitDistractionBtn: document.getElementById('exitDistractionBtn'),

        newMissionInput: document.getElementById('newMissionInput'),
        missionSubject: document.getElementById('missionSubject'),
        addMissionBtn: document.getElementById('addMissionBtn'),
        missionList: document.getElementById('missionList'),

        bioProgress: document.getElementById('bioProgress'),
        phyProgress: document.getElementById('phyProgress'),
        chemProgress: document.getElementById('chemProgress'),
        bioProgressText: document.getElementById('bioProgressText'),
        phyProgressText: document.getElementById('phyProgressText'),
        chemProgressText: document.getElementById('chemProgressText'),

        panicBtn: document.getElementById('panicBtn'),
        panicOverlay: document.getElementById('panicOverlay'),
        exitPanicBtn: document.getElementById('exitPanicBtn'),
        breathingText: document.getElementById('breathingText'),
        breathingCircle: document.getElementById('breathingCircle'),

        noiseToggleBtns: document.querySelectorAll('.noise-toggle'),

        revisionBtns: document.querySelectorAll('.revision-btn'),
        revisionOverlay: document.getElementById('revisionOverlay'),
        closeRevisionBtn: document.getElementById('closeRevisionBtn'),
        fcFront: document.getElementById('fcFront'),
        fcBack: document.getElementById('fcBack'),
        flashcard: document.querySelector('.flashcard'),
        prevCardBtn: document.getElementById('prevCardBtn'),
        nextCardBtn: document.getElementById('nextCardBtn'),
        cardCounter: document.getElementById('cardCounter'),
        revisionModalTitle: document.getElementById('revisionModalTitle'),

        // Summary
        summaryOverlay: document.getElementById('summaryOverlay'),
        finishDayBtn: document.getElementById('finishDayBtn'),
        summaryFocusHours: document.getElementById('summaryFocusHours'),

        // Auth
        authToggleBtn: document.getElementById('authToggleBtn'),
        authToggleText: document.getElementById('authToggleText'),
        authOverlay: document.getElementById('authOverlay'),
        closeAuthBtn: document.getElementById('closeAuthBtn'),
        authTitle: document.getElementById('authTitle'),
        authForm: document.getElementById('authForm'),
        authEmail: document.getElementById('authEmail'),
        authPassword: document.getElementById('authPassword'),
        authSubmitBtn: document.getElementById('authSubmitBtn'),
        authErrorMsg: document.getElementById('authErrorMsg'),
        loggedInView: document.getElementById('loggedInView'),
        logoutBtn: document.getElementById('logoutBtn')
    };

    // --- Initialization ---
    async function init() {
        // Attempt to fetch existing user session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            state.user = session.user;
            await loadCloudData();
            updateAuthUI();
        }

        checkDailyReset();
        applyTheme(state.theme);
        updateCountdown();
        setRandomMotivation();
        renderMissions();
        updateProgressBars();

        // Navigation (SPA Tabs)
        el.navBtns.forEach(btn => btn.addEventListener('click', handleNavigation));

        // Event Listeners
        el.themeToggle.addEventListener('click', toggleTheme);
        el.addMissionBtn.addEventListener('click', addMission);
        el.newMissionInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addMission(); });

        // Timer
        el.timerMode.addEventListener('change', handleTimerModeChange);
        el.startStudyBtn.addEventListener('click', startFocusSession);
        el.stopStudyBtn.addEventListener('click', stopFocusSession);
        el.exitDistractionBtn.addEventListener('click', stopFocusSession);

        // Audio
        el.noiseToggleBtns.forEach(btn => btn.addEventListener('click', toggleNoise));

        // Panic
        el.panicBtn.addEventListener('click', openPanicMode);
        el.exitPanicBtn.addEventListener('click', closePanicMode);

        // Flashcards
        el.revisionBtns.forEach(btn => btn.addEventListener('click', (e) => openRevisionMode(e.currentTarget.dataset.topic)));
        el.closeRevisionBtn.addEventListener('click', closeRevisionMode);
        el.flashcard.addEventListener('click', () => el.flashcard.classList.toggle('flipped'));
        el.prevCardBtn.addEventListener('click', prevCard);
        el.nextCardBtn.addEventListener('click', nextCard);

        // Summary
        el.finishDayBtn.addEventListener('click', () => el.summaryOverlay.classList.add('hidden'));

        // Auth Listeners
        if (el.authToggleBtn) el.authToggleBtn.addEventListener('click', openAuthModal);
        if (el.closeAuthBtn) el.closeAuthBtn.addEventListener('click', closeAuthModal);
        if (el.authForm) el.authForm.addEventListener('submit', handleAuthSubmit);
        if (el.logoutBtn) el.logoutBtn.addEventListener('click', handleLogout);

        // Anti-refresh protection during focus mode
        window.addEventListener('beforeunload', (e) => {
            if (state.isFocusing) {
                e.preventDefault();
                e.returnValue = 'You have an active focus session. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        handleTimerModeChange();
    }

    // --- Navigation (SPA Logic) ---
    function handleNavigation(e) {
        const targetId = e.currentTarget.dataset.target;

        // Update Buttons
        el.navBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update Views
        el.views.forEach(view => {
            if (view.id === targetId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
    }

    // --- Utility & Daily Reset ---
    async function checkDailyReset() {
        const today = new Date().toDateString();
        if (state.stats.lastDate !== today) {
            state.stats = { focusSessions: 0, tasksCompleted: 0, lastDate: today };
            state.missions = state.missions.filter(m => !m.completed);
            await saveData();
        }
    }

    async function saveData() {
        // Always save to localStorage as a backup / offline mode
        localStorage.setItem('neet_missions', JSON.stringify(state.missions));
        localStorage.setItem('neet_stats', JSON.stringify(state.stats));

        // If logged in, sync to Supabase
        if (state.user) {
            try {
                // Upsert Profile Stats
                await supabase.from('profiles').upsert({
                    id: state.user.id,
                    focus_sessions: state.stats.focusSessions,
                    tasks_completed: state.stats.tasksCompleted,
                    last_active_date: state.stats.lastDate
                });

                // Clear remote missions and insert current active ones
                // (Optimization: in a massive app we'd sync individually, but for a daily to-do this full overwrite is safer and easier to maintain perfectly in sync)
                await supabase.from('missions').delete().eq('user_id', state.user.id);

                if (state.missions.length > 0) {
                    const missionsToInsert = state.missions.map(m => ({
                        id: String(m.id), // Ensure uuid or string format
                        user_id: state.user.id,
                        text: m.text,
                        subject: m.subject,
                        completed: m.completed
                    }));
                    await supabase.from('missions').insert(missionsToInsert);
                }
            } catch (err) {
                console.error("Error syncing to Supabase:", err);
            }
        }
    }

    async function loadCloudData() {
        try {
            // Load stats
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
            if (profile) {
                state.stats = {
                    focusSessions: profile.focus_sessions,
                    tasksCompleted: profile.tasks_completed,
                    lastDate: profile.last_active_date || new Date().toDateString()
                };
            }

            // Load missions
            const { data: missions } = await supabase.from('missions').select('*').eq('user_id', state.user.id);
            if (missions) {
                state.missions = missions.map(m => ({
                    id: m.id,
                    text: m.text,
                    subject: m.subject,
                    completed: m.completed
                }));
            }
        } catch (err) {
            console.error("Error loading from Supabase:", err);
        }
    }

    // --- Supabase Auth UI Logic ---
    function openAuthModal() {
        updateAuthUI();
        el.authOverlay.classList.remove('hidden');
    }

    function closeAuthModal() {
        el.authOverlay.classList.add('hidden');
        el.authErrorMsg.classList.add('hidden');
        el.authErrorMsg.textContent = '';
    }

    function updateAuthUI() {
        if (!el.authToggleText) return;

        if (state.user) {
            el.authToggleText.textContent = "Cloud Sync On";
            el.authForm.classList.add('hidden');
            el.loggedInView.classList.remove('hidden');
            el.authToggleBtn.querySelector('i').classList.add('active'); // Optional glow
        } else {
            el.authToggleText.textContent = "Offline Mode";
            el.authForm.classList.remove('hidden');
            el.loggedInView.classList.add('hidden');
        }
    }

    async function handleAuthSubmit(e) {
        e.preventDefault();
        el.authErrorMsg.classList.add('hidden');
        const email = el.authEmail.value.trim();
        const password = el.authPassword.value.trim();

        el.authSubmitBtn.textContent = 'Processing...';

        try {
            // Attempt Sign In first
            let { data, error } = await supabase.auth.signInWithPassword({ email, password });

            // If sign in fails due to invalid credentials, attempt sign up
            if (error) {
                if (error.message.includes("Invalid login")) {
                    const signUpRes = await supabase.auth.signUp({ email, password });
                    data = signUpRes.data;
                    error = signUpRes.error;

                    if (!error && data.user) {
                        // Some configurations require email confirmation
                        if (data.session == null) {
                            throw new Error("Signup successful. Please check your email to confirm.");
                        }
                    }
                }

                if (error) throw error;
            }

            // Success
            state.user = data.user;
            await loadCloudData(); // Load any cloud data they had
            await saveData();      // Or instantly push their local data if they are new

            updateAuthUI();
            renderMissions();
            updateProgressBars();

            el.authSubmitBtn.textContent = 'Success!';
            setTimeout(closeAuthModal, 1000);

        } catch (err) {
            el.authErrorMsg.textContent = err.message || "An error occurred.";
            el.authErrorMsg.classList.remove('hidden');
            el.authSubmitBtn.textContent = 'Sign In / Sign Up';
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        state.user = null;
        updateAuthUI();
        closeAuthModal();
        // Option to clear local state here, or let them keep working on local copy
    }

    // --- UI Basics ---
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('neet_theme', state.theme);
        applyTheme(state.theme);
    }

    function applyTheme(theme) {
        const icon = el.themeToggle.querySelector('i');
        const text = el.themeToggle.querySelector('span');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            icon.className = 'fa-solid fa-sun';
            text.textContent = 'Light Mode';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            icon.className = 'fa-solid fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = TARGET_DATE - now;
        if (distance < 0) {
            el.countdownDaysSmall.textContent = "0";
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        el.countdownDaysSmall.textContent = days;
    }

    function setRandomMotivation() {
        const rand = Math.floor(Math.random() * MOTIVATIONS.length);
        if (el.motivationText) {
            el.motivationText.textContent = `"${MOTIVATIONS[rand]}"`;
        }
    }

    // --- Timer Logic ---
    function handleTimerModeChange() {
        if (state.isFocusing) return;
        const mins = parseInt(el.timerMode.value);
        state.timeLeft = mins * 60;
        state.totalTime = mins * 60;
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const mins = Math.floor(state.timeLeft / 60);
        const secs = state.timeLeft % 60;
        const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        el.timerDisplay.textContent = timeString;
        el.distractionTimer.textContent = timeString;

        // Update Ring (radius 140 = 879 circumference)
        const dasharray = 879;
        const progress = state.timeLeft / state.totalTime;
        const offset = dasharray - (progress * dasharray);
        el.timerProgressRing.style.strokeDashoffset = offset;
    }

    function startFocusSession() {
        if (state.isFocusing) return;

        state.isFocusing = true;
        el.startStudyBtn.classList.add('hidden');
        el.stopStudyBtn.classList.remove('hidden');
        el.timerMode.disabled = true;

        el.distractionOverlay.classList.remove('hidden');

        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            updateTimerDisplay();

            if (state.timeLeft <= 0) {
                completeFocusSession();
            }
        }, 1000);
    }

    function stopFocusSession() {
        clearInterval(state.timerInterval);
        state.isFocusing = false;

        el.startStudyBtn.classList.remove('hidden');
        el.stopStudyBtn.classList.add('hidden');
        el.timerMode.disabled = false;
        el.distractionOverlay.classList.add('hidden');

        handleTimerModeChange();
    }

    function completeFocusSession() {
        stopFocusSession();
        playChime();
        state.stats.focusSessions++;
        saveData();
        showSummaryModal();
    }

    function playChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2);
        } catch (e) { }
    }

    // --- Missions Logic ---
    function addMission() {
        const text = el.newMissionInput.value.trim();
        const subject = el.missionSubject.value;
        if (!text) return;

        const mission = { id: Date.now(), text, subject, completed: false };
        state.missions.push(mission);
        saveData();
        el.newMissionInput.value = '';
        renderMissions();
        updateProgressBars();
    }

    function toggleMission(id) {
        const mission = state.missions.find(m => m.id === id);
        if (mission) {
            mission.completed = !mission.completed;
            if (mission.completed) state.stats.tasksCompleted++;
            else state.stats.tasksCompleted = Math.max(0, state.stats.tasksCompleted - 1);
            saveData(); renderMissions(); updateProgressBars();
        }
    }

    function deleteMission(id) {
        state.missions = state.missions.filter(m => m.id !== id);
        saveData(); renderMissions(); updateProgressBars();
    }

    function renderMissions() {
        el.missionList.innerHTML = '';
        state.missions.forEach(mission => {
            const li = document.createElement('li');
            li.className = `mission-item ${mission.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="mission-checkbox" ${mission.completed ? 'checked' : ''}>
                <div class="mission-content">
                    <span class="mission-task">${mission.text}</span>
                    <span class="mission-tag">${mission.subject}</span>
                </div>
                <button class="delete-mission-btn"><i class="fa-solid fa-xmark"></i></button>
            `;

            li.querySelector('.mission-checkbox').addEventListener('change', () => toggleMission(mission.id));
            li.querySelector('.delete-mission-btn').addEventListener('click', () => deleteMission(mission.id));

            el.missionList.appendChild(li);
        });
    }

    function updateProgressBars() {
        const subjects = ['Biology', 'Physics', 'Chemistry'];
        const mapIds = {
            'Biology': { bar: el.bioProgress, text: el.bioProgressText },
            'Physics': { bar: el.phyProgress, text: el.phyProgressText },
            'Chemistry': { bar: el.chemProgress, text: el.chemProgressText }
        };

        subjects.forEach(sub => {
            const subMissions = state.missions.filter(m => m.subject === sub);
            const total = subMissions.length;
            const completed = subMissions.filter(m => m.completed).length;

            let percent = 0;
            if (total > 0) percent = Math.round((completed / total) * 100);

            mapIds[sub].bar.style.width = `${percent}%`;
            mapIds[sub].text.textContent = `${percent}%`;
        });
    }

    // --- CSS-Synced Panic Mode Logic ---
    let syncInterval;

    function openPanicMode() {
        el.panicOverlay.classList.remove('hidden');
        // Add the animation class so the CSS @keyframes start immediately
        el.breathingCircle.classList.add('breathing-active');

        // Align text with the 14s CSS animation cycle
        syncBreathingText();
        syncInterval = setInterval(syncBreathingText, 14000);
    }

    function closePanicMode() {
        el.panicOverlay.classList.add('hidden');
        // Stop animation
        el.breathingCircle.classList.remove('breathing-active');
        clearInterval(syncInterval);
    }

    function syncBreathingText() {
        // T=0s
        el.breathingText.textContent = "Breathe In";

        // T=4s
        setTimeout(() => {
            if (!el.panicOverlay.classList.contains('hidden')) el.breathingText.textContent = "Hold";
        }, 4000);

        // T=8s
        setTimeout(() => {
            if (!el.panicOverlay.classList.contains('hidden')) el.breathingText.textContent = "Breathe Out";
        }, 8000);
    }

    // --- Audio Logic (Web Audio API Synthesizer) ---
    function toggleNoise() {
        if (!state.audioCtx) initAudio();

        if (state.isNoisePlaying) {
            state.audioCtx.suspend();
            el.noiseToggleBtns.forEach(btn => btn.classList.remove('active'));
            state.isNoisePlaying = false;
        } else {
            state.audioCtx.resume();
            el.noiseToggleBtns.forEach(btn => btn.classList.add('active'));
            state.isNoisePlaying = true;
        }
    }

    function initAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();

        const bufferSize = 2 * state.audioCtx.sampleRate,
            noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate),
            output = noiseBuffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        state.noiseNode = state.audioCtx.createBufferSource();
        state.noiseNode.buffer = noiseBuffer;
        state.noiseNode.loop = true;

        state.filterNode = state.audioCtx.createBiquadFilter();
        state.filterNode.type = 'lowpass';
        state.filterNode.frequency.value = 400;

        const gainNode = state.audioCtx.createGain();
        gainNode.gain.value = 0.5;

        state.noiseNode.connect(state.filterNode);
        state.filterNode.connect(gainNode);
        gainNode.connect(state.audioCtx.destination);

        state.noiseNode.start(0);
    }

    // --- Flashcards Logic ---
    function openRevisionMode(topic) {
        state.currentTopic = topic;
        state.currentCardIndex = 0;

        const titleMap = {
            'physics': 'Physics Formulas', 'organic': 'Organic Reactions',
            'biology': 'Biology Diagrams', 'inorganic': 'Inorganic Facts'
        };
        el.revisionModalTitle.textContent = titleMap[topic];

        el.flashcard.classList.remove('flipped');
        renderFlashcard();
        el.revisionOverlay.classList.remove('hidden');
    }

    function closeRevisionMode() { el.revisionOverlay.classList.add('hidden'); }

    function renderFlashcard() {
        const cards = FLASHCARDS[state.currentTopic];
        const card = cards[state.currentCardIndex];

        el.fcFront.textContent = card.f;
        el.fcBack.textContent = card.b;
        el.cardCounter.textContent = `${state.currentCardIndex + 1}/${cards.length}`;

        if (el.flashcard.classList.contains('flipped')) {
            el.flashcard.classList.remove('flipped');
            setTimeout(() => {
                el.fcFront.textContent = card.f;
                el.fcBack.textContent = card.b;
            }, 300);
        }
    }

    function nextCard() {
        const cards = FLASHCARDS[state.currentTopic];
        if (state.currentCardIndex < cards.length - 1) { state.currentCardIndex++; renderFlashcard(); }
    }

    function prevCard() {
        if (state.currentCardIndex > 0) { state.currentCardIndex--; renderFlashcard(); }
    }

    // --- Summary Logic ---
    function showSummaryModal() {
        el.summaryFocusHours.textContent = state.stats.focusSessions;
        el.summaryOverlay.classList.remove('hidden');
    }

    // Bootstrap
    init();
});
