import { Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';

import type { StatsOverview } from '../../types/api';
import { percentLabel, srsSegments } from '../../utils/heatmap';

/** Özet kutular (XP, seri, tutma oranı, öğrenilen kart), SRS dağılımı ve son 7 gün özeti. */
export function SRSBreakdownCard({ stats }: { stats: StatsOverview }) {
  const segments = srsSegments(stats.srsBreakdown);

  return (
    <View className="gap-5 rounded-2xl border border-slate-700 bg-surface p-4">
      <View className="flex-row flex-wrap gap-3">
        <Tile label="Toplam XP" value={String(stats.totalXp)} />
        <Tile label="Günlük seri" value={String(stats.streakCount)} icon={<Flame size={16} color="#F59E0B" />} />
        <Tile label="30 gün tutma" value={percentLabel(stats.retentionRate)} />
        <Tile label="Öğrenilen kart" value={String(stats.learnedCards)} />
      </View>

      <View className="gap-3">
        <Text className="text-base font-semibold text-white">Bellek dağılımı</Text>
        <View className="h-4 w-full flex-row overflow-hidden rounded-full bg-bg" accessibilityLabel="SRS dağılımı">
          {segments.map((segment) =>
            segment.ratio > 0 ? (
              <View key={segment.key} testID={`srs-segment-${segment.key}`} style={{ width: `${segment.ratio * 100}%`, backgroundColor: segment.color }} />
            ) : null,
          )}
        </View>
        <View className="gap-2">
          {segments.map((segment) => (
            <View key={segment.key} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: segment.color }} />
                <Text className="text-sm text-slate-200">{segment.label}</Text>
              </View>
              <Text className="text-sm font-semibold text-white">{segment.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="text-sm text-muted">
        Son 7 gün: {percentLabel(stats.weeklyTrend.accuracyPercent)} doğruluk • +{stats.weeklyTrend.totalXp} XP
      </Text>
    </View>
  );
}

function Tile({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View className="min-w-[45%] flex-1 gap-1 rounded-2xl bg-bg p-4">
      <Text className="text-xs uppercase tracking-wide text-muted">{label}</Text>
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-xl font-semibold text-white">{value}</Text>
      </View>
    </View>
  );
}
