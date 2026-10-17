import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { DailyActivity, Intensity } from '../../types/api';
import { buildHeatmapGrid, formatDayDetail, formatDayLabel, intensityColor } from '../../utils/heatmap';

const LEGEND: Intensity[] = [0, 1, 2, 3, 4];
const CELL = 12;
const GAP = 3;

/** Son 90 günü haftalık sütunlar halinde gösteren etkinlik ızgarası. */
export function ActivityHeatmap({ days }: { days: DailyActivity[] }) {
  const grid = useMemo(() => buildHeatmapGrid(days), [days]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selected = days.find((day) => day.date === (selectedDate ?? days[days.length - 1]?.date));

  return (
    <View className="gap-4 rounded-2xl border border-slate-700 bg-surface p-4">
      <Text className="text-base font-semibold text-white" accessibilityRole="header">Çalışma ısı haritası</Text>

      <View className="flex-row">
        <View className="mr-2" style={{ gap: GAP, paddingTop: 0 }}>
          {['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'].map((label, index) => (
            <Text key={index} className="text-[9px] text-muted" style={{ height: CELL, lineHeight: CELL }}>
              {label}
            </Text>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row" style={{ gap: GAP }}>
            {grid.map((column, columnIndex) => (
              <View key={columnIndex} style={{ gap: GAP }}>
                {column.map((cell, rowIndex) =>
                  cell ? (
                    <Pressable
                      key={rowIndex}
                      testID="heatmap-cell"
                      accessibilityRole="button"
                      accessibilityLabel={`${formatDayLabel(cell.date)}: ${cell.cardsReviewed} kart`}
                      onPress={() => setSelectedDate(cell.date)}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        backgroundColor: intensityColor(cell.intensity),
                        borderWidth: selected?.date === cell.date ? 1.5 : 0,
                        borderColor: '#F8FAFC',
                      }}
                    />
                  ) : (
                    <View key={rowIndex} style={{ width: CELL, height: CELL }} />
                  ),
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Text className="min-h-[20px] text-sm text-slate-200" accessibilityLiveRegion="polite">
        {selected ? formatDayDetail(selected) : 'Bir güne dokunarak ayrıntıyı gör'}
      </Text>

      <View className="flex-row items-center gap-2">
        <Text className="text-xs text-muted">Az</Text>
        {LEGEND.map((level) => (
          <View key={level} style={{ width: CELL, height: CELL, borderRadius: 3, backgroundColor: intensityColor(level) }} />
        ))}
        <Text className="text-xs text-muted">Çok</Text>
      </View>
    </View>
  );
}
