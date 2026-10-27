import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { streak } from '../store/selectors';
import { cx, Icon } from './ui';

const LOGO = 'images/app-icon.png';

function Avatar() {
  const { state } = useStore();
  const navigate = useNavigate();
  const initials = state.profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase('tr'))
    .join('');
  return (
    <button
      type="button"
      aria-label="Profil ve istatistikler"
      onClick={() => navigate('/profil')}
      className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity min-w-[44px] min-h-[44px]"
    >
      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center justify-center">
        {initials || <Icon name="person" size={18} />}
      </span>
    </button>
  );
}

export function MainHeader({ subtitle }: { subtitle: string }) {
  const { state } = useStore();
  const s = streak(state);
  const total = Object.keys(state.cards).length;
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-margin flex items-center justify-between gap-space-xs max-w-3xl mx-auto">
        <div className="flex items-center gap-space-sm min-w-0 flex-shrink-0">
          <img alt="LexiLearn" className="h-8 w-8 object-contain" src={LOGO} />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">LexiLearn</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[120px]">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full" title="Çalışma serisi">
            <Icon name="local_fire_department" size={16} className="text-tertiary" fill={s > 0} />
            <span className="font-label-sm text-label-sm text-on-surface">{s} Gün</span>
          </div>
          <div className="hidden min-[360px]:flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full" title="Kutulardaki kelime sayısı">
            <Icon name="menu_book" size={16} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-on-surface">{total} Kelime</span>
          </div>
          <Avatar />
        </div>
      </div>
    </header>
  );
}

export function SubHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-margin flex items-center justify-between gap-space-xs max-w-3xl mx-auto">
        <div className="flex items-center gap-space-sm min-w-0 flex-1">
          <button
            type="button"
            aria-label="Geri dön"
            onClick={() => (onBack ? onBack() : window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/40 transition-colors flex-shrink-0"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <img alt="" className="h-8 w-8 object-contain flex-shrink-0" src={LOGO} />
          <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-space-xs">
          {right}
          <Avatar />
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { to: '/', icon: 'dashboard', label: 'Ana Sayfa', end: true },
  { to: '/ogren', icon: 'style', label: 'Öğren', end: false },
  { to: '/pratik', icon: 'psychology', label: 'Pratik', end: false },
  { to: '/kutuphane', icon: 'auto_stories', label: 'Kütüphane', end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
      <div className="flex justify-around items-center h-20 px-space-xs max-w-3xl mx-auto">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1 transition-colors',
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={t.icon} size={24} fill={isActive} />
                <span className="font-label-sm text-label-sm">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/** Ana sekme ekranları (alt menülü). */
export function TabScreen({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <>
      <MainHeader subtitle={subtitle} />
      <main className="flex flex-col w-full pt-16 pb-28 min-h-screen">
        <div className="flex flex-col w-full max-w-md mx-auto px-margin pt-space-sm space-y-space-md">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}

/** Alt sayfalar (geri butonlu, alt menüsüz). */
export function SubScreen({
  title,
  children,
  onBack,
  right,
  bottomPadding = 'pb-10',
}: {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  bottomPadding?: string;
}) {
  return (
    <>
      <SubHeader title={title} onBack={onBack} right={right} />
      <main className={cx('flex flex-col w-full pt-16 min-h-screen', bottomPadding)}>
        <div className="flex flex-col w-full max-w-md mx-auto px-margin pt-space-sm space-y-space-md">{children}</div>
      </main>
    </>
  );
}
