/** API temel adresi. Expo, EXPO_PUBLIC_ öneki olan değişkenleri istemci paketine gömer. */
export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
