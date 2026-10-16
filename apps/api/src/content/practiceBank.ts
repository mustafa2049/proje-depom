import type { CEFRLevel } from '@prisma/client';

export interface WordOrderItem {
  level: CEFRLevel;
  sentence: string;
  translationTR: string;
}

export interface ClozeItem {
  level: CEFRLevel;
  /** Eksik kısım "___" ile gösterilir. */
  sentence: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanationTR: string;
}

export interface TranslationItem {
  level: CEFRLevel;
  sourceTR: string;
  referenceEN: string;
}

/** Kelime sıralama: cümle İngilizce, anlamı Türkçe verilir. */
export const WORD_ORDER_BANK: readonly WordOrderItem[] = [
  { level: 'A1', sentence: 'I like black coffee.', translationTR: 'Siyah kahveyi severim.' },
  { level: 'A1', sentence: 'She has a red bag.', translationTR: 'Kırmızı bir çantası var.' },
  { level: 'A2', sentence: 'Can you tell me the way to the station?', translationTR: 'İstasyona giden yolu bana söyleyebilir misin?' },
  { level: 'A2', sentence: 'We went to the beach last summer.', translationTR: 'Geçen yaz sahile gittik.' },
  { level: 'B1', sentence: 'If it rains, we will stay at home.', translationTR: 'Yağmur yağarsa evde kalacağız.' },
  { level: 'B1', sentence: 'I have been living here for five years.', translationTR: 'Burada beş yıldır yaşıyorum.' },
  { level: 'B2', sentence: 'The report should have been finished by Monday.', translationTR: 'Rapor pazartesiye kadar bitmiş olmalıydı.' },
  { level: 'C1', sentence: 'Had I known about the delay, I would have taken another route.', translationTR: 'Gecikmeden haberim olsaydı başka bir yol seçerdim.' },
];

/** Boşluk doldurma: 4 şıktan doğru olanı seçilir. */
export const CLOZE_BANK: readonly ClozeItem[] = [
  {
    level: 'A1',
    sentence: 'I am ___ Istanbul.',
    options: ['in', 'on', 'at', 'from'],
    answerIndex: 3,
    explanationTR: 'Bir yerden geldiğini söylerken "from" kullanılır.',
  },
  {
    level: 'A1',
    sentence: 'She ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
    explanationTR: 'Üçüncü tekil şahısta (she/he/it) fiile -s eklenir.',
  },
  {
    level: 'A2',
    sentence: 'We have lived here ___ 2019.',
    options: ['since', 'for', 'during', 'while'],
    answerIndex: 0,
    explanationTR: 'Belirli bir başlangıç noktasından beri için "since" kullanılır.',
  },
  {
    level: 'A2',
    sentence: 'He is interested ___ history.',
    options: ['in', 'at', 'on', 'for'],
    answerIndex: 0,
    explanationTR: '"be interested in" sabit bir kalıptır.',
  },
  {
    level: 'B1',
    sentence: 'The meeting was ___ because of the storm.',
    options: ['cancelled', 'cancel', 'cancelling', 'cancels'],
    answerIndex: 0,
    explanationTR: 'Edilgen yapı (was + V3) kullanılmıştır: "was cancelled".',
  },
  {
    level: 'B1',
    sentence: 'Could you ___ the lights before you leave?',
    options: ['turn off', 'turn on', 'turn up', 'turn into'],
    answerIndex: 0,
    explanationTR: '"turn off" bir şeyi kapatmak anlamına gelen phrasal verb\'dür.',
  },
  {
    level: 'B2',
    sentence: 'If I ___ more time, I would learn Spanish.',
    options: ['had', 'have', 'would have', 'having'],
    answerIndex: 0,
    explanationTR: 'Hayali durumlar için ikinci koşul cümlesi: if + Past Simple, would + V1.',
  },
  {
    level: 'B2',
    sentence: 'She ___ the project by the time you arrive.',
    options: ['will have finished', 'will finish', 'is finishing', 'finished'],
    answerIndex: 0,
    explanationTR: 'Gelecekte belirli bir zamana kadar tamamlanmış olacak eylem için Future Perfect.',
  },
];

/** TR → EN çeviri pratiği: referans çeviri değerlendirmede karşılaştırma için kullanılmaz, yalnızca ipucu olarak saklanır. */
export const TRANSLATION_BANK: readonly TranslationItem[] = [
  { level: 'A1', sourceTR: 'Bugün hava çok güzel.', referenceEN: 'The weather is very nice today.' },
  { level: 'A2', sourceTR: 'Yarın saat üçte seni arayacağım.', referenceEN: 'I will call you at three o\'clock tomorrow.' },
  { level: 'B1', sourceTR: 'Bu projeyi bitirmek için daha fazla zamana ihtiyacımız var.', referenceEN: 'We need more time to finish this project.' },
  { level: 'B2', sourceTR: 'Eğer erken gelseydin, onunla tanışabilirdin.', referenceEN: 'If you had come earlier, you could have met him.' },
  { level: 'C1', sourceTR: 'Ne kadar çok çalışırsa, o kadar çok şey öğrenir.', referenceEN: 'The harder he works, the more he learns.' },
  { level: 'C1', sourceTR: 'Değişikliklere rağmen ekip hedeflerine ulaşmayı başardı.', referenceEN: 'Despite the changes, the team managed to reach its goals.' },
];
