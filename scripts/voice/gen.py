"""Dışa aktarılan metinleri Kokoro (af_heart) ile seslendirir.

Kullanım: python gen.py texts.json wav_dir [--workers 4] [--skip public/voice]
Her metin için wav_dir/<anahtar>.wav ve wav_dir/<anahtar>.json (süre + kelime zamanları) yazılır.
Var olan çıktılar ve --skip klasöründe .ogg kaydı bulunan anahtarlar atlanır; böylece yeni eklenen
kelimeler için yalnızca eksikler üretilir ve yarıda kalan çalışma kaldığı yerden sürer.
"""
import argparse
import json
import os
import time
import warnings
from multiprocessing import Process

warnings.filterwarnings('ignore')

VOICE = 'af_heart'
# Uygulamadaki varsayılan telaffuz hızı (0.9x) bu kayıtların doğal hızına karşılık gelir.
SPEED = 0.9
SR = 24000
POS_KEYS = {'noun': 'NOUN', 'verb': 'VERB', 'adjective': 'ADJ', 'adverb': 'ADV'}
# Kokoro çok kısa girdilerde bazen kelimenin önüne kısa bir "ı/a" sesi ekliyor ("seed" → "a seed",
# "set up" → "is that up"). Kelime ve kalıplar bu yüzden bir taşıyıcı cümlenin ardından üretilip
# aradaki sessizlikten kesilir. "Okay." uygun değil: spaCy "Okay." ifadesini bazen tek parça sayıyor,
# nokta düşüyor ve duraklama oluşmuyor; "Listen." her denemede 120–210 ms'lik bir duraklama üretti.
CARRIER = 'Listen.'


def unique_tasks(items, skip_dir, kind=None):
    """Anahtara göre tekilleştirir; türü belli sözlük kelimesi önceliklidir."""
    by_key = {}
    for x in items:
        if kind and x['kind'] != kind:
            continue
        cur = by_key.get(x['key'])
        if cur is None or (not cur.get('pos') and x.get('pos')):
            by_key[x['key']] = x
    if skip_dir:
        by_key = {k: x for k, x in by_key.items() if not os.path.exists(os.path.join(skip_dir, k + '.ogg'))}
    return list(by_key.values())


def homograph_phonemes(lexicon, word, pos):
    """Eş yazımlı kelimede sözlükteki türe uyan okunuşu seçer (ör. affect fiil → əfˈɛkt, live fiil → lˈɪv)."""
    if ' ' in word or pos not in POS_KEYS:
        return None
    for cand in (word, word.lower()):
        e = lexicon.golds.get(cand) or lexicon.silvers.get(cand)
        if isinstance(e, dict):
            # 'None' girdisi sözcüğün vurgulu (tek başına) okunuşudur: be → bˈi
            return e.get(POS_KEYS[pos]) or e.get('None') or e.get('DEFAULT')
        if e is not None:
            return None
    return None


def spoken_input(x, lexicon):
    text = x['text'].strip()
    if x['kind'] != 'word':
        return text
    # Tek başına okunan kelime/kalıp: noktayla bitince doğal, düşen bir tonlama alır.
    end = '' if text[-1] in '.!?' else '.'
    ph = homograph_phonemes(lexicon, text, x.get('pos'))
    return f'[{text}](/{ph}/){end}' if ph else text + end


def cut_after_carrier(a, toks):
    """Taşıyıcı ile hedef arasındaki en uzun sessizliğin (≥50 ms) son kısmından keser; yoksa None."""
    import numpy as np

    stop = next((i for i, t in enumerate(toks) if t[0].strip().endswith('.')), None)
    if stop is None or stop + 1 >= len(toks):
        return None
    lo = max(0, int((toks[stop][1] - 0.05) * SR))
    hi = min(len(a), int((toks[stop + 1][1] + 0.08) * SR))
    rms = [float(np.sqrt(np.mean(a[i:i + 240] ** 2))) for i in range(lo, hi - 240, 240)]
    best, start = None, None
    for j, v in enumerate(rms + [1.0]):
        if v < 0.004 and start is None:
            start = j
        elif v >= 0.004 and start is not None:
            if best is None or j - start > best[1] - best[0]:
                best = (start, j)
            start = None
    if best is None or best[1] - best[0] < 5:
        return None
    # Sessizliğin sonundan 60 ms önce kes: yumuşak başlangıçlar (h, f, θ) eşiğin altında başlayabilir.
    return lo + max(best[0], best[1] - 6) * 240


