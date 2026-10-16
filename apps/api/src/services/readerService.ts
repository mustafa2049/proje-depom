import type { CEFRLevel, PrismaClient } from '@prisma/client';

import { READING_PASSAGES, type ReadingPassage } from '../content/readingPassages';
import { NotFoundError, ValidationError } from '../lib/errors';

import { buildWordLookupPrompt } from './aiPrompts';
import { wordLookupSchema, type WordLookupOutput } from './aiSchemas';
import { visibleDecksWhere } from './deckService';
import { parseModelJson, type LlmProvider } from './llmService';

export interface PassageSummary {
  id: string;
  title: string;
  level: CEFRLevel;
  category: ReadingPassage['category'];
  estimatedMinutes: number;
}

export function listPassages(level?: CEFRLevel): PassageSummary[] {
  return READING_PASSAGES.filter((passage) => !level || passage.level === level).map((passage) => ({
    id: passage.id,
    title: passage.title,
    level: passage.level,
    category: passage.category,
    estimatedMinutes: passage.estimatedMinutes,
  }));
}

export function getPassage(id: string): ReadingPassage {
  const passage = READING_PASSAGES.find((item) => item.id === id);
  if (!passage) {
    throw new NotFoundError('Okuma parçası bulunamadı');
  }
  return passage;
}

/** Kelimeyi karşılaştırma için normalize eder: boşlukları ve kenar noktalamayı temizler, küçük harfe çevirir. */
export function normalizeWord(raw: string): string {
  return raw
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

export interface LookupInput {
  word: string;
  contextSentence: string;
}

export interface LookupResult extends WordLookupOutput {
  /** DECK: kullanıcının erişebildiği bir kart bulundu. AI: sağlayıcı bağlamsal olarak çözümledi. */
  source: 'DECK' | 'AI';
  word: string;
  /** Mevcut kartın kimliği (yalnızca DECK kaynağında). */
  existingCardId: string | null;
}

/**
 * Kelime sözlük sorgusu:
 *  1. Kullanıcının erişebildiği kartlarda arar (sonuç: DECK). Bu durumda anlam kartın genel çevirisidir.
 *  2. Bulunamazsa LLM ile bağlamsal çözümleme yapılır (sonuç: AI).
 */
export async function lookupWord(
  db: PrismaClient,
  llm: LlmProvider,
  userId: string,
  input: LookupInput,
): Promise<LookupResult> {
  const word = normalizeWord(input.word);
  if (!word) {
    throw new ValidationError('Geçerli bir kelime girin');
  }

  const card = await db.card.findFirst({
    where: { AND: [{ term: { equals: word, mode: 'insensitive' } }, { deck: visibleDecksWhere(userId) }] },
  });
  if (card) {
    return {
      source: 'DECK',
      word,
      translationTR: card.translationTR,
      partOfSpeech: card.partOfSpeech,
      phonetic: card.phonetic,
      definitionEN: card.definitionEN,
      exampleSentence: card.exampleSentence1,
      synonyms: card.synonyms,
      existingCardId: card.id,
    };
  }

  const raw = await llm.completeJson([
    { role: 'system', content: buildWordLookupPrompt() },
    { role: 'user', content: `Kelime: "${word}"\nCümle: "${input.contextSentence.trim()}"` },
  ]);
  const output = parseModelJson(raw, wordLookupSchema);

  return { ...output, source: 'AI', word, existingCardId: null };
}
