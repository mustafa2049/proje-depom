/** Milisaniyeyi "1 dk 05 sn" biçiminde gösterir. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds} sn`;
  }
  return `${minutes} dk ${String(seconds).padStart(2, '0')} sn`;
}

/** Doğruluk yüzdesi (0-100, tam sayı). Hiç değerlendirme yoksa 0. */
export function accuracyPercent(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}
