import type { Cefr, PartOfSpeech } from '../lib/types';

/** Modüllerde geçen ama çekirdek sözlükte olmayan kelimeler için hafif kayıt. */
export interface GlossaryEntry {
  word: string;
  ipa: string;
  pos: PartOfSpeech;
  cefr: Cefr;
  meaning: string;
  example?: { en: string; tr: string };
  collocations?: string[];
}

// ─────────────────────────── Dizi & Film Replikleri ───────────────────────────

export interface SceneLine {
  id: string;
  show: string;
  level: string;
  image: string;
  en: string;
  tr: string;
  /** Sahnenin hedef kelimesi (sözlük kimliği) */
  target: string;
  /** Çok kelimeli ifadeler: dokunulan kelime → sözlük kimliği */
  links?: Record<string, string>;
  glossary?: Record<string, GlossaryEntry>;
  hint?: { phrase: string; meaning: string };
}

export const SCENES: SceneLine[] = [
  {
    id: 's1',
    show: 'Sitcom • Kafe Sahnesi',
    level: 'B1 - B2',
    image: 'images/scene-cafe.jpg',
    en: 'It was pure coincidence that we ran into each other at the café!',
    tr: 'Kafede birbirimize rastlamamız tamamen tesadüftü!',
    target: 'coincidence',
    links: { ran: 'run-into', into: 'run-into' },
    hint: { phrase: 'run into each other', meaning: 'birbiriyle plan yapmadan, rastgele karşılaşmak' },
  },
  {
    id: 's2',
    show: 'Sitcom • Ev Arkadaşları',
    level: 'B2',
    image: 'images/scene-cafe.jpg',
    en: "Don't freak out, but I think I have a crush on my roommate.",
    tr: 'Panik yapma ama sanırım ev arkadaşımdan hoşlanıyorum.',
    target: 'crush',
    links: { freak: 'freak-out', out: 'freak-out' },
    hint: { phrase: 'have a crush on someone', meaning: 'birinden (gizlice) hoşlanmak' },
  },
  {
    id: 's3',
    show: 'Sitcom • Akşam Yemeği',
    level: 'B2',
    image: 'images/scene-cafe.jpg',
    en: 'That was the most awkward dinner of my entire life.',
    tr: 'Bu hayatımın en garip akşam yemeğiydi.',
    target: 'awkward',
    glossary: {
      entire: { word: 'entire', ipa: '/ɪnˈtaɪə(r)/', pos: 'adjective', cefr: 'B1', meaning: 'Bütün, tüm', example: { en: 'I spent the entire day at home.', tr: 'Bütün günü evde geçirdim.' } },
    },
  },
  {
    id: 's4',
    show: 'Sitcom • İlk İş Günü',
    level: 'B1 - B2',
    image: 'images/scene-cafe.jpg',
    en: "Relax, it's a piece of cake. You'll get the hang of it.",
    tr: 'Rahatla, çocuk oyuncağı. Alışırsın.',
    target: 'piece-of-cake',
    links: { piece: 'piece-of-cake', cake: 'piece-of-cake', hang: 'get-the-hang-of' },
    hint: { phrase: 'get the hang of it', meaning: 'bir işe alışmak, püf noktasını kavramak' },
  },
  {
    id: 's5',
    show: 'Sitcom • Tartışma',
    level: 'B2',
    image: 'images/scene-cafe.jpg',
    en: 'We argued all night, but we made up this morning.',
    tr: 'Bütün gece tartıştık ama bu sabah barıştık.',
    target: 'make-up',
    links: { made: 'make-up' },
    glossary: {
      argued: { word: 'argue', ipa: '/ˈɑːɡjuː/', pos: 'verb', cefr: 'B1', meaning: 'Tartışmak', example: { en: 'They argue about money all the time.', tr: 'Sürekli para yüzünden tartışıyorlar.' } },
    },
  },
  {
    id: 's6',
    show: 'Sitcom • Randevu',
    level: 'B2',
    image: 'images/scene-cafe.jpg',
    en: "I'm so clumsy, I just spilled coffee all over my date!",
    tr: 'Çok sakarım, az önce kahveyi randevumun üstüne döktüm!',
    target: 'clumsy',
    glossary: {
      spilled: { word: 'spill', ipa: '/spɪl/', pos: 'verb', cefr: 'B1', meaning: 'Dökmek, dökülmek', example: { en: "Careful, don't spill your tea.", tr: 'Dikkat, çayını dökme.' } },
    },
  },
  {
    id: 's7',
    show: 'Sitcom • Kafe Sahnesi',
    level: 'B2',
    image: 'images/scene-cafe.jpg',
    en: 'Was that sarcastic, or are you actually happy for me?',
    tr: 'Bu alaycı mıydı, yoksa gerçekten benim adıma mutlu musun?',
    target: 'sarcastic',
    glossary: {
      actually: { word: 'actually', ipa: '/ˈæktʃuəli/', pos: 'adverb', cefr: 'A2', meaning: 'Aslında, gerçekten', example: { en: 'Actually, I agree with you.', tr: 'Aslında sana katılıyorum.' } },
    },
  },
  {
    id: 's8',
    show: 'Sitcom • Cuma Akşamı',
    level: 'B1 - B2',
    image: 'images/scene-cafe.jpg',
    en: "Let's call it a day and hang out at my place.",
    tr: 'Bugünlük bu kadar diyelim, benim evde takılalım.',
    target: 'call-it-a-day',
    links: { call: 'call-it-a-day', day: 'call-it-a-day', hang: 'hang-out', out: 'hang-out' },
    hint: { phrase: 'at my place', meaning: 'benim evde (place = ev, mekân)' },
  },
  {
    id: 's9',
    show: 'Sitcom • Kafe Sahnesi',
    level: 'B1',
    image: 'images/scene-cafe.jpg',
    en: "I can't figure out why she's been so moody lately.",
    tr: 'Son zamanlarda neden bu kadar huysuz olduğunu çözemiyorum.',
    target: 'figure-out',
    links: { figure: 'figure-out', out: 'figure-out' },
    glossary: {
      lately: { word: 'lately', ipa: '/ˈleɪtli/', pos: 'adverb', cefr: 'B1', meaning: 'Son zamanlarda', example: { en: 'Have you seen any good films lately?', tr: 'Son zamanlarda güzel bir film izledin mi?' } },
    },
  },
  {
    id: 's10',
    show: 'Sitcom • Ofis',
    level: 'B1',
    image: 'images/scene-cafe.jpg',
    en: 'Have you heard the gossip? Emma got the job!',
    tr: 'Dedikoduyu duydun mu? Emma işi aldı!',
    target: 'gossip',
  },
];

