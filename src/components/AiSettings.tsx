import { useState } from 'react';
import { aiAvailable, getStoredKey, hasBuiltInKey, setStoredKey, testConnection } from '../lib/ai';
import { useToast } from './Toast';
import { cx, Icon } from './ui';

/** Ayarlar içindeki "Yapay Zekâ (Groq)" bölümü. */
export function AiSettings() {
  const toast = useToast();
  const [key, setKey] = useState(getStoredKey());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'unknown' | 'ok' | 'fail'>('unknown');
  const source = getStoredKey() ? 'Ayarlardan girilen anahtar' : hasBuiltInKey() ? 'Uygulamaya gömülü anahtar' : 'Anahtar yok';

  const test = async () => {
    setTesting(true);
    try {
      const ok = await testConnection();
      setStatus(ok ? 'ok' : 'fail');
    } catch (e) {
      setStatus('fail');
      toast('Bağlantı başarısız', { description: (e as Error).message, tone: 'error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-surface-container rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
          <Icon name="auto_awesome" size={18} className="text-tertiary" /> Yapay Zekâ (Groq)
        </span>
        <span
          className={cx(
            'font-label-sm text-label-sm px-2 py-0.5 rounded-full',
            status === 'ok' ? 'bg-secondary-container/30 text-secondary' : status === 'fail' ? 'bg-error-container/40 text-error' : aiAvailable() ? 'bg-primary/15 text-primary' : 'bg-surface-container-highest text-outline',
          )}
        >
          {status === 'ok' ? 'Çalışıyor' : status === 'fail' ? 'Hata' : aiAvailable() ? 'Hazır' : 'Kapalı'}
        </span>
      </div>
      <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
        {source}. Yazma geri bildirimi, kelime doldurma, kişisel hikaye, hafıza ipucu ve telaffuz tanımada kullanılır.
      </p>
      <input
        type="password"
        aria-label="Groq API anahtarı"
        placeholder={hasBuiltInKey() ? 'Gömülü anahtarı değiştirmek için yeni anahtar…' : 'gsk_… anahtarını yapıştır'}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        autoComplete="off"
        className="h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setStoredKey(key);
            setStatus('unknown');
            toast(key.trim() ? 'Anahtar kaydedildi' : 'Gömülü anahtara dönüldü', { tone: 'info', icon: 'key' });
          }}
          className="flex-1 h-10 rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md"
        >
          Kaydet
        </button>
        <button
          type="button"
          disabled={testing || !aiAvailable()}
          onClick={test}
          className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Icon name={testing ? 'progress_activity' : 'bolt'} size={16} className={testing ? 'animate-spin' : undefined} />
          Bağlantıyı Test Et
        </button>
      </div>
    </div>
  );
}
