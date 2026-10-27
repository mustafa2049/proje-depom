import { useEffect, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { BOX_COLORS } from '../lib/leitner';
import { speak } from '../lib/speech';
import { splitByTerm } from '../lib/text';

export { splitByTerm };
import type { BoxNumber } from '../lib/types';
import { useStore } from '../store/AppStore';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function Icon({
  name,
  fill,
  size = 20,
  className,
  style,
}: {
  name: string;
  fill?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx('material-symbols-outlined select-none leading-none', className)}
      style={{ fontSize: size, ...(fill ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}
    >
      {name}
    </span>
  );
}

export function SpeakButton({
  text,
  label,
  className,
  size = 18,
  lang = 'en-US',
}: {
  text: string;
  label?: string;
  className?: string;
  size?: number;
  lang?: string;
}) {
  const { state } = useStore();
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ? `${label}: ${text}` : `Dinle: ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        setActive(true);
        speak(text, { lang, rate: state.profile.ttsRate, onEnd: () => setActive(false) });
      }}
      className={cx(
        'flex items-center justify-center gap-1 transition-all active:scale-90',
        className ?? 'w-9 h-9 rounded-full bg-surface-container-high text-primary hover:bg-surface-bright',
      )}
    >
      <Icon name={active ? 'graphic_eq' : 'volume_up'} size={size} className={active ? 'animate-pulse' : undefined} />
      {label && <span className="font-label-md text-label-md">{label}</span>}
    </button>
  );
}

/** 5 kutulu Leitner göstergesi (tasarımdaki K1–K5 şeridi). */
export function BoxStrip({
  active,
  compact,
  labels = true,
}: {
  active: BoxNumber | 0;
  compact?: boolean;
  labels?: boolean;
}) {
  return (
    <div className={cx('grid grid-cols-5 items-center w-full', compact ? 'gap-1' : 'gap-1.5')}>
      {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => {
        const isActive = b === active;
        const passed = active > 0 && b < active;
        return (
          <div key={b} className="flex flex-col items-center gap-1">
            <div
              className={cx(
                'w-full rounded-full transition-all',
                isActive ? 'h-2.5 shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'h-2',
                isActive ? BOX_COLORS[b].bg : passed ? 'bg-secondary-container/70' : 'bg-surface-container-highest',
              )}
            />
            {labels && (
              <span
                className={cx(
                  'font-label-sm text-label-sm',
                  isActive ? cx(BOX_COLORS[b].text, 'font-bold') : 'text-on-surface-variant',
                )}
              >
                K{b}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm',
        className ?? 'bg-surface-container-high text-on-surface-variant',
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'w-full min-h-[54px] rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold',
        'flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'w-full min-h-[50px] rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg',
        'flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Cümlede hedef kelimeyi vurgular (büyük/küçük harf ve çekim eklerine toleranslı). */
export function Highlight({
  text,
  term,
  className = 'text-primary font-bold underline decoration-primary/50 underline-offset-2',
}: {
  text: string;
  term: string;
  className?: string;
}) {
  const parts = splitByTerm(text, term);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <span key={i} className={className}>
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export function ProgressBar({ value, className, barClass = 'bg-primary' }: { value: number; className?: string; barClass?: string }) {
  return (
    <div className={cx('w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden', className)}>
      <div
        className={cx('h-full rounded-full transition-all duration-500 ease-out', barClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-surface-container rounded-xl p-space-lg flex flex-col items-center text-center gap-3 shadow-md">
      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">{text}</p>
      {action}
    </div>
  );
}

/** Saniye bazlı geri sayım. */
export function useCountdown(seconds: number, running: boolean, onDone?: () => void) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // onDone kasıtlı olarak bağımlılık dışında: her render'da yeni fonksiyon gelir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running]);
  return [left, setLeft] as const;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
