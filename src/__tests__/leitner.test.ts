import { describe, expect, it } from 'vitest';
import { applyReview, computeStreak, dayIndex, dayKey, EASE_MAX, EASE_MIN, intervalDays, isDue, isLeech, LEECH_THRESHOLD, longestStreak, newCard, nextBox, nextEase } from '../lib/leitner';

const DAY = 86_400_000;
const now = new Date(2026, 9, 27, 10, 0).getTime();

describe('nextBox', () => {
  it('Biliyorum kartı bir üst kutuya taşır, yeni kart Kutu 2 ile başlar', () => {
    expect(nextBox(0, 'know')).toBe(2);
    expect(nextBox(1, 'know')).toBe(2);
    expect(nextBox(4, 'know')).toBe(5);
    expect(nextBox(5, 'know')).toBe(5);
  });
  it('Unuttum her zaman Kutu 1, Çok Kolay her zaman Kutu 5', () => {
    expect(nextBox(5, 'forgot')).toBe(1);
    expect(nextBox(0, 'forgot')).toBe(1);
    expect(nextBox(1, 'easy')).toBe(5);
  });
});

describe('applyReview', () => {
  it('kutu aralığına göre sonraki tekrar gününü ayarlar', () => {
    const c = applyReview(newCard('x', 2, now), 'x', 'know', now);
    expect(c.box).toBe(3);
    expect(c.dueDay).toBe(dayIndex(now) + 5);
    expect(c.reviews).toBe(1);
    expect(c.correct).toBe(1);
  });
  it('unutma sayaçlarını tutar ve doğru cevapta seriyi sıfırlar', () => {
    let c = newCard('x', 1, now);
    for (let i = 0; i < LEECH_THRESHOLD; i++) c = applyReview(c, 'x', 'forgot', now);
    expect(c.lapses).toBe(LEECH_THRESHOLD);
    expect(isLeech(c)).toBe(true);
    c = applyReview(c, 'x', 'know', now);
    expect(c.failStreak).toBe(0);
    expect(c.lapses).toBe(LEECH_THRESHOLD);
    expect(isLeech(c)).toBe(false);
  });
  it('kartı olmayan kelimeyi oluşturur', () => {
    const c = applyReview(undefined, 'yeni', 'forgot', now);
    expect(c.box).toBe(1);
    expect(c.dueDay).toBe(dayIndex(now) + 1);
  });
});

describe('isDue', () => {
  it('vadesi bugün veya geçmişte olan kart çalışılabilir', () => {
    const c = newCard('x', 1, now);
    expect(isDue(c, now)).toBe(true);
    expect(isDue({ ...c, dueDay: dayIndex(now) + 1 }, now)).toBe(false);
    expect(isDue({ ...c, dueDay: dayIndex(now) + 1 }, now + DAY)).toBe(true);
  });
});

describe('seri hesabı', () => {
  const h = (offsets: number[]) => Object.fromEntries(offsets.map((o) => [dayKey(now - o * DAY), { reviews: 3 }]));
  it('bugün dahil ardışık günleri sayar', () => {
    expect(computeStreak(h([0, 1, 2]), now)).toBe(3);
  });
  it('bugün henüz çalışılmadıysa dünkü seriyi korur', () => {
    expect(computeStreak(h([1, 2]), now)).toBe(2);
  });
  it('boşluk seriyi bozar', () => {
    expect(computeStreak(h([0, 2, 3]), now)).toBe(1);
    expect(computeStreak({}, now)).toBe(0);
  });
  it('en uzun seriyi bulur', () => {
    expect(longestStreak(h([0, 1, 5, 6, 7, 8]))).toBe(4);
  });
});

describe('akıllı aralıklar', () => {
  it('kolaylık çarpanı sınırlar içinde kalır', () => {
    let e: number | undefined;
    for (let i = 0; i < 20; i++) e = nextEase(e, 'easy');
    expect(e).toBe(EASE_MAX);
    for (let i = 0; i < 20; i++) e = nextEase(e, 'forgot');
    expect(e).toBe(EASE_MIN);
  });
  it('Kutu 1 hep 1 gün; kapalıyken klasik Leitner aralıkları kullanılır', () => {
    expect(intervalDays(1, 1.5)).toBe(1);
    expect(intervalDays(4, 1.5)).toBe(21);
    expect(intervalDays(4, 0.7)).toBe(10);
    expect(intervalDays(4, 1.5, false)).toBe(14);
  });
  it('zorlanılan kart aynı kutuda daha erken gelir', () => {
    const hard = applyReview({ ...newCard('x', 3, now), ease: 0.8 }, 'x', 'know', now);
    const plain = applyReview(newCard('x', 3, now), 'x', 'know', now, false);
    expect(hard.box).toBe(4);
    expect(hard.dueDay - dayIndex(now)).toBeLessThan(plain.dueDay - dayIndex(now));
  });
});
