import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import type { PracticeExercise, SentenceAnalysis } from '../../types/api';

type Translation = Extract<PracticeExercise, { type: 'TRANSLATION' }>;

interface TranslationLabProps {
  exercise: Translation;
  analysis: SentenceAnalysis | null;
  isEvaluating: boolean;
  onEvaluate: (sentence: string) => void;
  onNext: () => void;
}

/** TR → EN çeviri: kullanıcı yazar, AI skor, düzeltme ve doğal alternatifleri gösterir. */
export function TranslationLab({ exercise, analysis, isEvaluating, onEvaluate, onNext }: TranslationLabProps) {
  const [text, setText] = useState('');

  return (
    <View className="gap-5">
      <View className="gap-2 rounded-2xl bg-surface p-5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Türkçe cümleyi İngilizceye çevir</Text>
        <Text className="text-xl leading-8 text-white">{exercise.sourceTR}</Text>
      </View>

      <TextInput
        accessibilityLabel="İngilizce çeviriniz"
        value={text}
        onChangeText={setText}
        placeholder="Your translation..."
        placeholderTextColor="#64748B"
        multiline
        editable={!analysis}
        className="min-h-[80px] rounded-xl border border-slate-700 bg-surface px-4 py-3 text-base text-white"
      />

      {!analysis ? (
        <Button
          title="Değerlendir"
          onPress={() => onEvaluate(text.trim())}
          disabled={!text.trim()}
          loading={isEvaluating}
        />
      ) : (
        <View className="gap-4 rounded-2xl border border-slate-700 bg-surface p-5">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">Doğruluk</Text>
              <Text className="text-base font-bold text-accent">{analysis.score}/100</Text>
            </View>
            <ProgressBar value={analysis.score / 100} tone={analysis.isCorrect ? 'success' : 'accent'} />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Düzeltilmiş cümle</Text>
            <Text className="text-base text-white">{analysis.correctedSentence}</Text>
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Doğal alternatif</Text>
            <Text className="text-base text-white">{analysis.nativeAlternative}</Text>
          </View>

          {analysis.grammarNotesTR.length > 0 ? (
            <View className="gap-1">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Gramer notları</Text>
              {analysis.grammarNotesTR.map((note) => (
                <Text key={note} className="text-sm text-slate-300">• {note}</Text>
              ))}
            </View>
          ) : null}

          <Text className="text-sm text-muted">Referans çeviri: {exercise.referenceEN}</Text>
          <Button title="Sonraki" onPress={onNext} />
        </View>
      )}

      {isEvaluating && !analysis ? <ActivityIndicator color="#38BDF8" /> : null}
    </View>
  );
}
