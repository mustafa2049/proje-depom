import type { BoxNumber, CardState, ReviewOutcome } from './types';

/** Kutu başına tekrar aralığı (gün). Kutu 1 her gün, Kutu 5 ayda bir. */
export const BOX_INTERVALS: Record<BoxNumber, number> = { 1: 1, 2: 2, 3: 5, 4: 14, 5: 30 };

export const BOX_LABELS: Record<BoxNumber, string> = {
  1: 'Her Gün',
  2: '2 Gün',
  3: '5 Gün',
  4: '14 Gün',
  5: '30 Gün',
};

export const BOX_DESCRIPTIONS: Record<BoxNumber, string> = {
  1: 'Yeni veya zorlanan kelimeler',
  2: 'İlk kavrama periyodu',
  3: 'Gelişen aktif hatırlama',
  4: 'Güçlü nöral bağlantılar',
  5: 'Tam ustalaşmış dağarcık',
};

/** Tasarımdaki renk kodlaması: K1 kırmızı, K2 amber, K3 indigo, K4-5 zümrüt. */
export const BOX_COLORS: Record<BoxNumber, { text: string; bg: string; soft: string }> = {
  1: { text: 'text-error', bg: 'bg-error', soft: 'bg-error-container/40' },
  2: { text: 'text-tertiary', bg: 'bg-tertiary', soft: 'bg-tertiary-container/30' },
  3: { text: 'text-primary', bg: 'bg-primary', soft: 'bg-primary-container/30' },
  4: { text: 'text-secondary', bg: 'bg-secondary', soft: 'bg-secondary-container/20' },
  5: { text: 'text-primary-fixed', bg: 'bg-primary-container', soft: 'bg-primary-container/20' },
};

/** Bu kadar arka arkaya unutulan kart "inatçı kelime" kliniğine düşer. */
export const LEECH_THRESHOLD = 4;

const DAY_MS = 86_400_000;

/** Saat diliminden bağımsız, yerel takvim gününe göre artan gün indeksi. */
export function dayIndex(date: Date | number = Date.now()): number {
  const d = typeof date === 'number' ? new Date(date) : date;
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

/** YYYY-MM-DD biçiminde yerel tarih anahtarı. */
export function dayKey(date: Date | number = Date.now()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dayKeyFromIndex(index: number): string {
  const d = new Date(index * DAY_MS);
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}-${day}`;
}

export function clampBox(n: number): BoxNumber {
  return Math.min(5, Math.max(1, Math.round(n))) as BoxNumber;
}

/** Bir değerlendirme sonrası kartın gideceği kutu. */
export function nextBox(current: BoxNumber | 0, outcome: ReviewOutcome): BoxNumber {
  if (outcome === 'forgot') return 1;
  if (outcome === 'easy') return 5;
  // Yeni kart "Biliyorum" derse Kutu 2'den başlar.
  return clampBox(current === 0 ? 2 : current + 1);
}

export function newCard(wordId: string, box: BoxNumber, now = Date.now()): CardState {
  return {
    wordId,
    box,
    // Yeni eklenen kart hemen (bugün) çalışılabilir.
    dueDay: dayIndex(now),
    lapses: 0,
    failStreak: 0,
    reviews: 0,
    correct: 0,
    lastReviewed: 0,
    addedAt: now,
  };
}

/** Kartı Leitner kuralına göre günceller. */
export function applyReview(
  card: CardState | undefined,
  wordId: string,
  outcome: ReviewOutcome,
  now = Date.now(),
): CardState {
  const from = card?.box ?? 0;
  const box = nextBox(from, outcome);
  const base = card ?? newCard(wordId, 1, now);
  const forgot = outcome === 'forgot';
  return {
    ...base,
    box,
    dueDay: dayIndex(now) + BOX_INTERVALS[box],
    lapses: base.lapses + (forgot ? 1 : 0),
    failStreak: forgot ? base.failStreak + 1 : 0,
    reviews: base.reviews + 1,
    correct: base.correct + (forgot ? 0 : 1),
    lastReviewed: now,
  };
}

export function isDue(card: CardState, now = Date.now()): boolean {
  return card.dueDay <= dayIndex(now);
}

export function isLeech(card: CardState): boolean {
  return card.box === 1 && card.failStreak >= LEECH_THRESHOLD;
}

/** "Kutu 2 • 2 Gün Sonra" gibi okunabilir bir sonraki tekrar etiketi. */
export function dueLabel(card: CardState, now = Date.now()): string {
  const diff = card.dueDay - dayIndex(now);
  if (diff <= 0) return 'Bugün';
  if (diff === 1) return 'Yarın';
  return `${diff} Gün Sonra`;
}

/** Bugün itibarıyla çalışma serisi (art arda en az bir tekrar yapılan gün sayısı). */
export function computeStreak(
  history: Record<string, { reviews: number }>,
  now = Date.now(),
): number {
  const today = dayIndex(now);
  let start = today;
  if (!(history[dayKeyFromIndex(today)]?.reviews > 0)) start = today - 1;
  let streak = 0;
  for (let d = start; ; d--) {
    if (history[dayKeyFromIndex(d)]?.reviews > 0) streak++;
    else break;
  }
  return streak;
}

/** Arka arkaya en uzun seri. */
export function longestStreak(history: Record<string, { reviews: number }>): number {
  const days = Object.keys(history)
    .filter((k) => history[k].reviews > 0)
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
    })
    .sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev = Number.NaN;
  for (const d of days) {
    run = d === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
