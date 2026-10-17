import { A1_DECK } from './a1';
import { A2_DECK } from './a2';
import { B1_DECK } from './b1';
import { B2_DECK } from './b2';
import { IDIOMS_DECK } from './idioms';
import { TECH_DECK } from './tech';
import type { VocabularyDeck } from './types';

export type { CefrLevel, VocabularyCard, VocabularyDeck } from './types';

/** Sistem destelerinin tamamı; seed bu listeyi işler. Sıra, destelerin görünme sırasıdır. */
export const VOCABULARY_DECKS: VocabularyDeck[] = [A1_DECK, A2_DECK, B1_DECK, B2_DECK, IDIOMS_DECK, TECH_DECK];
