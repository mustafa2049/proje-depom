import { useCallback } from 'react';
import { useToast } from '../components/Toast';
import { PERSONAL_DECK_ID } from '../data/decks';
import type { GlossaryEntry } from '../data/modules';
import { slugify } from '../data/words';
import type { Word } from '../lib/types';
import { useStore } from './AppStore';

export function glossaryToWord(g: GlossaryEntry, id = slugify(g.word)): Word {
  return {
    id,
    word: g.word,
    ipa: g.ipa,
    pos: g.pos,
    cefr: g.cefr,
    meaning: g.meaning,
    examples: g.example ? [g.example] : [],
    collocations: g.collocations,
    deckId: PERSONAL_DECK_ID,
  };
}

/**
 * Bir kelimeyi Leitner Kutu 1'e ekler. Kelime sözlükte varsa kart başlatılır,
 * yoksa modül sözlüğündeki bilgiyle kişisel desteye eklenir.
 * Dönüş: kart yeni oluşturulduysa true.
 */
export function useAddToBox() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  return useCallback(
    (input: string | Word | GlossaryEntry, silent = false): boolean => {
      const word: Word | undefined =
        typeof input === 'string' ? words[input] : 'id' in input && 'examples' in input ? (input as Word) : glossaryToWord(input as GlossaryEntry);
      if (!word) return false;
      const card = state.cards[word.id];
      if (card) {
        if (!silent) toast(`Zaten Kutu ${card.box}’te`, { description: `${word.word} kelimesini çalışıyorsun.`, tone: 'info', icon: 'inventory_2' });
        return false;
      }
      if (words[word.id]) dispatch({ type: 'introduce', wordId: word.id, box: 1 });
      else dispatch({ type: 'addWord', word, box: 1 });
      if (!silent) toast('Leitner Kutusuna Eklendi!', { description: `${word.word} Kutu 1’e yerleştirildi.` });
      return true;
    },
    [state.cards, words, dispatch, toast],
  );
}
