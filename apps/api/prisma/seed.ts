import { getPrisma } from '../src/lib/prisma';
import { VOCABULARY_DECKS, type VocabularyDeck } from '../src/content/vocabulary';

const prisma = getPrisma();

/**
 * Sistem destelerini ve kartlarını upsert eder. Kimlikler slug'dan türetildiği için
 * tekrar çalıştırmak güvenlidir; mevcut `UserCardSRS` ilerlemesi silinmez.
 * Bir kart başka bir desteye taşınırsa (ör. break-the-ice) yalnızca `deckId` güncellenir.
 */
async function seedDeck(deck: VocabularyDeck): Promise<number> {
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
    const cardId = `seed-card-${card.slug}`;
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
      where: { id: cardId },
      create: { id: cardId, ...cardData },
      update: cardData,
    });
  }

  return deck.cards.length;
}

async function main(): Promise<void> {
  let total = 0;
  for (const deck of VOCABULARY_DECKS) {
    total += await seedDeck(deck);
  }
  console.log(`Seed tamamlandı: ${VOCABULARY_DECKS.length} deste, ${total} kart.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
