import './style.css';
import { SYMBOLS } from './symbols.js';
import {
  DIFFICULTIES,
  createDeck,
  formatTime,
  isBetterRecord,
  pairCount,
  resolveFlip,
} from './engine.js';
import {
  isMuted,
  playFlip,
  playMatch,
  playMismatch,
  playWin,
  setMuted,
} from './audio.js';

const STORAGE_KEY = 'memory-match-records-v1';
const MUTE_KEY = 'memory-match-muted';
const MISMATCH_DELAY = 780;

const app = document.querySelector('#app');

const state = {
  screen: 'menu',
  difficulty: DIFFICULTIES.easy,
  cards: [],
  flippedIds: [],
  matchedIds: [],
  locked: false,
  moves: 0,
  startedAt: 0,
  elapsedMs: 0,
  previewing: false,
  newRecord: false,
};

let timerId = 0;
let mismatchTimer = 0;

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveRecord(difficultyId, record) {
  const records = loadRecords();
  records[difficultyId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function recordLabel(difficultyId) {
  const record = loadRecords()[difficultyId];
  if (!record) return '아직 기록이 없습니다';
  return `최고 ${record.moves}수 · ${formatTime(record.timeMs)}`;
}

function symbolById(id) {
  return SYMBOLS.find((symbol) => symbol.id === id);
}

function remainingPairs() {
  return pairCount(state.difficulty) - state.matchedIds.length / 2;
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = 0;
}

function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    state.elapsedMs = Date.now() - state.startedAt;
    const value = document.querySelector('[data-stat="time"]');
    if (value) value.textContent = formatTime(state.elapsedMs);
  }, 200);
}

function updateHud() {
  const moves = document.querySelector('[data-stat="moves"]');
  const left = document.querySelector('[data-stat="left"]');
  const time = document.querySelector('[data-stat="time"]');
  if (moves) moves.textContent = String(state.moves);
  if (left) left.textContent = String(remainingPairs());
  if (time) time.textContent = formatTime(state.elapsedMs);
}

function cardElement(id) {
  return document.querySelector(`[data-card-id="${id}"]`);
}

function setCardState(id, className, on) {
  cardElement(id)?.classList.toggle(className, on);
}

function setCardDisabled(id, disabled) {
  const card = cardElement(id);
  if (card) card.disabled = disabled;
}

function describeCard(card) {
  const symbol = symbolById(card.symbolId);
  if (state.matchedIds.includes(card.id)) return `맞춘 ${symbol.label}`;
  if (state.flippedIds.includes(card.id) || state.previewing) return symbol.label;
  return '뒤집힌 카드';
}

function refreshCardLabels() {
  for (const card of state.cards) {
    const button = cardElement(card.id);
    if (button) button.setAttribute('aria-label', describeCard(card));
  }
}

function finishGame() {
  stopTimer();
  state.elapsedMs = Date.now() - state.startedAt;
  const current = { moves: state.moves, timeMs: state.elapsedMs };
  const previous = loadRecords()[state.difficulty.id];
  state.newRecord = isBetterRecord(current, previous);
  if (state.newRecord) saveRecord(state.difficulty.id, current);
  playWin();
  state.screen = 'won';
  render();
}

function clearMismatch() {
  const [firstId, secondId] = state.flippedIds;
  if (firstId) setCardState(firstId, 'is-wrong', false);
  if (secondId) setCardState(secondId, 'is-wrong', false);
  for (const id of state.flippedIds) {
    setCardState(id, 'is-flipped', false);
    setCardDisabled(id, false);
  }
  state.flippedIds = [];
  state.locked = false;
  refreshCardLabels();
}

function handleMatch(firstId, secondId) {
  state.matchedIds.push(firstId, secondId);
  setCardState(firstId, 'is-matched', true);
  setCardState(secondId, 'is-matched', true);
  setCardDisabled(firstId, true);
  setCardDisabled(secondId, true);
  state.flippedIds = [];
  state.locked = false;
  playMatch();
  updateHud();
  refreshCardLabels();
  const status = document.querySelector('[data-live]');
  if (status) status.textContent = `짝을 맞췄습니다. 남은 짝 ${remainingPairs()}개`;
  if (state.matchedIds.length === state.cards.length) {
    window.setTimeout(finishGame, 420);
  }
}

