import { useState } from 'react';
import { dayKey } from '../lib/leitner';
import { useStore } from '../store/AppStore';
import { activityCalendar, reviewForecast, type ActivityCell } from '../store/selectors';
import { cx, Icon } from './ui';

/**
 * Takvim yoğunluk rampası: tek renk tonu (secondary), koyu yüzeyde azdan çoğa açılan adımlar.
 * dataviz `validate_palette.js --ordinal --mode dark --surface #131b2e` ile doğrulandı
 * (monoton açıklık, adımlar arası ΔL ≥ 0.06, ilk adım yüzeye karşı 2.07:1). 0 = çalışılmayan gün (nötr).
 */
const LEVEL_COLORS = ['#222a3d', '#255651', '#307c68', '#3fad86', '#4edea3'] as const;
const LEVEL_LABELS = ['Çalışılmadı', 'Hedefin yarısından az', 'Hedefe yakın', 'Günlük hedef tamam', 'Hedefin 2 katı'];
/** Tahmin çubukları: tek seri, tek renk (primary-container, kart yüzeyinde 5.2:1) */
const FORECAST_COLOR = '#8083ff';

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function longDate(key: string): string {
  return parseKey(key).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
}

/** Önümüzdeki 7 günün tekrar yükü: gün, çubuk ve sayı sütunlu küçük tablo. */
export function ReviewForecast() {
  const { state } = useStore();
  const days = reviewForecast(state);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  const peak = days.map((d, index) => ({ ...d, index })).reduce((a, b) => (b.count > a.count ? b : a));
  const goal = state.profile.dailyGoal;
  const backlog = days[0].count - goal;

  return (
    <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Önümüzdeki 7 Gün</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {total ? `${total} kart tekrar sırası bekliyor • en yoğun: ${peak.index < 2 ? peak.label.toLocaleLowerCase('tr') : peak.label} (${peak.count})` : 'Bu hafta vadesi gelen kart yok'}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <Icon name="event_upcoming" size={20} />
        </div>
      </div>
      <ul className="flex flex-col gap-2.5" aria-label="Günlere göre tekrar edilecek kart sayısı">
        {days.map((d) => (
          <li key={d.key} className="grid grid-cols-[4.75rem_1fr_2.25rem] items-center gap-2">
            <span className={cx('font-label-md text-label-md truncate', d.isToday ? 'text-on-surface font-semibold' : 'text-on-surface-variant')}>{d.label}</span>
            <div className="h-2.5 flex items-center">
              {d.count > 0 && (
                <div
                  className="h-full rounded-r-[4px] transition-all duration-500"
                  style={{ width: `${Math.max(3, (d.count / max) * 100)}%`, background: FORECAST_COLOR }}
                />
              )}
            </div>
            <span className={cx('font-label-md text-label-md text-right tabular-nums', d.count ? 'text-on-surface' : 'text-outline')}>{d.count}</span>
          </li>
        ))}
      </ul>
      <p className="font-label-sm text-label-sm text-on-surface-variant flex items-start gap-1.5">
        <Icon name="info" size={14} className="mt-0.5 shrink-0" />
        {backlog > 0
          ? `Bugün ${days[0].count} kartın vadesi geldi (gecikenler dahil); günlük hedefin ${goal}. Kalanlar sonraki oturumlarda sıraya girer.`
          : 'Bugünün sayısına gecikmiş kartlar da dahildir. Yeni kelimeler bu tahminde yer almaz.'}
      </p>
    </section>
  );
}

/** Son 12 haftanın çalışma takvimi (günlük hedefe göre yoğunluk). Bir güne dokununca ayrıntısı görünür. */
export function ActivityCalendar() {
  const { state } = useStore();
  const { columns, total, activeDays, best } = activityCalendar(state, 12);
  const todayKey = dayKey();
  const [selected, setSelected] = useState(todayKey);
  const cells = columns.flat();
  const sel = cells.find((c) => c.key === selected) ?? cells.find((c) => c.key === todayKey);
  // Ay adı, ayın ilk gününü içeren haftanın sütununun üstüne yazılır
  const monthName = (key: string) => parseKey(key).toLocaleDateString('tr-TR', { month: 'short' });
  const startsMonth = (col: ActivityCell[]) => col.find((c) => parseKey(c.key).getDate() === 1);
  const months = columns.map((col, i) => {
    const first = startsMonth(col);
    if (first) return monthName(first.key);
    // İlk sütun, yanındaki sütunda yeni ay başlamıyorsa kendi ayını gösterir
    return i === 0 && !startsMonth(columns[1] ?? []) ? monthName(col[0].key) : '';
  });

  const cellLabel = (c: ActivityCell) => `${longDate(c.key)}: ${c.reviews ? `${c.reviews} tekrar` : 'çalışılmadı'}`;

  return (
    <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Çalışma Takvimi</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Son 12 hafta • {activeDays} aktif gün • {total} tekrar
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
          <Icon name="calendar_month" size={20} />
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-3">
        <div className="grid grid-cols-[1.75rem_1fr] gap-x-1.5">
          <span />
          <div className="grid grid-cols-12 gap-[3px] mb-1">
            {months.map((m, i) => (
              <span key={i} className="font-label-sm text-[10px] leading-none text-on-surface-variant whitespace-nowrap overflow-visible">
                {m}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-7 gap-[3px]">
            {['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'].map((d, i) => (
              <span key={i} className="font-label-sm text-[10px] leading-none text-on-surface-variant flex items-center">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-[3px]" role="grid" aria-label="Günlük çalışma yoğunluğu">
            {columns.map((col, w) => (
              <div key={w} className="grid grid-rows-7 gap-[3px]" role="row">
                {col.map((c) =>
                  c.future ? (
                    <span key={c.key} className="aspect-square" />
                  ) : (
                    <button
                      key={c.key}
                      type="button"
                      role="gridcell"
                      aria-label={cellLabel(c)}
                      aria-selected={c.key === sel?.key}
                      onClick={() => setSelected(c.key)}
                      className={cx(
                        'aspect-square rounded-[3px] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        c.key === sel?.key && 'ring-2 ring-on-surface scale-110',
                      )}
                      style={{ background: LEVEL_COLORS[c.level] }}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {sel && (
          <p className="font-label-md text-label-md text-on-surface flex items-center gap-2" aria-live="polite">
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: LEVEL_COLORS[sel.level] }} />
            <span>{longDate(sel.key)}</span>
            <span className="text-on-surface-variant ml-auto whitespace-nowrap">{sel.reviews ? `${sel.reviews} tekrar` : 'çalışılmadı'}</span>
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/30">
          <div className="flex items-center gap-1 pt-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Az</span>
            {LEVEL_COLORS.map((c, i) => (
              <span key={c} title={LEVEL_LABELS[i]} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />
            ))}
            <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">Çok</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant pt-2">Hedef: {state.profile.dailyGoal} kart/gün</span>
        </div>
      </div>

      {best && (
        <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <Icon name="emoji_events" size={16} className="text-tertiary" />
          En verimli gün: {parseKey(best.key).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {best.reviews} tekrar
        </p>
      )}
    </section>
  );
}
