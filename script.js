(() => {
  "use strict";

  const THEMES = {
    animal: ["🐶", "🐱", "🦊", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐰", "🐷", "🐮", "🐙", "🦄", "🐝"],
    food: ["🍕", "🍔", "🍎", "🍩", "🍓", "🍉", "🍇", "🥑", "🍪", "🧁", "🍙", "🌮", "🍜", "🥞", "🧀"],
    face: ["😀", "😎", "🥳", "🤩", "😍", "🤪", "😜", "🥰", "😇", "🤠", "🤖", "👻", "🐥", "🌈", "⭐"],
    sport: ["⚽", "🏀", "🎾", "🏸", "🏓", "⚾", "🎱", "🏈", "🏐", "🎳", "⛳", "🏄", "🚴", "🏊", "🥊"],
  };

  const DIFFICULTY = {
    easy: { label: "쉬움", pairs: 6, cols: 4, previewSec: 2, threeStarMoves: 12 },
    normal: { label: "보통", pairs: 8, cols: 4, previewSec: 3, threeStarMoves: 16 },
    hard: { label: "어려움", pairs: 12, cols: 6, previewSec: 4, threeStarMoves: 26 },
  };

  const state = {
    difficulty: "easy",
    theme: "animal",
    deck: [],
    first: null,
    second: null,
    lock: false,
    moves: 0,
    matched: 0,
    started: false,
    startTime: 0,
    elapsed: 0,
    timerId: null,
    combo: 0,
    sound: true,
    previewTimer: null,
  };

  const $ = (sel) => document.querySelector(sel);
  const board = $("#board");
  const timeValue = $("#timeValue");
  const movesValue = $("#movesValue");
  const matchedValue = $("#matchedValue");
  const totalValue = $("#totalValue");
  const bestValue = $("#bestValue");
  const previewBar = $("#previewBar");
  const previewCount = $("#previewCount");
  const comboToast = $("#comboToast");
  const winModal = $("#winModal");

  // ---------- 효과음 (Web Audio, 외부 파일 없음) ----------
  let audioCtx = null;
  function beep(freq, dur = 0.12, type = "sine", vol = 0.18, when = 0) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime + when;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch (e) {
      /* 오디오 미지원 환경 무시 */
    }
  }
  const sfx = {
    flip: () => beep(520, 0.09, "triangle", 0.15),
    match: () => { beep(660, 0.12, "sine", 0.2); beep(880, 0.16, "sine", 0.2, 0.1); },
    miss: () => beep(220, 0.18, "sawtooth", 0.08),
    win: () => { [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.22, "sine", 0.2, i * 0.13)); },
    click: () => beep(740, 0.06, "square", 0.06),
  };

  // ---------- 유틸 ----------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function bestKey() {
    return `memory-match-best:${state.difficulty}:${state.theme}`;
  }

  function loadBest() {
    try {
      const raw = localStorage.getItem(bestKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function renderBest() {
    const best = loadBest();
    const dLabel = DIFFICULTY[state.difficulty].label;
    bestValue.textContent = best ? `${formatTime(best.time)} · ${best.moves}번 (${dLabel})` : "아직 없어요!";
  }

  function saveBestIfNeeded() {
    const best = loadBest();
    const record = { time: state.elapsed, moves: state.moves };
    if (!best || state.elapsed < best.time || (state.elapsed === best.time && state.moves < best.moves)) {
      try {
        localStorage.setItem(bestKey(), JSON.stringify(record));
      } catch (e) { /* 저장 실패 무시 */ }
      return { isNew: true, record };
    }
    return { isNew: false, record: best };
  }

  // ---------- 게임 흐름 ----------
  function newGame() {
    clearInterval(state.timerId);
    clearInterval(state.previewTimer);
    state.timerId = null;
    Object.assign(state, {
      deck: [], first: null, second: null, lock: true,
      moves: 0, matched: 0, started: false, elapsed: 0, combo: 0,
    });

    const cfg = DIFFICULTY[state.difficulty];
    const pool = shuffle(THEMES[state.theme]).slice(0, cfg.pairs);
    state.deck = shuffle([...pool, ...pool]);

    movesValue.textContent = "0";
    matchedValue.textContent = "0";
    totalValue.textContent = String(cfg.pairs);
    timeValue.textContent = "00:00";
    winModal.hidden = true;
    renderBest();
    renderBoard(true);

    // 미리보기: 전부 보여줬다가 뒤집기
    let remain = cfg.previewSec;
    previewBar.hidden = false;
    previewCount.textContent = String(remain);
    state.previewTimer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        clearInterval(state.previewTimer);
        previewBar.hidden = true;
        document.querySelectorAll(".card").forEach((c) => c.classList.remove("flipped"));
        state.lock = false;
      } else {
        previewCount.textContent = String(remain);
      }
    }, 1000);
  }

  function renderBoard(faceUp) {
    board.innerHTML = "";
    const cfg = DIFFICULTY[state.difficulty];
    board.className = `board cols-${cfg.cols}`;
    state.deck.forEach((emoji, idx) => {
      const btn = document.createElement("button");
      btn.className = "card" + (faceUp ? " flipped" : "");
      btn.type = "button";
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", `카드 ${idx + 1}`);
      btn.dataset.emoji = emoji;
      btn.dataset.index = String(idx);
      btn.innerHTML = `
        <span class="card-inner">
          <span class="card-face card-back">?</span>
          <span class="card-face card-front">${emoji}</span>
        </span>`;
      btn.addEventListener("click", () => onFlip(btn));
      board.appendChild(btn);
    });
  }

  function startTimer() {
    state.started = true;
    state.startTime = Date.now();
    state.timerId = setInterval(() => {
      state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      timeValue.textContent = formatTime(state.elapsed);
    }, 250);
  }

  function onFlip(card) {
    if (state.lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    if (!state.started && previewBar.hidden) startTimer();
    if (!state.started && !previewBar.hidden) return;

    sfx.flip();
    card.classList.add("flipped");

    if (!state.first) {
      state.first = card;
      return;
    }
    if (card === state.first) return;

    state.second = card;
    state.lock = true;
    state.moves += 1;
    movesValue.textContent = String(state.moves);

    const isMatch = state.first.dataset.emoji === state.second.dataset.emoji;
    if (isMatch) {
      const a = state.first, b = state.second;
      setTimeout(() => {
        a.classList.add("matched");
        b.classList.add("matched");
        a.disabled = true;
        b.disabled = true;
        sfx.match();
        state.matched += 1;
        matchedValue.textContent = String(state.matched);
        state.combo += 1;
        if (state.combo >= 2) showCombo(state.combo);
        state.first = state.second = null;
        state.lock = false;
        if (state.matched === DIFFICULTY[state.difficulty].pairs) onWin();
      }, 350);
    } else {
      const a = state.first, b = state.second;
      state.combo = 0;
      sfx.miss();
      setTimeout(() => {
        a.classList.add("shake");
        b.classList.add("shake");
      }, 250);
      setTimeout(() => {
        a.classList.remove("flipped", "shake");
        b.classList.remove("flipped", "shake");
        state.first = state.second = null;
        state.lock = false;
      }, 850);
    }
  }

  let comboTimer = null;
  function showCombo(n) {
    comboToast.textContent = `🔥 ${n}콤보!`;
    comboToast.classList.add("show");
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => comboToast.classList.remove("show"), 900);
  }

  function starCount() {
    const cfg = DIFFICULTY[state.difficulty];
    if (state.moves <= cfg.threeStarMoves) return 3;
    if (state.moves <= cfg.threeStarMoves + 8) return 2;
    return 1;
  }

  function onWin() {
    clearInterval(state.timerId);
    state.timerId = null;
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    timeValue.textContent = formatTime(state.elapsed);
    sfx.win();

    const stars = starCount();
    const { isNew } = saveBestIfNeeded();
    const best = loadBest();
    renderBest();

    $("#winTime").textContent = formatTime(state.elapsed);
    $("#winMoves").textContent = `${state.moves}번`;
    $("#winDifficulty").textContent = `${DIFFICULTY[state.difficulty].label} · ${themeLabel()}`;
    $("#winBest").textContent = best ? `${formatTime(best.time)} · ${best.moves}번` : "—";
    $("#winStars").innerHTML = [1, 2, 3]
      .map((i) => `<span class="${i <= stars ? "" : "off"}">★</span>`)
      .join("");
    $("#winMessage").textContent = isNew
      ? "🎊 새 최고 기록을 세웠어요! 정말 대단해요!"
      : pickPraise(stars);

    winModal.hidden = false;
    launchConfetti();
  }

  function pickPraise(stars) {
    if (stars === 3) return "완벽해요! 카드의 위치를 전부 외우셨네요 ✨";
    if (stars === 2) return "잘했어요! 조금만 더 하면 별 3개예요 💪";
    return "완주 축하해요! 다시 도전하면 더 빨라질 거예요 🍀";
  }

  function themeLabel() {
    return { animal: "동물", food: "음식", face: "표정", sport: "스포츠" }[state.theme];
  }

  // ---------- 컨페티 ----------
  function launchConfetti() {
    const canvas = $("#confettiCanvas");
    const card = canvas.parentElement;
    const rect = card.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    const colors = ["#ffd166", "#ff6b9d", "#7c6cff", "#3ddc84", "#00d4ff", "#ff8c42"];
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      c: colors[Math.floor(Math.random() * colors.length)],
      vy: 2 + Math.random() * 3,
      vx: -1.5 + Math.random() * 3,
      r: Math.random() * Math.PI,
      vr: -0.1 + Math.random() * 0.2,
    }));
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frames += 1;
      if (frames < 220 && !winModal.hidden) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })();
  }

  // ---------- 이벤트 바인딩 ----------
  function bindSegmented(groupId, key) {
    const group = document.getElementById(groupId);
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-difficulty],[data-theme]");
      if (!btn) return;
      sfx.click();
      group.querySelectorAll(".seg-btn").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      if (btn.dataset.difficulty) state.difficulty = btn.dataset.difficulty;
      if (btn.dataset.theme) state.theme = btn.dataset.theme;
      newGame();
    });
  }

  bindSegmented("difficultyGroup");
  bindSegmented("themeGroup");

  $("#startBtn").addEventListener("click", () => { sfx.click(); newGame(); });
  $("#againBtn").addEventListener("click", () => { sfx.click(); newGame(); });
  $("#harderBtn").addEventListener("click", () => {
    sfx.click();
    const order = ["easy", "normal", "hard"];
    const next = order[Math.min(order.indexOf(state.difficulty) + 1, 2)];
    state.difficulty = next;
    document.querySelectorAll("#difficultyGroup .seg-btn").forEach((b) => {
      const on = b.dataset.difficulty === next;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", String(on));
    });
    newGame();
  });

  winModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) winModal.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") winModal.hidden = true;
  });

  const soundBtn = $("#soundBtn");
  try {
    const saved = localStorage.getItem("memory-match-sound");
    if (saved !== null) state.sound = saved === "1";
  } catch (e) { /* 무시 */ }
  function renderSound() {
    soundBtn.textContent = state.sound ? "🔊 효과음 켜짐" : "🔇 효과음 꺼짐";
    soundBtn.setAttribute("aria-pressed", String(state.sound));
  }
  soundBtn.addEventListener("click", () => {
    state.sound = !state.sound;
    try { localStorage.setItem("memory-match-sound", state.sound ? "1" : "0"); } catch (e) { /* 무시 */ }
    renderSound();
    sfx.click();
  });
  renderSound();

  // 첫 게임 시작
  newGame();
})();
