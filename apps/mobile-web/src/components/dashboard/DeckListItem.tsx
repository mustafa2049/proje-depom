import { Text, View } from 'react-native';

import type { DeckSummary } from '../../types/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DeckListItemProps {
  deck: DeckSummary;
  onStart: () => void;
}

export function DeckListItem({ deck, onStart }: DeckListItemProps) {
  return (
    <View className="gap-3 rounded-2xl border border-slate-700 bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-white">{deck.title}</Text>
          {deck.description ? <Text className="text-sm text-muted">{deck.description}</Text> : null}
          <Text className="text-xs text-muted">{deck.cardCount} kart</Text>
        </View>
        <Badge label={deck.level} tone="accent" />
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <Badge label={`Yeni ${deck.progress.new}`} tone="muted" />
        <Badge label={`Öğreniliyor ${deck.progress.learning}`} tone="warning" />
        <Badge label={`Tekrar ${deck.progress.review}`} tone="success" />
      </View>

      <Button title="Bu desteyle başla" variant="secondary" onPress={onStart} />
    </View>
  );
}
