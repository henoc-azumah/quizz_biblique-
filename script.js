// ========== STATE ==========
let allVerses = [];
let bookNames = [];
let sessionVerses = [];
let currentIndex = -1;
let score = 0;
let wrong = 0;
let timerDuration = 60;
let timeRemaining = 60;
let timerInterval = null;
let isAnswered = false;

const BIBLE_PATH = 'segond_1910.json';

// ========== DOM ELEMENTS ==========
const $ = id => document.getElementById(id);

const startScreen = $('startScreen');
const quizScreen = $('quizScreen');
const endScreen = $('endScreen');
const readyOverlay = $('readyOverlay');

const tickSound = $('tickSound');
const timeoutSound = $('timeoutSound');

const timerInput = $('timerInput');
const timerMinus = $('timerMinus');
const timerPlus = $('timerPlus');
const questionCountInput = $('questionCountInput');
const bookGrid = $('bookGrid');
const selectAllBooksBtn = $('selectAllBooks');
const deselectAllBooksBtn = $('deselectAllBooks');
const startBtn = $('startBtn');

const timerBar = $('timerBar');
const timerDisplay = $('timerDisplay');
const readyBtn = $('readyBtn');
const questionProgress = $('questionProgress');
const verseCard = $('verseCard');
const verseText = $('verseText');
const livreSelect = $('livre');
const chapitreIn = $('chapitre');
const versetNumIn = $('versetNum');
const submitBtn = $('submitBtn');
const feedback = $('feedback');
const feedbackLabel = $('feedbackLabel');
const feedbackAnswer = $('feedbackAnswer');
const nextBtn = $('nextBtn');

const scoreCount = $('scoreCount');
const wrongCount = $('wrongCount');
const finalScore = $('finalScore');
const finalWrong = $('finalWrong');
const finalTotal = $('finalTotal');
const restartBtn = $('restartBtn');

// ========== LOAD BIBLE DATA ==========
fetch(BIBLE_PATH)
    .then(r => r.json())
    .then(data => {
        // segond_1910.json: { metadata: {...}, verses: [{book_name, book, chapter, verse, text}, ...] }
        allVerses = data.verses;
        console.log(`Bible chargée : ${allVerses.length} versets.`);

        // Extract unique book names in order
        const seen = new Set();
        allVerses.forEach(v => {
            if (!seen.has(v.book_name)) {
                seen.add(v.book_name);
                bookNames.push(v.book_name);
            }
        });
        console.log(`${bookNames.length} livres trouvés.`);

        initBookGrid();
        populateLivreDropdown();
    })
    .catch(err => {
        console.error("Erreur de chargement de la Bible:", err);
        alert("Erreur de chargement des données bibliques. Vérifiez que le fichier segond_1910.json est présent.");
    });

function initBookGrid() {
    bookGrid.innerHTML = '';
    bookNames.forEach(bookName => {
        const div = document.createElement('div');
        div.className = 'book-item';
        const safeId = `book-${bookName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-àâäéèêëïîôùûüÿçœæ]/g, '')}`;
        div.innerHTML = `
            <input type="checkbox" id="${safeId}" value="${bookName}" checked>
            <label for="${safeId}">${bookName}</label>
        `;
        bookGrid.appendChild(div);
    });
}

function populateLivreDropdown() {
    livreSelect.innerHTML = '<option value="" disabled selected>Sélectionnez un livre</option>';
    bookNames.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        livreSelect.appendChild(opt);
    });
}

// ========== EVENT LISTENERS (SETTINGS) ==========
selectAllBooksBtn.onclick = () => {
    bookGrid.querySelectorAll('input').forEach(i => i.checked = true);
};

deselectAllBooksBtn.onclick = () => {
    bookGrid.querySelectorAll('input').forEach(i => i.checked = false);
};

timerMinus.onclick = () => {
    timerInput.value = Math.max(10, parseInt(timerInput.value) - 5);
};

timerPlus.onclick = () => {
    timerInput.value = Math.min(600, parseInt(timerInput.value) + 5);
};

// ========== NAVIGATION ==========
startBtn.onclick = startSession;
readyBtn.onclick = showVerse;
submitBtn.onclick = handleSubmit;
nextBtn.onclick = prepareNextQuestion;
restartBtn.onclick = () => location.reload();

