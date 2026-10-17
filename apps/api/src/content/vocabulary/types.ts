/** Seed verisindeki CEFR seviyeleri; Prisma `CEFRLevel` enum'uyla birebir aynıdır. */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabularyCard {
  /** Kalıcı kimlik: kart kimliği `seed-card-{slug}` olur. Yeniden adlandırılırsa SRS ilerlemesi kaybolur. */
  slug: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2: string;
  synonyms: string[];
}

export interface VocabularyDeck {
  /** Kalıcı kimlik: deste kimliği `seed-deck-{slug}` olur. */
  slug: string;
  title: string;
  description: string;
  level: CefrLevel;
  cards: VocabularyCard[];
}
