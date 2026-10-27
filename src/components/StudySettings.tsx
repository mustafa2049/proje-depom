import { dayKey } from '../lib/leitner';
import { remindersSupported, scheduleReminders } from '../lib/reminders';
import type { CardDirection } from '../lib/types';
import { useStore } from '../store/AppStore';
import { dailyPlan, streak } from '../store/selectors';
import { useToast } from './Toast';
import { cx, Icon } from './ui';

const DIRECTIONS: { id: CardDirection; label: string }[] = [
  { id: 'en-tr', label: 'İng → Tür' },
  { id: 'tr-en', label: 'Tür → İng' },
  { id: 'mixed', label: 'Karışık' },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('w-11 h-6 rounded-full p-0.5 transition-colors shrink-0', checked ? 'bg-secondary' : 'bg-surface-container-highest')}
    >
      <span className={cx('block w-5 h-5 rounded-full transition-transform', checked ? 'translate-x-5 bg-surface' : 'bg-outline')} />
    </button>
  );
}

/** Ayarlar içindeki kart çalışma ve hatırlatma seçenekleri. */
export function StudySettings() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const p = state.profile;
  const native = remindersSupported();

  const setReminder = async (patch: Partial<typeof p.reminder>) => {
    const next = { ...p.reminder, ...patch };
    if (next.enabled && native) {
      const ok = await scheduleReminders(
        {
          hour: next.hour,
          minute: next.minute,
          studiedToday: (state.history[dayKey()]?.reviews ?? 0) > 0,
          streak: streak(state),
          dueCount: dailyPlan(state).dueIds.length,
        },
        true,
      ).catch(() => false);
      if (!ok) {
        toast('Bildirim izni verilmedi', { description: 'Telefon ayarlarından LexiLearn bildirimlerine izin ver.', tone: 'error', icon: 'notifications_off' });
        dispatch({ type: 'setProfile', patch: { reminder: { ...next, enabled: false } } });
        return;
      }
      if (patch.enabled) toast('Hatırlatıcı kuruldu', { description: `Her gün ${String(next.hour).padStart(2, '0')}:${String(next.minute).padStart(2, '0')}`, icon: 'notifications_active' });
    }
    dispatch({ type: 'setProfile', patch: { reminder: next } });
  };

  return (
    <div className="flex flex-col gap-3 bg-surface-container rounded-xl p-3">
      <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
        <Icon name="style" size={18} className="text-primary" /> Kart Çalışma
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="font-label-md text-label-md text-on-surface-variant">Kartın soru yüzü</span>
        <div className="flex p-1 rounded-lg bg-surface-container-lowest gap-1">
          {DIRECTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => dispatch({ type: 'setProfile', patch: { cardDirection: d.id } })}
              className={cx('flex-1 py-2 rounded-md font-label-md text-label-md', p.cardDirection === d.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant')}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-label-lg text-label-lg text-on-surface">Yazarak cevapla</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">Kartı çevirmeden önce cevabını yaz, uygulama kontrol etsin.</p>
        </div>
        <Toggle label="Yazarak cevapla" checked={p.typeAnswer} onChange={(v) => dispatch({ type: 'setProfile', patch: { typeAnswer: v } })} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-label-lg text-label-lg text-on-surface">Akıllı tekrar aralıkları</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">Kolay bildiğin kelimeler daha seyrek, zorlandıkların daha sık gelir.</p>
        </div>
        <Toggle label="Akıllı tekrar aralıkları" checked={p.smartIntervals} onChange={(v) => dispatch({ type: 'setProfile', patch: { smartIntervals: v } })} />
      </div>
      <div className="h-px bg-outline-variant/40" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
            <Icon name="notifications" size={16} className="text-tertiary" /> Günlük hatırlatma
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
            {native ? 'O gün çalıştıysan bildirim gelmez.' : 'Yalnızca Android uygulamasında çalışır.'}
          </p>
        </div>
        <Toggle label="Günlük hatırlatma" checked={p.reminder.enabled && native} onChange={(v) => native && void setReminder({ enabled: v })} />
      </div>
      {p.reminder.enabled && native && (
        <label className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">Saat</span>
          <input
            type="time"
            value={`${String(p.reminder.hour).padStart(2, '0')}:${String(p.reminder.minute).padStart(2, '0')}`}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number);
              if (Number.isFinite(h) && Number.isFinite(m)) void setReminder({ hour: h, minute: m });
            }}
            className="h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
          />
        </label>
      )}
    </div>
  );
}
