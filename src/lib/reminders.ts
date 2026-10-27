/**
 * Günlük çalışma hatırlatıcısı (yalnızca Android uygulamasında).
 * Önümüzdeki 7 günün bildirimleri ayrı ayrı planlanır; böylece o gün zaten çalışıldıysa
 * o günün bildirimi atlanabilir ve metin güncel seri bilgisini içerir. Uygulama her açıldığında yenilenir.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const BASE_ID = 1000;
const DAYS = 7;

export function remindersSupported(): boolean {
  return Capacitor.isNativePlatform();
}

export interface ReminderPlan {
  hour: number;
  minute: number;
  studiedToday: boolean;
  streak: number;
  dueCount: number;
}

function message(plan: ReminderPlan, dayOffset: number): string {
  if (dayOffset === 0 && plan.dueCount > 0) return `Bugün ${plan.dueCount} kartın seni bekliyor. Birkaç dakikanı ayır! 📚`;
  if (dayOffset === 0 && plan.streak > 0) return `${plan.streak} günlük serini korumak için bugünkü kartlarını çalış 🔥`;
  if (dayOffset > 0) return 'Serini korumak için bugünkü kartlarını çalış 🔥';
  return 'Bugünkü Leitner kartların hazır. Küçük bir tekrar büyük fark yaratır! 📚';
}

export async function cancelReminders(): Promise<void> {
  if (!remindersSupported()) return;
  await LocalNotifications.cancel({ notifications: Array.from({ length: DAYS }, (_, i) => ({ id: BASE_ID + i })) });
}

/** Bildirimleri yeniden planlar. İzin verilmezse false döner. */
export async function scheduleReminders(plan: ReminderPlan, askPermission = false): Promise<boolean> {
  if (!remindersSupported()) return false;
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted' && askPermission) perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;
  await cancelReminders();
  const now = new Date();
  const notifications = [];
  for (let i = 0; i < DAYS; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, plan.hour, plan.minute);
    if (at <= now) continue;
    if (i === 0 && plan.studiedToday) continue;
    notifications.push({
      id: BASE_ID + i,
      title: 'LexiLearn',
      body: message(plan, i),
      // Kesin alarm izni istemeden çalışsın; birkaç dakikalık sapma sorun değil.
      schedule: { at, allowWhileIdle: true },
      isExactNotification: false,
      smallIcon: 'ic_stat_lexilearn',
      iconColor: '#8083FF',
    });
  }
  if (notifications.length) await LocalNotifications.schedule({ notifications });
  return true;
}
