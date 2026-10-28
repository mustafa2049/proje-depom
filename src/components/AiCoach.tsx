import { useState } from 'react';
import { POS_LABELS } from '../data/words';
import { aiAvailable } from '../lib/ai';
import { aiCoach } from '../lib/aiTasks';
import { useStore } from '../store/AppStore';
import { coachStats } from '../store/selectors';
import { useToast } from './Toast';
import { Icon } from './ui';

const DAY_MS = 86_400_000;

function ago(ts: number): string {
  const days = Math.floor((Date.now() - ts) / DAY_MS);
  return days <= 0 ? 'bugün' : days === 1 ? 'dün' : `${days} gün önce`;
}

function List({ icon, color, title, items }: { icon: string; color: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`font-label-md text-label-md flex items-center gap-1.5 ${color}`}>
        <Icon name={icon} size={16} /> {title}
      </span>
      <ul className="flex flex-col gap-1.5">
        {items.map((t, i) => (
          <li key={i} className="font-body-sm text-body-sm text-on-surface flex gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-current ${color}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Profilde haftalık yapay zekâ koçu raporu. */
export function AiCoach() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const report = state.coachReport;
  const reviewed = Object.values(state.history).reduce((n, d) => n + d.reviews, 0);

  if (!aiAvailable() && !report) return null;

  const generate = async () => {
    setLoading(true);
    try {
      const r = await aiCoach(coachStats(state, words, (pos) => POS_LABELS[pos].tr));
      dispatch({ type: 'setCoachReport', report: r });
    } catch (e) {
      toast('Rapor hazırlanamadı', { description: (e as Error).message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary">
            <Icon name="psychology" size={20} />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Yapay Zekâ Koçu</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{report ? `Rapor ${ago(report.createdAt)} hazırlandı` : 'Haftalık kişisel değerlendirme'}</p>
          </div>
        </div>
      </div>

      {report && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-label-lg text-label-lg text-on-surface">{report.headline}</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{report.summary}</p>
          </div>
          <List icon="thumb_up" color="text-secondary" title="İyi gidenler" items={report.strengths} />
          <List icon="center_focus_strong" color="text-error" title="Odaklanman gerekenler" items={report.focus} />
          <List icon="checklist" color="text-primary" title="Bu haftanın planı" items={report.plan} />
        </div>
      )}

      {aiAvailable() && (
        <button
          type="button"
          onClick={generate}
          disabled={loading || reviewed < 10}
          className="h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Icon name={loading ? 'progress_activity' : 'auto_awesome'} size={18} className={loading ? 'animate-spin text-primary' : 'text-tertiary'} />
          {loading ? 'Verilerin inceleniyor…' : reviewed < 10 ? 'Rapor için en az 10 kart tekrarla' : report ? 'Raporu yenile' : 'Haftalık raporumu hazırla'}
        </button>
      )}
    </section>
  );
}
