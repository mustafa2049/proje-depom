import { useEffect, useState } from 'react';
import { TTS_TERMS_URL } from '../lib/ai';
import { listDeviceVoices, previewDeviceVoice, speak, type DeviceVoice } from '../lib/speech';
import type { VoiceMode } from '../lib/types';
import { aiVoiceStatus, loadVoiceIndex, testAiVoice, type AiVoiceStatus } from '../lib/voice';
import { useStore } from '../store/AppStore';
import { Toggle } from './StudySettings';
import { useToast } from './Toast';
import { cx, Icon } from './ui';

/** Hazır kayıtlarda bulunan örnek cümle (sözlükte "improve" kelimesinin örneği) */
const SAMPLE = 'I want to improve my English.';

const MODES: { id: VoiceMode; label: string }[] = [
  { id: 'natural', label: 'Doğal ses' },
  { id: 'device', label: 'Cihaz sesi' },
];

const AI_STATUS: Record<AiVoiceStatus, { label: string; tone: 'ok' | 'warn' | 'off' }> = {
  ready: { label: 'Hazır', tone: 'ok' },
  terms: { label: 'Onay gerekiyor', tone: 'warn' },
  limited: { label: 'Sınır doldu', tone: 'warn' },
  offline: { label: 'Çevrimdışı', tone: 'off' },
  nokey: { label: 'Anahtar yok', tone: 'off' },
};

/** Ayarlar içindeki "Okuma Sesi" bölümü. */
export function VoiceSettings() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const p = state.profile;
  const natural = p.voiceMode === 'natural';
  const [clipCount, setClipCount] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<AiVoiceStatus>(() => aiVoiceStatus());
  const [testing, setTesting] = useState(false);
  const [deviceVoices, setDeviceVoices] = useState<DeviceVoice[]>([]);

  useEffect(() => {
    let alive = true;
    void loadVoiceIndex().then((index) => alive && setClipCount(index ? Object.keys(index.clips).length : 0));
    const load = () => void listDeviceVoices().then((v) => alive && setDeviceVoices(v), () => {});
    load();
    // Tarayıcıda ses listesi geç dolabilir
    const t = setTimeout(load, 1200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const tryAiVoice = async () => {
    setTesting(true);
    try {
      const r = await testAiVoice(SAMPLE, p.ttsRate);
      setAiStatus(r.status);
      if (!r.ok && r.status === 'ready') toast('Yapay zekâ sesi alınamadı', { description: 'Bağlantıyı kontrol edip tekrar dene.', tone: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const status = AI_STATUS[aiStatus];

  return (
    <div className="flex flex-col gap-3 bg-surface-container rounded-xl p-3">
      <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
        <Icon name="record_voice_over" size={18} className="text-secondary" /> Okuma Sesi
      </span>
      <div className="flex p-1 rounded-lg bg-surface-container-lowest gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => dispatch({ type: 'setProfile', patch: { voiceMode: m.id } })}
            className={cx('flex-1 py-2 rounded-md font-label-md text-label-md', p.voiceMode === m.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {natural ? (
        <>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
            {clipCount ? `Sözlükteki kelime ve örnek cümleler (${clipCount.toLocaleString('tr-TR')} kayıt)` : 'Sözlükteki kelime ve örnek cümleler'} yapay zekâyla seslendirilip
            uygulamaya kaydedildi: doğal bir sesle, internetsiz ve beklemeden okunur.
          </p>
          <button
            type="button"
            onClick={() => speak(SAMPLE, { rate: p.ttsRate })}
            className="h-10 rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5"
          >
            <Icon name="play_arrow" size={18} className="text-primary" /> Doğal sesi dinle
          </button>
          <div className="h-px bg-outline-variant/40" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">Yapay zekâ sesi</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                Kayıtta olmayan metinler (sohbet, yapay zekâ cümleleri, kendi eklediğin kelimeler) Groq Orpheus ile okunur. İnternet gerekir.
              </p>
            </div>
            <Toggle label="Yapay zekâ sesi" checked={p.aiVoice} onChange={(v) => dispatch({ type: 'setProfile', patch: { aiVoice: v } })} />
          </div>
          {p.aiVoice && (
            <div className="flex flex-col gap-2 rounded-lg bg-surface-container-lowest p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label-md text-label-md text-on-surface-variant">Durum</span>
                <span
                  className={cx(
                    'font-label-sm text-label-sm px-2 py-0.5 rounded-full',
                    status.tone === 'ok' ? 'bg-secondary-container/30 text-secondary' : status.tone === 'warn' ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-highest text-outline',
                  )}
                >
                  {status.label}
                </span>
              </div>
              {aiStatus === 'terms' && (
                <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                  Groq hesabında Orpheus modelinin kullanım şartlarını bir kez onaylaman gerekiyor. Onaylayana kadar bu metinler cihaz sesiyle okunur.{' '}
                  <a href={TTS_TERMS_URL} target="_blank" rel="noreferrer" className="text-primary underline">
                    Şartları onayla
                  </a>
                </p>
              )}
              {aiStatus === 'limited' && (
                <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                  Ücretsiz kullanım sınırı doldu; bir süre cihaz sesi kullanılacak. Daha önce okunan metinler cihazda kayıtlı kalır.
                </p>
              )}
              <button
                type="button"
                disabled={testing || aiStatus === 'offline' || aiStatus === 'nokey'}
                onClick={tryAiVoice}
                className="h-9 rounded-lg bg-primary/15 text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Icon name={testing ? 'progress_activity' : 'graphic_eq'} size={16} className={testing ? 'animate-spin' : undefined} />
                {aiStatus === 'ready' ? 'Yapay zekâ sesini dene' : 'Tekrar dene'}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">Tüm metinler telefonun kendi ses motoruyla okunur.</p>
      )}

      {deviceVoices.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Cihaz sesi{natural ? ' (doğal ses bulunamazsa)' : ''}
          </span>
          <div className="flex gap-2">
            <select
              aria-label="Cihaz sesi"
              value={deviceVoices.some((v) => v.id === p.deviceVoice) ? p.deviceVoice : ''}
              onChange={(e) => dispatch({ type: 'setProfile', patch: { deviceVoice: e.target.value } })}
              className="flex-1 min-w-0 h-10 px-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
            >
              <option value="">Sistem varsayılanı</option>
              {deviceVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                  {v.local ? '' : ' (internet)'}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Cihaz sesini dinle"
              onClick={() => previewDeviceVoice(SAMPLE, p.ttsRate)}
              className="h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center"
            >
              <Icon name="volume_up" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
