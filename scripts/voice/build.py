"""Üretilen WAV kayıtlarını Ogg Opus'a sıkıştırıp public/voice/ altına koyar ve index.json yazar.

Kullanım: python build.py texts.json wav_dir public/voice [--bitrate 24k]
- texts.json'daki her anahtar için wav_dir'de yeni kayıt varsa .ogg üretilir (yoksa mevcut .ogg korunur).
- Artık kullanılmayan .ogg dosyaları silinir.
- index.json: {"voice", "clips": {anahtar: süre_ms}, "marks": {anahtar: [[karakter, ms], ...]}}
  Kelime zamanları yalnızca vurgulu okunan hikâye ve sahne metinleri için saklanır.
"""
import argparse
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor

MARK_SOURCES = ('story:', 'scene:')


def encode(wav, ogg, bitrate):
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libopus', '-b:a', bitrate, '-vbr', 'on',
         '-application', 'audio', '-ac', '1', '-map_metadata', '-1', '-fflags', '+bitexact', ogg],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('texts')
    ap.add_argument('wav_dir')
    ap.add_argument('voice_dir')
    ap.add_argument('--bitrate', default='24k')
    args = ap.parse_args()
    os.makedirs(args.voice_dir, exist_ok=True)

    items = json.load(open(args.texts))
    wanted = {}
    for x in items:
        wanted.setdefault(x['key'], x)
    index_path = os.path.join(args.voice_dir, 'index.json')
    old = json.load(open(index_path)) if os.path.exists(index_path) else {'clips': {}, 'marks': {}}

    clips, marks, jobs, missing = {}, {}, [], []
    for k, x in wanted.items():
        wav = os.path.join(args.wav_dir, k + '.wav')
        meta_path = os.path.join(args.wav_dir, k + '.json')
        ogg = os.path.join(args.voice_dir, k + '.ogg')
        if os.path.exists(wav) and os.path.exists(meta_path):
            meta = json.load(open(meta_path))
            if not os.path.exists(ogg) or os.path.getmtime(ogg) < os.path.getmtime(wav):
                jobs.append((wav, ogg))
            clips[k] = meta['d']
            if x['src'].startswith(MARK_SOURCES) and meta.get('t'):
                marks[k] = meta['t']
        elif os.path.exists(ogg) and k in old['clips']:
            clips[k] = old['clips'][k]
            if k in old.get('marks', {}):
                marks[k] = old['marks'][k]
        else:
            missing.append(x['text'])

    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as pool:
        list(pool.map(lambda j: encode(j[0], j[1], args.bitrate), jobs))

    removed = 0
    for name in os.listdir(args.voice_dir):
        if name.endswith('.ogg') and name[:-4] not in clips:
            os.remove(os.path.join(args.voice_dir, name))
            removed += 1

    with open(index_path, 'w') as f:
        json.dump({'voice': 'kokoro/af_heart', 'clips': clips, 'marks': marks}, f, separators=(',', ':'))

    size = sum(os.path.getsize(os.path.join(args.voice_dir, n)) for n in os.listdir(args.voice_dir))
    print(f'{len(jobs)} kayıt sıkıştırıldı, {removed} eski kayıt silindi, toplam {len(clips)} kayıt, {size / 1e6:.1f} MB')
    if missing:
        print(f'UYARI: {len(missing)} metnin kaydı yok (cihaz sesiyle okunur), ör.: {missing[:5]}')


if __name__ == '__main__':
    main()
