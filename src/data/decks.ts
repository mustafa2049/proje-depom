import type { Deck } from '../lib/types';

export const PERSONAL_DECK_ID = 'personal';

export const DECKS: Deck[] = [
  {
    id: 'sitcom',
    title: 'Sitcom & Dizi Replikleri',
    emoji: '🎬',
    description: 'Dizilerde sık duyulan doğal konuşma kalıpları',
    tag: 'Kült Dizi',
    tagIcon: 'movie',
    level: 'B1 • Orta Seviye',
    color: 'tertiary',
    image: 'images/deck-sitcom.jpg',
  },
  {
    id: 'business',
    title: 'İş İngilizcesi & Toplantılar',
    emoji: '💼',
    description: 'Müzakere, e-posta jargonu ve sunum dili',
    tag: 'Kariyer',
    tagIcon: 'business_center',
    level: 'B2 • İleri Seviye',
    color: 'primary',
    image: 'images/deck-business.jpg',
  },
  {
    id: 'academic',
    title: 'Akademik & Sınav Kelimeleri',
    emoji: '🎓',
    description: 'IELTS & TOEFL için kritik akademik kelimeler',
    tag: 'Sınav Odaklı',
    tagIcon: 'school',
    level: 'C1 • Uzman Seviye',
    color: 'secondary',
    image: 'images/deck-academic.jpg',
  },
  {
    id: 'daily',
    title: 'Günlük Konuşma & Idioms',
    emoji: '💬',
    description: 'Doğal konuşma dili ve sokak deyimleri',
    tag: 'Pratik',
    tagIcon: 'record_voice_over',
    level: 'B1 • Akıcı',
    color: 'secondary',
    icon: 'forum',
  },
  {
    id: 'core',
    title: 'En Çok Kullanılan Kelimeler',
    emoji: '⚡',
    description: 'Her gün karşına çıkacak çekirdek kelime dağarcığı',
    tag: 'Temel',
    tagIcon: 'verified',
    level: 'A1-B1 • Çekirdek',
    color: 'tertiary',
    icon: 'bolt',
  },
  {
    id: PERSONAL_DECK_ID,
    title: 'Kişisel Destem',
    emoji: '⭐',
    description: 'Kendi eklediğin kelimeler ve kalıplar',
    tag: 'Kişisel',
    tagIcon: 'person',
    level: 'Karışık Seviye',
    color: 'primary',
    icon: 'bookmark_add',
  },
];

export function getDeck(id: string): Deck | undefined {
  return DECKS.find((d) => d.id === id);
}
