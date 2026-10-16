import { Text, View } from 'react-native';

import { ProgressBar } from '../ui/ProgressBar';

interface DailyGoalCardProps {
  cardsToday: number;
  goal: number;
  xpToday: number;
}

export function DailyGoalCard({ cardsToday, goal, xpToday }: DailyGoalCardProps) {
  const safeGoal = Math.max(1, goal);
  const ratio = cardsToday / safeGoal;
  const reached = cardsToday >= safeGoal;

  return (
    <View className="gap-3 rounded-2xl border border-slate-700 bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">
          Bugün: {cardsToday} / {goal} kart
        </Text>
        <Text className="text-sm font-semibold text-accent">+{xpToday} XP</Text>
      </View>
      <ProgressBar value={ratio} tone={reached ? 'success' : 'accent'} />
      <Text className="text-xs text-muted">{reached ? 'Günlük hedefe ulaştın, harika!' : 'Hedefe ulaşmak için devam et.'}</Text>
    </View>
  );
}
