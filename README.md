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

Frontend (`apps/mobile-web`) ve API uç noktaları sonraki fazlarda eklenecek.

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
