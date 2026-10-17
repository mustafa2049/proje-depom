import type { CefrLevel as CEFRLevel } from '../types';

export type PassageCategory = 'diary' | 'dialogue' | 'article' | 'story' | 'essay';

export interface KeyVocabularyItem {
  term: string;
  translationTR: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanationTR: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: CEFRLevel;
  category: PassageCategory;
  estimatedMinutes: number;
  /** Paragraflar boş satırla ayrılır. */
  content: string;
  keyVocabulary: KeyVocabularyItem[];
  comprehensionQuestions: ComprehensionQuestion[];
}

/**
 * Okuma kütüphanesi. Her parça A1–C2 aralığındaki bir seviyeye aittir ve 3 okuduğunu anlama sorusu içerir.
 */
export const READING_PASSAGES: readonly ReadingPassage[] = [
  {
    id: 'passage-a1-my-day',
    title: 'A Day at Home',
    level: 'A1',
    category: 'diary',
    estimatedMinutes: 2,
    content: [
      'Hello, my name is Ayşe. I am a student in Istanbul. Every day I wake up at seven o\'clock. I have breakfast with my family. I eat bread, cheese and an egg. Then I walk to school. My school is near the park.',
      'In the afternoon I like to read books. Today I read a short story about a cat. It was very funny. In the evening I cook pasta with my sister. We watch a film and then we go to bed at ten.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'wake up', translationTR: 'uyanmak' },
      { term: 'breakfast', translationTR: 'kahvaltı' },
      { term: 'near', translationTR: 'yakın' },
      { term: 'funny', translationTR: 'komik' },
      { term: 'cook', translationTR: 'pişirmek' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'What time does Ayşe wake up?',
        options: ['At six', 'At seven', 'At eight', 'At nine'],
        answerIndex: 1,
        explanationTR: 'Metinde "Every day I wake up at seven o\'clock" yazıyor.',
      },
      {
        id: 'q2',
        question: 'What does Ayşe do in the afternoon?',
        options: ['She goes to school', 'She reads books', 'She cooks', 'She sleeps'],
        answerIndex: 1,
        explanationTR: 'Öğleden sonra kitap okumayı sevdiğini söylüyor.',
      },
      {
        id: 'q3',
        question: 'Who does she cook pasta with?',
        options: ['Her mother', 'Her friend', 'Her sister', 'Her brother'],
        answerIndex: 2,
        explanationTR: 'Akşam kız kardeşiyle makarna pişiriyor.',
      },
    ],
  },
  {
    id: 'passage-a2-cafe-dialogue',
    title: 'At the Café',
    level: 'A2',
    category: 'dialogue',
    estimatedMinutes: 3,
    content: [
      'Waiter: Good morning! What would you like?',
      'Mia: Hi. I would like a cappuccino, please. And a piece of chocolate cake.',
      'Waiter: Sure. Do you want something to drink with the cake?',
      'Mia: No, thanks. Just the coffee. How much is it?',
      'Waiter: It is four pounds fifty.',
      'Mia: Here you are. Keep the change.',
      'Waiter: Thank you very much. Have a nice day!',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'would like', translationTR: 'istemek (nezaket kalıbı)' },
      { term: 'piece', translationTR: 'parça' },
      { term: 'sure', translationTR: 'tabii' },
      { term: 'keep the change', translationTR: 'üstü kendine al' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'What does Mia order?',
        options: ['A tea and a sandwich', 'A cappuccino and a cake', 'Two coffees', 'Only a glass of water'],
        answerIndex: 1,
        explanationTR: 'Mia bir cappuccino ve bir dilim çikolatalı pasta istiyor.',
      },
      {
        id: 'q2',
        question: 'How much is the coffee?',
        options: ['£2.50', '£4.50', '£6.00', '£8.00'],
        answerIndex: 1,
        explanationTR: 'Garson "four pounds fifty" diyor.',
      },
      {
        id: 'q3',
        question: 'Why does Mia say "Keep the change"?',
        options: ['She wants a refund', 'She gives a tip', 'She wants a bag', 'She is angry'],
        answerIndex: 1,
        explanationTR: 'Üstü garsona bırakarak bahşiş veriyor.',
      },
    ],
  },
  {
    id: 'passage-b1-working-from-home',
    title: 'Working from Home',
    level: 'B1',
    category: 'article',
    estimatedMinutes: 4,
    content: [
      'More and more people now work from home. Some companies have changed their rules since the pandemic, and many employees prefer to stay at home for at least part of the week. There are clear advantages. Workers do not have to spend hours in traffic, and they can often plan their day more flexibly.',
      'However, working from home also has disadvantages. Some people find it hard to separate their work life from their personal life. Others miss the social contact with their colleagues, which can make them feel lonely. Managers, too, sometimes find it difficult to know whether their team is productive.',
      'Most experts agree that the best solution is a mix of both. A hybrid model allows employees to enjoy the flexibility of home while still meeting in the office for important discussions.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'flexibly', translationTR: 'esnek bir şekilde' },
      { term: 'separate', translationTR: 'ayırmak' },
      { term: 'lonely', translationTR: 'yalnız' },
      { term: 'productive', translationTR: 'verimli' },
      { term: 'hybrid', translationTR: 'karma, melez' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'What is one advantage of working from home mentioned in the text?',
        options: ['Higher salaries', 'No time spent in traffic', 'More meetings', 'Less flexibility'],
        answerIndex: 1,
        explanationTR: 'Metin, trafikte saat harcanmamasını bir avantaj olarak sayıyor.',
      },
      {
        id: 'q2',
        question: 'Why do some people feel lonely?',
        options: [
          'They miss contact with colleagues',
          'They have too much money',
          'They work too hard in the office',
          'They do not like technology',
        ],
        answerIndex: 0,
        explanationTR: 'İş arkadaşlarıyla sosyal temas eksikliği yalnızlık hissi yaratabiliyor.',
      },
      {
        id: 'q3',
        question: 'What do most experts suggest?',
        options: [
          'Working only at home',
          'Working only in the office',
          'A mix of home and office work',
          'Stopping remote work completely',
        ],
        answerIndex: 2,
        explanationTR: 'Uzmanların çoğu evden ve ofisten karma bir model öneriyor.',
      },
    ],
  },
  {
    id: 'passage-b1-lost-umbrella',
    title: 'The Lost Umbrella',
    level: 'B1',
    category: 'story',
    estimatedMinutes: 4,
    content: [
      'On a rainy Monday, Daniel left the bus with a new black umbrella. He was late for an important meeting, so he ran across the street without looking carefully. When he arrived at the office, he realised that the umbrella was not in his hand anymore. He must have left it on the bus.',
      'He thought about it all morning. Finally, at lunchtime, he called the bus company. A kind woman answered the phone and said that many umbrellas were found every week. She asked him to describe it.',
      'Two days later, the company sent him a message. The umbrella was waiting for him at the lost property office. Daniel smiled. From that day on, he always checked his bags before getting off the bus.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'realise', translationTR: 'fark etmek' },
      { term: 'must have', translationTR: '-miş olmalı' },
      { term: 'lost property office', translationTR: 'kayıp eşya bürosu' },
      { term: 'get off', translationTR: 'inmek' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Why was Daniel in a hurry?',
        options: ['He missed the bus', 'He was late for a meeting', 'He wanted to buy an umbrella', 'It was raining too hard'],
        answerIndex: 1,
        explanationTR: 'Önemli bir toplantıya geç kaldığı için acele ediyordu.',
      },
      {
        id: 'q2',
        question: 'How did Daniel find out about his umbrella?',
        options: ['A friend told him', 'He saw it in the street', 'The company sent him a message', 'He found it on the bus'],
        answerIndex: 2,
        explanationTR: 'Şirket ona şemsiyesinin bulunduğunu bildiren bir mesaj gönderdi.',
      },
      {
        id: 'q3',
        question: 'What did Daniel learn?',
        options: [
          'To buy cheaper umbrellas',
          'To check his bags before leaving the bus',
          'To take taxis',
          'To never use umbrellas',
        ],
        answerIndex: 1,
        explanationTR: 'Artık otobüsten inmeden önce çantalarını kontrol ediyor.',
      },
    ],
  },
  {
    id: 'passage-b2-greener-cities',
    title: 'How Cities Are Getting Greener',
    level: 'B2',
    category: 'article',
    estimatedMinutes: 6,
    content: [
      'Across the world, city planners are rethinking the role of green spaces. Rather than treating parks as a luxury, many governments now regard them as essential infrastructure. Trees reduce air pollution, absorb rainwater and lower temperatures during heatwaves, which is increasingly important as summers grow hotter.',
      'Some cities have gone further by converting rooftops and disused railway lines into gardens. These initiatives not only improve the environment but also encourage residents to spend time outdoors, which has measurable benefits for mental health. Critics, however, argue that such projects can be expensive and may lead to gentrification, as rising property values push out the people who originally lived in the neighbourhood.',
      'The challenge, therefore, is to design green spaces that benefit everyone. Successful projects usually involve local communities from the very beginning, so that residents shape the plans rather than simply receiving them.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'rethink', translationTR: 'yeniden düşünmek' },
      { term: 'absorb', translationTR: 'emmek, soğurmak' },
      { term: 'disused', translationTR: 'artık kullanılmayan' },
      { term: 'gentrification', translationTR: 'soylulaştırma' },
      { term: 'measurable', translationTR: 'ölçülebilir' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'According to the text, why are trees important in cities?',
        options: [
          'They make streets wider',
          'They reduce pollution and lower temperatures',
          'They replace buildings',
          'They only increase property prices',
        ],
        answerIndex: 1,
        explanationTR: 'Ağaçlar hava kirliliğini azaltır ve sıcaklıkları düşürür.',
      },
      {
        id: 'q2',
        question: 'What is a criticism of green projects?',
        options: [
          'They are always too small',
          'They can raise property values and displace residents',
          'They reduce mental health',
          'They use too much water',
        ],
        answerIndex: 1,
        explanationTR: 'Eleştirmenler, emlak değerlerinin artıp sakinlerin yerinden edilebileceğini savunuyor.',
      },
      {
        id: 'q3',
        question: 'What makes a green project successful, according to the text?',
        options: [
          'Hiring famous designers',
          'Involving local communities early',
          'Building only in the city centre',
          'Ignoring the critics',
        ],
        answerIndex: 1,
        explanationTR: 'Metne göre yerel toplulukların en baştan dahil edilmesi başarıyı artırır.',
      },
    ],
  },
  {
    id: 'passage-c1-artificial-memory',
    title: 'The Ethics of Artificial Memory',
    level: 'C1',
    category: 'essay',
    estimatedMinutes: 8,
    content: [
      'Advances in neuroscience and machine learning have brought us closer to a question that once belonged to science fiction: could memories be stored, edited or even erased? Proponents of such technologies argue that they could relieve the suffering of trauma survivors and help people recover from addiction. Few would object to that goal. The difficulty lies in the margins, where therapy shades into enhancement and remembering shades into rewriting.',
      'Memory is not a passive archive. Each time we recall an event, we reconstruct it, and the reconstruction is subtly altered by our current beliefs and emotions. An artificial intervention that edits memory would therefore not merely retrieve the past; it would authorise a version of it. Who decides which version is accurate, and who bears responsibility when a reconstructed memory proves false?',
      'These questions suggest that the regulation of memory technologies cannot be left to engineers alone. Philosophers, clinicians and, crucially, the people whose minds would be altered must have a voice in deciding where the boundaries lie.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'proponent', translationTR: 'savunucu' },
      { term: 'trauma', translationTR: 'travma' },
      { term: 'shade into', translationTR: 'yavaşça dönüşmek' },
      { term: 'authorise', translationTR: 'yetki vermek, onaylamak' },
      { term: 'bear responsibility', translationTR: 'sorumluluk taşımak' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'What is the main difficulty the author identifies?',
        options: [
          'Finding funding for research',
          'Where therapy becomes enhancement',
          'Storing too much data',
          'Public disinterest',
        ],
        answerIndex: 1,
        explanationTR: 'Yazar, tedavi ile geliştirmenin sınırındaki belirsizliği ana sorun olarak görüyor.',
      },
      {
        id: 'q2',
        question: 'Why does the author say memory is not a passive archive?',
        options: [
          'Because people forget everything',
          'Because each recall reconstructs the event',
          'Because machines cannot read it',
          'Because it is stored in books',
        ],
        answerIndex: 1,
        explanationTR: 'Her hatırlama, olayı yeniden kurar ve bu da anıyı değiştirir.',
      },
      {
        id: 'q3',
        question: 'What does the author argue about regulation?',
        options: [
          'Engineers should decide alone',
          'Only doctors should regulate it',
          'Affected people and other experts should have a voice',
          'It should not be regulated at all',
        ],
        answerIndex: 2,
        explanationTR: 'Düzenlemeye felsefeciler, klinisyenler ve etkilenen insanlar birlikte karar vermeli.',
      },
    ],
  },
  {
    id: 'passage-c2-language-identity',
    title: 'On Language and Thought',
    level: 'C2',
    category: 'essay',
    estimatedMinutes: 7,
    content: [
      'The relationship between language and thought has long fascinated linguists. The strong version of the linguistic relativity hypothesis, which holds that language wholly determines cognition, has largely been abandoned. Yet its weaker formulation, that linguistic categories nudge speakers toward particular habits of attention, enjoys considerable empirical support. Speakers of languages that grammatically mark evidentiality, for instance, tend to track the source of their information more carefully than speakers of languages that do not.',
      'Such findings should caution us against both naive universalism and a romantic insistence on incommensurability. Languages are neither windows onto an identical mental world nor sealed chambers. They are tools that shape, without fully confining, the thoughts of those who use them.',
    ].join('\n\n'),
    keyVocabulary: [
      { term: 'hypothesis', translationTR: 'hipotez, varsayım' },
      { term: 'nudge', translationTR: 'dürtmek, yönlendirmek' },
      { term: 'evidentiality', translationTR: 'kanıtsallık (bilgi kaynağını belirtme)' },
      { term: 'incommensurability', translationTR: 'ölçülemezlik, karşılaştırılamazlık' },
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'What has been largely abandoned, according to the text?',
        options: [
          'The weak version of the hypothesis',
          'The strong version of the linguistic relativity hypothesis',
          'Studies of evidentiality',
          'Universalism',
        ],
        answerIndex: 1,
        explanationTR: 'Dilin düşünceyi tamamen belirlediği güçlü versiyon büyük ölçüde terk edilmiş.',
      },
      {
        id: 'q2',
        question: 'What do languages that mark evidentiality do?',
        options: [
          'Ignore sources of information',
          'Track the source of information grammatically',
          'Prevent speakers from thinking',
          'Use only translations',
        ],
        answerIndex: 1,
        explanationTR: 'Bu diller, bilginin kaynağını dilbilgisel olarak işaretler.',
      },
      {
        id: 'q3',
        question: 'What is the author\'s final view of languages?',
        options: [
          'They are sealed chambers',
          'They are identical windows onto the mind',
          'They shape thought without fully confining it',
          'They have no effect on thought',
        ],
        answerIndex: 2,
        explanationTR: 'Yazara göre diller düşünceyi şekillendirir ama tamamen hapsetmez.',
      },
    ],
  },
];