function handleMismatch(firstId, secondId) {
  setCardState(firstId, 'is-wrong', true);
  setCardState(secondId, 'is-wrong', true);
  playMismatch();
  const status = document.querySelector('[data-live]');
  if (status) status.textContent = '짝이 아닙니다';
  mismatchTimer = window.setTimeout(clearMismatch, MISMATCH_DELAY);
}

function onCardClick(cardId) {
  if (state.locked || state.previewing || state.screen !== 'play') return;
  if (state.matchedIds.includes(cardId) || state.flippedIds.includes(cardId)) return;

  const card = state.cards.find((item) => item.id === cardId);
  if (!card) return;

  state.flippedIds.push(cardId);
  setCardState(cardId, 'is-flipped', true);
  setCardDisabled(cardId, true);
  playFlip();
  refreshCardLabels();

  if (state.flippedIds.length < 2) return;

  state.moves += 1;
  state.locked = true;
  updateHud();

  const [firstId, secondId] = state.flippedIds;
  const result = resolveFlip(state.cards, firstId, secondId);
  if (result.match) handleMatch(firstId, secondId);
  else handleMismatch(firstId, secondId);
}

function beginPlay() {
  const previewMs = state.difficulty.previewMs;
  state.startedAt = Date.now();
  if (!previewMs) {
    startTimer();
    return;
  }

  state.previewing = true;
  state.locked = true;
  for (const card of state.cards) {
    setCardState(card.id, 'is-preview', true);
    setCardDisabled(card.id, true);
  }
  refreshCardLabels();
  const status = document.querySelector('[data-live]');
  if (status) status.textContent = '카드를 외워 보세요';

  window.setTimeout(() => {
    for (const card of state.cards) {
      setCardState(card.id, 'is-preview', false);
      setCardDisabled(card.id, false);
    }
    state.previewing = false;
    state.locked = false;
    state.startedAt = Date.now();
    startTimer();
    refreshCardLabels();
    const live = document.querySelector('[data-live]');
    if (live) live.textContent = '같은 그림을 찾아 짝을 맞추세요';
  }, previewMs);
}

function startGame(difficultyId) {
  window.clearTimeout(mismatchTimer);
  stopTimer();
  state.difficulty = DIFFICULTIES[difficultyId];
  state.cards = createDeck(SYMBOLS, pairCount(state.difficulty));
  state.flippedIds = [];
  state.matchedIds = [];
  state.locked = false;
  state.moves = 0;
  state.elapsedMs = 0;
  state.previewing = false;
  state.newRecord = false;
  state.screen = 'play';
  render();
  beginPlay();
}

function goMenu() {
  window.clearTimeout(mismatchTimer);
  stopTimer();
  state.screen = 'menu';
  render();
}

function toggleMute() {
  setMuted(!isMuted());
  localStorage.setItem(MUTE_KEY, isMuted() ? '1' : '0');
  const button = document.querySelector('[data-mute]');
  if (button) {
    button.setAttribute('aria-pressed', String(isMuted()));
    button.textContent = isMuted() ? '소리 켜기' : '소리 끄기';
  }
}

