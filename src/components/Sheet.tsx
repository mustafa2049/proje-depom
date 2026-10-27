import { useEffect, type ReactNode } from 'react';
import { Icon } from './ui';

/** Mobilde alttan açılan, geniş ekranda ortalanan modal. */
export function Sheet({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-surface-container-lowest/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-high rounded-t-2xl sm:rounded-2xl p-space-lg pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-space-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <Icon name={icon} size={24} className="text-primary" />}
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h2>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
