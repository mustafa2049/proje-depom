import { Pressable, Text, View } from 'react-native';

import type { ReadingPassageSummary } from '../../types/api';
import { Badge } from '../ui/Badge';

export const CATEGORY_LABELS: Record<ReadingPassageSummary['category'], string> = {
  diary: 'Günlük',
  dialogue: 'Diyalog',
  article: 'Makale',
  story: 'Hikaye',
  essay: 'Deneme',
};

export function PassageListItem({ passage, onPress }: { passage: ReadingPassageSummary; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${passage.title}, ${passage.level}`}
      onPress={onPress}
      className="gap-3 rounded-2xl border border-slate-700 bg-surface p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Badge label={passage.level} tone="accent" />
        <Text className="text-xs text-muted">{passage.estimatedMinutes} dk okuma</Text>
      </View>
      <Text className="text-lg font-semibold text-white">{passage.title}</Text>
      <Badge label={CATEGORY_LABELS[passage.category]} tone="muted" />
    </Pressable>
  );
}
