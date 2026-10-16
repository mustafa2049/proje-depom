import { Pressable, Text, View } from 'react-native';
import type { IntervalPreview, ReviewQuality } from '@proje-depom/shared';

interface SRSButtonsProps {
  isFlipped: boolean;
  previews: IntervalPreview[];
  disabled: boolean;
  onShowAnswer: () => void;
  onReview: (quality: ReviewQuality) => void;
}

const BUTTONS: Array<{ quality: ReviewQuality; title: string; key: string; color: string; textClass: string }> = [
  { quality: 0, title: 'Tekrar (1)', key: 'again', color: 'bg-danger', textClass: 'text-white' },
  { quality: 1, title: 'Zor (2)', key: 'hard', color: 'bg-warning', textClass: 'text-bg' },
  { quality: 2, title: 'İyi (3)', key: 'good', color: 'bg-success', textClass: 'text-bg' },
  { quality: 3, title: 'Kolay (4)', key: 'easy', color: 'bg-accent', textClass: 'text-bg' },
];

/**
 * Kart çevrilmeden yalnızca "Cevabı Göster" görünür; çevrildikten sonra dört değerlendirme butonu
 * ve her birinin bir sonraki tekrar süresi (önizleme) gösterilir.
 */
export function SRSButtons({ isFlipped, previews, disabled, onShowAnswer, onReview }: SRSButtonsProps) {
  if (!isFlipped) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cevabı göster"
        onPress={onShowAnswer}
        className="w-full max-w-md self-center rounded-2xl border border-accent/50 bg-surface py-4"
      >
        <Text className="text-center text-base font-semibold text-accent">Cevabı Göster (Space)</Text>
      </Pressable>
    );
  }

  return (
    <View className="w-full max-w-md flex-row flex-wrap justify-center gap-2 self-center">
      {BUTTONS.map((button) => {
        const preview = previews.find((item) => item.quality === button.quality);
        return (
          <Pressable
            key={button.key}
            accessibilityRole="button"
            accessibilityLabel={`${button.title}, sonraki tekrar ${preview?.label ?? ''}`}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onReview(button.quality)}
            className={`min-w-[46%] flex-1 items-center rounded-2xl px-3 py-3 ${button.color} ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
          >
            <Text className={`text-sm font-bold ${button.textClass}`}>{button.title}</Text>
            <Text className={`mt-0.5 text-xs ${button.textClass}`}>{preview?.label ?? '—'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
