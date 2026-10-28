import { useRef, useState } from 'react';
import { SubScreen } from '../components/Layout';
import { AiCoach } from '../components/AiCoach';
import { AiSettings } from '../components/AiSettings';
import { Sheet } from '../components/Sheet';
import { ActivityCalendar, ReviewForecast } from '../components/StatsCharts';
import { StudySettings, Toggle } from '../components/StudySettings';
import { useToast } from '../components/Toast';
import { cx, Icon } from '../components/ui';
import { lastAutoBackup, nativeFiles } from '../lib/backup';
import { exportAnki, exportBackup } from '../lib/exporters';
import { BOX_COLORS, BOX_DESCRIPTIONS, BOX_INTERVALS, dayIndex } from '../lib/leitner';
import { speak } from '../lib/speech';
import type { BoxNumber } from '../lib/types';
import { useStore } from '../store/AppStore';
import { accuracy, achievements, boxCounts, currentWeek, streak } from '../store/selectors';
import { migrate } from '../store/state';

const ACH_COLORS = {
  primary: { text: 'text-primary', bg: 'bg-primary/15', chip: 'bg-primary-container/20 text-primary' },
  secondary: { text: 'text-secondary', bg: 'bg-secondary/15', chip: 'bg-secondary-container/20 text-secondary' },
  tertiary: { text: 'text-tertiary', bg: 'bg-tertiary/15', chip: 'bg-tertiary-container/20 text-tertiary' },
  error: { text: 'text-error', bg: 'bg-error/15', chip: 'bg-error-container/30 text-error' },
};

/** Basit seviye eğrisi: her seviye bir öncekinden 50 XP fazla ister. */
function levelFromXp(xp: number) {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need += 50;
  }
  return { level, progress: rest / need, need };
}

