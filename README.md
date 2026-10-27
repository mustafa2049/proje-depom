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

## Android (APK)

Uygulama [Capacitor](https://capacitorjs.com) ile Android'e paketlenir (`android/` klasörü).
Android'de seslendirme ve konuşma tanıma cihazın kendi servisleriyle çalışır.

```bash
npm run build:android                 # web derlemesi + android/ klasörüne kopyalama
cd android && ./gradlew assembleDebug # → android/app/build/outputs/apk/debug/app-debug.apk
```

Gereksinimler: JDK 21 ve Android SDK (platform 36). `android/local.properties` dosyasına
`sdk.dir=/android/sdk/yolu` yazılmalı (veya `ANDROID_HOME` tanımlı olmalı).
APK depodaki sabit hata ayıklama anahtarıyla (`android/app/lexilearn-debug.keystore`) imzalanır;
böylece yeni sürümler eskisinin üzerine, veriler silinmeden kurulabilir. Google Play'e yüklemek için
ayrı bir yayın anahtarı oluşturulmalıdır.

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
- **Akıllı tekrar aralıkları** (varsayılan açık): her kartın 0.7–1.5 arası bir kolaylık çarpanı vardır.
  Çok Kolay +0.15, Biliyorum +0.05, Unuttum −0.2; Kutu 2–5 aralığı bu çarpanla ölçeklenir (Kutu 1 hep 1 gün).
  Kapatılırsa klasik Leitner aralıkları kullanılır.

**Kart çalışma ayarları** (Profil → Ayarlar → Kart Çalışma):

- **Kartın soru yüzü:** İng → Tür, Tür → İng (ters kart) veya Karışık.
- **Yazarak cevapla:** Kart çevrilmeden önce cevap yazılır; büyük/küçük harf, noktalama, Türkçe karakter
  (ç→c, ı→i…) ve kelime uzunluğuna göre 1–2 harflik yazım hatası tolere edilir.
- **Günlük hatırlatma** (yalnızca Android): seçilen saatte bildirim; o gün çalışıldıysa bildirim gelmez.

## Ekranlar

| Bölüm | İçerik |
| --- | --- |
| Ana Sayfa | Günlük plan, Leitner dağılımı, hızlı modüller, inatçı kelime uyarısı |
| Öğren | Kart oturumu (dokun-çevir, kaydır, klavye: Boşluk / ← / ↑ / →), oturum özeti, aktif desteler |
| Pratik | 12 modül (aşağıda) |
| Kütüphane | 14 deste, 1000+ kelime, arama, CEFR filtresi, hızlı kelime ekleme |
| Kendi Kelimeni Ekle | Otomatik doldurma, kamera ile metin tarama (OCR), altyazı (.srt/.vtt) analizi |
| Profil | İstatistikler, haftalık harita, başarımlar, ayarlar, JSON yedek / Anki dışa aktarma |

**Pratik modülleri:** Aktif Hatırlama Quiz · Karıştırılan Kelimeler · Kalıp & Kolokasyon · Dizi & Film Replikleri ·
Mikro Hikaye Okuyucu · Görsel Sahne Sözlüğü · Resmiyet & Ton · 3 Cümlelik Mikro Yazma · Telaffuz Laboratuvarı ·
Eller Serbest Sesli Mod · Kelime Kökü & Aile Ağacı · İnatçı Kelimeler Kliniği

## Yapay zekâ (Groq)

Mikro yazma geri bildirimi, kelime doldurma, kişisel hikaye üretimi, hafıza ipucu ve Whisper ile telaffuz tanıma
[Groq](https://console.groq.com) üzerinden çalışır (ücretsiz katman yeterlidir). Anahtar yoksa veya internet
kesikse uygulama kural tabanlı / çevrimdışı yöntemlerle çalışmaya devam eder.

Anahtar derleme sırasında `.env.local` dosyasından okunup uygulamaya gömülür; bu dosya `.gitignore`'dadır ve
depoya **gönderilmez**:

```bash
cp .env.example .env.local   # sonra VITE_GROQ_API_KEY=gsk_... satırını doldurun
```

Anahtar uygulama içinden de değiştirilebilir: Profil → Ayarlar → Yapay Zekâ (Groq).
Gömülü anahtar APK'dan okunabilir; bu yüzden APK yalnızca kişisel kullanım içindir, paylaşılmamalıdır.

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

## Sözlük

1000'den fazla kelime, 14 deste: Çekirdek (A1–B1), Akademik, İş İngilizcesi, Günlük Konuşma & Deyimler,
Sitcom, Seyahat, Yemek, Sağlık, Teknoloji, Duygular & Kişilik, Ev & Günlük Yaşam, Doğa & Çevre, Phrasal Verbs.
Her kelimede IPA okunuşu, Türkçe anlam, CEFR seviyesi ve çevirili örnek cümle bulunur.

Yeni kelime eklemek için `src/data/vocab/` altındaki dosyalara satır başına bir kelime yazılır:

```
kelime | /ipa/ | tür | CEFR | Türkçe anlam | Örnek cümle | Örnek çevirisi | eş anlamlılar (;) | kalıplar (;)
```

Tür kodları: `n` isim, `v` fiil, `adj` sıfat, `adv` zarf, `pv` phrasal verb, `idm` deyim, `phr` kalıp,
`conj` bağlaç, `prep` edat. `npm test` yinelenen kelimeleri, eksik çevirileri ve örnek cümlenin kelimeyi
içerip içermediğini otomatik denetler.

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
