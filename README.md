# proje-depom

Uçtan uca İngilizce çalışma platformu: aralıklı tekrar (SM-2), yapay zeka destekli konuşma pratiği, cümle kurma laboratuvarı, interaktif okuyucu, istatistikler ve çevrimdışı çalışma. Web ve mobil (Expo) için tek kod tabanı.

## Özellikler

| Faz | Kapsam |
|---|---|
| 1 | Altyapı, Prisma şeması, seed verisi, SM-2 algoritması (paylaşılan paket) |
| 2 | REST API: kimlik doğrulama, desteler/kartlar, SRS kuyruğu ve değerlendirme, AI sohbet, istatistikler |
| 3 | Expo uygulaması: giriş/kayıt, dashboard, 3D flashcard çalışması, klavye kısayolları, çevrimdışı kuyruk |
| 4 | AI Tutor (senaryolar, satır içi gramer geri bildirimi, sesli giriş), Pratik (kelime sıralama, boşluk doldurma, çeviri lab'ı), Okuma (tıklanabilir metin, sözlük, okuduğunu anlama) |
| 5 | Profil ve ayarlar, ısı haritası (90 gün), SRS bellek dağılımı, haftalık trend, çevrimdışı önbellek ve otomatik senkronizasyon, uçtan uca test paketi |
| 6 | Sunucusuz (çevrimdışı) mod, ayarlanabilir sunucu adresi, Android APK (yerel betik + GitHub Actions) |

## Mimari

```
proje-depom/
├── apps/
│   ├── api/                       Backend (Fastify + Prisma + PostgreSQL)
│   │   ├── prisma/                Şema, migrasyonlar, seed (schema.prisma, seed.ts)
│   │   ├── src/
│   │   │   ├── app.ts             buildApp(): eklentiler, rotalar, hata işleyici
│   │   │   ├── server.ts          Dinleme ve kapatma
│   │   │   ├── config/env.ts      Ortam değişkeni doğrulaması (zod)
│   │   │   ├── routes/            /api/auth, decks, cards, srs, ai, stats, reader, practice
│   │   │   ├── controllers/       HTTP katmanı (girdi doğrulama + servis çağrısı)
│   │   │   ├── services/          İş mantığı: auth, deck, srs, stats, reader, practice, LLM sağlayıcıları
│   │   │   ├── middlewares/       JWT doğrulama, oran sınırlama
│   │   │   ├── lib/               Prisma istemcisi, hatalar, parola (scrypt), tarih yardımcıları
│   │   │   └── integration/       Uçtan uca API testleri (gerçek PostgreSQL)
│   │   └── prisma.config.ts
│   └── mobile-web/                Expo SDK 54 uygulaması (iOS, Android, web)
│       └── src/
│           ├── app/               Expo Router ekranları: (auth), (tabs) [index, practice, ai-tutor, reader, profile, study]
│           ├── components/        ui, flashcard, dashboard, ai, practice, reader, stats, sync
│           ├── store/             Zustand: auth, deck, stats, study, tutor, practice, reader, settings
│           ├── services/          API istemcisi (401 → tek refresh), uç noktalar, TTS, depolama, senkronizasyon
│           │   └── local/         Sunucusuz mod: cihaz içi veritabanı, yerel arka uç, kural tabanlı eğitmen
│           ├── hooks/             useOfflineSync
│           └── utils/             Yardımcılar ve saf fonksiyonlar (ısı haritası, tokenizasyon, klavye, ...)
├── packages/
│   └── shared/                    API ve mobil ortak kod: SM-2, XP, istatistik ve alıştırma üreticisi,
│                                  içerik (6 deste / 300 kart, okuma parçaları, alıştırma havuzu)
├── e2e/                           Playwright uçtan uca testleri (tüm fazlar + sunucusuz mod)
├── scripts/                       E2E sunucu başlatıcıları, APK derleme ve imzalama betikleri
├── .github/workflows/             build-android-apk.yml: her push'ta APK üretir
├── playwright.config.ts
└── docker-compose.yml             Yerel PostgreSQL 16
```

**Teknoloji yığını:** TypeScript (strict) · Fastify 5 · Prisma 7 (pg adapter) · PostgreSQL 16 · zod 4 · @fastify/jwt · OpenAI / Gemini / mock LLM · Expo SDK 54 · Expo Router · NativeWind · Reanimated 4 · Zustand 5 · Lucide · Vitest 5 · Playwright Test 1.56.

## Kurulum

Gereksinimler: Node.js ≥ 20.11, Docker (veya yerel PostgreSQL 16).

```bash
npm install                     # tüm workspace'ler
npm run db:up                   # PostgreSQL (docker compose)
cp apps/api/.env.example apps/api/.env
npm run db:migrate              # migrasyonlar
npm run db:seed                 # 6 sistem destesi, 300 kart (packages/shared/src/content/vocabulary/)
```

### Çalıştırma

```bash
npm run api:dev                 # API: http://localhost:3000
npm run mobile:web              # Web geliştirme sunucusu (Expo)
npm run mobile:export           # Statik web çıktısı: apps/mobile-web/dist/
```

### Ortam değişkenleri

`apps/api/.env` (ayrıntılar `.env.example` içinde):

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL bağlantı dizesi (zorunlu) |
| `JWT_SECRET` | — | En az 32 karakter (zorunlu) |
| `ACCESS_TOKEN_TTL_SEC` / `REFRESH_TOKEN_TTL_SEC` | 900 / 2592000 | Token süreleri |
| `CORS_ORIGINS` | `localhost:8081,localhost:19006` | İzin verilen web kökenleri |
| `AI_PROVIDER` | `auto` | `auto` · `openai` · `gemini` · `mock` (auto: OpenAI → Gemini → mock) |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — / `gpt-4o-mini` | OpenAI sağlayıcısı |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | — / `gemini-2.0-flash` | Gemini sağlayıcısı |
| `RATE_LIMIT_ENABLED` | `true` | Oran sınırlamasını açıp kapatır |
| `TEST_DATABASE_URL` | — | Entegrasyon ve E2E testleri için ayrı veritabanı |

`apps/mobile-web/.env.example`: `EXPO_PUBLIC_API_URL` (varsayılan `http://localhost:3000`). Uygulama içinden (giriş ekranı ve Profil → Bağlantı) değiştirilebilir; seçilen adres cihazda saklanır.

## Sunucusuz (çevrimdışı) mod

Giriş ekranındaki **"Sunucusuz (Çevrimdışı) Modda Başla"** düğmesi, uygulamayı hiçbir sunucuya bağlanmadan çalıştırır:

- **İçerik:** 6 sistem destesi (300 kart, A1–B2 ve deyimler), okuma parçaları (A1–C2) ve alıştırma havuzu uygulamaya gömülüdür (`packages/shared`). Kart kimlikleri sunucudaki seed ile aynıdır.
- **Mantık:** SM-2, günlük kuyruk, seri, XP, istatistikler ve alıştırma üretimi sunucuyla aynı ortak kodla çalışır (`apps/mobile-web/src/services/local/localBackend.ts`).
- **Depolama:** ilerleme, kişisel kartlar ve sohbetler tek bir JSON belgesi olarak `AsyncStorage`'da (web: `localStorage`) tutulur; oturum bilgisi `expo-secure-store`'dadır.
- **AI Tutor ve çeviri değerlendirmesi:** yapay zeka yerine kural tabanlı çevrimdışı eğitmen (I/i, he don't, a/an, didn't went, büyük harf, noktalama), senaryo soruları ve referans çeviriyle kelime örtüşmesi puanı kullanılır.
- **Sözlük:** deste kartları (çekimli hâller ve bağlamdaki phrasal verb'ler dahil) ve okuma parçalarının anahtar kelimeleri; bulunamayan kelime için sunucu modu önerilir.

Ekranlar aynı `api` nesnesini kullanır; `services/backendSwitch.ts` istekleri seçili moda göre sunucuya veya cihaz içi arka uca yönlendirir. E-posta ile giriş yapıldığında uygulama sunucu moduna döner; sunucusuz moddaki veriler cihazda kalır ve mod yeniden seçildiğinde kaldığı yerden devam eder. Sunucu modundan kalan çevrimdışı değerlendirmeler cihaz verisine yazılmaz, sunucuya dönülünce gönderilir.

## Android APK

Paket adı `com.englishstudy.app`. `app.json` yerel ağdaki `http://` sunucular için `usesCleartextTraffic` açar (`expo-build-properties`) ve APK'yı gerçek telefonlar için `arm64-v8a` ve `armeabi-v7a` mimarilerine derler. Expo'nun varsayılan olarak eklediği gereksiz izinler (harici depolama, `SYSTEM_ALERT_WINDOW`, biyometri) engellenir; APK yalnızca `INTERNET` ve `VIBRATE` ister. `android/` klasörü depoda tutulmaz; her derlemede `expo prebuild` ile `app.json`'dan üretilir.

**Yerel derleme** (Node 20+, JDK 17+, Android SDK):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
npm run android:apk             # prebuild + ./gradlew assembleRelease → ./english-study-app.apk
```

**GitHub Actions:** `.github/workflows/build-android-apk.yml` her push'ta ve elle (Actions → *Android APK* → *Run workflow*) çalışır; testlerden sonra APK'yı derler, imzalar ve **`english-study-app-apk`** adlı Artifact olarak yükler (30 gün saklanır). İsteğe bağlı ayarlar:

| Ayar | Tür | Açıklama |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Repository variable | APK'nın varsayılan sunucu adresi |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Secrets | Yayın anahtarıyla imzalama. Tanımlı değilse APK prebuild şablonunun varsayılan anahtarıyla imzalanır: telefona kurulabilir ve sonraki sürümler üzerine güncellenebilir, ancak Play Store için kendi anahtarınız gerekir. |

EAS kullanmak isterseniz `apps/mobile-web/eas.json` içindeki `preview` ve `production` profilleri de APK üretir (`eas build -p android --profile preview`).

**Telefonda sunucuya bağlanma:** telefonda `localhost` cihazın kendisidir. Bilgisayarınızda API'yi çalıştırıp giriş ekranındaki "Sunucu Adresi (API URL)" alanına bilgisayarın yerel IP'sini girin (ör. `http://192.168.1.20:3000`); telefon ve bilgisayar aynı Wi-Fi ağında olmalıdır.

## API uç noktaları

Tümü JSON. Korumalı uçlar `Authorization: Bearer <accessToken>` ister. Hatalar: `{ "error": { "code", "message", "details?" } }` (400/401/403/404/409/429/502).

**Kimlik doğrulama** (`/api/auth`)

| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | `/register` | `email`, `password` (≥ 8), `name`, `currentLevel?`, `dailyGoalCards?` → token çifti |
| POST | `/login` | Giriş → token çifti |
| POST | `/refresh` | `refreshToken` ile yeni token çifti |
| GET | `/me` | Profil: seviye, günlük hedef, seri, son çalışma |
| PATCH | `/me` | `name?`, `currentLevel?`, `dailyGoalCards?` (1–200); güncel profili döner |

**Desteler ve kartlar**

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/decks` | Sistem + kendi desteleri, kart sayısı ve `new/learning/review` özeti |
| GET | `/api/decks/:id/cards` | Destenin kartları ve kullanıcının SRS durumu (`limit`, `offset`) |
| POST | `/api/cards` | Kendi destesine kart ekle (`deckId` yoksa "Kelimelerim") |

**SRS** (`/api/srs`)

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/due` | Bugünün kuyruğu: vadesi gelen tekrarlar + günlük yeni kart kotası (`limit`, `deckId`) |
| POST | `/review` | `{ cardId, quality: 0–3, durationMs, reviewedAt? }` — SM-2, oturum, seri |

**Yapay zeka** (`/api/ai`)

| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | `/chat` | `{ sessionId?, scenario, message }` — düzeltme + AI yanıtı |
| POST | `/analyze-sentence` | `{ sentence, sourceTR?, context? }` — skor, düzeltme, doğal alternatif |
| GET | `/sessions` | Sohbet oturumları |
| GET | `/sessions/:id` | Oturum ve mesajları |

**İstatistikler** (`/api/stats`)

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/overview` | Seri, öğrenilen kart, `srsBreakdown` (new/learning/review/relearning), 30 günlük tutma oranı, 90 günlük `heatmap` (yoğunluk 0–4), 7 günlük `weeklyTrend`, toplam XP |

**Okuyucu ve alıştırmalar**

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/reader/passages` | Okuma parçaları (özet), `?level=A1…C2` |
| GET | `/api/reader/passages/:id` | İçerik, anahtar kelimeler, okuduğunu anlama soruları |
| POST | `/api/reader/lookup` | `{ word, contextSentence }` — önce kartlarda (DECK), yoksa bağlamsal AI çözümü (AI) |
| GET | `/api/practice/exercises` | `?level&count` — kelime sıralama, boşluk doldurma (kullanıcı kartlarından dahil), çeviri |

**Diğer:** `GET /health`.

Yoğunluk eşikleri (`heatmap.intensity`): 0 kart → 0, 1–5 → 1, 6–15 → 2, 16–30 → 3, 31+ → 4.

## Testler

```bash
npm test                        # tüm workspace'ler: API (81), mobil (154), paylaşılan paket (36)
npm run typecheck               # tüm workspace'ler + e2e
npm run test:e2e                # Playwright: gerçek API + derlenmiş web uygulaması
```

**Entegrasyon testleri** gerçek PostgreSQL kullanır. Ayrı bir test veritabanı oluşturun ve migrasyonu uygulayın:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/english_app_test?schema=public" npm run prisma:deploy --workspace @proje-depom/api
```

`TEST_DATABASE_URL` tanımlı değilse bu testler atlanır.

**E2E testleri:** `e2e/offline.spec.ts` sunucusuz modu API istekleri engellenmiş tarayıcıda uçtan uca çalıştırır ve hiçbir sunucu isteği yapılmadığını doğrular. `e2e/journey.spec.ts` ise tüm fazları tek bir kullanıcı üzerinden sıralı olarak çalıştırır: kayıt, SRS çalışması, çevrimdışı çalışma ve otomatik senkronizasyon, AI Tutor, okuma, pratik, profil ve ısı haritası, hedef güncelleme, çıkış. Çalıştırma sırasında `scripts/e2e-api.mjs` test veritabanını migrate eder, seed'ler ve API'yi başlatır; `scripts/e2e-web.mjs` web uygulamasını derleyip sunar.

- Tarayıcı: `CHROMIUM_PATH` tanımlıysa o tarayıcı kullanılır; aksi halde `npx playwright install chromium` çalıştırın.
- Raporlar: `playwright-report/` (HTML) ve `test-results/` (izler, ekran görüntüleri) — ikisi de `.gitignore` içindedir.

## Tasarım kararları ve sınırlar

- **SM-2:** Again 10 dakika sonrasına, Hard `1 → 3 → max(interval+1, round(interval×1.2))`, Good/Easy SM-2 kuralları. Günler UTC gün başlangıcına yuvarlanır.
- **Çevrimdışı:** değerlendirme yerel SRS sonucuyla kuyruğa yazılır, `reviewedAt` ile sunucuya iletilir (7 güne kadar geriye dönük). Önbellekteki kuyruk, bekleyen kartları çıkararak çalışmayı sürdürür.
- **Oturum tokenları:** web'de `localStorage`, native'de `expo-secure-store` (web'de şifreleme yoktur). Refresh token'ları durum tutmaz; iptal edilemez.
- **Parola:** Node'un yerleşik `scrypt` ile hash'lenir.
- **Sözlük:** kart kaynağında anlam kartın genel çevirisidir; bağlamsal çeviri yalnızca AI kaynağında gelir.
- **Alıştırma cevapları** istemciye gönderilir (kelime sıralama ve boşluk doldurma doğrulaması istemcide yapılır); öğrenme amaçlı bir uygulama için kabul edilmiştir.
- **Sesli giriş** yalnızca Web Speech API destekleyen web tarayıcılarında çalışır.
- **Sunucusuz mod:** veriler yalnızca o cihazdadır; sunucu hesabıyla eşitlenmez. Çevrimdışı eğitmen yaygın hataları yakalar ama bir dil modelinin yerini tutmaz; çeviri değerlendirmesi referans çeviriye benzerliği ölçtüğü için farklı ama doğru çeviriler düşük puan alabilir.
- **LLM:** gerçek OpenAI/Gemini çağrıları anahtar gerektirir; testler ve E2E mock sağlayıcıyla çalışır.
- **Güvenlik:** `npm audit` uyarıları Expo SDK 54 araç zincirinden (Expo CLI, Metro, Jest) gelir; uygulama paketine girmez. Düzeltmek Expo'nun büyük sürüm güncellemesini gerektirir.

## Faz geçmişi

`git log --oneline` ile tüm commit'ler: Faz 1 (`825a5c7`), Faz 2 (`0552434`), Faz 3 (`da94efb`), Faz 4 (`bf8feb2`), Faz 5 (`f70a3a1`), 300 kartlık kelime havuzu (`27dafac`), Faz 6 — sunucusuz mod ve Android APK (bu sürümün commit'i).