// ─────────────────────────── Mikro Hikayeler ───────────────────────────

export interface Story {
  id: string;
  title: string;
  level: string;
  minutes: number;
  /** [[kelimeId]] veya [[kelimeId|metindeki hali]] biçiminde işaretli paragraflar */
  paragraphs: { en: string; tr: string }[];
  questions: { q: string; options: string[]; answer: number; explanation: string }[];
}

export const STORIES: Story[] = [
  {
    id: 'breakthrough',
    title: 'The Accidental Breakthrough',
    level: 'B1-B2',
    minutes: 1,
    paragraphs: [
      {
        en: 'In modern laboratories, unexpected discoveries are almost [[inevitable]]. Yet when the computer signals began to synchronise on their own, Dr. Aris was [[reluctant]] to trust them.',
        tr: 'Modern laboratuvarlarda beklenmedik keşifler neredeyse kaçınılmazdır. Yine de bilgisayar sinyalleri kendi kendine eşzamanlanmaya başladığında Dr. Aris onlara güvenmekte isteksizdi.',
      },
      {
        en: 'His first [[hypothesis]] was a simple bug. But the pattern felt like a moment of pure [[serendipity]], even as technical [[obstacle|obstacles]] piled up.',
        tr: 'İlk hipotezi basit bir yazılım hatasıydı. Ancak teknik engeller birikirken bile bu örüntü tam bir mutlu tesadüf anı gibiydi.',
      },
      {
        en: 'Good ideas often [[thrive]] under pressure. After weeks of testing, a self-correcting diagnostic tool finally looked [[feasible]], and the [[resilient]] team celebrated.',
        tr: 'İyi fikirler çoğu zaman baskı altında gelişir. Haftalarca süren testlerin ardından kendini düzelten bir teşhis aracı nihayet uygulanabilir göründü ve yılmayan ekip kutlama yaptı.',
      },
    ],
    questions: [
      {
        q: 'Why was Dr. Aris reluctant at first?',
        options: ['He thought the signals might be caused by a bug.', 'He did not like working in a laboratory.', 'The team had no money for more tests.'],
        answer: 0,
        explanation: 'İlk hipotezi bunun basit bir yazılım hatası (bug) olduğuydu.',
      },
      {
        q: 'What did the team finally create?',
        options: ['A new computer game.', 'A self-correcting diagnostic tool.', 'A faster laboratory computer.'],
        answer: 1,
        explanation: '“A self-correcting diagnostic tool finally looked feasible.”',
      },
    ],
  },
  {
    id: 'weekend',
    title: 'A Weekend in the City',
    level: 'A2-B1',
    minutes: 1,
    paragraphs: [
      {
        en: 'Last Friday, Leyla [[decide|decided]] to visit her cousin in Istanbul. The [[journey]] by bus took six hours, but her seat was [[comfortable]].',
        tr: 'Geçen cuma Leyla, İstanbul’daki kuzenini ziyaret etmeye karar verdi. Otobüs yolculuğu altı saat sürdü ama koltuğu rahattı.',
      },
      {
        en: 'She could not [[afford]] a hotel, so she stayed with her cousin. The [[weather]] was cold, so she had to [[borrow]] a coat.',
        tr: 'Otel parasını karşılayamadığı için kuzeninde kaldı. Hava soğuktu, bu yüzden bir mont ödünç almak zorunda kaldı.',
      },
      {
        en: 'On Sunday they visited a museum. It was a great [[opportunity]] to practise English with tourists, and Leyla will always [[remember]] that weekend.',
        tr: 'Pazar günü bir müzeyi gezdiler. Turistlerle İngilizce pratik yapmak için harika bir fırsattı ve Leyla o hafta sonunu hep hatırlayacak.',
      },
    ],
    questions: [
      {
        q: 'Why did Leyla stay with her cousin?',
        options: ['She could not afford a hotel.', 'All the hotels were full.', 'Her cousin was ill.'],
        answer: 0,
        explanation: '“She could not afford a hotel, so she stayed with her cousin.”',
      },
      {
        q: 'Why did she borrow a coat?',
        options: ['Hers was dirty.', 'The weather was cold.', 'It was a gift for her cousin.'],
        answer: 1,
        explanation: '“The weather was cold, so she had to borrow a coat.”',
      },
    ],
  },
  {
    id: 'meeting',
    title: 'The Big Meeting',
    level: 'B2',
    minutes: 1,
    paragraphs: [
      {
        en: 'On Monday morning, Selim checked the [[agenda]]: the client meeting was at ten, and the [[deadline]] for the [[proposal]] was Friday.',
        tr: 'Pazartesi sabahı Selim gündemi kontrol etti: müşteri toplantısı saat ondaydı ve teklifin son teslim tarihi cumaydı.',
      },
      {
        en: 'Unfortunately, the client wanted to [[postpone]] the meeting. Selim’s [[colleague]] suggested using the extra time to [[negotiate]] a bigger [[budget]].',
        tr: 'Ne yazık ki müşteri toplantıyı ertelemek istedi. Selim’in iş arkadaşı, ek zamanı daha büyük bir bütçe için pazarlık yapmakta kullanmayı önerdi.',
      },
      {
        en: 'On Thursday, the client sent positive [[feedback]], and the team finished everything a day early.',
        tr: 'Perşembe günü müşteri olumlu geri bildirim gönderdi ve ekip her şeyi bir gün erken bitirdi.',
      },
    ],
    questions: [
      {
        q: 'What did the client want to do?',
        options: ['Cancel the project.', 'Postpone the meeting.', 'Change the team.'],
        answer: 1,
        explanation: '“The client wanted to postpone the meeting.”',
      },
      {
        q: 'When did the team finish?',
        options: ['On Thursday, a day early.', 'On Monday morning.', 'After the deadline.'],
        answer: 0,
        explanation: 'Perşembe günü, yani son tarihten bir gün önce bitirdiler.',
      },
    ],
  },
];

