import { DECKS } from '../data/decks';
import { SEED_WORDS } from '../data/words';
import { computeStreak, dayIndex, dayKey, dayKeyFromIndex, isDue, isLeech, longestStreak } from '../lib/leitner';
import type { AppState, BoxNumber, CardState, Word } from '../lib/types';

export function allWords(state: AppState): Word[] {
  const custom = new Map(state.customWords.map((w) => [w.id, w]));
  const seed = SEED_WORDS.map((w) => custom.get(w.id) ?? w);
  const extra = state.customWords.filter((w) => !SEED_WORDS.some((s) => s.id === w.id));
  return [...seed, ...extra];
}

export function wordMap(state: AppState): Record<string, Word> {
  return Object.fromEntries(allWords(state).map((w) => [w.id, w]));
}

export function boxCounts(state: AppState): Record<BoxNumber, number> {
  const counts: Record<BoxNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of Object.values(state.cards)) counts[c.box]++;
  return counts;
}

export function dueCards(state: AppState, now = Date.now(), deckId?: string): CardState[] {
  const words = wordMap(state);
  return Object.values(state.cards)
    .filter((c) => words[c.wordId] && isDue(c, now) && (!deckId || words[c.wordId].deckId === deckId))
    .sort((a, b) => a.box - b.box || a.dueDay - b.dueDay);
}

/** Bugün daha kaç yeni kelime tanıtılabilir. */
export function newQuotaLeft(state: AppState, now = Date.now()): number {
  const learnedToday = state.history[dayKey(now)]?.newWords ?? 0;
  return Math.max(0, state.profile.newPerDay - learnedToday);
}

export function unseenWords(state: AppState, deckId?: string): Word[] {
  const decks = deckId ? [deckId] : state.enrolledDecks;
  return allWords(state).filter((w) => decks.includes(w.deckId) && !state.cards[w.id]);
}

export interface DailyPlan {
  dueIds: string[];
  newIds: string[];
  total: number;
  minutes: number;
}

/** Günün çalışma planı: önce vadesi gelen tekrarlar, sonra yeni kelimeler. */
export function dailyPlan(state: AppState, now = Date.now(), deckId?: string): DailyPlan {
  const goal = state.profile.dailyGoal;
  const dueIds = dueCards(state, now, deckId).map((c) => c.wordId).slice(0, goal);
  const room = Math.max(0, goal - dueIds.length);
  const quota = deckId ? Math.max(newQuotaLeft(state, now), Math.min(5, room)) : newQuotaLeft(state, now);
  const newIds = unseenWords(state, deckId)
    .slice(0, Math.min(room, quota))
    .map((w) => w.id);
  const total = dueIds.length + newIds.length;
  return { dueIds, newIds, total, minutes: Math.max(1, Math.ceil(total * 0.5)) };
}

export function leeches(state: AppState): CardState[] {
  return Object.values(state.cards)
    .filter(isLeech)
    .sort((a, b) => b.failStreak - a.failStreak);
}

export function streak(state: AppState, now = Date.now()): number {
  return computeStreak(state.history, now);
}

export function retentionPercent(state: AppState): number {
  const total = Object.keys(state.cards).length;
  if (!total) return 0;
  const c = boxCounts(state);
  return Math.round(((c[4] + c[5]) / total) * 100);
}

/** Son 30 günün doğru cevap oranı. */
export function accuracy(state: AppState, days = 30, now = Date.now()): number {
  const today = dayIndex(now);
  let reviews = 0;
  let correct = 0;
  for (let d = today - days + 1; d <= today; d++) {
    const s = state.history[dayKeyFromIndex(d)];
    if (s) {
      reviews += s.reviews;
      correct += s.correct;
    }
  }
  return reviews ? Math.round((correct / reviews) * 100) : 0;
}

export interface WeekDay {
  key: string;
  label: string;
  reviews: number;
  isToday: boolean;
}

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

