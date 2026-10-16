import { z } from 'zod';

/**
 * Sohbet asistanının (tutor) JSON çıktısı.
 */
export const tutorOutputSchema = z.object({
  reply: z.string().min(1),
  replyTranslationTR: z.string().min(1),
  isPerfect: z.boolean(),
  correctedUserMessage: z.string().nullable(),
  nativeAlternative: z.string().nullable(),
  explanationTR: z.string(),
  extractedVocabulary: z
    .array(
      z.object({
        term: z.string().min(1),
        translationTR: z.string().min(1),
        example: z.string(),
      }),
    )
    .max(10),
});

export type TutorOutput = z.infer<typeof tutorOutputSchema>;

/**
 * Cümle analizi (çeviri / cümle kurma modülü) JSON çıktısı.
 */
export const sentenceAnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  isCorrect: z.boolean(),
  correctedSentence: z.string().min(1),
  nativeAlternative: z.string().min(1),
  grammarNotesTR: z.array(z.string().min(1)).max(10),
  naturalnessScore: z.number().int().min(1).max(10),
});

export type SentenceAnalysis = z.infer<typeof sentenceAnalysisSchema>;
