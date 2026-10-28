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
Android'de konuşma tanıma ve (doğal ses kaydı olmayan metinlerde) seslendirme cihazın kendi servisleriyle çalışır.

```bash
npm run build:android                 # web derlemesi + android/ klasörüne kopyalama
cd android && ./gradlew assembleDebug # → android/app/build/outputs/apk/debug/app-debug.apk
```

Gereksinimler: JDK 21 ve Android SDK (platform 36). `android/local.properties` dosyasına
`sdk.dir=/android/sdk/yolu` yazılmalı (veya `ANDROID_HOME` tanımlı olmalı).
APK depodaki sabit hata ayıklama anahtarıyla (`android/app/lexilearn-debug.keystore`) imzalanır;
böylece yeni sürümler eskisinin üzerine, veriler silinmeden kurulabilir. Google Play'e yüklemek için
ayrı bir yayın anahtarı oluşturulmalıdır.

Android'e özgü davranışlar:

- **Geri tuşu:** önce açık pencereyi kapatır, kart oturumunda oturumu kaydedip özete geçer, sohbet
  partnerinde senaryo seçimine döner; diğer ekranlarda bir önceki ekrana gider, ana sayfada uygulamayı arka plana alır.
- **Yedekleme:** WebView dosya indiremediği için yedek ve Anki dosyaları `Belgeler/LexiLearn` klasörüne yazılır ve
  paylaşım menüsü açılır (Drive'a kaydet, WhatsApp vb.).
- **Otomatik yedek** (varsayılan açık): uygulama arka plana alındığında günün yedeği
  `Belgeler/LexiLearn/lexilearn-otomatik-YYYY-AA-GG.json` olarak yazılır; son 7 gün tutulur. Kart yoksa
  (ör. veriler sıfırlandıysa) eski yedeklerin üzerine yazılmaz. Uygulama silinse de dosyalar kalır; Profil →
  Yedekle & Dışa Aktar → Yedekten Geri Yükle ile seçilebilir.

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
- **Seviye yolu** (varsayılan): yeni kelimeler A1 → A2 → B1 → B2 → C1 → C2 sırasıyla gelir; bir seviyenin
  yeni kelimeleri bitmeden sonrakine geçilmez. Seviye içinde konular dönüşümlü sıralanır (günlük konuşma,
  çekirdek, yemek, ev, seyahat…), böylece aynı gün tek bir konuya takılınmaz. Başlangıç seviyesi
  Profil → Ayarlar → Kart Çalışma'dan seçilir (ör. B1 seçilirse A1–A2'nin yeni kelimeleri atlanır);
  "Seçtiğim destelerden" seçeneği eski deste bazlı davranışa döner.
- **Akıllı tekrar aralıkları** (varsayılan açık): her kartın 0.7–1.5 arası bir kolaylık çarpanı vardır.
  Çok Kolay +0.15, Biliyorum +0.05, Unuttum −0.2; Kutu 2–5 aralığı bu çarpanla ölçeklenir (Kutu 1 hep 1 gün).
  Kapatılırsa klasik Leitner aralıkları kullanılır.

**Kart çalışma ayarları** (Profil → Ayarlar → Kart Çalışma):

- **Kartın soru yüzü:** İng → Tür, Tür → İng (ters kart) veya Karışık.
- **Yazarak cevapla:** Kart çevrilmeden önce cevap yazılır; büyük/küçük harf, noktalama, Türkçe karakter
  (ç→c, ı→i…) ve kelime uzunluğuna göre 1–2 harflik yazım hatası tolere edilir.
- **Kelimeyi otomatik seslendir:** İngilizce kelime göründüğünde telaffuz kendiliğinden çalar (ters kartta cevap çevrilince).
- **Günlük hatırlatma** (yalnızca Android): seçilen saatte bildirim; o gün çalışıldıysa bildirim gelmez.

Kart oturumunda yanlış butona basıldıysa üstteki **geri al** (↶, klavyede Backspace) son cevabı kutusu, günlük
sayaçları ve XP'siyle birlikte geri alır. Günün kartları bitince **"+5 yeni kelime daha öğren"** ile günlük
kotadan bağımsız ek tur başlatılabilir.

