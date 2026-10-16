import type { ScenarioKey } from '../types/api';

export interface ScenarioDefinition {
  key: ScenarioKey;
  title: string;
  description: string;
}

/** Sunucudaki senaryo anahtarlarıyla birebir eşleşir (apps/api aiChatService). */
export const SCENARIOS: readonly ScenarioDefinition[] = [
  { key: 'job-interview', title: 'İş Mülakatı', description: 'Deneyimini ve hedeflerini anlat' },
  { key: 'airport-check-in', title: 'Havaalanı & Seyahat', description: 'Check-in ve gümrük konuşmaları' },
  { key: 'cafe-order', title: 'Kafe Siparişi', description: 'Sipariş ver, fiyat sor' },
  { key: 'technical-meeting', title: 'Teknik Toplantı', description: 'Durum güncellemesi ve fikir paylaşımı' },
  { key: 'free-talk', title: 'Serbest Sohbet', description: 'Günlük hayat hakkında konuş' },
];

/** Sunucunun döndürdüğü okunabilir etiketten (ör. "Job Interview") senaryo anahtarını bulur. */
const LABEL_TO_KEY: Record<string, ScenarioKey> = {
  'Job Interview': 'job-interview',
  'Airport Check-in': 'airport-check-in',
  'Cafe Order': 'cafe-order',
  'Technical Meeting': 'technical-meeting',
  'Free Talk': 'free-talk',
};

export function scenarioKeyFromLabel(label: string): ScenarioKey {
  return LABEL_TO_KEY[label] ?? 'free-talk';
}

export function scenarioTitle(key: ScenarioKey): string {
  return SCENARIOS.find((scenario) => scenario.key === key)?.title ?? 'Serbest Sohbet';
}
