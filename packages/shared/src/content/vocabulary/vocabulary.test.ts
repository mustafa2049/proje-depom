import { describe, expect, it } from 'vitest';

import { VOCABULARY_DECKS } from './index';

const ALL_CARDS = VOCABULARY_DECKS.flatMap((deck) => deck.cards);

/** Seed öncesi var olan 25 kartın kalıcı slug'ları. Yeniden adlandırmak SRS ilerlemesini kaybettirir. */
const LEGACY_CARD_SLUGS = [
  'book', 'friend', 'happy', 'eat', 'house', 'go',
  'decide', 'borrow', 'expensive', 'realize', 'advice', 'improve',
  'look-after', 'give-up', 'turn-down', 'run-out-of', 'put-off', 'figure-out',
  'achieve', 'opportunity', 'break-the-ice', 'same-page', 'deadline', 'negotiate', 'feedback',
];

describe('kelime destesi içeriği', () => {
  it('altı sistem destesi tanımlıdır', () => {
    expect(VOCABULARY_DECKS.map((deck) => deck.slug)).toEqual(['a1', 'a2', 'b1', 'b2', 'idioms', 'tech']);
  });

  it('her deste tam olarak 50 kart içerir', () => {
    for (const deck of VOCABULARY_DECKS) {
      expect(deck.cards, deck.slug).toHaveLength(50);
    }
  });

  it('deste ve kart kimlikleri benzersizdir', () => {
    const deckSlugs = VOCABULARY_DECKS.map((deck) => deck.slug);
    expect(new Set(deckSlugs).size).toBe(deckSlugs.length);

    const cardSlugs = ALL_CARDS.map((card) => card.slug);
    expect(new Set(cardSlugs).size).toBe(cardSlugs.length);
  });

  it('bir destede aynı terim iki kez geçmez', () => {
    for (const deck of VOCABULARY_DECKS) {
      const terms = deck.cards.map((card) => card.term.toLowerCase());
      expect(new Set(terms).size, deck.slug).toBe(terms.length);
    }
  });

  it('mevcut 25 kartın slug\'ları korunmuştur (SRS ilerlemesi için)', () => {
    const cardSlugs = new Set(ALL_CARDS.map((card) => card.slug));
    for (const slug of LEGACY_CARD_SLUGS) {
      expect(cardSlugs.has(slug), slug).toBe(true);
    }
  });

  it('her kartın tüm metin alanları dolu ve eş anlamlıları en az bir tanedir', () => {
    for (const card of ALL_CARDS) {
      expect(card.term.trim(), card.slug).not.toBe('');
      expect(card.phonetic.trim(), card.slug).not.toBe('');
      expect(card.partOfSpeech.trim(), card.slug).not.toBe('');
      expect(card.translationTR.trim(), card.slug).not.toBe('');
      expect(card.definitionEN.trim(), card.slug).not.toBe('');
      expect(card.exampleSentence1.trim(), card.slug).not.toBe('');
      expect(card.exampleSentence2.trim(), card.slug).not.toBe('');
      expect(card.synonyms.length, card.slug).toBeGreaterThanOrEqual(1);
      expect(card.synonyms.every((synonym) => synonym.trim() !== ''), card.slug).toBe(true);
    }
  });

  it('birinci örnek cümle terimi harfi harfine içerir (boşluk doldurma için)', () => {
    const misplaced = ALL_CARDS.filter(
      (card) => !card.exampleSentence1.toLowerCase().includes(card.term.toLowerCase()),
    ).map((card) => card.slug);
    expect(misplaced).toEqual([]);
  });
});