## Ekranlar

| Bölüm | İçerik |
| --- | --- |
| Ana Sayfa | Günlük plan, seviye yolu kartı (şu anki seviye ve ilerleme), Leitner dağılımı, hızlı modüller, inatçı kelime uyarısı |
| Öğren | Kart oturumu (dokun-çevir, kaydır, klavye: Boşluk / ← / ↑ / →), oturum özeti, seviye listesi ve seviyeye özel çalışma, aktif desteler |
| Pratik | 12 modül + 2 yapay zekâ modülü (aşağıda) |
| Kütüphane | Seviyeler (A1–C2), 14 deste, 2400+ kelime, Türkçe karakter duyarsız arama ("kacinilmaz" → kaçınılmaz), CEFR filtresi, hızlı kelime ekleme |
| Seviye sayfası | Seviyedeki tüm kelimeler (yeni kelimeler tanıtılacakları sırayla), ilerleme, o seviyeden çalışma, "seviye yolumu buradan başlat" |
| Deste sayfası | Destedeki tüm kelimeler; Yeni / Öğreniliyor / Kalıcı filtresi, deste içi arama, günlük plana ekleme |
| Kendi Kelimeni Ekle | Otomatik doldurma, kamera ile metin tarama (OCR), altyazı (.srt/.vtt) analizi |
| Profil | İstatistikler, haftalık harita, önümüzdeki 7 günün tekrar tahmini, son 12 haftanın çalışma takvimi, yapay zekâ koçu, başarımlar, ayarlar, yedekleme / Anki dışa aktarma |

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

Yapay zekâ özellikleri (anahtar ve internet varsa görünür):

| Özellik | Nerede |
| --- | --- |
| **Sohbet Partneri** — 9 senaryoda (kafe, havalimanı, iş görüşmesi…) sesli/yazılı İngilizce konuşma; anlık düzeltme, cevap önerileri, Türkçe çeviri, sonunda karne | Pratik → Yapay Zekâ |
| **Akıllı Boşluk Doldurma** — çalıştığın 8 kelime için her seferinde yeni cümlelerle çoktan seçmeli test | Pratik → Yapay Zekâ |
| **Neden yanlış?** — yazarak cevapta hatanı ve karıştırdığın kelimeyi açıklar | Kart oturumu (yanlış cevap sonrası) |
| **Yeni örnek cümleler** — farklı bağlamlarda cümleler; beğendiğini karta kaydet | Kart arka yüzü, kelime detayı |
| **Kendi cümleni kur** — cümleni puanlar, düzeltir, daha doğal halini önerir | Kart arka yüzü, kelime detayı |
| **Yapay Zekâ Koçu** — son 7 günün istatistiklerinden kişisel haftalık rapor ve plan | Profil |
| **Metinden deste** — yapıştırılan metinden seviyene uygun kelimeleri seçip toplu ekler | Kelime Ekle → Metin (AI) |

Ücretsiz katmanda her modelin dakikalık token sınırı vardır; sınır dolarsa istek otomatik olarak yedek modele
(`gpt-oss-120b` ↔ `gpt-oss-20b`) aktarılır, gerekirse birkaç saniye beklenip yeniden denenir.

Anahtar uygulama içinden de değiştirilebilir: Profil → Ayarlar → Yapay Zekâ (Groq).
Gömülü anahtar APK'dan okunabilir; bu yüzden APK yalnızca kişisel kullanım içindir, paylaşılmamalıdır.

## Okuma sesi

İngilizce metinler önce **doğal sesle** okunur (Profil → Ayarlar → Okuma Sesi):

1. **Hazır kayıtlar:** sözlükteki 2442 kelime, tüm örnek cümleler ve modül metinleri (hikâyeler, film
   replikleri, kalıplar) [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) modeliyle seslendirilip
   `public/voice/` altına Ogg Opus olarak gömülüdür (~20 MB). İnternet gerekmez, anında çalar. Eş yazımlı
   kelimeler (live, close, affect…) sözlükteki türüne göre okunur; hikâyelerde kelime vurgusu kayıttaki
   kelime zamanlarıyla eşlenir. Yeniden üretme adımları: `scripts/voice/README.md`.
