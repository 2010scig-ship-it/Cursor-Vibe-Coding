const LEVELS = {
  easy: { id: "easy", label: "쉬움", pairs: 6, cols: 4 },
  normal: { id: "normal", label: "보통", pairs: 8, cols: 4 },
  hard: { id: "hard", label: "어려움", pairs: 12, cols: 6 },
};

const STORAGE_KEY = "memory-match-v1";

const BACK_MARK = `
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="1.7"/>
    <circle cx="24" cy="24" r="3" fill="currentColor"/>
    <path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M24 7.5v6.2M24 34.3V40.5M7.5 24h6.2M34.3 24H40.5"/>
  </svg>
`;

const ICONS = [
  {
    id: "moon",
    name: "달",
    wash: "#f6d3c4",
    svg: stamp(`
      <path fill="currentColor" fill-rule="evenodd" d="M6 24a14 14 0 1 0 28 0a14 14 0 1 0-28 0zM18 22a11 11 0 1 0 22 0a11 11 0 1 0-22 0z"/>
    `),
  },
  {
    id: "sun",
    name: "해",
    wash: "#f8e3b8",
    svg: stamp(`
      <circle cx="24" cy="24" r="8" fill="currentColor"/>
      <path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M24 4.5v6.2M24 37.3V43.5M4.5 24h6.2M37.3 24H43.5M9.8 9.8l4.4 4.4M33.8 33.8l4.4 4.4M38.2 9.8l-4.4 4.4M14.2 33.8l-4.4 4.4"/>
    `),
  },
  {
    id: "star",
    name: "별",
    wash: "#f3e7b4",
    svg: stamp(`
      <polygon fill="currentColor" points="24,5.5 28.4,17.2 41.2,17.6 31.2,25.4 34.6,37.8 24,31.2 13.4,37.8 16.8,25.4 6.8,17.6 19.6,17.2"/>
    `),
  },
  {
    id: "cloud",
    name: "구름",
    wash: "#d9e6f5",
    svg: stamp(`
      <circle cx="18" cy="28" r="8" fill="currentColor"/>
      <circle cx="28.5" cy="25" r="10" fill="currentColor"/>
      <circle cx="36.5" cy="29" r="6.5" fill="currentColor"/>
      <rect x="12" y="28" width="28" height="9" rx="4.5" fill="currentColor"/>
    `),
  },
  {
    id: "flower",
    name: "꽃",
    wash: "#f6d0dc",
    svg: stamp(`
      <circle cx="24" cy="11" r="6" fill="currentColor"/>
      <circle cx="36.2" cy="19.6" r="6" fill="currentColor"/>
      <circle cx="31.6" cy="33.6" r="6" fill="currentColor"/>
      <circle cx="16.4" cy="33.6" r="6" fill="currentColor"/>
      <circle cx="11.8" cy="19.6" r="6" fill="currentColor"/>
      <circle cx="24" cy="23.2" r="4.2" fill="#fffaf3"/>
    `),
  },
  {
    id: "leaf",
    name: "잎",
    wash: "#d5eddc",
    svg: stamp(`
      <path fill="currentColor" d="M10 38C22 35 33 27 40 9 25 14 15 24 10 38z"/>
      <path d="M15 33c7-7 13-13 19-17" fill="none" stroke="#fffaf3" stroke-width="2.2" stroke-linecap="round"/>
    `),
  },
  {
    id: "mountain",
    name: "산",
    wash: "#e7ddd2",
    svg: stamp(`
      <path fill="currentColor" d="M3 40 17 14l8 13 6-9 14 22H3z"/>
      <path fill="#fffaf3" d="m17 14 3.2 8.2L24 27l-3.4-5.2z"/>
    `),
  },
  {
    id: "wave",
    name: "파도",
    wash: "#cfe8ef",
    svg: stamp(`
      <path fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" d="M5 17c4 5 8 5 12 0s8-5 12 0 8 5 12 0M5 31c4 5 8 5 12 0s8-5 12 0 8 5 12 0"/>
    `),
  },
  {
    id: "bird",
    name: "새",
    wash: "#e5dcf8",
    svg: stamp(`
      <path fill="currentColor" d="M4 28c8-1 13-7 17-16 2 7 6 11 14 13 4 1.5 8 1.4 12 .2-7 2.6-11 7-13 14-2.6-6-8-10-14-11-6-.6-11-.6-16-.2z"/>
    `),
  },
  {
    id: "fish",
    name: "물고기",
    wash: "#d5e4f6",
    svg: stamp(`
      <path fill="currentColor" d="M5 24c8-9 17-10 27-6l13-9-5 15 5 15-13-9c-10 4-19 3-27-6z"/>
      <circle cx="31" cy="22.5" r="1.8" fill="#fffaf3"/>
    `),
  },
  {
    id: "butterfly",
    name: "나비",
    wash: "#f8d9c8",
    svg: stamp(`
      <ellipse cx="15" cy="18" rx="9" ry="7.2" fill="currentColor"/>
      <ellipse cx="33" cy="18" rx="9" ry="7.2" fill="currentColor"/>
      <ellipse cx="16" cy="31.5" rx="7.2" ry="6.2" fill="currentColor"/>
      <ellipse cx="32" cy="31.5" rx="7.2" ry="6.2" fill="currentColor"/>
      <rect x="22.2" y="13" width="3.6" height="22" rx="1.8" fill="currentColor"/>
      <circle cx="24" cy="11.2" r="2.3" fill="currentColor"/>
    `),
  },
  {
    id: "pine",
    name: "소나무",
    wash: "#d7ead4",
    svg: stamp(`
      <path fill="currentColor" d="M24 4 35 19H13z"/>
      <path fill="currentColor" d="M24 14 39 32H9z"/>
      <path fill="currentColor" d="M24 24 43 44H5z"/>
      <rect x="21" y="40" width="6" height="5" fill="currentColor"/>
    `),
  },
];

