# Akrep & Yelkovan

Cam efektli (glassmorphism), koyu temalı, canlı çalışan modern analog saat web uygulaması.
Zaman verisi tarayıcının bulunduğu **yerel sistem saatinden** anlık olarak okunur.

## Özellikler

- **Analog kadran** — SVG ile çizilmiş 60 dakika taksimatı, çeyrek noktalarda pirinç vurgular,
  akrep / yelkovan / saniye ibreleri ve karşı ağırlıklı saniye ibresi.
- **Kesintisiz hareket** — ibreler `requestAnimationFrame` ile milisaniye hassasiyetinde
  süzülerek döner (tik tik atlamaz); kadran kenarındaki pirinç yay saniyeyi takip eder.
- **Kristal parlaması** — saniye ibresiyle birlikte dönen konik ışık yansıması.
- **Dijital okuma** — `SS:DD:SN` biçiminde tabular rakamlarla, kadranla aynı tipografik dilde.
- **Tam tarih** — `12 Eylül 2026 · Cumartesi` — Türkçe yerelleştirme (`Intl`, `tr-TR`).
- **Saat dilimi** — IANA bölge adı ve UTC farkı üst satırda.
- **Gün ilerlemesi** — günün yüzde kaçının geçtiğini gösteren ince şerit.
- **Duyarlı** — telefondan geniş ekrana kadar tam merkezde; yatay dar ekranlar için ayrı ölçek.
- **Erişilebilirlik** — `prefers-reduced-motion` açıkken animasyonlar durur, saat saniyede
  bir adımla güncellenir.

## Çalıştırma

```sh
./baslat.sh          # yerel sunucuyu başlatır ve varsayılan tarayıcıda açar
python3 baslat.py    # aynısı, doğrudan Python ile
python3 baslat.py 8080
```

Sunucu istemiyorsanız `index.html` dosyasını doğrudan tarayıcıda açmanız da yeterlidir.

## Dosya yapısı

```
index.html              sayfa iskeleti + SVG kadran tanımları
assets/css/style.css    tasarım token'ları, cam panel, kadran ve tipografi
assets/js/clock.js      kadran üretimi, zaman döngüsü, Türkçe tarih biçimlendirme
baslat.py / baslat.sh   yerel sunucu + tarayıcı başlatıcı
```

Bağımlılık yok, derleme adımı yok. Tek dış kaynak Google Fonts
(`Instrument Sans`, `Geist Mono`); çevrimdışı kullanımda sistem yazı tiplerine düşer.