export default function Profile() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const lastAuto = exportOpen ? lastAutoBackup() : null;

  const counts = boxCounts(state);
  const total = Object.keys(state.cards).length;
  const s = streak(state);
  const acc = accuracy(state);
  const week = currentWeek(state);
  const weekTotal = week.reduce((sum, d) => sum + d.reviews, 0);
  const weekMax = Math.max(state.profile.dailyGoal, ...week.map((d) => d.reviews));
  const goalDays = week.filter((d) => d.reviews >= state.profile.dailyGoal).length;
  const passedDays = week.filter((d) => !d.isToday).length + 1;
  const dayNumber = dayIndex() - dayIndex(state.profile.createdAt) + 1;
  const lvl = levelFromXp(state.profile.xp);
  const ach = achievements(state);
  const earned = ach.filter((a) => a.earned);
  const shown = showAll ? ach : [...earned.slice(-3).reverse(), ...ach.filter((a) => !a.earned)].slice(0, 3);
  const initials = state.profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase('tr'))
    .join('');

  return (
    <SubScreen
      title="İstatistik & Profil"
      right={
        <button
          type="button"
          aria-label="Ayarlar"
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
        >
          <Icon name="settings" size={20} />
        </button>
      }
    >
      <div className="flex items-center gap-space-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-label-md text-label-md">
          <Icon name="stars" size={16} fill />
          Seviye {lvl.level}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{dayNumber}. Gün</span>
        <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">{state.profile.xp} XP</span>
      </div>

      <section className="bg-surface-container rounded-xl p-space-lg shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-space-md">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-headline-md font-bold shadow-md">
              {initials || <Icon name="person" size={32} />}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
              <Icon name="verified" size={14} fill />
            </div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="font-headline-md text-headline-md text-on-surface truncate">{state.profile.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-label-md text-label-md text-secondary">Seviye {lvl.level}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">Sonraki seviyeye {Math.round(lvl.need * (1 - lvl.progress))} XP</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2">
              <div className="h-full bg-tertiary rounded-full" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-space-lg">
          <div className="bg-surface-container-high rounded-xl p-3 flex flex-col items-center text-center">
            <Icon name="auto_stories" size={20} className="text-primary mb-1" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{total}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Öğrenilen Kelime</span>
          </div>
          <div className="bg-surface-container-high rounded-xl p-3 flex flex-col items-center text-center">
            <Icon name="local_fire_department" size={20} fill className="text-tertiary mb-1" />
            <span className="font-headline-sm text-headline-sm text-tertiary font-bold">{s} Gün</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Seri</span>
          </div>
          <div className="bg-surface-container-high rounded-xl p-3 flex flex-col items-center text-center">
            <Icon name="psychology_alt" size={20} className="text-secondary mb-1" />
            <span className="font-headline-sm text-headline-sm text-secondary font-bold">%{acc}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Hafıza Skoru</span>
          </div>
        </div>
      </section>

      <AiCoach />

      <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface">Haftalık Yoğunluk Haritası</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Bu hafta toplam {weekTotal} kart tekrar edildi</span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-7 gap-2 text-center">
            {week.map((d) => {
              const h = d.reviews ? Math.max(8, (d.reviews / weekMax) * 100) : 0;
              const hitGoal = d.reviews >= state.profile.dailyGoal;
              return (
                <div key={d.key} className="flex flex-col items-center gap-2">
                  <span className={cx('font-label-sm text-label-sm', d.isToday ? 'text-secondary font-bold' : 'text-on-surface-variant')}>{d.label}</span>
                  <div className={cx('w-full h-16 bg-surface-container-high rounded-lg flex flex-col justify-end p-1', d.isToday && 'ring-1 ring-secondary/40')}>
                    <div className={cx('w-full rounded-md transition-all duration-500', hitGoal ? 'bg-secondary' : 'bg-secondary/50')} style={{ height: `${h}%` }} />
                  </div>
                  <span className={cx('font-label-sm text-label-sm', d.isToday ? 'text-secondary font-bold' : 'text-on-surface')}>{d.reviews}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Günlük Hedef: {state.profile.dailyGoal} kart
            </span>
            <span className="font-label-sm text-label-sm text-secondary">
              Hedef {goalDays}/{passedDays} gün tamamlandı
            </span>
          </div>
        </div>
      </section>

      <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Leitner SRS Dağılımı</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Kalıcı hafızaya yolculuk eden {total} kelime</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
            <Icon name="layers" size={20} />
          </div>
        </div>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface-container-low gap-0.5">
          {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
            <div key={b} className={BOX_COLORS[b].bg} style={{ width: total ? `${(counts[b] / total) * 100}%` : 0 }} title={`Kutu ${b}: ${counts[b]} kelime`} />
          ))}
        </div>
        <div className="flex flex-col gap-2.5 mt-1">
          {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
            <div
              key={b}
              className={cx(
                'bg-surface-container-high rounded-xl p-3 flex items-center justify-between',
                b === 5 && 'bg-gradient-to-r from-surface-container-high to-secondary-container/10',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold',
                    b === 5 ? 'bg-secondary text-on-secondary shadow-sm' : cx(BOX_COLORS[b].soft, BOX_COLORS[b].text),
                  )}
                >
                  {b}
                </span>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                    Kutu {b} · {b === 1 ? 'Günlük Tekrar' : b === 5 ? `Kalıcı Bellek (${BOX_INTERVALS[5]}G)` : `${BOX_INTERVALS[b]} Günde Bir`}
                    {b === 5 && <Icon name="lock" size={16} fill className="text-secondary" />}
                  </span>
                  <span className={cx('font-label-sm text-label-sm', b === 5 ? 'text-secondary' : 'text-on-surface-variant')}>{BOX_DESCRIPTIONS[b]}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={cx('font-headline-sm text-headline-sm font-bold', b === 5 ? 'text-secondary' : 'text-on-surface')}>{counts[b]}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant block">
                  kelime{b === 5 && total ? ` (%${Math.round((counts[5] / total) * 100)})` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReviewForecast />

      <ActivityCalendar />

      <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Rozetler ve Başarımlar</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {earned.length ? `Kazanılan ${earned.length} rozetten öne çıkanlar` : 'İlk rozetini kazanmak için çalışmaya başla'}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {shown.map((a) => {
            const c = ACH_COLORS[a.color];
            return (
              <div key={a.id} className={cx('bg-surface-container-high rounded-xl p-3.5 flex items-center gap-space-md', !a.earned && 'opacity-60')}>
                <div className={cx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                  <Icon name={a.earned ? a.icon : 'lock'} size={28} fill className={c.text} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">{a.title}</span>
                    <span className={cx('font-label-sm text-label-sm px-2 py-0.5 rounded-full shrink-0', a.earned ? c.chip : 'bg-surface-container-highest text-on-surface-variant')}>
                      {a.earned ? 'Kazanıldı' : `${Math.min(a.progress, a.goal)}/${a.goal}`}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{a.description}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>{showAll ? 'Daha Az Göster' : `Tüm Başarımları Gör (${earned.length}/${ach.length})`}</span>
          <Icon name={showAll ? 'expand_less' : 'chevron_right'} size={18} />
        </button>
      </section>

      <section className="bg-surface-container rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Icon name="download_for_offline" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface">Yedekle & Dışa Aktar</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">JSON yedek, geri yükleme veya Anki (.txt)</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dışa aktar"
          onClick={() => setExportOpen(true)}
          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-primary transition-all"
        >
          <Icon name="file_download" size={20} />
        </button>
      </section>

      <Sheet open={exportOpen} onClose={() => setExportOpen(false)} title="Yedekle & Dışa Aktar" icon="file_download">
        <button
          type="button"
          onClick={() => void exportBackup(state).then((where) => toast('Yedek hazır', { description: where, icon: 'task_alt' }), () => toast('Yedek kaydedilemedi', { tone: 'error' }))}
          className="w-full p-3 rounded-xl bg-surface-container flex items-center gap-3 text-left hover:bg-surface-container-highest"
        >
          <Icon name="data_object" size={24} className="text-primary" />
          <div>
            <p className="font-label-lg text-label-lg text-on-surface">Tam Yedek (.json)</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
              Tüm kutular, geçmiş ve kendi kelimelerin. {nativeFiles ? 'Belgeler/LexiLearn’e kaydedilir, Drive’a da gönderebilirsin.' : 'Başka cihaza taşımak için.'}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => void exportAnki(state, words).then((where) => toast('Anki dosyası hazır', { description: where, icon: 'task_alt' }), () => toast('Dosya kaydedilemedi', { tone: 'error' }))}
          className="w-full p-3 rounded-xl bg-surface-container flex items-center gap-3 text-left hover:bg-surface-container-highest"
        >
          <Icon name="style" size={24} className="text-secondary" />
          <div>
            <p className="font-label-lg text-label-lg text-on-surface">Anki Kartları (.txt)</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">Anki → Dosya → İçe Aktar ile kart destesi olarak açılır.</p>
          </div>
        </button>
        <button type="button" onClick={() => importRef.current?.click()} className="w-full p-3 rounded-xl bg-surface-container flex items-center gap-3 text-left hover:bg-surface-container-highest">
          <Icon name="upload_file" size={24} className="text-tertiary" />
          <div>
            <p className="font-label-lg text-label-lg text-on-surface">Yedekten Geri Yükle</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
              Bir .json yedeği seç (mevcut verinin yerine geçer).{nativeFiles && ' Otomatik yedekler Belgeler/LexiLearn klasöründedir.'}
            </p>
          </div>
        </button>
        {nativeFiles && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                <Icon name="cloud_sync" size={18} className="text-secondary" /> Otomatik yedek
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                Uygulamadan çıkınca son 7 günün yedeği Belgeler/LexiLearn’de tutulur; uygulama silinse de kalır.
                {lastAuto && ` Son yedek: ${new Date(lastAuto).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`}
              </p>
            </div>
            <Toggle label="Otomatik yedek" checked={state.profile.autoBackup} onChange={(v) => dispatch({ type: 'setProfile', patch: { autoBackup: v } })} />
          </div>
        )}
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json,text/plain,application/octet-stream"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              const parsed = JSON.parse(await f.text());
              if (parsed?.version !== 1) throw new Error('version');
              const restored = migrate(parsed);
              const count = Object.keys(restored.cards).length;
              if (!window.confirm(`Yedekte ${count} kart var. Mevcut ilerlemenin yerine yedekteki veriler yüklensin mi?`)) return;
              dispatch({ type: 'import', state: restored });
              toast('Yedek geri yüklendi', { description: `${count} kart ve geçmişin geri geldi.` });
              setExportOpen(false);
            } catch {
              toast('Geçersiz yedek dosyası', { tone: 'error' });
            }
          }}
        />
      </Sheet>

      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Ayarlar" icon="settings">
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Adın</span>
          <input
            className="h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary"
            value={state.profile.name}
            maxLength={40}
            onChange={(e) => dispatch({ type: 'setProfile', patch: { name: e.target.value } })}
          />
        </label>
        <Stepper
          label="Günlük hedef (kart)"
          value={state.profile.dailyGoal}
          min={5}
          max={100}
          step={5}
          onChange={(v) => dispatch({ type: 'setProfile', patch: { dailyGoal: v } })}
        />
        <Stepper
          label="Günlük yeni kelime"
          value={state.profile.newPerDay}
          min={0}
          max={30}
          step={1}
          onChange={(v) => dispatch({ type: 'setProfile', patch: { newPerDay: v } })}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface">Telaffuz hızı</span>
            <span className="font-label-md text-label-md text-primary">{state.profile.ttsRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.25}
            step={0.05}
            value={state.profile.ttsRate}
            onChange={(e) => dispatch({ type: 'setProfile', patch: { ttsRate: Number(e.target.value) } })}
            onMouseUp={() => speak('pronunciation', { rate: state.profile.ttsRate })}
            onTouchEnd={() => speak('pronunciation', { rate: state.profile.ttsRate })}
            className="w-full accent-primary"
            aria-label="Telaffuz hızı"
          />
        </div>
        <StudySettings />
        <AiSettings />
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Tüm ilerleme, kendi kelimelerin ve geçmiş kalıcı olarak silinsin mi?')) {
              dispatch({ type: 'reset' });
              setSettingsOpen(false);
              toast('Tüm veriler sıfırlandı', { tone: 'info', icon: 'restart_alt' });
            }
          }}
          className="w-full py-3 rounded-xl text-error font-label-lg text-label-lg flex items-center justify-center gap-1.5 bg-error-container/20 hover:bg-error-container/30"
        >
          <Icon name="restart_alt" size={18} /> Tüm Verileri Sıfırla
        </button>
      </Sheet>
    </SubScreen>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-label-lg text-label-lg text-on-surface">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} azalt`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface disabled:opacity-40"
        >
          <Icon name="remove" size={18} />
        </button>
        <span className="w-10 text-center font-headline-sm text-headline-sm text-on-surface">{value}</span>
        <button
          type="button"
          aria-label={`${label} artır`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface disabled:opacity-40"
        >
          <Icon name="add" size={18} />
        </button>
      </div>
    </div>
  );
}
