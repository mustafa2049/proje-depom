import type { DailyActivity, Intensity, SrsBreakdown } from '../types/api';

/** Koyu tema renk skalası: 0 (yok) → 4 (çok yoğun). */
export const INTENSITY_COLORS: Record<Intensity, string> = {
  0: '#1E293B',
  1: '#0C4A6E',
  2: '#0284C7',
  3: '#38BDF8',
  4: '#22C55E',
};

export function intensityColor(level: Intensity): string {
  return INTENSITY_COLORS[level];
}

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** "2026-10-14" → "14 Ekim" */
export function formatDayLabel(date: string): string {
  const [, month = '1', day = '1'] = date.split('-');
  return `${Number(day)} ${MONTHS_TR[Number(month) - 1] ?? ''}`;
}

/** Seçili günün özet satırı: "14 Ekim: 35 kart incelendi • +310 XP • 12 dk" */
export function formatDayDetail(day: DailyActivity): string {
  const minutes = Math.round(day.durationSec / 60);
  return `${formatDayLabel(day.date)}: ${day.cardsReviewed} kart incelendi • +${day.xpEarned} XP • ${minutes} dk`;
}

/** Pazartesi=0 … Pazar=6 */
export function mondayIndex(date: string): number {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (weekday + 6) % 7;
}

export interface HeatmapCell {
  date: string;
  intensity: Intensity;
  cardsReviewed: number;
}

/**
 * Günleri haftalık sütunlara (7 satır: Pzt…Paz) yerleştirir. İlk haftanın başındaki boşluklar null'dır.
 */
export function buildHeatmapGrid(days: readonly DailyActivity[]): Array<Array<HeatmapCell | null>> {
  if (days.length === 0) {
    return [];
  }

  const offset = mondayIndex(days[0]?.date ?? '');
  const columnCount = Math.ceil((days.length + offset) / 7);
  const grid: Array<Array<HeatmapCell | null>> = Array.from({ length: columnCount }, () => Array(7).fill(null));

  days.forEach((day, index) => {
    const slot = index + offset;
    grid[Math.floor(slot / 7)]![slot % 7] = { date: day.date, intensity: day.intensity, cardsReviewed: day.cardsReviewed };
  });
  return grid;
}

export interface SrsSegment {
  key: keyof SrsBreakdown;
  label: string;
  count: number;
  ratio: number;
  color: string;
}

const SEGMENT_META: Array<Pick<SrsSegment, 'key' | 'label' | 'color'>> = [
  { key: 'new', label: 'Yeni', color: '#64748B' },
  { key: 'learning', label: 'Öğreniliyor', color: '#F59E0B' },
  { key: 'review', label: 'Tekrar (uzun süreli bellek)', color: '#22C55E' },
  { key: 'relearning', label: 'Yeniden öğreniliyor', color: '#EF4444' },
];

/** Stacked bar için oranlar. Toplam sıfırsa tüm oranlar sıfırdır. */
export function srsSegments(breakdown: SrsBreakdown): SrsSegment[] {
  const total = SEGMENT_META.reduce((sum, meta) => sum + breakdown[meta.key], 0);
  return SEGMENT_META.map((meta) => ({
    ...meta,
    count: breakdown[meta.key],
    ratio: total > 0 ? breakdown[meta.key] / total : 0,
  }));
}

/** Yüzde etiketi; veri yoksa tire. */
export function percentLabel(value: number | null): string {
  return value === null ? '—' : `%${value}`;
}
