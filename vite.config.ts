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
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
