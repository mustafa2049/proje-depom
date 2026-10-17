import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { PracticeExercise } from '../../types/api';
import { Button } from '../ui/Button';

type Cloze = Extract<PracticeExercise, { type: 'CLOZE' }>;

interface ClozeExerciseProps {
  exercise: Cloze;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

/** Cümledeki boşluğu 4 şıktan doldurma. Seçim anında doğru/yanlış gösterilir. */
export function ClozeExercise({ exercise, onResult, onNext }: ClozeExerciseProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [before, after] = exercise.sentence.split('___');

  function choose(index: number) {
    if (selected !== null) return;
    setSelected(index);
    onResult(index === exercise.answerIndex);
  }

  return (
    <View className="gap-5">
      <View className="rounded-2xl bg-surface p-5">
        <Text className="text-center text-xl leading-8 text-white">
          {before}
          <Text className="font-bold text-accent">{selected === null ? ' _____ ' : ` ${exercise.options[exercise.answerIndex]} `}</Text>
          {after}
        </Text>
      </View>

      <View className="gap-3">
        {exercise.options.map((option, index) => {
          const isAnswer = index === exercise.answerIndex;
          const isChosen = index === selected;
          const tone =
            selected === null
              ? 'border-slate-700 bg-surface'
              : isAnswer
                ? 'border-success bg-success/15'
                : isChosen
                  ? 'border-danger bg-danger/15'
                  : 'border-slate-700 bg-surface opacity-60';
          return (
            <Pressable
              key={`${option}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={option}
              testID="cloze-option"
              onPress={() => choose(index)}
              className={`rounded-xl border px-4 py-3 ${tone}`}
            >
              <Text className="text-base text-white">{option}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected !== null ? (
        <View className="gap-3 rounded-2xl bg-surface p-4">
          <Text className={`font-semibold ${selected === exercise.answerIndex ? 'text-success' : 'text-danger'}`}>
            {selected === exercise.answerIndex ? 'Doğru!' : 'Yanlış.'}
          </Text>
          <Text className="text-sm text-slate-300">{exercise.explanationTR}</Text>
          <Button title="Sonraki" onPress={onNext} />
        </View>
      ) : null}
    </View>
  );
}
