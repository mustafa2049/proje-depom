import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ComprehensionQuestion } from '../../types/api';

interface ComprehensionQuizProps {
  questions: ComprehensionQuestion[];
}

/** Metnin sonunda okuduğunu anlama soruları. Her seçim anında doğru/yanlış gösterir. */
export function ComprehensionQuiz({ questions }: ComprehensionQuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.answerIndex).length;

  return (
    <View className="gap-5 rounded-3xl border border-slate-700 bg-surface p-5">
      <Text className="text-lg font-semibold text-white">Okuduğunu anla</Text>

      {questions.map((question, index) => {
        const chosen = answers[question.id];
        return (
          <View key={question.id} className="gap-3">
            <Text className="text-base font-medium text-slate-100">
              {index + 1}. {question.question}
            </Text>
            {question.options.map((option, optionIndex) => {
              const isAnswer = optionIndex === question.answerIndex;
              const isChosen = optionIndex === chosen;
              const tone =
                chosen === undefined
                  ? 'border-slate-700'
                  : isAnswer
                    ? 'border-success bg-success/15'
                    : isChosen
                      ? 'border-danger bg-danger/15'
                      : 'border-slate-700 opacity-60';
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isChosen }}
                  disabled={chosen !== undefined}
                  onPress={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                  className={`rounded-xl border px-4 py-2.5 ${tone}`}
                >
                  <Text className="text-sm text-white">{option}</Text>
                </Pressable>
              );
            })}
            {chosen !== undefined ? (
              <Text className={`text-sm ${chosen === question.answerIndex ? 'text-success' : 'text-warning'}`}>
                {question.explanationTR}
              </Text>
            ) : null}
          </View>
        );
      })}

      {answeredCount === questions.length ? (
        <Text className="text-center text-base font-semibold text-accent">
          {questions.length} sorudan {correctCount} doğru
        </Text>
      ) : null}
    </View>
  );
}
