import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { cx, Icon } from './ui';

interface ToastData {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  tone?: 'success' | 'error' | 'info';
}

type ShowToast = (title: string, opts?: Omit<ToastData, 'id' | 'title'>) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<ShowToast>((title, opts = {}) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), title, ...opts });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const tone = toast?.tone ?? 'success';
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="fixed top-[calc(4.5rem+env(safe-area-inset-top))] inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
        {toast && (
          <div
            key={toast.id}
            role="status"
            className={cx(
              'max-w-sm w-full px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up',
              tone === 'success' && 'bg-secondary text-on-secondary',
              tone === 'error' && 'bg-error-container text-on-error-container',
              tone === 'info' && 'bg-surface-container-highest text-on-surface',
            )}
          >
            <Icon name={toast.icon ?? (tone === 'error' ? 'error' : 'check_circle')} size={22} fill />
            <div className="flex flex-col min-w-0">
              <span className="font-label-lg text-label-lg font-bold">{toast.title}</span>
              {toast.description && <span className="font-body-sm text-body-sm opacity-90">{toast.description}</span>}
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
