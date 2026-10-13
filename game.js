(() => {
  const EMOJIS = [
    "🐶", "🐱", "🦊", "🐼", "🐸", "🐵", "🦁", "🐯", "🐨",
    "🐷", "🐰", "🐙", "🦄", "🐝", "🐢", "🦋", "🐳", "🦉",
  ];

  const LEVELS = {
    easy: { cols: 4, rows: 3, emojiSize: "2.8rem" },
    normal: { cols: 4, rows: 4, emojiSize: "2.6rem" },
    hard: { cols: 6, rows: 6, emojiSize: "clamp(1.2rem, 6vw, 2.2rem)" },
  };

  const MISMATCH_DELAY = 800;
  const BEST_KEY = "memory-game-best";

  const boardEl = document.getElementById("board");
  const timeEl = document.getElementById("time");
  const movesEl = document.getElementById("moves");
  const pairsEl = document.getElementById("pairs");
  const bestEl = document.getElementById("best");
  const modalEl = document.getElementById("modal");
  const modalTextEl = document.getElementById("modal-text");
  const modalRecordEl = document.getElementById("modal-record");
  const diffButtons = document.querySelectorAll(".diff-btn");

  const state = {
    level: "easy",
    first: null,
    second: null,
    locked: false,
    moves: 0,
    matchedPairs: 0,
    totalPairs: 0,
    seconds: 0,
    timerId: null,
    started: false,
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(total) {
    const m = Math.floor(total / 60);
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function loadBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveBest(level, record) {
    const all = loadBest();
    all[level] = record;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    } catch {
      // Storage may be unavailable (e.g. private mode); records just won't persist.
    }
  }

  function isBetter(a, b) {
    if (!b) return true;
    if (a.moves !== b.moves) return a.moves < b.moves;
    return a.seconds < b.seconds;
  }

  function renderBest() {
    const best = loadBest()[state.level];
    bestEl.textContent = best ? `${best.moves}회 · ${formatTime(best.seconds)}` : "-";
  }

  function renderStats() {
    timeEl.textContent = formatTime(state.seconds);
    movesEl.textContent = state.moves;
    pairsEl.textContent = `${state.matchedPairs} / ${state.totalPairs}`;
  }

  function startTimer() {
    if (state.started) return;
    state.started = true;
    state.timerId = setInterval(() => {
      state.seconds++;
      timeEl.textContent = formatTime(state.seconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function createCard(emoji, index) {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.dataset.emoji = emoji;
    card.setAttribute("aria-label", `카드 ${index + 1}`);
    card.innerHTML = `
      <span class="card-face card-back"></span>
      <span class="card-face card-front">${emoji}</span>
    `;
    card.addEventListener("click", () => onCardClick(card));
    return card;
  }

  function newGame() {
    stopTimer();
    const { cols, rows, emojiSize } = LEVELS[state.level];
    const pairCount = (cols * rows) / 2;
    const picks = shuffle(EMOJIS).slice(0, pairCount);
    const deck = shuffle([...picks, ...picks]);

    Object.assign(state, {
      first: null,
      second: null,
      locked: false,
      moves: 0,
      matchedPairs: 0,
      totalPairs: pairCount,
      seconds: 0,
      started: false,
    });

    boardEl.style.setProperty("--cols", cols);
    boardEl.style.setProperty("--emoji-size", emojiSize);
    boardEl.replaceChildren(...deck.map(createCard));
    modalEl.classList.add("hidden");
    renderStats();
    renderBest();
  }

  function onCardClick(card) {
    if (state.locked) return;
    if (card === state.first) return;
    if (card.classList.contains("matched")) return;

    startTimer();
    card.classList.add("flipped");
    card.setAttribute("aria-label", `카드 ${card.dataset.emoji}`);

    if (!state.first) {
      state.first = card;
      return;
    }

    state.second = card;
    state.moves++;
    movesEl.textContent = state.moves;

    if (state.first.dataset.emoji === state.second.dataset.emoji) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }

  function handleMatch() {
    [state.first, state.second].forEach((c) => {
      c.classList.add("matched");
      c.disabled = true;
    });
    state.matchedPairs++;
    pairsEl.textContent = `${state.matchedPairs} / ${state.totalPairs}`;
    resetSelection();

    if (state.matchedPairs === state.totalPairs) {
      stopTimer();
      setTimeout(showWin, 500);
    }
  }

  function handleMismatch() {
    state.locked = true;
    const pair = [state.first, state.second];
    pair.forEach((c) => c.classList.add("wrong"));

    setTimeout(() => {
      pair.forEach((c) => {
        c.classList.remove("flipped", "wrong");
        c.setAttribute("aria-label", "뒤집힌 카드");
      });
      resetSelection();
    }, MISMATCH_DELAY);
  }

  function resetSelection() {
    state.first = null;
    state.second = null;
    state.locked = false;
  }

  function showWin() {
    const record = { moves: state.moves, seconds: state.seconds };
    const prev = loadBest()[state.level];

    modalTextEl.textContent = `${record.moves}번 시도, ${formatTime(record.seconds)} 만에 모든 짝을 찾았어요.`;

    if (isBetter(record, prev)) {
      saveBest(state.level, record);
      modalRecordEl.textContent = "🏆 새로운 최고 기록!";
    } else {
      modalRecordEl.textContent = `최고 기록: ${prev.moves}회 · ${formatTime(prev.seconds)}`;
    }

    renderBest();
    modalEl.classList.remove("hidden");
    document.getElementById("play-again").focus();
  }

  diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      diffButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-checked", String(b === btn));
      });
      state.level = btn.dataset.level;
      newGame();
    });
  });

  document.getElementById("restart").addEventListener("click", newGame);
  document.getElementById("play-again").addEventListener("click", newGame);

  newGame();
})();
