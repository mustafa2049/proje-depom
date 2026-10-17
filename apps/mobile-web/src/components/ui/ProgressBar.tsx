import { View } from 'react-native';

interface ProgressBarProps {
  /** 0 ile 1 arası oran. Dışarıdaki değerler sınırlandırılır. */
  value: number;
  tone?: 'accent' | 'success';
}

export function ProgressBar({ value, tone = 'accent' }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const fill = tone === 'success' ? 'bg-success' : 'bg-accent';

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      className="h-2 w-full overflow-hidden rounded-full bg-surface"
    >
      <View className={`h-2 rounded-full ${fill}`} style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}