// ─────────────────────────── Kelime Kökü & Aile Ağacı ───────────────────────────

export interface FamilyNode extends GlossaryEntry {
  id: string;
  role: string;
  roleColor: 'tertiary' | 'secondary' | 'error' | 'primary';
}

export interface WordFamily {
  id: string;
  center: GlossaryEntry & { id: string };
  root: string;
  rootParts: string;
  insightTitle: string;
  insight: string;
  nodes: [FamilyNode, FamilyNode, FamilyNode, FamilyNode];
}

export const FAMILIES: WordFamily[] = [
  {
    id: 'inevitable',
    center: { id: 'inevitable', word: 'inevitable', ipa: '/ɪnˈevɪtəbl/', pos: 'adjective', cefr: 'B2', meaning: 'Kaçınılmaz' },
    root: 'Latince /evitare/',
    rootParts: 'e- (dışarı) + vitare (sakınmak)',
    insightTitle: 'Ön Ek Mantığı (in- + e- + vitare)',
    insight: 'Olumsuzluk bildiren in- eki eklendiğinde “kaçınılabilir” anlamı “kaçınılamaz” hâline gelir.',
    nodes: [
      {
        id: 'inevitability', role: 'İsim', roleColor: 'tertiary', word: 'inevitability', ipa: '/ɪnˌevɪtəˈbɪləti/', pos: 'noun', cefr: 'C1', meaning: 'Kaçınılmazlık',
        example: { en: 'He accepted the inevitability of change with great calm.', tr: 'Değişimin kaçınılmazlığını büyük bir sükûnetle kabullendi.' },
        collocations: ['the inevitability of', 'a sense of inevitability', 'accept the inevitability'],
      },
      {
        id: 'inevitably', role: 'Zarf', roleColor: 'secondary', word: 'inevitably', ipa: '/ɪnˈevɪtəbli/', pos: 'adverb', cefr: 'C1', meaning: 'Kaçınılmaz olarak',
        example: { en: 'Technological change will inevitably reshape future industries.', tr: 'Teknolojik değişim kaçınılmaz olarak geleceğin sektörlerini yeniden şekillendirecek.' },
        collocations: ['inevitably lead to', 'inevitably result in', 'almost inevitably'],
      },
      {
        id: 'evitable', role: 'Zıt Anlam', roleColor: 'error', word: 'evitable', ipa: '/ˈevɪtəbl/', pos: 'adjective', cefr: 'C2', meaning: 'Önlenebilir, kaçınılabilir',
        example: { en: 'Most of these errors were evitable.', tr: 'Bu hataların çoğu önlenebilirdi.' },
        collocations: ['evitable risk', 'avoidable (daha yaygın eş anlamı)'],
      },
      {
        id: 'inescapable', role: 'Eş Anlam', roleColor: 'primary', word: 'inescapable', ipa: '/ˌɪnɪˈskeɪpəbl/', pos: 'adjective', cefr: 'C1', meaning: 'Kaçışı olmayan, kurtulunamaz',
        example: { en: 'The jury reached the inescapable conclusion.', tr: 'Jüri kaçınılmaz sonuca vardı.' },
        collocations: ['an inescapable conclusion', 'an inescapable fact'],
      },
    ],
  },
  {
    id: 'decide',
    center: { id: 'decide', word: 'decide', ipa: '/dɪˈsaɪd/', pos: 'verb', cefr: 'A2', meaning: 'Karar vermek' },
    root: 'Latince /decidere/',
    rootParts: 'de- (ayırmak) + caedere (kesmek)',
    insightTitle: 'Kök Mantığı (de- + caedere)',
    insight: 'Karar vermek, kelimenin kökünde “seçenekleri kesip ayırmak” demektir; scissors ve precise de aynı “kesmek” kökünden gelir.',
    nodes: [
      {
        id: 'decision', role: 'İsim', roleColor: 'tertiary', word: 'decision', ipa: '/dɪˈsɪʒn/', pos: 'noun', cefr: 'B1', meaning: 'Karar',
        example: { en: 'We have to make a tough decision.', tr: 'Zor bir karar vermek zorundayız.' },
        collocations: ['make a decision', 'reach a decision', 'a tough decision'],
      },
      {
        id: 'decisive', role: 'Sıfat', roleColor: 'secondary', word: 'decisive', ipa: '/dɪˈsaɪsɪv/', pos: 'adjective', cefr: 'B2', meaning: 'Kararlı; belirleyici',
        example: { en: 'We need a decisive leader in a crisis.', tr: 'Kriz anında kararlı bir lidere ihtiyacımız var.' },
        collocations: ['decisive action', 'a decisive moment', 'a decisive victory'],
      },
      {
        id: 'indecisive', role: 'Zıt Anlam', roleColor: 'error', word: 'indecisive', ipa: '/ˌɪndɪˈsaɪsɪv/', pos: 'adjective', cefr: 'B2', meaning: 'Kararsız',
        example: { en: 'I’m too indecisive to choose a restaurant.', tr: 'Restoran seçemeyecek kadar kararsızım.' },
        collocations: ['an indecisive person', 'an indecisive result'],
      },
      {
        id: 'determine', role: 'Eş Anlam', roleColor: 'primary', word: 'determine', ipa: '/dɪˈtɜːmɪn/', pos: 'verb', cefr: 'B2', meaning: 'Belirlemek, karara bağlamak',
        example: { en: 'Tests will determine the cause of the problem.', tr: 'Testler sorunun nedenini belirleyecek.' },
        collocations: ['determine the cause', 'be determined to do something'],
      },
    ],
  },
  {
    id: 'predict',
    center: { id: 'predict', word: 'predict', ipa: '/prɪˈdɪkt/', pos: 'verb', cefr: 'B1', meaning: 'Tahmin etmek, öngörmek', example: { en: 'Nobody can predict the future.', tr: 'Kimse geleceği tahmin edemez.' } },
    root: 'Latince /praedicere/',
    rootParts: 'prae- (önce) + dicere (söylemek)',
    insightTitle: 'Kök Mantığı (pre- + dict)',
    insight: '“Önceden söylemek”: dict kökü dictionary, dictate ve contradict kelimelerinde de “söylemek” anlamı taşır.',
    nodes: [
      {
        id: 'prediction', role: 'İsim', roleColor: 'tertiary', word: 'prediction', ipa: '/prɪˈdɪkʃn/', pos: 'noun', cefr: 'B2', meaning: 'Tahmin, öngörü',
        example: { en: 'Her prediction turned out to be right.', tr: 'Tahmini doğru çıktı.' },
        collocations: ['make a prediction', 'an accurate prediction'],
      },
      {
        id: 'predictable', role: 'Sıfat', roleColor: 'secondary', word: 'predictable', ipa: '/prɪˈdɪktəbl/', pos: 'adjective', cefr: 'B2', meaning: 'Tahmin edilebilir',
        example: { en: 'The ending of the film was predictable.', tr: 'Filmin sonu tahmin edilebilirdi.' },
        collocations: ['highly predictable', 'a predictable outcome'],
      },
      {
        id: 'unpredictable', role: 'Zıt Anlam', roleColor: 'error', word: 'unpredictable', ipa: '/ˌʌnprɪˈdɪktəbl/', pos: 'adjective', cefr: 'B2', meaning: 'Öngörülemez',
        example: { en: 'The weather here is completely unpredictable.', tr: 'Buranın havası tamamen öngörülemez.' },
        collocations: ['unpredictable weather', 'highly unpredictable'],
      },
      {
        id: 'forecast', role: 'Eş Anlam', roleColor: 'primary', word: 'forecast', ipa: '/ˈfɔːkɑːst/', pos: 'verb', cefr: 'B1', meaning: 'Tahmin etmek (özellikle hava, ekonomi)',
        example: { en: 'Rain is forecast for tomorrow.', tr: 'Yarın için yağmur bekleniyor.' },
        collocations: ['weather forecast', 'forecast growth'],
      },
    ],
  },
];

