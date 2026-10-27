import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubScreen } from '../../components/Layout';
import { Sheet } from '../../components/Sheet';
import { cx, EmptyState, Icon, PrimaryButton } from '../../components/ui';
import { POS_LABELS } from '../../data/words';
import { BOX_COLORS, isDue, nextBox } from '../../lib/leitner';
import { canRecognize, listen, normalizeText, speak, stopSpeaking, vibrate, type RecognitionHandle } from '../../lib/speech';
import type { BoxNumber, ReviewOutcome } from '../../lib/types';
import { useStore } from '../../store/AppStore';

type Playlist = 'box12' | 'due' | 'all';
const PLAYLISTS: Record<Playlist, string> = {
  box12: 'Kutu 1 & 2 Tekrarı',
  due: 'Bugün Vadesi Gelenler',
  all: 'Tüm Kutular (Karışık)',
};

type Phase = 'word' | 'countdown' | 'reveal' | 'await';
const THINK_SECONDS = 3;
const CIRC = 263.89;

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch {
    // Ses bağlamı oluşturulamazsa sessiz devam edilir.
  }
}

export default function HandsFree() {
  const { state, dispatch, words } = useStore();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist>('box12');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [voiceCmd, setVoiceCmd] = useState(false);

  const queue = useMemo(() => {
    const cards = Object.values(state.cards).filter((c) => words[c.wordId]);
    const list =
      playlist === 'box12' ? cards.filter((c) => c.box <= 2) : playlist === 'due' ? cards.filter((c) => isDue(c)) : cards;
    return list.sort((a, b) => a.box - b.box).map((c) => c.wordId);
    // Oturum boyunca kuyruk sabit kalsın: kutular değişse de yeniden sıralanmaz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, started]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('word');
  const [left, setLeft] = useState(THINK_SECONDS);
  const [paused, setPaused] = useState(false);
  const [heard, setHeard] = useState('');
  const [stats, setStats] = useState({ know: 0, forgot: 0 });
  const runId = useRef(0);
  const rec = useRef<RecognitionHandle | null>(null);

  const wordId = queue[index];
  const word = wordId ? words[wordId] : undefined;
  const card = wordId ? state.cards[wordId] : undefined;
  const finished = started && index >= queue.length;

  const stopAll = useCallback(() => {
    runId.current++;
    stopSpeaking();
    rec.current?.stop();
    rec.current = null;
  }, []);

  useEffect(() => stopAll, [stopAll]);

  const rate = useCallback(
    (outcome: ReviewOutcome) => {
      if (!wordId) return;
      stopAll();
      vibrate(40);
      dispatch({ type: 'review', wordId, outcome });
      setStats((s) => ({ ...s, [outcome === 'forgot' ? 'forgot' : 'know']: s[outcome === 'forgot' ? 'forgot' : 'know'] + 1 }));
      setHeard('');
      setPhase('word');
      setIndex((i) => i + 1);
    },
    [wordId, dispatch, stopAll],
  );

  // Kart döngüsü: kelimeyi oku → 3 sn düşün → bip → anlamı ve örneği oku → cevap bekle
  useEffect(() => {
    if (!started || paused || !word || phase !== 'word') return;
    const id = ++runId.current;
    setLeft(THINK_SECONDS);
    speak(word.word, {
      rate: state.profile.ttsRate,
      onEnd: () => {
        if (runId.current === id) setPhase('countdown');
      },
    });
  }, [started, paused, word, phase, state.profile.ttsRate]);

  useEffect(() => {
    if (!started || paused || phase !== 'countdown') return;
    if (left <= 0) {
      beep();
      vibrate(40);
      setPhase('reveal');
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, phase, left]);

  useEffect(() => {
    if (!started || paused || phase !== 'reveal' || !word) return;
    const id = ++runId.current;
    const example = word.examples[0]?.en;
    speak(word.meaning, {
      lang: 'tr-TR',
      rate: 0.95,
      onEnd: () => {
        if (runId.current !== id) return;
        if (!example) return setPhase('await');
        speak(example, { rate: state.profile.ttsRate, onEnd: () => runId.current === id && setPhase('await') });
      },
    });
  }, [started, paused, phase, word, state.profile.ttsRate]);

  useEffect(() => {
    if (!started || paused || phase !== 'await' || !voiceCmd) return;
    rec.current = listen(
      'tr-TR',
      (alts) => {
        const text = normalizeText(alts.map((a) => a.transcript).join(' '));
        setHeard(text);
        if (/bilmiyorum|hatırlamadım|hatirlamadim|hayır|hayir|\bno\b/.test(text)) rate('forgot');
        else if (/biliyorum|evet|\byes\b|tamam/.test(text)) rate('know');
        else if (/tekrar|repeat/.test(text)) setPhase('word');
      },
      undefined,
      () => {
        rec.current = null;
      },
    );
    return () => rec.current?.stop();
  }, [started, paused, phase, voiceCmd, rate]);

  if (!queue.length && !started) {
    return (
      <SubScreen title="Eller Serbest Mod">
        <EmptyState
          icon="directions_car"
          title="Bu listede kelime yok"
          text={playlist === 'box12' ? 'Kutu 1 ve 2’de kelimen yok. Başka bir liste seç veya önce kart çalış.' : 'Önce birkaç kart çalışarak kutularını doldur.'}
          action={
            <div className="flex flex-col gap-2 w-full">
              {playlist !== 'all' && <PrimaryButton onClick={() => setPlaylist('all')}>Tüm Kutuları Dene</PrimaryButton>}
              <button type="button" className="font-label-lg text-label-lg text-primary py-2" onClick={() => navigate('/ogren/oturum')}>
                Kart Oturumuna Git
              </button>
            </div>
          }
        />
      </SubScreen>
    );
  }

  const nextKnow = card ? nextBox(card.box, 'know') : 2;
  const revealed = phase === 'reveal' || phase === 'await';

  return (
    <SubScreen title="Eller Serbest Mod" onBack={() => { stopAll(); navigate(-1); }}>
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs bg-surface-container px-3 py-1.5 rounded-full shadow-sm">
          <Icon name="directions_car" size={18} fill className="text-secondary" />
          <span className="font-label-md text-label-md text-on-surface">Sürüş Güvenli Mod</span>
          {started && !paused && <span className="w-2 h-2 rounded-full bg-secondary animate-pulse ml-1" />}
        </div>
        <button
          type="button"
          aria-label="Çalma listesini değiştir"
          disabled={started && !finished}
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 disabled:opacity-60 min-w-0"
        >
          <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider truncate">{PLAYLISTS[playlist]}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">({queue.length})</span>
          <Icon name="expand_more" size={16} className="text-on-surface-variant" />
        </button>
      </div>

      {!started ? (
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
            <Icon name="headphones" size={40} />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Ekrana bakmadan çalış</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Her kelime sesli okunur, 3 saniye düşünürsün, bip sesinden sonra Türkçe anlamı ve örnek cümlesi okunur. Büyük butonlarla ya da sesinle cevap ver.
          </p>
          <label className={cx('w-full flex items-center justify-between gap-3 bg-surface-container rounded-xl px-4 py-3', !canRecognize() && 'opacity-50')}>
            <span className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface text-left">
              <Icon name="mic" size={20} className="text-primary" />
              Sesli komut (“biliyorum” / “bilmiyorum” / “tekrar”)
            </span>
            <input type="checkbox" className="w-5 h-5 accent-secondary" disabled={!canRecognize()} checked={voiceCmd} onChange={(e) => setVoiceCmd(e.target.checked)} />
          </label>
          {!canRecognize() && <p className="font-label-sm text-label-sm text-on-surface-variant">Bu tarayıcı konuşma tanımayı desteklemiyor (Chrome/Edge önerilir).</p>}
          <PrimaryButton onClick={() => { setStarted(true); setIndex(0); setPhase('word'); setStats({ know: 0, forgot: 0 }); }}>
            <Icon name="play_circle" size={22} fill /> {queue.length} Kelimeyle Başla
          </PrimaryButton>
        </section>
      ) : finished || !word ? (
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col items-center text-center gap-3">
          <Icon name="flag" size={40} fill className="text-secondary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Liste tamamlandı!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {stats.know} biliyorum • {stats.forgot} hatırlayamadım
          </p>
          <PrimaryButton onClick={() => { setStarted(false); setIndex(0); }}>Yeni Tur</PrimaryButton>
        </section>
      ) : (
        <>
          <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2">
                {card && (
                  <span className={cx('font-label-sm text-label-sm px-2.5 py-1 rounded-full uppercase', BOX_COLORS[card.box].soft, BOX_COLORS[card.box].text)}>Kutu {card.box}</span>
                )}
                <span className="font-label-sm text-label-sm text-on-surface-variant">{POS_LABELS[word.pos].tr} ({POS_LABELS[word.pos].en})</span>
              </div>
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
                  <span key={b} className={cx('w-2.5 h-1.5 rounded-full', card && b <= card.box ? BOX_COLORS[card.box].bg : 'bg-surface-variant')} />
                ))}
              </div>
            </div>
            <div className="text-center my-space-xs">
              <h2 lang="en" className="font-headline-lg text-display-lg text-inverse-surface tracking-tight uppercase break-words">{word.word}</h2>
              <p className="font-body-md text-body-md text-surface-tint tracking-widest mt-1">{word.ipa}</p>
            </div>
            <div className="relative w-36 h-36 my-space-sm flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="6" />
                <circle
                  className="text-secondary transition-all duration-1000 ease-linear"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  stroke="currentColor"
                  strokeDasharray={CIRC}
                  strokeDashoffset={phase === 'countdown' ? CIRC - (left / THINK_SECONDS) * CIRC : phase === 'word' ? 0 : CIRC}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-secondary leading-none">
                  {phase === 'word' ? <Icon name="volume_up" size={36} /> : String(phase === 'countdown' ? left : 0).padStart(2, '0')}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider mt-0.5">
                  {phase === 'word' ? 'DİNLE' : phase === 'countdown' ? 'SN TAHMİN' : 'CEVAP'}
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="flex items-center justify-center gap-1.5 h-8 w-44 my-space-xs">
              {[3, 6, 8, 5, 7, 4, 6].map((h, i) => (
                <span
                  key={i}
                  className={cx('w-1.5 rounded-full', i % 2 ? 'bg-primary' : 'bg-secondary', !paused && (phase === 'word' || phase === 'reveal') && 'animate-pulse')}
                  style={{ height: h * 4, animationDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-xs px-space-xs">
              Zihninden Türkçe anlamını söyle… <span className="text-tertiary-fixed-dim">Bip sesinden sonra açıklanacak</span>
            </p>
            <div className={cx('w-full mt-space-md bg-surface-container-high rounded-lg p-space-md shadow-sm transition-all duration-300', !revealed && 'opacity-40 blur-sm select-none')}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label-md text-label-md text-secondary uppercase">Türkçe Karşılığı</span>
                <Icon name="volume_up" size={20} fill className="text-primary" />
              </div>
              <p className="font-headline-md text-headline-md text-inverse-surface mb-2">{revealed ? word.meaning : '••••••••'}</p>
              {word.examples[0] && (
                <div className="bg-surface-container-lowest p-2.5 rounded-md flex items-start gap-2">
                  <Icon name="format_quote" size={18} className="text-tertiary mt-0.5" />
                  <p className="font-body-sm text-body-sm text-on-surface italic">“{word.examples[0].en}”</p>
                </div>
              )}
            </div>
            {voiceCmd && phase === 'await' && (
              <p className="mt-2 font-label-sm text-label-sm text-secondary flex items-center gap-1">
                <Icon name="mic" size={14} className="animate-pulse" /> Dinleniyor… {heard && `“${heard}”`}
              </p>
            )}
          </section>

          <div className="flex flex-col gap-space-sm w-full">
            <div className="grid grid-cols-12 gap-space-sm items-stretch">
              <button
                type="button"
                aria-label="Tekrar dinle"
                onClick={() => { stopAll(); setPhase('word'); }}
                className="col-span-3 min-h-[72px] bg-surface-container-high active:bg-surface-variant text-on-surface rounded-xl flex flex-col items-center justify-center p-2 shadow-md active:scale-95 transition-all"
              >
                <Icon name="replay" size={28} className="text-primary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-center">Tekrar</span>
              </button>
              <button
                type="button"
                aria-label={paused ? 'Devam et' : 'Duraklat'}
                onClick={() => {
                  vibrate(40);
                  if (!paused) stopAll();
                  else setPhase((p) => (p === 'countdown' ? 'countdown' : p === 'await' ? 'await' : 'word'));
                  setPaused((p) => !p);
                }}
                className="col-span-3 min-h-[72px] bg-surface-container-high active:bg-surface-variant text-on-surface rounded-xl flex flex-col items-center justify-center p-2 shadow-md active:scale-95 transition-all"
              >
                <Icon name={paused ? 'play_circle' : 'pause_circle'} size={32} fill className="text-inverse-surface" />
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">{paused ? 'Devam' : 'Duraklat'}</span>
              </button>
              <button
                type="button"
                aria-label={`Biliyorum, Kutu ${nextKnow}'ye terfi et`}
                onClick={() => rate('know')}
                className="col-span-6 min-h-[72px] bg-secondary-container active:opacity-90 text-on-secondary rounded-xl flex items-center justify-between px-space-md shadow-lg active:scale-[0.98] transition-all"
              >
                <div className="flex flex-col text-left">
                  <span className="font-headline-sm text-headline-sm text-on-secondary leading-tight">Biliyorum</span>
                  <span className="font-label-sm text-label-sm text-on-secondary-container">Kutu {nextKnow}’ye Terfi Et</span>
                </div>
                <Icon name="fast_forward" size={32} className="text-on-secondary" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Hatırlayamadım, Kutu 1'e gönder"
              onClick={() => rate('forgot')}
              className="w-full min-h-[58px] bg-surface-container active:bg-surface-variant text-on-surface rounded-xl flex items-center justify-center gap-space-sm px-space-md shadow-md active:scale-[0.98] transition-all"
            >
              <Icon name="warning" size={24} className="text-error" />
              <span className="font-label-lg text-label-lg text-on-surface">Hatırlayamadım (Kutu 1’e)</span>
              <Icon name="restart_alt" size={20} className="text-on-surface-variant" />
            </button>
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
              {index + 1} / {queue.length} • {stats.know} biliyorum • {stats.forgot} hatırlayamadım
            </p>
          </div>
        </>
      )}

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Çalma Listesi" icon="queue_music">
        {(Object.keys(PLAYLISTS) as Playlist[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPlaylist(p);
              setStarted(false);
              setIndex(0);
              setPickerOpen(false);
            }}
            className={cx('w-full p-3 rounded-xl flex items-center justify-between', p === playlist ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface')}
          >
            <span className="font-label-lg text-label-lg">{PLAYLISTS[p]}</span>
            {p === playlist && <Icon name="check" size={20} />}
          </button>
        ))}
      </Sheet>
    </SubScreen>
  );
}
