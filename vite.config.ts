/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Göreli base: uygulama GitHub Pages gibi bir alt dizinde de çalışır (HashRouter kullanılıyor).
// Android (Capacitor) derlemesinde service worker gerekmez; dosyalar zaten uygulamanın içindedir.
const isNative = process.env.CAPACITOR === '1';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    !isNative &&
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/*'],
      manifest: {
        name: 'LexiLearn — Leitner Kelime Kartları',
        short_name: 'LexiLearn',
        description: 'Leitner aralıklı tekrar sistemiyle İngilizce kelime öğren.',
        lang: 'tr',
        theme_color: '#0b1326',
        background_color: '#0b1326',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'images/app-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2,webmanifest}'],
        // Material Symbols yazı tipi ~4 MB; çevrimdışı ikonlar için önbelleğe alınmalı.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // ~5000 ses kaydı ön belleğe alınmaz; çalındıkça saklanır (adları metnin özeti olduğundan değişmez).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/voice/') && url.pathname.endsWith('.ogg'),
            handler: 'CacheFirst',
            options: { cacheName: 'lexilearn-voice', expiration: { maxEntries: 6000 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/voice/index.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'lexilearn-voice-index' },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