// ─────────────────────────── Kolokasyon İnşa Edici ───────────────────────────

export type ChipKind = 'correct' | 'alt' | 'nuance' | 'trap' | 'weak';

export interface Chip {
  text: string;
  kind: ChipKind;
  tag?: string;
  note?: string;
  /** Örnek cümledeki Türkçe karşılık parçası (yalnızca sıfat çiplerinde) */
  tr?: string;
  /** Kalıbın mastar hâlinde Türkçe anlamı (kart arka yüzü için) */
  chunkTr?: string;
}

export interface CollocationTarget {
  id: string;
  noun: string;
  ipa: string;
  posLabel: string;
  meaning: string;
  verbs: Chip[];
  modifiers: Chip[];
  /** {chunk} yerine oluşturulan kalıp gelir */
  sentence: string;
  sentenceTr: string;
  l1Note: string;
}

export const COLLOCATIONS: CollocationTarget[] = [
  {
    id: 'decision',
    noun: 'decision',
    ipa: '/dɪˈsɪʒn/',
    posLabel: 'İsim • B2',
    meaning: 'Karar',
    verbs: [
      { text: 'make', kind: 'correct', tag: 'Doğal' },
      { text: 'reach', kind: 'alt', tag: 'Resmi/Yetkin', note: 'reach a decision: özellikle bir müzakere sonrası karara varmak.' },
      { text: 'take', kind: 'nuance', tag: 'UK Nüans', note: 'İngiliz İngilizcesinde "take a decision" yaygındır; Amerikan kullanımında "make" baskındır.' },
      { text: 'do', kind: 'trap', tag: 'Tuzak ❌', note: 'İngilizcede kesinlikle "do a decision" DENMEZ!' },
      { text: 'have', kind: 'weak', note: '"Have a decision" doğal bir kalıp değildir.' },
    ],
    modifiers: [
      { text: 'a tough', kind: 'correct', tr: 'zor bir karar vermek', chunkTr: 'zor bir karar vermek' },
      { text: 'a unanimous', kind: 'alt', tag: '(Oy birliği)', tr: 'oy birliğiyle karar almak', chunkTr: 'oy birliğiyle karar almak', note: 'a unanimous decision = oy birliğiyle alınan karar.' },
      { text: 'a hasty', kind: 'alt', tag: '(Aceleci)', tr: 'aceleci bir karar vermek', chunkTr: 'aceleci bir karar vermek', note: 'a hasty decision = aceleye getirilmiş, fevri karar.' },
      { text: 'a heavy', kind: 'trap', tag: 'Tuzak ❌', note: 'Türkçedeki "ağır karar" İngilizceye "heavy decision" diye çevrilmez; "tough/hard decision" kullanılır.' },
    ],
    sentence: "The executive committee had to {chunk} regarding the company's future.",
    sentenceTr: 'Yönetim kurulu şirketin geleceğine dair {tr} zorunda kaldı.',
    l1Note: 'Türkçedeki “karar yapmak/etmek” algısıyla “do a decision” demek en sık yapılan hatadır. Doğrusu “make a decision” veya “reach a decision”.',
  },
  {
    id: 'mistake',
    noun: 'mistake',
    ipa: '/mɪˈsteɪk/',
    posLabel: 'İsim • A2',
    meaning: 'Hata',
    verbs: [
      { text: 'make', kind: 'correct', tag: 'Doğal' },
      { text: 'commit', kind: 'nuance', tag: 'Nüans', note: '"Commit" daha çok suç (a crime) veya resmi hata (an error) için kullanılır; "commit a mistake" seyrektir.' },
      { text: 'do', kind: 'trap', tag: 'Tuzak ❌', note: 'Türkçedeki "hata yapmak" → "do a mistake" DEĞİL, "make a mistake".' },
      { text: 'have', kind: 'weak', note: '"Have a mistake" doğal değildir; "there is a mistake" denir.' },
    ],
    modifiers: [
      { text: 'a big', kind: 'correct', tr: 'büyük bir hata yaptım', chunkTr: 'büyük bir hata yapmak' },
      { text: 'a costly', kind: 'alt', tag: '(Pahalıya patlayan)', tr: 'pahalıya patlayan bir hata yaptım', chunkTr: 'pahalıya patlayan bir hata yapmak' },
      { text: 'an honest', kind: 'alt', tag: '(Masum)', tr: 'kasıtsız, masum bir hata yaptım', chunkTr: 'masum (kasıtsız) bir hata yapmak', note: 'an honest mistake = kötü niyet taşımayan, masum hata. "h" okunmadığı için "an".' },
      { text: 'a heavy', kind: 'trap', tag: 'Tuzak ❌', note: '"Ağır hata" → "heavy mistake" denmez; "serious / grave mistake" kullanılır.' },
    ],
    sentence: 'I {chunk} in my report, so I fixed it before the meeting.',
    sentenceTr: 'Raporumda {tr}, bu yüzden toplantıdan önce düzelttim.',
    l1Note: '“Yapmak” fiili İngilizcede hem “do” hem “make” olabilir. Hata, karar, plan ve gürültü gibi bir şey ortaya çıkaran eylemlerde “make” kullanılır.',
  },
  {
    id: 'attention',
    noun: 'attention',
    ipa: '/əˈtenʃn/',
    posLabel: 'İsim • B1',
    meaning: 'Dikkat',
    verbs: [
      { text: 'pay', kind: 'correct', tag: 'Doğal' },
      { text: 'draw', kind: 'alt', tag: 'Dikkat çekmek', note: 'draw attention to something = bir şeye dikkat çekmek.' },
      { text: 'give', kind: 'nuance', tag: 'Nüans', note: '"Give your full attention" mümkündür ama en doğal fiil "pay"dir.' },
      { text: 'make', kind: 'trap', tag: 'Tuzak ❌', note: '"Dikkat etmek" → "make attention" DENMEZ; "pay attention" denir.' },
    ],
    modifiers: [
      { text: 'close', kind: 'correct', tr: 'çok dikkat edin', chunkTr: 'çok dikkat etmek' },
      { text: 'full', kind: 'alt', tag: '(Tam)', tr: 'tüm dikkatinizi verin', chunkTr: 'tüm dikkatini vermek' },
      { text: 'special', kind: 'alt', tag: '(Özel)', tr: 'özel dikkat gösterin', chunkTr: 'özel dikkat göstermek' },
      { text: 'big', kind: 'trap', tag: 'Tuzak ❌', note: '"Büyük dikkat" → "big attention" denmez; "close / careful attention" kullanılır.' },
    ],
    sentence: 'Please {chunk} to the safety instructions.',
    sentenceTr: 'Lütfen güvenlik talimatlarına {tr}.',
    l1Note: 'Dikkat İngilizcede “ödenir”: pay attention. Türkçedeki “dikkat etmek” kalıbını “make/do attention” diye çevirmek yaygın bir hatadır.',
  },
  {
    id: 'party',
    noun: 'party',
    ipa: '/ˈpɑːti/',
    posLabel: 'İsim • A1',
    meaning: 'Parti, davet',
    verbs: [
      { text: 'throw', kind: 'correct', tag: 'Doğal' },
      { text: 'host', kind: 'alt', tag: 'Resmi', note: 'host a party = ev sahipliği yapmak, daha resmi.' },
      { text: 'have', kind: 'alt', tag: 'Günlük', note: 'have a party günlük konuşmada çok yaygındır.' },
      { text: 'make', kind: 'trap', tag: 'Tuzak ❌', note: '"Parti yapmak" → "make a party" DENMEZ; "throw / have a party" denir.' },
    ],
    modifiers: [
      { text: 'a surprise', kind: 'correct', tr: 'sürpriz bir parti vereceğiz', chunkTr: 'sürpriz parti vermek' },
      { text: 'a farewell', kind: 'alt', tag: '(Veda)', tr: 'bir veda partisi vereceğiz', chunkTr: 'veda partisi vermek' },
      { text: 'a housewarming', kind: 'alt', tag: '(Yeni ev)', tr: 'yeni ev partisi vereceğiz', chunkTr: 'yeni ev partisi vermek' },
      { text: 'a big', kind: 'correct', tr: 'büyük bir parti vereceğiz', chunkTr: 'büyük bir parti vermek' },
    ],
    sentence: "We're going to {chunk} on Saturday.",
    sentenceTr: 'Cumartesi {tr}.',
    l1Note: 'Türkçedeki “parti yapmak” kalıbı “make a party” diye çevrilmez. İngilizcede parti “fırlatılır”: throw a party.',
  },
];

