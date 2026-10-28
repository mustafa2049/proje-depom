import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabScreen } from '../components/Layout';
import { ExtraStudyButton } from '../components/ExtraStudy';
import { LevelPathCard } from '../components/LevelPath';
import { Sheet } from '../components/Sheet';
import { cx, Icon } from '../components/ui';
import { BOX_COLORS, BOX_INTERVALS, BOX_LABELS, dayKey, longestStreak } from '../lib/leitner';
import type { BoxNumber } from '../lib/types';
import { useStore } from '../store/AppStore';
import { boxCounts, dailyPlan, leeches, retentionPercent, streak } from '../store/selectors';

const MODULES = [
  {
    to: '/pratik/replikler',
    image: 'images/module-film.jpg',
    badge: 'Popüler',
    badgeIcon: 'movie',
    badgeColor: 'text-primary',
    title: 'Dizi & Film Replikleri',
    text: 'Sitcom sahnelerinden doğal bağlamlı ifadeler.',
    footer: 'Sahneleri Keşfet',
    footerColor: 'text-secondary',
  },
  {
    to: '/pratik/karistirilan',
    image: 'images/module-confusables.jpg',
    badge: 'Zorlayıcı',
    badgeIcon: 'warning',
    badgeColor: 'text-tertiary',
    title: 'Karıştırılan Çiftler',
    text: 'Affect vs Effect gibi sıkça karıştırılan kritik sözcükler.',
    footer: 'Nüans Testleri',
    footerColor: 'text-tertiary',
  },
  {
    to: '/pratik/quiz',
    image: 'images/module-quiz.jpg',
    badge: 'Refleks Testi',
    badgeIcon: 'timer',
    badgeColor: 'text-secondary',
    title: 'Aktif Hatırlama Quiz',
    text: 'Boşluk doldurma, dinle-yaz ve eşleştirme ile refleksleri keskinleştir.',
    footer: '3 Aşamalı Test',
    footerColor: 'text-secondary',
  },
];

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function Dashboard() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  const online = useOnline();
  const plan = dailyPlan(state);
  const counts = boxCounts(state);
  const total = Object.keys(state.cards).length;
  const max = Math.max(1, ...Object.values(counts));
  const s = streak(state);
  const best = longestStreak(state.history);
  const studiedToday = (state.history[dayKey()]?.reviews ?? 0) > 0;
  const leechList = leeches(state);

  let motivation: string;
  if (total === 0) motivation = 'İlk kartlarını çalışarak Leitner yolculuğuna başla!';
  else if (studiedToday) motivation = `Bugünkü seri korundu! ${s} gündür aralıksız çalışıyorsun.`;
  else if (s > 0 && s + 1 > best) motivation = `Bugün çalışırsan ${s + 1} günlük yeni rekoruna ulaşıyorsun!`;
  else if (s > 0) motivation = `Bugün çalışırsan serin ${s + 1} güne çıkıyor!`;
  else motivation = 'Bugün çalışarak yeni bir seri başlat!';

  return (
    <TabScreen subtitle="Ana Sayfa">
      {/* 1. Günlük hedef */}
      <section className="w-full bg-surface-container rounded-xl p-space-md shadow-xl relative overflow-hidden flex flex-col gap-space-md">
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm">
            <Icon name="flag" size={15} fill />
            Bugünün Çalışma Planı
          </span>
          <div className="flex items-center gap-1 bg-surface-container-high text-tertiary px-2.5 py-1 rounded-full font-label-sm text-label-sm">
            <Icon name="schedule" size={15} />
            <span>~{plan.minutes} dk</span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display-lg text-display-lg text-on-surface tracking-tight">{plan.total}</span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">Hedef Kelime</span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm pt-1">
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface leading-none">{plan.dueIds.length}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Tekrar Kelimesi</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface leading-none">{plan.newIds.length}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Yeni Kelime</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-lowest/60 px-3 py-1.5 rounded-lg">
          <Icon name="verified" size={18} className="text-secondary shrink-0" />
          <span>{motivation}</span>
        </div>
        {plan.total > 0 ? (
          <button
            type="button"
            onClick={() => navigate('/ogren/oturum')}
            className="relative z-10 group flex items-center justify-center gap-2.5 w-full min-h-[54px] py-3.5 px-4 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Icon name="rocket_launch" size={22} className="transition-transform group-hover:scale-110" />
            <span>Çalışmaya Başla</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/pratik')}
            className="relative z-10 flex items-center justify-center gap-2.5 w-full min-h-[54px] py-3.5 px-4 bg-secondary-container text-on-secondary-container rounded-xl font-headline-sm text-headline-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Icon name="task_alt" size={22} />
            <span>Bugünlük Tamam — Pratik Yap</span>
          </button>
        )}
        {plan.total === 0 && total > 0 && <ExtraStudyButton className="relative z-10 min-h-[44px] bg-surface-container-high/80" />}
      </section>

      <LevelPathCard />

      {/* İnatçı kelime uyarısı */}
      {leechList.length > 0 && (
        <Link
          to="/pratik/klinik"
          className="w-full bg-error-container/30 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-error/15 flex items-center justify-center shrink-0">
              <Icon name="medical_services" size={18} className="text-error" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-lg text-label-lg text-on-surface">{leechList.length} İnatçı Kelime</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Kutu 1’e tekrar tekrar düşen kelimeler için özel müdahale
              </span>
            </div>
          </div>
          <Icon name="arrow_forward" size={18} className="text-error" />
        </Link>
      )}

      {/* 2. Leitner dağılımı */}
      <section className="w-full bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="layers" size={20} className="text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Leitner Hafıza Dağılımı</h2>
          </div>
          <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-label-md text-label-md shadow-sm">
            <Icon name="psychology" size={14} />
            <span>%{retentionPercent(state)} Kalıcı</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-2.5 bg-surface-container-lowest rounded-full overflow-hidden flex">
            {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
              <div
                key={b}
                className={cx('h-full transition-all', BOX_COLORS[b].bg)}
                style={{ width: total ? `${(counts[b] / total) * 100}%` : '0%' }}
                title={`Kutu ${b}: ${counts[b]}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
            <span>Toplam {total} Kart</span>
            <span className="text-secondary font-semibold">{counts[5]} Uzmanlaşmış</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 items-end pt-2 pb-1">
          {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
            <Link key={b} to={`/kutuphane?kutu=${b}`} className="flex flex-col items-center gap-1.5 group" aria-label={`Kutu ${b}: ${counts[b]} kelime`}>
              <span className="font-label-sm text-label-sm text-on-surface">{counts[b]}</span>
              <div className="w-full bg-surface-container-high rounded-lg p-1 flex flex-col justify-end h-28">
                <div
                  className={cx('w-full rounded-md transition-all group-hover:opacity-90', BOX_COLORS[b].bg)}
                  style={{ height: `${counts[b] ? Math.max(6, (counts[b] / max) * 100) : 0}%` }}
                />
              </div>
              <div className="flex flex-col items-center leading-none text-center gap-0.5">
                <span className={cx('font-label-md text-label-md', BOX_COLORS[b].text)}>Kutu {b}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{BOX_INTERVALS[b]} Gün</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="bg-surface-container-lowest/70 p-2.5 rounded-lg flex items-center justify-between gap-2 text-on-surface-variant font-label-sm text-label-sm">
          <span className="flex items-center gap-1">
            <Icon name="swap_vert" size={16} className="text-tertiary" />
            Hatalı kelimeler doğrudan Kutu 1’e aktarılır
          </span>
          <button type="button" onClick={() => setInfoOpen(true)} className="text-primary hover:underline shrink-0">
            Sistem Detayı
          </button>
        </div>
      </section>

      {/* 3. Hızlı modüller */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Icon name="bolt" size={20} className="text-secondary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Hızlı Modüller</h3>
          </div>
          <Link to="/pratik" className="font-label-sm text-label-sm text-primary">
            Tümünü Gör
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-space-sm pb-2 -mx-margin px-margin no-scrollbar snap-x snap-mandatory">
          {MODULES.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="snap-start shrink-0 w-[260px] bg-surface-container rounded-xl overflow-hidden shadow-md flex flex-col transition-transform active:scale-[0.98]"
            >
              <div className="relative w-full h-32 bg-surface-container-high">
                <img className="w-full h-full object-cover" src={m.image} alt="" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/40 to-transparent" />
                <span
                  className={cx(
                    'absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm flex items-center gap-1',
                    m.badgeColor,
                  )}
                >
                  <Icon name={m.badgeIcon} size={13} />
                  {m.badge}
                </span>
              </div>
              <div className="p-3.5 flex flex-col gap-1 flex-1">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{m.title}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{m.text}</p>
                <div className="flex items-center justify-between pt-2 mt-auto">
                  <span className={cx('font-label-sm text-label-sm font-medium', m.footerColor)}>{m.footer}</span>
                  <Icon name="arrow_forward" size={18} className="text-on-surface-variant" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Çevrimdışı durum */}
      <section className="w-full bg-surface-container-low rounded-xl px-3.5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cx('w-7 h-7 rounded-full flex items-center justify-center shrink-0', online ? 'bg-secondary/15' : 'bg-tertiary/15')}>
            <Icon name={online ? 'cloud_done' : 'cloud_off'} size={16} className={online ? 'text-secondary' : 'text-tertiary'} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface truncate">Tüm veriler bu cihazda kayıtlı</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
              {online ? 'Çevrimiçi • İlerleme otomatik kaydediliyor' : 'Çevrimdışı mod • Çalışmaya devam edebilirsin'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-surface-container-highest text-secondary font-label-sm text-label-sm">
          <Icon name="offline_bolt" size={14} />
          <span>Aktif</span>
        </div>
      </section>

      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="Leitner Sistemi Nasıl Çalışır?" icon="layers">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Her kelime 5 kutudan birinde yaşar. Doğru bildiğin kelime bir üst kutuya çıkar ve daha seyrek karşına gelir;
          unuttuğun kelime ise en sık tekrar edilen Kutu 1’e geri döner.
        </p>
        <div className="flex flex-col gap-2">
          {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
            <div key={b} className="flex items-center justify-between bg-surface-container rounded-lg px-3 py-2">
              <span className={cx('font-label-lg text-label-lg', BOX_COLORS[b].text)}>Kutu {b}</span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {b === 1 ? 'Her gün' : `${BOX_LABELS[b]}de bir`}
              </span>
            </div>
          ))}
        </div>
        <ul className="font-body-sm text-body-sm text-on-surface-variant list-disc pl-5 space-y-1">
          <li><strong className="text-on-surface">Biliyorum</strong>: bir üst kutuya çıkar.</li>
          <li><strong className="text-on-surface">Çok Kolay</strong>: doğrudan Kutu 5 arşivine gider.</li>
          <li><strong className="text-on-surface">Unuttum</strong>: Kutu 1’e döner, yarın yeniden sorulur.</li>
          <li>Arka arkaya 4 kez unutulan kelimeler <strong className="text-on-surface">İnatçı Kelimeler Kliniği</strong>’ne düşer.</li>
        </ul>
      </Sheet>
    </TabScreen>
  );
}