const boardEl = document.querySelector("#board");
const movesEl = document.querySelector("#moves");
const timeEl = document.querySelector("#time");
const leftEl = document.querySelector("#left");
const bestEl = document.querySelector("#best");
const liveEl = document.querySelector("#live");
const dialog = document.querySelector("#win-dialog");
const winKicker = document.querySelector("#win-kicker");
const winTitle = document.querySelector("#win-title");
const winStars = document.querySelector("#win-stars");
const winSummary = document.querySelector("#win-summary");
const winRecord = document.querySelector("#win-record");
const soundButton = document.querySelector("#sound-toggle");
const levelButtons = [...document.querySelectorAll("[data-level]")];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const missDelay = reduceMotion ? 280 : 760;

let store = loadStore();
let level = LEVELS[store.level] || LEVELS.normal;
let deck = [];
let openIndexes = [];
let moves = 0;
let matchedPairs = 0;
let lock = false;
let round = 0;
let startedAt = 0;
let elapsed = 0;
let timerId = 0;
let audioCtx = null;

document.querySelector("#restart").addEventListener("click", () => startGame());
document.querySelector("#win-again").addEventListener("click", () => startGame());
soundButton.addEventListener("click", toggleSound);
levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = LEVELS[button.dataset.level];
    if (!next || next.id === level.id) return;
    level = next;
    store.level = next.id;
    saveStore();
    startGame();
  });
});

boardEl.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card || card.disabled) return;
  flipCard(Number(card.dataset.index));
});

startGame();

function stamp(body) {
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
}

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      level: parsed.level || "normal",
      sound: parsed.sound !== false,
      records: parsed.records && typeof parsed.records === "object" ? parsed.records : {},
    };
  } catch {
    return { level: "normal", sound: true, records: {} };
  }
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function startGame() {
  round += 1;
  lock = false;
  openIndexes = [];
  moves = 0;
  matchedPairs = 0;
  stopTimer();
  elapsed = 0;
  startedAt = 0;
  if (dialog.open) dialog.close();

  const icons = ICONS.slice(0, level.pairs);
  deck = shuffle(
    icons.flatMap((icon) => [
      { icon, faceUp: false, matched: false },
      { icon, faceUp: false, matched: false },
    ]),
  );

  boardEl.dataset.cols = String(level.cols);
  boardEl.innerHTML = deck
    .map(
      (card, index) => `
        <button type="button" class="card" data-index="${index}" style="--i:${index}" aria-label="뒷면 카드 ${index + 1}">
          <span class="card-inner">
            <span class="card-face card-back">${BACK_MARK}</span>
            <span class="card-face card-front">
              <span class="glyph" style="--wash:${card.icon.wash}">${card.icon.svg}</span>
            </span>
          </span>
        </button>
      `,
    )
    .join("");

  syncLevelButtons();
  syncSoundButton();
  renderStats();
  announce(`${level.label} 난이도, ${level.pairs}쌍입니다.`);
}

function flipCard(index) {
  if (lock || Number.isNaN(index)) return;
  const card = deck[index];
  if (!card || card.faceUp || card.matched) return;

  card.faceUp = true;
  paintCard(index);
  if (!timerId) startTimer();
  openIndexes.push(index);

  if (openIndexes.length < 2) {
    tone(620, 0, 0.05, "triangle", 0.03);
    announce(`${card.icon.name} 카드`);
    return;
  }

  moves += 1;
  renderStats();
  const [firstIndex, secondIndex] = openIndexes;
  const first = deck[firstIndex];
  const second = deck[secondIndex];
  openIndexes = [];

  if (first.icon.id === second.icon.id) {
    first.matched = true;
    second.matched = true;
    matchedPairs += 1;
    paintCard(firstIndex);
    paintCard(secondIndex);
    tone(523, 0, 0.08, "sine", 0.04);
    tone(784, 0.09, 0.12, "sine", 0.04);
    const left = level.pairs - matchedPairs;
    announce(left ? `${first.icon.name} 짝을 찾았어요. 남은 짝 ${left}개` : "모든 짝을 찾았어요");
    renderStats();
    if (left === 0) finishGame();
    return;
  }

  lock = true;
  const token = round;
  const firstEl = cardElement(firstIndex);
  const secondEl = cardElement(secondIndex);
  firstEl.classList.add("is-wrong");
  secondEl.classList.add("is-wrong");
  tone(196, 0, 0.12, "sine", 0.03);
  announce("그림이 달라요");
  window.setTimeout(() => {
    if (token !== round) return;
    first.faceUp = false;
    second.faceUp = false;
    firstEl.classList.remove("is-wrong");
    secondEl.classList.remove("is-wrong");
    paintCard(firstIndex);
    paintCard(secondIndex);
    lock = false;
  }, missDelay);
}

