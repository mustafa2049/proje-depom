import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { cx, EmptyState, Icon, SpeakButton } from '../../components/ui';
import { POS_LABELS } from '../../data/words';
import { LEECH_THRESHOLD } from '../../lib/leitner';
import { canRecognize, listen, similarity, vibrate } from '../../lib/speech';
import { useStore } from '../../store/AppStore';
import { leeches } from '../../store/selectors';

const LOCK_TARGET = 3;

export default function LeechClinic() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const list = leeches(state).filter((c) => words[c.wordId]);
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.wordId ?? null);
  const card = selectedId ? state.cards[selectedId] : undefined;
  const word = selectedId ? words[selectedId] : undefined;
  const [typed, setTyped] = useState('');
  const [locks, setLocks] = useState(0);
  const [shake, setShake] = useState(false);
  const [voice, setVoice] = useState<'idle' | 'listening' | 'ok' | 'fail' | 'skipped'>('idle');
  const [heard, setHeard] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [rescued, setRescued] = useState(false);

  useEffect(() => {
    setTyped('');
    setLocks(0);
    setVoice('idle');
    setHeard('');
    setRescued(false);
    setMnemonic(selectedId ? words[selectedId]?.mnemonic ?? '' : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const atRisk = Object.values(state.cards)
    .filter((c) => words[c.wordId] && c.lapses >= 2)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 5);

  if (!word || !card || (!list.some((c) => c.wordId === word.id) && !rescued)) {
    return (
      <SubScreen title="İnatçı Kelimeler Kliniği">
        <EmptyState
          icon="health_and_safety"
          title="Klinik şu an boş 🎉"
          text={`Arka arkaya ${LEECH_THRESHOLD} kez unutulup Kutu 1’e düşen kelimeler burada özel müdahaleye alınır. Şu an böyle bir kelimen yok.`}
        />
        {atRisk.length > 0 && (
          <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Icon name="warning" size={20} className="text-tertiary" /> Risk Altındaki Kelimeler
            </h3>
            {atRisk.map((c) => (
              <Link key={c.wordId} to={`/kelime/${c.wordId}`} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high">
                <span className="font-label-lg text-label-lg text-on-surface">{words[c.wordId].word}</span>
                <span className="font-label-sm text-label-sm text-error">{c.lapses} kez unutuldu</span>
              </Link>
            ))}
          </section>
        )}
      </SubScreen>
    );
  }

  const lockDone = locks >= LOCK_TARGET;
  const voiceDone = voice === 'ok' || voice === 'skipped';
  const canRescue = lockDone && voiceDone && !rescued;

  const checkTyped = () => {
    if (typed.trim().toLowerCase() === word.word.toLowerCase()) {
      vibrate(30);
      setLocks((l) => Math.min(LOCK_TARGET, l + 1));
      setTyped('');
    } else {
      vibrate(90);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const verifyVoice = () => {
    if (!canRecognize()) {
      setVoice('skipped');
      return;
    }
    setVoice('listening');
    listen(
      'en-US',
      (alts) => {
        const best = alts.reduce((m, a) => Math.max(m, similarity(a.transcript, word.word)), 0);
        setHeard(alts[0]?.transcript ?? '');
        setVoice(best >= 0.75 ? 'ok' : 'fail');
      },
      () => setVoice('fail'),
    );
  };

  const rescue = () => {
    if (!canRescue) return;
    if (mnemonic.trim() && mnemonic.trim() !== word.mnemonic) dispatch({ type: 'updateWord', word: { ...word, mnemonic: mnemonic.trim() } });
    dispatch({ type: 'rescueLeech', wordId: word.id });
    setRescued(true);
    toast('Kurtarıldı! Kutu 2’ye aktarıldı', { description: '+25 XP • 2 gün sonra yeniden test edilecek', icon: 'task_alt' });
  };

  const others = list.filter((c) => c.wordId !== word.id);

  return (
    <SubScreen title="İnatçı Kelimeler Kliniği">
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Icon name="medical_services" size={20} className="text-error" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Özel Müdahale</h2>
          </div>
          <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full">Leech Protocol</span>
        </div>
        <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-error-container text-on-error-container self-start">
          <Icon name="warning" size={16} className="text-error" />
          <span className="font-label-md text-label-md">
            {card.failStreak} Kez Üst Üste Unutuldu • Özel Müdahale Modu
          </span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex items-start gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="psychology_alt" size={20} className="text-error" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider">Klinik Teşhis</span>
            <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
              Bu kelime {card.failStreak} kez arka arkaya <strong className="text-error font-semibold">Kutu 1</strong>’e düştü. Klasik kart ezberleme işe yaramıyor; yaklaşımı değiştiriyoruz!
            </p>
          </div>
        </div>
        {others.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-margin px-margin">
            {list.map((c) => (
              <button
                key={c.wordId}
                type="button"
                onClick={() => setSelectedId(c.wordId)}
                className={cx('px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0', c.wordId === word.id ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant')}
              >
                {words[c.wordId].word}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-container rounded-xl p-space-lg shadow-lg flex flex-col items-center text-center gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-bold">
            {POS_LABELS[word.pos].tr} • {word.cefr}
          </span>
          <span className="font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full">Kutu 1 Karantinası</span>
        </div>
        <h3 lang="en" className="font-display-lg text-display-lg text-primary tracking-wide uppercase pt-space-xs break-words">{word.word}</h3>
        <p className="font-label-md text-label-md text-outline">{word.ipa}</p>
        <div className="mt-space-sm w-full bg-surface-container-low rounded-lg py-2.5 px-space-md">
          <span className="font-label-sm text-label-sm text-on-surface-variant block">Türkçe Karşılığı</span>
          <span className="font-headline-sm text-headline-sm text-secondary font-bold">{word.meaning}</span>
        </div>
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-label-sm text-label-sm font-bold">1</div>
            <h4 className="font-label-lg text-label-lg text-on-surface">Hafıza Çapası (Mnemonic)</h4>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary">Bilişsel Çapa</span>
        </div>
        <div className="bg-surface-container rounded-lg overflow-hidden flex flex-col">
          {word.image && (
            <div className="relative w-full h-44 bg-surface-container-highest overflow-hidden">
              <img className="w-full h-full object-cover" src={word.image} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/30 to-transparent" />
              <div className="absolute bottom-2 right-3">
                <SpeakButton text={word.word} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md" />
              </div>
            </div>
          )}
          <div className="p-space-md flex flex-col gap-2">
            {word.mnemonic ? (
              <p className="font-body-md text-body-md text-tertiary font-semibold italic">{word.mnemonic}</p>
            ) : (
              <>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bu kelime için hazır bir çağrışım yok. Kelimeyi Türkçe bir sese, resme veya kişisel bir anıya bağlayan kendi cümleni yaz — kendi ürettiğin çağrışımlar çok daha kalıcıdır.
                </p>
                <textarea
                  rows={2}
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder={`Örn: “${word.word}” kulağa … gibi geliyor…`}
                  className="p-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-tertiary"
                />
              </>
            )}
            <p className="font-label-md text-label-md text-on-surface">
              {word.word} <span className="text-primary font-bold">→</span> {word.meaning}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm text-label-sm font-bold">2</div>
            <h4 className="font-label-lg text-label-lg text-on-surface">{word.morphology ? 'Etimoloji ve Kök Parçalayıcı' : 'Bağlam ve Çağrışım Ağı'}</h4>
          </div>
          <span className="font-label-sm text-label-sm text-primary">Yapısal Bellek</span>
        </div>
        {word.morphology ? (
          <div className={cx('grid gap-space-xs', word.morphology.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
            {word.morphology.map((m, i) => (
              <div key={m.part} className="bg-surface-container rounded-lg p-2.5 flex flex-col items-center text-center">
                <span className={cx('font-label-sm text-label-sm font-bold', ['text-primary', 'text-secondary', 'text-tertiary'][i % 3])}>{m.part}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal mt-1">{m.meaning}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[...(word.synonyms ?? []), ...(word.collocations ?? [])].map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md">
                {s}
              </span>
            ))}
          </div>
        )}
        {(word.etymology || word.examples[0]) && (
          <div className="bg-surface-container rounded-lg p-space-md flex items-start gap-space-sm">
            <Icon name="history_edu" size={20} className="text-primary mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">{word.etymology ? 'Köken Hikayesi' : 'Örnek Bağlam'}</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{word.etymology ?? `“${word.examples[0].en}” — ${word.examples[0].tr}`}</p>
            </div>
          </div>
        )}
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-sm text-label-sm font-bold">3</div>
            <h4 className="font-label-lg text-label-lg text-on-surface">Kilit Açma Testi</h4>
          </div>
          <span className="font-label-sm text-label-sm bg-secondary-container/30 text-secondary px-2 py-0.5 rounded-full font-bold">
            {locks} / {LOCK_TARGET} Tamamlandı
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Kutu 1 kilidini kırmak için kelimeyi bakmadan {LOCK_TARGET} kez hatasız yaz ve sesli telaffuz et.</p>
        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
          {Array.from({ length: LOCK_TARGET }, (_, i) => (
            <div key={i} className={cx('h-full rounded-full flex-1', i < locks ? 'bg-secondary' : 'bg-surface-container-highest')} />
          ))}
        </div>
        {lockDone ? (
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-1.5 py-space-xs">
              {word.word.split('').map((ch, i) => (
                <div key={i} lang="en" className="flex-1 h-12 max-w-[44px] bg-secondary-container/20 text-secondary rounded-lg flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm uppercase">
                  {ch === ' ' ? '' : ch}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-space-xs text-secondary font-label-sm text-label-sm">
              <Icon name="check_circle" size={16} />
              <span>Yazım Hatasız • Son Adım: Sesli Telaffuz</span>
            </div>
          </div>
        ) : (
          <div className={cx('flex gap-2', shake && 'animate-[pulse_0.2s_ease-in-out_2]')}>
            <input
              aria-label="Kelimeyi yaz"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkTyped()}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              placeholder="Kelimeyi bakmadan yaz…"
              className={cx('flex-1 h-12 px-4 rounded-lg bg-surface-container text-on-surface font-headline-sm text-headline-sm outline-none focus:ring-1', shake ? 'ring-1 ring-error' : 'focus:ring-secondary')}
            />
            <button type="button" onClick={checkTyped} className="h-12 px-4 rounded-lg bg-secondary-container text-on-secondary-container font-label-lg text-label-lg">
              Doğrula
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!lockDone || voiceDone || voice === 'listening'}
          onClick={verifyVoice}
          className={cx(
            'w-full h-12 rounded-lg flex items-center justify-center gap-space-sm font-label-lg text-label-lg active:scale-[0.98] transition-all disabled:opacity-60',
            voiceDone ? 'bg-secondary-container/40 text-secondary' : voice === 'fail' ? 'bg-error-container/30 text-error' : 'bg-surface-container-high hover:bg-surface-bright text-on-surface',
          )}
        >
          <Icon name={voice === 'ok' ? 'verified' : voice === 'listening' ? 'record_voice_over' : voice === 'skipped' ? 'skip_next' : 'mic'} size={22} className={voice === 'listening' ? 'animate-pulse' : 'text-secondary'} />
          <span>
            {voice === 'ok'
              ? 'Telaffuz Doğrulandı!'
              : voice === 'listening'
                ? `Dinleniyor… “${word.ipa}”`
                : voice === 'fail'
                  ? `Tekrar dene${heard ? ` (duyulan: “${heard}”)` : ''}`
                  : voice === 'skipped'
                    ? 'Sesli doğrulama bu tarayıcıda desteklenmiyor'
                    : '🎤 Sesli Onayla ve Telaffuz Et'}
          </span>
        </button>
      </section>

      <section className="pt-space-xs">
        <button
          type="button"
          disabled={!canRescue && !rescued}
          onClick={rescue}
          className={cx(
            'w-full min-h-[56px] rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-40',
            rescued ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary',
          )}
        >
          <Icon name={rescued ? 'task_alt' : 'lock_open'} size={24} />
          <span>{rescued ? 'Kurtarıldı! Kutu 2’ye Aktarıldı' : 'Kilidi Kır ve Kutu 2’ye Kurtar'}</span>
          {!rescued && <span className="font-label-sm text-label-sm bg-on-primary/20 px-2 py-0.5 rounded-full ml-1 font-bold">+25 XP</span>}
        </button>
        <p className="text-center font-label-sm text-label-sm text-outline mt-2">Başarılı kurtarma sonrası Kutu 2’de 2 gün sonra yeniden test edilecek.</p>
        {rescued && others.length > 0 && (
          <button type="button" onClick={() => setSelectedId(others[0].wordId)} className="w-full mt-2 py-3 font-label-lg text-label-lg text-primary">
            Sıradaki hasta: {words[others[0].wordId].word} →
          </button>
        )}
      </section>
    </SubScreen>
  );
}
