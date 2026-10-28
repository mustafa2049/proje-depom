import { useEffect, useMemo, useRef, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { cx, EmptyState, Icon, PrimaryButton, shuffle, SpeakButton } from '../../components/ui';
import { aiAvailable, transcribe } from '../../lib/ai';
import { useBackHandler } from '../../lib/backButton';
import { aiChatReview, aiChatTurn, type ChatMessage, type ChatReview } from '../../lib/aiTasks';
import { speak, stopSpeaking, vibrate } from '../../lib/speech';
import { splitByTerm } from '../../lib/text';
import type { AppState, Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';

interface Scenario {
  id: string;
  emoji: string;
  title: string;
  text: string;
  /** Modele verilen rol tanımı */
  role: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'cafe', emoji: '☕', title: 'Kafede Sipariş', text: 'Barista ile sipariş ver, özelleştir, öde', role: 'Londra’da bir kafedesin. Sen güler yüzlü bir baristasın, öğrenci müşteri.' },
  { id: 'airport', emoji: '✈️', title: 'Havalimanı', text: 'Check-in, bagaj ve koltuk seçimi', role: 'Bir havalimanında check-in bankosundasın. Sen havayolu görevlisisin, öğrenci yolcu.' },
  { id: 'hotel', emoji: '🏨', title: 'Otel Resepsiyonu', text: 'Giriş yap, oda sorununu çöz', role: 'Bir otel resepsiyonundasın. Sen resepsiyonistsin, öğrenci giriş yapan misafir; odasıyla ilgili küçük bir sorun da çıkabilir.' },
  { id: 'interview', emoji: '💼', title: 'İş Görüşmesi', text: 'Kendini tanıt, deneyimlerini anlat', role: 'Bir iş görüşmesindesin. Sen nazik ama profesyonel bir işe alım yöneticisisin, öğrenci aday. Tipik mülakat soruları sor.' },
  { id: 'doctor', emoji: '🩺', title: 'Doktor Randevusu', text: 'Şikâyetini anlat, tavsiye al', role: 'Bir aile hekimi muayenehanesindesin. Sen doktorsun, öğrenci hasta; şikâyetlerini sor.' },
  { id: 'shop', emoji: '🛍️', title: 'Mağazada İade', text: 'Ürünü değiştir ya da iade et', role: 'Bir giyim mağazasındasın. Sen satış danışmanısın, öğrenci aldığı bir ürünü iade etmek veya değiştirmek istiyor.' },
  { id: 'directions', emoji: '🗺️', title: 'Yol Sorma', text: 'Şehirde yolunu bul', role: 'Londra sokaklarındasın. Sen yardımsever bir yerlisin, öğrenci turist ve yol soruyor.' },
  { id: 'friend', emoji: '👋', title: 'Yeni Arkadaş', text: 'Tanış, hobilerden konuş', role: 'Bir partide yeni tanıştığınız samimi bir yabancı öğrencisin. Öğrenciyle tanış, hobiler ve günlük hayat hakkında sohbet et.' },
  { id: 'free', emoji: '🎬', title: 'Serbest Sohbet', text: 'Film, dizi, müzik, gündem', role: 'Öğrencinin İngilizce konuşan bir arkadaşısın. Film, dizi, müzik ve günlük konular hakkında rahat bir sohbet yap.' },
];

const LEVELS = ['A2', 'B1', 'B2', 'C1'] as const;
const LEVEL_KEY = 'lexilearn:chatLevel';
const MAX_MESSAGES = 40;

function storedLevel(): string {
  try {
    return localStorage.getItem(LEVEL_KEY) ?? 'B1';
  } catch {
    return 'B1';
  }
}

/** Sohbette kullanılması teşvik edilecek, öğrenilmekte olan tek kelimelik hedefler. */
function pickTargets(state: AppState, words: Record<string, Word>): Word[] {
  const learning = Object.values(state.cards)
    .filter((c) => c.box <= 3)
    .map((c) => words[c.wordId])
    .filter((w): w is Word => !!w && ['adjective', 'verb', 'noun', 'adverb', 'phrasal'].includes(w.pos));
  return shuffle(learning).slice(0, 4);
}

function usedTarget(messages: ChatMessage[], w: Word): boolean {
  return messages.some((m) => m.role === 'user' && splitByTerm(m.text, w.word).some((p) => p.match));
}

export default function Conversation() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [level, setLevel] = useState(storedLevel);
  const [targets, setTargets] = useState(() => pickTargets(state, words));
  const [voice, setVoice] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [showTr, setShowTr] = useState<number[]>([]);
  const [review, setReview] = useState<ChatReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  // Ses kaydı bittiğinde çağrılan geri çağırımlar güncel mesajları görsün
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      stopSpeaking();
    },
    [],
  );

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking, suggestions]);

  const targetWords = useMemo(() => targets.map((w) => w.word), [targets]);
  const userCount = messages.filter((m) => m.role === 'user').length;

  const reset = () => {
    stopSpeaking();
    setScenario(null);
    setMessages([]);
    setReview(null);
    setSuggestions([]);
    setTargets(pickTargets(state, words));
  };

  // Android geri tuşu: sohbetten veya karneden senaryo seçimine döner
  useBackHandler(() => {
    reset();
    return true;
  }, scenario !== null);

  // Sohbet sırasında bağlantı koparsa ekran kaybolmasın; gönderimler hata mesajı verir
  if (!aiAvailable() && !scenario) {
    return (
      <SubScreen title="Sohbet Partneri">
        <EmptyState icon="cloud_off" title="Yapay zekâ gerekli" text="Sohbet partneri için internet bağlantısı ve Ayarlar’da tanımlı bir Groq anahtarı gerekiyor." />
      </SubScreen>
    );
  }

  const turn = async (history: ChatMessage[], sc: Scenario) => {
    setThinking(true);
    setSuggestions([]);
    try {
      const r = await aiChatTurn(sc.role, level, targetWords, history);
      const next = [...history];
      if (r.correction) {
        const lastUser = next.map((m) => m.role).lastIndexOf('user');
        if (lastUser >= 0) next[lastUser] = { ...next[lastUser], correction: r.correction };
      }
      next.push({ role: 'ai', text: r.reply, tr: r.tr });
      setMessages(next);
      setSuggestions(r.suggestions);
      if (voice) speak(r.reply, { rate: state.profile.ttsRate });
    } catch (e) {
      toast('Yanıt alınamadı', { description: (e as Error).message, tone: 'error' });
      setMessages(history);
    } finally {
      setThinking(false);
    }
  };

  const start = (sc: Scenario) => {
    try {
      localStorage.setItem(LEVEL_KEY, level);
    } catch {
      // Seviye yalnızca bu oturum için hatırlanır.
    }
    setScenario(sc);
    setMessages([]);
    setReview(null);
    setShowTr([]);
    startedAt.current = Date.now();
    void turn([], sc);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t || !scenario || thinking) return;
    stopSpeaking();
    const history: ChatMessage[] = [...messagesRef.current, { role: 'user', text: t }];
    setMessages(history);
    setInput('');
    vibrate(20);
    void turn(history, scenario);
  };

  const startRecording = async () => {
    if (recording || thinking || transcribing) return;
    stopSpeaking();
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast('Mikrofon izni gerekli', { description: 'Ayarlardan mikrofon erişimine izin ver.', tone: 'error', icon: 'mic_off' });
      return;
    }
    chunks.current = [];
    const mr = new MediaRecorder(stream.current);
    mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    mr.onstop = async () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks.current, { type: mr.mimeType });
      if (blob.size < 2000) return;
      setTranscribing(true);
      try {
        const text = await transcribe(blob);
        if (text) send(text);
        else toast('Ses anlaşılamadı', { description: 'Biraz daha yüksek sesle tekrar dene.', tone: 'info', icon: 'hearing' });
      } catch (e) {
        toast('Ses tanınamadı', { description: (e as Error).message, tone: 'error' });
      } finally {
        setTranscribing(false);
      }
    };
    mr.start();
    recorder.current = mr;
    setRecording(true);
    vibrate(40);
  };

  const stopRecording = () => {
    if (!recording) return;
    vibrate(30);
    setRecording(false);
    if (recorder.current?.state === 'recording') recorder.current.stop();
  };

  const finish = async () => {
    if (!scenario) return;
    stopSpeaking();
    stopRecording();
    setReviewing(true);
    try {
      const r = await aiChatReview(scenario.role, messages);
      setReview(r);
      const used = targets.filter((w) => usedTarget(messages, w)).length;
      dispatch({ type: 'addXp', amount: 10 + used * 5 });
      dispatch({ type: 'logStudyTime', ms: Date.now() - startedAt.current });
    } catch (e) {
      toast('Değerlendirme alınamadı', { description: (e as Error).message, tone: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  // ── Senaryo seçimi ──
  if (!scenario) {
    return (
      <SubScreen title="Sohbet Partneri">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container via-surface-container-high to-surface-container p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest/60 flex items-center justify-center text-primary shrink-0">
            <Icon name="forum" size={28} />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Yapay zekâyla İngilizce konuş</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Bir senaryo seç, sesli ya da yazarak cevap ver. Hatalarını anında düzeltir, sonunda karne verir.</p>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant">Seviyem</span>
          <div className="flex p-1 rounded-lg bg-surface-container-low gap-1">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={cx('flex-1 py-2 rounded-md font-label-md text-label-md', level === l ? 'bg-primary text-on-primary' : 'text-on-surface-variant')}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {targets.length > 0 && (
          <section className="flex flex-col gap-2 bg-surface-container rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                <Icon name="target" size={16} className="text-secondary" /> Sohbette kullanmaya çalış
              </span>
              <button type="button" aria-label="Kelimeleri değiştir" onClick={() => setTargets(pickTargets(state, words))} className="text-primary">
                <Icon name="refresh" size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targets.map((w) => (
                <span key={w.id} lang="en" className="px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-md text-label-md">
                  {w.word}
                </span>
              ))}
            </div>
          </section>
        )}

        <label className="flex items-center justify-between bg-surface-container rounded-xl p-3">
          <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
            <Icon name="volume_up" size={18} className="text-primary" /> Yanıtları sesli oku
          </span>
          <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="w-5 h-5 accent-[#8083FF]" />
        </label>

        <section className="grid grid-cols-2 gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => start(sc)}
              className="text-left bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col gap-1 active:scale-[0.98] transition-all"
            >
              <span className="text-2xl leading-none">{sc.emoji}</span>
              <span className="font-label-lg text-label-lg text-on-surface">{sc.title}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-normal leading-snug">{sc.text}</span>
            </button>
          ))}
        </section>
      </SubScreen>
    );
  }

  // ── Karne ──
  if (review) {
    const tone = review.score >= 80 ? 'text-secondary' : review.score >= 60 ? 'text-tertiary' : 'text-error';
    return (
      <SubScreen title="Sohbet Karnesi" onBack={reset}>
        <section className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
          <div className={cx('w-20 h-20 rounded-full border-4 flex items-center justify-center font-headline-lg text-headline-lg font-bold shrink-0', tone, 'border-current')}>
            {review.score}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">
              {scenario.emoji} {scenario.title} • {userCount} mesaj
            </span>
            <p className="font-body-sm text-body-sm text-on-surface">{review.summary}</p>
          </div>
        </section>

        {targets.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Hedef kelimeler</h3>
            <div className="flex flex-wrap gap-1.5">
              {targets.map((w) => {
                const ok = usedTarget(messages, w);
                return (
                  <span
                    key={w.id}
                    lang="en"
                    className={cx('px-2.5 py-1 rounded-full font-label-md text-label-md flex items-center gap-1', ok ? 'bg-secondary-container/30 text-secondary' : 'bg-surface-container-high text-outline')}
                  >
                    <Icon name={ok ? 'check' : 'remove'} size={14} /> {w.word}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {review.mistakes.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Düzeltmeler</h3>
            {review.mistakes.map((m, i) => (
              <div key={i} className="bg-surface-container rounded-xl p-3 flex flex-col gap-1">
                <p lang="en" className="font-body-sm text-body-sm text-error line-through">{m.original}</p>
                <p lang="en" className="font-body-md text-body-md text-secondary font-medium">{m.fix}</p>
                {m.note && <p className="font-body-sm text-body-sm text-on-surface-variant">{m.note}</p>}
              </div>
            ))}
          </section>
        )}

        {review.phrases.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Bir dahaki sefere dene</h3>
            {review.phrases.map((p, i) => (
              <div key={i} className="bg-surface-container rounded-xl p-3 flex items-center gap-2">
                <div className="flex-1">
                  <p lang="en" className="font-body-md text-body-md text-on-surface font-medium">{p.en}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{p.tr}</p>
                </div>
                <SpeakButton text={p.en} />
              </div>
            ))}
          </section>
        )}

        <div className="flex flex-col gap-2">
          <PrimaryButton onClick={() => start(scenario)}>
            <Icon name="replay" size={20} /> Aynı senaryoyu tekrar et
          </PrimaryButton>
          <button type="button" onClick={reset} className="py-2 font-label-lg text-label-lg text-primary">
            Başka senaryo seç
          </button>
        </div>
      </SubScreen>
    );
  }

  // ── Sohbet ──
  const busy = thinking || transcribing || reviewing;
  return (
    <SubScreen
      title={`${scenario.emoji} ${scenario.title}`}
      onBack={reset}
      bottomPadding="pb-44"
      right={
        <button
          type="button"
          onClick={finish}
          disabled={userCount < 2 || busy}
          className="px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md disabled:opacity-40"
        >
          Bitir
        </button>
      }
    >
      {targets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {targets.map((w) => {
            const ok = usedTarget(messages, w);
            return (
              <span
                key={w.id}
                lang="en"
                className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1', ok ? 'bg-secondary-container/30 text-secondary' : 'bg-surface-container-high text-on-surface-variant')}
              >
                {ok && <Icon name="check" size={12} />}
                {w.word}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((m, i) =>
          m.role === 'ai' ? (
            <div key={i} className="flex flex-col gap-1 max-w-[88%] self-start animate-fade-in">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-surface-container-high">
                <p lang="en" className="font-body-md text-body-md text-on-surface">{m.text}</p>
                {showTr.includes(i) && m.tr && <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-1">{m.tr}</p>}
              </div>
              <div className="flex items-center gap-3 px-1">
                <SpeakButton text={m.text} label="Dinle" className="flex items-center gap-1 text-primary font-label-sm text-label-sm" size={14} />
                {m.tr && (
                  <button
                    type="button"
                    onClick={() => setShowTr((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}
                    className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm"
                  >
                    <Icon name="translate" size={14} /> {showTr.includes(i) ? 'Gizle' : 'Türkçesi'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-1 max-w-[88%] self-end items-end animate-fade-in">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-primary text-on-primary">
                <p lang="en" className="font-body-md text-body-md">{m.text}</p>
              </div>
              {m.correction && (
                <div className="px-3 py-2 rounded-xl bg-tertiary-container/20 flex flex-col gap-0.5 max-w-full">
                  <span className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
                    <Icon name="auto_fix_high" size={14} /> Daha doğru
                  </span>
                  <p lang="en" className="font-body-sm text-body-sm text-on-surface">{m.correction.fixed}</p>
                  {m.correction.note && <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">{m.correction.note}</p>}
                </div>
              )}
            </div>
          ),
        )}
        {(thinking || transcribing || reviewing) && (
          <div className="self-start flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
            <Icon name="progress_activity" size={16} className="animate-spin text-primary" />
            {transcribing ? 'Sesin yazıya çevriliyor…' : reviewing ? 'Karnen hazırlanıyor…' : 'Yazıyor…'}
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-outline-variant/30 pb-safe">
        <div className="max-w-md mx-auto px-margin pt-2 pb-3 flex flex-col gap-2">
          {suggestions.length > 0 && !busy && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <span className="shrink-0 self-center font-label-sm text-label-sm text-on-surface-variant">Öneri:</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  lang="en"
                  onClick={() => setInput(s)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm max-w-[75%] truncate"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.length >= MAX_MESSAGES ? (
            <PrimaryButton onClick={finish} disabled={busy}>
              <Icon name="grading" size={20} /> Sohbeti bitir ve karneni gör
            </PrimaryButton>
          ) : (
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <button
                type="button"
                aria-label={recording ? 'Kaydı bitir ve gönder' : 'Sesli cevap ver'}
                onClick={recording ? stopRecording : startRecording}
                disabled={!recording && busy}
                className={cx(
                  'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40',
                  recording ? 'bg-error text-on-error animate-pulse' : 'bg-secondary text-on-secondary',
                )}
              >
                <Icon name={recording ? 'stop' : 'mic'} size={24} fill />
              </button>
              <input
                aria-label="Mesajın"
                lang="en"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={recording ? 'Dinliyorum… bitince durdur' : 'İngilizce yaz ya da mikrofona bas'}
                autoComplete="off"
                disabled={recording}
                className="flex-1 min-w-0 h-12 px-4 rounded-full bg-surface-container-high text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary placeholder:text-outline"
              />
              <button
                type="submit"
                aria-label="Gönder"
                disabled={!input.trim() || busy || recording}
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                <Icon name="send" size={22} />
              </button>
            </form>
          )}
        </div>
      </div>
    </SubScreen>
  );
}