export const L1_TRAPS = [
  { wrong: 'Make a party', right: 'Throw / Host a party' },
  { wrong: 'Strong rain', right: 'Heavy rain' },
  { wrong: 'Do an error', right: 'Make a mistake / error' },
  { wrong: 'Open the light', right: 'Turn on the light' },
  { wrong: 'Say a lie', right: 'Tell a lie' },
];

// ─────────────────────────── Resmiyet & Ton ───────────────────────────

export interface RegisterStage {
  label: string;
  en: string;
  emoji: string;
  phrases: [string, string];
  audience: string;
  envBadge: string;
  envTone: 'error' | 'tertiary' | 'neutral' | 'primary' | 'secondary';
  previewLabel: string;
  previewIcon: string;
  meta?: { to: string; subject: string };
  /** [[ ]] içindeki ifadeler vurgulanır */
  quote: string;
  pills: [string, string, string];
  contrast: string;
}

export interface RegisterGroup {
  id: string;
  title: string;
  next: string;
  nuance: string;
  stages: [RegisterStage, RegisterStage, RegisterStage, RegisterStage, RegisterStage];
}

export const REGISTERS: RegisterGroup[] = [
  {
    id: 'apology',
    title: 'Özür Dilemek / Hata Kabul Etmek',
    next: 'Anlamak: Get it vs. Comprehend',
    nuance: 'İş e-postalarında “My bad” kullanmak profesyonel itibarını zedeleyebilir. “Express regret” ise sorumluluğu kabul ederken kurumsal nezaketi korur.',
    stages: [
      {
        label: 'Sokak / Argo', en: 'Slang', emoji: '🔥', phrases: ['My bad', 'Mess up'], audience: 'Gençler',
        envBadge: 'Sokak / Chat', envTone: 'error', previewLabel: 'WhatsApp / DM Önizlemesi', previewIcon: 'chat_bubble',
        quote: 'Yo, [[my bad]] about earlier, I totally [[messed up]] the schedule!',
        pills: ['Ton: Sokak / Ultra Rahat', 'Hedef: Yakın Akranlar', 'Risk: %95 (İş İçin Uygunsuz)'],
        contrast: 'İş e-postası olsaydı: "Dear team, we regret the inconvenience regarding the schedule."',
      },
      {
        label: 'Günlük', en: 'Casual', emoji: '💬', phrases: ['Say sorry', 'Make a mistake'], audience: 'Kafe / Dost',
        envBadge: 'Sosyal / Kafe', envTone: 'tertiary', previewLabel: 'Arkadaş Grubu Önizlemesi', previewIcon: 'forum',
        quote: 'Hey everyone, I just wanted to [[say sorry]] for [[making a mistake]] with the plans.',
        pills: ['Ton: Samimi / Günlük', 'Hedef: Arkadaşlar', 'Risk: %60 (Resmi Yazışmada Zayıf)'],
        contrast: 'İş e-postası olsaydı: "Please accept our sincere apologies for the oversight."',
      },
      {
        label: 'Nötr / Standart', en: 'Neutral', emoji: '⚖️', phrases: ['Apologize', 'Make an error'], audience: 'Genel',
        envBadge: 'Standart İletişim', envTone: 'neutral', previewLabel: 'Genel Mesajlaşma Önizlemesi', previewIcon: 'alternate_email',
        quote: 'I [[apologize]] for the delay. An [[error]] occurred during the update, and we have corrected it.',
        pills: ['Ton: Dengeli & Saygılı', 'Hedef: Müşteri Desteği', 'Risk: %15 (Güvenli Standart)'],
        contrast: 'Sokak dili olsaydı: "My bad dude, totally messed up!"',
      },
      {
        label: 'İş / Resmi', en: 'Formal', emoji: '💼', phrases: ['Express regret', 'Inadvertent oversight'], audience: 'B2 - C1',
        envBadge: 'Şirket E-postası', envTone: 'primary', previewLabel: 'Şirket E-postası Önizlemesi', previewIcon: 'mail',
        meta: { to: 'm.vance@acmecorp.com', subject: 'RE: Q3 Deployment Delay' },
        quote: 'Dear Mr. Vance, we sincerely [[express our regret]] for the [[inadvertent oversight]] regarding the quarterly deployment.',
        pills: ['Ton: Yüksek Nezaket', 'Hedef: Kurumsal İletişim', 'Risk: %0 (Güvenli)'],
        contrast: 'WhatsApp olsaydı: "Hey dude, my bad for the mess up!"',
      },
      {
        label: 'Akademik & Hukuki', en: 'C2', emoji: '🎓', phrases: ['Acknowledge culpability', 'Proffer an apology'], audience: 'C2 Yüksek',
        envBadge: 'Hukuki / Akademik', envTone: 'secondary', previewLabel: 'Resmi Protokol Bildirisi', previewIcon: 'gavel',
        meta: { to: 'board@committee.org', subject: 'Formal Statement on Procedural Omission' },
        quote: 'The board hereby [[acknowledges culpability]] and solemnly [[proffers an apology]] in light of the procedural omission.',
        pills: ['Ton: Hukuki & Akademik', 'Hedef: Yasal Beyan', 'Risk: %0 (Aşırı Resmi)'],
        contrast: 'Sokak ağzı olsaydı: "My bad for dropping the ball, guys!"',
      },
    ],
  },
  {
    id: 'understand',
    title: 'Anlamak / Kavramak',
    next: 'Yardım İstemek: Give me a hand vs. Assistance',
    nuance: 'Toplantıda “Gotcha!” demek samimi ama özensiz görünebilir. “I appreciate your point” hem anladığını hem de karşı tarafa saygı duyduğunu gösterir.',
    stages: [
      {
        label: 'Sokak / Argo', en: 'Slang', emoji: '🔥', phrases: ['Gotcha', 'I get it'], audience: 'Gençler',
        envBadge: 'Sokak / Chat', envTone: 'error', previewLabel: 'WhatsApp / DM Önizlemesi', previewIcon: 'chat_bubble',
        quote: '[[Gotcha]], no worries — I totally [[get it]]!',
        pills: ['Ton: Ultra Rahat', 'Hedef: Yakın Arkadaşlar', 'Risk: %90 (İş İçin Uygunsuz)'],
        contrast: 'İş e-postası olsaydı: "Thank you for clarifying; I fully understand your position."',
      },
      {
        label: 'Günlük', en: 'Casual', emoji: '💬', phrases: ['I see', 'Makes sense'], audience: 'Kafe / Dost',
        envBadge: 'Sosyal / Kafe', envTone: 'tertiary', previewLabel: 'Arkadaş Grubu Önizlemesi', previewIcon: 'forum',
        quote: 'Oh, [[I see]]. That [[makes sense]] now, thanks!',
        pills: ['Ton: Samimi', 'Hedef: Arkadaşlar & Aile', 'Risk: %40 (Resmi Ortamda Hafif)'],
        contrast: 'Resmi yazışma olsaydı: "Thank you, the explanation is clear."',
      },
      {
        label: 'Nötr / Standart', en: 'Neutral', emoji: '⚖️', phrases: ['I understand', 'That’s clear'], audience: 'Genel',
        envBadge: 'Standart İletişim', envTone: 'neutral', previewLabel: 'Genel Mesajlaşma Önizlemesi', previewIcon: 'alternate_email',
        quote: '[[I understand]] the problem, and the next steps are [[clear]] to me.',
        pills: ['Ton: Dengeli', 'Hedef: Her Ortam', 'Risk: %10 (Güvenli)'],
        contrast: 'Sokak dili olsaydı: "Yeah yeah, gotcha."',
      },
      {
        label: 'İş / Resmi', en: 'Formal', emoji: '💼', phrases: ['I appreciate your point', 'Duly noted'], audience: 'B2 - C1',
        envBadge: 'Şirket E-postası', envTone: 'primary', previewLabel: 'Şirket E-postası Önizlemesi', previewIcon: 'mail',
        meta: { to: 's.clark@globex.com', subject: 'RE: Revised Project Timeline' },
        quote: 'Dear Ms. Clark, I fully [[appreciate your point]] regarding the timeline; your concerns are [[duly noted]].',
        pills: ['Ton: Saygılı & Profesyonel', 'Hedef: Kurumsal İletişim', 'Risk: %0 (Güvenli)'],
        contrast: 'WhatsApp olsaydı: "Ok ok I get it 👍"',
      },
      {
        label: 'Akademik & Hukuki', en: 'C2', emoji: '🎓', phrases: ['Comprehend', 'It is evident that'], audience: 'C2 Yüksek',
        envBadge: 'Akademik Makale', envTone: 'secondary', previewLabel: 'Akademik Makale Önizlemesi', previewIcon: 'description',
        quote: '[[It is evident that]] participants fully [[comprehended]] the task requirements prior to testing.',
        pills: ['Ton: Akademik', 'Hedef: Makale / Tez', 'Risk: %0 (Aşırı Resmi)'],
        contrast: 'Günlük dilde: "Everyone got it before we started."',
      },
    ],
  },
  {
    id: 'help',
    title: 'Yardım İstemek',
    next: 'Özür Dilemek: My bad vs. Express regret',
    nuance: 'Bir yöneticiye “Can you hook me up?” yazmak ciddiyetsiz görünür. “I would appreciate your assistance” rica ederken karşı tarafın zamanına saygı gösterir.',
    stages: [
      {
        label: 'Sokak / Argo', en: 'Slang', emoji: '🔥', phrases: ['Hook me up', 'Help a friend out'], audience: 'Gençler',
        envBadge: 'Sokak / Chat', envTone: 'error', previewLabel: 'WhatsApp / DM Önizlemesi', previewIcon: 'chat_bubble',
        quote: 'Yo, can you [[hook me up]] with a ride tonight? [[Help a friend out]]!',
        pills: ['Ton: Ultra Rahat', 'Hedef: Yakın Arkadaşlar', 'Risk: %95 (İş İçin Uygunsuz)'],
        contrast: 'İş e-postası olsaydı: "Would it be possible to arrange transport for this evening?"',
      },
      {
        label: 'Günlük', en: 'Casual', emoji: '💬', phrases: ['Give me a hand', 'Do me a favour'], audience: 'Kafe / Dost',
        envBadge: 'Sosyal / Ev', envTone: 'tertiary', previewLabel: 'Arkadaş Grubu Önizlemesi', previewIcon: 'forum',
        quote: 'Hey, can you [[give me a hand]] with these boxes? Could you [[do me a favour]]?',
        pills: ['Ton: Samimi', 'Hedef: Arkadaşlar & Komşular', 'Risk: %50 (Resmi Ortamda Zayıf)'],
        contrast: 'Resmi yazışma olsaydı: "I would be grateful for your help with the delivery."',
      },
      {
        label: 'Nötr / Standart', en: 'Neutral', emoji: '⚖️', phrases: ['Could you help me', 'Would you mind'], audience: 'Genel',
        envBadge: 'Standart İletişim', envTone: 'neutral', previewLabel: 'Genel Mesajlaşma Önizlemesi', previewIcon: 'alternate_email',
        quote: '[[Could you help me]] fill in this form, please? [[Would you mind]] checking my answers?',
        pills: ['Ton: Kibar & Dengeli', 'Hedef: Her Ortam', 'Risk: %10 (Güvenli)'],
        contrast: 'Sokak dili olsaydı: "Yo, hook me up with this form!"',
      },
      {
        label: 'İş / Resmi', en: 'Formal', emoji: '💼', phrases: ['I would appreciate your assistance', 'At your earliest convenience'], audience: 'B2 - C1',
        envBadge: 'Şirket E-postası', envTone: 'primary', previewLabel: 'Şirket E-postası Önizlemesi', previewIcon: 'mail',
        meta: { to: 'j.ross@initech.com', subject: 'Request: Review of Q3 Report' },
        quote: 'Dear Mr. Ross, [[I would appreciate your assistance]] in reviewing the attached report [[at your earliest convenience]].',
        pills: ['Ton: Yüksek Nezaket', 'Hedef: Kurumsal İletişim', 'Risk: %0 (Güvenli)'],
        contrast: 'WhatsApp olsaydı: "Can u check my report? thx"',
      },
      {
        label: 'Akademik & Hukuki', en: 'C2', emoji: '🎓', phrases: ['Hereby requests', 'Cooperation of all parties'], audience: 'C2 Yüksek',
        envBadge: 'Hukuki / Akademik', envTone: 'secondary', previewLabel: 'Resmi Protokol Bildirisi', previewIcon: 'gavel',
        meta: { to: 'parties@inquiry.gov', subject: 'Notice of Inquiry' },
        quote: 'The committee [[hereby requests]] the [[cooperation of all parties]] in this inquiry.',
        pills: ['Ton: Hukuki', 'Hedef: Resmi Bildiri', 'Risk: %0 (Aşırı Resmi)'],
        contrast: 'Günlük dilde: "We need everyone to help out with this."',
      },
    ],
  },
];

