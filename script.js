const ANIMALS = [
  { id: "fox", emoji: "🦊", name: "여우" },
  { id: "bear", emoji: "🐻", name: "곰" },
  { id: "rabbit", emoji: "🐰", name: "토끼" },
  { id: "panda", emoji: "🐼", name: "판다" },
  { id: "lion", emoji: "🦁", name: "사자" },
  { id: "frog", emoji: "🐸", name: "개구리" },
  { id: "koala", emoji: "🐨", name: "코알라" },
  { id: "penguin", emoji: "🐧", name: "펭귄" },
  { id: "tiger", emoji: "🐯", name: "호랑이" },
  { id: "monkey", emoji: "🐵", name: "원숭이" },
  { id: "owl", emoji: "🦉", name: "부엉이" },
  { id: "chick", emoji: "🐥", name: "병아리" },
];

const LEVELS = {
  easy: { pairs: 6, columns: 4 },
  normal: { pairs: 8, columns: 4 },
  hard: { pairs: 12, columns: 6 },
};

const board = document.querySelector("#gameBoard");
const movesElement = document.querySelector("#moves");
const timerElement = document.querySelector("#timer");
const comboElement = document.querySelector("#combo");
const matchedElement = document.querySelector("#matchedCount");
const totalPairsElement = document.querySelector("#totalPairs");
const progressTrack = document.querySelector(".progress-track");
const progressBar = document.querySelector("#progressBar");
const newGameButton = document.querySelector("#newGameButton");
const pauseButton = document.querySelector("#pauseButton");
const pauseOverlay = document.querySelector("#pauseOverlay");
const resumeButton = document.querySelector("#resumeButton");
const soundButton = document.querySelector("#soundButton");
const resultDialog = document.querySelector("#resultDialog");
const playAgainButton = document.querySelector("#playAgainButton");
const toast = document.querySelector("#toast");

let currentLevel = "normal";
let firstCard = null;
let secondCard = null;
let moves = 0;
let matchedPairs = 0;
let combo = 0;
let bestCombo = 0;
let elapsedSeconds = 0;
let timerId = null;
let gameStarted = false;
let paused = false;
let boardLocked = false;
let soundEnabled = true;
let mismatchTimeout = null;
let toastTimeout = null;
let audioContext = null;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createDeck() {
  const animals = shuffle(ANIMALS).slice(0, LEVELS[currentLevel].pairs);
  return shuffle(animals.flatMap((animal) => [
    { ...animal, uniqueId: `${animal.id}-a` },
    { ...animal, uniqueId: `${animal.id}-b` },
  ]));
}

