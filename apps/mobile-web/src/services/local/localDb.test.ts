import { describe, expect, it } from 'vitest';

import { createMemoryStorage } from '../keyValueStorage';

import { createLocalDb, emptyLocalData } from './localDb';

describe('createLocalDb', () => {
  it('boş depoda boş veriyle başlar ve güncellemeleri kalıcı yazar', async () => {
    const storage = createMemoryStorage();
    const db = createLocalDb(storage, 'db');
    expect(await db.read()).toEqual(emptyLocalData());

    await db.update((data) => {
      data.activity['2026-10-01'] = { date: '2026-10-01', cardsReviewed: 1, correctCount: 1, durationSec: 3, xpEarned: 10 };
    });

    const reopened = createLocalDb(storage, 'db');
    expect((await reopened.read()).activity['2026-10-01']?.xpEarned).toBe(10);
  });

  it('mutator hata fırlatırsa değişiklik uygulanmaz', async () => {
    const db = createLocalDb(createMemoryStorage(), 'db');
    await expect(
      db.update((data) => {
        data.decks.push({ id: 'd1', title: 'X', description: null, level: 'A1', createdAt: '2026-10-01T00:00:00.000Z' });
        throw new Error('iptal');
      }),
    ).rejects.toThrow('iptal');
    expect((await db.read()).decks).toEqual([]);
  });

  it('okunamayan veriyi yedekler ve boş veriyle devam eder', async () => {
    const storage = createMemoryStorage();
    await storage.setItem('db', '{bozuk');
    const db = createLocalDb(storage, 'db');
    expect(await db.read()).toEqual(emptyLocalData());
    expect(await storage.getItem('db.backup')).toBe('{bozuk');
  });

  it('eşzamanlı güncellemeler sırayla uygulanır', async () => {
    const db = createLocalDb(createMemoryStorage(), 'db');
    await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        db.update((data) => {
          data.cards.push({
            id: `c${index}`, deckId: 'd', term: `t${index}`, phonetic: null, partOfSpeech: 'noun', translationTR: 'x',
            definitionEN: 'x', exampleSentence1: 'x', exampleSentence2: null, audioUrl: null, synonyms: [],
          });
        }),
      ),
    );
    expect((await db.read()).cards.map((card) => card.id)).toEqual(['c0', 'c1', 'c2', 'c3', 'c4']);
  });
});
