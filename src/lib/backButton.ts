/**
 * Android geri tuşu için işleyici yığını. Açık bir sayfa (sheet) ya da kendi geri davranışı olan bir ekran
 * işleyici kaydeder; geri tuşuna basıldığında en son kaydedilenden başlayarak ilk "ele aldım" (true) diyen kazanır.
 * Hiçbiri ele almazsa uygulama bir önceki ekrana döner.
 */

import { useEffect, useRef } from 'react';

type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

export function pushBackHandler(handler: BackHandler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Geri tuşunu kayıtlı işleyicilere iletir; biri ele aldıysa true döner. */
export function runBackHandlers(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]()) return true;
  }
  return false;
}

/** Bileşen açıkken (enabled) geri tuşunu yakalar. İşleyici her zaman en güncel props'u görür. */
export function useBackHandler(handler: BackHandler, enabled = true): void {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    return pushBackHandler(() => latest.current());
  }, [enabled]);
}