function buildCard(animal, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.dataset.animal = animal.id;
  card.dataset.index = String(index);
  card.setAttribute("aria-label", `${index + 1}번 뒤집힌 카드`);
  card.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-back" aria-hidden="true"><span>?</span></span>
      <span class="card-face card-front" aria-hidden="true">
        <span class="card-emoji">${animal.emoji}</span>
        <span class="card-label">${animal.name}</span>
      </span>
    </span>
  `;
  card.addEventListener("click", () => flipCard(card, animal));
  return card;
}

function startGame() {
  clearInterval(timerId);
  clearTimeout(mismatchTimeout);
  firstCard = null;
  secondCard = null;
  moves = 0;
  matchedPairs = 0;
  combo = 0;
  bestCombo = 0;
  elapsedSeconds = 0;
  timerId = null;
  gameStarted = false;
  paused = false;
  boardLocked = false;
  pauseOverlay.hidden = true;
  pauseButton.innerHTML = '<span aria-hidden="true">Ⅱ</span> 일시정지';

  board.className = `game-board ${currentLevel === "hard" ? "hard" : ""}`;
  board.replaceChildren(...createDeck().map(buildCard));
  updateStats();
  timerElement.textContent = "00:00";
}

function startTimer() {
  if (timerId || paused) return;

  timerId = window.setInterval(() => {
    elapsedSeconds += 1;
    timerElement.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function flipCard(card, animal) {
  if (
    paused
    || boardLocked
    || card === firstCard
    || card.classList.contains("matched")
    || card.classList.contains("flipped")
  ) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  card.classList.add("flipped");
  card.setAttribute("aria-label", `${animal.name} 카드, 앞면`);
  playSound("flip");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  boardLocked = true;
  updateStats();

  if (firstCard.dataset.animal === secondCard.dataset.animal) {
    handleMatch(animal);
  } else {
    handleMismatch();
  }
}

function handleMatch(animal) {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  firstCard.disabled = true;
  secondCard.disabled = true;
  firstCard.setAttribute("aria-label", `${animal.name} 카드, 짝 맞춤`);
  secondCard.setAttribute("aria-label", `${animal.name} 카드, 짝 맞춤`);
  matchedPairs += 1;
  combo += 1;
  bestCombo = Math.max(bestCombo, combo);
  playSound("match");
  showToast(combo > 1 ? `${combo} 콤보! 기억력이 대단해요 ✦` : `${animal.name} 친구를 찾았어요!`);
  resetSelection();
  updateStats();

  if (matchedPairs === LEVELS[currentLevel].pairs) {
    window.setTimeout(finishGame, 650);
  }
}

function handleMismatch() {
  combo = 0;
  updateStats();
  mismatchTimeout = window.setTimeout(() => {
    firstCard?.classList.add("wrong");
    secondCard?.classList.add("wrong");

    window.setTimeout(() => {
      [firstCard, secondCard].forEach((card) => {
        if (!card) return;
        card.classList.remove("flipped", "wrong");
        card.setAttribute("aria-label", `${Number(card.dataset.index) + 1}번 뒤집힌 카드`);
      });
      resetSelection();
    }, 280);
  }, 620);
}

function resetSelection() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}

function updateStats() {
  const totalPairs = LEVELS[currentLevel].pairs;
  const progress = Math.round((matchedPairs / totalPairs) * 100);
  movesElement.textContent = String(moves);
  comboElement.textContent = String(combo);
  matchedElement.textContent = String(matchedPairs);
  totalPairsElement.textContent = String(totalPairs);
  progressBar.style.width = `${progress}%`;
  progressTrack.setAttribute("aria-valuemax", String(totalPairs));
  progressTrack.setAttribute("aria-valuenow", String(matchedPairs));
}

function togglePause(forceResume = false) {
  if (!gameStarted || matchedPairs === LEVELS[currentLevel].pairs) {
    if (!forceResume) showToast("카드를 한 장 뒤집으면 게임이 시작돼요");
    return;
  }

  paused = forceResume ? false : !paused;
  pauseOverlay.hidden = !paused;
  pauseButton.innerHTML = paused
    ? '<span aria-hidden="true">▶</span> 계속하기'
    : '<span aria-hidden="true">Ⅱ</span> 일시정지';

  if (paused) {
    clearInterval(timerId);
    timerId = null;
    resumeButton.focus();
  } else {
    startTimer();
    board.querySelector(".card:not(:disabled)")?.focus();
  }
}

function finishGame() {
  clearInterval(timerId);
  timerId = null;
  const rating = moves <= LEVELS[currentLevel].pairs + 2
    ? "완벽해요! 사진처럼 또렷한 기억력이에요."
    : moves <= LEVELS[currentLevel].pairs * 2
      ? "훌륭해요! 동물 친구들을 잘 기억했어요."
      : "성공했어요! 한 번 더 하면 더 빨라질 거예요.";

  document.querySelector("#resultMoves").textContent = `${moves}회`;
  document.querySelector("#resultTime").textContent = formatTime(elapsedSeconds);
  document.querySelector("#resultCombo").textContent = String(bestCombo);
  document.querySelector("#resultMessage").textContent = rating;
  playSound("complete");
  resultDialog.showModal();
}

function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function playSound(type) {
  if (!soundEnabled) return;

  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const tones = {
      flip: [340],
      match: [520, 690],
      complete: [440, 554, 659, 880],
    }[type];

    tones.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = now + index * 0.11;
      oscillator.type = type === "flip" ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(type === "flip" ? 0.035 : 0.065, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.15);
    });
  } catch {
    soundEnabled = false;
    updateSoundButton();
  }
}

function updateSoundButton() {
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.querySelector("span:last-child").textContent = soundEnabled ? "소리 켜짐" : "소리 꺼짐";
  soundButton.querySelector(".sound-icon").textContent = soundEnabled ? "♪" : "×";
}

function handleBoardKeyboard(event) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) return;

  const cards = [...board.querySelectorAll(".card:not(:disabled)")];
  const activeCard = document.activeElement.closest?.(".card");
  const activeIndex = Math.max(0, cards.indexOf(activeCard));

  if (event.key === " ") {
    if (activeCard) {
      event.preventDefault();
      activeCard.click();
    }
    return;
  }

  event.preventDefault();
  const columns = LEVELS[currentLevel].columns;
  const offsets = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -columns,
    ArrowDown: columns,
  };
  const nextIndex = Math.min(cards.length - 1, Math.max(0, activeIndex + offsets[event.key]));
  cards[nextIndex]?.focus();
}

document.querySelectorAll("[data-level]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.level === currentLevel) return;
    currentLevel = button.dataset.level;
    document.querySelectorAll("[data-level]").forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    startGame();
    showToast(`${button.childNodes[0].textContent.trim()} 난이도로 시작해요`);
  });
});

newGameButton.addEventListener("click", () => {
  startGame();
  showToast("카드를 새로 섞었어요!");
});

pauseButton.addEventListener("click", () => togglePause());
resumeButton.addEventListener("click", () => togglePause(true));
soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  updateSoundButton();
  if (soundEnabled) playSound("flip");
});

playAgainButton.addEventListener("click", () => {
  resultDialog.close();
  startGame();
});

resultDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
});

board.addEventListener("keydown", handleBoardKeyboard);

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameStarted && !paused && matchedPairs < LEVELS[currentLevel].pairs) {
    togglePause();
  }
});

startGame();