function renderMenu() {
  return `
    <section class="menu">
      <div class="menu-top">
        <div>
          <p class="eyebrow">Memory Match</p>
          <h1 class="title">짝 맞추기</h1>
          <p class="lede">같은 그림을 찾아 짝을 맞추는 기억력 게임입니다. 난이도를 고르면 바로 시작합니다.</p>
        </div>
        <button class="sound-toggle" type="button" data-mute aria-pressed="${isMuted()}">
          ${isMuted() ? '소리 켜기' : '소리 끄기'}
        </button>
      </div>
      <div class="levels">
        ${Object.values(DIFFICULTIES)
          .map(
            (level) => `
              <button class="level" type="button" data-start="${level.id}">
                <span class="level-label">${level.label}</span>
                <p class="level-meta">${level.rows} × ${level.cols} · ${pairCount(level)}쌍</p>
                <p class="level-hint">${level.hint}</p>
                <p class="level-record">${recordLabel(level.id)}</p>
              </button>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderBoard() {
  return state.cards
    .map((card, index) => {
      const symbol = symbolById(card.symbolId);
      const matched = state.matchedIds.includes(card.id);
      const flipped = state.flippedIds.includes(card.id);
      return `
        <button
          class="card${flipped ? ' is-flipped' : ''}${matched ? ' is-matched' : ''}"
          type="button"
          data-card-id="${card.id}"
          style="animation-delay: ${index * 28}ms; --symbol: ${symbol.color}"
          aria-label="${describeCard(card)}"
          ${matched ? 'disabled' : ''}
        >
          <span class="card-inner">
            <span class="card-face card-back"></span>
            <span class="card-face card-front">${symbol.svg}</span>
          </span>
        </button>
      `;
    })
    .join('');
}

function renderPlay() {
  return `
    <section class="play">
      <header class="hud">
        <div class="hud-stats">
          <div class="stat"><span class="stat-label">시간</span><span class="stat-value" data-stat="time">${formatTime(state.elapsedMs)}</span></div>
          <div class="stat"><span class="stat-label">이동</span><span class="stat-value" data-stat="moves">${state.moves}</span></div>
          <div class="stat"><span class="stat-label">남은 짝</span><span class="stat-value" data-stat="left">${remainingPairs()}</span></div>
        </div>
        <div class="hud-actions">
          <button class="ghost" type="button" data-menu>메뉴</button>
          <button class="solid" type="button" data-restart>다시 하기</button>
        </div>
      </header>
      <p class="status" data-live aria-live="polite">같은 그림을 찾아 짝을 맞추세요</p>
      <div class="board-wrap">
        <div class="board" style="--cols: ${state.difficulty.cols}; grid-template-columns: repeat(${state.difficulty.cols}, minmax(0, 1fr))">
          ${renderBoard()}
        </div>
      </div>
    </section>
  `;
}

function renderWin() {
  return `
    ${renderPlay()}
    <div class="overlay">
      <div class="dialog" role="dialog" aria-labelledby="win-title" aria-modal="true">
        ${state.newRecord ? '<span class="badge">새 기록</span>' : ''}
        <h2 id="win-title">모든 짝을 맞췄어요</h2>
        <p>${state.difficulty.label} 난이도를 ${state.moves}번 만에 ${formatTime(state.elapsedMs)} 만에 완료했습니다.</p>
        <div class="dialog-stats">
          <div class="stat"><span class="stat-label">이동</span><span class="stat-value">${state.moves}</span></div>
          <div class="stat"><span class="stat-label">시간</span><span class="stat-value">${formatTime(state.elapsedMs)}</span></div>
        </div>
        <div class="dialog-actions">
          <button class="ghost" type="button" data-menu>메뉴로</button>
          <button class="solid" type="button" data-restart>한 판 더</button>
        </div>
      </div>
    </div>
  `;
}

function bindEvents() {
  app.querySelector('[data-mute]')?.addEventListener('click', toggleMute);
  app.querySelectorAll('[data-start]').forEach((button) => {
    button.addEventListener('click', () => startGame(button.dataset.start));
  });
  app.querySelector('[data-menu]')?.addEventListener('click', goMenu);
  app.querySelector('[data-restart]')?.addEventListener('click', () => startGame(state.difficulty.id));
  app.querySelectorAll('[data-card-id]').forEach((button) => {
    button.addEventListener('click', () => onCardClick(button.dataset.cardId));
  });
}

function render() {
  app.className = 'app';
  if (state.screen === 'menu') app.innerHTML = renderMenu();
  else if (state.screen === 'won') app.innerHTML = renderWin();
  else app.innerHTML = renderPlay();
  bindEvents();
}

setMuted(localStorage.getItem(MUTE_KEY) === '1');
render();
