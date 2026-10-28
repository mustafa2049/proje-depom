/**
 * Dosya kaydetme ve yedekleme. Tarayıcıda dosya indirilir; Android uygulamasında WebView indirme
 * desteklemediği için dosya Belgeler/LexiLearn klasörüne yazılır ve paylaşım menüsü açılır
 * (Drive'a kaydet, WhatsApp'la gönder vb.).
 *
 * Otomatik yedek: uygulama arka plana alındığında güncel veri Belgeler/LexiLearn klasörüne günlük
 * dosya olarak yazılır. Uygulama silinse bile bu dosyalar kalır; "Yedekten Geri Yükle" ile seçilebilir.
 */

import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { dayKey } from './leitner';
import type { AppState } from './types';

const FOLDER = 'LexiLearn';
const AUTO_PREFIX = 'lexilearn-otomatik-';
/** Son kaç günün otomatik yedeği saklanır */
const AUTO_KEEP = 7;
const LAST_AUTO_KEY = 'lexilearn:lastAutoBackup';

export const nativeFiles = Capacitor.isNativePlatform();

function download(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Dosyayı kaydeder ve (Android'de) paylaşım menüsünü açar.
 * Dönüş: kullanıcıya gösterilecek konum açıklaması.
 */
export async function saveFile(name: string, content: string, mime: string): Promise<string> {
  if (!nativeFiles) {
    download(name, content, mime);
    return 'İndirilenler klasörüne kaydedildi';
  }
  let uri: string;
  let where: string;
  try {
    const r = await Filesystem.writeFile({ path: `${FOLDER}/${name}`, data: content, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
    uri = r.uri;
    where = `Belgeler/${FOLDER} klasörüne kaydedildi`;
  } catch {
    // Ortak klasöre yazılamıyorsa (eski Android, izin yok) yalnızca paylaşım için geçici dosya kullan
    const r = await Filesystem.writeFile({ path: name, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 });
    uri = r.uri;
    where = 'Paylaşım menüsünden kaydedebilirsin';
  }
  await Share.share({ title: name, files: [uri], dialogTitle: 'Dosyayı kaydet veya paylaş' }).catch(() => {
    // Kullanıcı paylaşımı kapattıysa dosya yine de kaydedildi.
  });
  return where;
}

export function backupJson(state: AppState): string {
  return JSON.stringify(state);
}

export function lastAutoBackup(): number | null {
  try {
    const v = Number(localStorage.getItem(LAST_AUTO_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

/**
 * Günün otomatik yedeğini yazar/günceller (yalnızca Android). Kart yoksa (ör. veriler sıfırlandıysa)
 * eski yedeklerin üzerine boş veri yazılmasın diye atlanır. Önceki günlerin dosyaları korunur; en eski
 * dosyalar silinerek son 7 gün tutulur. İzin istemez: izin yoksa sessizce vazgeçer.
 */
export async function autoBackup(state: AppState): Promise<boolean> {
  if (!nativeFiles || !state.profile.autoBackup || !Object.keys(state.cards).length) return false;
  try {
    const perm = await Filesystem.checkPermissions();
    if (perm.publicStorage !== 'granted') return false;
    await Filesystem.writeFile({
      path: `${FOLDER}/${AUTO_PREFIX}${dayKey()}.json`,
      data: backupJson(state),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    try {
      localStorage.setItem(LAST_AUTO_KEY, String(Date.now()));
    } catch {
      // Zaman damgası yalnızca bilgi amaçlı.
    }
    const { files } = await Filesystem.readdir({ path: FOLDER, directory: Directory.Documents });
    const old = files
      .map((f) => f.name)
      .filter((n) => n.startsWith(AUTO_PREFIX))
      .sort()
      .slice(0, -AUTO_KEEP);
    await Promise.all(old.map((n) => Filesystem.deleteFile({ path: `${FOLDER}/${n}`, directory: Directory.Documents }).catch(() => {})));
    return true;
  } catch {
    return false;
  }
}
