import { ApiError } from './api';
import { api } from './apiClient';
import { cardFromLookup } from '../utils/cardFromLookup';
import type { LookupResult } from '../types/api';

export type SaveOutcome = 'created' | 'duplicate';

/** Sözlük sonucunu kişisel desteye kaydeder. Aynı kelime destede varsa "duplicate" döner. */
export async function saveLookupToDeck(result: LookupResult): Promise<SaveOutcome> {
  try {
    await api.cards.create(cardFromLookup(result));
    return 'created';
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return 'duplicate';
    }
    throw error;
  }
}

/** Kelimeyi bağlamıyla sorgulayıp (kart veya AI) doğrudan desteye ekler. */
export async function saveWordToDeck(word: string, contextSentence: string): Promise<{ outcome: SaveOutcome; result: LookupResult }> {
  const result = await api.reader.lookup(word, contextSentence);
  const outcome = await saveLookupToDeck(result);
  return { outcome, result };
}
