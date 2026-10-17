import type { CEFRLevel, PrismaClient } from '@prisma/client';
import { composeExercises, type PracticeExercise, type Random } from '@proje-depom/shared';

import { visibleDecksWhere } from './deckService';

export {
  buildClozeFromCard,
  CEFR_ORDER,
  pickByLevel,
  shuffle,
  shuffleWords,
  type ClozeExercise,
  type PracticeExercise,
  type Random,
  type TranslationExercise,
  type WordOrderExercise,
} from '@proje-depom/shared';

export interface BuildExercisesInput {
  level: CEFRLevel;
  count: number;
}

/** Kullanıcının seviyeye uygun kartlarını yükleyip ortak üreticiyle (composeExercises) soru seti oluşturur. */
export async function buildExercises(
  db: PrismaClient,
  userId: string,
  input: BuildExercisesInput,
  random: Random = Math.random,
): Promise<{ level: CEFRLevel; exercises: PracticeExercise[] }> {
  const cards = await db.card.findMany({
    where: { deck: { ...visibleDecksWhere(userId), level: input.level } },
    select: { id: true, term: true, partOfSpeech: true, translationTR: true, exampleSentence1: true },
    take: 300,
  });

  return composeExercises({ level: input.level, count: input.count, cards }, random);
}