def char_offsets(original, tokens):
    """Kokoro kelime zamanlarını özgün metindeki karakter konumlarına eşler: [[karakter, ms], ...]."""
    out, cursor, low = [], 0, original.lower()
    for text, ts in tokens:
        t = text.strip().lower()
        if not t or not any(c.isalnum() for c in t):
            continue
        i = low.find(t, cursor)
        if i < 0:
            continue
        out.append([i, round(ts * 1000)])
        cursor = i + len(t)
    return out


def worker(idx, n, tasks, out_dir):
    import numpy as np
    import soundfile as sf
    import torch

    torch.set_num_threads(1)
    from kokoro import KPipeline

    pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
    lexicon = pipe.g2p.lexicon
    mine = tasks[idx::n]
    t0, done = time.time(), 0
    for x in mine:
        k = x['key']
        meta_path = os.path.join(out_dir, k + '.json')
        if os.path.exists(meta_path):
            continue
        text_in = spoken_input(x, lexicon)
        single = x['kind'] == 'word'
        if single:
            text_in = f'{CARRIER} {text_in}'
        parts, toks, offset, phonemes = [], [], 0.0, []
        for r in pipe(text_in, voice=VOICE, speed=SPEED):
            if r.audio is None:
                continue
            a = r.audio.numpy()
            for tk in r.tokens or []:
                if tk.start_ts is not None:
                    toks.append((tk.text, tk.start_ts + offset, (tk.end_ts or tk.start_ts) + offset))
            parts.append(a)
            phonemes.append(r.phonemes)
            offset += len(a) / SR
        if not parts:
            print(f'[{idx}] BOŞ: {x["text"]!r}', flush=True)
            continue
        a = np.concatenate(parts)
        if single:
            cut = cut_after_carrier(a, toks)
            if cut is None:
                print(f'[{idx}] TAŞIYICI KESİLEMEDİ: {x["text"]!r}', flush=True)
                continue
            a = a[cut:]
            toks = [(t, s - cut / SR, e - cut / SR) for (t, s, e) in toks if s >= cut / SR]
        loud = np.where(np.abs(a) > 0.003)[0]
        if not len(loud):
            print(f'[{idx}] SESSİZ: {x["text"]!r}', flush=True)
            continue
        # Baştaki ~0.4 sn sessizliği kırp (yumuşak ünsüzler için 40 ms pay), sonda 150 ms bırak.
        start = max(0, loud[0] - int(0.04 * SR))
        end = min(len(a), loud[-1] + int(0.15 * SR))
        a = a[start:end].copy()
        fade = int(0.004 * SR)
        a[:fade] *= np.linspace(0, 1, fade)
        a[-fade:] *= np.linspace(1, 0, fade)
        lead = start / SR
        sf.write(os.path.join(out_dir, k + '.wav'), a, SR, subtype='PCM_16')
        meta = {
            'text': x['text'],
            'kind': x['kind'],
            'src': x['src'],
            'input': text_in,
            'phonemes': ' '.join(phonemes),
            'd': round(len(a) / SR * 1000),
            't': char_offsets(x['text'], [(t, max(0.0, ts - lead)) for t, ts, _ in toks]),
        }
        with open(meta_path, 'w') as f:
            json.dump(meta, f, ensure_ascii=False)
        done += 1
        if done % 50 == 0:
            print(f'[{idx}] {done}/{len(mine)} ({done / (time.time() - t0):.2f}/sn)', flush=True)
    print(f'[{idx}] bitti: {done} yeni kayıt, {time.time() - t0:.0f} sn', flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('texts')
    ap.add_argument('out_dir')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--skip', help='Bu klasörde .ogg kaydı olan anahtarları atla (ör. public/voice)')
    ap.add_argument('--kind', choices=['word', 'sentence'], help='Yalnızca bu türdeki metinleri seslendir')
    args = ap.parse_args()
    os.makedirs(args.out_dir, exist_ok=True)
    tasks = unique_tasks(json.load(open(args.texts)), args.skip, args.kind)
    print(f'{len(tasks)} metin seslendirilecek, {args.workers} işçi', flush=True)
    procs = [Process(target=worker, args=(i, args.workers, tasks, args.out_dir)) for i in range(args.workers)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