// ========== SESSION LOGIC ==========
function startSession() {
    const selectedBooks = Array.from(bookGrid.querySelectorAll('input:checked')).map(i => i.value);
    if (selectedBooks.length === 0) {
        alert("Veuillez sélectionner au moins un livre.");
        return;
    }

    const numQuestions = parseInt(questionCountInput.value) || 10;
    timerDuration = parseInt(timerInput.value) || 60;

    // Filter verses by selected books
    const matchingVerses = allVerses.filter(v => selectedBooks.includes(v.book_name));
    console.log(`Versets correspondants : ${matchingVerses.length}`);

    if (matchingVerses.length === 0) {
        alert("Aucun verset trouvé dans les livres sélectionnés.");
        return;
    }

    // Shuffle and pick
    const shuffled = [...matchingVerses].sort(() => 0.5 - Math.random());
    sessionVerses = shuffled.slice(0, numQuestions).map(v => ({
        livre: v.book_name,
        chapitre: v.chapter.toString(),
        verset: v.verse.toString(),
        contenu: v.text.replace(/^¶\s*/, '') // Remove paragraph markers
    }));

    console.log(`Session démarrée avec ${sessionVerses.length} questions.`);

    score = 0;
    wrong = 0;
    currentIndex = -1;
    scoreCount.textContent = '0';
    wrongCount.textContent = '0';

    showScreen(quizScreen);
    prepareNextQuestion();
}

function prepareNextQuestion() {
    currentIndex++;
    if (currentIndex >= sessionVerses.length) {
        endSession();
        return;
    }

    isAnswered = false;
    readyOverlay.classList.remove('hidden');
    questionProgress.textContent = `Verset ${currentIndex + 1} sur ${sessionVerses.length}`;

    // Hide previous feedback
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    verseText.textContent = "";
    livreSelect.value = "";
    chapitreIn.value = "";
    versetNumIn.value = "";

    // Reset sounds
    tickSound.pause();
    tickSound.currentTime = 0;
    timeoutSound.pause();
    timeoutSound.currentTime = 0;

    // Clear timer
    clearInterval(timerInterval);
    timerBar.style.width = '100%';
    timerDisplay.textContent = formatTime(timerDuration);
    timerDisplay.classList.remove('warning');
}

function showVerse() {
    readyOverlay.classList.add('hidden');
    const v = sessionVerses[currentIndex];
    verseText.textContent = v.contenu;

    timeRemaining = timerDuration;
    startTimer();
}

function handleSubmit() {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    // Stop ticking sound
    tickSound.pause();
    tickSound.currentTime = 0;

    const livre = livreSelect.value;
    const chap = chapitreIn.value.trim();
    const vers = versetNumIn.value.trim();

    const correct = sessionVerses[currentIndex];
    const isCorrect =
        livre === correct.livre &&
        chap === correct.chapitre &&
        vers === correct.verset;

    feedback.classList.remove('hidden', 'correct', 'incorrect');
    if (isCorrect) {
        score++;
        scoreCount.textContent = score;
        feedback.classList.add('correct');
        feedbackLabel.textContent = "✅ Excellent !";
        feedbackAnswer.textContent = "";
    } else {
        wrong++;
        wrongCount.textContent = wrong;
        feedback.classList.add('incorrect');
        feedbackLabel.textContent = "La réponse était :";
        feedbackAnswer.textContent = `${correct.livre} ${correct.chapitre}:${correct.verset}`;
    }

    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
}

// ========== TIMER ==========
function startTimer() {
    updateTimerUI();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerUI();

        if (timeRemaining <= 10 && timeRemaining > 0) {
            timerDisplay.classList.add('warning');
            // Play tick sound
            tickSound.currentTime = 0;
            tickSound.play().catch(e => console.log("Audio play prevented:", e));
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.classList.add('warning');

            // Play timeout sound
            tickSound.pause();
            timeoutSound.currentTime = 0;
            timeoutSound.play().catch(e => console.log("Audio play prevented:", e));

            handleSubmit(); // Auto-submit on timeout
        }
    }, 1000);
}

function updateTimerUI() {
    timerDisplay.textContent = formatTime(timeRemaining);
    const pct = (timeRemaining / timerDuration) * 100;
    timerBar.style.width = pct + '%';
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ========== END SESSION ==========
function endSession() {
    showScreen(endScreen);
    finalScore.textContent = score;
    finalWrong.textContent = wrong;
    finalTotal.textContent = sessionVerses.length;
}

function showScreen(screen) {
    [startScreen, quizScreen, endScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (!readyOverlay.classList.contains('hidden')) {
            showVerse();
        } else if (!nextBtn.classList.contains('hidden')) {
            prepareNextQuestion();
        } else if (!submitBtn.classList.contains('hidden')) {
            handleSubmit();
        }
    }
});