2. **Yapay zekâ sesi:** kayıtta olmayan metinler (sohbet partneri, yapay zekâ cümleleri, kendi eklediğin
   kelimeler) çevrimiçiyken Groq Orpheus (`canopylabs/orpheus-v1-english`) ile okunur ve cihazda önbelleğe
   alınır. Modelin kullanım şartlarının Groq hesabında bir kez onaylanması gerekir
   ([console.groq.com](https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english));
   ücretsiz katmanda günde ~100 istek / 3600 karakter sınırı vardır.
3. İkisi de yoksa cihazın ses motoru kullanılır; Ayarlar'dan cihazdaki İngilizce ses seçilebilir.

Telaffuz hızı kayıtlarda da geçerlidir (kayıtlar 0.9x hızında üretildi; perde korunarak hızlandırılır/yavaşlatılır).

## Teknik notlar

- React 19 + TypeScript + Vite + Tailwind CSS; renk ve yazı tipi token'ları `tailwind.config.js` içinde.
- Veriler `localStorage`'da (`lexilearn:state:v1`) tutulur; sunucu ya da hesap gerekmez.
- Doğal ses kaydı olmayan metinlerin okunması ve konuşma tanıma tarayıcının Web Speech API'sini kullanır
  (en iyi Chrome / Edge'de çalışır). Desteklenmeyen tarayıcılarda ilgili butonlar devre dışı kalır veya adım atlanır.
- Kelime otomatik doldurma internet gerektirir: [Free Dictionary API](https://dictionaryapi.dev) (fonetik, örnek)
  ve [MyMemory](https://mymemory.translated.net) (Türkçe çeviri). Sonuçları kaydetmeden önce kontrol edin.
- OCR, [Tesseract.js](https://tesseract.projectnaptha.com) ile cihazda çalışır; ilk kullanımda dil verisi indirilir.
- Mikro yazma analizi kural tabanlıdır (yapay zekâ servisi kullanılmaz): hedef kelime tespiti, büyük harf/noktalama,
  Türkçe kaynaklı kalıp hataları ("do a decision" vb.) ve üst seviye kelime önerileri.

## Sözlük

2442 kelime, 14 deste: Çekirdek (A1–B2), Akademik, İş İngilizcesi, Günlük Konuşma & Deyimler,
Sitcom, Seyahat, Yemek, Sağlık, Teknoloji, Duygular & Kişilik, Ev & Günlük Yaşam, Doğa & Çevre, Phrasal Verbs,
İleri Seviye Kelimeler (C1–C2). Her kelimede IPA okunuşu, Türkçe anlam, CEFR seviyesi ve çevirili örnek cümle bulunur.

| Seviye | Kelime |
| --- | --- |
| A1 Başlangıç | 440 |
| A2 Temel | 506 |
| B1 Orta | 560 |
| B2 Orta Üstü | 464 |
| C1 İleri | 270 |
| C2 Ustalık | 202 |

Seviye yolu için eklenen kelimeler `src/data/vocab/a1.ts` … `c2.ts` dosyalarındadır (her dosyada kelimeler
konu destelerine göre gruplanır); konu dosyaları (`core.ts`, `travel.ts`…) eski sözlüğü taşır.

Yeni kelime eklemek için `src/data/vocab/` altındaki dosyalara satır başına bir kelime yazılır:

```
kelime | /ipa/ | tür | CEFR | Türkçe anlam | Örnek cümle | Örnek çevirisi | eş anlamlılar (;) | kalıplar (;)
```

Tür kodları: `n` isim, `v` fiil, `adj` sıfat, `adv` zarf, `pv` phrasal verb, `idm` deyim, `phr` kalıp,
`conj` bağlaç, `prep` edat. `npm test` yinelenen kelimeleri, eksik çevirileri, örnek cümlenin kelimeyi
içerip içermediğini, her seviyede en az 150 kelime olduğunu ve modüllerde (hikâye, sahne, eşdizim,
karıştırılan kelimeler) geçen kelimelerin sözlükte bulunduğunu otomatik denetler.

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
