document.addEventListener('DOMContentLoaded', () => {
    // --- Global Error Handler for User Debugging ---
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        const errorDetail = `Error: ${msg}\nLine: ${lineNo}\nColumn: ${columnNo}\nURL: ${url}`;
        console.error("GLOBAL ERROR CAPTURED:", errorDetail);
        // Show a non-intrusive alert if a fatal error occurs during startup
        if (state && !state.initComplete) {
            alert("A startup error occurred. Please check the console (F12) for details.\n\n" + msg);
        }
        return false;
    };

    // --- Supabase Setup ---
    let supabase = null;
    try {
        const SUPABASE_URL = 'https://zdljjubgmstlzhcguwfb.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_UTejG46XvWjTsjzZAo6UmQ_LaXm3YSr';
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } else {
            console.error("Supabase library not found on window object.");
        }
    } catch (e) {
        console.error("Supabase Initialization Failed:", e);
    }

    // --- State & Constants ---
    const TARGET_DATE = new Date("May 4, 2026 00:00:00").getTime();

    const MOTIVATIONS = [
        "Just one page at a time. Your goal is waiting.",
        "Consistency beats pressure. Stay calm, stay sharp.",
        "You are closer than you think. Keep pushing.",
        "Breathe. Focus. Execute. You've got this.",
        "Small steps every day lead to big results.",
        "Your future self will thank you for this effort.",
        "Calm mind, sharp focus. Excellence is a habit.",
        "Focus on the process, let the results follow.",
        "The pain of discipline is better than the pain of regret.",
        "Every session brings you one step closer to your dream."
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

    const NCERT_MAPPING = {
        // Class 11 Biology
        'kebo101': 'The Living World',
        'kebo102': 'Biological Classification',
        'kebo103': 'Plant Kingdom',
        'kebo104': 'Animal Kingdom',
        'kebo105': 'Morphology of Flowering Plants',
        'kebo106': 'Anatomy of Flowering Plants',
        'kebo107': 'Structural Organisation in Animals',
        'kebo108': 'Cell: The Unit of Life',
        'kebo109': 'Biomolecules',
        'kebo110': 'Cell Cycle and Cell Division',
        'kebo111': 'Photosynthesis in Higher Plants',
        'kebo112': 'Respiration in Plants',
        'kebo113': 'Plant Growth and Development',
        'kebo114': 'Breathing and Exchange of Gases',
        'kebo115': 'Body Fluids and Circulation',
        'kebo116': 'Excretory Products and their Elimination',
        'kebo117': 'Locomotion and Movement',
        'kebo118': 'Neural Control and Coordination',
        'kebo119': 'Chemical Coordination and Integration',
        // Class 12 Biology
        'lebo101': 'Sexual Reproduction in Flowering Plants',
        'lebo102': 'Human Reproduction',
        'lebo103': 'Reproductive Health',
        'lebo104': 'Principles of Inheritance and Variation',
        'lebo105': 'Molecular Basis of Inheritance',
        'lebo106': 'Evolution',
        'lebo107': 'Human Health and Disease',
        'lebo108': 'Microbes in Human Welfare',
        'lebo109': 'Biotechnology: Principles and Processes',
        'lebo110': 'Biotechnology and its Applications',
        'lebo111': 'Organisms and Populations',
        'lebo112': 'Ecosystem',
        'lebo113': 'Biodiversity and Conservation'
    };

    const ACHIEVEMENTS = [
        { id: 'early_bird', name: 'Early Bird', desc: 'Study before 7 AM', icon: '🌅', cat: 'Daily' },
        { id: 'night_owl', name: 'Night Owl', desc: 'Study after 11 PM', icon: '🦉', cat: 'Daily' },
        { id: 'deep_diver', name: 'Deep Diver', desc: '60+ min session', icon: '💎', cat: 'Daily' },
        { id: 'goal_met', name: 'Goal Crusher', desc: 'Met your daily goal', icon: '🎯', cat: 'Daily' },
        
        { id: 'streak_3', name: '3 Day Fire', desc: '3 day study streak', icon: '🔥', cat: 'Weekly' },
        { id: 'streak_7', name: 'Week Warrior', desc: '7 day study streak', icon: '🛡️', cat: 'Weekly' },
        { id: 'weekend_hero', name: 'Weekend Hero', desc: 'Study on Sat & Sun', icon: '🦸', cat: 'Weekly' },
        
        { id: 'focus_50', name: 'Focus Master', desc: '50 total focus hours', icon: '👑', cat: 'Milestone' },
        { id: 'task_100', name: 'Task Slayer', desc: '100 tasks completed', icon: '⚔️', cat: 'Milestone' },
        { id: 'perfect_month', name: 'Legendary', desc: '30 day streak', icon: '✨', cat: 'Milestone' }
    ];

    let state = {
        theme: localStorage.getItem('neet_theme') || 'light',
        missions: JSON.parse(localStorage.getItem('neet_missions')) || [],
        stats: JSON.parse(localStorage.getItem('neet_stats')) || { focusSessions: 0, tasksCompleted: 0, lastDate: new Date().toDateString() },
        dailyGoal: parseInt(localStorage.getItem('neet_daily_goal')) || 240, // default 4h
        badges: JSON.parse(localStorage.getItem('neet_badges')) || [],

        timerInterval: null,
        timeLeft: 25 * 60,
        totalTime: 25 * 60,
        isFocusing: false,
        isPaused: false,

        currentTopic: null,
        currentCardIndex: 0,

        user: null, // Track Supabase logged-in user
        mistakes: JSON.parse(localStorage.getItem('neet_mistakes')) || [],
        history: JSON.parse(localStorage.getItem('neet_history')) || {}, // Keyed by date string

        audioCtx: null,
        noiseNode: null,
        filterNode: null,
        isNoisePlaying: false,
        initComplete: false,
        ncertData: [], // Store loaded NCERT data
        editingMistakeId: null
    };

    // --- DOM Elements ---
    const el = {
        themeToggle: document.getElementById('headerThemeToggle'),
        countdownDaysSmall: document.getElementById('countdownDaysSmall'),
        motivationText: document.getElementById('motivationText'),

        navBtns: document.querySelectorAll('.nav-btn'),
        views: document.querySelectorAll('.view-section'),

        // Timer
        timerDisplay: document.getElementById('timerDisplay'),
        timerMode: document.getElementById('timerMode'),
        startStudyBtn: document.getElementById('startStudyBtn'),
        stopStudyBtn: document.getElementById('stopStudyBtn'),
        timerProgressRing: document.getElementById('timerProgressRing'),
        customTimerInput: document.getElementById('customTimerInput'),
        pauseStudyBtn: document.getElementById('pauseStudyBtn'),
        resumeStudyBtn: document.getElementById('resumeStudyBtn'),

        // Mini Timer Pill
        miniTimerPill: document.getElementById('miniTimerPill'),
        miniTimerDisplay: document.getElementById('miniTimerDisplay'),

        // Distraction Overlays
        distractionOverlay: document.getElementById('distractionLockOverlay'),
        distractionTimer: document.getElementById('distractionTimer'),
        minimizeDistractionBtn: document.getElementById('minimizeDistractionBtn'),
        pauseDistractionBtn: document.getElementById('pauseDistractionBtn'),
        resumeDistractionBtn: document.getElementById('resumeDistractionBtn'),
        exitDistractionBtn: document.getElementById('exitDistractionBtn'),
        maximizeFocusBtn: document.getElementById('maximizeFocusBtn'),
        focusQuote: document.getElementById('focusQuote'),

        // Missions
        newMissionInput: document.getElementById('newMissionInput'),
        missionSubject: document.getElementById('missionSubject'),
        addMissionBtn: document.getElementById('addMissionBtn'),
        missionList: document.getElementById('missionList'),

        // Progress
        bioProgress: document.getElementById('bioProgress'),
        phyProgress: document.getElementById('phyProgress'),
        chemProgress: document.getElementById('chemProgress'),
        bioProgressText: document.getElementById('bioProgressText'),
        phyProgressText: document.getElementById('phyProgressText'),
        chemProgressText: document.getElementById('chemProgressText'),

        // Panic / Calm
        panicBtn: document.getElementById('panicBtn'),
        panicOverlay: document.getElementById('panicOverlay'),
        exitPanicBtn: document.getElementById('exitPanicBtn'),
        breathingText: document.getElementById('breathingText'),
        breathingCircle: document.getElementById('breathingCircle'),

        // Ambient Shield
        noiseToggleBtns: document.querySelectorAll('.noise-toggle'),

        // Revision / NCERT Search
        revisionSearchInput: document.getElementById('revisionSearchInput'),
        revisionSearchBtn: document.getElementById('revisionSearchBtn'),
        revisionResultsGrid: document.getElementById('revisionResultsGrid'),
        ncertFullViewOverlay: document.getElementById('ncertFullViewOverlay'),
        ncertFullViewContent: document.getElementById('ncertFullViewContent'),
        closeNcertFullViewBtn: document.getElementById('closeNcertFullViewBtn'),

        // Analytics
        currentStreak: document.getElementById('currentStreak'),
        totalFocusHours: document.getElementById('totalFocusHours'),
        masteryScore: document.getElementById('masteryScore'),
        dailyGoalSelect: document.getElementById('dailyGoalSelect'),
        goalChart: document.getElementById('goalChart'),
        badgesGrid: document.getElementById('badgesGrid'),

        // Mistake Log
        mistakeTopic: document.getElementById('mistakeTopic'),
        mistakeReason: document.getElementById('mistakeReason'),
        mistakeSubject: document.getElementById('mistakeSubject'),
        addMistakeBtn: document.getElementById('addMistakeBtn'),
        mistakeList: document.getElementById('mistakeList'),

        // Revision Overlays / Flashcards
        revisionOverlay: document.getElementById('revisionOverlay'),
        closeRevisionBtn: document.getElementById('closeRevisionBtn'),
        fcFront: document.getElementById('fcFront'),
        fcBack: document.getElementById('fcBack'),
        prevCardBtn: document.getElementById('prevCardBtn'),
        nextCardBtn: document.getElementById('nextCardBtn'),
        cardCounter: document.getElementById('cardCounter'),
        revisionModalTitle: document.getElementById('revisionModalTitle'),
        miniRevBtns: document.querySelectorAll('.mini-rev-btn'),

        // Auth / Profile
        navProfileText: document.getElementById('navProfileText'),
        authTitle: document.getElementById('authTitle'),
        authForm: document.getElementById('authForm'),
        authEmail: document.getElementById('authEmail'),
        authPassword: document.getElementById('authPassword'),
        authSubmitBtn: document.getElementById('authSubmitBtn'),
        authErrorMsg: document.getElementById('authErrorMsg'),
        loggedInView: document.getElementById('loggedInView'),
        userEmailDisplay: document.getElementById('userEmailDisplay'),
        logoutBtn: document.getElementById('logoutBtn'),

        // Summary
        summaryOverlay: document.getElementById('summaryOverlay'),
        finishDayBtn: document.getElementById('finishDayBtn'),
        summaryFocusHours: document.getElementById('summaryFocusHours'),

        // Sync Indicator
        syncIndicator: document.getElementById('syncIndicator'),
    };

    let currentRevTopic = 'biology';
    let currentCardIdx = 0;

    // --- Initialization ---
    async function init() {
        try {
            // STEP 1: Core UI setup (Immediate & synchronous results)
            checkDailyReset();
            applyTheme(state.theme);
            updateCountdown();
            setRandomMotivation();
            renderMissions();
            updateProgressBars();
            renderMistakes();
            updateDashboardStats();
            renderGoalChart();
            renderBadgesGrid();
            updateAuthUI();

            // STEP 2: Bind UI Listeners (Make everything interactive right away)
            if (el.navBtns) el.navBtns.forEach(btn => btn.onclick = handleNavigation);
            document.querySelectorAll('.mobile-bottom-nav .nav-btn').forEach(btn => btn.onclick = handleNavigation);

            if (el.themeToggle) el.themeToggle.onclick = toggleTheme;
            if (el.panicBtn) el.panicBtn.onclick = openPanicMode;
            if (el.exitPanicBtn) el.exitPanicBtn.onclick = closePanicMode;

            if (el.addMissionBtn) el.addMissionBtn.onclick = addMission;
            if (el.newMissionInput) el.newMissionInput.onkeyup = (e) => e.key === 'Enter' && addMission();
            if (el.startStudyBtn) el.startStudyBtn.onclick = startFocusSession;
            if (el.stopStudyBtn) el.stopStudyBtn.onclick = stopFocusSession;
            if (el.pauseStudyBtn) el.pauseStudyBtn.onclick = pauseFocusSession;
            if (el.resumeStudyBtn) el.resumeStudyBtn.onclick = resumeFocusSession;
            if (el.pauseDistractionBtn) el.pauseDistractionBtn.onclick = pauseFocusSession;
            if (el.resumeDistractionBtn) el.resumeDistractionBtn.onclick = resumeFocusSession;
            if (el.timerMode) el.timerMode.onchange = handleTimerModeChange;
            if (el.customTimerInput) el.customTimerInput.oninput = handleCustomTimerInput;
            if (el.exitDistractionBtn) el.exitDistractionBtn.onclick = completeFocusSession;
            if (el.minimizeDistractionBtn) el.minimizeDistractionBtn.onclick = () => {
                el.distractionOverlay.classList.add('hidden');
                updateTimerDisplay(); // Will show mini-timer since isFocusing is true
            };
            if (el.finishDayBtn) el.finishDayBtn.onclick = () => el.summaryOverlay.classList.add('hidden');
            if (el.miniTimerPill) {
                el.miniTimerPill.onclick = (e) => {
                    if (e.target.closest('#maximizeFocusBtn')) return; // Maximize btn has its own handler
                    const studyBtn = Array.from(el.navBtns).find(b => b.dataset.view === 'view-study-room');
                    if (studyBtn) studyBtn.click();
                };
            }

            if (el.maximizeFocusBtn) el.maximizeFocusBtn.onclick = maximizeFocusSession;

            if (el.dailyGoalSelect) el.dailyGoalSelect.onchange = (e) => {
                state.dailyGoal = parseInt(e.target.value);
                localStorage.setItem('neet_daily_goal', state.dailyGoal);
                renderGoalChart();
            };


            if (el.miniTimerPill) el.miniTimerPill.onclick = () => {
                document.querySelector('.nav-btn[data-target="view-study-room"]').click();
            };

            if (el.revisionSearchBtn) el.revisionSearchBtn.onclick = handleRevisionSearch;
            if (el.revisionSearchInput) el.revisionSearchInput.addEventListener('input', debounce(handleRevisionSearch, 300));

            if (el.miniRevBtns) el.miniRevBtns.forEach(btn => btn.onclick = (e) => openRevisionOverlay(e.currentTarget.dataset.topic));
            if (el.closeRevisionBtn) el.closeRevisionBtn.onclick = () => el.revisionOverlay.classList.add('hidden');
            if (el.closeNcertFullViewBtn) el.closeNcertFullViewBtn.onclick = () => el.ncertFullViewOverlay.classList.add('hidden');
            if (el.nextCardBtn) el.nextCardBtn.onclick = nextCard;
            if (el.prevCardBtn) el.prevCardBtn.onclick = prevCard;

            // Universal Click-Outside-to-Close for all overlays
            document.querySelectorAll('.overlay').forEach(overlay => {
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        overlay.classList.add('hidden');
                        if (overlay.id === 'distractionLockOverlay' && state.isFocusing) {
                            stopFocusSession(); // Stop session if they force-close the focus space
                        }
                    }
                };
            });

            const flashcardOuter = document.querySelector('.flashcard');
            if (flashcardOuter) {
                flashcardOuter.onclick = () => {
                    const inner = document.querySelector('.flashcard-inner');
                    if (inner) inner.style.transform = inner.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)';
                };
            }

            if (el.noiseToggleBtns) el.noiseToggleBtns.forEach(btn => btn.onclick = toggleNoise);
            if (el.calendarGrid) el.calendarGrid.onclick = handleCalendarClick;
            if (el.authForm) el.authForm.onsubmit = handleAuthSubmit;
            if (el.logoutBtn) el.logoutBtn.onclick = handleLogout;
            if (el.addMistakeBtn) el.addMistakeBtn.onclick = addMistake;

            // Navigation protection
            window.addEventListener('beforeunload', (e) => {
                if (state.isFocusing) {
                    e.preventDefault();
                    e.returnValue = 'You have an active focus session.';
                    return e.returnValue;
                }
            });

            handleTimerModeChange();

            // STEP 3: ASYNC BACKEND (Don't let this block the UI)
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session && session.user) {
                        state.user = session.user;
                        await loadCloudData();
                        updateAuthUI();
                        renderMissions();
                        updateProgressBars();
                        renderMistakes();
                        generateCalendar();
                    }
                } catch (sbErr) {
                    console.warn("Supabase session fetch failed, continuing in offline mode:", sbErr);
                }
            }

            state.initComplete = true; // Mark initialization as finished
            console.log("NEET Peace Study Companion Initialized Successfully.");

            // Async load NCERT data
            fetchNCERTData();
        } catch (error) {
            console.error("Initialization CRITICAL Error in app.js:", error);
            alert("App Init Failed: " + error.message);
        }
    }

    // --- Navigation (SPA Logic) ---
    function handleNavigation(e) {
        const targetId = e.currentTarget.dataset.target;

        // Update Buttons
        el.navBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Sync with mobile bottom nav if it exists
        const bottomNavBtn = document.querySelector(`.mobile-bottom-nav .nav-btn[data-target="${targetId}"]`);
        if (bottomNavBtn) {
            document.querySelectorAll('.mobile-bottom-nav .nav-btn').forEach(b => b.classList.remove('active'));
            bottomNavBtn.classList.add('active');
        }

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
        localStorage.setItem('neet_mistakes', JSON.stringify(state.mistakes));
        localStorage.setItem('neet_history', JSON.stringify(state.history));

        // If logged in, sync to Supabase
        if (state.user) {
            if (el.syncIndicator) el.syncIndicator.classList.remove('hidden');
            try {
                // Upsert Profile Stats with Mistakes and History
                await supabase.from('profiles').upsert({
                    id: state.user.id,
                    focus_sessions: state.stats.focusSessions,
                    tasks_completed: state.stats.tasksCompleted,
                    last_active_date: state.stats.lastDate,
                    mistakes: state.mistakes,
                    history: state.history
                });

                // Clear remote missions and insert current active ones
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
            } finally {
                if (el.syncIndicator) {
                    setTimeout(() => el.syncIndicator.classList.add('hidden'), 1000);
                }
            }
        }
    }

    async function loadCloudData() {
        try {
            // Load profile (hours, tasks, lastDate, mistakes, history)
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
            if (profile) {
                state.stats = {
                    focusSessions: profile.focus_sessions || 0,
                    tasksCompleted: profile.tasks_completed || 0,
                    lastDate: profile.last_active_date || new Date().toDateString()
                };
                state.mistakes = profile.mistakes || [];
                state.history = profile.history || {};
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
    function updateAuthUI() {
        if (!el.navProfileText) return;

        if (state.user) {
            el.navProfileText.textContent = "Profile";
            el.authForm.classList.add('hidden');
            el.loggedInView.classList.remove('hidden');
            if (el.userEmailDisplay) el.userEmailDisplay.textContent = state.user.email;
        } else {
            el.navProfileText.textContent = "Profile / Auth";
            el.authForm.classList.remove('hidden');
            el.loggedInView.classList.add('hidden');
            if (el.userEmailDisplay) el.userEmailDisplay.textContent = "";
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
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            icon.className = 'fa-solid fa-sun';
            el.themeToggle.title = 'Switch to Light Mode';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            icon.className = 'fa-solid fa-moon';
            el.themeToggle.title = 'Switch to Dark Mode';
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
        const val = el.timerMode.value;

        if (val === 'custom') {
            el.customTimerInput.classList.remove('hidden');
            const customMins = parseInt(el.customTimerInput.value) || 25;
            state.timeLeft = customMins * 60;
            state.totalTime = customMins * 60;
        } else {
            el.customTimerInput.classList.add('hidden');
            const mins = parseInt(val);
            state.timeLeft = mins * 60;
            state.totalTime = mins * 60;
        }
        updateTimerDisplay();
    }

    function handleCustomTimerInput() {
        if (state.isFocusing) return;
        const mins = parseInt(el.customTimerInput.value) || 1;
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
        if (el.timerProgressRing) el.timerProgressRing.style.strokeDashoffset = offset;

        // Mini Timer Update
        if (el.miniTimerDisplay) el.miniTimerDisplay.textContent = timeString;
        
        // Handle Mini Timer Visibility
        const isOverlayVisible = !el.distractionOverlay.classList.contains('hidden');
        if (state.isFocusing && !isOverlayVisible) {
            el.miniTimerPill.classList.remove('hidden');
        } else {
            el.miniTimerPill.classList.add('hidden');
        }
    }

    function startFocusSession() {
        if (state.isFocusing) return;

        state.isFocusing = true;
        state.isPaused = false;
        
        el.startStudyBtn.classList.add('hidden');
        el.pauseStudyBtn.classList.remove('hidden');
        el.resumeStudyBtn.classList.add('hidden');
        el.stopStudyBtn.classList.remove('hidden');
        
        el.pauseDistractionBtn.classList.remove('hidden');
        el.resumeDistractionBtn.classList.add('hidden');
        
        el.timerMode.disabled = true;
        el.distractionOverlay.classList.remove('hidden');

        // Initial Quote
        if (el.focusQuote) el.focusQuote.textContent = `"${MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]}"`;

        state.timerInterval = setInterval(() => {
            if (state.isPaused) return;
            
            state.timeLeft--;
            updateTimerDisplay();
            
            // Rotate quote every 60 seconds
            if (state.timeLeft % 60 === 0 && el.focusQuote) {
                el.focusQuote.style.animation = 'none';
                el.focusQuote.offsetHeight; 
                el.focusQuote.style.animation = null; 
                el.focusQuote.textContent = `"${MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]}"`;
            }

            if (state.timeLeft <= 0) {
                completeFocusSession();
            }
        }, 1000);
    }

    function pauseFocusSession() {
        state.isPaused = true;
        el.pauseStudyBtn.classList.add('hidden');
        el.resumeStudyBtn.classList.remove('hidden');
        el.pauseDistractionBtn.classList.add('hidden');
        el.resumeDistractionBtn.classList.remove('hidden');
    }

    function resumeFocusSession() {
        state.isPaused = false;
        el.pauseStudyBtn.classList.remove('hidden');
        el.resumeStudyBtn.classList.add('hidden');
        el.pauseDistractionBtn.classList.remove('hidden');
        el.resumeDistractionBtn.classList.add('hidden');
    }

    function stopFocusSession() {
        clearInterval(state.timerInterval);
        state.isFocusing = false;
        state.isPaused = false;

        el.startStudyBtn.classList.remove('hidden');
        el.pauseStudyBtn.classList.add('hidden');
        el.resumeStudyBtn.classList.add('hidden');
        el.stopStudyBtn.classList.add('hidden');
        
        el.timerMode.disabled = false;
        el.distractionOverlay.classList.add('hidden');

        handleTimerModeChange();
    }

    function maximizeFocusSession() {
        el.distractionOverlay.classList.remove('hidden');
        updateTimerDisplay(); // Pill will hide based on visibility logic
    }

    function completeFocusSession() {
        if (!state.isFocusing) return; // Prevent double logging

        const sessionMins = Math.round(state.totalTime / 60);
        stopFocusSession();
        playChime();
        state.stats.focusSessions++;

        // Update history
        updateHistory(sessionMins, 0);

        // Check for new badges
        checkBadges(sessionMins);

        // Refresh analytics
        renderGoalChart();
        renderBadgesGrid();

        saveData();
        showSummaryModal();
        
        console.log("Focus session completed and statistics logged.");
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
    function addMission(e) {
        if (e) e.preventDefault(); // Prevent form submission if called from form
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
            if (mission.completed) {
                state.stats.tasksCompleted++;
                updateHistory(0, 1);
            } else {
                state.stats.tasksCompleted = Math.max(0, state.stats.tasksCompleted - 1);
                updateHistory(0, -1);
            }
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

    // Utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }



    // --- Flashcards Logic ---
    function openRevisionOverlay(topic) {
        currentRevTopic = topic;
        currentCardIdx = 0;
        el.revisionModalTitle.textContent = topic.charAt(0).toUpperCase() + topic.slice(1) + " Flashcards";
        updateFlashcardUI();
        el.revisionOverlay.classList.remove('hidden');
    }

    function updateFlashcardUI() {
        const cards = FLASHCARDS[currentRevTopic];
        const card = cards[currentCardIdx];
        el.fcFront.textContent = card.f;
        el.fcBack.textContent = card.b;
        el.cardCounter.textContent = `${currentCardIdx + 1} / ${cards.length}`;
        // Reset flip
        const inner = document.querySelector('.flashcard-inner');
        if (inner) inner.style.transform = '';
    }

    function nextCard() {
        currentCardIdx = (currentCardIdx + 1) % FLASHCARDS[currentRevTopic].length;
        updateFlashcardUI();
    }

    function prevCard() {
        const len = FLASHCARDS[currentRevTopic].length;
        currentCardIdx = (currentCardIdx - 1 + len) % len;
        updateFlashcardUI();
    }

    // --- NCERT Search Logic ---
    async function fetchNCERTData() {
        try {
            const response = await fetch('ncert_database.json');
            if (!response.ok) throw new Error("Failed to load NCERT database");
            state.ncertData = await response.json();
            console.log("NCERT Database loaded:", state.ncertData.length, "entries");
        } catch (err) {
            console.error("Error fetching NCERT data:", err);
        }
    }

    function handleRevisionSearch() {
        if (!el.revisionSearchInput || !el.revisionResultsGrid) return;
        const query = el.revisionSearchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            el.revisionResultsGrid.innerHTML = '<div class="search-placeholder">Type at least 2 characters to search NCERT...</div>';
            return;
        }

        const results = state.ncertData.filter(item =>
            item.content.toLowerCase().includes(query) ||
            (item.chapter || "").toLowerCase().includes(query) ||
            (NCERT_MAPPING[item.chapter] || "").toLowerCase().includes(query)
        );

        renderNCERTResults(results, query);
    }

    function renderNCERTResults(results, query) {
        el.revisionResultsGrid.innerHTML = '';
        if (results.length === 0) {
            el.revisionResultsGrid.innerHTML = '<div class="no-results">No matches found for "' + query + '"</div>';
            return;
        }

        // Sort results to prioritize better matches (e.g. title matches or earlier occurrences)
        const sorted = results.slice(0, 20); // Limit to top 20

        sorted.forEach(item => {
            const chapterTitle = NCERT_MAPPING[item.chapter] || item.chapter;
            const card = document.createElement('div');
            card.className = 'ncert-card';

            // Extract a snippet around the first match
            let snippet = "";
            const content = item.content;
            const idx = content.toLowerCase().indexOf(query);
            if (idx !== -1) {
                const start = Math.max(0, idx - 60);
                const end = Math.min(content.length, idx + 100);
                snippet = "..." + content.substring(start, end) + "...";
                // Highlight keyword
                snippet = snippet.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`);
            } else {
                snippet = content.substring(0, 160) + "...";
            }

            card.innerHTML = `
                <div class="ncert-card-header">
                    <span class="chapter-badge">${item.source}</span>
                    <h3>${chapterTitle}</h3>
                </div>
                <div class="ncert-card-snippet">${snippet}</div>
                <button class="view-full-btn" data-id="${item.id}">View Full Detail</button>
            `;

            const btn = card.querySelector('.view-full-btn');
            btn.onclick = () => showFullNCERTView(item);

            el.revisionResultsGrid.appendChild(card);
        });
    }

    function showFullNCERTView(item) {
        if (!el.ncertFullViewOverlay || !el.ncertFullViewContent) return;
        const chapterTitle = NCERT_MAPPING[item.chapter] || item.chapter;

        el.ncertFullViewContent.innerHTML = `
            <div class="ncert-full-header">
                <span class="chapter-badge الكبير">${item.source}</span>
                <h1>${chapterTitle}</h1>
                <p class="chapter-id-tag">ID: ${item.chapter}</p>
            </div>
            <div class="ncert-full-text">
                ${item.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
        `;
        el.ncertFullViewOverlay.classList.remove('hidden');
    }

    /* [MOVED TO INIT] */

    // --- Toolkit Phase 2 Functions ---

    function addMistake() {
        const topic = el.mistakeTopic.value.trim();
        const reason = el.mistakeReason.value;
        const subject = el.mistakeSubject.value;
        if (!topic) return;

        if (state.editingMistakeId) {
            const index = state.mistakes.findIndex(m => m.id === state.editingMistakeId);
            if (index !== -1) {
                state.mistakes[index] = { ...state.mistakes[index], topic, reason, subject };
            }
            state.editingMistakeId = null;
            el.addMistakeBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Mistake';
        } else {
            const mistake = {
                id: Date.now(),
                topic,
                reason,
                subject,
                date: new Date().toDateString()
            };
            state.mistakes.unshift(mistake);
        }

        el.mistakeTopic.value = '';
        saveData();
        renderMistakes();
    }

    function deleteMistake(id) {
        state.mistakes = state.mistakes.filter(m => m.id !== id);
        saveData();
        renderMistakes();
    }

    function editMistake(id) {
        const m = state.mistakes.find(m => m.id === id);
        if (!m) return;
        el.mistakeTopic.value = m.topic;
        el.mistakeReason.value = m.reason;
        el.mistakeSubject.value = m.subject;
        state.editingMistakeId = id;
        el.addMistakeBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
        el.mistakeTopic.focus();
    }

    function renderMistakes() {
        if (!el.mistakeList) return;
        el.mistakeList.innerHTML = '';
        state.mistakes.forEach(m => {
            const card = document.createElement('div');
            card.className = 'mistake-card mb-2';
            card.innerHTML = `
                <div class="mistake-info">
                    <span class="mistake-topic">${m.topic}</span>
                    <span class="mistake-meta">${m.subject} • ${m.date}</span>
                </div>
                <div class="mistake-actions">
                    <div class="mistake-reason-tag">${m.reason}</div>
                    <div class="mistake-btns">
                        <button class="icon-btn edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn del-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            card.querySelector('.edit-btn').onclick = () => editMistake(m.id);
            card.querySelector('.del-btn').onclick = () => deleteMistake(m.id);
            el.mistakeList.appendChild(card);
        });
    }

    function updateHistory(mins, tasks) {
        const date = new Date().toDateString();
        if (!state.history[date]) {
            state.history[date] = { mins: 0, tasks: 0 };
        }
        state.history[date].mins += mins;
        state.history[date].tasks += tasks;
        updateDashboardStats();
        renderGoalChart();
    }

    function updateDashboardStats() {
        const historyKeys = Object.keys(state.history).sort((a, b) => new Date(b) - new Date(a));

        // 1. Total Hours
        let totalMins = 0;
        let totalTasks = 0;
        for (const date in state.history) {
            totalMins += state.history[date].mins;
            totalTasks += state.history[date].tasks;
        }
        const totalHours = Math.round(totalMins / 60 * 10) / 10;
        if (el.totalFocusHours) el.totalFocusHours.textContent = `${totalHours}h`;

        // 2. Mastery Score (e.g., totalTasks * 5 + totalHours * 10)
        const score = (totalTasks * 5) + Math.round(totalHours * 10);
        if (el.masteryScore) el.masteryScore.textContent = score;

        // 3. Current Streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(today);

        // If they studied today, start counting from today. 
        // If not, see if they studied yesterday.
        if (!state.history[checkDate.toDateString()] || state.history[checkDate.toDateString()].mins === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dStr = checkDate.toDateString();
            if (state.history[dStr] && state.history[dStr].mins > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        if (el.currentStreak) el.currentStreak.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
    }


    // --- Summary Logic ---
    function showSummaryModal() {
        el.summaryFocusHours.textContent = state.stats.focusSessions;
        el.summaryOverlay.classList.remove('hidden');
    }

    // --- Evolution UI Rendering ---

    function renderGoalChart() {
        if (!el.goalChart) return;
        el.goalChart.innerHTML = '';
        const chartContainer = document.createElement('div');
        chartContainer.className = 'weekly-chart';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        // Render last 7 days (including today)
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toDateString();
            const dayLabel = days[d.getDay()];
            const log = state.history[dateStr] || { mins: 0, tasks: 0 };
            
            const goalMins = state.dailyGoal;
            const percent = Math.min(100, Math.round((log.mins / goalMins) * 100));
            const isLow = percent < 50;

            const col = document.createElement('div');
            col.className = 'chart-day-col';
            col.innerHTML = `
                <div class="bar-wrapper">
                    <div class="bar-tooltip">${Math.round(log.mins/6) / 10}h / ${goalMins/60}h</div>
                    <div class="bar-fill ${isLow ? 'low' : ''}" style="height: ${percent}%;"></div>
                </div>
                <span class="day-label">${dayLabel}</span>
            `;
            chartContainer.appendChild(col);
        }
        el.goalChart.appendChild(chartContainer);
    }

    function renderBadgesGrid() {
        if (!el.badgesGrid) return;
        el.badgesGrid.innerHTML = '';
        
        const categories = ['Daily', 'Weekly', 'Milestone'];
        
        categories.forEach(cat => {
            const catBadges = ACHIEVEMENTS.filter(a => a.cat === cat);
            
            // Category Header
            const header = document.createElement('div');
            header.className = 'badge-category-header';
            header.textContent = cat;
            el.badgesGrid.appendChild(header);
            
            // Grid for this category
            const grid = document.createElement('div');
            grid.className = 'category-badges-subgrid';
            
            catBadges.forEach(ach => {
                const isUnlocked = state.badges.includes(ach.id);
                const item = document.createElement('div');
                item.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
                item.innerHTML = `
                    <span class="badge-icon">${ach.icon}</span>
                    <span class="badge-name">${ach.name}</span>
                    <span class="badge-desc">${ach.desc}</span>
                `;
                grid.appendChild(item);
            });
            el.badgesGrid.appendChild(grid);
        });
    }


    function checkBadges(sessionMins) {
        const now = new Date();
        const hour = now.getHours();
        const today = now.toDateString();
        
        let newBadges = [];

        // 1. Early Bird (before 7 AM)
        if (hour < 7 && sessionMins >= 25) newBadges.push('early_bird');
        
        // 2. Night Owl (after 11 PM)
        if (hour >= 23 && sessionMins >= 25) newBadges.push('night_owl');

        // 3. Deep Diver (60+ min)
        if (sessionMins >= 60) newBadges.push('deep_diver');

        // 4. Streaks
        updateDashboardStats(); // Ensure latest streak is calculated
        const streakText = el.currentStreak ? el.currentStreak.textContent : "0";
        const streakCount = parseInt(streakText) || 0;
        if (streakCount >= 3) newBadges.push('streak_3');
        if (streakCount >= 7) newBadges.push('streak_7');

        // 5. Goal Crusher
        const log = state.history[today] || { mins: 0, tasks: 0 };
        if (log.mins >= state.dailyGoal) newBadges.push('goal_met');

        // 6. Weekend Hero
        const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yLog = state.history[yesterday.toDateString()];
            if (yLog && yLog.mins >= 25 && log.mins >= 25) {
                newBadges.push('weekend_hero');
            }
        }

        // 7. Milestones (Lifetime)
        const totalMins = Object.values(state.history).reduce((acc, curr) => acc + (curr.mins || 0), 0);
        if (totalMins >= 50 * 60) newBadges.push('focus_50');
        
        const totalTasks = Object.values(state.history).reduce((acc, curr) => acc + (curr.tasks || 0), 0);
        if (totalTasks >= 100) newBadges.push('task_100');
        
        if (streakCount >= 30) newBadges.push('perfect_month');

        // Filter out already owned focus
        let addedCount = 0;
        newBadges.forEach(id => {
            if (!state.badges.includes(id)) {
                state.badges.push(id);
                addedCount++;
                console.log("Badge unlocked:", id);
            }
        });

        if (addedCount > 0) {
            localStorage.setItem('neet_badges', JSON.stringify(state.badges));
            renderBadgesGrid();
            saveData();
        }
    }

    // --- End of Evolution UI Rendering ---

    // Bootstrap
    init();
});