// ─────────────────────────── Görsel Sahne ───────────────────────────

export interface Hotspot {
  id: string;
  short: string;
  name: string;
  ipa: string;
  badge: string;
  meaning: string;
  x: number;
  y: number;
  collocations: { en: string; tr: string }[];
  example: string;
  exampleTr: string;
}

export interface VisualSceneData {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  image: string;
  aspect: string;
  hotspots: Hotspot[];
}

export const VISUAL_SCENES: VisualSceneData[] = [
  {
    id: 'airport',
    title: 'Görsel Sahne Sözlüğü',
    subtitle: 'Uluslararası Havalimanı Terminali (B1–B2 Seviyesi)',
    region: 'Bölge: Terminal İçi Varış Salonu',
    image: 'images/scene-airport.jpg',
    aspect: '512 / 279',
    hotspots: [
      {
        id: 'gate', short: 'Gate', name: 'BOARDING GATE', ipa: '/ˈbɔːdɪŋ ɡeɪt/', badge: 'Geçiş Noktası', meaning: 'Biniş kapısı', x: 18, y: 40,
        collocations: [
          { en: 'proceed to the boarding gate', tr: 'biniş kapısına ilerlemek' },
          { en: 'show your boarding pass', tr: 'biniş kartını göstermek' },
          { en: 'the gate closes at 10:40', tr: 'kapı 10:40’ta kapanır' },
        ],
        example: 'Please proceed to gate B1; boarding will begin shortly.',
        exampleTr: '(Lütfen B1 kapısına ilerleyin; biniş birazdan başlayacak.)',
      },
      {
        id: 'carousel', short: 'Carousel', name: 'BAGGAGE CAROUSEL', ipa: '/ˈbæɡɪdʒ ˌkærəˈsel/', badge: 'Konveyör', meaning: 'Bagaj alım bandı', x: 40, y: 68,
        collocations: [
          { en: 'claim your baggage', tr: 'bagajını teslim almak' },
          { en: 'retrieve the luggage from the carousel', tr: 'banttan valizi almak' },
          { en: 'wait at the carousel', tr: 'bantta beklemek' },
        ],
        example: 'Passengers are requested to proceed to carousel 4 to collect their checked bags.',
        exampleTr: '(Yolcuların kayıtlı valizlerini teslim almak üzere 4 numaralı banda geçmeleri rica olunur.)',
      },
      {
        id: 'checkpoint', short: 'Checkpoint', name: 'SECURITY CHECKPOINT', ipa: '/sɪˈkjʊərəti ˈtʃekpɔɪnt/', badge: 'Kontrol Hattı', meaning: 'Güvenlik kontrol noktası', x: 64, y: 55,
        collocations: [
          { en: 'pass through security', tr: 'güvenlik kontrolünden geçmek' },
          { en: 'place liquids in a clear bag', tr: 'sıvıları şeffaf poşete koymak' },
          { en: 'go through the metal detector', tr: 'metal dedektöründen geçmek' },
        ],
        example: 'Allow extra time to clear the security checkpoint before boarding.',
        exampleTr: '(Binişten önce güvenlik kontrol noktasından geçmek için ek süre ayırın.)',
      },
      {
        id: 'dutyfree', short: 'Duty-free', name: 'DUTY-FREE SHOP', ipa: '/ˌdjuːti ˈfriː ʃɒp/', badge: 'Alışveriş', meaning: 'Gümrüksüz satış mağazası', x: 54, y: 20,
        collocations: [
          { en: 'buy something duty-free', tr: 'vergisiz bir şey satın almak' },
          { en: 'browse the duty-free shops', tr: 'gümrüksüz mağazalarda gezinmek' },
          { en: 'duty-free allowance', tr: 'gümrüksüz alışveriş limiti' },
        ],
        example: 'We bought some perfume at the duty-free shop before our flight.',
        exampleTr: '(Uçuştan önce gümrüksüz mağazadan biraz parfüm aldık.)',
      },
      {
        id: 'trolley', short: 'Trolley', name: 'LUGGAGE TROLLEY', ipa: '/ˈlʌɡɪdʒ ˌtrɒli/', badge: 'Taşıma', meaning: 'Bagaj arabası', x: 12, y: 78,
        collocations: [
          { en: 'push a luggage trolley', tr: 'bagaj arabası itmek' },
          { en: 'load your bags onto the trolley', tr: 'çantaları arabaya yüklemek' },
          { en: 'return the trolley', tr: 'arabayı geri bırakmak' },
        ],
        example: 'Grab a luggage trolley if you have more than two bags.',
        exampleTr: '(İkiden fazla çantan varsa bir bagaj arabası al.)',
      },
    ],
  },
];

// ─────────────────────────── Mikro Yazma ───────────────────────────

export const JOURNAL_PROMPTS = [
  'Bugün iş yerinde, okulda veya günlük yaşamında karşılaştığın zor bir anı 2-3 cümleyle anlat.',
  'Son zamanlarda seni şaşırtan bir olayı ve ondan ne öğrendiğini yaz.',
  'Gelecek yıl için bir hedefini ve onu nasıl gerçekleştireceğini anlat.',
  'Bir arkadaşınla yaşadığın komik ya da garip bir anı paylaş.',
  'Şu anda bulunduğun yeri ve orada ne hissettiğini betimle.',
];
