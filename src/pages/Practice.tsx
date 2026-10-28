import { Link } from 'react-router-dom';
import { TabScreen } from '../components/Layout';
import { cx, Icon } from '../components/ui';
import { useStore } from '../store/AppStore';
import { aiAvailable } from '../lib/ai';
import { leeches } from '../store/selectors';

interface ModuleItem {
  to: string;
  icon: string;
  title: string;
  text: string;
  color: string;
  bg: string;
}

const AI_GROUP = {
  title: 'Yapay Zekâ',
  icon: 'auto_awesome',
  items: [
    { to: '/pratik/sohbet', icon: 'forum', title: 'Sohbet Partneri', text: 'Senaryolu sesli İngilizce konuşma', color: 'text-secondary', bg: 'bg-secondary/15' },
    { to: '/pratik/ai-bosluk', icon: 'auto_awesome', title: 'Akıllı Boşluk Doldurma', text: 'Kelimelerin için her seferinde yeni cümleler', color: 'text-tertiary', bg: 'bg-tertiary/15' },
  ],
};

const GROUPS: { title: string; icon: string; items: ModuleItem[] }[] = [
  {
    title: 'Aktif Hatırlama',
    icon: 'bolt',
    items: [
      { to: '/pratik/quiz', icon: 'quiz', title: 'Aktif Hatırlama Quiz', text: 'Boşluk doldur, dinle-yaz, eşleştir', color: 'text-secondary', bg: 'bg-secondary/15' },
      { to: '/pratik/karistirilan', icon: 'compare_arrows', title: 'Karıştırılan Kelimeler', text: 'Affect vs Effect gibi nüans ayrımı', color: 'text-tertiary', bg: 'bg-tertiary/15' },
      { to: '/pratik/kolokasyon', icon: 'extension', title: 'Kalıp & Kolokasyon İnşa', text: '“Do a decision” tuzağını yık', color: 'text-primary', bg: 'bg-primary/15' },
    ],
  },
  {
    title: 'Bağlam İçinde Öğren',
    icon: 'movie',
    items: [
      { to: '/pratik/replikler', icon: 'movie', title: 'Dizi & Film Replikleri', text: 'Sahne replikleriyle bağlamsal pratik', color: 'text-primary', bg: 'bg-primary/15' },
      { to: '/pratik/hikaye', icon: 'auto_stories', title: 'Mikro Hikaye Okuyucu', text: 'Kutundaki kelimelerle kısa hikayeler', color: 'text-secondary', bg: 'bg-secondary/15' },
      { to: '/pratik/gorsel-sahne', icon: 'map', title: 'Görsel Sahne Sözlüğü', text: 'Görsel üzerinde nesne etiketleme', color: 'text-tertiary', bg: 'bg-tertiary/15' },
      { to: '/pratik/resmiyet', icon: 'thermostat', title: 'Resmiyet & Ton Kaydırıcı', text: 'Hangi ifade nerede söylenir?', color: 'text-primary', bg: 'bg-primary/15' },
    ],
  },
  {
    title: 'Üretim & Konuşma',
    icon: 'record_voice_over',
    items: [
      { to: '/pratik/yazma', icon: 'edit_note', title: '3 Cümlelik Mikro Yazma', text: 'Günün kelimeleriyle günlük yaz', color: 'text-secondary', bg: 'bg-secondary/15' },
      { to: '/pratik/telaffuz', icon: 'mic', title: 'Telaffuz Laboratuvarı', text: 'Kaydet, dinle, karşılaştır', color: 'text-primary', bg: 'bg-primary/15' },
      { to: '/pratik/sesli', icon: 'directions_car', title: 'Eller Serbest Sesli Mod', text: 'Ekrana bakmadan tekrar et', color: 'text-tertiary', bg: 'bg-tertiary/15' },
    ],
  },
  {
    title: 'Derinlemesine',
    icon: 'account_tree',
    items: [
      { to: '/pratik/kok-haritasi', icon: 'account_tree', title: 'Kelime Kökü & Aile Ağacı', text: 'Türevler, eş ve zıt anlamlılar', color: 'text-secondary', bg: 'bg-secondary/15' },
      { to: '/pratik/klinik', icon: 'medical_services', title: 'İnatçı Kelimeler Kliniği', text: 'Sürekli unutulanlara özel müdahale', color: 'text-error', bg: 'bg-error/15' },
    ],
  },
];

export default function Practice() {
  const { state } = useStore();
  const leechCount = leeches(state).length;
  const groups = aiAvailable() ? [AI_GROUP, ...GROUPS] : GROUPS;
  const moduleCount = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <TabScreen subtitle="Pratik">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-surface-container-highest to-surface-container p-space-md shadow-md">
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Pratik Merkezi</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">{moduleCount} Öğrenme Modülü</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Kelimeleri farklı bağlamlarda kullanarak kalıcı hafızaya taşı.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest/60 flex items-center justify-center text-primary shrink-0">
            <Icon name="psychology" size={32} />
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
      </section>

      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-1.5 px-0.5">
            <Icon name={g.icon} size={18} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{g.title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            {g.items.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="relative bg-surface-container rounded-xl p-3.5 flex flex-col gap-2 shadow-sm hover:bg-surface-container-high active:scale-[0.98] transition-all"
              >
                <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center', m.bg, m.color)}>
                  <Icon name={m.icon} size={22} />
                </div>
                <span className="font-label-lg text-label-lg text-on-surface leading-tight">{m.title}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal leading-snug">{m.text}</span>
                {m.to === '/pratik/klinik' && leechCount > 0 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                    {leechCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </TabScreen>
  );
}
