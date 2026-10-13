export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: '쉬움',
    hint: '카드를 잠깐 보여 준 뒤 시작합니다',
    rows: 3,
    cols: 4,
    previewMs: 2000,
  },
  medium: {
    id: 'medium',
    label: '보통',
    hint: '짧은 미리보기 후 바로 집중하세요',
    rows: 4,
    cols: 4,
    previewMs: 1000,
  },
  hard: {
    id: 'hard',
    label: '어려움',
    hint: '미리보기 없이 기억력만으로 맞춥니다',
    rows: 4,
    cols: 6,
    previewMs: 0,
  },
};

export function pairCount(difficulty) {
  return (difficulty.rows * difficulty.cols) / 2;
}

export function shuffle(items, rng = Math.random) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createDeck(symbols, pairs, rng = Math.random) {
  if (pairs > symbols.length) {
    throw new Error('Not enough symbols for the requested pair count');
  }

  const selected = shuffle(symbols, rng).slice(0, pairs);
  const cards = selected.flatMap((symbol, pairId) => [
    { id: `${pairId}-a`, pairId, symbolId: symbol.id },
    { id: `${pairId}-b`, pairId, symbolId: symbol.id },
  ]);

  return shuffle(cards, rng);
}

export function formatTime(ms) {
  const clamped = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isBetterRecord(current, previous) {
  if (!previous) return true;
  if (current.moves !== previous.moves) return current.moves < previous.moves;
  return current.timeMs < previous.timeMs;
}

export function resolveFlip(cards, firstId, secondId) {
  const first = cards.find((card) => card.id === firstId);
  const second = cards.find((card) => card.id === secondId);
  if (!first || !second || first.id === second.id) {
    return { match: false, lockedIds: [] };
  }

  return {
    match: first.pairId === second.pairId,
    lockedIds: [first.id, second.id],
  };
}
