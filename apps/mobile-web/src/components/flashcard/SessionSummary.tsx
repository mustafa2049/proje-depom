import { Text, View } from 'react-native';

import type { SessionStats } from '../../store/useStudyStore';
import { accuracyPercent, formatDuration } from '../../utils/format';
import { Button } from '../ui/Button';

interface SessionSummaryProps {
  stats: SessionStats;
  onDone: () => void;
}

export function SessionSummary({ stats, onDone }: SessionSummaryProps) {
  const durationMs = stats.startedAt !== null && stats.finishedAt !== null ? stats.finishedAt - stats.startedAt : 0;
  const accuracy = accuracyPercent(stats.correctCount, stats.reviewedCount);

  return (
    <View className="w-full max-w-md gap-5 self-center rounded-3xl border border-slate-700 bg-surface p-6">
      <Text className="text-center text-2xl font-bold text-white">Oturum tamamlandı</Text>

      <View className="flex-row flex-wrap gap-3">
        <Metric label="İncelenen" value={String(stats.reviewedCount)} />
        <Metric label="Doğruluk" value={`%${accuracy}`} />
        <Metric label="Kazanılan XP" value={`+${stats.xpEarned}`} />
        <Metric label="Süre" value={formatDuration(durationMs)} />
      </View>

      <Button title="Dashboard'a Dön" onPress={onDone} />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 gap-1 rounded-2xl bg-bg p-4">
      <Text className="text-xs uppercase tracking-wide text-muted">{label}</Text>
      <Text className="text-xl font-semibold text-white">{value}</Text>
    </View>
  );
}
