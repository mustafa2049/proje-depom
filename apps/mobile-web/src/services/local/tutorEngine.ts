import type { ScenarioKey, SentenceAnalysis, VocabularyItem } from '../../types/api';

/**
 * Sunucusuz mod için kural tabanlı eğitmen. Yapay zeka sağlayıcısı olmadan çalışır:
 *  - Sık yapılan hataları (I/i, he don't, a/an, didn't went, büyük harf, noktalama) düzeltir.
 *  - Senaryoya göre sıradaki soruyu sorar.
 *  - Mesajda geçen ve destelerde bulunan kelimeleri kelime listesine ekler.
 */

export interface GrammarIssue {
  rule: string;
  explanationTR: string;
}

export interface GrammarCheck {
  corrected: string;
  issues: GrammarIssue[];
}

const MODALS_AND_AUXILIARIES = new Set([
  'can', 'could', 'will', 'would', 'shall', 'should', 'must', 'may', 'might',
  'do', 'does', 'did', "don't", "doesn't", "didn't", 'to', 'let', 'make', 'help', 'not',
]);

const THIRD_PERSON_VERBS = [
  'go', 'do', 'want', 'like', 'need', 'work', 'live', 'play', 'make', 'know', 'think', 'say', 'get',
  'come', 'see', 'look', 'take', 'use', 'find', 'give', 'tell', 'love', 'watch', 'study', 'try', 'read', 'write',
];

const PAST_TO_BASE: Record<string, string> = {
  went: 'go', saw: 'see', ate: 'eat', came: 'come', did: 'do', had: 'have', took: 'take', made: 'make',
  said: 'say', bought: 'buy', got: 'get', gave: 'give', wrote: 'write', told: 'tell', knew: 'know',
  thought: 'think', found: 'find', left: 'leave', felt: 'feel', brought: 'bring', began: 'begin',
  spoke: 'speak', drank: 'drink', ran: 'run', slept: 'sleep', met: 'meet', paid: 'pay', sent: 'send',
};

const QUESTION_STARTERS = new Set([
  'what', 'where', 'when', 'why', 'how', 'who', 'whom', 'whose', 'which', 'do', 'does', 'did', 'is', 'are',
  'am', 'was', 'were', 'can', 'could', 'would', 'will', 'should', 'have', 'has', 'may', 'might', 'shall',
]);

/** "a" yazılan ama sesli harfle başlamayan sesle okunan kelimeler (a university, a one-way...). */
const CONSONANT_SOUND_VOWEL_WORDS = /^(uni|use|usu|uti|eu|one|once|ur[aeiou])/i;
/** "an" yazılan ve h harfi okunmayan kelimeler (an hour, an honest...). */
const SILENT_H_WORDS = /^(hour|honest|honou?r|heir)/i;

function thirdPerson(verb: string): string {
  const lower = verb.toLowerCase();
  if (lower === 'go' || lower === 'do') return `${verb}es`;
  if (/(s|sh|ch|x|z|o)$/i.test(lower)) return `${verb}es`;
  if (/[^aeiou]y$/i.test(lower)) return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
}