/** İçinde bulunulan haftanın (Pazartesi–Pazar) günlük tekrar sayıları. */
export function currentWeek(state: AppState, now = Date.now()): WeekDay[] {
  const today = new Date(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = dayIndex(now) - mondayOffset;
  return Array.from({ length: 7 }, (_, i) => {
    const idx = monday + i;
    const key = dayKeyFromIndex(idx);
    const date = new Date(idx * 86_400_000);
    return {
      key,
      label: DAY_NAMES[date.getUTCDay()],
      reviews: state.history[key]?.reviews ?? 0,
      isToday: idx === dayIndex(now),
    };
  });
}

export function deckProgress(state: AppState, deckId: string) {
  const words = allWords(state).filter((w) => w.deckId === deckId);
  const cards = words.map((w) => state.cards[w.id]).filter(Boolean) as CardState[];
  const score = cards.reduce((sum, c) => sum + c.box, 0);
  const percent = words.length ? Math.round((score / (words.length * 5)) * 100) : 0;
  return { total: words.length, started: cards.length, percent };
}

export function cefrCounts(state: AppState): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const w of allWords(state)) counts[w.cefr] = (counts[w.cefr] ?? 0) + 1;
  return counts;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'error';
  earned: boolean;
  progress: number;
  goal: number;
}

export function achievements(state: AppState, now = Date.now()): Achievement[] {
  const counts = boxCounts(state);
  const totalReviews = Object.values(state.history).reduce((s, d) => s + d.reviews, 0);
  const lateNights = Object.values(state.history).filter((d) => d.lateNight && d.reviews > 0).length;
  const best = Math.max(streak(state, now), longestStreak(state.history));
  const items: Omit<Achievement, 'earned'>[] = [
    { id: 'first', title: 'İlk Adım', description: 'İlk kartını tekrar ettin.', icon: 'flag', color: 'primary', progress: totalReviews, goal: 1 },
    { id: 'hundred', title: 'Yüzlük Kulüp', description: 'Toplam 100 kart tekrarı yaptın.', icon: 'military_tech', color: 'secondary', progress: totalReviews, goal: 100 },
    { id: 'streak3', title: '3 Gün Seri', description: '3 gün üst üste çalıştın.', icon: 'local_fire_department', color: 'tertiary', progress: best, goal: 3 },
    { id: 'streak7', title: '7 Gün Seri Şampiyonu', description: 'Haftayı tek gün aksatmadan tamamladın.', icon: 'local_fire_department', color: 'tertiary', progress: best, goal: 7 },
    { id: 'streak30', title: 'Aylık Disiplin', description: '30 gün üst üste çalıştın.', icon: 'workspace_premium', color: 'tertiary', progress: best, goal: 30 },
    { id: 'box5-10', title: 'Kalıcı Bellek', description: 'Kutu 5’e 10 kelime taşıdın.', icon: 'lock', color: 'secondary', progress: counts[5], goal: 10 },
    { id: 'box5-50', title: 'Hafıza Ustası', description: 'Kutu 5’e 50 kelime taşıdın.', icon: 'psychology', color: 'secondary', progress: counts[5], goal: 50 },
    { id: 'night', title: 'Gece Kuşu', description: '5 farklı gün saat 22:00’den sonra pratik yaptın.', icon: 'bedtime', color: 'primary', progress: lateNights, goal: 5 },
    { id: 'collector', title: 'Kelime Koleksiyoncusu', description: '10 kendi kelimeni ekledin.', icon: 'bookmark_add', color: 'primary', progress: state.customWords.filter((w) => w.custom).length, goal: 10 },
    { id: 'writer', title: 'Günlük Yazarı', description: '5 mikro günlük yazdın.', icon: 'edit_note', color: 'secondary', progress: state.journal.length, goal: 5 },
    { id: 'reader', title: 'Hikaye Kurdu', description: '3 mikro hikaye tamamladın.', icon: 'auto_stories', color: 'primary', progress: state.completedStories.length, goal: 3 },
    { id: 'rescuer', title: 'Klinik Kahramanı', description: 'İnatçı bir kelimeyi kurtardın.', icon: 'medical_services', color: 'error', progress: state.rescuedLeeches, goal: 1 },
  ];
  return items.map((a) => ({ ...a, earned: a.progress >= a.goal }));
}

export function deckWordCount(state: AppState): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(DECKS.map((d) => [d.id, 0]));
  for (const w of allWords(state)) counts[w.deckId] = (counts[w.deckId] ?? 0) + 1;
  return counts;
}
