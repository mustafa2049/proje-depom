export interface CardFormValues {
  term: string;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2: string;
  phonetic: string;
  synonyms: string;
}

export type CardFormErrors = Partial<Record<keyof CardFormValues, string>>;

export const PART_OF_SPEECH_OPTIONS = ['noun', 'verb', 'adjective', 'adverb', 'phrasal verb', 'idiom'] as const;

/** Yeni kart formunu doğrular. Hata yoksa boş nesne döner. */
export function validateCardForm(values: CardFormValues): CardFormErrors {
  const errors: CardFormErrors = {};

  if (!values.term.trim()) {
    errors.term = 'Kelime veya kalıp zorunlu';
  }
  if (!values.translationTR.trim()) {
    errors.translationTR = 'Türkçe karşılık zorunlu';
  }
  if (!values.definitionEN.trim()) {
    errors.definitionEN = 'İngilizce tanım zorunlu';
  }
  if (!values.exampleSentence1.trim()) {
    errors.exampleSentence1 = 'En az bir örnek cümle zorunlu';
  }

  return errors;
}

/** Virgülle ayrılmış eş anlamlıları temizlenmiş diziye çevirir. */
export function parseSynonyms(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
