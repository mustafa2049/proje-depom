# proje-depom

Uçtan uca İngilizce çalışma uygulaması: aralıklı tekrar (SM-2), yapay zeka konuşma pratiği, cümle kurma, interaktif okuyucu ve analitik.

## Yapı

```
apps/
  api/            Backend (Node.js + Prisma + PostgreSQL)
    prisma/       Şema, migrasyonlar, seed verisi
    src/utils/    SM-2 algoritması (srsAlgorithm.ts) ve birim testleri
    src/lib/      Prisma istemcisi
```

Frontend (`apps/mobile-web`) sonraki fazlarda eklenecek.

## API (Faz 2)

Base URL: `http://localhost:3000` · Korumalı uçlar `Authorization: Bearer <accessToken>` ister.

| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Kayıt (`email`, `password`, `name`, `currentLevel?`) → token çifti |
| POST | `/api/auth/login` | Giriş → token çifti |
| POST | `/api/auth/refresh` | `refreshToken` ile yeni token çifti |
| GET | `/api/auth/me` | Profil, seri (`streakCount`), günlük hedef |
| GET | `/api/decks` | Sistem + kendi destelerin, kart sayısı ve `new/learning/review` özeti |
| GET | `/api/decks/:id/cards` | Destenin kartları ve kullanıcının SRS durumu (`limit`, `offset`) |
| POST | `/api/cards` | Kendi destene kart ekle (`deckId` yoksa "Kelimelerim" destesi) |
| GET | `/api/srs/due` | Bugünün kuyruğu: vadesi gelen tekrarlar + günlük kota kadar yeni kart (`limit`, `deckId`) |
| POST | `/api/srs/review` | `{ cardId, quality: 0-3, durationMs }` — SM-2 güncellemesi, oturum ve seri |
| POST | `/api/ai/chat` | `{ sessionId?, scenario, message }` — düzeltme + AI yanıtı |
| POST | `/api/ai/analyze-sentence` | `{ sentence, sourceTR?, context? }` — gramer ve doğallık analizi |
| GET | `/api/ai/sessions` | Sohbet oturumları |
| GET | `/api/ai/sessions/:id` | Oturum ve mesajları |
| GET | `/api/stats/overview` | Seri, öğrenilen kart, doğruluk oranı, 30 günlük ısı haritası, toplam XP |

Hatalar: `{ "error": { "code", "message", "details?" } }` biçimindedir (400/401/403/404/409/429/502).

### Yapay zeka sağlayıcısı

`AI_PROVIDER=auto` (varsayılan): `OPENAI_API_KEY` varsa OpenAI, yoksa `GEMINI_API_KEY` ile Gemini, ikisi de yoksa
deterministik **mock** sağlayıcı kullanılır. Mock, API anahtarı olmadan geliştirme ve testleri mümkün kılar.

### Testler

Entegrasyon testleri ayrı bir veritabanı kullanır (`TEST_DATABASE_URL`):

```bash
# Test veritabanını migrate et (bir kez)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/english_app_test?schema=public" npm run prisma:deploy --workspace @proje-depom/api

npm run api:test
npm run api:typecheck
```

Geliştirme sunucusu: `npm run api:dev`.

## Kurulum (Faz 1)

Gereksinimler: Node.js >= 20.11, Docker (veya yerel PostgreSQL 16).

```bash
# 1. Bağımlılıklar (workspace kökünden)
npm install

# 2. PostgreSQL'i başlat
npm run db:up

# 3. Ortam değişkenleri
cp apps/api/.env.example apps/api/.env

# 4. Migrasyonları uygula ve seed verisini yükle
npm run db:migrate
npm run db:seed

# 5. Testler ve tip kontrolü
npm run api:test
npm run api:typecheck
```
