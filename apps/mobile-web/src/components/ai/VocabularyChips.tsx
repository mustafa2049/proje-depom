import { Pressable, Text, View } from 'react-native';

import type { VocabularyItem } from '../../types/api';
import { cleanWord } from '../../utils/tokenize';

interface VocabularyChipsProps {
  items: VocabularyItem[];
  savedTerms: string[];
  onSave: (item: VocabularyItem) => void;
}

/** AI yanıtından çıkarılan kelimeler; her biri tek dokunuşla kişisel desteye eklenir. */
export function VocabularyChips({ items, savedTerms, onSave }: VocabularyChipsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className="max-w-[90%] gap-2 self-start">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Yeni kelimeler</Text>
      {items.map((item) => {
        const saved = savedTerms.includes(cleanWord(item.term));
        return (
          <View key={item.term} className="flex-row items-center justify-between gap-3 rounded-xl border border-slate-700 bg-bg px-3 py-2">
            <View className="flex-1">
              <Text className="font-semibold text-white">{item.term}</Text>
              <Text className="text-xs text-muted">{item.translationTR}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: saved }}
              disabled={saved}
              onPress={() => onSave(item)}
              className={`rounded-lg px-3 py-1.5 ${saved ? 'bg-success/20' : 'bg-accent/20'}`}
            >
              <Text className={`text-xs font-semibold ${saved ? 'text-success' : 'text-accent'}`}>
                {saved ? 'Eklendi ✓' : '+ Desteme Ekle'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
