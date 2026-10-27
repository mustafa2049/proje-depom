import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { AppState, Word } from '../lib/types';
import { loadState, reducer, saveState, type Action } from './state';
import { wordMap } from './selectors';

interface Store {
  state: AppState;
  dispatch: (action: Action) => void;
  words: Record<string, Word>;
}

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const words = useMemo(() => wordMap(state), [state]);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, words }), [state, words]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
