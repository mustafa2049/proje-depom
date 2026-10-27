# LexiLearn — Leitner Kelime Kartları

Leitner aralıklı tekrar sistemiyle İngilizce kelime öğrenme uygulaması. Arayüz, `design/stitch/` klasöründeki
Stitch tasarımlarından (19 ekran + `DESIGN.md` tasarım sistemi) birebir uyarlanmıştır.

Telefona kurulabilir bir web uygulamasıdır (PWA): internet olmadan da çalışır ve tüm ilerleme cihazda saklanır.

## Çalıştırma

```bash
npm install
npm run dev       # geliştirme sunucusu → http://localhost:5173
npm run build     # üretim derlemesi → dist/
npm run preview   # derlenmiş sürümü önizle
npm test          # birim testleri
```

`dist/` klasörü herhangi bir statik sunucuya (GitHub Pages, Netlify, Vercel…) olduğu gibi yüklenebilir.
Yönlendirme `#/` tabanlı olduğu için ek sunucu ayarı gerekmez.

## Leitner Sistemi

| Kutu | Tekrar aralığı | Anlamı |
| --- | --- | --- |
| 1 | Her gün | Yeni veya zorlanan kelimeler |
| 2 | 2 gün | İlk kavrama |
| 3 | 5 gün | Gelişen hatırlama |
| 4 | 14 gün | Güçlü bağlantı |
| 5 | 30 gün | Kalıcı bellek |

- **Biliyorum** → bir üst kutu, **Çok Kolay** → Kutu 5, **Unuttum** → Kutu 1.
- Arka arkaya 4 kez unutulan kelimeler **İnatçı Kelimeler Kliniği**ne düşer.
- Günlük plan: önce vadesi gelen tekrarlar, sonra günlük kota kadar yeni kelime (Profil → Ayarlar).

## Ekranlar

| Bölüm | İçerik |
| --- | --- |
| Ana Sayfa | Günlük plan, Leitner dağılımı, hızlı modüller, inatçı kelime uyarısı |
| Öğren | Kart oturumu (dokun-çevir, kaydır, klavye: Boşluk / ← / ↑ / →), oturum özeti, aktif desteler |
| Pratik | 12 modül (aşağıda) |
| Kütüphane | Desteler, arama, CEFR filtresi, hızlı kelime ekleme |
| Kendi Kelimeni Ekle | Otomatik doldurma, kamera ile metin tarama (OCR), altyazı (.srt/.vtt) analizi |
| Profil | İstatistikler, haftalık harita, başarımlar, ayarlar, JSON yedek / Anki dışa aktarma |

**Pratik modülleri:** Aktif Hatırlama Quiz · Karıştırılan Kelimeler · Kalıp & Kolokasyon · Dizi & Film Replikleri ·
Mikro Hikaye Okuyucu · Görsel Sahne Sözlüğü · Resmiyet & Ton · 3 Cümlelik Mikro Yazma · Telaffuz Laboratuvarı ·
Eller Serbest Sesli Mod · Kelime Kökü & Aile Ağacı · İnatçı Kelimeler Kliniği

## Teknik notlar

- React 19 + TypeScript + Vite + Tailwind CSS; renk ve yazı tipi token'ları `tailwind.config.js` içinde.
- Veriler `localStorage`'da (`lexilearn:state:v1`) tutulur; sunucu ya da hesap gerekmez.
- Telaffuz ve konuşma tanıma tarayıcının Web Speech API'sini kullanır (en iyi Chrome / Edge'de çalışır).
  Desteklenmeyen tarayıcılarda ilgili butonlar devre dışı kalır veya adım atlanır.
- Kelime otomatik doldurma internet gerektirir: [Free Dictionary API](https://dictionaryapi.dev) (fonetik, örnek)
  ve [MyMemory](https://mymemory.translated.net) (Türkçe çeviri). Sonuçları kaydetmeden önce kontrol edin.
- OCR, [Tesseract.js](https://tesseract.projectnaptha.com) ile cihazda çalışır; ilk kullanımda dil verisi indirilir.
- Mikro yazma analizi kural tabanlıdır (yapay zekâ servisi kullanılmaz): hedef kelime tespiti, büyük harf/noktalama,
  Türkçe kaynaklı kalıp hataları ("do a decision" vb.) ve üst seviye kelime önerileri.

## Klasör yapısı

```
src/
  components/   Ortak arayüz parçaları (kart, üst bar, alt menü, bildirim)
  data/         Kelime veritabanı, desteler ve modül içerikleri
  lib/          Leitner algoritması, konuşma, sözlük, metin analizi
  store/        Uygulama durumu (reducer + seçiciler)
  pages/        Ekranlar (pages/practice/ altında 12 modül)
design/stitch/  Orijinal Stitch tasarım dosyaları
```
