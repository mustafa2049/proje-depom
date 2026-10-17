/** API temel adresi. Expo, EXPO_PUBLIC_ öneki olan değişkenleri istemci paketine gömer. */
// Boş değer (ör. tanımsız CI değişkeni) de varsayılana düşer. Kullanıcı adresi uygulama içinden değiştirebilir.
export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