function finishGame() {
  stopTimer();
  const record = { moves, timeMs: elapsed };
  const previous = store.records[level.id] || null;
  const firstClear = !previous;
  const improved = isBetter(record, previous);
  if (improved) {
    store.records[level.id] = record;
    saveStore();
  }
  renderStats();

  const stars = rate(moves, level.pairs);
  winKicker.textContent = `${level.label} · ${level.pairs}쌍`;
  winTitle.textContent =
    stars === 3 ? "정확하게 기억했어요" : stars === 2 ? "모두 찾았어요" : "짝을 다 맞췄어요";
  winStars.innerHTML = starMarkup(stars);
  winSummary.textContent = `${moves}번 시도 · ${formatTime(elapsed)}`;
  winRecord.textContent = firstClear
    ? "이 난이도의 첫 기록이에요."
    : improved
      ? "최고 기록을 새로 썼어요."
      : `최고 기록은 ${formatRecord(previous)}입니다.`;

  tone(523, 0, 0.1);
  tone(659, 0.12, 0.1);
  tone(784, 0.24, 0.16);
  const token = round;
  window.setTimeout(() => {
    if (token !== round || dialog.open) return;
    dialog.showModal();
  }, reduceMotion ? 0 : 360);
}

function rate(moveCount, pairs) {
  const ratio = moveCount / pairs;
  if (ratio <= 1.5) return 3;
  if (ratio <= 2.25) return 2;
  return 1;
}

function starMarkup(count) {
  const stars = [1, 2, 3]
    .map(
      (index) => `
        <svg class="star${index <= count ? " on" : ""}" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.4 14.7 8.6 21.4 9.2 16.4 13.7 17.9 20.2 12 16.9 6.1 20.2 7.6 13.7 2.6 9.2 9.3 8.6z"/>
        </svg>
      `,
    )
    .join("");
  return `${stars}<span class="sr-only">별 ${count}개</span>`;
}

function isBetter(next, previous) {
  if (!previous) return true;
  if (next.moves !== previous.moves) return next.moves < previous.moves;
  return next.timeMs < previous.timeMs;
}

function paintCard(index) {
  const card = deck[index];
  const element = cardElement(index);
  element.classList.toggle("is-up", card.faceUp || card.matched);
  element.classList.toggle("is-matched", card.matched);
  element.disabled = card.matched;
  element.setAttribute(
    "aria-label",
    card.faceUp || card.matched ? `${card.icon.name} 카드` : `뒷면 카드 ${index + 1}`,
  );
}

function cardElement(index) {
  return boardEl.querySelector(`[data-index="${index}"]`);
}

function renderStats() {
  const record = store.records[level.id];
  movesEl.textContent = String(moves);
  timeEl.textContent = formatTime(elapsed);
  leftEl.textContent = String(level.pairs - matchedPairs);
  bestEl.textContent = formatRecord(record);
}

function syncLevelButtons() {
  levelButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.level === level.id));
  });
}

function syncSoundButton() {
  soundButton.setAttribute("aria-pressed", String(store.sound));
  soundButton.textContent = store.sound ? "소리 켜짐" : "소리 꺼짐";
}

function toggleSound() {
  store.sound = !store.sound;
  saveStore();
  syncSoundButton();
  if (store.sound) tone(740, 0, 0.07, "triangle", 0.035);
}

function startTimer() {
  startedAt = performance.now();
  timerId = window.setInterval(() => {
    elapsed = Math.round(performance.now() - startedAt);
    timeEl.textContent = formatTime(elapsed);
  }, 200);
}

function stopTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = 0;
  if (startedAt) elapsed = Math.round(performance.now() - startedAt);
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatRecord(record) {
  if (!record || typeof record.moves !== "number") return "기록 없음";
  return `${record.moves}번 · ${formatTime(record.timeMs || 0)}`;
}

function announce(message) {
  liveEl.textContent = "";
  window.requestAnimationFrame(() => {
    liveEl.textContent = message;
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function randomInt(limit) {
  if (!window.crypto?.getRandomValues) return Math.floor(Math.random() * limit);
  const max = Math.floor(0x100000000 / limit) * limit;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    window.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= max);
  return value % limit;
}

function tone(freq, offset, duration, type = "sine", volume = 0.045) {
  if (!store.sound) return;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const start = audioCtx.currentTime + offset;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch {
    /* 소리를 만들 수 없는 환경에서는 조용히 넘어간다. */
  }
}
