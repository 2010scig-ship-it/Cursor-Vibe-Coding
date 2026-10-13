import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDeck,
  formatTime,
  isBetterRecord,
  pairCount,
  resolveFlip,
  shuffle,
  DIFFICULTIES,
} from './engine.js';

function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

describe('pairCount', () => {
  it('returns half the grid size', () => {
    assert.equal(pairCount(DIFFICULTIES.easy), 6);
    assert.equal(pairCount(DIFFICULTIES.medium), 8);
    assert.equal(pairCount(DIFFICULTIES.hard), 12);
  });
});

describe('shuffle', () => {
  it('keeps the same items', () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items, seeded(7));
    assert.deepEqual([...shuffled].sort(), items);
  });

  it('does not mutate the original array', () => {
    const items = [1, 2, 3];
    shuffle(items, seeded(3));
    assert.deepEqual(items, [1, 2, 3]);
  });
});

describe('createDeck', () => {
  const symbols = Array.from({ length: 12 }, (_, index) => ({ id: `s${index}` }));

  it('creates two cards for every pair', () => {
    const deck = createDeck(symbols, 6, seeded(11));
    assert.equal(deck.length, 12);

    const counts = deck.reduce((map, card) => {
      map.set(card.pairId, (map.get(card.pairId) ?? 0) + 1);
      return map;
    }, new Map());

    assert.equal(counts.size, 6);
    for (const count of counts.values()) {
      assert.equal(count, 2);
    }
  });

  it('throws when there are not enough symbols', () => {
    assert.throws(() => createDeck(symbols.slice(0, 2), 4));
  });
});

describe('resolveFlip', () => {
  const cards = [
    { id: '0-a', pairId: 0, symbolId: 'moon' },
    { id: '0-b', pairId: 0, symbolId: 'moon' },
    { id: '1-a', pairId: 1, symbolId: 'sun' },
  ];

  it('detects a matching pair', () => {
    assert.deepEqual(resolveFlip(cards, '0-a', '0-b'), {
      match: true,
      lockedIds: ['0-a', '0-b'],
    });
  });

  it('detects a mismatch', () => {
    assert.deepEqual(resolveFlip(cards, '0-a', '1-a'), {
      match: false,
      lockedIds: ['0-a', '1-a'],
    });
  });
});

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    assert.equal(formatTime(0), '00:00');
    assert.equal(formatTime(65000), '01:05');
  });
});

describe('createDeck symbol pairing', () => {
  it('gives both cards in a pair the same symbolId', () => {
    const symbols = Array.from({ length: 12 }, (_, index) => ({ id: `s${index}` }));
    const deck = createDeck(symbols, 4, seeded(21));
    const grouped = deck.reduce((map, card) => {
      const list = map.get(card.pairId) ?? [];
      list.push(card);
      map.set(card.pairId, list);
      return map;
    }, new Map());

    for (const pair of grouped.values()) {
      assert.equal(pair.length, 2);
      assert.equal(pair[0].symbolId, pair[1].symbolId);
    }
  });
});

describe('isBetterRecord', () => {
  it('prefers fewer moves, then faster time', () => {
    assert.equal(isBetterRecord({ moves: 10, timeMs: 9000 }, null), true);
    assert.equal(
      isBetterRecord({ moves: 10, timeMs: 8000 }, { moves: 12, timeMs: 4000 }),
      true,
    );
    assert.equal(
      isBetterRecord({ moves: 10, timeMs: 5000 }, { moves: 10, timeMs: 8000 }),
      true,
    );
    assert.equal(
      isBetterRecord({ moves: 12, timeMs: 1000 }, { moves: 10, timeMs: 9000 }),
      false,
    );
  });
});
