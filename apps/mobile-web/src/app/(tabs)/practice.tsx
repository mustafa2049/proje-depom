import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClozeExercise } from '../../components/practice/ClozeExercise';
import { TranslationLab } from '../../components/practice/TranslationLab';
import { WordOrderExercise } from '../../components/practice/WordOrderExercise';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { usePracticeStore, selectCurrentExercise, selectModeCount } from '../../store/usePracticeStore';
import type { CEFRLevel, PracticeType } from '../../types/api';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const MODES: Array<{ value: PracticeType; label: string }> = [
  { value: 'WORD_ORDER', label: 'Kelime Sıralama' },
  { value: 'CLOZE', label: 'Boşluk Doldurma' },
  { value: 'TRANSLATION', label: 'Çeviri Lab' },
];

/** Cümle kurma ve gramer laboratuvarı: üç modlu, seviyeye duyarlı alıştırma seti. */
export default function PracticeScreen() {
  const level = usePracticeStore((state) => state.level);
  const status = usePracticeStore((state) => state.status);
  const errorMessage = usePracticeStore((state) => state.errorMessage);
  const exercises = usePracticeStore((state) => state.exercises);
  const cursor = usePracticeStore((state) => state.cursor);
  const scores = usePracticeStore((state) => state.scores);
  const lastAnalysis = usePracticeStore((state) => state.lastAnalysis);
  const isEvaluating = usePracticeStore((state) => state.isEvaluating);
  const loadExercises = usePracticeStore((state) => state.loadExercises);
  const recordResult = usePracticeStore((state) => state.recordResult);
  const advance = usePracticeStore((state) => state.advance);
  const evaluateTranslation = usePracticeStore((state) => state.evaluateTranslation);

  const [mode, setMode] = useState<PracticeType>('WORD_ORDER');
  const snapshot = { exercises, cursor };
  const current = selectCurrentExercise(snapshot, mode);
  const total = selectModeCount(snapshot, mode);
  const score = scores[mode];

  useEffect(() => {
    if (status === 'idle') {
      void loadExercises();
    }
  }, [status, loadExercises]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-10 pt-4">
        <Text className="text-2xl font-bold text-white" accessibilityRole="header">Pratik</Text>

        <View className="flex-row flex-wrap gap-2">
          {LEVELS.map((item) => (
            <Chip key={item} label={item} active={level === item} onPress={() => void loadExercises(item)} />
          ))}
        </View>

        <SegmentedControl options={MODES} value={mode} onChange={setMode} />

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            {total > 0 ? `${Math.min(cursor[mode] + 1, total)} / ${total}` : ''} · Doğru: {score.correct}/{score.attempted}
          </Text>
          <Button title="Yeni set" variant="secondary" onPress={() => void loadExercises(level ?? undefined)} />
        </View>

        {status === 'loading' || status === 'idle' ? <ActivityIndicator color="#38BDF8" /> : null}
        {status === 'error' ? <Text className="text-danger">{errorMessage ?? 'Alıştırmalar yüklenemedi'}</Text> : null}

        {status === 'ready' && !current ? (
          <View className="items-center gap-4 rounded-3xl border border-slate-700 bg-surface p-6">
            <Text className="text-lg font-semibold text-white">Bu moddaki sorular bitti</Text>
            <Text className="text-base text-muted">
              {score.correct} / {score.attempted} doğru
            </Text>
            <Button title="Yeni set" onPress={() => void loadExercises(level ?? undefined)} />
          </View>
        ) : null}

        {status === 'ready' && current?.type === 'WORD_ORDER' ? (
          <WordOrderExercise
            key={current.id}
            exercise={current}
            onResult={(correct) => recordResult('WORD_ORDER', correct)}
            onNext={() => advance('WORD_ORDER')}
          />
        ) : null}

        {status === 'ready' && current?.type === 'CLOZE' ? (
          <ClozeExercise
            key={current.id}
            exercise={current}
            onResult={(correct) => recordResult('CLOZE', correct)}
            onNext={() => advance('CLOZE')}
          />
        ) : null}

        {status === 'ready' && current?.type === 'TRANSLATION' ? (
          <TranslationLab
            key={current.id}
            exercise={current}
            analysis={lastAnalysis}
            isEvaluating={isEvaluating}
            onEvaluate={(sentence) => void evaluateTranslation(sentence, current.sourceTR)}
            onNext={() => advance('TRANSLATION')}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
