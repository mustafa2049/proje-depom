import { describe, expect, it } from 'vitest';

import type { DailyActivity } from '../types/api';

import { buildHeatmapGrid, formatDayDetail, formatDayLabel, intensityColor, mondayIndex, percentLabel, srsSegments } from './heatmap';
import { validateProfileForm } from './profile';

function day(date: string, cardsReviewed = 0, intensity: DailyActivity['intensity'] = 0): DailyActivity {
  return { date, cardsReviewed, correctCount: 0, durationSec: 0, xpEarned: 0, intensity };
}

describe('mondayIndex', () => {
  it('pazartesiyi 0, pazarı 6 olarak döner', () => {
    expect(mondayIndex('2026-10-12')).toBe(0); // Pazartesi
    expect(mondayIndex('2026-10-18')).toBe(6); // Pazar
  });
});

describe('buildHeatmapGrid', () => {
  it('günleri haftalık sütunlara yerleştirir ve ilk haftanın başını boş bırakır', () => {
    // 2026-10-14 Çarşamba (indeks 2): ilk sütunda Pzt, Sal boş olmalı
    const days = Array.from({ length: 10 }, (_, index) => day(`2026-10-${String(14 + index).padStart(2, '0')}`));
    const grid = buildHeatmapGrid(days);

    expect(grid).toHaveLength(2);
    expect(grid[0]?.[0]).toBeNull();
    expect(grid[0]?.[1]).toBeNull();
    expect(grid[0]?.[2]?.date).toBe('2026-10-14');
    expect(grid[1]?.[0]?.date).toBe('2026-10-19'); // Pazartesi
    expect(grid.every((column) => column.length === 7)).toBe(true);
  });

  it('90 günlük seri 13–14 sütuna sığar ve her gün tek hücredir', () => {
    const start = new Date('2026-07-20T00:00:00Z');
    const days = Array.from({ length: 90 }, (_, index) => {
      const date = new Date(start.getTime() + index * 86_400_000).toISOString().slice(0, 10);
      return day(date, index % 7);
    });
    const grid = buildHeatmapGrid(days);
    const cells = grid.flat().filter((cell) => cell !== null);

    expect(grid.length).toBeGreaterThanOrEqual(13);
    expect(grid.length).toBeLessThanOrEqual(14);
    expect(cells).toHaveLength(90);
  });

  it('boş seri için boş ızgara döner', () => {
    expect(buildHeatmapGrid([])).toEqual([]);
  });
});

describe('yoğunluk renkleri ve etiketler', () => {
  it('0–4 seviyelerini koyu tema renklerine eşler', () => {
    expect(intensityColor(0)).toBe('#1E293B');
    expect(intensityColor(1)).toBe('#0C4A6E');
    expect(intensityColor(2)).toBe('#0284C7');
    expect(intensityColor(3)).toBe('#38BDF8');
    expect(intensityColor(4)).toBe('#22C55E');
  });

  it('gün ayrıntısını Türkçe özet olarak biçimlendirir', () => {
    const detail = formatDayDetail({ date: '2026-10-14', cardsReviewed: 35, correctCount: 30, durationSec: 720, xpEarned: 310, intensity: 4 });
    expect(detail).toBe('14 Ekim: 35 kart incelendi • +310 XP • 12 dk');
    expect(formatDayLabel('2026-01-05')).toBe('5 Ocak');
  });
});

describe('srsSegments ve yüzde etiketi', () => {
  it('oranlar toplamı 1 eder; toplam sıfırsa tüm oranlar sıfırdır', () => {
    const segments = srsSegments({ new: 6, learning: 2, review: 10, relearning: 2 });
    expect(segments.reduce((sum, segment) => sum + segment.ratio, 0)).toBeCloseTo(1, 10);
    expect(segments.find((segment) => segment.key === 'review')?.ratio).toBeCloseTo(0.5, 10);

    expect(srsSegments({ new: 0, learning: 0, review: 0, relearning: 0 }).every((segment) => segment.ratio === 0)).toBe(true);
  });

  it('yüzde etiketi veri yoksa tire döner', () => {
    expect(percentLabel(null)).toBe('—');
    expect(percentLabel(66.7)).toBe('%66.7');
  });
});

describe('validateProfileForm', () => {
  const base = { name: 'Ayşe', currentLevel: 'B1' as const, dailyGoal: '30' };

  it('geçerli formda hata döndürmez', () => {
    expect(validateProfileForm(base)).toEqual({});
  });

  it('boş isim ve hedef aralık dışıysa hata üretir', () => {
    expect(validateProfileForm({ ...base, name: '  ' }).name).toBeDefined();
    expect(validateProfileForm({ ...base, dailyGoal: '0' }).dailyGoal).toBeDefined();
    expect(validateProfileForm({ ...base, dailyGoal: '201' }).dailyGoal).toBeDefined();
    expect(validateProfileForm({ ...base, dailyGoal: '12.5' }).dailyGoal).toBeDefined();
  });
});
