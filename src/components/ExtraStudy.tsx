import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore';
import { unseenWords, type StudyScope } from '../store/selectors';
import { cx, Icon } from './ui';

/** Oturum adresinin kapsam parametreleri (deste/seviye). */
export function scopeQuery(scope?: StudyScope): string {
  return `${scope?.deckId ? `&deste=${scope.deckId}` : ''}${scope?.level ? `&seviye=${scope.level}` : ''}`;
}

/** Günlük plan bittiğinde günlük kotadan bağımsız 5 yeni kelimelik ek tur başlatır. */
export function ExtraStudyButton({ scope, className, replace = false }: { scope?: StudyScope; className?: string; replace?: boolean }) {
  const { state } = useStore();
  const navigate = useNavigate();
  const left = unseenWords(state, scope).length;
  if (!left) return null;
  const n = Math.min(5, left);
  return (
    <button
      type="button"
      onClick={() => navigate(`/ogren/oturum?ekstra=${n}${scopeQuery(scope)}`, { replace })}
      className={cx(
        'w-full min-h-[50px] rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
        className,
      )}
    >
      <Icon name="add_circle" size={20} className="text-secondary" />
      <span>+{n} yeni kelime daha öğren</span>
    </button>
  );
}
