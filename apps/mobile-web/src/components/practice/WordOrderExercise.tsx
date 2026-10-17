import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { PracticeExercise } from '../../types/api';
import { checkWordOrder, placeWord, returnWord, toChips, type Chip as WordChip } from '../../utils/sentenceBuilder';
import { Button } from '../ui/Button';

type WordOrder = Extract<PracticeExercise, { type: 'WORD_ORDER' }>;

interface WordOrderExerciseProps {
  exercise: WordOrder;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

/** Karışık kelimeleri tıklayarak doğru sıraya dizme. Yanlışsa tek tek geri alınabilir. */
export function WordOrderExercise({ exercise, onResult, onNext }: WordOrderExerciseProps) {
  const [bank, setBank] = useState<WordChip[]>(() => toChips(exercise.words));
  const [placed, setPlaced] = useState<WordChip[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);

  function place(id: string) {
    if (checked !== null) return;
    const next = placeWord(bank, placed, id);
    setBank(next.bank);
    setPlaced(next.placed);
  }

  function undo(id: string) {
    if (checked !== null) return;
    const next = returnWord(bank, placed, id);
    setBank(next.bank);
    setPlaced(next.placed);
  }

  function check() {
    const correct = checkWordOrder(
      placed.map((chip) => chip.word),
      exercise.answer,
    );
    setChecked(correct);
    onResult(correct);
  }

  function undoLast() {
    const last = placed[placed.length - 1];
    if (last) undo(last.id);
  }

  return (
    <View className="gap-5">
      <Text className="text-center text-base text-muted">Türkçe: <Text className="font-semibold text-white">{exercise.translationTR}</Text></Text>

      <View className="min-h-[72px] flex-row flex-wrap gap-2 rounded-2xl border border-dashed border-slate-600 bg-surface p-3">
        {placed.length === 0 ? <Text className="text-sm text-muted">Kelimelere dokunarak cümleyi kur</Text> : null}
        {placed.map((chip) => (
          <WordTile key={chip.id} label={chip.word} onPress={() => undo(chip.id)} tone="placed" testID="word-placed" />
        ))}
      </View>

      <View className="flex-row flex-wrap gap-2">
        {bank.map((chip) => (
          <WordTile key={chip.id} label={chip.word} onPress={() => place(chip.id)} tone="bank" testID="word-bank" />
        ))}
      </View>

      {checked === null ? (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button title="Geri al" variant="secondary" onPress={undoLast} disabled={placed.length === 0} />
          </View>
          <View className="flex-1">
            <Button title="Kontrol Et" onPress={check} disabled={placed.length !== exercise.words.length} testID="word-check" />
          </View>
        </View>
      ) : (
        <View className="gap-3 rounded-2xl bg-surface p-4">
          <Text className={`text-base font-semibold ${checked ? 'text-success' : 'text-danger'}`}>
            {checked ? 'Doğru! Harika.' : 'Olmadı, doğru cümle aşağıda:'}
          </Text>
          {!checked ? <Text className="text-base text-white">{exercise.answer}</Text> : null}
          <Button title="Sonraki" onPress={onNext} />
        </View>
      )}
    </View>
  );
}

function WordTile({ label, onPress, tone, testID }: { label: string; onPress: () => void; tone: 'bank' | 'placed'; testID: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`rounded-xl border px-3 py-2 ${tone === 'bank' ? 'border-slate-600 bg-bg' : 'border-accent bg-accent/15'}`}
    >
      <Text className={`text-base ${tone === 'bank' ? 'text-white' : 'text-accent'}`}>{label}</Text>
    </Pressable>
  );
}
