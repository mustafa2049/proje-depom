export interface ConfusableSide {
  word: string;
  ipa: string;
  pos: string;
  formula: string;
  meaning: string;
  example: string;
}

export interface ConfusableQuestion {
  /** Boşluk "___" ile gösterilir */
  sentence: string;
  answer: 0 | 1;
  explanation: string;
}

export interface ConfusablePair {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  sides: [ConfusableSide, ConfusableSide];
  logic: { title: string; text: string };
  memory: { title: string; subtitle: string; pills: { big: string; small: string; tone: 'tertiary' | 'secondary' | 'primary' | 'neutral' }[] };
  exceptions?: string[];
  questions: ConfusableQuestion[];
}

export const CONFUSABLES: ConfusablePair[] = [
  {
    id: 'affect-effect',
    title: 'Affect vs. Effect',
    subtitle: 'B2 - C1 İleri Düzey Nüans ve Kullanım Ayrımı',
    level: 'Fiil vs. İsim',
    sides: [
      { word: 'affect', ipa: '/əˈfekt/', pos: 'Fiil • v.', formula: '[A] affects [B]', meaning: 'Etkilemek, tesir etmek', example: 'Lack of sleep directly affects your memory.' },
      { word: 'effect', ipa: '/ɪˈfekt/', pos: 'İsim • n.', formula: 'The effect of [A] on [B]', meaning: 'Sonuç, etki, yaratılan izlenim', example: 'The therapy had an immediate positive effect.' },
    ],
    logic: { title: 'Eylem & Sonuç Mantığı', text: 'Bir durum seni etkilediğinde (affect), ortaya bir etki (effect) çıkar.' },
    memory: {
      title: 'Hafıza Çivisi: "RAVEN" Kuralı',
      subtitle: 'Akılda tutması kolay akronim',
      pills: [
        { big: 'R', small: 'Remember', tone: 'neutral' },
        { big: 'A = V', small: 'Affect = Verb', tone: 'secondary' },
        { big: 'E', small: 'Equals', tone: 'neutral' },
        { big: 'E = N', small: 'Effect = Noun', tone: 'primary' },
      ],
    },
    exceptions: [
      'affect (n.): Psikolojide gözlemlenen duygusal dışavurum / duygulanım.',
      'effect (v.): "effect change" kalıbındaki gibi bir değişikliği meydana getirmek.',
    ],
    questions: [
      { sentence: 'The new climate policy will have a profound ___ on renewable energy investments.', answer: 1, explanation: '"Have an effect on" standart kalıptır; "a profound" sıfatından sonra isim gelir.' },
      { sentence: 'Loud music can ___ your concentration.', answer: 0, explanation: 'Özne bir şeyi etkiliyor: burada fiil gerekir → affect.' },
      { sentence: 'The medicine started to take ___ after an hour.', answer: 1, explanation: '"Take effect" (etkisini göstermek) sabit bir kalıptır.' },
      { sentence: 'How will these changes ___ our team?', answer: 0, explanation: '"Will" yardımcı fiilinden sonra yalın fiil gelir → affect.' },
      { sentence: 'Side ___s of the drug include headaches.', answer: 1, explanation: '"Side effect" (yan etki) bir isim tamlamasıdır.' },
    ],
  },
  {
    id: 'hesitant-reluctant',
    title: 'Hesitant vs. Reluctant',
    subtitle: 'Tereddüt mü, isteksizlik mi?',
    level: 'Duygu Nüansı',
    sides: [
      { word: 'hesitant', ipa: '/ˈhezɪtənt/', pos: 'Sıfat • adj.', formula: 'hesitant to do / about sth', meaning: 'Emin olamadığı için tereddütlü', example: 'She was hesitant to ask a question in class.' },
      { word: 'reluctant', ipa: '/rɪˈlʌktənt/', pos: 'Sıfat • adj.', formula: 'reluctant to do sth', meaning: 'İstemediği için gönülsüz', example: 'He was reluctant to lend me his car.' },
    ],
    logic: { title: 'Kaynak Farkı', text: 'Hesitant: kafan karışık ya da emin değilsin. Reluctant: biliyorsun ama yapmak istemiyorsun.' },
    memory: {
      title: 'Hafıza Çivisi: H = Hmm, R = Refuse',
      subtitle: 'İlk harften anlamı yakala',
      pills: [
        { big: 'H', small: 'Hmm… emin değilim', tone: 'secondary' },
        { big: '≠', small: 'farklı duygu', tone: 'neutral' },
        { big: 'R', small: 'Refuse… istemiyorum', tone: 'primary' },
        { big: '?', small: 'şüphe vs. isteksizlik', tone: 'neutral' },
      ],
    },
    questions: [
      { sentence: 'I was ___ to answer because I wasn’t sure I had understood the question.', answer: 0, explanation: 'Emin olmamak tereddüt doğurur → hesitant.' },
      { sentence: 'The teenager was ___ to clean his room, but his mother insisted.', answer: 1, explanation: 'Yapmak istemiyor, zorla yapıyor → reluctant.' },
      { sentence: 'Investors are ___ to put money into such a risky project.', answer: 1, explanation: 'Riskten dolayı istekli değiller (karşı koyuyorlar) → reluctant.' },
      { sentence: 'She gave a ___ smile, unsure whether he was joking.', answer: 0, explanation: 'Şakayı anlayamamış, emin değil → hesitant.' },
    ],
  },
  {
    id: 'borrow-lend',
    title: 'Borrow vs. Lend',
    subtitle: 'Ödünç almak mı, vermek mi?',
    level: 'Yön Farkı',
    sides: [
      { word: 'borrow', ipa: '/ˈbɒrəʊ/', pos: 'Fiil • v.', formula: 'borrow sth FROM sb', meaning: 'Ödünç almak', example: 'Can I borrow your charger?' },
      { word: 'lend', ipa: '/lend/', pos: 'Fiil • v.', formula: 'lend sb sth / lend sth TO sb', meaning: 'Ödünç vermek', example: 'Could you lend me your charger?' },
    ],
    logic: { title: 'Ok Yönü', text: 'Borrow: eşya sana gelir (←). Lend: eşya senden gider (→).' },
    memory: {
      title: 'Hafıza Çivisi: FROM / TO',
      subtitle: 'Edat yönü gösterir',
      pills: [
        { big: '←', small: 'borrow FROM', tone: 'secondary' },
        { big: '📦', small: 'eşya', tone: 'neutral' },
        { big: '→', small: 'lend TO', tone: 'primary' },
        { big: '✓', small: 'yön = anlam', tone: 'neutral' },
      ],
    },
    questions: [
      { sentence: 'My brother never ___s me his car.', answer: 1, explanation: 'Araba kardeşinden sana gidiyor: o veriyor → lend.' },
      { sentence: 'I had to ___ some money from the bank.', answer: 0, explanation: '"from the bank": para sana geliyor → borrow.' },
      { sentence: 'Can I ___ your pen for a second?', answer: 0, explanation: '"Can I…" diyen kişi alan taraftır → borrow.' },
      { sentence: 'Would you ___ me your notes from yesterday?', answer: 1, explanation: '"Would you … me" → karşı taraf verecek → lend.' },
    ],
  },
  {
    id: 'complement-compliment',
    title: 'Complement vs. Compliment',
    subtitle: 'Tek harf, bambaşka anlam',
    level: 'Yazım Tuzağı',
    sides: [
      { word: 'complement', ipa: '/ˈkɒmplɪment/', pos: 'Fiil/İsim', formula: 'A complements B', meaning: 'Tamamlamak, bütünlemek', example: 'The wine complements the fish perfectly.' },
      { word: 'compliment', ipa: '/ˈkɒmplɪmənt/', pos: 'İsim/Fiil', formula: 'pay sb a compliment', meaning: 'İltifat, övgü', example: 'She paid me a lovely compliment.' },
    ],
    logic: { title: 'Harf İpucu', text: 'complEment → complEte (tamamlamak). complIment → I like you (iltifat).' },
    memory: {
      title: 'Hafıza Çivisi: E = Enough, I = I like it',
      subtitle: 'Ortadaki ünlüye bak',
      pills: [
        { big: 'E', small: 'complete', tone: 'secondary' },
        { big: '+', small: 'bütünler', tone: 'neutral' },
        { big: 'I', small: '“I like it”', tone: 'primary' },
        { big: '♥', small: 'iltifat', tone: 'neutral' },
      ],
    },
    questions: [
      { sentence: 'Thanks for the ___! I bought this jacket yesterday.', answer: 1, explanation: 'Övgüye teşekkür ediliyor → compliment.' },
      { sentence: 'The blue curtains ___ the white walls nicely.', answer: 0, explanation: 'Perdeler duvarları tamamlıyor/uyum sağlıyor → complement.' },
      { sentence: 'Our skills ___ each other, so we make a great team.', answer: 0, explanation: 'Birbirini tamamlayan beceriler → complement.' },
      { sentence: 'He always ___s her on her cooking.', answer: 1, explanation: 'Yemeklerini övüyor → compliment.' },
    ],
  },
  {
    id: 'advice-advise',
    title: 'Advice vs. Advise',
    subtitle: 'İsim mi, fiil mi?',
    level: 'İsim vs. Fiil',
    sides: [
      { word: 'advice', ipa: '/ədˈvaɪs/', pos: 'İsim • n.', formula: 'give / take advice', meaning: 'Tavsiye, öğüt (sayılamaz)', example: 'Let me give you some advice.' },
      { word: 'advise', ipa: '/ədˈvaɪz/', pos: 'Fiil • v.', formula: 'advise sb to do sth', meaning: 'Tavsiye etmek', example: 'I advise you to save some money.' },
    ],
    logic: { title: 'Ses İpucu', text: 'Advice sonu /s/ ile okunur ve isimdir; advise sonu /z/ ile okunur ve fiildir. Yazımda c → isim, s → fiil.' },
    memory: {
      title: 'Hafıza Çivisi: ICE / IS',
      subtitle: 'Buz (ice) bir isimdir',
      pills: [
        { big: 'c', small: 'advice = ice (isim)', tone: 'secondary' },
        { big: '/s/', small: 'okunuş', tone: 'neutral' },
        { big: 's', small: 'advise = fiil', tone: 'primary' },
        { big: '/z/', small: 'okunuş', tone: 'neutral' },
      ],
    },
    exceptions: ['advice sayılamaz: "an advice" denmez → "a piece of advice".'],
    questions: [
      { sentence: 'Can you give me some ___ about my CV?', answer: 0, explanation: '"some" sonrası isim gerekir → advice.' },
      { sentence: 'Doctors ___ patients to drink more water.', answer: 1, explanation: 'Özne + fiil yapısı → advise.' },
      { sentence: 'I would ___ against buying that car.', answer: 1, explanation: '"would" sonrası yalın fiil → advise.' },
      { sentence: 'That was the best piece of ___ I’ve ever had.', answer: 0, explanation: '"a piece of" sayılamaz isimle kullanılır → advice.' },
    ],
  },
];
