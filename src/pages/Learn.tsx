import { Link, useNavigate } from 'react-router-dom';
import { TabScreen } from '../components/Layout';
import { ExtraStudyButton } from '../components/ExtraStudy';
import { cx, Icon, PrimaryButton, ProgressBar } from '../components/ui';
import { DECKS } from '../data/decks';
import { BOX_COLORS } from '../lib/leitner';
import type { BoxNumber } from '../lib/types';
import { useStore } from '../store/AppStore';
import { dailyPlan, deckProgress, dueCards, leeches, newQuotaLeft } from '../store/selectors';

const MODES = [
  { to: '/pratik/sesli', icon: 'directions_car', title: 'Eller Serbest Sesli Mod', text: 'Yolda, sporda: dinle, tahmin et, sesinle cevapla.', color: 'text-secondary' },
  { to: '/pratik/telaffuz', icon: 'record_voice_over', title: 'Telaffuz Laboratuvarı', text: 'Kendi sesini kaydet, ana dil telaffuzuyla karşılaştır.', color: 'text-primary' },
  { to: '/pratik/klinik', icon: 'medical_services', title: 'İnatçı Kelimeler Kliniği', text: 'Sürekli unutulan kelimeler için özel müdahale.', color: 'text-error' },
];

export default function Learn() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const plan = dailyPlan(state);
  const due = dueCards(state);
  const dueByBox = ([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => due.filter((c) => c.box === b).length);
  const leechCount = leeches(state).length;

  return (
    <TabScreen subtitle="Öğren">
      <section className="bg-surface-container rounded-xl p-space-md shadow-xl flex flex-col gap-space-md relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Kart Oturumu</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {plan.dueIds.length} tekrar • {plan.newIds.length} yeni kelime • ~{plan.minutes} dk
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
            <Icon name="style" size={26} />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 relative z-10">
          {dueByBox.map((n, i) => {
            const b = (i + 1) as BoxNumber;
            return (
              <div key={b} className="flex flex-col items-center gap-1 bg-surface-container-high rounded-lg py-2">
                <span className={cx('font-headline-sm text-headline-sm font-bold', n ? BOX_COLORS[b].text : 'text-outline')}>{n}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">K{b}</span>
              </div>
            );
          })}
        </div>
        {plan.total ? (
          <PrimaryButton onClick={() => navigate('/ogren/oturum')} className="relative z-10">
            <Icon name="play_arrow" size={22} fill />
            {plan.total} Kartı Çalış
          </PrimaryButton>
        ) : (
          <div className="relative z-10 flex flex-col gap-2">
            <p className="font-label-md text-label-md text-secondary text-center flex items-center justify-center gap-1.5">
              <Icon name="task_alt" size={18} /> Bugünkü kartların bitti
            </p>
            <ExtraStudyButton />
          </div>
        )}
        {!plan.newIds.length && newQuotaLeft(state) === 0 && (
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center relative z-10">
            Günlük yeni kelime kotan doldu ({state.profile.newPerDay}). Profil ayarlarından değiştirebilirsin.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Çalışma Modları</h3>
        </div>
        {MODES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="bg-surface-container rounded-xl p-space-md flex items-center gap-space-md shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className={cx('w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0', m.color)}>
              <Icon name={m.icon} size={24} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
                {m.title}
                {m.to === '/pratik/klinik' && leechCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">{leechCount}</span>
                )}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{m.text}</span>
            </div>
            <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Aktif Desteler</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Yeni kelimeler bu destelerden gelir</span>
        </div>
        {DECKS.map((d) => {
          const enrolled = state.enrolledDecks.includes(d.id);
          const p = deckProgress(state, d.id);
          if (!p.total) return null;
          return (
            <div key={d.id} className="bg-surface-container-low rounded-xl px-space-md py-3 flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={enrolled}
                aria-label={`${d.title} destesini ${enrolled ? 'devre dışı bırak' : 'etkinleştir'}`}
                onClick={() => dispatch({ type: enrolled ? 'unenrollDeck' : 'enrollDeck', deckId: d.id })}
                className={cx(
                  'w-11 h-6 rounded-full p-0.5 transition-colors shrink-0',
                  enrolled ? 'bg-secondary' : 'bg-surface-container-highest',
                )}
              >
                <span className={cx('block w-5 h-5 rounded-full bg-on-secondary transition-transform', enrolled ? 'translate-x-5 bg-surface' : 'bg-outline')} />
              </button>
              <Link to={`/kutuphane/deste/${d.id}`} className="flex flex-col min-w-0 flex-1 gap-1">
                <span className="font-label-lg text-label-lg text-on-surface truncate">
                  {d.emoji} {d.title}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-14 shrink-0">
                    <ProgressBar value={p.percent} barClass="bg-secondary" />
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap truncate">
                    {p.started}/{p.total} • %{p.percent}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/ogren/oturum?deste=${d.id}`)}
                className="px-3 py-2 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md active:scale-95 transition-transform"
              >
                Çalış
              </button>
            </div>
          );
        })}
      </section>
    </TabScreen>
  );
}
