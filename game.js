(() => {
  const LEVELS = {
    easy: { cols: 4, rows: 3 },
    normal: { cols: 4, rows: 4 },
    hard: { cols: 6, rows: 5 },
  };
  const EMOJIS = [
    "🐶", "🐱", "🦊", "🐼", "🐸", "🦁", "🐵", "🐰",
    "🐯", "🐨", "🐙", "🦄", "🐧", "🐢", "🦋", "🐳",
  ];
  const STORAGE_KEY = "memory-match-best";

  const $ = (id) => document.getElementById(id);
  const boardEl = $("board");
  const timeEl = $("time");
  const movesEl = $("moves");
  const pairsEl = $("pairs");
  const bestEl = $("best");
  const modal = $("modal");

  let level = "normal";
  let first = null;
  let second = null;
  let lock = false;
  let moves = 0;
  let matched = 0;
  let totalPairs = 0;
  let startedAt = null;
  let timer = null;
  let elapsed = 0;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  function loadBest() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function renderBest() {
    const best = loadBest()[level];
    bestEl.textContent = best ? `${best.moves}회 · ${formatTime(best.time)}` : "-";
  }

  function saveBest() {
    const all = loadBest();
    const prev = all[level];
    const better = !prev || moves < prev.moves || (moves === prev.moves && elapsed < prev.time);
    if (better) {
      all[level] = { moves, time: elapsed };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch {}
    }
    return better;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    startedAt = Date.now();
    timer = setInterval(() => {
      elapsed = Math.floor((Date.now() - startedAt) / 1000);
      timeEl.textContent = formatTime(elapsed);
    }, 250);
  }

  function updateStats() {
    movesEl.textContent = moves;
    pairsEl.textContent = `${matched} / ${totalPairs}`;
  }

  function newGame() {
    stopTimer();
    modal.classList.add("hidden");
    const { cols, rows } = LEVELS[level];
    totalPairs = (cols * rows) / 2;
    first = second = null;
    lock = false;
    moves = 0;
    matched = 0;
    elapsed = 0;
    startedAt = null;
    timeEl.textContent = "0:00";
    updateStats();
    renderBest();

    const symbols = shuffle([...EMOJIS]).slice(0, totalPairs);
    const deck = shuffle([...symbols, ...symbols]);

    boardEl.style.setProperty("--cols", cols);
    boardEl.innerHTML = "";
    deck.forEach((symbol, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.dataset.symbol = symbol;
      card.setAttribute("aria-label", `카드 ${i + 1}, 뒷면`);
      card.innerHTML =
        '<div class="card-inner"><div class="face front"></div>' +
        `<div class="face back">${symbol}</div></div>`;
      card.addEventListener("click", () => flip(card));
      boardEl.appendChild(card);
    });
  }

  function flip(card) {
    if (lock || card === first || card.classList.contains("matched")) return;
    if (!startedAt) startTimer();

    card.classList.add("flipped");
    card.setAttribute("aria-label", `카드, ${card.dataset.symbol}`);

    if (!first) {
      first = card;
      return;
    }
    second = card;
    moves++;
    updateStats();
    lock = true;

    if (first.dataset.symbol === second.dataset.symbol) {
      first.classList.add("matched");
      second.classList.add("matched");
      matched++;
      resetPick();
      updateStats();
      if (matched === totalPairs) finish();
    } else {
      const a = first;
      const b = second;
      a.classList.add("wrong");
      b.classList.add("wrong");
      setTimeout(() => {
        [a, b].forEach((c) => {
          c.classList.remove("flipped", "wrong");
          c.setAttribute("aria-label", "카드, 뒷면");
        });
        resetPick();
      }, 900);
    }
  }

  function resetPick() {
    first = second = null;
    lock = false;
  }

  function finish() {
    stopTimer();
    elapsed = Math.floor((Date.now() - startedAt) / 1000);
    timeEl.textContent = formatTime(elapsed);
    const isBest = saveBest();
    renderBest();
    $("result").textContent = `${moves}번 만에 ${formatTime(elapsed)} 걸렸어요.`;
    $("record").textContent = isBest ? "🏆 새로운 최고 기록!" : "";
    setTimeout(() => modal.classList.remove("hidden"), 600);
  }

  document.querySelectorAll(".difficulty button").forEach((btn) => {
    btn.addEventListener("click", () => {
      level = btn.dataset.level;
      document.querySelectorAll(".difficulty button").forEach((b) => b.classList.toggle("active", b === btn));
      newGame();
    });
  });
  $("restart").addEventListener("click", newGame);
  $("again").addEventListener("click", newGame);

  newGame();
})();