function previousWord(text: string, offset: number): string {
  const before = text.slice(0, offset).trim().split(/\s+/);
  return (before[before.length - 1] ?? '').toLowerCase().replace(/[^a-z']/g, '');
}

/** Ortak hataları düzeltir; her kural yalnızca bir değişiklik yaptıysa sorun olarak raporlanır. */
export function checkGrammar(input: string): GrammarCheck {
  const issues: GrammarIssue[] = [];
  let text = input.replace(/\s+/g, ' ').trim();

  function apply(rule: string, explanationTR: string, transform: (value: string) => string): void {
    const next = transform(text);
    if (next !== text) {
      text = next;
      if (!issues.some((issue) => issue.rule === rule)) {
        issues.push({ rule, explanationTR });
      }
    }
  }

  apply('pronoun-i', '"I" (ben) zamiri her zaman büyük harfle yazılır.', (value) => value.replace(/\bi\b/g, 'I'));

  apply('does-not', 'He/she/it ile "don\'t" yerine "doesn\'t" kullanılır.', (value) =>
    value.replace(/\b(he|she|it)\s+don't\b/gi, (_match, subject: string) => `${subject} doesn't`),
  );

  apply('be-agreement', '"to be" fiili özneye uymalı: I am, he/she/it is, you/we/they are.', (value) =>
    value
      .replace(/\bI\s+(is|are)\b/g, 'I am')
      .replace(/\b(he|she|it)\s+are\b/gi, (_match, subject: string) => `${subject} is`)
      .replace(/\b(you|we|they)\s+is\b/gi, (_match, subject: string) => `${subject} are`),
  );

  apply('has', 'Üçüncü tekil şahısta (he/she/it) "have" yerine "has" kullanılır.', (value) =>
    value.replace(/\b(he|she|it)\s+have\b/gi, (match, subject: string, offset: number) =>
      MODALS_AND_AUXILIARIES.has(previousWord(value, offset)) ? match : `${subject} has`,
    ),
  );

  const verbPattern = new RegExp(`\\b(he|she|it)\\s+(${THIRD_PERSON_VERBS.join('|')})\\b`, 'gi');
  apply('third-person-s', 'Geniş zamanda he/she/it öznesiyle fiile -s/-es eklenir (she works, he goes).', (value) =>
    value.replace(verbPattern, (match, subject: string, verb: string, offset: number) =>
      MODALS_AND_AUXILIARIES.has(previousWord(value, offset)) ? match : `${subject} ${thirdPerson(verb)}`,
    ),
  );

  const pastPattern = new RegExp(`\\b(didn't|did not)\\s+(${Object.keys(PAST_TO_BASE).join('|')})\\b`, 'gi');
  apply('did-base', '"didn\'t" sonrasında fiilin yalın hâli kullanılır (didn\'t go).', (value) =>
    value.replace(pastPattern, (_match, negation: string, verb: string) => `${negation} ${PAST_TO_BASE[verb.toLowerCase()] ?? verb}`),
  );

  apply('article', 'Sesli harfle okunan kelimeden önce "an", sessiz harfle okunandan önce "a" kullanılır.', (value) =>
    value
      .replace(/\b(a|A)\s+([aeiou][\w-]*)/g, (match, article: string, word: string) =>
        CONSONANT_SOUND_VOWEL_WORDS.test(word) ? match : `${article === 'A' ? 'An' : 'an'} ${word}`,
      )
      .replace(/\b(an|An)\s+([b-df-hj-np-tv-z][\w-]*)/g, (match, article: string, word: string) =>
        SILENT_H_WORDS.test(word) ? match : `${article === 'An' ? 'A' : 'a'} ${word}`,
      ),
  );

  apply('double-comparative', '-er ekli karşılaştırmalı sıfatla birlikte "more" kullanılmaz (better, easier).', (value) =>
    value.replace(/\bmore\s+(better|worse|easier|bigger|smaller|faster|cheaper|happier|harder)\b/gi, '$1'),
  );

  apply('capital', 'Cümle büyük harfle başlamalı.', (value) => value.charAt(0).toUpperCase() + value.slice(1));

  apply('punctuation', 'Cümle bir noktalama işaretiyle (. ? !) bitmeli.', (value) => {
    if (!value || /[.!?…]["')\]]?$/.test(value)) {
      return value;
    }
    const firstWord = value.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? '';
    return `${value}${QUESTION_STARTERS.has(firstWord) ? '?' : '.'}`;
  });

  return { corrected: text, issues };
}

interface ScriptLine {
  en: string;
  tr: string;
}

interface ScenarioScript {
  questions: ScriptLine[];
  vocabulary: VocabularyItem[];
}

const SCRIPTS: Record<ScenarioKey, ScenarioScript> = {
  'job-interview': {
    questions: [
      { en: 'Could you tell me a little about yourself?', tr: 'Bana biraz kendinden bahseder misin?' },
      { en: 'Why do you want to work for our company?', tr: 'Neden şirketimizde çalışmak istiyorsun?' },
      { en: 'What are your greatest strengths?', tr: 'En güçlü yönlerin neler?' },
      { en: 'Can you describe a difficult problem you solved at work?', tr: 'İşte çözdüğün zor bir problemi anlatabilir misin?' },
      { en: 'How do you handle stress and tight deadlines?', tr: 'Stresle ve sıkışık teslim tarihleriyle nasıl başa çıkarsın?' },
      { en: 'Where do you see yourself in five years?', tr: 'Beş yıl sonra kendini nerede görüyorsun?' },
      { en: 'Do you prefer working alone or in a team? Why?', tr: 'Tek başına mı yoksa ekiple mi çalışmayı tercih edersin? Neden?' },
      { en: 'Do you have any questions for us?', tr: 'Bize sormak istediğin bir şey var mı?' },
    ],
    vocabulary: [
      { term: 'experience', translationTR: 'deneyim', example: 'I have three years of experience in sales.' },
      { term: 'strength', translationTR: 'güçlü yön', example: 'My main strength is communication.' },
      { term: 'responsible for', translationTR: '-den sorumlu', example: 'I was responsible for the customer reports.' },
    ],
  },
  'airport-check-in': {
    questions: [
      { en: 'Good morning! May I see your passport and ticket, please?', tr: 'Günaydın! Pasaportunuzu ve biletinizi görebilir miyim?' },
      { en: 'Where are you flying to today?', tr: 'Bugün nereye uçuyorsunuz?' },
      { en: 'How many bags would you like to check in?', tr: 'Kaç bavul teslim etmek istersiniz?' },
      { en: 'Would you prefer a window seat or an aisle seat?', tr: 'Cam kenarı mı yoksa koridor tarafı mı tercih edersiniz?' },
      { en: 'Did you pack your bags yourself?', tr: 'Bavullarınızı kendiniz mi hazırladınız?' },
      { en: 'What is the purpose of your trip?', tr: 'Seyahatinizin amacı nedir?' },
      { en: 'How long are you going to stay?', tr: 'Ne kadar kalacaksınız?' },
      { en: 'Is there anything else I can help you with?', tr: 'Size yardımcı olabileceğim başka bir şey var mı?' },
    ],
    vocabulary: [
      { term: 'boarding pass', translationTR: 'biniş kartı', example: 'Here is your boarding pass.' },
      { term: 'aisle seat', translationTR: 'koridor tarafı koltuk', example: 'I would like an aisle seat, please.' },
      { term: 'carry-on bag', translationTR: 'kabin bagajı', example: 'I only have a carry-on bag.' },
    ],
  },
  'cafe-order': {
    questions: [
      { en: 'Hi there! What can I get for you today?', tr: 'Merhaba! Bugün size ne getirebilirim?' },
      { en: 'Would you like that hot or iced?', tr: 'Sıcak mı yoksa buzlu mu istersiniz?' },
      { en: 'What size would you like: small, medium, or large?', tr: 'Hangi boy istersiniz: küçük, orta mı büyük mü?' },
      { en: 'Would you like anything to eat with that?', tr: 'Yanında yiyecek bir şey ister misiniz?' },
      { en: 'Is that for here or to go?', tr: 'Burada mı yiyeceksiniz yoksa paket mi?' },
      { en: 'How would you like to pay?', tr: 'Nasıl ödemek istersiniz?' },
      { en: 'Can I have a name for the order?', tr: 'Sipariş için bir isim alabilir miyim?' },
      { en: 'Is everything okay with your order?', tr: 'Siparişinizle ilgili her şey yolunda mı?' },
    ],
    vocabulary: [
      { term: 'to go', translationTR: 'paket (götürmek üzere)', example: 'A latte to go, please.' },
      { term: 'receipt', translationTR: 'fiş, makbuz', example: 'Could I have the receipt, please?' },
      { term: 'refill', translationTR: 'tekrar doldurma', example: 'Do you offer free refills?' },
    ],
  },
  'technical-meeting': {
    questions: [
      { en: "Let's start with a quick update. What did you work on yesterday?", tr: 'Kısa bir güncellemeyle başlayalım. Dün ne üzerinde çalıştın?' },
      { en: 'Are there any blockers slowing you down?', tr: 'Seni yavaşlatan engeller var mı?' },
      { en: 'How would you approach this new feature?', tr: 'Bu yeni özelliğe nasıl yaklaşırsın?' },
      { en: 'What are the risks of this solution?', tr: 'Bu çözümün riskleri neler?' },
      { en: 'How long do you think it will take?', tr: 'Sence ne kadar sürer?' },
      { en: 'How are we going to test this change?', tr: 'Bu değişikliği nasıl test edeceğiz?' },
      { en: 'Who should review the code before we merge it?', tr: 'Birleştirmeden önce kodu kim incelemeli?' },
      { en: 'What are the next steps for you this week?', tr: 'Bu hafta senin için sonraki adımlar neler?' },
    ],
    vocabulary: [
      { term: 'blocker', translationTR: 'engel (işi durduran sorun)', example: 'The missing API key is a blocker.' },
      { term: 'deadline', translationTR: 'son teslim tarihi', example: 'The deadline for the release is Friday.' },
      { term: 'deploy', translationTR: 'yayına almak', example: 'We will deploy the fix tonight.' },
    ],
  },
  'free-talk': {
    questions: [
      { en: 'How was your day today?', tr: 'Bugün günün nasıl geçti?' },
      { en: 'What do you usually do on weekends?', tr: 'Hafta sonları genellikle ne yaparsın?' },
      { en: 'What kind of music or films do you like?', tr: 'Ne tür müzik ya da filmlerden hoşlanırsın?' },
      { en: 'Tell me about a place you would like to visit.', tr: 'Ziyaret etmek istediğin bir yerden bahset.' },
      { en: 'What is your favorite food, and why?', tr: 'En sevdiğin yemek ne ve neden?' },
      { en: 'Why are you learning English?', tr: 'Neden İngilizce öğreniyorsun?' },
      { en: 'What did you do last weekend?', tr: 'Geçen hafta sonu ne yaptın?' },
      { en: 'What are your plans for next month?', tr: 'Gelecek ay için planların neler?' },
    ],
    vocabulary: [
      { term: 'hobby', translationTR: 'hobi', example: 'Reading is my favorite hobby.' },
      { term: 'weekend', translationTR: 'hafta sonu', example: 'I relax at home on the weekend.' },
      { term: 'plan', translationTR: 'plan, planlamak', example: 'I plan to travel next month.' },
    ],
  },
};

const PERFECT_ACKS: ScriptLine[] = [
  { en: 'Great answer!', tr: 'Harika bir cevap!' },
  { en: 'Nice, that sounds natural.', tr: 'Güzel, kulağa doğal geliyor.' },
  { en: 'Thanks, that was clear.', tr: 'Teşekkürler, gayet açıktı.' },
];

const CORRECTION_ACKS: ScriptLine[] = [
  { en: 'Thanks! I understood you. Check the small correction below.', tr: 'Teşekkürler! Seni anladım. Aşağıdaki küçük düzeltmeye göz at.' },
  { en: 'Good effort! There is a small fix below.', tr: 'Güzel çaba! Aşağıda küçük bir düzeltme var.' },
];

const QUESTION_ACK: ScriptLine = {
  en: "Good question! Let's keep practicing.",
  tr: 'Güzel soru! Pratik yapmaya devam edelim.',
};

/** Mesajlarda kelime çıkarırken atlanan çok yaygın kelimeler. */
const STOPWORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'have', 'from', 'your', 'what', 'about', 'there', 'their', 'would',
  'could', 'should', 'will', 'were', 'been', 'they', 'them', 'then', 'than', 'into', 'some', 'very', 'like',
  'want', 'just', 'also', 'when', 'where', 'which', 'while', 'today', 'good', 'well', 'much', 'many',
]);

/** Kelime çıkarımı için kullanılan sözlük girdisi (deste kartlarından türetilir). */
export interface VocabularySource {
  term: string;
  translationTR: string;
  example: string;
}

/** Metinde geçen sözlük kelimelerini bulur (önce çok kelimeli ifadeler, sonra tek kelimeler). */
export function extractVocabulary(text: string, pool: readonly VocabularySource[], max = 3): VocabularyItem[] {
  let remaining = ` ${text.toLowerCase().replace(/[^a-z'\s-]/g, ' ').replace(/\s+/g, ' ')} `;
  const found: VocabularyItem[] = [];
  const seen = new Set<string>();

  const candidates = [...pool].sort((a, b) => b.term.length - a.term.length);
  for (const entry of candidates) {
    const term = entry.term.toLowerCase();
    if (found.length >= max) break;
    if (seen.has(term) || term.length < 4 || STOPWORDS.has(term)) continue;
    if (remaining.includes(` ${term} `)) {
      seen.add(term);
      found.push({ term: entry.term, translationTR: entry.translationTR, example: entry.example });
      // Eşleşen ifade çıkarılır; "look forward to" bulunduysa içindeki "look" ayrıca sayılmaz.
      remaining = remaining.split(` ${term} `).join(' ');
    }
  }
  return found;
}

export interface TutorTurnInput {
  scenario: ScenarioKey;
  message: string;
  /** Oturumdaki önceki eğitmen yanıtı sayısı (sıradaki soruyu seçer). */
  turn: number;
  vocabularyPool: readonly VocabularySource[];
}

export interface TutorTurnOutput {
  reply: string;
  replyTranslationTR: string;
  isPerfect: boolean;
  correctedUserMessage: string | null;
  nativeAlternative: string | null;
  explanationTR: string;
  extractedVocabulary: VocabularyItem[];
}

/** Bir sohbet turunu üretir: dilbilgisi geri bildirimi + senaryodaki sıradaki soru + kelimeler. */
export function runTutorTurn(input: TutorTurnInput): TutorTurnOutput {
  const script = SCRIPTS[input.scenario];
  const check = checkGrammar(input.message);
  const isPerfect = check.issues.length === 0;

  const acks = isPerfect ? PERFECT_ACKS : CORRECTION_ACKS;
  const ack = input.message.trim().endsWith('?') ? QUESTION_ACK : (acks[input.turn % acks.length] as ScriptLine);
  const question = script.questions[input.turn % script.questions.length] as ScriptLine;

  const fromMessage = extractVocabulary(`${input.message} ${question.en}`, input.vocabularyPool);
  const scenarioWords = script.vocabulary.filter(
    (item) => !fromMessage.some((found) => found.term.toLowerCase() === item.term.toLowerCase()),
  );
  const extractedVocabulary = [...fromMessage, ...scenarioWords].slice(0, 3);

  return {
    reply: `${ack.en} ${question.en}`,
    replyTranslationTR: `${ack.tr} ${question.tr}`,
    isPerfect,
    correctedUserMessage: isPerfect ? null : check.corrected,
    nativeAlternative: isPerfect ? null : check.corrected,
    explanationTR: isPerfect
      ? 'Cümlen gramer açısından doğru, harika!'
      : check.issues.map((issue) => issue.explanationTR).join(' '),
    extractedVocabulary,
  };
}

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is',
  "she's": 'she is', "it's": 'it is', "that's": 'that is', "there's": 'there is', "don't": 'do not',
  "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', "cannot": 'can not', "won't": 'will not',
  "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "i'll": 'i will',
  "we'll": 'we will', "you'll": 'you will', "i've": 'i have', "we've": 'we have', "i'd": 'i would',
  "haven't": 'have not', "hasn't": 'has not', "let's": 'let us', "shouldn't": 'should not',
  "wouldn't": 'would not', "couldn't": 'could not',
};

/** Karşılaştırma için kelimelere ayırır: küçük harf, kısaltmalar açılmış, noktalama atılmış. */
export function tokensOf(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[’]/g, "'")
    .split(/\s+/)
    .flatMap((word) => {
      const clean = word.replace(/^[^a-z']+|[^a-z']+$/g, '');
      return (CONTRACTIONS[clean] ?? clean).split(' ');
    })
    .map((word) => word.replace(/'/g, ''))
    .filter(Boolean);
}

/** İki cümlenin kelime örtüşmesi (F1, 0–1). */
export function tokenOverlap(candidate: readonly string[], reference: readonly string[]): number {
  if (candidate.length === 0 || reference.length === 0) {
    return 0;
  }
  const remaining = new Map<string, number>();
  for (const token of reference) {
    remaining.set(token, (remaining.get(token) ?? 0) + 1);
  }
  let matches = 0;
  for (const token of candidate) {
    const count = remaining.get(token) ?? 0;
    if (count > 0) {
      matches += 1;
      remaining.set(token, count - 1);
    }
  }
  const precision = matches / candidate.length;
  const recall = matches / reference.length;
  return precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Kabul eşiği: referans çeviriyle bu oranda örtüşen ve gramer hatası olmayan cümle doğru sayılır. */
export const TRANSLATION_PASS_OVERLAP = 0.8;

/**
 * Cümle analizi (sunucusuz). Referans çeviri biliniyorsa kelime örtüşmesine göre puanlar,
 * bilinmiyorsa yalnızca dilbilgisi kurallarına bakar.
 */
export function analyzeSentenceLocally(sentence: string, referenceEN?: string): SentenceAnalysis {
  const check = checkGrammar(sentence);
  const grammarNotes = check.issues.map((issue) => issue.explanationTR);

  if (!referenceEN) {
    const score = clamp(95 - check.issues.length * 15, 0, 100);
    return {
      score,
      isCorrect: check.issues.length === 0,
      correctedSentence: check.corrected,
      nativeAlternative: check.corrected,
      grammarNotesTR: grammarNotes,
      naturalnessScore: clamp(Math.round(score / 10), 1, 10),
    };
  }

  const candidateTokens = tokensOf(check.corrected);
  const referenceTokens = tokensOf(referenceEN);
  const overlap = tokenOverlap(candidateTokens, referenceTokens);
  const score = clamp(Math.round(overlap * 100) - check.issues.length * 5, 0, 100);

  const candidateSet = new Set(candidateTokens);
  const missing = [...new Set(referenceTokens.filter((token) => !candidateSet.has(token)))].slice(0, 5);
  const notes = [...grammarNotes];
  if (missing.length > 0 && overlap < 1) {
    notes.push(`Referans çeviride olup senin cümlende olmayan kelimeler: ${missing.join(', ')}.`);
  }

  return {
    score,
    isCorrect: overlap >= TRANSLATION_PASS_OVERLAP && check.issues.length === 0,
    correctedSentence: check.corrected,
    nativeAlternative: referenceEN,
    grammarNotesTR: notes.slice(0, 10),
    naturalnessScore: clamp(Math.round(score / 10), 1, 10),
  };
}
