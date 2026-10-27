import { useNavigate } from 'react-router-dom';
import { SubScreen } from '../components/Layout';
import { EmptyState, Icon, PrimaryButton, SpeakButton, cx } from '../components/ui';
import { BOX_INTERVALS, dayIndex, dayKey } from '../lib/leitner';
import type { BoxNumber, SessionMove } from '../lib/types';
import { useStore } from '../store/AppStore';
import { streak } from '../store/selectors';

interface Group {
  key: string;
  from: BoxNumber | 0;
  to: BoxNumber;
  count: number;
  ids: string[];
}

function groupMoves(moves: SessionMove[]): Group[] {
  const map = new Map<string, Group>();
  for (const m of moves) {
    const key = `${m.from}-${m.to}`;
    const g = map.get(key) ?? { key, from: m.from, to: m.to, count: 0, ids: [] };
    g.count++;
    g.ids.push(m.wordId);
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.to - a.to);
}

export default function SessionSummary() {
  const { state, words } = useStore();
  const navigate = useNavigate();
  const session = state.lastSession;
  const s = streak(state);
  const today = state.history[dayKey()];
  const goalReached = (today?.reviews ?? 0) >= state.profile.dailyGoal;

  if (!session || !session.moves.length) {
    return (
      <SubScreen title="Oturum Özeti" onBack={() => navigate('/')}>
        <EmptyState
          icon="insights"
          title="Henüz bir oturum yok"
          text="Bir kart oturumunu tamamladığında Leitner kutu hareketlerin burada görünecek."
          action={<PrimaryButton onClick={() => navigate('/ogren/oturum')}>Çalışmaya Başla</PrimaryButton>}
        />
      </SubScreen>
    );
  }

  const total = session.moves.length;
  const correct = session.moves.filter((m) => m.outcome !== 'forgot').length;
  const acc = Math.round((correct / total) * 100);
  const missed = session.moves.filter((m) => m.outcome === 'forgot');
  const promoted = session.moves.filter((m) => m.to > m.from && m.outcome !== 'forgot').length;
  const mins = Math.floor(session.durationMs / 60000);
  const secs = Math.floor((session.durationMs % 60000) / 1000);
  const perCard = Math.round(session.durationMs / 1000 / total);

  return (
    <SubScreen title="Oturum Özeti" onBack={() => navigate('/')}>
      <section className="relative overflow-hidden rounded-xl bg-surface-container-high p-space-lg shadow-xl text-center">
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-primary-container/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-space-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center shadow-md">
              <Icon name="workspace_premium" size={36} fill className="text-tertiary" />
            </div>
            <div className="absolute -top-1 -right-3 bg-secondary text-on-secondary text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
              +{session.xp} XP
            </div>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
            {goalReached ? 'Tebrikler! Günlük Hedef Tamamlandı 🎉' : 'Harika İş! Oturum Tamamlandı 🎉'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
            Bu oturumda {total} kelimelik Leitner tekrarını bitirdin.
          </p>
          {s > 0 && (
            <div className="mt-space-md inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-lowest text-tertiary shadow-sm">
              <Icon name="local_fire_department" size={20} fill />
              <span className="font-label-lg text-label-lg font-bold text-tertiary-fixed">{s}. Günlük Seri Korundu!</span>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-space-sm">
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Kazanılan XP</span>
            <Icon name="bolt" size={20} fill className="text-primary" />
          </div>
          <div className="mt-space-sm">
            <span className="font-display-lg text-display-lg text-primary font-bold tracking-tight">+{session.xp}</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Toplam {state.profile.xp} XP</p>
          </div>
        </div>
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Başarı Oranı</span>
            <Icon name="verified" size={20} className="text-secondary" />
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-display-lg text-display-lg text-secondary font-bold tracking-tight">%{acc}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {correct} / {total}
            </span>
          </div>
          <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${acc}%` }} />
          </div>
        </div>
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Odaklanma Süresi</span>
            <Icon name="timer" size={20} className="text-on-surface-variant" />
          </div>
          <div className="mt-space-sm">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant ml-1">dk</span>
            <p className="font-label-sm text-label-sm text-secondary mt-0.5">Ort. {perCard} sn / Kart</p>
          </div>
        </div>
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Hafıza Kalıcılığı</span>
            <Icon name="psychology" size={20} className="text-tertiary" />
          </div>
          <div className="mt-space-sm">
            <span className="font-headline-lg text-headline-lg text-tertiary font-bold">+{promoted} Kelime</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Üst kutuya taşındı</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-container p-space-md rounded-xl space-y-space-md shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Icon name="move_up" size={22} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Leitner Kutu İlerleyişi</h3>
          </div>
          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">SRS</span>
        </div>
        <div className="space-y-space-xs">
          {groupMoves(session.moves).map((g) => {
            const failed = g.to === 1;
            const stayed = failed && g.from === 1;
            // Akıllı aralıklarda kartlar farklı günlere düşebilir; grubun ortalamasını göster
            const dues = g.ids.map((id) => state.cards[id]?.dueDay).filter((d): d is number => d !== undefined);
            const days = dues.length ? Math.max(1, Math.round(dues.reduce((a, b) => a + b, 0) / dues.length - dayIndex(session.finishedAt))) : BOX_INTERVALS[g.to];
            return (
              <div key={g.key} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div
                    className={cx(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      failed ? 'bg-error-container/40 text-error' : g.to >= 4 ? 'bg-secondary-container/20 text-secondary' : 'bg-primary-container/20 text-primary',
                    )}
                  >
                    <Icon name={failed ? 'replay' : g.to - g.from > 1 ? 'trending_up' : 'north_east'} size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-label-lg text-label-lg font-bold text-on-surface flex-wrap">
                      <span>{g.count} Kelime</span>
                      <span className="text-on-surface-variant font-normal">·</span>
                      <span className={cx('font-semibold', failed ? 'text-error' : 'text-secondary')}>
                        {stayed ? 'Kutu 1’de Kaldı' : g.from === 0 ? `Yeni ➔ Kutu ${g.to}` : `Kutu ${g.from} ➔ Kutu ${g.to}`}
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {failed ? 'Yarın yeniden çalışılacak' : `Sonraki Tekrar: +${days} Gün Sonra`}
                    </p>
                  </div>
                </div>
                <span
                  className={cx(
                    'px-2 py-1 rounded font-label-sm text-label-sm font-semibold flex-shrink-0',
                    failed ? 'bg-error-container/30 text-error' : 'bg-secondary/10 text-secondary',
                  )}
                >
                  {failed ? 'Yarın' : `+${days} Gün`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {missed.length > 0 && (
        <section className="bg-surface-container p-space-md rounded-xl space-y-space-md shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="error_outline" size={20} className="text-error" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Gözden Geçirilecekler ({missed.length})</h3>
            </div>
          </div>
          <div className="space-y-space-xs">
            {missed.map((m) => {
              const w = words[m.wordId];
              if (!w) return null;
              return (
                <div key={m.wordId} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">{w.word}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{w.ipa}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{w.meaning}</p>
                  </div>
                  <SpeakButton text={w.word} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary flex-shrink-0" />
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => navigate('/ogren/oturum?mod=hatalar')}
            className="w-full min-h-[50px] py-2.5 px-space-md rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface flex items-center justify-center gap-space-sm font-label-lg text-label-lg font-semibold transition-transform active:scale-95 shadow-sm"
          >
            <Icon name="bolt" size={20} className="text-tertiary" />
            <span>Hataları Hemen Tekrar Et</span>
          </button>
        </section>
      )}

      <div className="pt-space-xs space-y-space-sm">
        <PrimaryButton onClick={() => navigate('/')}>
          <span>Ana Sayfaya Dön</span>
          <Icon name="home" size={20} />
        </PrimaryButton>
        <button
          type="button"
          onClick={() => navigate('/pratik/quiz')}
          className="w-full min-h-[54px] rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center gap-space-sm transition-all active:scale-[0.98]"
        >
          <Icon name="quiz" size={20} className="text-secondary" />
          <span>Pratik ve Quiz Moduna Geç</span>
        </button>
      </div>
    </SubScreen>
  );
}
