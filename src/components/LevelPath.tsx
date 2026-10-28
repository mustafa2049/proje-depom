import { Link } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { CEFR_LEVELS, currentLevel, LEVEL_NAMES, levelProgress } from '../store/selectors';
import { cx, Icon } from './ui';

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

/** Ana sayfadaki kısa seviye yolu kartı: şu anki seviye ve ilerlemesi. */
export function LevelPathCard() {
  const { state } = useStore();
  if (state.profile.newWordOrder !== 'level') return null;
  const progress = levelProgress(state);
  const level = currentLevel(state);
  const cur = progress.find((p) => p.level === level)!;
  const start = CEFR_LEVELS.indexOf(state.profile.startLevel);

  return (
    <Link to={`/kutuphane/seviye/${level}`} className="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-3 active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="route" size={20} className="text-primary shrink-0" />
          <div className="min-w-0">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Seviye Yolu</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
              Şu an {level} • {LEVEL_NAMES[level]} — {cur.started}/{cur.total} kelime
            </p>
          </div>
        </div>
        <span className="font-headline-sm text-headline-sm text-primary font-bold shrink-0">%{pct(cur.started, cur.total)}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5" aria-label="Seviyelere göre ilerleme">
        {progress.map((p, i) => {
          const done = p.total > 0 && p.started >= p.total;
          const active = p.level === level;
          const skipped = i < start;
          return (
            <div key={p.level} className="flex flex-col items-center gap-1">
              <div className={cx('w-full h-1.5 rounded-full overflow-hidden', skipped ? 'bg-surface-container-high/50' : 'bg-surface-container-high')}>
                <div className={cx('h-full rounded-full', done ? 'bg-secondary' : 'bg-primary')} style={{ width: `${skipped ? 0 : pct(p.started, p.total)}%` }} />
              </div>
              <span
                className={cx(
                  'font-label-sm text-label-sm flex items-center gap-0.5',
                  active ? 'text-on-surface font-bold' : skipped ? 'text-outline line-through' : 'text-on-surface-variant',
                )}
              >
                {done && <Icon name="check" size={12} className="text-secondary" />}
                {p.level}
              </span>
            </div>
          );
        })}
      </div>
    </Link>
  );
}

/** Öğren sayfasındaki ayrıntılı seviye listesi: her seviyenin ilerlemesi ve çalışma düğmesi. */
export function LevelPathList() {
  const { state } = useStore();
  const progress = levelProgress(state);
  const level = currentLevel(state);
  const start = CEFR_LEVELS.indexOf(state.profile.startLevel);

  return (
    <div className="flex flex-col gap-space-sm">
      {progress.map((p, i) => {
        const active = p.level === level && state.profile.newWordOrder === 'level';
        const skipped = state.profile.newWordOrder === 'level' && i < start;
        return (
          <div
            key={p.level}
            className={cx('rounded-xl px-space-md py-3 flex items-center gap-3', active ? 'bg-primary-container/20 ring-1 ring-primary/40' : 'bg-surface-container-low')}
          >
            <Link to={`/kutuphane/seviye/${p.level}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cx(
                  'w-11 h-11 rounded-xl flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0',
                  active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface',
                )}
              >
                {p.level}
              </div>
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                  {LEVEL_NAMES[p.level]}
                  {active && <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] leading-none">ŞU AN</span>}
                  {skipped && <span className="font-label-sm text-label-sm text-outline font-normal">atlanıyor</span>}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-16 h-1.5 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${pct(p.started, p.total)}%` }} />
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap truncate">
                    {p.started}/{p.total} • {p.mastered} kalıcı
                  </span>
                </div>
              </div>
            </Link>
            <Link
              to={`/ogren/oturum?seviye=${p.level}`}
              className="px-3 py-2 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md active:scale-95 transition-transform shrink-0"
            >
              Çalış
            </Link>
          </div>
        );
      })}
    </div>
  );
}
