import type { CEFRLevel, PrismaClient } from '@prisma/client';

import { CLOZE_BANK, TRANSLATION_BANK, WORD_ORDER_BANK } from '../content/practiceBank';

import { visibleDecksWhere } from './deckService';

export type Random = () => number;

export const CEFR_ORDER: readonly CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export interface WordOrderExercise {
  id: string;
  type: 'WORD_ORDER';
  level: CEFRLevel;
  translationTR: string;
  /** Karışık sıradaki kelimeler (kullanıcıya gösterilir). */
  words: string[];
  /** Doğru cümle; kelimeler boşlukla birleştirilmiş hali. */
  answer: string;
}

export interface ClozeExercise {
  id: string;
  type: 'CLOZE';
  level: CEFRLevel;
  /** BANK: hazır soru. CARD: kullanıcının kendi kartının örnek cümlesinden üretildi. */
  source: 'BANK' | 'CARD';
  sentence: string;
  options: string[];
  answerIndex: number;
  explanationTR: string;
}

export interface TranslationExercise {
  id: string;
  type: 'TRANSLATION';
  level: CEFRLevel;
  sourceTR: string;
  referenceEN: string;
}

export type PracticeExercise = WordOrderExercise | ClozeExercise | TranslationExercise;

/** Fisher-Yates karıştırma. `random` enjekte edilebilir, böylece testler deterministik olur. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T];
  }
  return result;
}

/** Cümleyi kelimelerine ayırıp karıştırır; sonuç orijinal sıradan farklıdır (mümkünse). */
export function shuffleWords(sentence: string, random: Random = Math.random): string[] {
  const words = sentence.trim().split(/\s+/);
  if (words.length < 2) {
    return words;
  }

  const original = words.join(' ');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = shuffle(words, random);
    if (candidate.join(' ') !== original) {
      return candidate;
    }
  }
  return [...words.slice(1), words[0] as string];
}

/** Seviye uzaklığına göre sıralar (önce tam eşleşme, sonra komşu seviyeler), eşitlikleri rastgele kırar. */
export function pickByLevel<T extends { level: CEFRLevel }>(
  items: readonly T[],
  level: CEFRLevel,
  count: number,
  random: Random = Math.random,
): T[] {
  const target = CEFR_ORDER.indexOf(level);
  const distance = (item: T) => Math.abs(CEFR_ORDER.indexOf(item.level) - target);
  return shuffle(items, random)
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, count);
}

interface CardCandidate {
  id: string;
  term: string;
  partOfSpeech: string;
  translationTR: string;
  exampleSentence1: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Kullanıcının kendi kartının örnek cümlesinden boşluk doldurma sorusu üretir.
 * Çeldiriciler aynı sözcük türünden diğer kartlardan seçilir; en az 3 çeldirici yoksa null döner.
 */
export function buildClozeFromCard(
  card: CardCandidate,
  level: CEFRLevel,
  pool: readonly CardCandidate[],
  random: Random = Math.random,
): ClozeExercise | null {
  const termPattern = new RegExp(`\\b${escapeRegExp(card.term)}\\b`, 'i');
  if (!termPattern.test(card.exampleSentence1)) {
    return null;
  }

  const others = pool.filter((item) => item.term.toLowerCase() !== card.term.toLowerCase());
  const sameType = others.filter((item) => item.partOfSpeech === card.partOfSpeech);
  const distractorSource = sameType.length >= 3 ? sameType : others;
  const distractors = shuffle(distractorSource, random)
    .slice(0, 3)
    .map((item) => item.term);
  if (distractors.length < 3) {
    return null;
  }

  const options = shuffle([card.term, ...distractors], random);
  return {
    id: `cl-card-${card.id}`,
    type: 'CLOZE',
    level,
    source: 'CARD',
    sentence: card.exampleSentence1.replace(termPattern, '___'),
    options,
    answerIndex: options.indexOf(card.term),
    explanationTR: `Doğru cevap "${card.term}" (${card.translationTR}).`,
  };
}

export interface BuildExercisesInput {
  level: CEFRLevel;
  count: number;
}

/**
 * Üç tipten eşit sayıda interaktif soru üretir:
 *  - WORD_ORDER: kelime sıralama (hazır havuz)
 *  - CLOZE: kullanıcının kartlarından üretilen sorular, eksik kalan kısım hazır havuzdan tamamlanır
 *  - TRANSLATION: TR → EN çeviri (değerlendirme /api/ai/analyze-sentence ile yapılır)
 */
export async function buildExercises(
  db: PrismaClient,
  userId: string,
  input: BuildExercisesInput,
  random: Random = Math.random,
): Promise<{ level: CEFRLevel; exercises: PracticeExercise[] }> {
  const perType = Math.max(1, Math.ceil(input.count / 3));

  const cards: CardCandidate[] = await db.card.findMany({
    where: { deck: { ...visibleDecksWhere(userId), level: input.level } },
    select: { id: true, term: true, partOfSpeech: true, translationTR: true, exampleSentence1: true },
    take: 300,
  });
  const uniqueCards = [...new Map(cards.map((card) => [card.term.toLowerCase(), card])).values()];

  const cardCloze = shuffle(uniqueCards, random)
    .map((card) => buildClozeFromCard(card, input.level, uniqueCards, random))
    .filter((exercise): exercise is ClozeExercise => exercise !== null)
    .slice(0, perType);

  const bankCloze: ClozeExercise[] = pickByLevel(
    CLOZE_BANK.map((item, index) => ({ ...item, index })),
    input.level,
    perType,
    random,
  ).map((item) => ({
    id: `cl-${item.index}`,
    type: 'CLOZE',
    level: item.level,
    source: 'BANK',
    sentence: item.sentence,
    options: [...item.options],
    answerIndex: item.answerIndex,
    explanationTR: item.explanationTR,
  }));

  const wordOrder: WordOrderExercise[] = pickByLevel(
    WORD_ORDER_BANK.map((item, index) => ({ ...item, index })),
    input.level,
    perType,
    random,
  ).map((item) => ({
    id: `wo-${item.index}`,
    type: 'WORD_ORDER',
    level: item.level,
    translationTR: item.translationTR,
    words: shuffleWords(item.sentence, random),
    answer: item.sentence,
  }));

  const translation: TranslationExercise[] = pickByLevel(
    TRANSLATION_BANK.map((item, index) => ({ ...item, index })),
    input.level,
    perType,
    random,
  ).map((item) => ({
    id: `tr-${item.index}`,
    type: 'TRANSLATION',
    level: item.level,
    sourceTR: item.sourceTR,
    referenceEN: item.referenceEN,
  }));

  const cloze = [...cardCloze, ...bankCloze].slice(0, perType);
  const exercises = shuffle<PracticeExercise>([...wordOrder, ...cloze, ...translation], random).slice(0, input.count);

  return { level: input.level, exercises };
}
