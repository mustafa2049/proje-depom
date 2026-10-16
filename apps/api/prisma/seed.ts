import { CEFRLevel } from '@prisma/client';

import { getPrisma } from '../src/lib/prisma';

const prisma = getPrisma();

interface SeedCard {
  slug: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2: string;
  synonyms: string[];
}

interface SeedDeck {
  slug: string;
  title: string;
  description: string;
  level: CEFRLevel;
  cards: SeedCard[];
}

const DECKS: SeedDeck[] = [
  {
    slug: 'a1',
    title: 'Temel Kelimeler',
    description: 'A1 seviyesi günlük hayat için temel kelimeler.',
    level: CEFRLevel.A1,
    cards: [
      {
        slug: 'book',
        term: 'book',
        phonetic: '/bʊk/',
        partOfSpeech: 'noun',
        translationTR: 'kitap',
        definitionEN: 'A set of printed pages fastened together that you read.',
        exampleSentence1: 'I am reading a good book about history.',
        exampleSentence2: 'She put the book back on the shelf.',
        synonyms: ['volume', 'publication'],
      },
      {
        slug: 'friend',
        term: 'friend',
        phonetic: '/frend/',
        partOfSpeech: 'noun',
        translationTR: 'arkadaş',
        definitionEN: 'A person you know well and like, who is not a member of your family.',
        exampleSentence1: 'My best friend lives next door.',
        exampleSentence2: 'We have been friends since school.',
        synonyms: ['companion', 'buddy'],
      },
      {
        slug: 'happy',
        term: 'happy',
        phonetic: '/ˈhæpi/',
        partOfSpeech: 'adjective',
        translationTR: 'mutlu',
        definitionEN: 'Feeling or showing pleasure and contentment.',
        exampleSentence1: 'I am so happy to see you again.',
        exampleSentence2: 'The children were happy at the party.',
        synonyms: ['glad', 'cheerful'],
      },
      {
        slug: 'eat',
        term: 'eat',
        phonetic: '/iːt/',
        partOfSpeech: 'verb',
        translationTR: 'yemek yemek',
        definitionEN: 'To put food into your mouth and swallow it.',
        exampleSentence1: 'We eat dinner together at seven.',
        exampleSentence2: 'Did you eat breakfast this morning?',
        synonyms: ['consume', 'dine'],
      },
      {
        slug: 'house',
        term: 'house',
        phonetic: '/haʊs/',
        partOfSpeech: 'noun',
        translationTR: 'ev',
        definitionEN: 'A building where people live, usually for one family.',
        exampleSentence1: 'They bought a big house in the countryside.',
        exampleSentence2: 'Our house has three bedrooms and a garden.',
        synonyms: ['home', 'residence'],
      },
      {
        slug: 'go',
        term: 'go',
        phonetic: '/ɡoʊ/',
        partOfSpeech: 'verb',
        translationTR: 'gitmek',
        definitionEN: 'To move or travel from one place to another.',
        exampleSentence1: 'I go to work by bus every morning.',
        exampleSentence2: "Let's go to the park this afternoon.",
        synonyms: ['travel', 'leave'],
      },
    ],
  },
  {
    slug: 'a2',
    title: 'Günlük İngilizce',
    description: 'A2 seviyesi günlük iletişim ve yaygın fiiller.',
    level: CEFRLevel.A2,
    cards: [
      {
        slug: 'decide',
        term: 'decide',
        phonetic: '/dɪˈsaɪd/',
        partOfSpeech: 'verb',
        translationTR: 'karar vermek',
        definitionEN: 'To make a choice about what to do.',
        exampleSentence1: 'I decided to learn English this year.',
        exampleSentence2: "She still hasn't decided where to live.",
        synonyms: ['choose', 'determine'],
      },
      {
        slug: 'borrow',
        term: 'borrow',
        phonetic: '/ˈbɑːroʊ/',
        partOfSpeech: 'verb',
        translationTR: 'ödünç almak',
        definitionEN: 'To take something from someone with the intention of giving it back.',
        exampleSentence1: 'Can I borrow your pen for a minute?',
        exampleSentence2: 'I borrowed three novels from the library.',
        synonyms: ['take on loan', 'use temporarily'],
      },
      {
        slug: 'expensive',
        term: 'expensive',
        phonetic: '/ɪkˈspensɪv/',
        partOfSpeech: 'adjective',
        translationTR: 'pahalı',
        definitionEN: 'Costing a lot of money.',
        exampleSentence1: 'This restaurant is too expensive for me.',
        exampleSentence2: 'Designer clothes are often expensive.',
        synonyms: ['costly', 'pricey'],
      },
      {
        slug: 'realize',
        term: 'realize',
        phonetic: '/ˈriːəlaɪz/',
        partOfSpeech: 'verb',
        translationTR: 'fark etmek, anlamak',
        definitionEN: 'To become aware of something or understand it.',
        exampleSentence1: 'I suddenly realized I had left my keys at home.',
        exampleSentence2: 'Did you realize how late it is?',
        synonyms: ['notice', 'understand'],
      },
      {
        slug: 'advice',
        term: 'advice',
        phonetic: '/ədˈvaɪs/',
        partOfSpeech: 'noun',
        translationTR: 'tavsiye, öğüt',
        definitionEN: 'An opinion or suggestion about what someone should do.',
        exampleSentence1: 'Can you give me some advice about my career?',
        exampleSentence2: 'She took her doctor\'s advice and rested for a week.',
        synonyms: ['guidance', 'recommendation'],
      },
      {
        slug: 'improve',
        term: 'improve',
        phonetic: '/ɪmˈpruːv/',
        partOfSpeech: 'verb',
        translationTR: 'geliştirmek',
        definitionEN: 'To make something better, or to get better.',
        exampleSentence1: 'My English has improved a lot this year.',
        exampleSentence2: 'We need to improve our customer service.',
        synonyms: ['enhance', 'upgrade'],
      },
    ],
  },
  {
    slug: 'b1',
    title: 'Phrasal Verbs',
    description: 'B1 seviyesi en sık kullanılan phrasal verb\'ler.',
    level: CEFRLevel.B1,
    cards: [
      {
        slug: 'look-after',
        term: 'look after',
        phonetic: '/lʊk ˈæftər/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'ilgilenmek, bakmak',
        definitionEN: 'To take care of someone or something.',
        exampleSentence1: 'My grandmother looks after the children on weekdays.',
        exampleSentence2: "Please look after my cat while I'm away.",
        synonyms: ['take care of', 'care for'],
      },
      {
        slug: 'give-up',
        term: 'give up',
        phonetic: '/ɡɪv ʌp/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'vazgeçmek, pes etmek',
        definitionEN: 'To stop trying to do something, or to stop a habit.',
        exampleSentence1: "Don't give up; you're almost there!",
        exampleSentence2: 'He gave up smoking last year.',
        synonyms: ['quit', 'abandon'],
      },
      {
        slug: 'turn-down',
        term: 'turn down',
        phonetic: '/tɜːrn daʊn/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'reddetmek, geri çevirmek',
        definitionEN: 'To refuse an offer, request, or invitation.',
        exampleSentence1: 'She turned down the job because the salary was low.',
        exampleSentence2: 'I had to turn down his invitation to the wedding.',
        synonyms: ['reject', 'decline'],
      },
      {
        slug: 'run-out-of',
        term: 'run out of',
        phonetic: '/rʌn aʊt əv/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'bir şeyin tükenmesi',
        definitionEN: 'To have no more of something left.',
        exampleSentence1: "We've run out of milk, so please buy some on your way home.",
        exampleSentence2: "I'm running out of time to finish this report.",
        synonyms: ['exhaust', 'deplete'],
      },
      {
        slug: 'put-off',
        term: 'put off',
        phonetic: '/pʊt ɔːf/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'ertelemek',
        definitionEN: 'To postpone something until a later time.',
        exampleSentence1: "Don't put off your homework until the last minute.",
        exampleSentence2: 'The meeting was put off until Friday.',
        synonyms: ['postpone', 'delay'],
      },
      {
        slug: 'figure-out',
        term: 'figure out',
        phonetic: '/ˈfɪɡjər aʊt/',
        partOfSpeech: 'phrasal verb',
        translationTR: 'çözmek, anlamak',
        definitionEN: 'To understand something or find the answer to a problem.',
        exampleSentence1: "I can't figure out how this machine works.",
        exampleSentence2: "Let's figure out a plan together.",
        synonyms: ['work out', 'understand'],
      },
    ],
  },
  {
    slug: 'b2',
    title: 'İş Dünyası ve Deyimler',
    description: 'B2 seviyesi iş İngilizcesi, akademik kelimeler ve deyimler.',
    level: CEFRLevel.B2,
    cards: [
      {
        slug: 'achieve',
        term: 'achieve',
        phonetic: '/əˈtʃiːv/',
        partOfSpeech: 'verb',
        translationTR: 'başarmak',
        definitionEN: 'To succeed in doing something, often after effort.',
        exampleSentence1: 'She achieved her goal of running a marathon.',
        exampleSentence2: 'With hard work, you can achieve almost anything.',
        synonyms: ['accomplish', 'attain'],
      },
      {
        slug: 'opportunity',
        term: 'opportunity',
        phonetic: '/ˌɑːpərˈtuːnəti/',
        partOfSpeech: 'noun',
        translationTR: 'fırsat',
        definitionEN: 'A chance to do something good or useful.',
        exampleSentence1: 'This job is a great opportunity for growth.',
        exampleSentence2: "I'd like the opportunity to speak with the manager.",
        synonyms: ['chance', 'occasion'],
      },
      {
        slug: 'break-the-ice',
        term: 'break the ice',
        phonetic: '/breɪk ði aɪs/',
        partOfSpeech: 'idiom',
        translationTR: 'buzları eritmek',
        definitionEN: 'To say or do something to make people feel relaxed when they first meet.',
        exampleSentence1: 'A funny joke helped break the ice at the meeting.',
        exampleSentence2: 'He asked everyone about their weekend to break the ice.',
        synonyms: ['ease tension', 'start a conversation'],
      },
      {
        slug: 'same-page',
        term: 'on the same page',
        phonetic: '/ɑːn ðə seɪm peɪdʒ/',
        partOfSpeech: 'idiom',
        translationTR: 'aynı fikirde olmak',
        definitionEN: 'To have the same understanding or opinion about something.',
        exampleSentence1: "Before we start, let's make sure we're all on the same page.",
        exampleSentence2: 'The team was not on the same page about the budget.',
        synonyms: ['in agreement', 'aligned'],
      },
      {
        slug: 'deadline',
        term: 'deadline',
        phonetic: '/ˈdedlaɪn/',
        partOfSpeech: 'noun',
        translationTR: 'son teslim tarihi',
        definitionEN: 'The latest time or date by which something must be done.',
        exampleSentence1: 'The deadline for the report is Monday.',
        exampleSentence2: "We're working hard to meet the deadline.",
        synonyms: ['due date', 'cutoff'],
      },
      {
        slug: 'negotiate',
        term: 'negotiate',
        phonetic: '/nɪˈɡoʊʃieɪt/',
        partOfSpeech: 'verb',
        translationTR: 'müzakere etmek',
        definitionEN: 'To discuss something formally in order to reach an agreement.',
        exampleSentence1: 'They negotiated a better salary for the new position.',
        exampleSentence2: 'We need to negotiate the terms of the contract.',
        synonyms: ['bargain', 'discuss'],
      },
      {
        slug: 'feedback',
        term: 'feedback',
        phonetic: '/ˈfiːdbæk/',
        partOfSpeech: 'noun',
        translationTR: 'geri bildirim',
        definitionEN: 'Information or opinions about how well someone is doing something.',
        exampleSentence1: 'The manager gave me useful feedback on my presentation.',
        exampleSentence2: 'Please send your feedback by Friday.',
        synonyms: ['comments', 'response'],
      },
    ],
  },
];

async function seedDeck(deck: SeedDeck): Promise<number> {
  const deckId = `seed-deck-${deck.slug}`;

  await prisma.deck.upsert({
    where: { id: deckId },
    create: {
      id: deckId,
      title: deck.title,
      description: deck.description,
      level: deck.level,
      isSystem: true,
    },
    update: {
      title: deck.title,
      description: deck.description,
      level: deck.level,
      isSystem: true,
    },
  });

  for (const card of deck.cards) {
    const cardData = {
      deckId,
      term: card.term,
      phonetic: card.phonetic,
      partOfSpeech: card.partOfSpeech,
      translationTR: card.translationTR,
      definitionEN: card.definitionEN,
      exampleSentence1: card.exampleSentence1,
      exampleSentence2: card.exampleSentence2,
      synonyms: card.synonyms,
    };

    await prisma.card.upsert({
      where: { id: `seed-card-${card.slug}` },
      create: { id: `seed-card-${card.slug}`, ...cardData },
      update: cardData,
    });
  }

  return deck.cards.length;
}

async function main(): Promise<void> {
  let total = 0;
  for (const deck of DECKS) {
    total += await seedDeck(deck);
  }
  console.log(`Seed tamamlandı: ${DECKS.length} deste, ${total} kart.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
