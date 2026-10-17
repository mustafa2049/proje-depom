import type { CreateCardRequest, LookupResult } from '../types/api';

/** Sözlük sonucunu kişisel deste kartı isteğine çevirir. */
export function cardFromLookup(result: LookupResult): CreateCardRequest {
  return {
    term: result.word,
    partOfSpeech: result.partOfSpeech,
    translationTR: result.translationTR,
    definitionEN: result.definitionEN,
    exampleSentence1: result.exampleSentence,
    ...(result.phonetic ? { phonetic: result.phonetic } : {}),
    synonyms: result.synonyms,
  };
}
