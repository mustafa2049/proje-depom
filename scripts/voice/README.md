# Doğal ses kayıtları

Uygulamadaki sabit İngilizce metinler (2442 kelime, örnek cümleler, hikâye/sahne/kalıp metinleri)
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0) modeliyle, `af_heart` sesiyle
önceden seslendirilir ve `public/voice/<anahtar>.ogg` olarak uygulamaya gömülür. Anahtar, metnin
normalize edilmiş halinin cyrb53 özetidir (`src/lib/voice.ts` → `voiceKey`). Uygulama okunacak metnin
anahtarı `public/voice/index.json` içinde varsa kaydı çalar, yoksa yapay zekâ sesine (Groq Orpheus)
veya cihaz sesine döner.

Eş yazımlı kelimelerde (live, close, affect, record…) sözlükteki türe uyan okunuş seçilir.
Kayıtlar Kokoro'nun 0.9 hızında üretilir; uygulamadaki varsayılan telaffuz hızı (0.9x) bu doğal hıza denk gelir.

## Yeniden üretme (yeni kelime eklendiğinde)

Gereken: Python 3.12, ffmpeg (libopus). Kayıt eklenmemiş kelimeler cihaz sesiyle okunur; `npm test`
her sözlük kelimesi ve örnek cümlenin kaydı olduğunu denetler.

```bash
python3.12 -m venv .venv-voice
.venv-voice/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv-voice/bin/pip install -r scripts/voice/requirements.txt

# 1) Okunan metinleri dışa aktar
VOICE_EXPORT=/tmp/voice-texts.json npx vitest run scripts/voice/export-texts.test.ts
# 2) Yalnızca kaydı olmayanları seslendir (4 çekirdekte ~3 metin/sn)
.venv-voice/bin/python scripts/voice/gen.py /tmp/voice-texts.json /tmp/voice-wav --skip public/voice
# 3) Ogg Opus'a sıkıştır, index.json'ı güncelle, kullanılmayan kayıtları sil
python3 scripts/voice/build.py /tmp/voice-texts.json /tmp/voice-wav public/voice
```
