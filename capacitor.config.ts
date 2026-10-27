import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lexilearn.app',
  appName: 'LexiLearn',
  webDir: 'dist',
  backgroundColor: '#0b1326',
  android: {
    backgroundColor: '#0b1326',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
  },
};

export default config;
